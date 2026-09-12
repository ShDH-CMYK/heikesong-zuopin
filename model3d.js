import * as THREE from 'https://unpkg.com/three@0.180.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
const host=document.getElementById('stage-model-3d');
if(host){
 const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(30,1,.1,100), renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
 host.appendChild(renderer.domElement); scene.add(new THREE.HemisphereLight(0xdceaff,0x342a67,2)); const light=new THREE.DirectionalLight(0xffffff,3); light.position.set(3,6,5); scene.add(light);
 const root=new THREE.Group(); scene.add(root); let target=Math.PI,drag=false,lastX=0; root.rotation.y=Math.PI;
 const loader=new GLTFLoader(); loader.load('pets/deepseek-lowpoly.glb',g=>{const model=g.scene; const box=new THREE.Box3().setFromObject(model); const size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3()); model.position.sub(center); const fit=3.8/Math.max(size.x,size.y,size.z); model.scale.setScalar(fit); root.add(model); camera.position.set(0,0,Math.max(6, size.z*fit*2.2)); camera.lookAt(0,0,0);},undefined,()=>{host.classList.add('is-fallback');});
 function resize(){const q=host.getBoundingClientRect(),w=Math.max(1,q.width),h=Math.max(1,q.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()} new ResizeObserver(resize).observe(host); resize();
 host.onpointerdown=e=>{drag=true;lastX=e.clientX;host.setPointerCapture(e.pointerId)};host.onpointermove=e=>{if(drag){target+=(e.clientX-lastX)*.012;lastX=e.clientX}};host.onpointerup=()=>drag=false;host.onpointercancel=()=>drag=false;
 function loop(){requestAnimationFrame(loop);if(!drag)target+=.0018;root.rotation.y+=(target-root.rotation.y)*.12;renderer.render(scene,camera)} loop();
}


