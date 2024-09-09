import * as THREE from "three";
import * as CANNON from "cannon-es";
import { progressManager } from "../ui/loadingScreenUI";
import { allImageTextures } from "../utils/assetPaths";

// for how many repeats of the texture within the plane
const tilingValue = 16;

// this is max value dont go above 16
const anisotrophicValue = 16;

// for the base ground something to drive on
const groundParams = {
  width: 100, // width of the ground
  height: 100, // height of the ground
  wSegment: 1, // detail in width 1 minimum for better performance
  hSegment: 1, // detail in height 1 minimum for better performance
};

// a tiled texture for a some reference
const blueprintTexture = new THREE.TextureLoader(progressManager).load(
  allImageTextures.blueSquare,
  (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(tilingValue, tilingValue);
    texture.anisotropy = anisotrophicValue;
  }
);

// threejs plane as a ground
export function useGroundMesh() {
  const groundShape = new THREE.PlaneGeometry(
    groundParams.width,
    groundParams.height,
    groundParams.wSegment,
    groundParams.hSegment
  );
  const groundMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    map: blueprintTexture,
  });
  const ground = new THREE.Mesh(groundShape, groundMaterial);
  ground.receiveShadow = true;
  return ground;
}

// physics ground for the threejs plane
// infinite scale by default
export function useGroundPhysicsBody() {
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    material: groundCollistonMaterial,
  });
  const tempPhysicsGroundShape = new CANNON.Plane();
  groundBody.addShape(tempPhysicsGroundShape);
  groundBody.position.set(0, 0, 0);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  return groundBody;
}

// for to be used in creating solid collisions between ground and any other body above it
export const groundCollistonMaterial = new CANNON.Material("ground");
