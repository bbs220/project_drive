import { RigidBody } from "@react-three/rapier";
import { forwardRef } from "react";
import * as THREE from "three";
import { useVehicleHelicopterCreator } from "../../hooks/useVehicleHelicopterCreator";
import { vehicleRespawnPos } from "../../constants/otherConstants";

const VehicleHelicopter = forwardRef<THREE.Mesh>((_props, ref) => {
  useVehicleHelicopterCreator();
  return (
    <RigidBody
      colliders={false}
      friction={0}
      position={vehicleRespawnPos.helicopter}
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
