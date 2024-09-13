import * as THREE from "three";
import * as CANNON from "cannon-es";
import { groundCollistonMaterial } from "../ground";
import { gui } from "../helpers/visualHelpers";
import { movementControls, mvmtToggle } from "./movementControls";

const capsuleParams = {
  radius: 0.5,
  length: 1,
  capSegment: 12,
  radialSegment: 12,
  color: "#ffffff",
};

const visor = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.3, 0.1),
  new THREE.MeshStandardMaterial({
    color: "#00ffff",
    wireframe: false,
    flatShading: true,
  })
);
visor.position.set(0, 0.5, -0.55);
visor.castShadow = true;

// temp capsule body for character
const geometry = new THREE.CapsuleGeometry(
  capsuleParams.radius,
  capsuleParams.length,
  capsuleParams.capSegment,
  capsuleParams.radialSegment
);
const material = new THREE.MeshStandardMaterial({
  color: capsuleParams.color,
  wireframe: false,
});
// need this exported for sync
export const characterMesh = new THREE.Mesh(geometry, material);
characterMesh.add(visor);
characterMesh.castShadow = true;

// self explainable
const characterCollisionMaterial = new CANNON.Material("character");

// specific interactions between character and ground
const character_ground = new CANNON.ContactMaterial(
  characterCollisionMaterial,
  groundCollistonMaterial,
  {
    friction: 0,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  }
);

// temp physics body for character
// this is very odd since cannon does not provide a capsule
// so two spheres it is
// with distance of y position +0.5 and -0.5 between them is 1 as same as capsule length
const characterShape = new CANNON.Sphere(0.5); // just a tiny bit higher than radius of capsule cause good practice?
// also needed for sync so export
export const characterBody = new CANNON.Body({
  mass: 10,
  material: characterCollisionMaterial,
});
characterBody.addShape(characterShape, new CANNON.Vec3(0, 0.5, 0));
characterBody.addShape(characterShape, new CANNON.Vec3(0, -0.5, 0));
characterBody.position.set(0, 2, 0);
characterBody.linearDamping = 0.95;
characterBody.angularFactor.set(0, 1, 0); // prevents rotation X,Z axis

// just throw it in main.ts to add it
// remember to sync it in there
export function addCharacter(scene: THREE.Scene, world: CANNON.World) {
  scene.add(characterMesh);

  world.addBody(characterBody);

  world.addContactMaterial(character_ground);

  const chFolder = gui.addFolder("Character");
  chFolder.close();
  chFolder.add(material, "wireframe").name("Wireframe");
  chFolder
    .add(mvmtToggle, "value")
    .onChange(() => movementControls())
    .name("Character Controls");
  chFolder.add({ resetCharacter }, "resetCharacter").name("Reset Character");

  function resetCharacter() {
    characterBody.position.set(0, 2, 0);
    characterBody.velocity.set(0, 0, 0);
    characterBody.angularFactor.set(0, 1, 0);
    characterBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
  }
}
