import * as CANNON from "cannon-es";

// infinite world boundary so the player dont keep falling to their death infinitely
export function worldBoundary(world: CANNON.World) {
  const wBoundaryCollistonMaterial = new CANNON.Material("boundary");

  // physics only plane for the threejs plane
  const worldBoundaryBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    material: wBoundaryCollistonMaterial,
  });

  const worldBoundaryShape = new CANNON.Plane();
  worldBoundaryBody.addShape(worldBoundaryShape);

  // keep it way below the actual ground level that is y=0
  worldBoundaryBody.position.set(0, -30, 0);
  worldBoundaryBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(worldBoundaryBody);
}
