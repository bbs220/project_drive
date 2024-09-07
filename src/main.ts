import * as THREE from "three";
import * as CANNON from "cannon-es";
import { usePhysics } from "./physics";
import { initPhysicsDebugger, physicsDebug } from "./physics/debugger";
import { gui, stats } from "./helpers/visualHelpers";
import { useCamera, use3dRenderer, useScene } from "./include/coreComponents";
import { speedCalulation } from "./ui/vehicleUI";
import { useGroundMesh, useGroundPhysicsBody } from "./ground/ground";
import { use2dRenderer } from "./include/otherRenderer";
import { switchOrbitControls, toggle } from "./utils/thirdPersonCam";
import { stageLights } from "./utils/stageLights";
import { addHDRI } from "./utils/hdri";
import {
  useHeadLights,
  useHeadLightsToChassisSync,
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
  addVehicle,
  chassisBody,
  chassisModel,
  mixer,
  vehicle,
} from "./vehicle";

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

addHDRI(mainSCENE);

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

// adding a simple vehicle here
addVehicle(mainSCENE, mainWORLD);

// for bringing the car back to position (0,0,0) in case it crashes somewhere
// creating this here cause mainCAMERA needs instant reset or it gets glitchy
function resetVehicle() {
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
carFolder.add({ resetVehicle }, "resetVehicle").name("Reset Vehicle");

// for syncing threejs and cannon objects
function threeAndCannonSync() {
  mainWORLD.fixedStep();
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
