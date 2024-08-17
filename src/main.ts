import * as THREE from "three";
import Stats from "stats.js";
import { GUI } from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";
import { xDiv, yDiv, zDiv } from "./utils/backgroundUI";
import { progressManager } from "./utils/loadingScreen";
import { allHDRs, allModels, blueSquare } from "./utils/assetPaths";

const mainSCENE = new THREE.Scene();

const mainCAMERA = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

mainCAMERA.position.set(0, 5, 10);

const main3D_RENDERER = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
main3D_RENDERER.shadowMap.enabled = true;
main3D_RENDERER.toneMapping = THREE.ACESFilmicToneMapping;
main3D_RENDERER.toneMappingExposure = 0.5;
document.body.appendChild(main3D_RENDERER.domElement);

const sub2D_RENDERER = new CSS2DRenderer();
sub2D_RENDERER.setSize(window.innerWidth, window.innerHeight);
sub2D_RENDERER.domElement.style.position = "absolute";
sub2D_RENDERER.domElement.style.top = "0%";
sub2D_RENDERER.domElement.style.left = "0%";
sub2D_RENDERER.domElement.style.pointerEvents = "none";
document.body.appendChild(sub2D_RENDERER.domElement);

window.addEventListener("resize", () => {
  mainCAMERA.aspect = window.innerWidth / window.innerHeight;
  mainCAMERA.updateProjectionMatrix();
  main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
});

const baseCOMPOSER = new EffectComposer(main3D_RENDERER);

const baseRenderPass = new RenderPass(mainSCENE, mainCAMERA);
baseCOMPOSER.addPass(baseRenderPass);

let originAxisLength = 50;

const xObj = new CSS2DObject(xDiv);
xObj.visible = false;
xObj.position.set(originAxisLength, 0, 0);

const yObj = new CSS2DObject(yDiv);
yObj.visible = false;
yObj.position.set(0, originAxisLength, 0);

const zObj = new CSS2DObject(zDiv);
zObj.visible = false;
zObj.position.set(0, 0, originAxisLength);

mainSCENE.add(xObj, yObj, zObj);

const tilingValue = 16;
const anisotrophicValue = 16; // this is max value dont go above 16

// a tiled texture for a some reference
const blueprintTexture = new THREE.TextureLoader(progressManager).load(
  blueSquare.color,
  (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(tilingValue, tilingValue);
    texture.anisotropy = anisotrophicValue;
  }
);

let textureToggle: THREE.Texture | null;

const envMap = new RGBELoader(progressManager);
envMap.load(allHDRs.city, (texture: THREE.Texture) => {
  textureToggle = texture;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  mainSCENE.environment = texture;
  mainSCENE.background = null;
});

const debugControls = new OrbitControls(mainCAMERA, main3D_RENDERER.domElement);
debugControls.enableDamping = true;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const debugGrid = new THREE.GridHelper(
  tilingValue,
  tilingValue,
  "#ffff00",
  "#00ffff"
);
debugGrid.position.set(0, -0.01, 0);
debugGrid.scale.setScalar(6.2);
debugGrid.visible = false;
mainSCENE.add(debugGrid);

const debugAxes = new THREE.AxesHelper(originAxisLength);
debugAxes.visible = false;
mainSCENE.add(debugAxes);

const ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
ambientLight.visible = false;
mainSCENE.add(ambientLight);

const debugClock = new THREE.Clock();

const lightsParams = {
  y: 5,
  x: 3,
  z: 3,
  intensity: 30,
  enabled: false,
  helpers: false,
  color: "#ffffff",
};

function createPointLightAndHelper(
  color: string,
  intensity: number,
  position: THREE.Vector3
): [THREE.PointLight, THREE.PointLightHelper] {
  const light = new THREE.PointLight(color, intensity, 0, 2);
  light.position.copy(position);
  light.castShadow = true;
  light.visible = lightsParams.enabled;
  const helper = new THREE.PointLightHelper(light, 0.3, color);
  helper.visible = lightsParams.helpers;
  return [light, helper];
}

const positions = [
  { x: lightsParams.x, y: lightsParams.y, z: lightsParams.z },
  { x: -lightsParams.x, y: lightsParams.y, z: -lightsParams.z },
  { x: -lightsParams.x, y: lightsParams.y, z: lightsParams.z },
  { x: lightsParams.x, y: lightsParams.y, z: -lightsParams.z },
];

let lightsAndHelpers: [THREE.PointLight, THREE.PointLightHelper][] = [];

