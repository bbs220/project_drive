import * as THREE from "three";
import * as CANNON from "cannon-es";
import Stats from "stats.js";
import { GUI } from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { progressManager } from "./ui/loadingScreenUI";
import { allHDRs, allImageTextures, allCarModels } from "./utils/assetPaths";
import { controlsForVehicle } from "./utils/steeringControls";
import { initPhysicsDebugger, physicsDebug } from "./utils/physicsDebugger";
import { speedCalulation } from "./ui/vehicleUI";
import {
  anisotrophicValue,
  groundParams,
  lightsParams,
  tilingValue,
} from "./constants/constants";
import {
  useHeadLights,
  useHeadLightsToChassisSync,
  leftHeadLight,
  leftHeadLightHelper,
  rightHeadLight,
  rightHeadLightHelper,
} from "./utils/headLights";
import {
  usePerspectiveCamera,
  useScene,
  useWebGLRenderer,
} from "./include/coreComponents";
import { useCSS2DRenderer } from "./include/otherRenderer";
import {
  useAmbientLight,
  useGrid,
  useOriginAxes,
  xLabel,
  yLabel,
  zLabel,
} from "./helpers/commonHelpers";

// scene
const mainSCENE = useScene();

// camera
const mainCAMERA = usePerspectiveCamera();

// primary renderer
const main3D_RENDERER = useWebGLRenderer();

// secondary renderer
const sub2D_RENDERER = useCSS2DRenderer();

// for resizing both renderers to window size
window.addEventListener("resize", () => {
  mainCAMERA.aspect = window.innerWidth / window.innerHeight;
  mainCAMERA.updateProjectionMatrix();
  main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
  sub2D_RENDERER.setSize(window.innerWidth, window.innerHeight);
});

// a tiled texture for a some reference
const blueprintTexture = new THREE.TextureLoader(progressManager).load(
  allImageTextures.blueSquare,
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
const debugGrid = useGrid();
mainSCENE.add(debugGrid);

// origin 3d axes to see orientation of objects places in the scene
const debugAxes = useOriginAxes();
// css labels for the axis
mainSCENE.add(debugAxes, xLabel, yLabel, zLabel);

// flood light to making all objects visible does not produce shadows
const ambientLight = useAmbientLight();
mainSCENE.add(ambientLight);

// clock mostly used for the delta in recursive functions later on
const debugClock = new THREE.Clock();

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

// initializing debugger to see the invisible physics world collisions
initPhysicsDebugger(mainSCENE, mainWORLD);

// threejs plane as a ground
const groundShape = new THREE.PlaneGeometry(
  groundParams.width,
  groundParams.height,
  groundParams.wSegment,
  groundParams.hSegment
);
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

const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.3, 1));
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
  radius: 0.3,
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

const selectedCar = {
  chassis: allCarModels.muscle.chassis,
  wheels: allCarModels.muscle.wheel,
  xPos: 1.1,
  yPos: -0.1,
  zPos: 0.75,
  xAdditiveValueFront: -0.08,
  xAdditiveValueRear: -0.005,
};

const wheelPos_X = selectedCar.xPos;
const wheelPos_Z = selectedCar.zPos;
const wheelPos_Y = selectedCar.yPos;

// pushing all wheels in in 4 postions

// front axle left position
wheelOptions.chassisConnectionPointLocal.set(
  -wheelPos_X + selectedCar.xAdditiveValueFront,
  wheelPos_Y,
  wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// front axle right position
wheelOptions.chassisConnectionPointLocal.set(
  -wheelPos_X + selectedCar.xAdditiveValueFront,
  wheelPos_Y,
  -wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// rear axle left position
wheelOptions.chassisConnectionPointLocal.set(
  wheelPos_X + selectedCar.xAdditiveValueRear,
  wheelPos_Y,
  wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// rear axle right position
wheelOptions.chassisConnectionPointLocal.set(
  wheelPos_X + selectedCar.xAdditiveValueRear,
  wheelPos_Y,
  -wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// adding vehicle to the physics world
vehicle.addToWorld(mainWORLD);

const wheelCollisionMaterial = new CANNON.Material("wheel");

// setting up wheel bodies as a array
const wheelBodies: CANNON.Body[] = [];
const wheelVisual: THREE.Group<THREE.Object3DEventMap>[] = [];
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

  let wheelModel;
  modelLoader.load(selectedCar.wheels, function (gltf) {
    wheelModel = gltf.scene;
    wheelModel.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.material.wireframe = false;
      }
    });
    wheelVisual.push(wheelModel);
    mainSCENE.add(wheelModel);
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

// adding controls here
controlsForVehicle(vehicle);

// setting this up in global since im gonna neet to use in update functions down below
let mixer: THREE.AnimationMixer;
let chassisModel: THREE.Object3D;

// loads model and only plays animation if it consists animations data
modelLoader.load(selectedCar.chassis, function (gltf) {
  chassisModel = gltf.scene;

  const validAnimationSet = gltf.animations;

  chassisModel.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      node.material.wireframe = false;
    }
  });

  if (validAnimationSet.length > 0) {
    mixer = new THREE.AnimationMixer(chassisModel);
    const action = mixer.clipAction(validAnimationSet[0]);
    action.play();
  }

  mainSCENE.add(chassisModel);

  // main animate function here cause faster updating
  animate();
});

