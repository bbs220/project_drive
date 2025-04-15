import * as THREE from "three";
import { stats } from "../helpers/visualHelpers";

// scene
export function useScene() {
  // maybe i'll add new scene if i need quick map shifting
  const scene = new THREE.Scene();
  return scene;
}

// camera
export function useCamera() {
  // by default gonna use a perspective camera
  // orthographic if only needed tiling look
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  // custom position so the camera doesnt get stuck in the origin point of (0,0,0)
  camera.position.set(0, 5, 15);
  return camera;
}

// webgl renderer
export function use3dRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  stats.init(renderer);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  // regular tonemapping sucks and isnt made for realistic light bounces
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  document.body.appendChild(renderer.domElement);
  return renderer;
}
