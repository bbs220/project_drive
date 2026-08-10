import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  Stats,
} from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { physcConstants } from "../../constants/physcConstants";
import { sceneConstants } from "../../constants/otherConstants";
import { useTweakpane } from "../../hooks/useTweakpane";
import { bankHDR } from "../../utils/assetpaths";
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

// pre extract global keys and urls to prevent react from recreating them every frame
const envKeys = Object.keys(bankHDR);
const envUrls = Object.values(bankHDR);

// auto generate the tweakpane dropdown options directly from the asset bank
const envOptions = envKeys.reduce(
  (acc, key) => {
    acc[key] = key;
    return acc;
  },
  {} as Record<string, string>,
);

const CoreScene = () => {
  // define environment check
  const isDev = import.meta.env.DEV;

  // initialize refs for all instantiated vehicles
  const carRef = useRef<THREE.Group>(null);
  const heliRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);

  // auto load and cache all hdris simultaneously using the updated HDRLoader
  const envTextures = useLoader(HDRLoader, envUrls);

  // strictly apply equirectangular mapping to all loaded textures
  useMemo(() => {
    envTextures.forEach((tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
    });
  }, [envTextures]);

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
  const { cameraDebug, activeVehicle, activeEnvironment } = useTweakpane(
    { title: "☀️ Scene" },
    {
      cameraDebug: { value: true, label: "camera debug" },
      activeEnvironment: {
        value: "skyNight",
        label: "environment",
        options: envOptions,
      },
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

  // find the index of the currently selected environment to apply the correct texture
  const activeIndex = envKeys.indexOf(activeEnvironment as string);
  const activeSkyMap = envTextures[activeIndex];

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
      // pass the cached texture directly to the map prop instead of fetching
      files
      <Environment map={activeSkyMap} background />
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
      </Canvas>
    </>
  );
};

export default CoreCanvas;
