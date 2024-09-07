import * as THREE from "three";
import * as CANNON from "cannon-es";
import { allHDRs, allCarModels } from "./utils/assetPaths";
import { controlsForVehicle } from "./vehicle/steeringControls";
import { usePhysics } from "./physics";
import { initPhysicsDebugger, physicsDebug } from "./physics/debugger";
import { gui, stats } from "./helpers/visualHelpers";
import { useCamera, use3dRenderer, useScene } from "./include/coreComponents";
import { speedCalulation } from "./ui/vehicleUI";
import { use2dRenderer } from "./include/otherRenderer";
import { switchOrbitControls, toggle } from "./utils/thirdPersonCam";
import { envMapLoader, modelLoader } from "./utils/assetLoader";
import { lightsParams } from "./constants/constants";
import {
  useHeadLights,
  useHeadLightsToChassisSync,
  leftHeadLight,
  leftHeadLightHelper,
  rightHeadLight,
  rightHeadLightHelper,
} from "./vehicle/headLights";
import {
  useAmbientLight,
  useGrid,
  useOriginAxes,
  xLabel,
  yLabel,
  zLabel,
} from "./helpers/commonHelpers";
import {
  groundCollistonMaterial,
  useGroundMesh,
  useGroundPhysicsBody,
} from "./ground/ground";
import {
  lightsAndHelpers,
  lightPositions,
  stageLights,
} from "./utils/stageLights";

// scene
const mainSCENE = useScene();

// camera
const mainCAMERA = useCamera();

// primary renderer
const main3D_RENDERER = use3dRenderer();

// secondary renderer
const sub2D_RENDERER = use2dRenderer();

// for resizing both renderers to window size
window.addEventListener("resize", () => {
  mainCAMERA.aspect = window.innerWidth / window.innerHeight;
  mainCAMERA.updateProjectionMatrix();
  main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
  sub2D_RENDERER.setSize(window.innerWidth, window.innerHeight);
});

let textureToggle: THREE.Texture | null;

// environment map for better lightings but does not project shadows
envMapLoader.load(allHDRs.city, (texture: THREE.Texture) => {
  textureToggle = texture;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  mainSCENE.environment = texture;
  mainSCENE.background = null;
});

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

// adding 4 point lights to cast multiple shadows
stageLights(mainSCENE);

// initiating the physics world
// comes with a fixedstep function to actively "see" the interactions happening in the 3d world
// use it in main recursive function
const mainWORLD = usePhysics();

// initializing debugger to see the invisible physics world collisions
initPhysicsDebugger(mainSCENE, mainWORLD);

const groundMesh = useGroundMesh();
mainSCENE.add(groundMesh);

const groundBody = useGroundPhysicsBody();
mainWORLD.addBody(groundBody);

const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.3, 1));
const chassisBody = new CANNON.Body({ mass: 300 });
chassisBody.addShape(chassisShape);
chassisBody.position.set(0, 2, 10);
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
      node.material.flatShading = false;
    }
  });

  if (validAnimationSet.length > 0) {
    mixer = new THREE.AnimationMixer(chassisModel);
    const action = mixer.clipAction(validAnimationSet[0]);
    action.play();
  }

  mainSCENE.add(chassisModel);
});

// adding headlights to car
useHeadLights(mainSCENE);

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
  lightPositions.forEach((_, index) => {
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

// for bringing the car back to position (0,0,0) in case it crashes somewhere
function resetCar() {
  chassisBody.position.set(0, 2, 10);
  chassisBody.quaternion.set(0, -1, 0, 1);
  chassisBody.velocity.set(0, 0, 0);
  mainCAMERA.position.set(0, 10, 40);
  vehicle.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
}

// need to call the export function once outside the recursive animate function
// and the proceeding function inside the animate to constantly look at the moving object
const chaseCamera = switchOrbitControls(mainCAMERA, main3D_RENDERER);

const carFolder = gui.addFolder("Vehicle");
carFolder.open();
carFolder.add(toggle, "value").name("Chase Camera");
carFolder.add({ resetCar }, "resetCar").name("Reset Vehicle");

// for syncing threejs and cannon objects
function threeAndCannonSync() {
  if (chassisModel) {
    chassisModel.position.copy(chassisBody.position);
    chassisModel.quaternion.copy(chassisBody.quaternion);
  }
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);
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
  mainWORLD.fixedStep();
  threeAndCannonSync();
  useHeadLightsToChassisSync(chassisModel);
  speedCalulation(vehicle);
  chaseCamera(chassisModel);

  const deltaTime = debugClock.getDelta();

  if (physicsDebug) {
    physicsDebug.update();
  }

  if (mixer) {
    mixer.update(deltaTime);
  }
}
animate();
