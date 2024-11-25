import * as THREE from "three";
import { usePhysics } from "./physics";
import { initPhysicsDebugger, physicsDebug } from "./physics/debugger";
import { gui, stats } from "./helpers/visualHelpers";
import { useCamera, use3dRenderer, useScene } from "./include/coreComponents";
import { speedCalulation } from "./ui/vehicleUI";
import { useGroundMesh, useGroundPhysicsBody } from "./ground";
import { use2dRenderer } from "./include/otherRenderer";
import { lockOnToggle, switchOrbitControls } from "./utils/thirdPersonCamOrbit";
import { stageLights } from "./utils/stageLights";
import { addHDRI } from "./utils/hdri";
import { syncHeadlights } from "./vehicle/headLights";
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
  chassisMesh,
  mixer,
  vehicle,
} from "./vehicle";
import { addCharacter, characterBody, characterMesh } from "./character";
import { buildTerrain } from "./ground/terrain";

// THIS WHOLE FILE IS JUST FOR MAIN SYNC FUNCTION CALLS AND STUFF

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
// off by default
stageLights(mainSCENE);

// adds a nice lookin hdr background
// no shadows though
addHDRI(mainSCENE);

// initiating the physics world
// comes with a fixedstep function to actively "see" the interactions happening in the 3d world
// use it in main recursive function
const mainWORLD = usePhysics();

// initializing debugger to see the invisible physics world collisions
initPhysicsDebugger(mainSCENE, mainWORLD);

// creating a finite ground in visible mesh
const groundMesh = useGroundMesh();
mainSCENE.add(groundMesh);

// creating a infinite ground in invisible physics world
const groundBody = useGroundPhysicsBody();
mainWORLD.addBody(groundBody);

// quick controls for common needs
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

// adding character here
// probably should add this before vehicle but whatever
addCharacter(mainSCENE, mainWORLD);

buildTerrain();

// need to call the export function once outside the recursive animate function
// and the proceeding function inside the animate to constantly look at the moving object
const syncOrbitLock = switchOrbitControls(mainCAMERA, main3D_RENDERER);

// for easily change follow camera status
const lockFolder = gui.addFolder("Camera");
lockFolder.close();
lockFolder.add(lockOnToggle, "value").name("Target Lock");
const lockOnTarget = { target: chassisMesh };
lockFolder
  .add(lockOnTarget, "target", { chassisMesh, characterMesh })
  .name("Target");

// for syncing threejs and cannon objects
function threeAndCannonSync() {
  // main sync function
  // dont change or tie the physics timer to fps
  // this is independent from the framerate of the scene
  mainWORLD.fixedStep();

  // for the vehicle
  // does burnout has good suspensions
  // and kinda realistic physics
  // rear wheel drive
  if (chassisMesh) {
    syncHeadlights(chassisMesh);
    chassisMesh.position.copy(chassisBody.position);
    chassisMesh.quaternion.copy(chassisBody.quaternion);
  }

  // getting the speed in kmph
  if (vehicle) {
    speedCalulation(vehicle);
  }

  // playable character sync
  // probably a third person controls
  if (characterMesh) {
    characterMesh.position.copy(characterBody.position);
    characterMesh.quaternion.copy(characterBody.quaternion);
  }

  // base ground sync
  // its really basic for now
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

  const deltaTime = debugClock.getDelta();

  if (physicsDebug) {
    physicsDebug.update();
  }

  if (mixer) {
    mixer.update(deltaTime);
  }

  if (lockOnTarget.target) {
    syncOrbitLock(characterMesh);
  } else {
    syncOrbitLock(chassisMesh);
  }
}
animate();
