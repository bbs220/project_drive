import {
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF, Html } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import {
  vehicleCarConstants,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useVehicleCarCreator } from "../../hooks/useVehicleCarCreator";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { modelsSeperatedBank } from "../../utils/assetpaths";

// --- GLTF TYPES ---
type typeChassisGLTF = GLTF & {
  nodes: {
    chassis: THREE.Mesh;
    chassisDisplayGlow: THREE.Mesh;
    chassisGlow: THREE.Mesh;
    displayScreen: THREE.Mesh;
    frontLeftSuspensionPiston: THREE.Mesh;
    frontLeftSuspensionGlow: THREE.Mesh;
    frontRightSuspensionPiston: THREE.Mesh;
    frontRightSuspensionGlow: THREE.Mesh;
    pedals: THREE.Mesh;
    radiator: THREE.Mesh;
    rearLeftSuspensionPiston: THREE.Mesh;
    rearLeftSuspensionGlow: THREE.Mesh;
    rearRightSuspensionPiston: THREE.Mesh;
    rearRightSuspensionGlow: THREE.Mesh;
    seats: THREE.Mesh;
    steeringWheel: THREE.Mesh;
    steeringWheelDial: THREE.Mesh;
  };
  materials: {
    baseMetal_MAT: THREE.MeshStandardMaterial;
    Black: THREE.MeshStandardMaterial;
    Glow: THREE.MeshStandardMaterial;
    Screens: THREE.MeshStandardMaterial;
    Piston_Chrome: THREE.MeshStandardMaterial;
    Gray_parts: THREE.MeshStandardMaterial;
    Gray: THREE.MeshStandardMaterial;
    Seat: THREE.MeshStandardMaterial;
  };
};

type typeFrontTyreGLTF = GLTF & {
  nodes: {
    tyreFrontLeft: THREE.Mesh;
    frontLeftWheelGlow: THREE.Mesh;
    rimFrontLeft: THREE.Mesh;
  };
  materials: {
    ["Rubber.001"]: THREE.MeshStandardMaterial;
    ["Glow.002"]: THREE.MeshStandardMaterial;
    ["Chrome.001"]: THREE.MeshStandardMaterial;
  };
};

type typeRearTyreGLTF = GLTF & {
  nodes: {
    tyreRearLeft: THREE.Mesh;
    rearLeftWheelGlow: THREE.Mesh;
    rimRearLeft: THREE.Mesh;
  };
  materials: {
    ["Rubber.002"]: THREE.MeshStandardMaterial;
    ["Glow.001"]: THREE.MeshStandardMaterial;
    ["Chrome.002"]: THREE.MeshStandardMaterial;
  };
};

// Reusable style for the floating HTML labels
const labelStyle: React.CSSProperties = {
  color: "white",
  background: "rgba(0,0,0,0.7)",
  padding: "4px 8px",
  borderRadius: "6px",
  fontFamily: "sans-serif",
  fontSize: "12px",
  fontWeight: "bold",
  userSelect: "none",
  whiteSpace: "nowrap",
  border: "1px solid rgba(255,255,255,0.2)",
};

