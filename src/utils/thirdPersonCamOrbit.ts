import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  type Object3D,
  type PerspectiveCamera,
  type WebGLRenderer,
} from "three";

// boolean to switch between two viewers
// this needs to be a object for use in gui
export const lockOnToggle = { value: false };

export function switchOrbitControls(
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
) {
  // lock on to position(0,0,0) mostly for debugging entire scene
  const debugViewOrbitControls = new OrbitControls(camera, renderer.domElement);
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
    camera,
    renderer.domElement
  );
  // to enable follow cam and disable debug view
  function followMesh(model: Object3D) {
    if (model) {
      followMeshOrbitControls.enabled = true;
      followMeshOrbitControls.target = model.position;
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

  // functions to switch between two orbit controls
  // adding the model here is ESSENIAL or the the camera wont have a object to pivot around
  // a closure isnt what i wanted but this keeps performance fast
  return function mainSwitch(model: Object3D) {
    if (lockOnToggle.value === true) {
      followMesh(model);
    } else {
      debugView();
    }
  };
}
