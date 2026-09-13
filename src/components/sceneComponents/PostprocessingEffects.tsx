import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  DepthOfField,
  ChromaticAberration,
  SMAA,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { SpeedLines } from "./SpeedLinesEffect";

// Import vehicle store for live speed telemetry
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
} from "../../stores/useVehicleStore";

const PostprocessingEffects = () => {
  const {
    enableBloom,
    bloomIntensity,
    luminanceThreshold,
    luminanceSmoothing,
    enableDoF,
    focusDistance,
    focalLength,
    bokehScale,
    enableCA,
    caOffsetX,
    caOffsetY,
    enableSpeedLines,
    speedLinesRadius,
    minCarSpeed,
    maxCarSpeed,
    minPlaneSpeed,
    maxPlaneSpeed,
    enableSMAA,
  } = useTweakpane(
    { title: "🌟 Post-Processing", expanded: false },
    {
      enableBloom: { value: true, folder: "Bloom", label: "enable" },
      bloomIntensity: {
        value: 1.5,
        min: 0.0,
        max: 10.0,
        step: 0.1,
        folder: "Bloom",
        label: "intensity",
      },
      luminanceThreshold: {
        value: 0.1,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Bloom",
        label: "threshold",
      },
      luminanceSmoothing: {
        value: 0.9,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Bloom",
        label: "smoothing",
      },

      enableDoF: { value: false, folder: "Depth of Field", label: "enable" },
      focusDistance: {
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.001,
        folder: "Depth of Field",
        label: "focus distance",
      },
      focalLength: {
        value: 0.02,
        min: 0.0,
        max: 1.0,
        step: 0.001,
        folder: "Depth of Field",
        label: "focal length",
      },
      bokehScale: {
        value: 2.0,
        min: 0.0,
        max: 10.0,
        step: 0.1,
        folder: "Depth of Field",
        label: "bokeh scale",
      },

      enableCA: {
        value: true,
        folder: "Chromatic Aberration",
        label: "enable",
      },
      caOffsetX: {
        value: 0.002,
        min: -0.05,
        max: 0.05,
        step: 0.001,
        folder: "Chromatic Aberration",
        label: "max offset X",
      },
      caOffsetY: {
        value: 0.002,
        min: -0.05,
        max: 0.05,
        step: 0.001,
        folder: "Chromatic Aberration",
        label: "max offset Y",
      },

      enableSpeedLines: { value: true, folder: "Speedlines", label: "enable" },
      speedLinesRadius: {
        value: 0.4,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Speedlines",
        label: "radius",
      },

      // Shared thresholds for warp effects (CA & Speedlines)
      minCarSpeed: {
        value: 250,
        min: 0,
        max: 500,
        folder: "Speed Thresholds",
        label: "car min speed",
      },
      maxCarSpeed: {
        value: 317,
        min: 50,
        max: 500,
        folder: "Speed Thresholds",
        label: "car max speed",
      },
      minPlaneSpeed: {
        value: 160,
        min: 0,
        max: 300,
        folder: "Speed Thresholds",
        label: "plane min speed",
      },
      maxPlaneSpeed: {
        value: 200,
        min: 50,
        max: 300,
        folder: "Speed Thresholds",
        label: "plane max speed",
      },
      enableSMAA: {
        value: true,
        label: "SMAA",
        folder: "Anti Aliasing",
      },
    },
  );

  // Create a direct reference to the Chromatic Aberration effect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caRef = useRef<any>(null);

  // --- HIGH PERFORMANCE RENDER LOOP ---
  useFrame((_, delta) => {
    if (!caRef.current || !enableCA) return;

    const state = useVehicleStore.getState();
    const activeControl = state.active.control;
    const activeEntity = state.active.entity;

    let targetIntensity = 0;

    if (activeControl === CONTROL_STATE.CAR) {
      const carTelemetry =
        state.telemetry[activeEntity as typeof ENTITY_ID.CAR_1];
      const currentSpeed = Math.abs(carTelemetry?.speed || 0);

      // strictly bounds the effect for the car's speed thresholds
      targetIntensity = THREE.MathUtils.smoothstep(
        currentSpeed,
        minCarSpeed as number,
        maxCarSpeed as number,
      );
    } else if (activeControl === CONTROL_STATE.PLANE) {
      const planeTelemetry =
        state.telemetry[activeEntity as typeof ENTITY_ID.PLANE_1];
      const currentSpeed = Math.abs(planeTelemetry?.airspeed || 0);

      // strictly bounds the effect for the plane's speed thresholds
      targetIntensity = THREE.MathUtils.smoothstep(
        currentSpeed,
        minPlaneSpeed as number,
        maxPlaneSpeed as number,
      );
    }

    // Use the Tweakpane values as the "Max" values
    const targetX = targetIntensity * (caOffsetX as number);
    const targetY = targetIntensity * (caOffsetY as number);

    // Smoothly lerp the current offset so it transitions beautifully
    const currentX = caRef.current.offset.x;
    const currentY = caRef.current.offset.y;

    caRef.current.offset.set(
      THREE.MathUtils.lerp(currentX, targetX, delta * 5.0),
      THREE.MathUtils.lerp(currentY, targetY, delta * 5.0),
    );
  });

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      {enableBloom && (
        <Bloom
          mipmapBlur
          intensity={bloomIntensity as number}
          luminanceThreshold={luminanceThreshold as number}
          luminanceSmoothing={luminanceSmoothing as number}
        />
      )}

      {enableDoF && (
        <DepthOfField
          focusDistance={focusDistance as number}
          focalLength={focalLength as number}
          bokehScale={bokehScale as number}
        />
      )}

      {/* Attach the ref here. The initial offset is 0,0 and our useFrame handles the rest! */}
      {enableCA && (
        <ChromaticAberration ref={caRef} offset={new THREE.Vector2(0, 0)} />
      )}

      {/* Pass the Tweakpane thresholds dynamically into the custom shader component */}
      {enableSpeedLines && (
        <SpeedLines
          radius={speedLinesRadius as number}
          minCarSpeed={minCarSpeed as number}
          maxCarSpeed={maxCarSpeed as number}
          minPlaneSpeed={minPlaneSpeed as number}
          maxPlaneSpeed={maxPlaneSpeed as number}
        />
      )}

      {enableSMAA && <SMAA />}
    </EffectComposer>
  );
};

export default PostprocessingEffects;
