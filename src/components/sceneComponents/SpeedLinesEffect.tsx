import React, { forwardRef, useMemo } from "react";
import { Effect } from "postprocessing";
import * as THREE from "three";
import speedLinesShader from "./shaders/speedLines.glsl";

class SpeedLinesImpl extends Effect {
  constructor() {
    super("SpeedLinesEffect", speedLinesShader, {
      uniforms: new Map([
        ["uSpeed", new THREE.Uniform(0.0)],
        ["uTime", new THREE.Uniform(0.0)],
        ["uRadius", new THREE.Uniform(0.2)],
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

// NEW: add radius to the props interface
export const SpeedLines = forwardRef(
  (props: { speed: number; radius?: number }, ref) => {
    const effect = useMemo(() => new SpeedLinesImpl(), []);

    React.useLayoutEffect(() => {
      effect.uniforms.get("uSpeed")!.value = props.speed;

      // securely pass the radius if it exists, otherwise keep it at 0.2
      if (props.radius !== undefined) {
        effect.uniforms.get("uRadius")!.value = props.radius;
      }
    }, [props.speed, props.radius, effect]);

    return <primitive ref={ref} object={effect} dispose={null} />;
  },
);

SpeedLines.displayName = "SpeedLines";
