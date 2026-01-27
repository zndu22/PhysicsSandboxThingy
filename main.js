import * as THREE from 'three';
import * as CANNON from 'cannon';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

camera.position.z = 10;

const textureLoader = new THREE.TextureLoader();

textureLoader.load(
    "./assets/skybox/Panorama_Sky_05-512x512.png",
    texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
    }
);

const studTexture = textureLoader.load("./assets/stud.png");

// Create a simple cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ map: studTexture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

let t = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  camera.position.x = 5 * Math.sin(t/50);
  camera.position.z = 5 * Math.cos(t/50);
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