import * as THREE from 'three';
import * as CANNON from 'cannon';
import { PhysicsObject } from './PhysicsObject.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});

// jank knobs (important)
world.solver.iterations = 5;
world.allowSleep = false;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();

textureLoader.load(
    "./assets/skybox/Panorama_Sky_05-512x512.png",
    texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
    }
);

const studTexture = textureLoader.load("./assets/stud.png");
const studMaterial = new THREE.MeshBasicMaterial({map: studTexture});

const floorTexture = textureLoader.load("./assets/stud.png");;
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1000, 1000);

// Create a simple cube
const geometry = new THREE.BoxGeometry(1000, 1, 1000);
const material = new THREE.MeshBasicMaterial({ map: floorTexture, color: 0x00FF00 });
const floor = new THREE.Mesh(geometry, material);
scene.add(floor);
floor.position.y = -1;

const floorShape = new CANNON.Box(new CANNON.Vec3(500, 0.5, 500));
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
});
floorBody.position.set(0, -1, 0);
world.addBody(floorBody);

camera.position.y = 10;

const cube = new PhysicsObject({
  world: world, 
  scene: scene,  
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)), 
  geometry: new THREE.BoxGeometry(1, 1, 1), 
  material: studMaterial, 
  position: {x: 0, y:5, z:0}});

const cube1 = new PhysicsObject({
  world: world,
  scene: scene,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 0.5)),
  geometry: new THREE.BoxGeometry(2, 2, 1),
  material: studMaterial,
  position: {x: 0, y: 7, z: 0}
});

var localPivotA = new CANNON.Vec3(0, -0.5, 0); // bottom of bodyA
var localPivotB = new CANNON.Vec3(0, 1, 0); // top of bodyB

var constraint = new CANNON.PointToPointConstraint(
    cube.body, localPivotA,
    cube1.body, localPivotB,
    { collideConnected: false }
);

world.addConstraint(constraint);

let t = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  cube.syncPosition();
  cube1.syncPosition();

  camera.position.x = Math.sin(t * 0.003) * 10;
  camera.position.z = Math.cos(t * 0.003) * 10;
  camera.lookAt(0, 0, 0);
  t++;

  world.step(1/60);
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});