// wrap component in forward ref to expose visual group to parent
const VehicleCar = forwardRef<THREE.Group>((_props, ref) => {
  const chassisRef = useRef<RapierRigidBody>(null);
  const wheelsRef = useRef<THREE.Object3D[]>([]);
  const controlsRef = useAllVehicleInput();

  // initialize tweakpane hook using ONLY the tuning object
  const tuningParams = useTweakpane(
    { title: "🚗 Car Tuning", expanded: false },
    vehicleCarConstants.tuning,
  );

  const friction = vehicleCarConstants.physics.friction;

  // initialize the vehicle controller hook
  const { wheelsInfo } = useVehicleCarCreator(
    chassisRef,
    wheelsRef,
    controlsRef,
    tuningParams as any,
  );

  // load models
  const chassisGLTF = useGLTF(
    modelsSeperatedBank.runner01chassis,
  ) as unknown as typeChassisGLTF;
  const frontTyreGLTF = useGLTF(
    modelsSeperatedBank.runner01leftFrontTyre,
  ) as unknown as typeFrontTyreGLTF;
  const rearTyreGLTF = useGLTF(
    modelsSeperatedBank.runner01leftRearTyre,
  ) as unknown as typeRearTyreGLTF;

  // Helper to safely extract values from Tweakpane objects
  const getVal = (param: any, fallback: number) =>
    param?.value ?? param ?? fallback;

  // precompute dynamic wheel geometry for wireframe overlay
  const wheelGeo = useMemo(() => {
    const radius = getVal(tuningParams.wheelRadius, 0.35);
    const width = getVal(tuningParams.wheelWidth, 0.25);
    const geo = new THREE.CylinderGeometry(radius, radius, width, 32);
    geo.rotateZ(Math.PI / 2); // rotate cylinder to roll forward
    return geo;
  }, [tuningParams.wheelRadius, tuningParams.wheelWidth]);

  // Pre-extract chassis variables
  const cWidth = getVal(tuningParams.chassisWidth, 1.6);
  const cHeight = getVal(tuningParams.chassisHeight, 0.8);
  const cLength = getVal(tuningParams.chassisLength, 3);
  const cPosX = getVal(tuningParams.chassisPosX, 0);
  const cPosY = getVal(tuningParams.chassisPosY, 0.4);
  const cPosZ = getVal(tuningParams.chassisPosZ, 0);
  const mass = getVal(tuningParams.mass, 200);

  return (
    <group>
      <RigidBody
        ref={chassisRef}
        colliders={false}
        friction={friction}
        position={vehicleRespawnPos.car}
        rotation={[0, Math.PI, 0]}
        mass={mass}
        canSleep={false}
      >
        <CuboidCollider
          args={[cWidth / 2, cHeight / 2, cLength / 2]}
          position={[cPosX, cPosY, cPosZ]}
        />

        <group ref={ref}>
          {/* --- CHASSIS --- */}
          <group position={[cPosX, cPosY, cPosZ]}>
            <mesh
              castShadow
              receiveShadow
              geometry={chassisGLTF.nodes.chassis.geometry}
              material={chassisGLTF.materials.baseMetal_MAT}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.chassisDisplayGlow.geometry}
                material={chassisGLTF.materials.Black}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.chassisGlow.geometry}
                material={chassisGLTF.materials.Glow}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.displayScreen.geometry}
                material={chassisGLTF.materials.Screens}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.frontLeftSuspensionPiston.geometry}
                material={chassisGLTF.materials.Piston_Chrome}
              >
                <mesh
                  castShadow
                  receiveShadow
                  geometry={chassisGLTF.nodes.frontLeftSuspensionGlow.geometry}
                  material={chassisGLTF.materials.Glow}
                />
              </mesh>
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.frontRightSuspensionPiston.geometry}
                material={chassisGLTF.materials.Piston_Chrome}
              >
                <mesh
                  castShadow
                  receiveShadow
                  geometry={chassisGLTF.nodes.frontRightSuspensionGlow.geometry}
                  material={chassisGLTF.materials.Glow}
                />
              </mesh>
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.pedals.geometry}
                material={chassisGLTF.materials.Gray_parts}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.radiator.geometry}
                material={chassisGLTF.materials.Gray}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.rearLeftSuspensionPiston.geometry}
                material={chassisGLTF.materials.Piston_Chrome}
              >
                <mesh
                  castShadow
                  receiveShadow
                  geometry={chassisGLTF.nodes.rearLeftSuspensionGlow.geometry}
                  material={chassisGLTF.materials.Glow}
                />
              </mesh>
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.rearRightSuspensionPiston.geometry}
                material={chassisGLTF.materials.Piston_Chrome}
              >
                <mesh
                  castShadow
                  receiveShadow
                  geometry={chassisGLTF.nodes.rearRightSuspensionGlow.geometry}
                  material={chassisGLTF.materials.Glow}
                />
              </mesh>
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.seats.geometry}
                material={chassisGLTF.materials.Seat}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.steeringWheel.geometry}
                material={chassisGLTF.materials.Seat}
              >
                <mesh
                  castShadow
                  receiveShadow
                  geometry={chassisGLTF.nodes.steeringWheelDial.geometry}
                  material={chassisGLTF.materials.Glow}
                />
              </mesh>
            </mesh>
          </group>

          {/* --- WHEEL 0: FRONT LEFT --- */}
          <group
            position={[
              wheelsInfo[0].position.x,
              wheelsInfo[0].position.y,
              wheelsInfo[0].position.z,
            ]}
            ref={(el) => {
              if (el) wheelsRef.current[0] = el;
            }}
          >
            {/* Visual GLB */}
            <mesh
              castShadow
              receiveShadow
              geometry={frontTyreGLTF.nodes.tyreFrontLeft.geometry}
              material={frontTyreGLTF.materials["Rubber.001"]}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={frontTyreGLTF.nodes.frontLeftWheelGlow.geometry}
                material={frontTyreGLTF.materials["Glow.002"]}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={frontTyreGLTF.nodes.rimFrontLeft.geometry}
                material={frontTyreGLTF.materials["Chrome.001"]}
              />
            </mesh>
            {/* Tuning Wireframe Overlay */}
            <mesh geometry={wheelGeo}>
              <meshStandardMaterial color="yellow" wireframe />
            </mesh>
            {/* HTML Label */}
            <Html center transform sprite position={[0, 0.5, 0]}>
              <div style={labelStyle}>Front Left</div>
            </Html>
          </group>

          {/* --- WHEEL 1: FRONT RIGHT --- */}
          <group
            position={[
              wheelsInfo[1].position.x,
              wheelsInfo[1].position.y,
              wheelsInfo[1].position.z,
            ]}
            ref={(el) => {
              if (el) wheelsRef.current[1] = el;
            }}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={frontTyreGLTF.nodes.tyreFrontLeft.geometry}
              material={frontTyreGLTF.materials["Rubber.001"]}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={frontTyreGLTF.nodes.frontLeftWheelGlow.geometry}
                material={frontTyreGLTF.materials["Glow.002"]}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={frontTyreGLTF.nodes.rimFrontLeft.geometry}
                material={frontTyreGLTF.materials["Chrome.001"]}
              />
            </mesh>
            <mesh geometry={wheelGeo}>
              <meshStandardMaterial color="yellow" wireframe />
            </mesh>
            <Html center transform sprite position={[0, 0.5, 0]}>
              <div style={labelStyle}>Front Right</div>
            </Html>
          </group>

          {/* --- WHEEL 2: REAR LEFT --- */}
          <group
            position={[
              wheelsInfo[2].position.x,
              wheelsInfo[2].position.y,
              wheelsInfo[2].position.z,
            ]}
            ref={(el) => {
              if (el) wheelsRef.current[2] = el;
            }}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={rearTyreGLTF.nodes.tyreRearLeft.geometry}
              material={rearTyreGLTF.materials["Rubber.002"]}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={rearTyreGLTF.nodes.rearLeftWheelGlow.geometry}
                material={rearTyreGLTF.materials["Glow.001"]}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={rearTyreGLTF.nodes.rimRearLeft.geometry}
                material={rearTyreGLTF.materials["Chrome.002"]}
              />
            </mesh>
            <mesh geometry={wheelGeo}>
              <meshStandardMaterial color="yellow" wireframe />
            </mesh>
            <Html center transform sprite position={[0, 0.5, 0]}>
              <div style={labelStyle}>Rear Left</div>
            </Html>
          </group>

          {/* --- WHEEL 3: REAR RIGHT --- */}
          <group
            position={[
              wheelsInfo[3].position.x,
              wheelsInfo[3].position.y,
              wheelsInfo[3].position.z,
            ]}
            ref={(el) => {
              if (el) wheelsRef.current[3] = el;
            }}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={rearTyreGLTF.nodes.tyreRearLeft.geometry}
              material={rearTyreGLTF.materials["Rubber.002"]}
            >
              <mesh
                castShadow
                receiveShadow
                geometry={rearTyreGLTF.nodes.rearLeftWheelGlow.geometry}
                material={rearTyreGLTF.materials["Glow.001"]}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={rearTyreGLTF.nodes.rimRearLeft.geometry}
                material={rearTyreGLTF.materials["Chrome.002"]}
              />
            </mesh>
            <mesh geometry={wheelGeo}>
              <meshStandardMaterial color="yellow" wireframe />
            </mesh>
            <Html center transform sprite position={[0, 0.5, 0]}>
              <div style={labelStyle}>Rear Right</div>
            </Html>
          </group>
        </group>
      </RigidBody>
    </group>
  );
});

VehicleCar.displayName = "VehicleCar";

export default VehicleCar;

// Preloads
useGLTF.preload(modelsSeperatedBank.runner01chassis);
useGLTF.preload(modelsSeperatedBank.runner01leftFrontTyre);
useGLTF.preload(modelsSeperatedBank.runner01leftRearTyre);
