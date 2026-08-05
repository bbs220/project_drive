import { RigidBody } from "@react-three/rapier";
import { forwardRef } from "react";
import * as THREE from "three";
import { useVehiclePlaneCreator } from "../../hooks/useVehiclePlaneCreator";
import { vehicleRespawnPos } from "../../constants/otherConstants";

const VehiclePlane = forwardRef<THREE.Mesh>((_props, ref) => {
  useVehiclePlaneCreator();

  return (
    <RigidBody
      colliders={false}
      friction={0}
      position={vehicleRespawnPos.plane}
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
