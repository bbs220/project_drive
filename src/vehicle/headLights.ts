import * as THREE from "three";
import { type Scene } from "three";
import { gui } from "../helpers/visualHelpers";

// all the different headlights parameters
const valueForHeadLights = {
  x: 0.6, // adjustable to liking dont go above 10
  y: 0, // keep this always zero
  z: 1.8, // relative to chassis model
  internalDistance: 10, // distance between the target of the headlights and the headlight origin points
  color: "#ffffff", // color of headlights
  distance: 10, // 0 is infinity other int number is finite
  penumbra: 0.5, // set ONLY between 0 and 1
  coneAngle: 0.5, // DONT go above 1.5
  downLookAngle: 0, // how down the headlight cones should be tilted ONLY go above 0 , DONT go below 0 thats into negative values
  intensity: 0, // intensity of the lights also setting it to 0 turns off the spotlight
};

// left side first
const leftHeadLight = new THREE.SpotLight(
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

const leftHeadLightHelper = new THREE.SpotLightHelper(
  leftHeadLight,
  valueForHeadLights.color
);

leftHeadLightHelper.visible = false;

const leftTarget = new THREE.Object3D();

leftTarget.position.set(
  valueForHeadLights.z - valueForHeadLights.internalDistance,
  valueForHeadLights.y - valueForHeadLights.downLookAngle,
  -valueForHeadLights.x
);

leftHeadLight.target = leftTarget;

// right side second
const rightHeadLight = new THREE.SpotLight(
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

const rightHeadLightHelper = new THREE.SpotLightHelper(
  rightHeadLight,
  valueForHeadLights.color
);

rightHeadLightHelper.visible = false;

const rightTarget = new THREE.Object3D();

rightTarget.position.set(
  valueForHeadLights.z - valueForHeadLights.internalDistance,
  valueForHeadLights.y - valueForHeadLights.downLookAngle,
  valueForHeadLights.x
);

rightHeadLight.target = rightTarget;

// creates headlights
export function useHeadLights(scene: Scene) {
  scene.add(
    leftHeadLight,
    rightHeadLight,
    leftHeadLightHelper,
    rightHeadLightHelper
  );

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
export function syncHeadlights(model: THREE.Object3D) {
  if (model) {
    model.add(leftTarget, rightTarget, leftHeadLight, rightHeadLight);
    leftHeadLightHelper.update();
    rightHeadLightHelper.update();
  }
}
