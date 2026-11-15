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
  vehicleCar02Constants,
  respawnValues,
} from "../../constants/otherConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useVehicleCarCreator } from "../../hooks/useVehicleCarCreator";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { modelsSeperatedBank } from "../../utils/assetpaths";
import { unwrapParam } from "../../utils/unwrapParam";
import { type VehicleProps, ENTITY_ID } from "../../stores/useVehicleStore";
import TrailEngine from "./TrailEngine";
import { useCustomizationStore } from "../../stores/useCustomizationStore";

// type definitions for the cleaned up gltf models
type typeChassisGLTF = GLTF & {
  nodes: {
    chassis: THREE.Mesh;
    chassisGlow: THREE.Mesh;
    displayKnobs: THREE.Mesh;
    displayScreen: THREE.Mesh;
    frontLeftAxel: THREE.Mesh;
    seats: THREE.Mesh;
  };
  materials: {
    chassisblack: THREE.MeshStandardMaterial;
    chassisglow: THREE.MeshStandardMaterial;
    ["material.002"]: THREE.MeshStandardMaterial;
    glossy: THREE.MeshStandardMaterial;
    ["Seats.002"]: THREE.MeshStandardMaterial;
  };
};

type typeFrontTyreGLTF = GLTF & {
  nodes: {
    tyreFrontLeft: THREE.Mesh;
    frontLeftWheelGlow: THREE.Mesh;
    rimFrontLeft: THREE.Mesh;
  };
  materials: {
    wheelblack: THREE.MeshStandardMaterial;
    wheelglow: THREE.MeshStandardMaterial;
    glossy: THREE.MeshStandardMaterial;
  };
};

