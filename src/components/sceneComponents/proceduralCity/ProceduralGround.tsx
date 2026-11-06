import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import fragmentShader from "../shaders/gridFrag.glsl";
import vertexShader from "../shaders/gridVert.glsl";
import { useTweakpane } from "../../../hooks/useTweakpane";
import { RigidBody } from "@react-three/rapier";
import { worldConstants } from "../../../utils/worldGenerator";
import ProceduralCity from "./ProceduralCity";

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

const sharedGroundBoxGeo = new THREE.BoxGeometry(
  worldConstants.chunkSize,
  worldConstants.groundHeight,
  worldConstants.chunkSize,
);

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

  return (
    <group position={[posX, 0, posZ]}>
      <RigidBody
        type="fixed"
        colliders="cuboid"
        friction={2}
        position={[-halfCell, worldConstants.groundOffset, -halfCell]}
      >
        <mesh receiveShadow geometry={sharedGroundBoxGeo}>
          <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            fog={true}
          />
        </mesh>
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
  activeChunks: Array<{ chunkX: number; chunkZ: number }>;
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
  const roadParams = useTweakpane(
    { title: "📔 Shaders", expanded: false },
    {
      bgColor: { value: "#010102", folder: "Road" },
      edgeColor: { value: "#00f3ff", folder: "Road" },
      centerColor: { value: "#00f3ff", folder: "Road" },
      edgeDist: {
        value: 0.49,
        min: 0.2,
        max: 0.49,
        step: 0.01,
        folder: "Road",
      },
      centerDist: {
        value: 0.02,
        min: 0.0,
        max: 0.2,
        step: 0.01,
        folder: "Road",
      },
      edgeWidth: {
        value: 0.001,
        min: 0.001,
        max: 0.1,
        step: 0.001,
        folder: "Road",
      },
      centerWidth: {
        value: 0.001,
        min: 0.001,
        max: 0.05,
        step: 0.001,
        folder: "Road",
      },
      edgeGlow: { value: 1.5, min: 0.1, max: 5.0, folder: "Road" },
      centerGlow: { value: 1.4, min: 0.1, max: 5.0, folder: "Road" },
    },
  );

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
          <ProceduralCity
            chunkX={c.chunkX}
            chunkZ={c.chunkZ}
            roadParams={roadParams}
          />
        </group>
      ))}
    </group>
  );
};

export default ProceduralGround;
