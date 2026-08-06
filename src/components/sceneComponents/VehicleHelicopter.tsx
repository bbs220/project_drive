import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useVehicleHelicopterCreator } from "../../hooks/useVehicleHelicopterCreator";
import {
  vehicleHelicopterConstants,
  vehicleRespawnLimit,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useFrame } from "@react-three/fiber";
import respawnVehicle from "../../utils/respawnVehicle";
import { RoundedBox } from "@react-three/drei";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { useTweakpane } from "../../hooks/useTweakpane";

// main vehicle component
const VehicleHelicopter = forwardRef<THREE.Mesh>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // refs for targeting rotor assemblies
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  // initialize vehicle controls
  const vehicleInput = useAllVehicleInput();

  // initialize tweakpane hook using extracted constants
  const params = useTweakpane(
    { title: "🚁 Helicopter tuning", expanded: false },
    vehicleHelicopterConstants.tuning,
  );

  // offload physics and animation logic to custom hook
  useVehicleHelicopterCreator(
    chassisRef,
    mainRotorRef,
    tailRotorRef,
    vehicleInput,
    params,
  );

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
      friction={vehicleHelicopterConstants.physics.friction}
      position={vehicleRespawnPos.helicopter}
      canSleep={false}
    >
      <CuboidCollider
        args={[
          params.cabinWidth / 2,
          params.cabinHeight / 2,
          params.cabinLength / 2,
        ]}
        position={vehicleHelicopterConstants.colliders.cabinPos}
        mass={params.cabinMass}
      />
      <CuboidCollider
        args={[0.2, 0.2, 1.5]}
        position={vehicleHelicopterConstants.colliders.tailPos}
        mass={params.tailMass}
      />
      <CuboidCollider args={[1.2, 0.2, 1.75]} position={[0, -1.2, 0]} />
      <group ref={ref}>
        <RoundedBox
          args={[params.cabinWidth, params.cabinHeight, params.cabinLength]}
          radius={0.5}
          smoothness={4}
        >
          <meshStandardMaterial color={"red"} />
        </RoundedBox>
        <mesh position={vehicleHelicopterConstants.colliders.tailPos}>
          <boxGeometry args={[0.4, 0.4, 3]} />
          <meshStandardMaterial color={"darkred"} />
        </mesh>
        <mesh position={vehicleHelicopterConstants.colliders.leftSkidPos}>
          <boxGeometry args={[0.2, 0.2, 3.5]} />
          <meshStandardMaterial color={"gray"} />
        </mesh>
        <mesh position={vehicleHelicopterConstants.colliders.rightSkidPos}>
          <boxGeometry args={[0.2, 0.2, 3.5]} />
          <meshStandardMaterial color={"gray"} />
        </mesh>
        <group
          ref={mainRotorRef}
          position={[0, params.cabinHeight / 2 + 0.2, 0]}
        >
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.2, 0.05, 8]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
          <mesh
            position={[0, 0.4, 0]}
            rotation={[
              vehicleHelicopterConstants.physics.zeroVector,
              vehicleHelicopterConstants.rotations.quarterTurn,
              vehicleHelicopterConstants.physics.zeroVector,
            ]}
          >
            <boxGeometry args={[0.2, 0.05, 8]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
        </group>
        <group ref={tailRotorRef} position={[0.25, 0.5, 3.8]}>
          <mesh
            rotation={[0, 0, vehicleHelicopterConstants.rotations.quarterTurn]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.3]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <boxGeometry args={[0.05, 1.5, 0.15]} />
            <meshStandardMaterial color={"black"} />
          </mesh>
          <mesh
            position={[0.15, 0, 0]}
            rotation={[vehicleHelicopterConstants.rotations.quarterTurn, 0, 0]}
          >
            <boxGeometry args={[0.05, 1.5, 0.15]} />
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
