import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  Stats,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { physcConstants } from "../../constants/physcConstants";
import {
  sceneConstants,
  terrainConstants,
} from "../../constants/sceneConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import { bankHDR } from "../../utils/assetpaths";
import AllVehiclesHUD from "./AllVehiclesHUD";
import CameraRig from "./CameraRig";
import City from "./City";
import Terrain from "./Terrain";
import VehicleCar from "./VehicleCar";

const CoreScene = () => {
  const isDev = import.meta.env.DEV;
  const terrainParams = useTweakpane(
    { title: "🏞️ Terrain Tuning", expanded: false },
    terrainConstants,
  );
  const carRef = useRef<THREE.Mesh>(null);

  const { cameraDebug } = useTweakpane(
    { title: "☀️ Scene" },
    {
      cameraDebug: { value: false, label: "Camera Debug" },
    },
  );

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={sceneConstants.fov}
        position={[0, 5, 10]}
      />
      <GizmoHelper alignment="top-left" margin={[60, 120]} visible={isDev}>
        <GizmoViewport labelColor="white" visible={isDev} disabled />
      </GizmoHelper>
      <ambientLight />
      <Stats showPanel={isDev ? 0 : 4} />
      <Environment files={bankHDR.skyDay} background />
      <CameraRig targetRef={carRef} debugMode={cameraDebug} />
      <VehicleCar ref={carRef} />
      <Terrain params={terrainParams} />
      <City terrainParams={terrainParams} />
    </>
  );
};

const CoreCanvas = () => {
  const { setDpr, setPhyDebug } = useTweakpane(
    { title: "☀️ Scene", expanded: true },
    {
      setDpr: {
        value: 1,
        min: 0.1,
        max: 1,
        step: 0.1,
        label: "Viewport Resolution",
      },
      setPhyDebug: { value: false, label: "Physics Debug" },
    },
  );

  return (
    <>
      <Canvas shadows={"variance"} dpr={setDpr}>
        <Physics debug={setPhyDebug} gravity={physcConstants.gravity}>
          <CoreScene />
        </Physics>
      </Canvas>
      <AllVehiclesHUD />
    </>
  );
};

export default CoreCanvas;
