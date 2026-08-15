import * as THREE from "three";

// helper to safely pass three js vectors to rapier without triggering rust memory aliasing
export const asVec = (vec: THREE.Vector3) => ({
  x: vec.x,
  y: vec.y,
  z: vec.z,
});
