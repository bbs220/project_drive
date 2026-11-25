import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  ChromaticAberration,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { SpeedLines } from "./SpeedLinesEffect";
import { BlendFunction } from "postprocessing";

// Import vehicle store for live speed telemetry
import { useVehicleStore } from "../../stores/useVehicleStore";

const PostprocessingEffects = () => {
  const {
    enableBloom,
    bloomIntensity,
    luminanceThreshold,
    luminanceSmoothing,
    enableCA,
    caOffsetX,
    caOffsetY,
    enableSpeedLines,
    speedLinesRadius,
    enableSMAA,
    enableVignette,
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

      // Shared thresholds for warp effects (CA & Speedlines)
      enableSpeedLines: { value: true, folder: "Speedlines", label: "enable" },
      speedLinesRadius: {
        value: 0.4,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Speedlines",
        label: "radius",
      },
      enableSMAA: {
        value: true,
        label: "smaa",
        folder: "Anti Aliasing",
      },
      enableVignette: {
        value: true,
        label: "vignette",
        folder: "Vigenette",
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
    const activeEntity = state.active.entity;

    // strictly bounds the effect for the car's speed thresholds
    const targetIntensity = state.telemetry[activeEntity]?.warpFactor ?? 0;

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

      {/* Attach the ref here. The initial offset is 0,0 and our useFrame handles the rest! */}
      {enableCA && (
        <ChromaticAberration ref={caRef} offset={new THREE.Vector2(0, 0)} />
      )}

      {/* Pass the Tweakpane thresholds dynamically into the custom shader component */}
      {enableSpeedLines && (
        <SpeedLines radius={speedLinesRadius as number} />
      )}

      {enableSMAA && <SMAA />}
      {enableVignette && (
        <Vignette
          offset={0.4}
          darkness={0.4}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  );
};

export default PostprocessingEffects;
