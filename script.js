import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODEL_PATH = "./assets/bouquet.glb";
const DRAG_BUTTON_ROTATE = 0;
const DRAG_BUTTON_MOVE = 2;

const container = document.getElementById("webgl-container");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xff8fcb, 8, 30);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.2, 5.4);
camera.lookAt(0, 0.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const groupRoot = new THREE.Group();
scene.add(groupRoot);

const ambient = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(3.5, 5, 2.2);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x8f7bff, 2.2, 16, 2);
fillLight.position.set(-2.2, 1.6, 1.6);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x3e7bff, 2.4, 18, 2);
rimLight.position.set(2.4, 2.2, -1.8);
scene.add(rimLight);

let bouquetObject = null;

function createFallbackBouquet() {
  const bouquet = new THREE.Group();

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x346a3f,
    roughness: 0.9,
    metalness: 0.02
  });
  const petalMat = new THREE.MeshPhysicalMaterial({
    color: 0x7266ff,
    emissive: 0x2f1f7a,
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.08,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25
  });

  for (let i = 0; i < 14; i += 1) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.5, 10), stemMat);
    stem.position.y = 0.05;
    stem.position.x = (Math.random() - 0.5) * 0.34;
    stem.position.z = (Math.random() - 0.5) * 0.34;
    stem.rotation.z = (Math.random() - 0.5) * 0.3;
    bouquet.add(stem);

    const flower = new THREE.Group();
    flower.position.set(stem.position.x * 0.95, 0.9 + Math.random() * 0.65, stem.position.z * 0.95);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf4d271, roughness: 0.5 })
    );
    flower.add(core);

    for (let p = 0; p < 7; p += 1) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), petalMat);
      const angle = (Math.PI * 2 * p) / 7;
      petal.scale.set(0.5, 0.9, 0.2);
      petal.position.set(Math.cos(angle) * 0.1, 0.02, Math.sin(angle) * 0.1);
      petal.lookAt(0, 0.08, 0);
      flower.add(petal);
    }

    bouquet.add(flower);
  }

  const wrapMat = new THREE.MeshPhysicalMaterial({
    color: 0xece8f8,
    transparent: true,
    opacity: 0.35,
    roughness: 0.32,
    transmission: 0.32,
    side: THREE.DoubleSide
  });
  const wrap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.35, 24, 1, true), wrapMat);
  wrap.position.y = 0.15;
  wrap.rotation.x = Math.PI;
  bouquet.add(wrap);

  return bouquet;
}

function normalizeScale(target) {
  const box = new THREE.Box3().setFromObject(target);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.6 / maxAxis;
  target.scale.setScalar(scale);
  box.setFromObject(target);
  const center = new THREE.Vector3();
  box.getCenter(center);
  target.position.sub(center);
  target.position.y += 0.45;
}

function setBouquetObject(nextObject) {
  if (bouquetObject) {
    groupRoot.remove(bouquetObject);
  }
  bouquetObject = nextObject;
  groupRoot.add(bouquetObject);
}

function loadBouquetModel() {
  const loader = new GLTFLoader();
  loader.load(
    MODEL_PATH,
    (gltf) => {
      const model = gltf.scene;
      normalizeScale(model);
      setBouquetObject(model);
    },
    undefined,
    (error) => {
      console.error("GLB 加载失败：", error);
      setBouquetObject(createFallbackBouquet());
    }
  );
}

loadBouquetModel();

const dragState = {
  isDragging: false,
  mode: DRAG_BUTTON_ROTATE,
  lastX: 0,
  lastY: 0
};
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const movePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const hitPoint = new THREE.Vector3();

renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());
renderer.domElement.addEventListener("pointerdown", (event) => {
  dragState.isDragging = true;
  dragState.mode = event.button;
  dragState.lastX = event.clientX;
  dragState.lastY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointerup", (event) => {
  dragState.isDragging = false;
  renderer.domElement.releasePointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragState.isDragging || !bouquetObject) return;
  const dx = event.clientX - dragState.lastX;
  const dy = event.clientY - dragState.lastY;
  dragState.lastX = event.clientX;
  dragState.lastY = event.clientY;

  if (dragState.mode === DRAG_BUTTON_ROTATE) {
    groupRoot.rotation.y += dx * 0.01;
    groupRoot.rotation.x += dy * 0.006;
    groupRoot.rotation.x = THREE.MathUtils.clamp(groupRoot.rotation.x, -0.7, 0.7);
  } else if (dragState.mode === DRAG_BUTTON_MOVE) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(movePlane, hitPoint)) {
      groupRoot.position.x = THREE.MathUtils.clamp(hitPoint.x * 0.9, -2, 2);
      groupRoot.position.y = THREE.MathUtils.clamp(hitPoint.y * 0.8 - 0.2, -1.6, 1.9);
    }
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  const pulse = (Math.sin(elapsed * 2.2) + 1) * 0.5;
  const wave = (Math.sin(elapsed * 1.7) + 1) * 0.5;

  fillLight.color.setHSL(0.72, 0.88, 0.58 + pulse * 0.1);
  fillLight.intensity = 1.8 + pulse * 1.2;
  rimLight.color.setHSL(0.62, 0.9, 0.56 + wave * 0.1);
  rimLight.intensity = 1.9 + wave * 1.25;

  fillLight.position.x = Math.cos(elapsed * 0.8) * 2.4;
  fillLight.position.z = Math.sin(elapsed * 0.8) * 1.7;
  rimLight.position.x = Math.cos(elapsed * 0.6 + Math.PI) * 2.8;
  rimLight.position.z = Math.sin(elapsed * 0.6 + Math.PI) * 2;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
