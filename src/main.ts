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
  enabled: true,
  helpers: false,
  color: "#ffffff",
};

const pLight_00 = new THREE.PointLight(
  lightsParams.color,
  lightsParams.intensity,
  0,
  2
);
const plView_00 = new THREE.PointLightHelper(
  pLight_00,
  0.3,
  lightsParams.color
);
pLight_00.castShadow = true;
plView_00.visible = lightsParams.enabled;
plView_00.visible = lightsParams.helpers;

const pLight_01 = new THREE.PointLight(
  lightsParams.color,
  lightsParams.intensity,
  0,
  2
);
const plView_01 = new THREE.PointLightHelper(
  pLight_01,
  0.3,
  lightsParams.color
);
pLight_01.castShadow = true;
pLight_01.visible = lightsParams.enabled;
plView_01.visible = lightsParams.helpers;

const pLight_02 = new THREE.PointLight(
  lightsParams.color,
  lightsParams.intensity,
  0,
  2
);
const plView_02 = new THREE.PointLightHelper(
  pLight_02,
  0.3,
  lightsParams.color
);
pLight_02.castShadow = true;
pLight_02.visible = lightsParams.enabled;
plView_02.visible = lightsParams.helpers;

const pLight_03 = new THREE.PointLight(
  lightsParams.color,
  lightsParams.intensity,
  0,
  2
);
const plView_03 = new THREE.PointLightHelper(
  pLight_03,
  0.3,
  lightsParams.color
);
pLight_03.castShadow = true;
pLight_03.visible = lightsParams.enabled;
plView_03.visible = lightsParams.helpers;

pLight_00.position.set(lightsParams.x, lightsParams.y, lightsParams.z);
pLight_01.position.set(-lightsParams.x, lightsParams.y, -lightsParams.z);
pLight_02.position.set(-lightsParams.x, lightsParams.y, lightsParams.z);
pLight_03.position.set(lightsParams.x, lightsParams.y, -lightsParams.z);

mainSCENE.add(pLight_00, pLight_01, pLight_02, pLight_03);
mainSCENE.add(plView_00, plView_01, plView_02, plView_03);

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

modelLoader.load(allModels.shiba, function (gltf) {
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
lightsFolder
  .add(lightsParams, "enabled")
  .name("Enabled")
  .onChange(() => {
    pLight_00.visible = lightsParams.enabled;
    pLight_01.visible = lightsParams.enabled;
    pLight_02.visible = lightsParams.enabled;
    pLight_03.visible = lightsParams.enabled;
  });
lightsFolder
  .add(lightsParams, "helpers")
  .name("Helpers")
  .onChange(() => {
    plView_00.visible = lightsParams.helpers;
    plView_01.visible = lightsParams.helpers;
    plView_02.visible = lightsParams.helpers;
    plView_03.visible = lightsParams.helpers;
  });
lightsFolder.add(lightsParams, "x", -10, 10).step(1).name("X Pos");
lightsFolder.add(lightsParams, "y", 0, 10).step(1).name("Y Pos");
lightsFolder.add(lightsParams, "z", -10, 10).step(1).name("Z Pos");
lightsFolder
  .add(lightsParams, "intensity", 0, 100)
  .step(1)
  .name("Intensity")
  .onChange(() => {
    updateLightIntensities();
  });

function updateLightPositions() {
  pLight_00.position.set(lightsParams.x, lightsParams.y, lightsParams.z);
  pLight_01.position.set(-lightsParams.x, lightsParams.y, -lightsParams.z);
  pLight_02.position.set(-lightsParams.x, lightsParams.y, lightsParams.z);
  pLight_03.position.set(lightsParams.x, lightsParams.y, -lightsParams.z);
}

function updateLightIntensities() {
  pLight_00.intensity = lightsParams.intensity;
  pLight_01.intensity = lightsParams.intensity;
  pLight_02.intensity = lightsParams.intensity;
  pLight_03.intensity = lightsParams.intensity;
}

lightsFolder.onFinishChange(updateLightPositions);

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
