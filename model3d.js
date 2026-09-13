// Keep the portrait until a complete model has rendered successfully.
const host = document.getElementById('stage-model-3d');
const stage = document.getElementById('stage-pet');
const lab = document.getElementById('scene-lab');
if (host && stage && lab) {
  const status = document.createElement('span');
  status.className = 'stage__3d-hint';
  status.setAttribute('role', 'status');
  status.textContent = '正在准备 3D 角色…';
  host.appendChild(status);
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'stage__3d-retry';
  retry.textContent = '重试 3D';
  retry.hidden = true;
  let retryModel;
  retry.addEventListener('click', () => retryModel ? retryModel() : location.reload());
  host.appendChild(retry);
  const fallback = (error) => {
    stage.classList.remove('is-model-ready');
    host.classList.remove('is-ready');
    host.dataset.state = 'fallback';
    retry.hidden = false;
    status.textContent = '已显示角色立绘 · 3D 暂时不可用';
    console.warn('Pet 3D unavailable:', error);
  };
  // Dynamic imports catch dependency/network failure; no CDN is required.
  Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/controls/OrbitControls.js'),
    import('three/addons/loaders/DRACOLoader.js')
  ]).then(([THREE, { GLTFLoader }, { OrbitControls }, { DRACOLoader }]) => {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    const controlHint = '拖动旋转，滚轮或双指缩放；方向键旋转，加减号缩放，Home 键复位。';
    canvas.setAttribute('aria-label', '宠物三维角色。' + controlHint);
    host.prepend(canvas);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xeaf1ff, 0x5b507a, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x91b9ff, 1.8);
    rim.position.set(-3, 3, -4);
    scene.add(rim);
    const backFill = new THREE.DirectionalLight(0xeaf1ff, 1.4);
    backFill.position.set(2, 3, -6);
    scene.add(backFill);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = 0.04;
    controls.maxPolarAngle = Math.PI - 0.04;
    controls.autoRotate = false;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    controls.enableDamping = !motion.matches;
    const pivot = new THREE.Group();
    scene.add(pivot);
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const touches = new Map();
    let model, mixer, idle, reaction;
    let selectedId = '', selection = 0, contextLost = false;
    const assets = {
      doubao: 'pets/doubao.glb?v=20260913-all-pets-v2',
      deepseek: 'pets/deepseek.glb?v=20260913-all-pets-v2',
      workbuddy: 'pets/workbuddy.glb?v=20260913-all-pets-v2',
      codex: 'pets/codex.glb?v=20260913-all-pets-v2',
      yuanbao: 'pets/yuanbao.glb?v=20260913-all-pets-v2'
    };
    // One renderer; at most five lazily loaded assets, shared across switches.
    const loaded = new Map();
    let frame = 0, previousTime = 0, radius = 1, fitDistance = 6;
    const modelSize = new THREE.Vector3(3.2, 3.2, 3.2);
    let failed = false, inViewport = true, reacting = false, hasFit = false;
    let moved = false, multiTouch = false, clickTimer = 0;
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'stage__3d-reset';
    reset.textContent = '复位视角';
    reset.addEventListener('click', resetView);
    host.appendChild(reset);

    function active() {
      return !failed && !contextLost && model && !document.hidden && !lab.hidden &&
        stage.classList.contains('stage__pet--3d') && inViewport;
    }
    function requestFrame() {
      if (!frame && active()) frame = requestAnimationFrame(render);
    }
    function fit(resetCamera = false) {
      const box = host.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) return false;
      renderer.setSize(box.width, box.height, false);
      camera.aspect = box.width / box.height;
      const halfVertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const halfHorizontal = Math.atan(Math.tan(halfVertical) * camera.aspect);
      const previousFit = fitDistance;
      fitDistance = (Math.max(modelSize.y / (2 * Math.tan(halfVertical)),
        modelSize.x / (2 * Math.tan(halfHorizontal))) + modelSize.z / 2) * 1.14;
      controls.minDistance = radius * 1.35;
      controls.maxDistance = fitDistance * 2.5;
      camera.near = radius * 0.015;
      camera.far = fitDistance * 8;
      camera.updateProjectionMatrix();
      if (resetCamera || !hasFit) {
        controls.target.set(0, 0, 0);
        camera.position.set(0, 0, fitDistance);
        hasFit = true;
      } else {
        const offset = camera.position.clone().sub(controls.target);
        camera.position.copy(controls.target).add(offset.multiplyScalar(fitDistance / previousFit));
      }
      controls.update();
      requestFrame();
      return true;
    }
    function resetView() {
      clearTimeout(clickTimer);
      // Flush residual drag momentum before choosing the front view.
      const damping = controls.enableDamping;
      controls.enableDamping = false;
      controls.update();
      fit(true);
      controls.enableDamping = damping;
    }
    function render(time) {
      frame = 0;
      if (!active()) { previousTime = 0; return; }
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      try {
        if (mixer && (!motion.matches || reacting)) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
        // First successful render is the only gate hiding the portrait.
        if (!stage.classList.contains('is-model-ready')) {
          host.dataset.state = 'ready';
          retry.hidden = true;
          host.classList.add('is-ready');
          stage.classList.add('is-model-ready');
          status.textContent = '拖动旋转 · 滚轮/双指缩放 · 点击互动';
        }
      } catch (error) { fail(error); return; }
      if (!motion.matches || reacting) requestFrame();
    }
    function fail(error) {
      failed = true;
      cancelAnimationFrame(frame);
      frame = 0;
      fallback(error);
    }
    function visibilityChanged() {
      if (!active()) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        touches.clear();
        moved = true;
        clearTimeout(clickTimer);
      } else { fit(); requestFrame(); }
    }
    function playReaction(event) {
      if (!active() || !reaction || (motion.matches && !event.detail?.userInitiated)) return;
      reacting = true;
      host.dataset.action = 'React';
      reaction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.12).play();
      if (idle) idle.fadeOut(0.12);
      requestFrame();
    }
    stage.addEventListener('pet-model-react', playReaction);
    controls.addEventListener('change', requestFrame);
    controls.addEventListener('start', () => host.classList.add('is-dragging'));
    controls.addEventListener('end', () => { host.classList.remove('is-dragging'); requestFrame(); });
    new ResizeObserver(() => fit()).observe(host);
    new MutationObserver(visibilityChanged).observe(stage, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(() => {
      if (!lab.hidden) selectModel();
      visibilityChanged();
    }).observe(lab, { attributes: true, attributeFilter: ['hidden'] });
    new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      visibilityChanged();
    }).observe(host);
    document.addEventListener('visibilitychange', visibilityChanged);
    motion.addEventListener('change', () => {
      controls.enableDamping = !motion.matches;
      if (idle) idle.paused = motion.matches;
      requestFrame();
    });
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      contextLost = true;
      fail('WebGL context lost');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      contextLost = false;
      failed = !model;
      previousTime = 0;
      if (model) visibilityChanged();
      else selectModel();
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (!touches.size) { moved = false; multiTouch = false; }
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY, time: performance.now() });
      if (touches.size > 1) { multiTouch = true; clearTimeout(clickTimer); }
    });
    canvas.addEventListener('pointermove', (event) => {
      const start = touches.get(event.pointerId);
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) moved = true;
    });
    canvas.addEventListener('pointercancel', (event) => {
      touches.delete(event.pointerId);
      moved = true;
      clearTimeout(clickTimer);
    });
    canvas.addEventListener('lostpointercapture', (event) => {
      if (!touches.has(event.pointerId)) return;
      touches.delete(event.pointerId);
      moved = true;
      clearTimeout(clickTimer);
    });
    canvas.addEventListener('pointerup', (event) => {
      const start = touches.get(event.pointerId);
      touches.delete(event.pointerId);
      if (!start || moved || multiTouch || performance.now() - start.time > 500 || !model) return;
      const box = canvas.getBoundingClientRect();
      pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      if (!raycaster.intersectObject(model, true).length) return;
      clearTimeout(clickTimer);
      // Separate a single-click reaction from a double-click reset.
      clickTimer = setTimeout(() => {
        if (active()) stage.dispatchEvent(new CustomEvent('pet-model-poke'));
      }, 260);
    });
    canvas.addEventListener('dblclick', (event) => { event.preventDefault(); resetView(); });
    canvas.addEventListener('keydown', (event) => {
      const angle = Math.PI / 12;
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (event.key === 'Home') resetView();
      else if (event.key === 'Enter' || event.key === ' ') stage.dispatchEvent(new CustomEvent('pet-model-poke'));
      else {
        if (event.key === 'ArrowLeft') spherical.theta -= angle;
        else if (event.key === 'ArrowRight') spherical.theta += angle;
        else if (event.key === 'ArrowUp') spherical.phi -= angle;
        else if (event.key === 'ArrowDown') spherical.phi += angle;
        else if (event.key === '+' || event.key === '=') spherical.radius *= 0.9;
        else if (event.key === '-') spherical.radius *= 1.1;
        else return;
        spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
        spherical.radius = THREE.MathUtils.clamp(spherical.radius, controls.minDistance, controls.maxDistance);
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
        controls.update();
        requestFrame();
      }
      event.preventDefault();
    });

    const draco = new DRACOLoader();
    draco.setDecoderPath(new URL('./vendor/three/draco/', import.meta.url).href);
    draco.setWorkerLimit(2);
    const loader = new GLTFLoader().setDRACOLoader(draco);
    function fetchModel(id) {
      if (!loaded.has(id)) {
        const controller = new AbortController();
        const deadline = setTimeout(() => controller.abort(), 30000);
        // Fetch with a real deadline: FileLoader deduplicates hanging URLs,
        // so evicting only our Promise cache cannot retry a stalled download.
        const pending = fetch(assets[id], { signal: controller.signal })
          .then((response) => {
            if (!response.ok) throw new Error('Model HTTP ' + response.status);
            return response.arrayBuffer();
          })
          .then((buffer) => loader.parseAsync(buffer, new URL('./pets/', import.meta.url).href))
          .catch((error) => {
            // A late rejection cannot evict a newer retry for this same pet.
            if (loaded.get(id) === pending) loaded.delete(id);
            throw error;
          }).finally(() => clearTimeout(deadline));
        loaded.set(id, pending);
      }
      return loaded.get(id);
    }
    function clearModel() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      clearTimeout(clickTimer);
      touches.clear();
      moved = true;
      reacting = false;
      if (mixer) {
        mixer.stopAllAction();
        mixer.uncacheRoot(model);
      }
      if (model) pivot.remove(model);
      model = mixer = idle = reaction = undefined;
      pivot.position.set(0, 0, 0);
      pivot.scale.setScalar(1);
      pivot.updateMatrixWorld(true);
      stage.classList.remove('is-model-ready');
      host.classList.remove('is-ready', 'is-dragging');
      host.dataset.animations = '';
      host.dataset.action = '';
      hasFit = false;
    }
    async function selectModel() {
      const id = stage.dataset.modelId;
      if (lab.hidden) return; // Homepage cards do not download the 3D assets.
      if (!Object.hasOwn(assets, id)) return;
      if (id === selectedId && !failed) return;
      const ticket = ++selection;
      selectedId = id;
      clearModel();
      failed = false;
      host.dataset.pet = id;
      host.dataset.state = 'loading';
      retry.hidden = true;
      const name = stage.dataset.modelName || '宠物';
      host.setAttribute('aria-label', '可互动的' + name + '三维模型');
      canvas.setAttribute('aria-label', name + '三维角色。' + controlHint);
      status.textContent = '正在准备' + name + '的 3D 模型…';
      let timeout;
      const pending = fetchModel(id);
      try {
        const gltf = await Promise.race([
          pending,
          new Promise((_, reject) => {
            timeout = setTimeout(() => {
              if (loaded.get(id) === pending) loaded.delete(id);
              reject(new Error('Model loading timed out'));
            }, 30000);
          })
        ]);
        // A slow previous download must never replace the newly selected pet.
        if (ticket !== selection) return;
        model = gltf.scene;
        pivot.add(model);
        const originalBounds = new THREE.Box3().setFromObject(pivot);
        const height = originalBounds.getSize(new THREE.Vector3()).y;
        if (!Number.isFinite(height) || height <= 0) throw new Error('Invalid model bounds');
        pivot.scale.setScalar(3.2 / height);
        pivot.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(pivot);
        bounds.getSize(modelSize);
        pivot.position.sub(bounds.getCenter(new THREE.Vector3()));
        pivot.updateMatrixWorld(true);
        radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
        const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
        const reactClip = THREE.AnimationClip.findByName(gltf.animations, 'React');
        if (!idleClip || !reactClip) throw new Error('Model is missing Idle or React animation');
        mixer = new THREE.AnimationMixer(model);
        idle = mixer.clipAction(idleClip);
        idle.play();
        idle.paused = motion.matches;
        reaction = mixer.clipAction(reactClip);
        reaction.setLoop(THREE.LoopOnce, 1);
        reaction.clampWhenFinished = true;
        const currentMixer = mixer;
        mixer.addEventListener('finished', (event) => {
          if (ticket !== selection || event.action !== reaction) return;
          reacting = false;
          host.dataset.action = 'Idle';
          reaction.fadeOut(0.2);
          idle.reset().setEffectiveWeight(1).fadeIn(0.2).play();
          idle.paused = motion.matches;
          if (motion.matches) {
            reaction.stop();
            idle.stopFading().setEffectiveWeight(1);
            queueMicrotask(() => {
              if (ticket === selection) { currentMixer.update(0); requestFrame(); }
            });
          }
        });
        host.dataset.animations = gltf.animations.map((clip) => clip.name).join(',');
        host.dataset.action = 'Idle';
        resetView();
        visibilityChanged();
      } catch (error) {
        if (ticket === selection) {
          if (loaded.get(id) === pending) loaded.delete(id);
          fail(error);
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    stage.addEventListener('pet-model-select', selectModel);
    retryModel = selectModel;
    selectModel(); // Handles game.js selecting a pet before module imports finish.
  }).catch(fallback);
}
