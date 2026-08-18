import { Canvas } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Stats,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { sceneConstants } from "../../constants/otherConstants";
import Floor from "./Floor";
import PostprocessingEffects from "./PostprocessingEffects";
import { useTweakpane } from "../../hooks/useTweakpane";
import { bankHDR } from "../../utils/assetpaths";
import { Physics } from "@react-three/rapier";
import CustomizationUI from "../CustomizationUI";

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

      <Environment files={bankHDR.studio} environmentIntensity={0.4} />

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
  // configure main canvas physics and rendering
  const { setDpr } = useTweakpane(
    { title: "☀️ Scene", expanded: true },
    {
      setDpr: {
        value: 1,
        min: 0.1,
        max: 1,
        step: 0.1,
        label: "viewport resolution",
      },
    },
  );

  return (
    // enabling shadows is critical for the showroom aesthetic
    <>
      <Canvas shadows={"soft"} dpr={setDpr}>
        <Physics>
          <GarageScene />
          <PostprocessingEffects />
        </Physics>
      </Canvas>
      <CustomizationUI />
    </>
  );
};

export default GarageCanvas;
