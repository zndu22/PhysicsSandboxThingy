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

floorBody.collisionFilterGroup = 1;
floorBody.collisionFilterMask = -1;

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

//TODO: put all this into a player class.
const head = new PhysicsObject({
  world: world, scene: scene, objects: objects,
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)), 
  geometry: new THREE.BoxGeometry(1, 1, 1), 
  material: studMaterial, 
  position: {x: 0, y:7, z:0}
});

const bodybody = new PhysicsObject({
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

var localPivotA = new CANNON.Vec3(0, -0.51, 0); //bodyA
var axisA = new CANNON.Vec3(0, 1, 0);
var localPivotB = new CANNON.Vec3(0, 1.01, 0); //bodyB
var axisB = new CANNON.Vec3(0, 1, 0);
var headConstraint = new CANNON.HingeConstraint(
    head.body,
    bodybody.body,
    { 
      pivotA: localPivotA, 
      axisA: axisA, 
      pivotB: localPivotB, 
      axisB: axisB,
    }
);

var localPivotA = new CANNON.Vec3(0, 0.5, 0);
var axisA = new CANNON.Vec3(1, 0, 0);
var localPivotB = new CANNON.Vec3(1.51, 0.5, 0);
var axisB = new CANNON.Vec3(1, 0, 0);
var arm1Constraint = new CANNON.HingeConstraint(
    arm1.body,
    bodybody.body,
    { 
      pivotA: localPivotA, 
      axisA: axisA, 
      pivotB: localPivotB, 
      axisB: axisB,
      collideConnected: true
    }
);

var localPivotA = new CANNON.Vec3(0, 0.5, 0); // bottom of bodyA
var localPivotB = new CANNON.Vec3(-1.51, 0.5, 0); // top of bodyB
var arm2Constraint = new CANNON.HingeConstraint(
    arm2.body,
    bodybody.body,
    { 
      pivotA: localPivotA, 
      axisA: axisA, 
      pivotB: localPivotB, 
      axisB: axisB,
      collideConnected: true
    }
);

var localPivotA = new CANNON.Vec3(0, 1, 0);
var localPivotB = new CANNON.Vec3(0.51, -1, 0);
var leg1Constraint = new CANNON.HingeConstraint(
    leg1.body,
    bodybody.body,
    { 
      pivotA: localPivotA, 
      axisA: axisA, 
      pivotB: localPivotB, 
      axisB: axisB,
      collideConnected: true
    }
);

var localPivotA = new CANNON.Vec3(0, 1, 0); // bottom of bodyA
var localPivotB = new CANNON.Vec3(-0.51, -1, 0); // top of bodyB
var leg2Constraint = new CANNON.HingeConstraint(
    leg2.body,
    bodybody.body,
    { 
      pivotA: localPivotA, 
      axisA: axisA, 
      pivotB: localPivotB, 
      axisB: axisB,
      collideConnected: true
    }
);

world.addConstraint(headConstraint);
world.addConstraint(arm1Constraint);
world.addConstraint(arm2Constraint);
world.addConstraint(leg1Constraint);
world.addConstraint(leg2Constraint);

// I don't know if this acutally does anything
objects.forEach(function(currentValue, index, arr) {
    currentValue.body.updateMassProperties();
});

let t = 0;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let draggedBody = null;
let dragConstraint = null;
let mouseBody = null;
let dragDistance = 0;

let bodyRotation =  new CANNON.Vec3(0, 0, 0);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  objects.forEach(function(currentValue, index, arr) {
    currentValue.syncPosition();
  });

  bodybody.body.angularFactor.set(0, 1  , 0);
  head.body.angularFactor.set(0, 1, 0);

  //TODO: implement orbit camera controls
  //TODO: and player movement, but in the player class, when I make it.
  camera.position.x = head.position.x + Math.sin(t * 0.003) * 10;
  camera.position.z = head.position.z + Math.cos(t * 0.003) * 10;
  camera.lookAt(head.position.x, head.position.y, head.position.z);
  t++;

  world.step(1/60);
  renderer.render(scene, camera);
} animate();

function updateMouse(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("mousedown", (e) => {
    updateMouse(e);
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    if (hits.length === 0) return;

    const hit = hits[0];
    const mesh = hit.object;
    const body = mesh.userData.physicsObject.body;
    if (!body) return;

    draggedBody = body;
    dragDistance = hit.distance;

    // Kinematic mouse body
    mouseBody = new CANNON.Body({
        mass: 0,
        type: CANNON.Body.KINEMATIC
    });
    mouseBody.position.copy(hit.point);
    world.addBody(mouseBody);

    const localPivot = body.pointToLocalFrame(
        new CANNON.Vec3(
            hit.point.x,
            hit.point.y,
            hit.point.z
        )
    );

    dragConstraint = new CANNON.PointToPointConstraint(
        body,
        localPivot,
        mouseBody,
        new CANNON.Vec3(0, 0, 0)
    );

    world.addConstraint(dragConstraint);
});

window.addEventListener("mousemove", (e) => {
    if (!mouseBody) return;

    updateMouse(e);
    raycaster.setFromCamera(mouse, camera);

    const target = new THREE.Vector3();
    raycaster.ray.at(dragDistance, target);

    mouseBody.position.set(target.x, target.y, target.z);
});

window.addEventListener("mouseup", () => {
    if (!dragConstraint) return;

    world.removeConstraint(dragConstraint);
    world.removeBody(mouseBody);

    dragConstraint = null;
    mouseBody = null;
    draggedBody = null;
});


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});