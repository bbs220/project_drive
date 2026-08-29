import { PerspectiveCamera, Stats } from "@react-three/drei";
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

  // configure debug tools and dynamic fov tuners
  const {
    showFPS,
    cameraDebug,
    activeVehicle,
    fogValue,
    fogColor,
    dynamicFov,
    maxFovValue,
    minSpeedThreshold,
    topSpeedThreshold,
  } = useTweakpane(
    { title: "☀️ Scene" },
    {
      showFPS: { value: false, label: "show fps" },
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
      fogValue: { value: 0.0, min: 0, max: 1, label: "fog amount" },
      fogColor: { value: "#003535", label: "fog color" },

      // tuning parameters for camera warp speed
      dynamicFov: { value: true, label: "dynamic fov" },
      maxFovValue: { value: 80, min: 60, max: 120, label: "max warp fov" },
      minSpeedThreshold: {
        value: 250,
        min: 0,
        max: 500,
        label: "fov start speed",
      },
      topSpeedThreshold: {
        value: 317,
        min: 50,
        max: 500,
        label: "fov max speed",
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

    // pull speed/airspeed directly from your strict telemetry map
    if (activeControl === CONTROL_STATE.CAR) {
      currentSpeed = storeState.telemetry[ENTITY_ID.CAR_1].speed;
    }

    const minSpeed = minSpeedThreshold as number;
    const maxSpeed = topSpeedThreshold as number;
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
      <fogExp2 attach="fog" args={[fogColor as string, fogValue as number]} />
      <Stats showPanel={showFPS ? 0 : 4} />
      <gridHelper args={[300, 1, "white", "orange"]} position={[0, 60, 0]} />
      <BackgroundLight />
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
