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
  vehicleRespawnPos,
  vehicleRespawnRot,
} from "../../constants/otherConstants";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import { modelsSeperatedBank } from "../../utils/assetpaths";

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
  materials: {
    Chopper_material: THREE.MeshPhysicalMaterial;
  };
};

// define strict types for the top rotor geometry
type typeTopRotorGLTF = GLTF & {
  nodes: {
    heliTopRotorCenter: THREE.Mesh;
    heliTopRotor: THREE.Mesh;
    heliTopRotorDisc: THREE.Mesh;
  };
  materials: {
    ["Chopper_material.002"]: THREE.MeshPhysicalMaterial;
    ["rotor_blades_material.001"]: THREE.MeshPhysicalMaterial;
    ["chopper_rotors.001"]: THREE.MeshPhysicalMaterial;
  };
};

// define strict types for the tail rotor geometry
type typeTailRotorGLTF = GLTF & {
  nodes: {
    heliTailRotor: THREE.Mesh;
  };
  materials: {
    ["rear_rotors.002"]: THREE.MeshPhysicalMaterial;
  };
};

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
    { title: "helicopter tuning", expanded: false },
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

  return (
    <group>
      <RigidBody
        ref={chassisRef}
        colliders={false}
        friction={vehicleHelicopterConstants.physics.friction}
        position={vehicleRespawnPos.helicopter}
        rotation={[
          vehicleRespawnRot.helicopter.x,
          vehicleRespawnRot.helicopter.y,
          vehicleRespawnRot.helicopter.z,
        ]}
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

        {/* visual elements perfectly wrapped in the forwarded ref group */}
        <group ref={ref}>
          {/* core cabin hierarchy mapped directly from blender export */}
          <group name="Scene">
            <group name="origin">
              <mesh
                name="heliBody"
                castShadow
                receiveShadow
                geometry={cabinGLTF.nodes.heliBody.geometry}
                material={cabinGLTF.materials.Chopper_material}
              >
                <mesh
                  name="heilTailWingLeft"
                  castShadow
                  receiveShadow
                  geometry={cabinGLTF.nodes.heilTailWingLeft.geometry}
                  material={cabinGLTF.materials.Chopper_material}
                />
                <mesh
                  name="heliBarrelSupport"
                  castShadow
                  receiveShadow
                  geometry={cabinGLTF.nodes.heliBarrelSupport.geometry}
                  material={cabinGLTF.materials.Chopper_material}
                >
                  <mesh
                    name="heliBarrelSupportMini"
                    castShadow
                    receiveShadow
                    geometry={cabinGLTF.nodes.heliBarrelSupportMini.geometry}
                    material={cabinGLTF.materials.Chopper_material}
                  >
                    <mesh
                      name="heliBarrel"
                      castShadow
                      receiveShadow
                      geometry={cabinGLTF.nodes.heliBarrel.geometry}
                      material={cabinGLTF.materials.Chopper_material}
                    />
                  </mesh>
                </mesh>
                <mesh
                  name="heliTailWingRight"
                  castShadow
                  receiveShadow
                  geometry={cabinGLTF.nodes.heliTailWingRight.geometry}
                  material={cabinGLTF.materials.Chopper_material}
                />
              </mesh>
            </group>
          </group>

          {/* main top rotor animated via physics hook */}
          <group
            ref={mainRotorRef}
            position={[
              vehicleHelicopterConstants.physics.zeroVector,
              params.cabinHeight / 2 +
                vehicleHelicopterConstants.visuals.mainRotorOffset,
              vehicleHelicopterConstants.physics.zeroVector,
            ]}
          >
            <mesh
              name="heliTopRotorCenter"
              castShadow
              receiveShadow
              geometry={topRotorGLTF.nodes.heliTopRotorCenter.geometry}
              material={topRotorGLTF.materials["Chopper_material.002"]}
            >
              <mesh
                name="heliTopRotor"
                castShadow
                receiveShadow
                geometry={topRotorGLTF.nodes.heliTopRotor.geometry}
                material={topRotorGLTF.materials["rotor_blades_material.001"]}
              />
              <mesh
                name="heliTopRotorDisc"
                castShadow
                receiveShadow
                geometry={topRotorGLTF.nodes.heliTopRotorDisc.geometry}
                material={topRotorGLTF.materials["chopper_rotors.001"]}
              />
            </mesh>
          </group>

          {/* tail rotor animated via physics hook */}
          <group
            ref={tailRotorRef}
            position={vehicleHelicopterConstants.visuals.tailRotorGroupPos}
          >
            <mesh
              name="heliTailRotor"
              castShadow
              receiveShadow
              geometry={tailRotorGLTF.nodes.heliTailRotor.geometry}
              material={tailRotorGLTF.materials["rear_rotors.002"]}
            />
          </group>
        </group>
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools compatibility
VehicleHelicopter.displayName = "VehicleHelicopter";

export default VehicleHelicopter;

// preload assets to prevent frame drops on mount
useGLTF.preload(modelsSeperatedBank.helicopter01cabin);
useGLTF.preload(modelsSeperatedBank.helicopter01topRotor);
useGLTF.preload(modelsSeperatedBank.helicopter01tailRotor);
