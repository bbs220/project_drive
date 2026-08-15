import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import { RigidBody, BallCollider } from "@react-three/rapier";
import { modelsSeperatedBank } from "../../utils/assetpaths";
import {
  vehicleHelicopterConstants,
  vehicleRespawnValues,
} from "../../constants/otherConstants";
import { unwrapParam } from "../../utils/unwrapParam";

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
  materials: { Chopper_material: THREE.MeshPhysicalMaterial };
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
  nodes: { heliTailRotor: THREE.Mesh };
  materials: { ["rear_rotors.002"]: THREE.MeshPhysicalMaterial };
};

// main vehicle component updated with custom six point spherical physics
const VehicleHelicopter = forwardRef<THREE.Group>((_props, ref) => {
  // refs for targeting rotor assemblies for purely visual animations later if needed
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  // initialize tweakpane hook and store reactive parameters
  const params = useTweakpane(
    { title: "🚁 Helicopter Tuning", expanded: false },
    vehicleHelicopterConstants.tuning,
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

  // extract six point physics parameters
  const centerRadius = unwrapParam(params.centerRadius, 1.5);
  const centerMass = unwrapParam(params.centerMass, 150);

  const skidRadius = unwrapParam(params.skidRadius, 0.4);
  const skidMass = unwrapParam(params.skidMass, 15);
  const skidWidth = unwrapParam(params.skidWidth, 1.2);
  const skidLength = unwrapParam(params.skidLength, 2.0);
  const skidHeight = unwrapParam(params.skidHeight, -1.2);

  const tailRadius = unwrapParam(params.tailRadius, 0.6);
  const tailMass = unwrapParam(params.tailMass, 20);
  const tailPosZ = unwrapParam(params.tailPosZ, 6.0);
  const tailPosY = unwrapParam(params.tailPosY, 0.5);

  return (
    <group
      position={vehicleRespawnValues.helicopter.position}
      rotation={vehicleRespawnValues.helicopter.rotation}
    >
      <RigidBody colliders={false} canSleep={false}>
        {/* big center ball for majority of the mass */}
        <BallCollider
          args={[centerRadius]}
          position={[0, 0, 0]}
          mass={centerMass}
        />

        {/* front left skid */}
        <BallCollider
          args={[skidRadius]}
          position={[skidWidth, skidHeight, -skidLength]}
          mass={skidMass}
        />
        {/* front right skid */}
        <BallCollider
          args={[skidRadius]}
          position={[-skidWidth, skidHeight, -skidLength]}
          mass={skidMass}
        />
        {/* rear left skid */}
        <BallCollider
          args={[skidRadius]}
          position={[skidWidth, skidHeight, skidLength]}
          mass={skidMass}
        />
        {/* rear right skid */}
        <BallCollider
          args={[skidRadius]}
          position={[-skidWidth, skidHeight, skidLength]}
          mass={skidMass}
        />

        {/* tail ball for rotational inertia and strikes */}
        <BallCollider
          args={[tailRadius]}
          position={[0, tailPosY, tailPosZ]}
          mass={tailMass}
        />

        {/* offset group for tweakpane tuning */}
        <group position={[cPosX, cPosY, cPosZ]}>
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

            {/* main top rotor attached with dialable anchor */}
            <group ref={mainRotorRef} position={[mrPosX, mrPosY, mrPosZ]}>
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

            {/* tail rotor attached with dialable anchor */}
            <group ref={tailRotorRef} position={[trPosX, trPosY, trPosZ]}>
              <mesh
                name="heliTailRotor"
                castShadow
                receiveShadow
                geometry={tailRotorGLTF.nodes.heliTailRotor.geometry}
                material={tailRotorGLTF.materials["rear_rotors.002"]}
              />
            </group>
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
