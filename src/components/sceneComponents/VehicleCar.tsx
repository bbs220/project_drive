import {
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  vehicleCarConstants,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useVehicleCarCreator } from "../../hooks/useVehicleCarCreator";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";

// wrap component in forward ref to expose visual group to parent
const VehicleCar = forwardRef<THREE.Group>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // ref array for the visual wheel meshes
  const wheelsRef = useRef<THREE.Object3D[]>([]);

  // get current vehicle inputs
  const controlsRef = useAllVehicleInput();

  // initialize tweakpane hook using ONLY the tuning object so it doesn't crash
  const params = useTweakpane(
    { title: "🚗 Car Tuning", expanded: false },
    vehicleCarConstants.tuning,
  );

  // initialize the vehicle controller hook with the flat params
  const { wheelsInfo } = useVehicleCarCreator(
    chassisRef,
    wheelsRef,
    controlsRef,
    params as any, // bypass strict typescript warnings
  );

  // Helper to safely extract values from Tweakpane objects without bloating JSX
  const getVal = (param: any, fallback: number) =>
    param?.value ?? param ?? fallback;

  // precompute wheel geometry using safe fallbacks
  const wheelGeo = useMemo(() => {
    const radius = getVal(params.wheelRadius, 0.35);
    const width = getVal(params.wheelWidth, 0.25);
    const geo = new THREE.CylinderGeometry(radius, radius, width);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }, [params.wheelRadius, params.wheelWidth]);

  // pre-extract chassis variables from params
  const cWidth = getVal(params.chassisWidth, 1.6);
  const cHeight = getVal(params.chassisHeight, 0.8);
  const cLength = getVal(params.chassisLength, 3);
  const cPosX = getVal(params.chassisPosX, 0);
  const cPosY = getVal(params.chassisPosY, 0.4);
  const cPosZ = getVal(params.chassisPosZ, 0);
  const mass = getVal(params.mass, 200);

  // Read physics directly from the constant (it is not tied to Tweakpane)
  const friction = vehicleCarConstants.physics.friction;

  return (
    <group>
      {/* lift spawn height and disable auto colliders */}
      <RigidBody
        ref={chassisRef}
        colliders={false}
        friction={friction}
        position={vehicleRespawnPos.car}
        rotation={[0, Math.PI, 0]}
        mass={mass}
        canSleep={false}
      >
        {/* explicit chassis collider with dynamic positional offsets */}
        <CuboidCollider
          args={[cWidth / 2, cHeight / 2, cLength / 2]}
          position={[cPosX, cPosY, cPosZ]}
        />

        {/* wrap visual elements in a group to forward the ref uniformly */}
        <group ref={ref}>
          {/* chassis visual mesh matched exactly to the collider */}
          <mesh position={[cPosX, cPosY, cPosZ]}>
            <boxGeometry args={[cWidth, cHeight, cLength]} />
            <meshStandardMaterial color="blue" />
          </mesh>

          {/* render visual wheels as children of chassis using hook's output */}
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
        </group>
      </RigidBody>
    </group>
  );
});

VehicleCar.displayName = "VehicleCar";

export default VehicleCar;
