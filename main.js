import * as THREE from 'three';
import * as CANNON from 'cannon';

console.log(CANNON);
console.log(CANNON?.Vec3);

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

const floorTexture = textureLoader.load("./assets/stud.png");;
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1000, 1000);

// Create a simple cube
const geometry = new THREE.BoxGeometry(1000, 1, 1000);
const material = new THREE.MeshBasicMaterial({ map: floorTexture, color: 0x00FF00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.y = -1;

const floorShape = new CANNON.Box(new CANNON.Vec3(500, 0.5, 500));
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
});
floorBody.position.set(0, -1, 0);
world.addBody(floorBody);

camera.position.y = 10;

let t = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  camera.position.x = Math.sin(t * 0.003) * 50;
  camera.position.z = Math.cos(t * 0.003) * 50;
  camera.lookAt(0, 0, 0);
  t++;

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});