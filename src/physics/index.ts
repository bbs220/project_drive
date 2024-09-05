import * as CANNON from "cannon-es";

// creates a omnidirectional infinite physics world
export function usePhysics() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.8, 0),
    allowSleep: true,
  });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.defaultContactMaterial.friction = 0;
  return world;
}
