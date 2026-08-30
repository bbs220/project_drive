import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import fragmentShader from "../shaders/gridFrag.glsl";
import vertexShader from "../shaders/gridVert.glsl";
import { useTweakpane } from "../../../hooks/useTweakpane";
import { RigidBody } from "@react-three/rapier";
import { worldConstants } from "../../../utils/worldGenerator";

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

  // merge the built-in fog uniforms with your custom grid uniforms right here
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

  return (
    <group position={[posX, 0, posZ]}>
      {/* individual chunk collision & visual ground */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        friction={2}
        position={[0, worldConstants.groundOffset, 0]}
      >
        <mesh receiveShadow>
          <boxGeometry
            args={[
              worldConstants.chunkSize,
              worldConstants.groundHeight,
              worldConstants.chunkSize,
            ]}
          />
          <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            fog={true}
          />
        </mesh>
      </RigidBody>

      {/* individual chunk debug boundary helper controlled by parent params */}
      <gridHelper
        args={[worldConstants.chunkSize, 1, "white", "orange"]}
        position={[0, 10, 0]}
        visible={params.showChunkBoundary}
      />
    </group>
  );
};

type typeGroundProps = {
  activeChunks: Array<{ chunkX: number; chunkZ: number }>;
};

const ProceduralGround = ({ activeChunks }: typeGroundProps) => {
  // Move the chunk boundary toggle here so it is only registered in Tweakpane once
  const params = useTweakpane(
    { title: "➕ Grid Shader", expanded: false },
    {
      showChunkBoundary: { value: false, label: "chunk boundary" },
      gridSize: { value: 10.0, min: 5.0, max: 50.0, step: 5 },
      subGridSize: { value: 2.5, min: 0.5, max: 2.5, step: 0.5 },
      crossSize: { value: 0.08, min: 0.01, max: 0.5 },
      crossOpacity: { value: 0.2, min: 0.0, max: 1.0 },
      gridThickness: { value: 0.1, min: 0.1, max: 5.0, step: 0.1 },
      lineColor: { value: "#666666" },
      crossColor: { value: "#00f3ff" },
      bgColor: { value: "#050505" },
    },
  );

  return (
    <group>
      {activeChunks.map((c) => (
        <GroundTile
          key={`ground_${c.chunkX}_${c.chunkZ}`}
          chunkX={c.chunkX}
          chunkZ={c.chunkZ}
          params={params as GroundTileProps["params"]}
        />
      ))}
    </group>
  );
};

export default ProceduralGround;
