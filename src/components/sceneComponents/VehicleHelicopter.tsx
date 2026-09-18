import { forwardRef, useRef, useEffect } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import {
  RigidBody,
  type RapierRigidBody,
  RoundCuboidCollider,
} from "@react-three/rapier";
import { modelsSeperatedBank } from "../../utils/assetpaths";
import {
  vehicleHelicopterConstants,
  respawnValues,
} from "../../constants/otherConstants";
import { unwrapParam } from "../../utils/unwrapParam";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { useVehicleHelicopterCreator } from "../../hooks/useVehicleHelicopterCreator";
import type { VehicleProps } from "../../stores/useVehicleStore";
import TrailEngine from "./TrailEngine";

// define strict types for the cabin geometry
type typeCabinGLTF = GLTF & {
  nodes: {
    heliBody: THREE.Mesh;
    heilTailWingLeft: THREE.Mesh;
    heliBarrelSupport: THREE.Mesh;
    heliBarrelSupportMini: THREE.Mesh;
    heliBarrel: THREE.Mesh;
    heliTailWingRight: THREE.Mesh;
  };
  materials: { heliMat: THREE.MeshPhysicalMaterial };
};

// define strict types for the top rotor geometry
type typeTopRotorGLTF = GLTF & {
  nodes: {
    heliTopRotorCenter: THREE.Mesh;
    heliTopRotor: THREE.Mesh;
    heliTopRotorDisc: THREE.Mesh;
  };
  materials: {
    topRotorCenter: THREE.MeshPhysicalMaterial;
    topRotorBladesAlpha: THREE.MeshPhysicalMaterial;
    topRotorDisc: THREE.MeshPhysicalMaterial;
  };
};

// define strict types for the tail rotor geometry
type typeTailRotorGLTF = GLTF & {
  nodes: { heliTailRotor: THREE.Mesh };
  materials: { rearRotorBladesAlpha: THREE.MeshPhysicalMaterial };
};

