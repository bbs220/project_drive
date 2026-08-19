import { useMemo } from "react";
import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

const Floor = () => {
  const baseDistortionTex = useTexture("/normal.jpg");

  const distortionTex = useMemo(() => {
    const clonedTex = baseDistortionTex.clone();
    clonedTex.wrapS = clonedTex.wrapT = THREE.RepeatWrapping;
    clonedTex.repeat.set(100, 100);
    clonedTex.needsUpdate = true;
    return clonedTex;
  }, [baseDistortionTex]);

  return (
    <RigidBody type="fixed" colliders={"cuboid"}>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[300, 300]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={0.15}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#003535"
          metalness={0.8}
          mirror={1}
          normalMap={distortionTex}
        />
      </mesh>
    </RigidBody>
  );
};

// preload the texture so it doesn't pop in late
useTexture.preload("/normal.jpg");

export default Floor;
