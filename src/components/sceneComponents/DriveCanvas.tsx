import {
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  StatsGl,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
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
import BackgroundLight from "./BackgroundLight";
import PostprocessingEffects from "./PostprocessingEffects";
import ChunkManager from "./proceduralCity/ChunkManager";
import Player from "./Player";
import { useMountSystem } from "../../hooks/useMountSystem";
import MiniMap from "../MiniMap";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";

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

  // listen to active keyboard state for the camera effects
  const controls = useAllVehicleInput();

  // determine active reference based on strict state mapping
  const activeTargetRef =
    active.control === CONTROL_STATE.HELICOPTER
      ? heliRef
      : active.control === CONTROL_STATE.PLANE
        ? planeRef
        : active.control === CONTROL_STATE.PLAYER
          ? playerRef
          : carRef;

  // configure debug tools and dynamic fov tuners
  const {
    showFPS,
    showGizmo,
    cameraDebug,
    activeVehicle,
    enableFog,
    fogNear,
    fogFar,
    fogColor,
    dynamicFov,
    maxFovValue,
    minSpeedThreshold,
    topSpeedThreshold,
    planeFovStartSpeed,
    planeFovMaxSpeed,
  } = useTweakpane(
    { title: "☀️ Scene", expanded: false },
    {
      showFPS: { value: false, label: "show fps" },
      showGizmo: { value: false, label: "show gizmo" },
      cameraDebug: { value: sceneConstants.isDev, label: "camera debug" },
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
      enableFog: { value: true, label: "enable fog", folder: "Fog" },
      fogNear: {
        value: 80,
        min: 0,
        max: 500,
        label: "fog near",
        folder: "Fog",
      },
      fogFar: {
        value: 270,
        min: 0,
        max: 10000,
        label: "fog far",
        folder: "Fog",
      },
      fogColor: { value: "#003535", label: "fog color", folder: "Fog" },

      // tuning parameters for camera warp speed
      dynamicFov: { value: true, label: "dynamic fov", folder: "FOV" },
      maxFovValue: {
        value: 80,
        min: 60,
        max: 120,
        label: "max warp fov",
        folder: "FOV",
      },
      minSpeedThreshold: {
        value: 250,
        min: 0,
        max: 500,
        label: "car fov start",
        folder: "FOV",
      },
      topSpeedThreshold: {
        value: 317,
        min: 50,
        max: 500,
        label: "car fov max",
        folder: "FOV",
      },
      // specific thresholds for the plane
      planeFovStartSpeed: {
        value: 160,
        min: 0,
        max: 300,
        label: "plane fov start",
        folder: "FOV",
      },
      planeFovMaxSpeed: {
        value: 200,
        min: 50,
        max: 300,
        label: "plane fov max",
        folder: "FOV",
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

  // dynamically stretch the camera fov based on active vehicle speed
  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const baseFov = sceneConstants.fov;

    // if disabled, immediately lerp back to normal resting fov
    if (!dynamicFov) {
      if (Math.abs(camera.fov - baseFov) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, baseFov, delta * 5);
        camera.updateProjectionMatrix();
      }
      return;
    }

    const storeState = useVehicleStore.getState();
    const activeControl = storeState.active.control;

    let currentSpeed = 0;
    let minSpeed = minSpeedThreshold as number;
    let maxSpeed = topSpeedThreshold as number;

    // pull speed/airspeed directly from your strict telemetry map
    if (activeControl === CONTROL_STATE.CAR) {
      currentSpeed = storeState.telemetry[ENTITY_ID.CAR_1].speed;

      // strictly bind the camera warp effect to active engine thrust
      // if we are not actively holding forward AND boost, immediately kill the fov stretch
      if (!controls.current.forward || !controls.current.boost) {
        currentSpeed = Math.min(currentSpeed, minSpeedThreshold as number);
      }
    } else if (activeControl === CONTROL_STATE.PLANE) {
      currentSpeed = storeState.telemetry[ENTITY_ID.PLANE_1].airspeed;
      minSpeed = planeFovStartSpeed as number;
      maxSpeed = planeFovMaxSpeed as number;
    }

    const absoluteSpeed = Math.abs(currentSpeed);

    // prevent division by zero if tweaking sliders land on the same number
    const speedRange = Math.max(maxSpeed - minSpeed, 1);

    // calculate movement factor only *after* passing the minimum threshold speed
    const speedFactor = THREE.MathUtils.clamp(
      (absoluteSpeed - minSpeed) / speedRange,
      0,
      1,
    );

    const targetFov = THREE.MathUtils.lerp(
      baseFov,
      maxFovValue as number,
      speedFactor,
    );

    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 5);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={sceneConstants.fov}
        position={[0, 0, 500]}
        near={0.01}
        far={50000}
      />
      {enableFog && <fog attach="fog" args={[fogColor, fogNear, fogFar]} />}
      <StatsGl
        className={`${showFPS ? "block" : "hidden"} fixed top-15`}
        horizontal={false}
      />
      <BackgroundLight />
      <GizmoHelper
        renderPriority={2}
        alignment="top-left"
        margin={[60, 220]}
        visible={showGizmo}
      >
        <GizmoViewport disabled visible={showGizmo} />
      </GizmoHelper>
      <CameraRig targetRef={activeTargetRef} debugMode={cameraDebug} />
      <VehicleCar ref={carRef} spawnMode={"drive"} />
      <VehicleHelicopter ref={heliRef} spawnMode={"drive"} />
      <VehiclePlane ref={planeRef} spawnMode={"drive"} />
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
      <AllVehiclesHUD />
      <MiniMap />
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