type typeRearTyreGLTF = GLTF & {
  nodes: {
    tyreRearLeft: THREE.Mesh;
    rearLeftWheelGlow: THREE.Mesh;
    rimRearLeft: THREE.Mesh;
  };
  materials: {
    wheelblack: THREE.MeshStandardMaterial;
    wheelglow: THREE.MeshStandardMaterial;
    glossy: THREE.MeshStandardMaterial;
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
const VehicleCar02 = forwardRef<THREE.Group, VehicleProps>(
  ({ spawnMode }, ref) => {
    const initialSpawn = respawnValues[spawnMode].car02;

    const chassisRef = useRef<RapierRigidBody>(null);
    const visualRef = useRef<THREE.Group>(null);
    const wheelsRef = useRef<THREE.Object3D[]>([]);
    const controlsRef = useAllVehicleInput();

    // fetch customization values
    const carMods = useCustomizationStore((state) => state.carMods);

    // initialize tweakpane hook using only the tuning object
    const tuningParams = useTweakpane(
      { title: "⚙️ Vehicle Tuning", expanded: false },
      vehicleCar02Constants.tuning,
    );

    const friction = vehicleCar02Constants.physics.friction;

    // initialize the vehicle controller hook
    const { wheelsInfo } = useVehicleCarCreator(
      chassisRef,
      wheelsRef,
      controlsRef,
      tuningParams,
      ENTITY_ID.CAR_2,
    );

    // load models
    const chassisGLTF = useGLTF(
      modelsSeperatedBank.runner02chassis,
    ) as unknown as typeChassisGLTF;
    const frontTyreGLTF = useGLTF(
      modelsSeperatedBank.runner02leftFrontTyre,
    ) as unknown as typeFrontTyreGLTF;
    const rearTyreGLTF = useGLTF(
      modelsSeperatedBank.runner02leftRearTyre,
    ) as unknown as typeRearTyreGLTF;

    // extract the debug wireframe toggle
    const debugMesh = unwrapParam(tuningParams.debugMesh, false);

    useEffect(() => {
      // body paint
      chassisGLTF.materials.chassisblack.color.set(carMods.base.color);
      chassisGLTF.materials.chassisblack.metalness = carMods.base.metalness;
      chassisGLTF.materials.chassisblack.roughness = carMods.base.roughness;
      chassisGLTF.materials.chassisblack.emissive.set(carMods.base.color);
      chassisGLTF.materials.chassisblack.emissiveIntensity =
        carMods.base.emission;

      // chrome trim
      const applyChrome = (mat: THREE.MeshStandardMaterial) => {
        mat.color.set(carMods.chrome.color);
        mat.metalness = carMods.chrome.metalness;
        mat.roughness = carMods.chrome.roughness;
        mat.emissive.set(carMods.chrome.color);
        mat.emissiveIntensity = carMods.chrome.emission;
      };
      applyChrome(chassisGLTF.materials.glossy);
      applyChrome(frontTyreGLTF.materials.glossy);
      applyChrome(rearTyreGLTF.materials.glossy);

      // neon glow
      const applyNeon = (mat: THREE.MeshStandardMaterial) => {
        mat.color.set(carMods.neon.color);
        mat.metalness = carMods.neon.metalness;
        mat.roughness = carMods.neon.roughness;
        mat.emissive.set(carMods.neon.color);
        mat.emissiveIntensity = carMods.neon.emission;
      };
      applyNeon(chassisGLTF.materials.chassisglow);
      applyNeon(chassisGLTF.materials["material.002"]);
      applyNeon(frontTyreGLTF.materials.wheelglow);
      applyNeon(rearTyreGLTF.materials.wheelglow);

      // interior
      chassisGLTF.materials["Seats.002"].color.set(carMods.interior.color);
      chassisGLTF.materials["Seats.002"].metalness = carMods.interior.metalness;
      chassisGLTF.materials["Seats.002"].roughness = carMods.interior.roughness;
      chassisGLTF.materials["Seats.002"].emissive.set(carMods.interior.color);
      chassisGLTF.materials["Seats.002"].emissiveIntensity =
        carMods.interior.emission;

      // rubber tires
      const applyRubber = (mat: THREE.MeshStandardMaterial) => {
        mat.color.set(carMods.rubber.color);
        mat.metalness = carMods.rubber.metalness;
        mat.roughness = carMods.rubber.roughness;
        mat.emissive.set(carMods.rubber.color);
        mat.emissiveIntensity = carMods.rubber.emission;
      };
      applyRubber(frontTyreGLTF.materials.wheelblack);
      applyRubber(rearTyreGLTF.materials.wheelblack);

      // dynamically toggle wireframe directly on the shared materials
      chassisGLTF.materials.chassisblack.wireframe = debugMesh;
      chassisGLTF.materials.chassisglow.wireframe = debugMesh;
      chassisGLTF.materials["material.002"].wireframe = debugMesh;
      chassisGLTF.materials.glossy.wireframe = debugMesh;
      chassisGLTF.materials["Seats.002"].wireframe = debugMesh;

      frontTyreGLTF.materials.wheelblack.wireframe = debugMesh;
      frontTyreGLTF.materials.wheelglow.wireframe = debugMesh;
      frontTyreGLTF.materials.glossy.wireframe = debugMesh;

      rearTyreGLTF.materials.wheelblack.wireframe = debugMesh;
      rearTyreGLTF.materials.wheelglow.wireframe = debugMesh;
      rearTyreGLTF.materials.glossy.wireframe = debugMesh;

      // flag materials for update
      chassisGLTF.materials.chassisblack.needsUpdate = true;
      chassisGLTF.materials.chassisglow.needsUpdate = true;
      chassisGLTF.materials["material.002"].needsUpdate = true;
      chassisGLTF.materials.glossy.needsUpdate = true;
      chassisGLTF.materials["Seats.002"].needsUpdate = true;

      frontTyreGLTF.materials.wheelblack.needsUpdate = true;
      frontTyreGLTF.materials.wheelglow.needsUpdate = true;
      frontTyreGLTF.materials.glossy.needsUpdate = true;

      rearTyreGLTF.materials.wheelblack.needsUpdate = true;
      rearTyreGLTF.materials.wheelglow.needsUpdate = true;
      rearTyreGLTF.materials.glossy.needsUpdate = true;
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
      geo.rotateZ(Math.PI / 2);
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
                material={chassisGLTF.materials.chassisblack}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.chassisGlow.geometry}
                material={chassisGLTF.materials.chassisglow}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.displayKnobs.geometry}
                material={chassisGLTF.nodes.displayKnobs.material}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.displayScreen.geometry}
                material={chassisGLTF.materials["material.002"]}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.frontLeftAxel.geometry}
                material={chassisGLTF.materials.glossy}
              />
              <mesh
                castShadow
                receiveShadow
                geometry={chassisGLTF.nodes.seats.geometry}
                material={chassisGLTF.materials["Seats.002"]}
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
                  material={frontTyreGLTF.materials.wheelblack}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.frontLeftWheelGlow.geometry}
                  material={frontTyreGLTF.materials.wheelglow}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.rimFrontLeft.geometry}
                  material={frontTyreGLTF.materials.glossy}
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
                  material={frontTyreGLTF.materials.wheelblack}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.frontLeftWheelGlow.geometry}
                  material={frontTyreGLTF.materials.wheelglow}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={frontTyreGLTF.nodes.rimFrontLeft.geometry}
                  material={frontTyreGLTF.materials.glossy}
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
                  material={rearTyreGLTF.materials.wheelblack}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rearLeftWheelGlow.geometry}
                  material={rearTyreGLTF.materials.wheelglow}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rimRearLeft.geometry}
                  material={rearTyreGLTF.materials.glossy}
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
                  material={rearTyreGLTF.materials.wheelblack}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rearLeftWheelGlow.geometry}
                  material={rearTyreGLTF.materials.wheelglow}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={rearTyreGLTF.nodes.rimRearLeft.geometry}
                  material={rearTyreGLTF.materials.glossy}
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
          offset={[0, 0.6, -2.3]}
          color={carMods.trailColor}
          height={0.4}
          width={0.05}
          length={80}
          isCar
        />
      </group>
    );
  },
);

VehicleCar02.displayName = "VehicleCar02";

export default VehicleCar02;

// preloads
useGLTF.preload(modelsSeperatedBank.runner02chassis);
useGLTF.preload(modelsSeperatedBank.runner02leftFrontTyre);
useGLTF.preload(modelsSeperatedBank.runner02leftRearTyre);
