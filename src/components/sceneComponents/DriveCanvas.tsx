import { PerspectiveCamera, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { physcConstants } from "../../constants/physcConstants";
import { sceneConstants } from "../../constants/otherConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import AllVehiclesHUD from "./AllVehiclesHUD";
import CameraRig from "./CameraRig";
import VehicleCar from "./VehicleCar";
import VehicleHelicopter from "./VehicleHelicopter";
import VehiclePlane from "./VehiclePlane";
import {
  useVehicleStore,
  type ControlState,
} from "../../stores/useVehicleStore";
import ProceduralRadar from "../ProceduralRadar";
import BackgroundLight from "./BackgroundLight";
import PostprocessingEffects from "./PostprocessingEffects";
import ChunkManager from "./ChunkManager";
import Player from "./Player";

const DriveScene = () => {
  // initialize refs for all instantiated vehicles and player
  const carRef = useRef<THREE.Group>(null);
  const heliRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group>(null);

  // fetch active vehicle and setter from global store
  const activeControl = useVehicleStore((state) => state.activeControl);
  const setActiveControl = useVehicleStore((state) => state.setActiveControl);

  // determine active reference based on state mapping
  const activeTargetRef =
    activeControl === "helicopter"
      ? heliRef
      : activeControl === "plane"
        ? planeRef
        : activeControl === "on_foot"
          ? playerRef
          : carRef;

  // configure debug tools with dynamic dropdown options
  const { cameraDebug, activeVehicle } = useTweakpane(
    { title: "☀️ Scene" },
    {
      cameraDebug: { value: true, label: "camera debug" },
      activeVehicle: {
        value: activeControl as ControlState,
        label: "current vehicle",
        options: {
          on_foot: "on_foot",
          car: "car",
          helicopter: "helicopter",
          plane: "plane",
        },
      },
    },
  );

  // sync dropdown state to global store
  useEffect(() => {
    setActiveControl(activeVehicle as ControlState);
  }, [activeVehicle, setActiveControl]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={sceneConstants.fov}
        position={[0, 5, 10]}
      />
      <Stats showPanel={sceneConstants.isDev ? 0 : 4} />
      <BackgroundLight />
      <CameraRig targetRef={activeTargetRef} debugMode={cameraDebug} />
      <Player ref={playerRef} />
      <VehicleCar ref={carRef} />
      <VehicleHelicopter ref={heliRef} />
      <VehiclePlane ref={planeRef} />
      <ChunkManager targetRef={activeTargetRef} />
    </>
  );
};

const DriveCanvas = () => {
  // configure main canvas physics and rendering
  const { setDpr, setPhyDebug } = useTweakpane(
    { title: "☀️ Scene", expanded: true },
    {
      setDpr: {
        value: 1,
        min: 0.1,
        max: 1,
        step: 0.1,
        label: "viewport resolution",
      },
      setPhyDebug: { value: false, label: "physics debug" },
    },
  );

  return (
    <>
      {sceneConstants.isDev && <ProceduralRadar />}
      <AllVehiclesHUD />
      <Canvas shadows={"soft"} dpr={setDpr}>
        <Physics debug={setPhyDebug} gravity={physcConstants.gravity}>
          <DriveScene />
        </Physics>
        <PostprocessingEffects />
      </Canvas>
    </>
  );
};

export default DriveCanvas;
