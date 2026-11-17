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
import VehicleCar01 from "./VehicleCar01";
import VehicleCar02 from "./VehicleCar02";
import VehicleHelicopter01 from "./VehicleHelicopter01";
import VehiclePlane01 from "./VehiclePlane01";
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
  type TypeEntityId,
} from "../../stores/useVehicleStore";
import BackgroundLight from "./BackgroundLight";
import PostprocessingEffects from "./PostprocessingEffects";
import ChunkManager from "./proceduralCity/ChunkManager";
import Player from "./Player";
import { useMountSystem } from "../../hooks/useMountSystem";
import MiniMap, { MiniMapFBO } from "../MiniMap";
import PlayButtonUI from "../PlayButtonUI";
import { useUIStore } from "../../stores/useUIStore";

const DriveScene = () => {
  // initialize refs for all instantiated vehicles and player
  const carRef = useRef<THREE.Group>(null);
  const car02Ref = useRef<THREE.Group>(null);
  const heliRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group>(null);

  // listen to active keyboard state for the camera effects
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
          : active.entity === ENTITY_ID.CAR_2
            ? car02Ref
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
  } = useTweakpane(
    { title: "☀️ Scene", expanded: false },
    {
      showFPS: { value: true, label: "show fps" },
      showGizmo: { value: true, label: "show gizmo" },
      cameraDebug: { value: sceneConstants.isDev, label: "camera debug" },
      activeVehicle: {
        value: active.entity,
        label: "current vehicle",
        options: {
          player: ENTITY_ID.PLAYER_1,
          car01: ENTITY_ID.CAR_1,
          car02: ENTITY_ID.CAR_2,
          helicopter01: ENTITY_ID.HELI_1,
          plane01: ENTITY_ID.PLANE_1,
        },
      },
      enableFog: { value: false, label: "enable fog", folder: "Fog" },
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
    },
  );

  // sync dropdown state to global store using strict ECS entity mappings
  useEffect(() => {
    // deduce the correct entity id based on the dropdown selection
    if (
      activeVehicle === ENTITY_ID.CAR_1 ||
      activeVehicle === ENTITY_ID.CAR_2
    ) {
      setActive(CONTROL_STATE.CAR, activeVehicle as TypeEntityId);
    } else if (activeVehicle === ENTITY_ID.HELI_1) {
      setActive(CONTROL_STATE.HELICOPTER, activeVehicle as TypeEntityId);
    } else if (activeVehicle === ENTITY_ID.PLANE_1) {
      setActive(CONTROL_STATE.PLANE, activeVehicle as TypeEntityId);
    } else {
      setActive(CONTROL_STATE.PLAYER, ENTITY_ID.PLAYER_1);
    }
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
    const activeEntity = storeState.active.entity;

    // pull speed/airspeed directly from your strict telemetry map
    // strictly bind the camera warp effect to active engine thrust
    const speedFactor = storeState.telemetry[activeEntity]?.warpFactor ?? 0;

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
        margin={[48, 210]}
        visible={showGizmo}
      >
        <group scale={[0.9, 0.9, 0.9]}>
          <GizmoViewport labelColor="white" visible={showGizmo} disabled />
        </group>
      </GizmoHelper>
      <CameraRig targetRef={activeTargetRef} debugMode={cameraDebug} />
      <VehicleCar01 ref={carRef} spawnMode={"drive"} />
      <VehicleCar02 ref={car02Ref} spawnMode={"drive"} />
      <VehicleHelicopter01 ref={heliRef} spawnMode={"drive"} />
      <VehiclePlane01 ref={planeRef} spawnMode={"drive"} />
      <Player ref={playerRef} />
      <ChunkManager targetRef={activeTargetRef} />
      {/* 3d lot numbering and clearance overlay */}
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

  const isPaused = useUIStore((state) => state.isPaused);

  return (
    <>
      <AllVehiclesHUD />
      <MiniMap />
      <PlayButtonUI />
      <Canvas
        aria-label="3D Cyberpunk City Simulation"
        role="img"
        shadows={"soft"}
        dpr={setDpr}
      >
        {/* synchronize rapier physics simulation with global pause state */}
        <Physics
          debug={setPhyDebug}
          gravity={physcConstants.gravity}
          paused={isPaused}
        >
          <DriveScene />
        </Physics>
        <PostprocessingEffects />
        <MiniMapFBO />
      </Canvas>
    </>
  );
};

export default DriveCanvas;
