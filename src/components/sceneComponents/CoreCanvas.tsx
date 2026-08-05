import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  Stats,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
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

const CoreScene = () => {
  // define environment check
  const isDev = import.meta.env.DEV;

  // initialize refs for all instantiated vehicles
  const carRef = useRef<THREE.Mesh>(null);
  const heliRef = useRef<THREE.Mesh>(null);
  const planeRef = useRef<THREE.Mesh>(null);

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

  // configure debug tools with dropdown options
  const { cameraDebug, activeVehicle } = useTweakpane(
    { title: "☀️ Scene" },
    {
      cameraDebug: { value: false, label: "Camera Debug" },
      activeVehicle: {
        value: activeControl as ControlState,
        label: "Current Vehicle",
        options: {
          Car: "car",
          Plane: "plane",
          Helicopter: "helicopter",
        },
      },
    },
  );

  // sync dropdown state to global store
  useEffect(() => {
    setActiveControl(activeVehicle as ControlState);
    console.log(activeVehicle);
  }, [activeVehicle, setActiveControl]);

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
      {/* dynamically route camera rig to the active vehicle */}
      <CameraRig targetRef={activeTargetRef} debugMode={cameraDebug} />
      <VehicleCar ref={carRef} />
      <VehicleHelicopter ref={heliRef} />
      <VehiclePlane ref={planeRef} />
      <City />
      <Ground />
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
