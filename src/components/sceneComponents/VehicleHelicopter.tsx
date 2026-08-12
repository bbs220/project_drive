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

// main vehicle component updated to match group typing
const VehicleHelicopter = forwardRef<THREE.Group>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // refs for targeting rotor assemblies
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  // initialize vehicle controls
  const vehicleInput = useAllVehicleInput();

  // initialize tweakpane hook using extracted constants
  const params = useTweakpane(
    { title: "🚁 Helicopter Tuning", expanded: false },
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
        vehicleType: "helicopter",
        vehicleBody: chassisRef.current,
      });
    }
  });

  return (
    <group>
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
          args={vehicleHelicopterConstants.colliders.tailArgs}
          position={vehicleHelicopterConstants.colliders.tailPos}
          mass={params.tailMass}
        />
        <CuboidCollider
          args={vehicleHelicopterConstants.colliders.skidArgs}
          position={vehicleHelicopterConstants.colliders.skidPos}
        />

        {/* visual elements perfectly wrapped in the forwarded ref group */}
        <group ref={ref}>
          <RoundedBox
            args={[params.cabinWidth, params.cabinHeight, params.cabinLength]}
            radius={vehicleHelicopterConstants.visuals.cabinRadius}
            smoothness={vehicleHelicopterConstants.visuals.cabinSmoothness}
          >
            <meshStandardMaterial color={"red"} />
          </RoundedBox>
          <mesh position={vehicleHelicopterConstants.colliders.tailPos}>
            <boxGeometry
              args={vehicleHelicopterConstants.visuals.tailBoxArgs}
            />
            <meshStandardMaterial color={"darkred"} />
          </mesh>
          <mesh position={vehicleHelicopterConstants.colliders.leftSkidPos}>
            <boxGeometry args={vehicleHelicopterConstants.visuals.skidArgs} />
            <meshStandardMaterial color={"gray"} />
          </mesh>
          <mesh position={vehicleHelicopterConstants.colliders.rightSkidPos}>
            <boxGeometry args={vehicleHelicopterConstants.visuals.skidArgs} />
            <meshStandardMaterial color={"gray"} />
          </mesh>
          <group
            ref={mainRotorRef}
            position={[
              vehicleHelicopterConstants.physics.zeroVector,
              params.cabinHeight / 2 +
                vehicleHelicopterConstants.visuals.mainRotorOffset,
              vehicleHelicopterConstants.physics.zeroVector,
            ]}
          >
            <mesh position={vehicleHelicopterConstants.visuals.rotorMastPos}>
              <cylinderGeometry
                args={vehicleHelicopterConstants.visuals.rotorMastArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
            <mesh position={vehicleHelicopterConstants.visuals.bladePos}>
              <boxGeometry
                args={vehicleHelicopterConstants.visuals.bladeArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
            <mesh
              position={vehicleHelicopterConstants.visuals.bladePos}
              rotation={[
                vehicleHelicopterConstants.physics.zeroVector,
                vehicleHelicopterConstants.rotations.quarterTurn,
                vehicleHelicopterConstants.physics.zeroVector,
              ]}
            >
              <boxGeometry
                args={vehicleHelicopterConstants.visuals.bladeArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>
          <group
            ref={tailRotorRef}
            position={vehicleHelicopterConstants.visuals.tailRotorGroupPos}
          >
            <mesh
              rotation={[
                vehicleHelicopterConstants.physics.zeroVector,
                vehicleHelicopterConstants.physics.zeroVector,
                vehicleHelicopterConstants.rotations.quarterTurn,
              ]}
            >
              <cylinderGeometry
                args={vehicleHelicopterConstants.visuals.tailRotorMastArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
            <mesh position={vehicleHelicopterConstants.visuals.tailBladePos}>
              <boxGeometry
                args={vehicleHelicopterConstants.visuals.tailBladeArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
            <mesh
              position={vehicleHelicopterConstants.visuals.tailBladePos}
              rotation={[
                vehicleHelicopterConstants.rotations.quarterTurn,
                vehicleHelicopterConstants.physics.zeroVector,
                vehicleHelicopterConstants.physics.zeroVector,
              ]}
            >
              <boxGeometry
                args={vehicleHelicopterConstants.visuals.tailBladeArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>
        </group>
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools compatibility
VehicleHelicopter.displayName = "VehicleHelicopter";

export default VehicleHelicopter;
