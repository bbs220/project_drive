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

type GroundTileProps = {
  chunkX: number;
  chunkZ: number;
  params: {
    bgColor: string;
    lineColor: string;
    crossColor: string;
    gridSize: number;
    subGridSize: number;
    crossSize: number;
    crossOpacity: number;
    gridThickness: number;
  };
};

// completely hides the ref mutation from the parent compiler
const GroundTile = ({ chunkX, chunkZ, params }: GroundTileProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // standard r3f pattern: initialize uniforms exactly once
  const uniforms = useMemo(
    () => ({
      uBgColor: { value: new THREE.Color(params.bgColor) },
      uLineColor: {
        value: new THREE.Color(params.lineColor).multiplyScalar(2),
      },
      uCrossColor: {
        value: new THREE.Color(params.crossColor).multiplyScalar(2),
      },
      uGridSize: { value: params.gridSize },
      uSubGridSize: { value: params.subGridSize },
      uCrossSize: { value: params.crossSize },
      uCrossOpacity: { value: params.crossOpacity },
      uGridThickness: { value: params.gridThickness },
    }),
    [
      params.bgColor,
      params.crossColor,
      params.crossOpacity,
      params.crossSize,
      params.gridSize,
      params.gridThickness,
      params.lineColor,
      params.subGridSize,
    ], // empty array guarantees this object is never touched by react again
  );

  // perfectly legal: updating a generic ref target inside an effect
  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;

    mat.uniforms.uGridSize.value = params.gridSize;
    mat.uniforms.uSubGridSize.value = params.subGridSize;
    mat.uniforms.uCrossSize.value = params.crossSize;
    mat.uniforms.uCrossOpacity.value = params.crossOpacity;
    mat.uniforms.uGridThickness.value = params.gridThickness;

    mat.uniforms.uBgColor.value.set(params.bgColor);
    mat.uniforms.uLineColor.value.set(params.lineColor).multiplyScalar(2);
    mat.uniforms.uCrossColor.value.set(params.crossColor).multiplyScalar(2);
  }, [params]);

  return (
    <mesh
      position={[
        chunkX * groundDim.width,
        -2, // safely tucked down
        chunkZ * groundDim.depth,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[groundDim.width, groundDim.height, groundDim.depth]}
      />
      {/* attach the local ref to intercept the material strictly after rendering */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

type typeGroundProps = {
  activeChunks: Array<{ chunkX: number; chunkZ: number }>;
};

const ProceduralGround = ({ activeChunks }: typeGroundProps) => {
  // parent manages the ui state strictly once
  const params = useTweakpane(
    { title: "➕ Grid Shader", expanded: false },
    {
      gridSize: { value: 10.0, min: 5.0, max: 50.0, step: 5 },
      subGridSize: { value: 2.5, min: 0.5, max: 2.5, step: 0.5 },
      crossSize: { value: 0.08, min: 0.01, max: 0.5 },
      crossOpacity: { value: 0.2, min: 0.0, max: 1.0 },
      gridThickness: { value: 0.1, min: 0.1, max: 5.0, step: 0.1 },
      lineColor: { value: "#ffffff" },
      crossColor: { value: "#00f3ff" },
      bgColor: { value: "#050505" },
    },
  );

  return (
    <group>
      {/* dynamically map the isolated sub-components */}
      {activeChunks.map((c) => (
        <GroundTile
          key={`ground_${c.chunkX}_${c.chunkZ}`}
          chunkX={c.chunkX}
          chunkZ={c.chunkZ}
          params={params}
        />
      ))}
    </group>
  );
};

export default ProceduralGround;
