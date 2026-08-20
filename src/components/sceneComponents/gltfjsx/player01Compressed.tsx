import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
  nodes: {
    base: THREE.Mesh;
    stripes: THREE.Mesh;
  };
  materials: {
    Albedo: THREE.MeshPhysicalMaterial;
    EmmissiveParts: THREE.MeshPhysicalMaterial;
  };
};

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/player01Compressed.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh
          name="base"
          castShadow
          receiveShadow
          geometry={nodes.base.geometry}
          material={materials.Albedo}
        >
          <mesh
            name="stripes"
            castShadow
            receiveShadow
            geometry={nodes.stripes.geometry}
            material={materials.EmmissiveParts}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("/player01Compressed.glb");
