import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
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

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/lightHelicopter01topRotor.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh
          name="heliTopRotorCenter"
          castShadow
          receiveShadow
          geometry={nodes.heliTopRotorCenter.geometry}
          material={materials["Chopper_material.002"]}
        >
          <mesh
            name="heliTopRotor"
            castShadow
            receiveShadow
            geometry={nodes.heliTopRotor.geometry}
            material={materials["rotor_blades_material.001"]}
          />
          <mesh
            name="heliTopRotorDisc"
            castShadow
            receiveShadow
            geometry={nodes.heliTopRotorDisc.geometry}
            material={materials["chopper_rotors.001"]}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("/lightHelicopter01topRotor.glb");
