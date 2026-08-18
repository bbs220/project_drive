import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { respawnValues } from "../constants/otherConstants";
import type { TypeControlState } from "../stores/useVehicleStore";

// strictly type the incoming parameters directly from the global store
type typeRespawnVehicleFunc = {
  vehicleType: TypeControlState;
  vehicleBody: RapierRigidBody;
  mode: "drive" | "garage";
};

// initialize reusable objects outside the function to prevent garbage collection stutters
const spawnEuler = new THREE.Euler();
const spawnQuat = new THREE.Quaternion();

// helper function to completely reset vehicle physics state using centralized constants
const respawnVehicle = ({
  vehicleType,
  vehicleBody,
  mode = "drive",
}: typeRespawnVehicleFunc) => {
  // extract the target respawn data by chaining through the requested mode
  const spawnData = respawnValues[mode][vehicleType];

  // fatal error failsafe just in case a bad vehicle type gets passed
  if (!spawnData) return;

  // extract current position to prevent teleporting across the infinite map
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
