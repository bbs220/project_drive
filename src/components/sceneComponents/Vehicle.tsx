import { useRef, useMemo } from "react";
import * as THREE from "three";
import {
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";

// import custom hooks
import { useVehicleInput } from "../../hooks/useVehicleInput";
import {
  useVehicleCreator,
  type WheelInfo,
} from "../../hooks/useVehicleCreator";
import { useTweakpane } from "../../hooks/useTweakpane";
import CameraRig from "./CameraRig";

// define tweakpane configuration object outside component
const tuningConfig = {
  chassisWidth: { value: 1.6, min: 0.5, max: 3, label: "width" },
  chassisHeight: { value: 0.8, min: 0.2, max: 2, label: "height" },
  chassisLength: { value: 4.16, min: 2, max: 6, label: "length" },
  mass: { value: 800, min: 400, max: 2000, label: "mass" },
  wheelRadius: { value: 0.35, min: 0.1, max: 1, label: "wheel radius" },
  wheelWidth: { value: 0.25, min: 0.1, max: 1, label: "wheel width" },
  suspensionRestLength: { value: 0.125, min: 0.01, max: 1, label: "susp rest" },
  suspensionStiffness: { value: 24, min: 1, max: 100, label: "susp stiffness" },
  maxSuspensionTravel: { value: 1, min: 0.1, max: 2, label: "susp travel" },
  frictionSlip: { value: 1.5, min: 0.1, max: 5, label: "friction slip" },
  sideFrictionStiffness: {
    value: 3,
    min: 0.1,
    max: 10,
    label: "side friction",
  },
  engineForce: { value: 50, min: 10, max: 500, label: "engine force" },
  brakeForce: { value: 50, min: 10, max: 200, label: "brake force" },
  steeringAngle: { value: 0.5, min: 0.1, max: 1, label: "steering angle" },
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

  // initialize tweakpane hook
  const params = useTweakpane("vehicle tuning", tuningConfig);

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
          <mesh
            key={index}
            position={[info.position.x, info.position.y, info.position.z]}
            geometry={wheelGeo}
            ref={(el) => {
              if (el) wheelsRef.current[index] = el;
            }}
          >
            <meshStandardMaterial color="yellow" wireframe />
          </mesh>
        ))}
      </RigidBody>
    </group>
  );
};

export default Vehicle;
