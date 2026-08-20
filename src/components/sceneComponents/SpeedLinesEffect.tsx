import React, { forwardRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Effect } from "postprocessing";
import * as THREE from "three";
import speedLinesShader from "./shaders/speedLines.glsl";
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
} from "../../stores/useVehicleStore";

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

export const SpeedLines = forwardRef((props: { radius?: number }, ref) => {
  const effect = useMemo(() => new SpeedLinesImpl(), []);

  React.useLayoutEffect(() => {
    if (props.radius !== undefined) {
      effect.uniforms.get("uRadius")!.value = props.radius;
    }
  }, [props.radius, effect]);

  // --- HIGH PERFORMANCE RENDER LOOP ---
  useFrame((_, delta) => {
    const state = useVehicleStore.getState();
    const activeControl = state.active.control;
    const activeEntity = state.active.entity;

    let targetSpeedIntensity = 0;

    if (activeControl === CONTROL_STATE.CAR) {
      const carTelemetry =
        state.telemetry[activeEntity as typeof ENTITY_ID.CAR_1];

      // grab the absolute speed
      const currentSpeed = Math.abs(carTelemetry?.speed || 0);

      // define exactly when the effect starts and peaks
      const startSpeed = 250; // stays at 0.0 intensity below this
      const peakSpeed = 300; // hits 1.0 maximum intensity at this speed

      // smoothstep evaluates the currentSpeed against our strict thresholds
      targetSpeedIntensity = THREE.MathUtils.smoothstep(
        currentSpeed,
        startSpeed,
        peakSpeed,
      );
    }

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
