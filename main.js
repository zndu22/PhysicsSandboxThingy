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
world.solver.iterations = 10;
world.allowSleep = true;

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

const floorTexture = textureLoader.load("./assets/stud.png");
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

const studTopTexture = textureLoader.load("./assets/studTop.png");
const studBottomTexture = textureLoader.load("./assets/studBottom.png");
const studSideTexture = textureLoader.load("./assets/studSide.png");

const color = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');

const studBrickMaterial = [
    new THREE.MeshBasicMaterial({ map: studSideTexture, color: color }), // Right
    new THREE.MeshBasicMaterial({ map: studSideTexture, color: color }), // Left
    new THREE.MeshBasicMaterial({ map: studTopTexture, color: color }), // Top
    new THREE.MeshBasicMaterial({ map: studBottomTexture, color: color }), // Bottom
    new THREE.MeshBasicMaterial({ map: studSideTexture, color: color }), // Front
    new THREE.MeshBasicMaterial({ map: studSideTexture, color: color })  // Back
];

let objects = [];

const head = new PhysicsObject({
  world: world, scene: scene, objects: objects,
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)), 
  geometry: new THREE.BoxGeometry(1, 1, 1), 
  material: studMaterial, 
  position: {x: 0, y:7, z:0}
});

const body = new PhysicsObject({
  world: world, scene: scene, objects: objects,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 0.5)),
  geometry: new THREE.BoxGeometry(2, 2, 1),
  material: studMaterial,
  position: {x: 0, y: 5, z: 0}
});

const arm1 = new PhysicsObject({
  world: world, scene: scene, objects: objects,
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
  geometry: new THREE.BoxGeometry(1, 2, 1),
  material: studMaterial,
  position: {x: 1.6, y: 5, z: 0}
});

const arm2 = new PhysicsObject({
  world: world, scene: scene, objects: objects,
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
  geometry: new THREE.BoxGeometry(1, 2, 1),
  material: studMaterial,
  position: {x: -1.6, y: 5, z: 0}
});

const leg1 = new PhysicsObject({
  world: world, scene: scene, objects: objects,
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
  geometry: new THREE.BoxGeometry(1, 2, 1),
  material: studMaterial,
  position: {x: 0.5, y: 3, z: 0}
});

const leg2 = new PhysicsObject({
  world: world, scene: scene, objects: objects,
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
  geometry: new THREE.BoxGeometry(1, 2, 1),
  material: studMaterial,
  position: {x: -0.5, y: 3, z: 0}
});

var localPivotA = new CANNON.Vec3(0, -0.51, 0); // bottom of bodyA
var localPivotB = new CANNON.Vec3(0, 1.01, 0); // top of bodyB
var headConstraint = new CANNON.PointToPointConstraint(
    head.body, localPivotA,
    body.body, localPivotB,
    {collideConnected: false}
);

var localPivotA = new CANNON.Vec3(-0.51, 0.5, 0);
var localPivotB = new CANNON.Vec3(1.01, 0.5, 0);
var arm1Constraint = new CANNON.PointToPointConstraint(
    arm1.body, localPivotA,
    body.body, localPivotB,
    {collideConnected: false}
);

var localPivotA = new CANNON.Vec3(0.51, 0.5, 0); // bottom of bodyA
var localPivotB = new CANNON.Vec3(-1.01, 0.5, 0); // top of bodyB
var arm2Constraint = new CANNON.PointToPointConstraint(
    arm2.body, localPivotA,
    body.body, localPivotB,
    {collideConnected: false}
);

var localPivotA = new CANNON.Vec3(0, 1, 0);
var localPivotB = new CANNON.Vec3(0.5, -1.01, 0);
var leg1Constraint = new CANNON.PointToPointConstraint(
    leg1.body, localPivotA,
    body.body, localPivotB,
    {collideConnected: false}
);

var localPivotA = new CANNON.Vec3(0, 1, 0); // bottom of bodyA
var localPivotB = new CANNON.Vec3(-0.5, -1.01, 0); // top of bodyB
var leg2Constraint = new CANNON.PointToPointConstraint(
    leg2.body, localPivotA,
    body.body, localPivotB,
    {collideConnected: false}
);

world.addConstraint(headConstraint);
world.addConstraint(arm1Constraint);
world.addConstraint(arm2Constraint);
world.addConstraint(leg1Constraint);
world.addConstraint(leg2Constraint);


let t = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  objects.forEach(function(currentValue, index, arr) {
    currentValue.syncPosition();
  });

  camera.position.x = head.position.x + Math.sin(t * 0.003) * 10;
  camera.position.z = head.position.z + Math.cos(t * 0.003) * 10;
  camera.lookAt(head.position.x, head.position.y, head.position.z);
  t++;

  world.step(1/60);
  renderer.render(scene, camera);
} animate();

window.addEventListener('click', () => {
  head.body.velocity.set(Math.random()*20-10, 20, Math.random()*20-10);
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});