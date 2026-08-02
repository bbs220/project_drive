import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera,
  Stats,
} from "@react-three/drei";
import { sceneConstants } from "../../constants/sceneConstants";
import { physcConstants } from "../../constants/physcConstants";
import { bankHDR } from "../../utils/assetpaths";
import Ground from "./Ground";

const CoreScene = () => {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={sceneConstants.fov}
        position={[0, 5, 10]}
      />
      <OrbitControls makeDefault />
      <GizmoHelper alignment="top-left" margin={[60, 120]}>
        <GizmoViewport labelColor="white" visible />
      </GizmoHelper>
      <ambientLight />
      <Stats showPanel={0} />
      <Environment files={bankHDR.skyDay} background />
      <Ground />
    </>
  );
};

const CoreCanvas = () => {
  const { setDpr, setPhyDebug } = useTweakpane({
    setDpr: { value: 1, min: 0.1, max: 1, label: "Resolution" },
    setPhyDebug: { value: false, label: "Physics Debug" },
  });

  return (
    <Canvas shadows={"variance"} dpr={setDpr}>
      <Physics debug={setPhyDebug} gravity={physcConstants.gravity}>
        <CoreScene />
      </Physics>
    </Canvas>
  );
};

export default CoreCanvas;
