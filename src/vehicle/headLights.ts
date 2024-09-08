import * as THREE from "three";
import { type Scene } from "three";
import { valueForHeadLights } from "../constants/constants";
import { gui } from "../helpers/visualHelpers";

// to use in the gui
let leftTarget: THREE.Object3D;
let rightTarget: THREE.Object3D;
let leftHeadLight: THREE.SpotLight;
let leftHeadLightHelper: THREE.SpotLightHelper;
let rightHeadLight: THREE.SpotLight;
let rightHeadLightHelper: THREE.SpotLightHelper;

const headLightFolder = gui.addFolder("Headlights");
headLightFolder.close();
// intensity 0 is off max 100
// helper disabled by default
// penumbra 0 to 1
// angle 0 to 1.5
// distance 0 to 100

// creates headlights
export function useHeadLights(scene: Scene) {
  // left side first
  leftHeadLight = new THREE.SpotLight(
    valueForHeadLights.color,
    valueForHeadLights.intensity,
    valueForHeadLights.distance,
    valueForHeadLights.coneAngle,
    valueForHeadLights.penumbra
  );

  leftHeadLight.castShadow = true;

  leftHeadLight.position.set(
    -valueForHeadLights.z,
    valueForHeadLights.y,
    -valueForHeadLights.x
  );

  leftHeadLightHelper = new THREE.SpotLightHelper(
    leftHeadLight,
    valueForHeadLights.color
  );

  leftHeadLightHelper.visible = false;

  leftTarget = new THREE.Object3D();

  leftTarget.position.set(
    valueForHeadLights.z - valueForHeadLights.internalDistance,
    valueForHeadLights.y - valueForHeadLights.downLookAngle,
    -valueForHeadLights.x
  );

  leftHeadLight.target = leftTarget;

  // right side second
  rightHeadLight = new THREE.SpotLight(
    valueForHeadLights.color,
    valueForHeadLights.intensity,
    valueForHeadLights.distance,
    valueForHeadLights.coneAngle,
    valueForHeadLights.penumbra
  );

  rightHeadLight.castShadow = true;

  rightHeadLight.position.set(
    -valueForHeadLights.z,
    valueForHeadLights.y,
    valueForHeadLights.x
  );

  rightHeadLightHelper = new THREE.SpotLightHelper(
    rightHeadLight,
    valueForHeadLights.color
  );

  rightHeadLightHelper.visible = false;

  rightTarget = new THREE.Object3D();

  rightTarget.position.set(
    valueForHeadLights.z - valueForHeadLights.internalDistance,
    valueForHeadLights.y - valueForHeadLights.downLookAngle,
    valueForHeadLights.x
  );

  rightHeadLight.target = rightTarget;

  scene.add(
    leftHeadLight,
    rightHeadLight,
    leftHeadLightHelper,
    rightHeadLightHelper
  );

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
}

// hacky code but it gets the job done
function updateBothSpotlights(property: string, value: number) {
  (leftHeadLight as any)[property] = value;
  (rightHeadLight as any)[property] = value;
}
// same hacky stuff
function updateHelperVisibility(property: string, value: boolean) {
  (leftHeadLightHelper as any)[property] = value;
  (rightHeadLightHelper as any)[property] = value;
}

// for syncing the headlights to chassis basically use this in main recursive animate function
export function useHeadLightsToChassisSync(model: THREE.Object3D) {
  if (model) {
    model.add(leftTarget, rightTarget, leftHeadLight, rightHeadLight);
    leftHeadLightHelper.update();
    rightHeadLightHelper.update();
  }
}
