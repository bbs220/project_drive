import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Stats, OrbitControls } from "@react-three/drei";
import BackgroundLight from "./BackgroundLight";
import { sceneConstants } from "../../constants/otherConstants";
import Floor from "./Floor";

const GarageScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault fov={35} position={[0, 3, 8]} />
      <Stats showPanel={sceneConstants.isDev ? 0 : 4} />
      <fog attach="fog" args={["black", 150, 400]} />

      {/* lock the camera so the user cannot clip under the floor */}
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={12}
      />

      <BackgroundLight />

      {/* quad spotlight setup targeting the center origin */}
      {/* front right */}
      <spotLight
        position={[4, 5, 4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />
      {/* front left */}
      <spotLight
        position={[-4, 5, 4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />
      {/* back right */}
      <spotLight
        position={[4, 5, -4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />
      {/* back left */}
      <spotLight
        position={[-4, 5, -4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />

      {/* core showroom floor */}
      <Floor />

      {/* temporary dummy vehicle to test reflections and lighting */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#00f3ff" wireframe={false} />
      </mesh>
    </>
  );
};

const GarageCanvas = () => {
  return (
    // enabling shadows is critical for the showroom aesthetic
    <Canvas shadows={"variance"}>
      <GarageScene />
    </Canvas>
  );
};

export default GarageCanvas;
