import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { vehicleRespawnValues } from "../constants/otherConstants";

// strictly type the incoming parameters to match your store strings
type typeRespawnVehicleFunc = {
  vehicleType: "car" | "plane" | "helicopter";
  vehicleBody: RapierRigidBody;
};

// initialize reusable objects outside the function to prevent garbage collection stutters
const spawnEuler = new THREE.Euler();
const spawnQuat = new THREE.Quaternion();

// helper function to completely reset vehicle physics state using centralized constants
const respawnVehicle = ({
  vehicleType,
  vehicleBody,
}: typeRespawnVehicleFunc) => {
  // extract the target respawn data from the unified object
  const spawnData = vehicleRespawnValues[vehicleType];

  // extract current position to prevent teleporting the player across the infinite map
  const currentPos = vehicleBody.translation();

  // reset position preserving world coordinates but snapping to the safe y height
  vehicleBody.setTranslation(
    { x: currentPos.x, y: spawnData.position[1], z: currentPos.z },
    true,
  );

  // convert the easy to read euler array into a quaternion for the physics engine
  spawnEuler.set(
    spawnData.rotation[0],
    spawnData.rotation[1],
    spawnData.rotation[2],
    "YXZ",
  );
  spawnQuat.setFromEuler(spawnEuler);

  // apply the converted quaternion using a flat object to prevent rust aliasing errors
  vehicleBody.setRotation(
    { x: spawnQuat.x, y: spawnQuat.y, z: spawnQuat.z, w: spawnQuat.w },
    true,
  );

  // zero out linear momentum
  vehicleBody.setLinvel({ x: 0, y: 0, z: 0 }, true);

  // zero out angular momentum
  vehicleBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
};

export default respawnVehicle;
