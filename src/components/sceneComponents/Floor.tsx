import { MeshReflectorMaterial } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

const Floor = () => {
  return (
    // slightly lower the floor to prevent any z-fighting with tires
    <RigidBody type="fixed" colliders={"cuboid"}>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[100, 100]} />
        {/* incredibly optimized real-time reflection material */}
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={0.15}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.8}
          mirror={1}
        />
      </mesh>
    </RigidBody>
  );
};

export default Floor;
