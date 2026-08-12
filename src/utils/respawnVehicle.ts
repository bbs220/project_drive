import type { RapierRigidBody } from "@react-three/rapier";
import {
  vehicleRespawnPos,
  vehicleRespawnRot,
} from "../constants/otherConstants";

// strictly type the incoming parameters to match your store strings
type typeRespawnVehicleFunc = {
  vehicleType: "car" | "plane" | "helicopter";
  vehicleBody: RapierRigidBody;
};

// helper function to completely reset vehicle physics state using centralized constants
const respawnVehicle = ({
  vehicleType,
  vehicleBody,
}: typeRespawnVehicleFunc) => {
  // extract the target respawn position array
  const spawnPos = vehicleRespawnPos[vehicleType];

  // extract the target respawn quaternion
  const spawnRot = vehicleRespawnRot[vehicleType];

  // extract current position to prevent teleporting the player across the infinite map
  const currentPos = vehicleBody.translation();

  // reset position preserving world coordinates but snapping to the safe y height
  vehicleBody.setTranslation(
    { x: currentPos.x, y: spawnPos[1], z: currentPos.z },
    true,
  );

  // apply the specific vehicle rotation quaternion from constants
  vehicleBody.setRotation(spawnRot, true);

  // zero out linear momentum
  vehicleBody.setLinvel({ x: 0, y: 0, z: 0 }, true);

  // zero out angular momentum
  vehicleBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
};

export default respawnVehicle;
