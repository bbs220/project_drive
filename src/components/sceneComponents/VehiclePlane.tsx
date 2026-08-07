import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useVehiclePlaneCreator } from "../../hooks/useVehiclePlaneCreator";
import {
  vehicleRespawnLimit,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useFrame } from "@react-three/fiber";
import respawnVehicle from "../../utils/respawnVehicle";

// main plane component with built in respawn
const VehiclePlane = forwardRef<THREE.Group>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // initialize empty plane physics controller
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
    <group>
      <RigidBody
        ref={chassisRef}
        colliders={false}
        friction={0}
        position={vehicleRespawnPos.plane}
        canSleep={false}
      >
        {/* manual collider for main fuselage */}
        <CuboidCollider args={[0.6, 0.6, 2.1]} position={[0, 0, 0]} />

        {/* manual collider for wings */}
        <CuboidCollider args={[2.5, 0.1, 0.6]} position={[0, -0.3, 0.2]} />

        {/* manual collider encompassing all landing gear wheels to prevent ground clipping */}
        <CuboidCollider args={[0.6, 0.3, 1.0]} position={[0, -0.9, -0.35]} />

        {/* group to hold visual meshes and camera target ref */}
        <group ref={ref}>
          {/* create main fuselage using a stretched capsule */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.6, 2.8, 4, 16]} />
            <meshStandardMaterial color={"green"} />
          </mesh>

          {/* create dark cockpit window at the front */}
          <mesh position={[0, 0.4, -0.8]}>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshStandardMaterial color={"black"} />
          </mesh>

          {/* create single low wing spanning across both sides */}
          <mesh position={[0, -0.3, 0.2]}>
            <boxGeometry args={[5, 0.1, 1.2]} />
            <meshStandardMaterial color={"gray"} />
          </mesh>

          {/* create signature top mounted turbine engine */}
          <mesh position={[0, 0.7, 1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 1.2, 16]} />
            <meshStandardMaterial color={"darkslategray"} />
          </mesh>

          {/* create left v tail stabilizer angled outward */}
          <mesh position={[-0.5, 0.5, 2]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 1.5, 0.8]} />
            <meshStandardMaterial color={"gray"} />
          </mesh>

          {/* create right v tail stabilizer angled outward */}
          <mesh position={[0.5, 0.5, 2]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.1, 1.5, 0.8]} />
            <meshStandardMaterial color={"gray"} />
          </mesh>

          {/* create front landing gear strut and wheel */}
          <group position={[0, -0.6, -1.2]}>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.8]} />
              <meshStandardMaterial color={"gray"} />
            </mesh>
            <mesh position={[0, -0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1]} />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>

          {/* create left rear landing gear */}
          <group position={[-0.4, -0.6, 0.5]}>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.8]} />
              <meshStandardMaterial color={"gray"} />
            </mesh>
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.15]} />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>

          {/* create right rear landing gear */}
          <group position={[0.4, -0.6, 0.5]}>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.8]} />
              <meshStandardMaterial color={"gray"} />
            </mesh>
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.15]} />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>
        </group>
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools
VehiclePlane.displayName = "VehiclePlane";

export default VehiclePlane;
