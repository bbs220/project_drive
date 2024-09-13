import * as THREE from "three";
import * as CANNON from "cannon-es";
import { progressManager } from "../ui/loadingScreenUI";
import { allImageTextures } from "../utils/assetPaths";

// for how many repeats of the texture within the plane
const tilingValue = 16;

// this is max value dont go above 16
const anisotrophicValue = 16;

// for the base ground something to drive on
const params = {
  width: 200, // width of the ground
  height: 200, // height of the ground
  depth: 0.5, // dont push this above 1
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
  const groundShape = new THREE.BoxGeometry(
    params.width,
    params.height,
    params.depth,
    params.wSegment,
    params.hSegment
  );
  const groundMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    map: blueprintTexture,
  });
  const ground = new THREE.Mesh(groundShape, groundMaterial);
  ground.receiveShadow = true;
  return ground;
}

// physics ground for the threejs plane?
// finite scale by default
export function useGroundPhysicsBody() {
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    material: groundCollistonMaterial,
  });
  // always remember that cannon has a half rule for measurements with threejs geometries
  // eg. if threejs box is 1,1,1 then cannon box will be 0.5,0.5,0.5
  // dont ever forget this since this does not give a proper error
  // debugging will be nightmare
  const tempPhysicsGroundShape = new CANNON.Box(
    new CANNON.Vec3(params.width / 2, params.height / 2, params.depth / 2)
  );
  groundBody.addShape(tempPhysicsGroundShape);
  groundBody.position.set(0, 0, 0);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  return groundBody;
}

// for to be used in creating solid collisions between ground and any other body above it
export const groundCollistonMaterial = new CANNON.Material("ground");
