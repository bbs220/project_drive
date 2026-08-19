import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
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

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/runner01leftFrontTyre.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh
          name="tyreFrontLeft"
          castShadow
          receiveShadow
          geometry={nodes.tyreFrontLeft.geometry}
          material={materials["Rubber.001"]}
        />
        <mesh
          name="frontLeftWheelGlow"
          castShadow
          receiveShadow
          geometry={nodes.frontLeftWheelGlow.geometry}
          material={materials["Glow.002"]}
        />
        <mesh
          name="rimFrontLeft"
          castShadow
          receiveShadow
          geometry={nodes.rimFrontLeft.geometry}
          material={materials["Chrome.001"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/runner01leftFrontTyre.glb");
