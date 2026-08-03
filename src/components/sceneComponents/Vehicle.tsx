import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useVehicleInput } from "../../hooks/useVehicleInput";
import {
  useVehicleCreator,
  type WheelInfo,
} from "../../hooks/useVehicleCreator";
import { useTweakpane } from "../../hooks/useTweakpane";
import CameraRig from "./CameraRig";
import { vehicleConstants } from "../../constants/sceneConstants";

// helper function to completely reset vehicle physics state
const respawnVehicle = (chassis: RapierRigidBody) => {
  // reset position to origin height
  chassis.setTranslation({ x: 0, y: 5, z: 0 }, true);

  // reset rotation to default identity quaternion
  chassis.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);

  // zero out linear momentum
  chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);

  // zero out angular momentum
  chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
};

export const Vehicle = () => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // create ref for visual mesh to enable interpolated camera tracking
  const chassisVisualRef = useRef<THREE.Mesh>(null);

  // ref array for the visual wheel meshes
  const wheelsRef = useRef<THREE.Object3D[]>([]);

  // get current vehicle inputs
  const controlsRef = useVehicleInput();

  // initialize tweakpane hook using extracted constants
  const params = useTweakpane("🚗 Vehicle Tuning", vehicleConstants);

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
  useVehicleCreator(chassisRef, wheelsRef, wheelsInfo, controlsRef, params);

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
    if (chassisRef.current.translation().y < -10) {
      // trigger extracted respawn function
      respawnVehicle(chassisRef.current);
    }
  });

  return (
    <group>
      <CameraRig targetRef={chassisVisualRef} />

      {/* lift spawn height and disable auto colliders */}
      <RigidBody
        position={[0, 5, 0]}
        ref={chassisRef}
        colliders={false}
        mass={params.mass}
        friction={0}
      >
        {/* explicit chassis collider to exclude wheels */}
        <CuboidCollider
          args={[
            params.chassisWidth / 2,
            params.chassisHeight / 2,
            params.chassisLength / 2,
          ]}
        />

        {/* chassis visual mesh */}
        <mesh ref={chassisVisualRef}>
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
              <meshStandardMaterial color="red" wireframe />
            </mesh>
          </group>
        ))}
      </RigidBody>
    </group>
  );
};

export default Vehicle;
