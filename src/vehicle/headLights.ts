import * as THREE from "three";
import { type Scene } from "three";
import { carFolder } from ".";

const headlightParams = {
  enabled: false,
  helpers: false,
  intensity: 0,
  distance: 10,
  angle: 0.5,
  penumbra: 0.5,
  color: "#ffffff",
  x: 0.6,
  y: 0,
  z: 1.8,
  internalDistance: 10,
  downLookAngle: 0,
};

// left side first
const leftHeadLight = new THREE.SpotLight(
  headlightParams.color,
  headlightParams.intensity,
  headlightParams.distance,
  headlightParams.angle,
  headlightParams.penumbra
);

leftHeadLight.castShadow = true;
leftHeadLight.position.set(
  -headlightParams.z,
  headlightParams.y,
  -headlightParams.x
);

const leftHeadLightHelper = new THREE.SpotLightHelper(
  leftHeadLight,
  headlightParams.color
);
leftHeadLightHelper.visible = headlightParams.helpers;

const leftTarget = new THREE.Object3D();
leftTarget.position.set(
  headlightParams.z - headlightParams.internalDistance,
  headlightParams.y - headlightParams.downLookAngle,
  -headlightParams.x
);
leftHeadLight.target = leftTarget;

// right side second
const rightHeadLight = new THREE.SpotLight(
  headlightParams.color,
  headlightParams.intensity,
  headlightParams.distance,
  headlightParams.angle,
  headlightParams.penumbra
);

rightHeadLight.castShadow = true;
rightHeadLight.position.set(
  -headlightParams.z,
  headlightParams.y,
  headlightParams.x
);

const rightHeadLightHelper = new THREE.SpotLightHelper(
  rightHeadLight,
  headlightParams.color
);
rightHeadLightHelper.visible = headlightParams.helpers;

const rightTarget = new THREE.Object3D();
rightTarget.position.set(
  headlightParams.z - headlightParams.internalDistance,
  headlightParams.y - headlightParams.downLookAngle,
  headlightParams.x
);
rightHeadLight.target = rightTarget;

export function useHeadLights(scene: Scene) {
  scene.add(
    leftHeadLight,
    rightHeadLight,
    leftHeadLightHelper,
    rightHeadLightHelper
  );

  const headlightFolder = carFolder.addFolder({
    title: "💡 Headlights",
    expanded: false,
  });

  function updateBothLights() {
    leftHeadLight.intensity = headlightParams.enabled
      ? headlightParams.intensity
      : 0;
    rightHeadLight.intensity = headlightParams.enabled
      ? headlightParams.intensity
      : 0;
    leftHeadLight.distance = headlightParams.distance;
    rightHeadLight.distance = headlightParams.distance;
    leftHeadLight.angle = headlightParams.angle;
    rightHeadLight.angle = headlightParams.angle;
    leftHeadLight.penumbra = headlightParams.penumbra;
    rightHeadLight.penumbra = headlightParams.penumbra;
    leftHeadLightHelper.visible = headlightParams.helpers;
    rightHeadLightHelper.visible = headlightParams.helpers;
  }

  headlightFolder
    .addBinding(headlightParams, "enabled", {
      label: "Enable",
    })
    .on("change", updateBothLights);

  headlightFolder
    .addBinding(headlightParams, "helpers", {
      label: "Show Helpers",
    })
    .on("change", updateBothLights);

  headlightFolder
    .addBinding(headlightParams, "intensity", {
      label: "Intensity",
      min: 0,
      max: 100,
      step: 1,
    })
    .on("change", updateBothLights);

  headlightFolder
    .addBinding(headlightParams, "distance", {
      label: "Distance",
      min: 1,
      max: 100,
      step: 0.1,
    })
    .on("change", updateBothLights);

  headlightFolder
    .addBinding(headlightParams, "angle", {
      label: "Cone Angle",
      min: 0,
      max: 1.5,
      step: 0.01,
    })
    .on("change", updateBothLights);

  headlightFolder
    .addBinding(headlightParams, "penumbra", {
      label: "Penumbra",
      min: 0,
      max: 1,
      step: 0.1,
    })
    .on("change", updateBothLights);
}

// for syncing the headlights to chassis
export function syncHeadlights(model: THREE.Object3D) {
  if (model) {
    model.add(leftTarget, rightTarget, leftHeadLight, rightHeadLight);
    leftHeadLightHelper.update();
    rightHeadLightHelper.update();
  }
}
