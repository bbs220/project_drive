import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Environment, OrbitControls } from "@react-three/drei";

const GarageCanvas = () => {
  return (
    // tighter fov for that cinematic showroom look
    <Canvas shadows camera={{ position: [0, 2, 8], fov: 35 }}>
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[0, 10, 0]}
          intensity={2}
          penumbra={1}
          castShadow
        />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4}
          maxDistance={12}
        />
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1, 4]} />
          <meshStandardMaterial color="#00f3ff" wireframe />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial
            color="#050505"
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </Suspense>
    </Canvas>
  );
};

export default GarageCanvas;
