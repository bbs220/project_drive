import {
  RigidBody,
  RoundCuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { forwardRef, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, Html } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import {
  vehicleCarConstants,
  respawnValues,
} from "../../constants/otherConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useVehicleCarCreator } from "../../hooks/useVehicleCarCreator";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { modelsSeperatedBank } from "../../utils/assetpaths";
import { unwrapParam } from "../../utils/unwrapParam";
import type { VehicleProps } from "../../stores/useVehicleStore";
import TrailEngine from "./TrailEngine";
import { useCustomizationStore } from "../../stores/useCustomizationStore";

// type definitions for the cleaned up gltf models
type typeChassisGLTF = GLTF & {
  nodes: {
    chassis: THREE.Mesh;
    chassisDisplayGlow: THREE.Mesh;
    chassisGlow: THREE.Mesh;
    displayScreen: THREE.Mesh;
    seats: THREE.Mesh;
  };
  materials: {
    chromeshiny: THREE.MeshStandardMaterial;
    emitwhite: THREE.MeshStandardMaterial;
    screenyellow: THREE.MeshStandardMaterial;
    seatblack: THREE.MeshStandardMaterial;
    chassicblack: THREE.MeshStandardMaterial;
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
    ["Glow.001"]: THREE.MeshStandardMaterial;
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
    ["Glow.002"]: THREE.MeshStandardMaterial;
    ["Chrome.002"]: THREE.MeshStandardMaterial;
  };
};

// reusable style for the floating html labels
const labelStyle: React.CSSProperties = {
  color: "white",
  fontFamily: "sans-serif",
  fontSize: "6px",
  fontWeight: "bold",
  userSelect: "none",
};

// wrap component in forward ref to expose visual group to parent
const VehicleCar = forwardRef<THREE.Group, VehicleProps>(
  ({ spawnMode }, ref) => {
    const initialSpawn = respawnValues[spawnMode].car;

    const chassisRef = useRef<RapierRigidBody>(null);
    const visualRef = useRef<THREE.Group>(null);
    const wheelsRef = useRef<THREE.Object3D[]>([]);
    const controlsRef = useAllVehicleInput();

    // fetch customization values
    const carMods = useCustomizationStore((state) => state.carMods);

    // initialize tweakpane hook using only the tuning object
    const tuningParams = useTweakpane(
      { title: "⚙️ Vehicle Tuning", expanded: false },
      vehicleCarConstants.tuning,
    );

    const friction = vehicleCarConstants.physics.friction;

    // initialize the vehicle controller hook
    const { wheelsInfo } = useVehicleCarCreator(
      chassisRef,
      wheelsRef,
      controlsRef,
      tuningParams,
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

    // extract the debug wireframe toggle
    const debugMesh = unwrapParam(tuningParams.debugMesh, false);

    // hook customization to materials
    useEffect(() => {
      // Body Paint (chassicblack)
      chassisGLTF.materials.chassicblack.color.set(carMods.base.color);
      chassisGLTF.materials.chassicblack.metalness = carMods.base.metalness;
      chassisGLTF.materials.chassicblack.roughness = carMods.base.roughness;
      chassisGLTF.materials.chassicblack.emissive.set(carMods.base.color);
      chassisGLTF.materials.chassicblack.emissiveIntensity =
        carMods.base.emission;

      // Chrome Trim (chromeshiny, Chrome.001, Chrome.002)
      const applyChrome = (mat: THREE.MeshStandardMaterial) => {
        mat.color.set(carMods.chrome.color);
        mat.metalness = carMods.chrome.metalness;
        mat.roughness = carMods.chrome.roughness;
        mat.emissive.set(carMods.chrome.color);
        mat.emissiveIntensity = carMods.chrome.emission;
      };
      applyChrome(chassisGLTF.materials.chromeshiny);
      applyChrome(frontTyreGLTF.materials["Chrome.001"]);
      applyChrome(rearTyreGLTF.materials["Chrome.002"]);

      // Neon Glow (emitwhite, screenyellow, Glow.001, Glow.002)
      const applyNeon = (mat: THREE.MeshStandardMaterial) => {
        mat.color.set(carMods.neon.color);
        mat.metalness = carMods.neon.metalness;
        mat.roughness = carMods.neon.roughness;
        mat.emissive.set(carMods.neon.color);
        mat.emissiveIntensity = carMods.neon.emission;
      };
      applyNeon(chassisGLTF.materials.emitwhite);
      applyNeon(chassisGLTF.materials.screenyellow);
      applyNeon(frontTyreGLTF.materials["Glow.001"]);
      applyNeon(rearTyreGLTF.materials["Glow.002"]);

      // Interior (seatblack)
      chassisGLTF.materials.seatblack.color.set(carMods.interior.color);
      chassisGLTF.materials.seatblack.metalness = carMods.interior.metalness;
      chassisGLTF.materials.seatblack.roughness = carMods.interior.roughness;
      chassisGLTF.materials.seatblack.emissive.set(carMods.interior.color);
      chassisGLTF.materials.seatblack.emissiveIntensity =
        carMods.interior.emission;

      // Rubber/Tires (Rubber.001, Rubber.002)
      const applyRubber = (mat: THREE.MeshStandardMaterial) => {
        mat.color.set(carMods.rubber.color);
        mat.metalness = carMods.rubber.metalness;
        mat.roughness = carMods.rubber.roughness;
        mat.emissive.set(carMods.rubber.color);
        mat.emissiveIntensity = carMods.rubber.emission;
      };
      applyRubber(frontTyreGLTF.materials["Rubber.001"]);
      applyRubber(rearTyreGLTF.materials["Rubber.002"]);

      // dynamically toggle wireframe directly on the shared materials
      chassisGLTF.materials.chassicblack.wireframe = debugMesh;
      chassisGLTF.materials.chromeshiny.wireframe = debugMesh;
      chassisGLTF.materials.emitwhite.wireframe = debugMesh;
      chassisGLTF.materials.screenyellow.wireframe = debugMesh;
      chassisGLTF.materials.seatblack.wireframe = debugMesh;

      frontTyreGLTF.materials["Rubber.001"].wireframe = debugMesh;
      frontTyreGLTF.materials["Glow.001"].wireframe = debugMesh;
      frontTyreGLTF.materials["Chrome.001"].wireframe = debugMesh;

      rearTyreGLTF.materials["Rubber.002"].wireframe = debugMesh;
      rearTyreGLTF.materials["Glow.002"].wireframe = debugMesh;
      rearTyreGLTF.materials["Chrome.002"].wireframe = debugMesh;

      // Flag materials for update
      chassisGLTF.materials.chassicblack.needsUpdate = true;
      chassisGLTF.materials.chromeshiny.needsUpdate = true;
      chassisGLTF.materials.emitwhite.needsUpdate = true;
      chassisGLTF.materials.screenyellow.needsUpdate = true;
      chassisGLTF.materials.seatblack.needsUpdate = true;

      frontTyreGLTF.materials["Rubber.001"].needsUpdate = true;
      frontTyreGLTF.materials["Glow.001"].needsUpdate = true;
      frontTyreGLTF.materials["Chrome.001"].needsUpdate = true;

      rearTyreGLTF.materials["Rubber.002"].needsUpdate = true;
      rearTyreGLTF.materials["Glow.002"].needsUpdate = true;
      rearTyreGLTF.materials["Chrome.002"].needsUpdate = true;
    }, [
      carMods,
      debugMesh,
      chassisGLTF.materials,
      frontTyreGLTF.materials,
      rearTyreGLTF.materials,
    ]);

    // precompute dynamic wheel geometry for wireframe overlay
    const wheelGeo = useMemo(() => {
      const radius = unwrapParam(tuningParams.wheelRadius, 0.35);
      const width = unwrapParam(tuningParams.wheelWidth, 0.25);
      const geo = new THREE.CylinderGeometry(radius, radius, width, 32);
      geo.rotateZ(Math.PI / 2); // rotate cylinder to roll forward
      return geo;
    }, [tuningParams.wheelRadius, tuningParams.wheelWidth]);

    // pre extract chassis variables
    const cWidth = unwrapParam(tuningParams.chassisWidth, 1.6);
    const cHeight = unwrapParam(tuningParams.chassisHeight, 0.8);
    const cLength = unwrapParam(tuningParams.chassisLength, 3);
    const cBorderRadius = unwrapParam(tuningParams.chassisBorderRadius, 0.1);
    const cPosX = unwrapParam(tuningParams.chassisPosX, 0);
    const cPosY = unwrapParam(tuningParams.chassisPosY, 0.4);
    const cPosZ = unwrapParam(tuningParams.chassisPosZ, 0);
    const mass = unwrapParam(tuningParams.mass, 200);

    return (
      <group>
        <RigidBody
          ref={chassisRef}
          colliders={false}
          friction={friction.value}
          position={initialSpawn.position}
          rotation={initialSpawn.rotation}
          mass={mass}
          canSleep={false}
        >
          <group ref={visualRef} />
          <RoundCuboidCollider
            args={[cWidth / 2, cHeight / 2, cLength / 2, cBorderRadius]}
            position={[cPosX, cPosY, cPosZ]}
          />
          <group ref={ref}>
            {/* central chassis rendering block */}
            <group position={[cPosX, cPosY, cPosZ]}>
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.chassis.geometry}
                material={chassisGLTF.materials.chassicblack}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.chassisDisplayGlow.geometry}
                material={chassisGLTF.materials.chromeshiny}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.chassisGlow.geometry}
                material={chassisGLTF.materials.emitwhite}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.displayScreen.geometry}
                material={chassisGLTF.materials.screenyellow}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.seats.geometry}
                material={chassisGLTF.materials.seatblack}
              />
            </group>

            {/* front left wheel grouping */}
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
              {/* visual mesh rendering */}
              <group>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.tyreFrontLeft.geometry}
                  material={frontTyreGLTF.materials["Rubber.001"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.frontLeftWheelGlow.geometry}
                  material={frontTyreGLTF.materials["Glow.001"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.rimFrontLeft.geometry}
                  material={frontTyreGLTF.materials["Chrome.001"]}
                />
              </group>
              {/* debug wireframe overlay */}
              {debugMesh && (
                <>
                  <mesh geometry={wheelGeo}>
                    <meshStandardMaterial color="yellow" wireframe />
                  </mesh>
                  <Html center transform sprite position={[0, 0.5, 0]}>
                    <div style={labelStyle}>Front Left</div>
                  </Html>
                </>
              )}
            </group>

            {/* front right wheel grouping */}
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
              {/* visual mesh rotated half circle so rims face out */}
              <group rotation={[0, Math.PI, 0]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.tyreFrontLeft.geometry}
                  material={frontTyreGLTF.materials["Rubber.001"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.frontLeftWheelGlow.geometry}
                  material={frontTyreGLTF.materials["Glow.001"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.rimFrontLeft.geometry}
                  material={frontTyreGLTF.materials["Chrome.001"]}
                />
              </group>
              {/* debug wireframe overlay */}
              {debugMesh && (
                <>
                  <mesh geometry={wheelGeo}>
                    <meshStandardMaterial color="yellow" wireframe />
                  </mesh>
                  <Html center transform sprite position={[0, 0.5, 0]}>
                    <div style={labelStyle}>Front Right</div>
                  </Html>
                </>
              )}
            </group>

            {/* rear left wheel grouping */}
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
              {/* visual mesh rendering */}
              <group>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.tyreRearLeft.geometry}
                  material={rearTyreGLTF.materials["Rubber.002"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rearLeftWheelGlow.geometry}
                  material={rearTyreGLTF.materials["Glow.002"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rimRearLeft.geometry}
                  material={rearTyreGLTF.materials["Chrome.002"]}
                />
              </group>
              {/* debug wireframe overlay */}
              {debugMesh && (
                <>
                  <mesh geometry={wheelGeo}>
                    <meshStandardMaterial color="yellow" wireframe />
                  </mesh>
                  <Html center transform sprite position={[0, 0.5, 0]}>
                    <div style={labelStyle}>Rear Left</div>
                  </Html>
                </>
              )}
            </group>

            {/* rear right wheel grouping */}
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
              {/* visual mesh rotated half circle so rims face out */}
              <group rotation={[0, Math.PI, 0]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.tyreRearLeft.geometry}
                  material={rearTyreGLTF.materials["Rubber.002"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rearLeftWheelGlow.geometry}
                  material={rearTyreGLTF.materials["Glow.002"]}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rimRearLeft.geometry}
                  material={rearTyreGLTF.materials["Chrome.002"]}
                />
              </group>
              {/* debug wireframe overlay */}
              {debugMesh && (
                <>
                  <mesh geometry={wheelGeo}>
                    <meshStandardMaterial color="yellow" wireframe />
                  </mesh>
                  <Html center transform sprite position={[0, 0.5, 0]}>
                    <div style={labelStyle}>Rear Right</div>
                  </Html>
                </>
              )}
            </group>
          </group>
        </RigidBody>

        <TrailEngine
          targetRef={visualRef}
          offset={[0, 0.1, -2.3]}
          color={carMods.trailColor}
          height={0.8}
          width={0.05}
          length={80}
          isCar
        />
      </group>
    );
  },
);

VehicleCar.displayName = "VehicleCar";

export default VehicleCar;

// preloads
useGLTF.preload(modelsSeperatedBank.runner01chassis);
useGLTF.preload(modelsSeperatedBank.runner01leftFrontTyre);
useGLTF.preload(modelsSeperatedBank.runner01leftRearTyre);