for (let i = 0; i < positions.length; i++) {
  const position = new THREE.Vector3(
    positions[i].x,
    positions[i].y,
    positions[i].z
  );
  const [light, helper] = createPointLightAndHelper(
    lightsParams.color,
    lightsParams.intensity,
    position
  );
  lightsAndHelpers.push([light, helper]);
  mainSCENE.add(light, helper);
}

const groundShape = new THREE.PlaneGeometry(100, 100, 1, 1);
const groundMaterial = new THREE.MeshStandardMaterial({
  wireframe: false,
  map: blueprintTexture,
});
const groundMesh = new THREE.Mesh(groundShape, groundMaterial);
groundMesh.receiveShadow = true;
groundMesh.rotateX(Math.PI / -2);
groundMesh.position.set(0, -0.02, 0);
mainSCENE.add(groundMesh);

let mixer: THREE.AnimationMixer;

const modelLoader = new GLTFLoader(progressManager);

modelLoader.load(allModels.ae86, function (gltf) {
  const validModel = gltf.scene;

  const animationSet = gltf.animations;

  validModel.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      // node.material.wireframe = true;
    }
  });

  if (gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(validModel);
    const action = mixer.clipAction(animationSet[0]);
    action.play();
  }

  mainSCENE.add(validModel);

  animate();
});

const gui = new GUI();
gui.close();

const sceneFolder = gui.addFolder("Scene");
sceneFolder.open();
sceneFolder
  .add(debugAxes, "visible")
  .name("Origin Axes")
  .onChange(toggleDebugObjectsVisibility);
function toggleDebugObjectsVisibility() {
  xObj.visible = debugAxes.visible;
  yObj.visible = debugAxes.visible;
  zObj.visible = debugAxes.visible;
}
sceneFolder.add(debugGrid, "visible").name("Grid");
sceneFolder.add(ambientLight, "visible").name("Fill Light");

const lightsFolder = gui.addFolder("Lights");
lightsFolder.open();
function updateLightIntensities() {
  lightsAndHelpers.forEach(([light]) => {
    light.intensity = lightsParams.intensity;
  });
}
function toggleLightVisibility() {
  lightsAndHelpers.forEach(([light, helper]) => {
    light.visible = lightsParams.enabled;
    helper.visible = lightsParams.helpers;
  });
}
function updateLightPositions() {
  positions.forEach((_, index) => {
    const light = lightsAndHelpers[index][0];
    light.position.setY(lightsParams.y);
  });
}
lightsFolder
  .add(lightsParams, "enabled")
  .name("Enabled")
  .onChange(toggleLightVisibility);
lightsFolder
  .add(lightsParams, "helpers")
  .name("Helpers")
  .onChange(toggleLightVisibility);
lightsFolder
  .add(lightsParams, "intensity", 0, 100)
  .step(1)
  .name("Intensity")
  .onChange(updateLightIntensities);
lightsFolder
  .add(lightsParams, "y", 0, 10)
  .name("Y Position")
  .step(1)
  .onChange(() => updateLightPositions());

const hdriFolder = gui.addFolder("HDRI");
hdriFolder.open();
const paramsHDR = {
  switch: true,
  background: false,
  environment: true,
};
hdriFolder
  .add(paramsHDR, "environment")
  .name("Enabled")
  .onChange(toggleEnvironment);
hdriFolder
  .add(paramsHDR, "background")
  .name("Background")
  .onChange(toggleBackground);
function toggleBackground(value: boolean) {
  if (value === true) {
    mainSCENE.background = textureToggle;
  } else {
    mainSCENE.background = null;
  }
}
function toggleEnvironment(value: boolean) {
  if (value === true) {
    mainSCENE.environment = textureToggle;
  } else {
    mainSCENE.environment = null;
  }
}
hdriFolder
  .add(main3D_RENDERER, "toneMappingExposure", 0, 1)
  .step(0.01)
  .name("Exposure");

function renderLoopMain() {
  // main3D_RENDERER.render(mainSCENE, mainCAMERA);
  baseCOMPOSER.render();
}

function renderLoopSub() {
  sub2D_RENDERER.render(mainSCENE, mainCAMERA);
}

function animate() {
  requestAnimationFrame(animate);
  renderLoopMain();
  renderLoopSub();
  debugControls.update();
  stats.update();

  if (mixer) {
    const delta = debugClock.getDelta();
    mixer.update(delta);
  }
}

// animate();
