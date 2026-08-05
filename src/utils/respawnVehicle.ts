import type { RapierRigidBody } from "@react-three/rapier";

type typeRespawnVehicleFunc = {
  vehicleBody: RapierRigidBody;
  x: number;
  y: number;
  z: number;
};

// helper function to completely reset vehicle physics state
const respawnVehicle = ({ vehicleBody, x, y, z }: typeRespawnVehicleFunc) => {
  // reset position to origin height
  vehicleBody.setTranslation({ x: x, y: y, z: z }, true);

  // reset rotation to default identity quaternion
  vehicleBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);

  // zero out linear momentum
  vehicleBody.setLinvel({ x: 0, y: 0, z: 0 }, true);

  // zero out angular momentum
  vehicleBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
};

export default respawnVehicle;
