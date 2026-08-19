import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
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

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/runner01leftRearTyre.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh
          name="tyreRearLeft"
          castShadow
          receiveShadow
          geometry={nodes.tyreRearLeft.geometry}
          material={materials["Rubber.002"]}
        />
        <mesh
          name="rearLeftWheelGlow"
          castShadow
          receiveShadow
          geometry={nodes.rearLeftWheelGlow.geometry}
          material={materials["Glow.001"]}
        />
        <mesh
          name="rimRearLeft"
          castShadow
          receiveShadow
          geometry={nodes.rimRearLeft.geometry}
          material={materials["Chrome.002"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/runner01leftRearTyre.glb");