// adding headlights to car
useHeadLights(mainSCENE);

// a gui for prototyping on the objects
const gui = new GUI();
gui.close();

const sceneFolder = gui.addFolder("Scene");
sceneFolder.close();
sceneFolder
  .add(debugAxes, "visible")
  .name("Origin Axes")
  .onChange(toggleDebugObjectsVisibility);
function toggleDebugObjectsVisibility() {
  xLabel.visible = debugAxes.visible;
  yLabel.visible = debugAxes.visible;
  zLabel.visible = debugAxes.visible;
}
sceneFolder.add(debugGrid, "visible").name("Grid");
sceneFolder.add(ambientLight, "visible").name("Fill Light");

const lightsFolder = gui.addFolder("Stage Lights");
lightsFolder.close();
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

function updateBothSpotlights(property: string, value: number) {
  (leftHeadLight as any)[property] = value;
  (rightHeadLight as any)[property] = value;
}

function updateHelperVisibility(property: string, value: boolean) {
  (leftHeadLightHelper as any)[property] = value;
  (rightHeadLightHelper as any)[property] = value;
}

const headLightFolder = gui.addFolder("Headlights");
headLightFolder.close();
headLightFolder
  .add(leftHeadLightHelper, "visible")
  .name("Helper")
  .onChange((value: boolean) => {
    updateHelperVisibility("visible", value);
  });
headLightFolder
  .add(leftHeadLight, "intensity", 0, 100)
  .step(1)
  .name("intensity")
  .onChange((value: number) => {
    updateBothSpotlights("intensity", value);
  });
headLightFolder
  .add(leftHeadLight, "distance", 1, 100)
  .name("distance")
  .step(0.1)
  .onChange((value: number) => {
    updateBothSpotlights("distance", value);
  });
headLightFolder
  .add(leftHeadLight, "angle", 0, 1.5)
  .name("angle")
  .step(0.01)
  .onChange((value: number) => {
    updateBothSpotlights("angle", value);
  });
headLightFolder
  .add(leftHeadLight, "penumbra", 0, 1)
  .step(0.1)
  .name("penumbra")
  .onChange((value: number) => {
    updateBothSpotlights("penumbra", value);
  });

// lock on to position(0,0,0) mostly for debugging entire scene
const debugViewOrbitControls = new OrbitControls(
  mainCAMERA,
  main3D_RENDERER.domElement
);
// to enable debug view and disable follow cam
function debugView() {
  debugViewOrbitControls.enabled = true;
  debugViewOrbitControls.zoomSpeed = 3;
  debugViewOrbitControls.maxDistance = 1500;
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
  if (chassisModel) {
    followMeshOrbitControls.enabled = true;
    followMeshOrbitControls.target = chassisModel.position;
    followMeshOrbitControls.enableDamping = true;
    followMeshOrbitControls.dampingFactor = 0.04;
    followMeshOrbitControls.enablePan = false;
    followMeshOrbitControls.maxDistance = 5;
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

// for bringing the car back to position (0,0,0) in case it crashes somewhere
function resetCar() {
  chassisBody.position.set(0, 4, 0);
  chassisBody.quaternion.set(0, -1, 0, 1);
  chassisBody.velocity.set(0, 0, 0);
  mainCAMERA.position.set(0, 5, 10);
  vehicle.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
}

const carFolder = gui.addFolder("Vehicle");
carFolder.open();
carFolder.add(valueForDebugViewSwitch, "toggleValue").name("Chase Camera");
carFolder.add({ resetCar }, "resetCar").name("Reset Vehicle");

// for syncing threejs and cannon objects
function threeAndCannonSync() {
  mainWORLD.fixedStep();
  if (chassisModel) {
    chassisModel.position.copy(chassisBody.position);
    chassisModel.quaternion.copy(chassisBody.quaternion);
  }
  groundMesh.position.copy(tempPhysicsGroundBody.position);
  groundMesh.quaternion.copy(tempPhysicsGroundBody.quaternion);
}

// clean webgl render function
function renderLoopMain() {
  main3D_RENDERER.render(mainSCENE, mainCAMERA);
}

// clean css render function
function renderLoopSub() {
  sub2D_RENDERER.render(mainSCENE, mainCAMERA);
}

// main recursive function
function animate() {
  requestAnimationFrame(animate);
  renderLoopMain();
  renderLoopSub();
  stats.update();
  threeAndCannonSync();
  useHeadLightsToChassisSync(chassisModel);
  speedCalulation(vehicle);
  chaseCamera();

  const deltaTime = debugClock.getDelta();

  if (physicsDebug) {
    physicsDebug.update();
  }

  if (mixer) {
    mixer.update(deltaTime);
  }
}
