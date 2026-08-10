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
import City from "./City";
import Ground from "./Ground";
import VehicleCar from "./VehicleCar";
import VehicleHelicopter from "./VehicleHelicopter";
import VehiclePlane from "./VehiclePlane";
import {
  useVehicleStore,
  type ControlState,
} from "../../stores/useVehicleStore";
import ProceduralChunk from "./ProceduralChunk";
import ProceduralRadar from "../ProceduralRadar";
import BackgroundLight from "./BackgroundLight";
import PostprocessingEffects from "./PostprocessingEffects";

const CoreScene = () => {
  // define environment check
  const isDev = import.meta.env.DEV;

  // initialize refs for all instantiated vehicles
  const carRef = useRef<THREE.Group>(null);
  const heliRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);

  // fetch active vehicle and setter from global store
  const activeControl = useVehicleStore((state) => state.activeControl);
  const setActiveControl = useVehicleStore((state) => state.setActiveControl);

  // determine active reference based on state
  const activeTargetRef =
    activeControl === "helicopter"
      ? heliRef
      : activeControl === "plane"
        ? planeRef
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
          car: "car",
          plane: "plane",
          helicopter: "helicopter",
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
      <ambientLight />
      <Stats showPanel={isDev ? 0 : 4} />
      <BackgroundLight />
      <CameraRig targetRef={activeTargetRef} debugMode={cameraDebug} />
      <VehicleCar ref={carRef} />
      <VehicleHelicopter ref={heliRef} />
      <VehiclePlane ref={planeRef} />
      <City />
      <Ground />
      <ProceduralChunk />
    </>
  );
};

const CoreCanvas = () => {
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
      <ProceduralRadar />
      <AllVehiclesHUD />
      <Canvas shadows={"variance"} dpr={setDpr}>
        <Physics debug={setPhyDebug} gravity={physcConstants.gravity}>
          <CoreScene />
        </Physics>
        <PostprocessingEffects />
      </Canvas>
    </>
  );
};

export default CoreCanvas;
