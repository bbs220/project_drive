import * as THREE from "three";
import { pane } from "../helpers/visualHelpers";

// parameters for the 4 point lights
const lightsParams = {
  y: 5, // y position of the spotlight origin
  x: 3, // x position of the spotlight origin
  z: 3, // z position of the spotlight origin
  intensity: 30, // total intensity dont take this above 1000
  enabled: false, // loads off by default
  helpers: false, // loads off by default
  color: "#ffffff", // color of the 4 lights
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
export const lightPositions = [
  { x: lightsParams.x, y: lightsParams.y, z: lightsParams.z },
  { x: -lightsParams.x, y: lightsParams.y, z: -lightsParams.z },
  { x: -lightsParams.x, y: lightsParams.y, z: lightsParams.z },
  { x: lightsParams.x, y: lightsParams.y, z: -lightsParams.z },
];

// setting up all point lights from a array
export let lightsAndHelpers: [THREE.PointLight, THREE.PointLightHelper][] = [];

export function stageLights(scene: THREE.Scene) {
  for (let i = 0; i < lightPositions.length; i++) {
    const position = new THREE.Vector3(
      lightPositions[i].x,
      lightPositions[i].y,
      lightPositions[i].z
    );
    const [light, helper] = createPointLightAndHelper(
      lightsParams.color,
      lightsParams.intensity,
      position
    );
    lightsAndHelpers.push([light, helper]);
    scene.add(light, helper);
  }
}

// gui stuff
const lightsFolder = pane.addFolder({
  title: "💡 Stage Lights",
  expanded: false,
});

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
  .addBinding(lightsParams, "enabled", {
    label: "Enabled",
  })
  .on("change", toggleLightVisibility);

lightsFolder
  .addBinding(lightsParams, "helpers", {
    label: "Helpers",
  })
  .on("change", toggleLightVisibility);

lightsFolder
  .addBinding(lightsParams, "color", {
    label: "Color",
    view: "color",
  })
  .on("change", () => {
    lightsAndHelpers.forEach(([light]) => {
      light.color.set(lightsParams.color);
    });
  });

lightsFolder
  .addBinding(lightsParams, "intensity", {
    label: "Intensity",
    min: 0,
    max: 100,
    step: 1,
  })
  .on("change", updateLightIntensities);

lightsFolder
  .addBinding(lightsParams, "y", {
    label: "Y Position",
    min: 0,
    max: 10,
    step: 1,
  })
  .on("change", updateLightPositions);
