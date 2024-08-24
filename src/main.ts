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

// local gltfloader
const modelLoader = new GLTFLoader(progressManager);

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

const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1));
const chassisBody = new CANNON.Body({ mass: 300 });
chassisBody.addShape(chassisShape);
chassisBody.position.set(0, 2, 0);
chassisBody.quaternion.set(0, -1, 0, 1);

// init raycast vehicle
const vehicle = new CANNON.RaycastVehicle({
  chassisBody: chassisBody,
});

// setting for all wheel options
const wheelOptions = {
  radius: 0.5,
  directionLocal: new CANNON.Vec3(0, -1, 0),
  suspensionStiffness: 30,
  suspensionRestLength: 0.3,
  frictionSlip: 1.4,
  dampingRelaxation: 2.3,
  dampingCompression: 4.4,
  maxSuspensionForce: 100000,
  rollInfluence: 0.01,
  axleLocal: new CANNON.Vec3(0, 0, 1),
  chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
  maxSuspensionTravel: 0.3,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true,
};

const currentVehicle = {
  pickup: {
    chassis: allCarModels.retrowave.chassis,
    wheels: allCarModels.retrowave.wheel,
    xPos: 1.8,
    yPos: -0.4,
    zPos: 1,
    xAdditiveValueFront: 0.01,
    xAdditiveValueRear: 0.15,
  },
};

const wheelPos_X = currentVehicle.pickup.xPos;
const wheelPos_Z = currentVehicle.pickup.zPos;
const wheelPos_Y = currentVehicle.pickup.yPos;

// pushing all wheels in in 4 postions

// front axle left position
wheelOptions.chassisConnectionPointLocal.set(
  -wheelPos_X + currentVehicle.pickup.xAdditiveValueFront,
  wheelPos_Y,
  wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// front axle right position
wheelOptions.chassisConnectionPointLocal.set(
  -wheelPos_X + currentVehicle.pickup.xAdditiveValueFront,
  wheelPos_Y,
  -wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// rear axle left position
wheelOptions.chassisConnectionPointLocal.set(
  wheelPos_X + currentVehicle.pickup.xAdditiveValueRear,
  wheelPos_Y,
  wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// rear axle right position
wheelOptions.chassisConnectionPointLocal.set(
  wheelPos_X + currentVehicle.pickup.xAdditiveValueRear,
  wheelPos_Y,
  -wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// adding vehicle to the physics world
vehicle.addToWorld(mainWORLD);

// setting up wheel bodies as a array
const wheelCollisionMaterial = new CANNON.Material("wheel");

const wheelBodies = [];
const wheelVisual = [];
vehicle.wheelInfos.forEach((wheel) => {
  const cylinderShape = new CANNON.Cylinder(
    wheel.radius,
    wheel.radius,
    wheel.radius / 2,
    20
  );
  const wheelBody = new CANNON.Body({
    mass: 0,
    material: wheelCollisionMaterial,
  });
  wheelBody.type = CANNON.Body.KINEMATIC;
  wheelBody.collisionFilterGroup = 0; // turn off collisions
  const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0);
  wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);
  wheelBodies.push(wheelBody);
  mainWORLD.addBody(wheelBody);

  let buggyWheel;
  modelLoader.load(currentVehicle.pickup.wheels, function (gltf) {
    buggyWheel = gltf.scene;
    buggyWheel.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        // node.material.wireframe = true;
      }
    });
    wheelVisual.push(buggyWheel);
    mainSCENE.add(buggyWheel);
  });
});

// pushing wheel cylinders in all 4 positions and orientations
mainWORLD.addEventListener("postStep", () => {
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    vehicle.updateWheelTransform(i);

    // setting up transforms for pushing wheel from array into local chassis position
    const transform = vehicle.wheelInfos[i].worldTransform;
    const wheelBody = wheelBodies[i];

    // for pushing cannon wheels into local chassis position
    if (wheelBody) {
      wheelBody.position.copy(transform.position);
      wheelBody.quaternion.copy(transform.quaternion);
    }

    // for pushing wheel models to their 4 local positions related to chassisbody
    if (wheelVisual[i]) {
      wheelVisual[i].position.copy(transform.position);
      wheelVisual[i].quaternion.copy(transform.quaternion);
    }
  }
});

// material for collision between wheels and ground plane
const wheel_ground = new CANNON.ContactMaterial(
  wheelCollisionMaterial,
  groundCollistonMaterial,
  {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000,
  }
);
mainWORLD.addContactMaterial(wheel_ground);

// event listeners for controls WASD and B for brake and N for nitrous system
const maxSteerVal = 0.5;
let maxForce = 200;
const brakeForce = maxForce / 10;

