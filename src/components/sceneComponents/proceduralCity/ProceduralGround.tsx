import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import fragmentShader from "../shaders/gridFrag.glsl";
import vertexShader from "../shaders/gridVert.glsl";
import { useTweakpane } from "../../../hooks/useTweakpane";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { worldConstants } from "../../../constants/worldConstants";
import type { typeActiveChunk } from "./worker/chunk.worker";

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

const GroundTile = ({ chunkX, chunkZ, params }: GroundTileProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
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
        },
      ]),
    [
      params.bgColor,
      params.crossColor,
      params.crossOpacity,
      params.crossSize,
      params.gridSize,
      params.gridThickness,
      params.lineColor,
      params.subGridSize,
    ],
  );

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

  const posX = chunkX * worldConstants.chunkSize;
  const posZ = chunkZ * worldConstants.chunkSize;

  // dynamically pull halfCell so Ground and Roads stay aligned
  const halfChunk = worldConstants.chunkSize / 2;
  const groundTopY =
    worldConstants.groundOffset + worldConstants.groundHeight / 2;

  return (
    <group position={[posX, 0, posZ]}>
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        {/* single sided plane rendering grid shader strictly on top face */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, groundTopY, 0]}
        >
          <planeGeometry
            args={[worldConstants.chunkSize, worldConstants.chunkSize]}
          />
          <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            fog={true}
          />
        </mesh>

        {/* solid floor collider underneath surface to prevent drop through */}
        <CuboidCollider
          args={[halfChunk, 0.5, halfChunk]}
          position={[0, groundTopY - 0.5, 0]}
          friction={2}
        />
      </RigidBody>
    </group>
  );
};

type typeGroundProps = {
  activeChunks: typeActiveChunk[];
};

const ProceduralGround = ({ activeChunks }: typeGroundProps) => {
  // grid Shader Tweakpane
  const gridParams = useTweakpane(
    { title: "📔 Ground Grid", expanded: false },
    {
      gridSize: {
        value: 64.0,
        min: 16.0,
        max: 128.0,
        step: 16,
      },
      subGridSize: {
        value: 16.0,
        min: 4.0,
        max: 32.0,
        step: 4,
      },
      crossSize: { value: 0.08, min: 0.01, max: 0.5 },
      crossOpacity: { value: 0.2, min: 0.0, max: 1.0 },
      gridThickness: {
        value: 0.1,
        min: 0.1,
        max: 5.0,
        step: 0.1,
      },
      lineColor: { value: "#666666" },
      crossColor: { value: "#00f3ff" },
      bgColor: { value: "#050505" },
    },
  );

  // road Shader Tweakpane
  // road shader parameters deactivated while procedural city is detached

  return (
    <group>
      {activeChunks.map((c) => (
        <group key={`island_chunk_${c.chunkX}_${c.chunkZ}`}>
          <GroundTile
            chunkX={c.chunkX}
            chunkZ={c.chunkZ}
            params={gridParams as GroundTileProps["params"]}
          />
          {/* render the city chunk right alongside its ground tile */}
          {/* procedural city content detached in favor of clean testing proving ground */}
        </group>
      ))}
    </group>
  );
};

export default ProceduralGround;
