import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useVehiclePlaneCreator } from "../../hooks/useVehiclePlaneCreator";
import {
  vehicleRespawnLimit,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useFrame } from "@react-three/fiber";
import respawnVehicle from "../../utils/respawnVehicle";

const VehiclePlane = forwardRef<THREE.Mesh>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  useVehiclePlaneCreator();

  // handle respawn logic
  useFrame(() => {
    // exit early if chassis is missing
    if (!chassisRef.current) return;

    // check if vehicle has fallen below bounds
    if (chassisRef.current.translation().y < vehicleRespawnLimit) {
      // trigger extracted respawn function
      respawnVehicle({
        vehicleBody: chassisRef.current,
        x: vehicleRespawnPos.plane[0],
        y: vehicleRespawnPos.plane[1],
        z: vehicleRespawnPos.plane[2],
      });
    }
  });

  return (
    <RigidBody
      ref={chassisRef}
      colliders={"cuboid"}
      friction={0}
      position={vehicleRespawnPos.plane}
      type={"dynamic"}
    >
      <group>
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry />
          <meshStandardMaterial color={"green"} />
        </mesh>
      </group>
    </RigidBody>
  );
});

VehiclePlane.displayName = "VehiclePlane";

export default VehiclePlane;
