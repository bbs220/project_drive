import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useEffect, useMemo } from "react";
import fragmentShader from "./shaders/gridFrag.glsl";
import vertexShader from "./shaders/gridVert.glsl";
import { useTweakpane } from "../../hooks/useTweakpane";

const groundDim = {
  width: 300,
  height: 0.1,
  depth: 300,
};

const Ground = () => {
  // get live values from the custom hook and nest them in a dedicated folder
  const params = useTweakpane(
    { title: "➕ Grid shader", expanded: false },
    {
      gridSize: { value: 10.0, min: 2.0, max: 50.0, step: 1 },
      subGridSize: { value: 2.5, min: 0.5, max: 2.5, step: 0.5 },
      crossSize: { value: 0.08, min: 0.01, max: 0.5 },
      crossOpacity: { value: 0.2, min: 0.0, max: 1.0 },
      gridThickness: { value: 0.1, min: 0.1, max: 5.0, step: 0.1 },
      fadeDistance: { value: 500.0, min: 50.0, max: 500.0 },
    },
  );

  // memoize uniforms mapping initial values directly to the hook state
  const uniforms = useMemo(
    () => ({
      // deep void background color
      uBgColor: { value: new THREE.Color("#050505") },
      // neon cyan grid color multiplied for bloom intensity
      uGridColor: { value: new THREE.Color("#00F3FF").multiplyScalar(2) },
      // base size of the main outer grid squares
      uGridSize: { value: params.gridSize },
      // distance between the inner plus symbols
      uSubGridSize: { value: params.subGridSize },
      // size of the cross arms
      uCrossSize: { value: params.crossSize },
      // dial back the brightness of the crosses
      uCrossOpacity: { value: params.crossOpacity },
      // thickness of all lines
      uGridThickness: { value: params.gridThickness },
      // distance at which the grid fades into darkness
      uFadeDistance: { value: params.fadeDistance },
    }),
    [
      params.crossOpacity,
      params.crossSize,
      params.fadeDistance,
      params.gridSize,
      params.gridThickness,
      params.subGridSize,
    ],
  );

  // sync uniform values directly to the gpu whenever the tweakpane state changes
  useEffect(() => {
    uniforms.uGridSize.value = params.gridSize;
    uniforms.uSubGridSize.value = params.subGridSize;
    uniforms.uCrossSize.value = params.crossSize;
    uniforms.uCrossOpacity.value = params.crossOpacity;
    uniforms.uGridThickness.value = params.gridThickness;
    uniforms.uFadeDistance.value = params.fadeDistance;
  }, [params, uniforms]);

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -groundDim.height / 2, 0]}>
        <boxGeometry
          args={[groundDim.width, groundDim.height, groundDim.depth]}
        />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </RigidBody>
  );
};

export default Ground;
