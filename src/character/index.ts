import * as THREE from "three";
import * as CANNON from "cannon-es";

const capsuleParams = {
  radius: 0.5,
  length: 1,
  capSegment: 12,
  radialSegment: 12,
};

// temp capsule body for character
const geometry = new THREE.CapsuleGeometry(
  capsuleParams.radius,
  capsuleParams.length,
  capsuleParams.capSegment,
  capsuleParams.radialSegment
);
const material = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  wireframe: false,
  flatShading: true,
});
// need this exported for sync
export const characterMesh = new THREE.Mesh(geometry, material);
characterMesh.castShadow = true;

// temp physics body for character
// this is very odd since cannon does not provide a capsule
// so two spheres it is
// with distance of y position +0.5 and -0.5 between them is 1 as same as capsule length
const characterShape = new CANNON.Sphere(0.5); // just a tiny bit higher than radius of capsule cause good practice?
// also needed for sync so export
export const characterBody = new CANNON.Body({ mass: 10 });
characterBody.addShape(characterShape, new CANNON.Vec3(0, 0.5, 0));
characterBody.addShape(characterShape, new CANNON.Vec3(0, -0.5, 0));
characterBody.position.set(0, 10, 0);
characterBody.linearDamping = 0.95;
characterBody.angularFactor.set(0, 1, 0); // prevents rotation X,Z axis

// just throw it in main.ts to add it
// remember to sync it in there
export function addCharacter(scene: THREE.Scene, world: CANNON.World) {
  scene.add(characterMesh);

  world.addBody(characterBody);
}
