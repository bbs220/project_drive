import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
  nodes: {
    chassis: THREE.Mesh;
    chassisDisplayGlow: THREE.Mesh;
    chassisGlow: THREE.Mesh;
    displayScreen: THREE.Mesh;
    seats: THREE.Mesh;
  };
  materials: {
    baseMetal_MAT: THREE.MeshStandardMaterial;
    PaletteMaterial001: THREE.MeshStandardMaterial;
    PaletteMaterial002: THREE.MeshStandardMaterial;
    Screens: THREE.MeshStandardMaterial;
    Seat: THREE.MeshStandardMaterial;
  };
};

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/runner01chassis.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh
          name="chassis"
          castShadow
          receiveShadow
          geometry={nodes.chassis.geometry}
          material={materials.baseMetal_MAT}
        />
        <mesh
          name="chassisDisplayGlow"
          castShadow
          receiveShadow
          geometry={nodes.chassisDisplayGlow.geometry}
          material={materials.PaletteMaterial001}
        />
        <mesh
          name="chassisGlow"
          castShadow
          receiveShadow
          geometry={nodes.chassisGlow.geometry}
          material={materials.PaletteMaterial002}
        />
        <mesh
          name="displayScreen"
          castShadow
          receiveShadow
          geometry={nodes.displayScreen.geometry}
          material={materials.Screens}
        />
        <mesh
          name="seats"
          castShadow
          receiveShadow
          geometry={nodes.seats.geometry}
          material={materials.Seat}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/runner01chassis.glb");
