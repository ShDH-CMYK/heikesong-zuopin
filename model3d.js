import * as THREE from 'https://unpkg.com/three@0.180.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const host = document.getElementById('stage-model-3d');
const stagePet = document.getElementById('stage-pet');
let syncing = false;
function showPortrait() {
  if (stagePet) stagePet.classList.remove('stage__pet--3d');
}
function showModel() {
  if (syncing) return;
  syncing = true;
  try {
    if (!host.classList.contains('is-ready') || host.classList.contains('is-fallback')) {
      showPortrait();
      return;
    }
    if (stagePet && stagePet.classList.contains('has-3d-model')) {
      if (!stagePet.classList.contains('stage__pet--3d')) stagePet.classList.add('stage__pet--3d');
    } else {
      showPortrait();
    }
  } finally {
    syncing = false;
  }
}
if (host) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xdceaff, 0x342a67, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(3, 6, 5);
  scene.add(key);

  const root = new THREE.Group();
  scene.add(root);
  let model = null;
  let targetRotation = 0;
  let currentRotation = Math.PI;
  let targetZoom = 7.5;
  let currentZoom = 7.5;
  let pressed = false;
  let moved = false;
  let lastX = 0;
  let downAt = 0;
  let pinchDistance = 0;
  const pointers = new Map();

  const hint = document.createElement('span');
  hint.className = 'stage__3d-hint';
  hint.textContent = '拖动旋转 · 滚轮/双指缩放 · 双击复位';
  host.appendChild(hint);

  function resize() {
    const box = host.getBoundingClientRect();
    const width = Math.max(1, box.width);
    const height = Math.max(1, box.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  function setZoom(value) {
    targetZoom = Math.max(5.2, Math.min(12, value));
  }
  function pointerDistance() {
    const values = Array.from(pointers.values());
    if (values.length < 2) return 0;
    return Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
  }
  function resetView() {
    targetRotation = Math.PI;
    setZoom(7.5);
    root.scale.set(1, 1, 1);
    host.classList.remove('is-pulsing');
  }

  host.addEventListener('pointerdown', function (event) {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    host.setPointerCapture(event.pointerId);
    if (pointers.size === 1) {
      pressed = true;
      moved = false;
      lastX = event.clientX;
      downAt = performance.now();
      host.classList.add('is-dragging');
    } else if (pointers.size === 2) {
      pinchDistance = pointerDistance();
    }
  });
  host.addEventListener('pointermove', function (event) {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2) {
      const distance = pointerDistance();
      if (pinchDistance && distance) setZoom(targetZoom - (distance - pinchDistance) * 0.018);
      pinchDistance = distance;
      return;
    }
    if (!pressed) return;
    const delta = event.clientX - lastX;
    if (Math.abs(delta) > 1) moved = true;
    targetRotation += delta * 0.012;
    lastX = event.clientX;
  });
  function releasePointer(event) {
    pointers.delete(event.pointerId);
    if (!pointers.size) {
      if (pressed && !moved && performance.now() - downAt < 280) {
        host.classList.remove('is-pulsing');
        void host.offsetWidth;
        host.classList.add('is-pulsing');
        targetRotation += Math.PI * 2;
      }
      pressed = false;
      host.classList.remove('is-dragging');
    }
    if (pointers.size < 2) pinchDistance = 0;
  }
  host.addEventListener('pointerup', releasePointer);
  host.addEventListener('pointercancel', releasePointer);
  host.addEventListener('wheel', function (event) {
    event.preventDefault();
    setZoom(targetZoom + event.deltaY * 0.006);
  }, { passive: false });
  host.addEventListener('dblclick', resetView);

  new GLTFLoader().load(
    'pets/deepseek-lowpoly.glb',
    function (gltf) {
      model = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const fit = 3.8 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(fit);
      root.add(model);
      camera.position.set(0, 0, targetZoom);
      camera.lookAt(0, 0, 0);
      host.classList.remove('is-fallback');
      host.classList.add('is-ready');
      showModel();
      if (stagePet) {
        var lastHas = stagePet.classList.contains('has-3d-model');
        new MutationObserver(function () {
          var nowHas = stagePet.classList.contains('has-3d-model');
          if (nowHas === lastHas) return;
          lastHas = nowHas;
          showModel();
        }).observe(stagePet, { attributes: true, attributeFilter: ['class'] });
      }
    },
    undefined,
    function () {
      host.classList.remove('is-ready');
      host.classList.add('is-fallback');
      showPortrait();
      hint.textContent = '3D 模型加载失败，已显示角色立绘';
    }
  );

  function render() {
    requestAnimationFrame(render);
    if (!host.classList.contains('is-ready') || host.classList.contains('is-fallback')) return;
    if (!stagePet || !stagePet.classList.contains('stage__pet--3d')) return;
    if (!pressed) targetRotation += 0.0018;
    currentRotation += (targetRotation - currentRotation) * 0.12;
    currentZoom += (targetZoom - currentZoom) * 0.12;
    root.rotation.y = currentRotation;
    camera.position.z = currentZoom;
    renderer.render(scene, camera);
  }
  render();
}
