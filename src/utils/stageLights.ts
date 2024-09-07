import * as THREE from "three";
import { lightsParams } from "../constants/constants";
import { gui } from "../helpers/visualHelpers";

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