controlsForVehicle();
function controlsForVehicle() {
  // flags for keeping me sane
  let isWPressed = false;
  let isNitroActive = false;
  const originalMaxForce = maxForce;
  const nLimit = 1000;
  const nMultiplier = 10;

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "w":
        // case "ArrowUp":
        isWPressed = true;
        forceApplyEngineForce();
        break;

      case "s":
        // case "ArrowDown":
        vehicle.applyEngineForce(maxForce, 2);
        vehicle.applyEngineForce(maxForce, 3);
        break;

      case "a":
        // case "ArrowLeft":
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
        break;

      case "d":
        // case "ArrowRight":
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
        break;

      case "b":
        vehicle.setBrake(brakeForce, 0);
        vehicle.setBrake(brakeForce, 1);
        vehicle.setBrake(brakeForce, 2);
        vehicle.setBrake(brakeForce, 3);
        break;
      case "n": // Nitro boost
        if (!isNitroActive) {
          // Activate nitro only if it's not already active
          isNitroActive = true; // Mark nitro as active
          maxForce *= nMultiplier; // Increase maxForce
          if (isWPressed) {
            forceApplyEngineForce(); // Apply increased force if "W" is pressed
          }
          setTimeout(() => {
            maxForce = originalMaxForce; // Revert maxForce after nitro limit is passed
            isNitroActive = false; // Mark nitro as inactive
            if (isWPressed) {
              forceApplyEngineForce(); // Apply original force if "W" is still pressed
            }
          }, nLimit);
        }
        break;
    }
  });

  function forceApplyEngineForce() {
    // Apply engine force based on current maxForce and nitro state
    vehicle.applyEngineForce(-maxForce, 2);
    vehicle.applyEngineForce(-maxForce, 3);
  }

  // Reset force on keyup
  document.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "w":
        // case "ArrowUp":
        isWPressed = false;
        vehicle.applyEngineForce(0, 2);
        vehicle.applyEngineForce(0, 3);
        break;

      case "s":
        // case "ArrowDown":
        vehicle.applyEngineForce(0, 2);
        vehicle.applyEngineForce(0, 3);
        break;

      case "a":
        // case "ArrowLeft":
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
        break;

      case "d":
        // case "ArrowRight":
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
        break;

      case "b":
        vehicle.setBrake(0, 0);
        vehicle.setBrake(0, 1);
        vehicle.setBrake(0, 2);
        vehicle.setBrake(0, 3);
        break;
    }
  });
}

// setting this up in global since im gonna neet to use in update functions down below
let mixer: THREE.AnimationMixer;
let validModel: THREE.Object3D;

// loads model and only plays animation if it consists animations data
modelLoader.load(currentVehicle.pickup.chassis, function (gltf) {
  validModel = gltf.scene;

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

function initPhysicsDebugger() {
  physicsDebug = CannonDebugger(mainSCENE, mainWORLD, {
    color: 0xffff00,
    onInit(_body, mesh) {
      mesh.visible = false;
      document.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "h") {
          mesh.visible = !mesh.visible;
        }
      });
    },
  });
}
initPhysicsDebugger();

// lock on to position(0,0,0) mostly for debugging entire scene
const debugViewOrbitControls = new OrbitControls(
  mainCAMERA,
  main3D_RENDERER.domElement
);
// to enable debug view and disable follow cam
function debugView() {
  debugViewOrbitControls.enabled = true;
  debugViewOrbitControls.zoomSpeed = 3;
  debugViewOrbitControls.maxDistance = 6000;
  debugViewOrbitControls.update();
  followMeshOrbitControls.enabled = false;
}

// locks on the mesh position dynamically like a third person camera
const followMeshOrbitControls = new OrbitControls(
  mainCAMERA,
  main3D_RENDERER.domElement
);
// to enable follow cam and disable debug view
function followMesh() {
  if (validModel) {
    followMeshOrbitControls.enabled = true;
    followMeshOrbitControls.target = validModel.position;
    followMeshOrbitControls.enableDamping = true;
    followMeshOrbitControls.dampingFactor = 0.04;
    followMeshOrbitControls.enablePan = false;
    followMeshOrbitControls.maxDistance = 8;
    followMeshOrbitControls.minDistance = 4;
    followMeshOrbitControls.minPolarAngle = Math.PI / 6.4;
    followMeshOrbitControls.maxPolarAngle = Math.PI / 2.4;
    followMeshOrbitControls.update();
    debugViewOrbitControls.enabled = false;
  }
}

// boolean to switch between two viewers
const valueForDebugViewSwitch = { toggleValue: true };

// functions to switch between two orbit controls
function chaseCamera() {
  if (valueForDebugViewSwitch.toggleValue === true) {
    followMesh();
  } else {
    debugView();
  }
}
const gameFolder = gui.addFolder("Game");
gameFolder.open();
gameFolder.add(valueForDebugViewSwitch, "toggleValue").name("Chase Camera");

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
  if (validModel) {
    validModel.position.copy(chassisBody.position);
    validModel.quaternion.copy(chassisBody.quaternion);
  }
  groundMesh.position.copy(tempPhysicsGroundBody.position);
  groundMesh.quaternion.copy(tempPhysicsGroundBody.quaternion);
}

// main recursive function
function animate() {
  requestAnimationFrame(animate);
  renderLoopMain();
  renderLoopSub();
  stats.update();
  threeAndCannonSync();
  chaseCamera();

  const delta = debugClock.getDelta();

  if (physicsDebug) {
    physicsDebug.update();
  }

  if (mixer) {
    mixer.update(delta);
  }
}
