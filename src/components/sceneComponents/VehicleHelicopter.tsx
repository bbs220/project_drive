import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useVehicleHelicopterCreator } from "../../hooks/useVehicleHelicopterCreator";
import {
  vehicleRespawnLimit,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useFrame } from "@react-three/fiber";
import respawnVehicle from "../../utils/respawnVehicle";

const VehicleHelicopter = forwardRef<THREE.Mesh>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  useVehicleHelicopterCreator();

  // handle respawn logic
  useFrame(() => {
    // exit early if chassis is missing
    if (!chassisRef.current) return;

    // check if vehicle has fallen below bounds
    if (chassisRef.current.translation().y < vehicleRespawnLimit) {
      // trigger extracted respawn function
      respawnVehicle({
        vehicleBody: chassisRef.current,
        x: vehicleRespawnPos.helicopter[0],
        y: vehicleRespawnPos.helicopter[1],
        z: vehicleRespawnPos.helicopter[2],
      });
    }
  });

  return (
    <RigidBody
      ref={chassisRef}
      colliders={"cuboid"}
      friction={0}
      position={vehicleRespawnPos.helicopter}
      type={"dynamic"}
    >
      <group>
        <mesh ref={ref}>
          <sphereGeometry />
          <meshStandardMaterial color={"red"} />
        </mesh>
      </group>
    </RigidBody>
  );
});

VehicleHelicopter.displayName = "VehicleHelicopter";

export default VehicleHelicopter;
