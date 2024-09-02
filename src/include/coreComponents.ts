import * as THREE from "three";

// scene
export function useScene() {
  // maybe i'll add new scene if i need quick map shifting
  const scene = new THREE.Scene();
  return scene;
}

// camera
export function usePerspectiveCamera() {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  // custom position so the camera doesnt get stuck in the origin point of (0,0,0)
  camera.position.set(0, 5, 10);
  return camera;
}

// webgl renderer
export function useWebGLRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  // regular tonemapping sucks and isnt made for realistic light bounces
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  document.body.appendChild(renderer.domElement);
  return renderer;
}
