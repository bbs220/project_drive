import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import fragmentShader from "../shaders/gridFrag.glsl";
import vertexShader from "../shaders/gridVert.glsl";
import { useTweakpane } from "../../../hooks/useTweakpane";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { worldConstants } from "../../../utils/worldGenerator";
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
    showChunkBoundary: boolean;
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
  const halfCell = worldConstants.cellSize / 2;
  const halfChunk = worldConstants.chunkSize / 2;
  const groundTopY =
    worldConstants.groundOffset + worldConstants.groundHeight / 2;

  return (
    <group position={[posX, 0, posZ]}>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[-halfCell, 0, -halfCell]}
      >
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

      <gridHelper
        args={[worldConstants.chunkSize, 1, "white", "orange"]}
        position={[-halfCell, 10, -halfCell]}
        visible={params.showChunkBoundary}
      />
    </group>
  );
};

type typeGroundProps = {
  activeChunks: typeActiveChunk[];
};

const ProceduralGround = ({ activeChunks }: typeGroundProps) => {
  // grid Shader Tweakpane
  const gridParams = useTweakpane(
    { title: "📔 Shaders", expanded: false },
    {
      showChunkBoundary: {
        value: false,
        label: "chunk boundary",
        folder: "Ground Grid",
      },
      gridSize: {
        value: 10.0,
        min: 5.0,
        max: 50.0,
        step: 5,
        folder: "Ground Grid",
      },
      subGridSize: {
        value: 2.5,
        min: 0.5,
        max: 2.5,
        step: 0.5,
        folder: "Ground Grid",
      },
      crossSize: { value: 0.08, min: 0.01, max: 0.5, folder: "Ground Grid" },
      crossOpacity: { value: 0.2, min: 0.0, max: 1.0, folder: "Ground Grid" },
      gridThickness: {
        value: 0.1,
        min: 0.1,
        max: 5.0,
        step: 0.1,
        folder: "Ground Grid",
      },
      lineColor: { value: "#666666", folder: "Ground Grid" },
      crossColor: { value: "#00f3ff", folder: "Ground Grid" },
      bgColor: { value: "#050505", folder: "Ground Grid" },
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
