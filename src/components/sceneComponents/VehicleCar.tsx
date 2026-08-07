import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  vehicleRespawnLimit,
  vehicleCarConstants,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import {
  useVehicleCarCreator,
  type WheelInfo,
} from "../../hooks/useVehicleCarCreator";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import respawnVehicle from "../../utils/respawnVehicle";

// wrap component in forward ref to expose visual mesh to parent
export const VehicleCar = forwardRef<THREE.Mesh>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // ref array for the visual wheel meshes
  const wheelsRef = useRef<THREE.Object3D[]>([]);

  // get current vehicle inputs
  const controlsRef = useAllVehicleInput();

  // initialize tweakpane hook using extracted constants
  const params = useTweakpane(
    { title: "🚗 Car Tuning", expanded: false },
    vehicleCarConstants,
  );

  // recalculate wheels dynamically when tweakpane values change
  const wheelsInfo = useMemo<WheelInfo[]>(() => {
    // helper to create standard wheel config
    const createWheelInfo = (x: number, z: number): WheelInfo => ({
      axleCs: new THREE.Vector3(-1, 0, 0),
      suspensionRestLength: params.suspensionRestLength,
      suspensionStiffness: params.suspensionStiffness,
      maxSuspensionTravel: params.maxSuspensionTravel,
      frictionSlip: params.frictionSlip,
      sideFrictionStiffness: params.sideFrictionStiffness,
      position: new THREE.Vector3(x, -params.chassisHeight / 2, z),
      radius: params.wheelRadius,
    });

    // return array of wheels
    return [
      createWheelInfo(-params.chassisWidth / 2, params.chassisLength / 2),
      createWheelInfo(params.chassisWidth / 2, params.chassisLength / 2),
      createWheelInfo(-params.chassisWidth / 2, -params.chassisLength / 2),
      createWheelInfo(params.chassisWidth / 2, -params.chassisLength / 2),
    ];
  }, [
    params.chassisWidth,
    params.chassisLength,
    params.chassisHeight,
    params.suspensionRestLength,
    params.suspensionStiffness,
    params.maxSuspensionTravel,
    params.frictionSlip,
    params.sideFrictionStiffness,
    params.wheelRadius,
  ]);

  // initialize the vehicle controller hook with tuning params
  useVehicleCarCreator(chassisRef, wheelsRef, wheelsInfo, controlsRef, params);

  // precompute wheel geometry
  const wheelGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      params.wheelRadius,
      params.wheelRadius,
      params.wheelWidth,
    );
    geo.rotateZ(Math.PI / 2);
    return geo;
  }, [params.wheelRadius, params.wheelWidth]);

  // handle respawn logic
  useFrame(() => {
    // exit early if chassis is missing
    if (!chassisRef.current) return;

    // check if vehicle has fallen below bounds
    if (chassisRef.current.translation().y < vehicleRespawnLimit) {
      // trigger extracted respawn function
      respawnVehicle({
        vehicleBody: chassisRef.current,
        x: vehicleRespawnPos.car[0],
        y: vehicleRespawnPos.car[1],
        z: vehicleRespawnPos.car[2],
      });
    }
  });

  return (
    <group>
      {/* lift spawn height and disable auto colliders */}
      <RigidBody
        ref={chassisRef}
        colliders={false}
        friction={0}
        position={vehicleRespawnPos.car}
        mass={params.mass}
        canSleep={false}
        rotation={[0, Math.PI, 0]}
      >
        {/* explicit chassis collider to exclude wheels */}
        <CuboidCollider
          args={[
            params.chassisWidth / 2,
            params.chassisHeight / 2,
            params.chassisLength / 2,
          ]}
        />

        {/* attach forwarded ref directly to chassis visual mesh */}
        <mesh ref={ref}>
          <boxGeometry
            args={[
              params.chassisWidth,
              params.chassisHeight,
              params.chassisLength,
            ]}
          />
          <meshStandardMaterial color="blue" />
        </mesh>

        {/* render visual wheels as children of chassis */}
        {wheelsInfo.map((info, index) => (
          <group
            key={index}
            position={[info.position.x, info.position.y, info.position.z]}
            ref={(el) => {
              if (el) wheelsRef.current[index] = el;
            }}
          >
            {/* base wheel geometry */}
            <mesh geometry={wheelGeo}>
              <meshStandardMaterial color="yellow" wireframe />
            </mesh>
          </group>
        ))}
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools compatibility
VehicleCar.displayName = "VehicleCar";

export default VehicleCar;
