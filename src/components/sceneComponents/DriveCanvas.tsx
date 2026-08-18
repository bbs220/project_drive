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
  CONTROL_STATE,
  ENTITY_ID,
  type TypeControlState,
  type TypeEntityId,
} from "../../stores/useVehicleStore";
import ProceduralRadar from "../ProceduralRadar";
import BackgroundLight from "./BackgroundLight";
import PostprocessingEffects from "./PostprocessingEffects";
import ChunkManager from "./ChunkManager";
import Player from "./Player";
import { useMountSystem } from "../../hooks/useMountSystem";

const DriveScene = () => {
  // initialize refs for all instantiated vehicles and player
  const carRef = useRef<THREE.Group>(null);
  const heliRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group>(null);

  useMountSystem();

  // fetch active object (containing control type and entity id) and setter
  const active = useVehicleStore((state) => state.active);
  const setActive = useVehicleStore((state) => state.setActive);

  // determine active reference based on strict state mapping
  const activeTargetRef =
    active.control === CONTROL_STATE.HELICOPTER
      ? heliRef
      : active.control === CONTROL_STATE.PLANE
        ? planeRef
        : active.control === CONTROL_STATE.PLAYER
          ? playerRef
          : carRef;

  // configure debug tools with dynamic dropdown options pulling from the enum
  const { cameraDebug, activeVehicle } = useTweakpane(
    { title: "☀️ Scene" },
    {
      cameraDebug: { value: true, label: "camera debug" },
      activeVehicle: {
        value: active.control,
        label: "current vehicle",
        options: {
          player: CONTROL_STATE.PLAYER,
          car: CONTROL_STATE.CAR,
          helicopter: CONTROL_STATE.HELICOPTER,
          plane: CONTROL_STATE.PLANE,
        },
      },
    },
  );

  // sync dropdown state to global store using strict ECS entity mappings
  useEffect(() => {
    // deduce the correct entity id based on the dropdown selection
    let targetEntity: TypeEntityId = ENTITY_ID.PLAYER_1;

    if (activeVehicle === CONTROL_STATE.CAR) targetEntity = ENTITY_ID.CAR_1;
    if (activeVehicle === CONTROL_STATE.HELICOPTER)
      targetEntity = ENTITY_ID.HELI_1;
    if (activeVehicle === CONTROL_STATE.PLANE) targetEntity = ENTITY_ID.PLANE_1;

    // push both the class and the instance ID to the store
    setActive(activeVehicle as TypeControlState, targetEntity);
  }, [activeVehicle, setActive]);

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
      <VehicleCar ref={carRef} />
      <VehicleHelicopter ref={heliRef} />
      <VehiclePlane ref={planeRef} />
      <Player ref={playerRef} />
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