// main vehicle component updated with custom six point spherical physics
const VehicleHelicopter = forwardRef<THREE.Group, VehicleProps>(
  ({ spawnMode }, ref) => {
    const initialSpawn = respawnValues[spawnMode].helicopter;

    const visualRef = useRef<THREE.Group>(null);

    // strict reference to the physics body so the hook can manipulate it
    const chassisRef = useRef<RapierRigidBody>(null);

    // refs for targeting rotor assemblies for purely visual animations
    const mainRotorRef = useRef<THREE.Group>(null);
    const tailRotorRef = useRef<THREE.Group>(null);

    // initialize global input listener to capture flight controls and structural keys
    const controls = useAllVehicleInput();

    // initialize tweakpane hook and store reactive parameters
    const params = useTweakpane(
      { title: "🚁 Helicopter Tuning", expanded: false },
      vehicleHelicopterConstants.tuning,
    );

    // extract debug boolean
    const debugMesh = unwrapParam(params.debugMesh, false);

    // attach the helicopter physics hook to handle respawning and visual resets
    useVehicleHelicopterCreator(
      chassisRef,
      mainRotorRef,
      tailRotorRef,
      controls,
      params,
    );

    // load the separated models
    const cabinGLTF = useGLTF(
      modelsSeperatedBank.helicopter01cabin,
    ) as unknown as typeCabinGLTF;
    const topRotorGLTF = useGLTF(
      modelsSeperatedBank.helicopter01topRotor,
    ) as unknown as typeTopRotorGLTF;
    const tailRotorGLTF = useGLTF(
      modelsSeperatedBank.helicopter01tailRotor,
    ) as unknown as typeTailRotorGLTF;

    // dynamically toggle wireframe directly on the shared materials
    useEffect(() => {
      cabinGLTF.materials.heliMat.wireframe = debugMesh;
      topRotorGLTF.materials.topRotorCenter.wireframe = debugMesh;
      topRotorGLTF.materials.topRotorBladesAlpha.wireframe = debugMesh;
      topRotorGLTF.materials.topRotorDisc.wireframe = debugMesh;
      tailRotorGLTF.materials.rearRotorBladesAlpha.wireframe = debugMesh;

      cabinGLTF.materials.heliMat.needsUpdate = true;
      topRotorGLTF.materials.topRotorCenter.needsUpdate = true;
      topRotorGLTF.materials.topRotorBladesAlpha.needsUpdate = true;
      topRotorGLTF.materials.topRotorDisc.needsUpdate = true;
      tailRotorGLTF.materials.rearRotorBladesAlpha.needsUpdate = true;
    }, [
      debugMesh,
      cabinGLTF.materials,
      topRotorGLTF.materials,
      tailRotorGLTF.materials,
    ]);

    // extract visual offsets using type safe utility
    const cPosX = unwrapParam(params.cabinPosX, 0);
    const cPosY = unwrapParam(params.cabinPosY, 0);
    const cPosZ = unwrapParam(params.cabinPosZ, 1);

    const mrPosX = unwrapParam(params.mainRotorPosX, 0);
    const mrPosY = unwrapParam(params.mainRotorPosY, 2.25);
    const mrPosZ = unwrapParam(params.mainRotorPosZ, -0.9);

    const trPosX = unwrapParam(params.tailRotorPosX, 0);
    const trPosY = unwrapParam(params.tailRotorPosY, 0.1);
    const trPosZ = unwrapParam(params.tailRotorPosZ, 6.46);

    return (
      <group>
        <RigidBody
          ref={chassisRef}
          colliders={false}
          canSleep={false}
          position={initialSpawn.position} // moved to rigidbody so trails stay at true 0,0,0
          rotation={initialSpawn.rotation} // moved to rigidbody
        >
          {/* replace the multiple ball colliders inside your rigid body with this */}
          <RoundCuboidCollider
            args={[
              unwrapParam(params.chassisWidth, 1.2),
              unwrapParam(params.chassisHeight, 1.5),
              unwrapParam(params.chassisLength, 3.5),
              unwrapParam(params.chassisRadius, 0.2),
            ]}
            position={[0, 0, 0]}
            mass={unwrapParam(params.chassisMass, 300)}
          />
          {/* offset group for tweakpane tuning */}
          <group position={[cPosX, cPosY, cPosZ]} ref={visualRef}>
            {/* visual elements perfectly wrapped in the forwarded ref group */}
            <group ref={ref}>
              {/* core cabin hierarchy mapped directly from blender export */}
              <group name="Scene">
                <mesh
                  name="heliBody"
                  castShadow
                  receiveShadow
                  geometry={cabinGLTF.nodes.heliBody.geometry}
                  material={cabinGLTF.materials.heliMat}
                />
                <mesh
                  name="heilTailWingLeft"
                  castShadow
                  receiveShadow
                  geometry={cabinGLTF.nodes.heilTailWingLeft.geometry}
                  material={cabinGLTF.materials.heliMat}
                />
                <mesh
                  name="heliBarrelSupport"
                  castShadow
                  receiveShadow
                  geometry={cabinGLTF.nodes.heliBarrelSupport.geometry}
                  material={cabinGLTF.materials.heliMat}
                >
                  <mesh
                    name="heliBarrelSupportMini"
                    castShadow
                    receiveShadow
                    geometry={cabinGLTF.nodes.heliBarrelSupportMini.geometry}
                    material={cabinGLTF.materials.heliMat}
                  >
                    <mesh
                      name="heliBarrel"
                      castShadow
                      receiveShadow
                      geometry={cabinGLTF.nodes.heliBarrel.geometry}
                      material={cabinGLTF.materials.heliMat}
                    />
                  </mesh>
                </mesh>
                <mesh
                  name="heliTailWingRight"
                  castShadow
                  receiveShadow
                  geometry={cabinGLTF.nodes.heliTailWingRight.geometry}
                  material={cabinGLTF.materials.heliMat}
                />
              </group>

              {/* main top rotor attached with dialable anchor */}
              <group ref={mainRotorRef} position={[mrPosX, mrPosY, mrPosZ]}>
                <mesh
                  name="heliTopRotorCenter"
                  castShadow
                  receiveShadow
                  geometry={topRotorGLTF.nodes.heliTopRotorCenter.geometry}
                  material={topRotorGLTF.materials.topRotorCenter}
                >
                  <mesh
                    name="heliTopRotor"
                    castShadow
                    receiveShadow
                    geometry={topRotorGLTF.nodes.heliTopRotor.geometry}
                    material={topRotorGLTF.materials.topRotorBladesAlpha}
                  />
                  <mesh
                    name="heliTopRotorDisc"
                    castShadow
                    receiveShadow
                    geometry={topRotorGLTF.nodes.heliTopRotorDisc.geometry}
                    material={topRotorGLTF.materials.topRotorDisc}
                  />
                </mesh>
              </group>

              {/* tail rotor attached with dialable anchor */}
              <group ref={tailRotorRef} position={[trPosX, trPosY, trPosZ]}>
                <mesh
                  name="heliTailRotor"
                  castShadow
                  receiveShadow
                  geometry={tailRotorGLTF.nodes.heliTailRotor.geometry}
                  material={tailRotorGLTF.materials.rearRotorBladesAlpha}
                />
              </group>
            </group>
          </group>
        </RigidBody>
        {/* tail trails */}
        <TrailEngine
          targetRef={visualRef}
          offset={[1.4, 0.55, 5]}
          color={"#E86B2C"}
          width={0.1}
          height={0.1}
          length={60}
        />
        <TrailEngine
          targetRef={visualRef}
          offset={[-1.4, 0.55, 5]}
          color={"#E86B2C"}
          width={0.1}
          height={0.1}
          length={60}
        />
        {/* chassis trails */}
        <TrailEngine
          targetRef={visualRef}
          offset={[-1.45, -0.58, -0.5]}
          color={"#E86B2C"}
          width={0.1}
          height={0.1}
          length={30}
        />
        <TrailEngine
          targetRef={visualRef}
          offset={[1.45, -0.58, -0.5]}
          color={"#E86B2C"}
          width={0.1}
          height={0.1}
          length={30}
        />
      </group>
    );
  },
);

// assign display name for react devtools compatibility
VehicleHelicopter.displayName = "VehicleHelicopter";

export default VehicleHelicopter;

// preload assets to prevent frame drops on mount
useGLTF.preload(modelsSeperatedBank.helicopter01cabin);
useGLTF.preload(modelsSeperatedBank.helicopter01topRotor);
useGLTF.preload(modelsSeperatedBank.helicopter01tailRotor);
