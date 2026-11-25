import React, { forwardRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Effect } from "postprocessing";
import * as THREE from "three";
import speedLinesShader from "./shaders/speedLines.glsl";
import { useVehicleStore } from "../../stores/useVehicleStore";

class SpeedLinesImpl extends Effect {
  constructor() {
    super("SpeedLinesEffect", speedLinesShader, {
      uniforms: new Map([
        ["uSpeed", new THREE.Uniform(0.0)],
        ["uTime", new THREE.Uniform(0.0)],
        ["uRadius", new THREE.Uniform(0.25)],
      ]),
    });
  }

  update(
    _renderer: THREE.WebGLRenderer,
    _inputBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
  ) {
    this.uniforms.get("uTime")!.value += deltaTime;
  }
}

// update props to accept the dynamic tweakpane thresholds from DriveScene
type SpeedLinesProps = {
  radius?: number;
};

export const SpeedLines = forwardRef((props: SpeedLinesProps, ref) => {
  const effect = useMemo(() => new SpeedLinesImpl(), []);

  React.useLayoutEffect(() => {
    if (props.radius !== undefined) {
      effect.uniforms.get("uRadius")!.value = props.radius;
    }
  }, [props.radius, effect]);

  // --- HIGH PERFORMANCE RENDER LOOP ---
  useFrame((_, delta) => {
    const state = useVehicleStore.getState();
    const activeEntity = state.active.entity;

    // grab the absolute speed
    const targetSpeedIntensity =
      state.telemetry[activeEntity]?.warpFactor ?? 0;

    // smoothly lerp the shader uniform so it doesn't stutter if speed fluctuates
    const currentUniformSpeed = effect.uniforms.get("uSpeed")!.value;
    effect.uniforms.get("uSpeed")!.value = THREE.MathUtils.lerp(
      currentUniformSpeed,
      targetSpeedIntensity,
      delta * 5.0,
    );
  });

  return <primitive ref={ref} object={effect} dispose={null} />;
});

SpeedLines.displayName = "SpeedLines";
