import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
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
      gridSize: { value: 10.0, min: 5.0, max: 50.0, step: 5 },
      subGridSize: { value: 2.5, min: 0.5, max: 2.5, step: 0.5 },
      crossSize: { value: 0.08, min: 0.01, max: 0.5 },
      crossOpacity: { value: 0.2, min: 0.0, max: 1.0 },
      gridThickness: { value: 0.1, min: 0.1, max: 5.0, step: 0.1 },
      fadeDistance: { value: 500.0, min: 50.0, max: 500.0 },
      lineColor: { value: "#ffffff" },
      crossColor: { value: "#00F3FF" },
      bgColor: { value: "#050505" },
    },
  );

  // reference to the shader material for direct uniform updates
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // memoize uniforms mapping initial values directly to the hook state
  const uniforms = useMemo(
    () => ({
      uBgColor: { value: new THREE.Color(params.bgColor as string) },
      uLineColor: {
        value: new THREE.Color(params.lineColor as string).multiplyScalar(2),
      },
      uCrossColor: {
        value: new THREE.Color(params.crossColor as string).multiplyScalar(2),
      },
      uGridSize: { value: params.gridSize },
      uSubGridSize: { value: params.subGridSize },
      uCrossSize: { value: params.crossSize },
      uCrossOpacity: { value: params.crossOpacity },
      uGridThickness: { value: params.gridThickness },
      uFadeDistance: { value: params.fadeDistance },
    }),
    [
      params.bgColor,
      params.crossColor,
      params.crossOpacity,
      params.crossSize,
      params.fadeDistance,
      params.gridSize,
      params.gridThickness,
      params.lineColor,
      params.subGridSize,
    ],
  );

  // sync uniform values directly to the gpu whenever the tweakpane state changes
  useEffect(() => {
    if (!materialRef.current) return;

    const matUniforms = materialRef.current.uniforms;
    matUniforms.uGridSize.value = params.gridSize;
    matUniforms.uSubGridSize.value = params.subGridSize;
    matUniforms.uCrossSize.value = params.crossSize;
    matUniforms.uCrossOpacity.value = params.crossOpacity;
    matUniforms.uGridThickness.value = params.gridThickness;
    matUniforms.uFadeDistance.value = params.fadeDistance;

    // update color uniforms with scalar multiplier for bloom intensity
    matUniforms.uBgColor.value.set(params.bgColor);
    matUniforms.uLineColor.value.set(params.lineColor).multiplyScalar(2);
    matUniforms.uCrossColor.value.set(params.crossColor).multiplyScalar(2);
  }, [params]);

  return (
    // fixed rigid body for physics collisions
    <RigidBody type="fixed" colliders="cuboid">
      {/* // mesh shifted down so the top face aligns perfectly */}
      <mesh receiveShadow position={[0, -groundDim.height / 2, 0]}>
        <boxGeometry
          args={[groundDim.width, groundDim.height, groundDim.depth]}
        />
        {/* // custom shader material applying the procedural drafting grid */}
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </RigidBody>
  );
};

export default Ground;
