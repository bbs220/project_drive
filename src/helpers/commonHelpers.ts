import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { xDiv, yDiv, zDiv } from "../ui/backgroundUI";

const tilingValue = 16;
// common wireframe grid
// not tied to phyics ground grid thats seperate
export function useGrid() {
  const grid = new THREE.GridHelper(
    tilingValue,
    tilingValue,
    "#ffff00",
    "#00ffff"
  );
  grid.position.set(0, 0.1, 0);
  grid.scale.setScalar(6.2);
  grid.visible = false;
  return grid;
}

// just some fill light to see materials with light bounce
export function useAmbientLight() {
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
  ambientLight.visible = false;
  return ambientLight;
}

// origin axis length the bigger the long the axis visualization stretches
const originAxisLength = 50;

// labels for the axis
export const xLabel = new CSS2DObject(xDiv);
export const yLabel = new CSS2DObject(yDiv);
export const zLabel = new CSS2DObject(zDiv);
// origin axes thats at position (0,0,0) fixed for orientation
export function useOriginAxes() {
  const originAxes = new THREE.AxesHelper(originAxisLength);
  originAxes.visible = false;

  xLabel.visible = false;
  xLabel.position.set(originAxisLength, 0, 0);

  yLabel.visible = false;
  yLabel.position.set(0, originAxisLength, 0);

  zLabel.visible = false;
  zLabel.position.set(0, 0, originAxisLength);

  return originAxes;
}
