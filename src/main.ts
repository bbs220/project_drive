import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
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
import { allHDRs, blueSquare, allCarModels } from "./utils/assetPaths";

// scene
const mainSCENE = new THREE.Scene();

// camera
const mainCAMERA = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
mainCAMERA.position.set(0, 5, 10);

// webgl renderer
const main3D_RENDERER = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
main3D_RENDERER.shadowMap.enabled = true;
main3D_RENDERER.toneMapping = THREE.ACESFilmicToneMapping;
main3D_RENDERER.toneMappingExposure = 1;
document.body.appendChild(main3D_RENDERER.domElement);

// css renderer
const sub2D_RENDERER = new CSS2DRenderer();
sub2D_RENDERER.setSize(window.innerWidth, window.innerHeight);
sub2D_RENDERER.domElement.style.position = "absolute";
sub2D_RENDERER.domElement.style.top = "0%";
sub2D_RENDERER.domElement.style.left = "0%";
sub2D_RENDERER.domElement.style.pointerEvents = "none";
document.body.appendChild(sub2D_RENDERER.domElement);

// for resizing both renderers to window size
window.addEventListener("resize", () => {
  mainCAMERA.aspect = window.innerWidth / window.innerHeight;
  mainCAMERA.updateProjectionMatrix();
  main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
});

// base layer for postprocessing
const baseCOMPOSER = new EffectComposer(main3D_RENDERER);

// minimal renderpass
const baseRenderPass = new RenderPass(mainSCENE, mainCAMERA);
baseCOMPOSER.addPass(baseRenderPass);

let originAxisLength = 50;

// css labels for the axis
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

// constansts for ground texture
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

// environment map for better lightings but does not project shadows
const envMap = new RGBELoader(progressManager);
envMap.load(allHDRs.city, (texture: THREE.Texture) => {
  textureToggle = texture;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  mainSCENE.environment = texture;
  mainSCENE.background = null;
});

// orbitcontrols for now does lock on to position(0,0,0)
const debugControls = new OrbitControls(mainCAMERA, main3D_RENDERER.domElement);
debugControls.enableDamping = true;
debugControls.minDistance = 3;
debugControls.maxDistance = 7;
debugControls.enablePan = false;
debugControls.maxPolarAngle = Math.PI / 2 - 0.05;

// fps stats
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// just a grid not related to physics grid
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

// origin 3d axes to see orientation of objects places in the scene
const debugAxes = new THREE.AxesHelper(originAxisLength);
debugAxes.visible = false;
mainSCENE.add(debugAxes);

// flood light to making all objects visible does not produce shadows
const ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
ambientLight.visible = false;
mainSCENE.add(ambientLight);

// clock mostly used for the delta in recursive functions later on
const debugClock = new THREE.Clock();

// parameters for the 4 point lights
const lightsParams = {
  y: 5,
  x: 3,
  z: 3,
  intensity: 30,
  enabled: false,
  helpers: false,
  color: "#ffffff",
};

// 4 point lights to see shadows and movement of object from multiple views
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

// positions of those 4 lights
const positions = [
  { x: lightsParams.x, y: lightsParams.y, z: lightsParams.z },
  { x: -lightsParams.x, y: lightsParams.y, z: -lightsParams.z },
  { x: -lightsParams.x, y: lightsParams.y, z: lightsParams.z },
  { x: lightsParams.x, y: lightsParams.y, z: -lightsParams.z },
];

// setting up all point lights from a array
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

// initiating the physics world
const mainWORLD = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.8, 0),
  allowSleep: true,
});
mainWORLD.broadphase = new CANNON.SAPBroadphase(mainWORLD);
mainWORLD.defaultContactMaterial.friction = 0;

// initiating the physics debug renderer
let physicsDebug: { update: any };

// threejs plane as a ground
const groundShape = new THREE.PlaneGeometry(100, 100, 1, 1);
const groundMaterial = new THREE.MeshStandardMaterial({
  wireframe: false,
  map: blueprintTexture,
});
const groundMesh = new THREE.Mesh(groundShape, groundMaterial);
groundMesh.receiveShadow = true;
mainSCENE.add(groundMesh);

const groundCollistonMaterial = new CANNON.Material("ground");

// physics ground for the threejs plane
const tempPhysicsGroundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  material: groundCollistonMaterial,
});
const tempPhysicsGroundShape = new CANNON.Plane();
tempPhysicsGroundBody.addShape(tempPhysicsGroundShape);
tempPhysicsGroundBody.position.set(0, 0, 0);
tempPhysicsGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
mainWORLD.addBody(tempPhysicsGroundBody);

// for animating and updating models with animation data
let mixer: THREE.AnimationMixer;

// local gltfloader
const modelLoader = new GLTFLoader(progressManager);

// loads model and only plays animation if it consists animations data
modelLoader.load(allCarModels.ae86, function (gltf) {
  const validModel = gltf.scene;

  const validAnimationSet = gltf.animations;

  validModel.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      // node.material.wireframe = true;
    }
  });

  if (gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(validModel);
    const action = mixer.clipAction(validAnimationSet[0]);
    action.play();
  }

  mainSCENE.add(validModel);

  // main animate function here cause faster updating
  animate();
});

// a gui for prototyping on the objects
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
  .addColor(lightsParams, "color")
  .name("Color")
  .onChange(() => {
    lightsAndHelpers.forEach(([light]) => {
      light.color.set(lightsParams.color);
    });
  });
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
const hdrParams = {
  switch: true,
  background: false,
  environment: true,
};
hdriFolder
  .add(hdrParams, "environment")
  .name("Enabled")
  .onChange(toggleEnvironment);
hdriFolder
  .add(hdrParams, "background")
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
const physicsFolder = gui.addFolder("Physics");
physicsFolder.open();

initPhysicsDebugger();
function initPhysicsDebugger() {
  physicsDebug = CannonDebugger(mainSCENE, mainWORLD, {
    color: 0xffff00,
    onInit(_body, mesh) {
      mesh.visible = false;
      document.addEventListener("keydown", (e) => {
        if (e.key === "h") {
          mesh.visible = !mesh.visible;
        }
      });
    },
  });
}

// clean webgl render function
function renderLoopMain() {
  // main3D_RENDERER.render(mainSCENE, mainCAMERA);
  baseCOMPOSER.render();
}

// clean css render function
function renderLoopSub() {
  sub2D_RENDERER.render(mainSCENE, mainCAMERA);
}

// for syncing threejs and cannon objects
function threeAndCannonSync() {
  mainWORLD.fixedStep();
  groundMesh.position.copy(tempPhysicsGroundBody.position);
  groundMesh.quaternion.copy(tempPhysicsGroundBody.quaternion);
}

// main recursive function
function animate() {
  requestAnimationFrame(animate);
  renderLoopMain();
  renderLoopSub();
  debugControls.update();
  stats.update();
  threeAndCannonSync();

  const delta = debugClock.getDelta();

  if (physicsDebug) {
    physicsDebug.update();
  }

  if (mixer) {
    mixer.update(delta);
  }
}

// animate();
