import * as THREE from "three";
import { type Scene } from "three";
import { valueForHeadLights } from "../constants/constants";

// all exported due to use in the gui in main.ts
export let leftHeadLightHelper: THREE.SpotLightHelper,
  rightHeadLightHelper: THREE.SpotLightHelper,
  leftTarget: THREE.Object3D,
  rightTarget: THREE.Object3D,
  leftHeadLight: THREE.SpotLight,
  rightHeadLight: THREE.SpotLight;

// creates headlights
export function createHeadLights(scene: Scene) {
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
}

// for syncing the headlights to chassis basically use this in main recursive animate function
export function headLightsToCarBodySync(model: THREE.Object3D) {
  if (model) {
    model.add(leftTarget, rightTarget, leftHeadLight, rightHeadLight);
    leftHeadLightHelper.update();
    rightHeadLightHelper.update();
  }
}
