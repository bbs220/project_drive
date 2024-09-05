import * as THREE from "three";
import * as CANNON from "cannon-es";
import {
  anisotrophicValue,
  groundParams,
  tilingValue,
} from "../constants/constants";
import { progressManager } from "../ui/loadingScreenUI";
import { allImageTextures } from "../utils/assetPaths";

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
