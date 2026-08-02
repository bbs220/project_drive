// import required dependencies
import { useRef } from "react";
import * as THREE from "three";
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

// define chassis dimensions
const chassisWidth = 1.6;
const chassisHeight = 0.8;
const chassisLength = 4.16;

// define wheel tuning constants
const wheelRadius = 0.35;
const wheelWidth = 0.25;

// helper to create standard wheel config
const createWheelInfo = (x: number, z: number): WheelInfo => ({
  axleCs: new THREE.Vector3(-1, 0, 0),
  suspensionRestLength: 0.125,
  suspensionStiffness: 24,
  maxSuspensionTravel: 1,
  frictionSlip: 1.5,
  sideFrictionStiffness: 3,
  position: new THREE.Vector3(x, -chassisHeight / 2, z),
  radius: wheelRadius,
});

// setup wheels array
const wheelsInfo: WheelInfo[] = [
  createWheelInfo(-chassisWidth / 2, chassisLength / 2),
  createWheelInfo(chassisWidth / 2, chassisLength / 2),
  createWheelInfo(-chassisWidth / 2, -chassisLength / 2),
  createWheelInfo(chassisWidth / 2, -chassisLength / 2),
];

// precompute geometry to align wheel axis correctly
const wheelGeo = new THREE.CylinderGeometry(
  wheelRadius,
  wheelRadius,
  wheelWidth,
);
wheelGeo.rotateZ(Math.PI / 2);

const Vehicle = () => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // ref array for the visual wheel meshes
  const wheelsRef = useRef<THREE.Object3D[]>([]);

  // get current vehicle inputs
  const controlsRef = useVehicleInput();

  // initialize the vehicle controller hook
  useVehicleCreator(chassisRef, wheelsRef, wheelsInfo, controlsRef);

  return (
    <group>
      {/* lift spawn height and disable auto colliders */}
      <RigidBody
        position={[0, 5, 0]}
        ref={chassisRef}
        colliders={false}
        mass={800}
        friction={0}
      >
        {/* explicit chassis collider to exclude wheels */}
        <CuboidCollider
          args={[chassisWidth / 2, chassisHeight / 2, chassisLength / 2]}
        />

        {/* chassis visual mesh */}
        <mesh>
          <boxGeometry args={[chassisWidth, chassisHeight, chassisLength]} />
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
