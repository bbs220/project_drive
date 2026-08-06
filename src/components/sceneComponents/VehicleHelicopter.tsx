import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useVehicleHelicopterCreator } from "../../hooks/useVehicleHelicopterCreator";
import {
  vehicleRespawnLimit,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useFrame } from "@react-three/fiber";
import respawnVehicle from "../../utils/respawnVehicle";

// import rounded box for squircle aesthetic
import { RoundedBox } from "@react-three/drei";

const VehicleHelicopter = forwardRef<THREE.Mesh>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // refs for targeting rotor assemblies
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

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
      colliders={false}
      friction={0}
      position={vehicleRespawnPos.helicopter}
      type={"dynamic"}
      canSleep={false}
    >
      {/* heavy mass for main cabin squircle */}
      <CuboidCollider args={[1, 1, 1.5]} position={[0, 0, 0]} mass={500} />

      {/* light mass for tail boom */}
      <CuboidCollider
        args={[0.2, 0.2, 1.5]}
        position={[0, 0.5, 2.5]}
        mass={1}
      />

      {/* colliders for the left and right landing skids */}
      <CuboidCollider args={[0.1, 0.1, 1.75]} position={[-1, -1.2, 0]} />
      <CuboidCollider args={[0.1, 0.1, 1.75]} position={[1, -1.2, 0]} />

      {/* main chassis group attached to forward ref */}
      <group ref={ref}>
        {/* main cabin using rounded box for squircle look */}
        <RoundedBox args={[2, 2, 3]} radius={0.5} smoothness={4}>
          <meshStandardMaterial color={"red"} />
        </RoundedBox>

        {/* tail boom */}
        <mesh position={[0, 0.5, 2.5]}>
          <boxGeometry args={[0.4, 0.4, 3]} />
          <meshStandardMaterial color={"darkred"} />
        </mesh>

        {/* landing skids */}
        <mesh position={[-1, -1.2, 0]}>
          <boxGeometry args={[0.2, 0.2, 3.5]} />
          <meshStandardMaterial color={"gray"} />
        </mesh>
        <mesh position={[1, -1.2, 0]}>
          <boxGeometry args={[0.2, 0.2, 3.5]} />
          <meshStandardMaterial color={"gray"} />
        </mesh>

        {/* main rotor assembly */}
        <group ref={mainRotorRef} position={[0, 1.2, 0]}>
          {/* rotor mast */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
          {/* main blades */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.2, 0.05, 8]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
          <mesh position={[0, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.2, 0.05, 8]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
        </group>

        {/* tail rotor assembly */}
        <group ref={tailRotorRef} position={[0.3, 0.5, 3.8]}>
          {/* tail blades */}
          <mesh>
            <boxGeometry args={[0.05, 1.2, 0.2]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.05, 1.2, 0.2]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
});

// assign display name for react devtools compatibility
VehicleHelicopter.displayName = "VehicleHelicopter";

export default VehicleHelicopter;
