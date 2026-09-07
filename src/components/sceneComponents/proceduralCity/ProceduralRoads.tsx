import { useMemo, useRef, useLayoutEffect, useEffect } from "react";
import * as THREE from "three";
import roadVert from "../shaders/roadVert.glsl";
import roadFrag from "../shaders/roadFrag.glsl";
import { worldConstants } from "../../../utils/worldGenerator";
import type { typeInstanceConfig } from "../../../hooks/useChunkGenerator";

const dummy = new THREE.Object3D();

export type RoadShaderParams = {
  bgColor: string;
  edgeColor: string;
  centerColor: string;
  edgeDist: number;
  centerDist: number;
  edgeWidth: number;
  centerWidth: number;
  edgeGlow: number;
  centerGlow: number;
};

type ProceduralRoadsProps = {
  roads: typeInstanceConfig[];
  params: RoadShaderParams;
};

const ProceduralRoads = ({ roads, params }: ProceduralRoadsProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geomRef = useRef<THREE.BoxGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // only memoize the initial uniforms, just like in GroundTile
  const uniforms = useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uBgColor: { value: new THREE.Color() },
          uEdgeColor: { value: new THREE.Color() },
          uCenterColor: { value: new THREE.Color() },
          uEdgeDist: { value: 0.42 },
          uCenterDist: { value: 0.03 },
          uEdgeWidth: { value: 0.01 },
          uCenterWidth: { value: 0.003 },
        },
      ]),
    [],
  );

  // mutate the ref safely inside useEffect
  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;

    mat.uniforms.uBgColor.value.set(params.bgColor);
    mat.uniforms.uEdgeColor.value
      .set(params.edgeColor)
      .multiplyScalar(params.edgeGlow);
    mat.uniforms.uCenterColor.value
      .set(params.centerColor)
      .multiplyScalar(params.centerGlow);
    mat.uniforms.uEdgeDist.value = params.edgeDist;
    mat.uniforms.uCenterDist.value = params.centerDist;
    mat.uniforms.uEdgeWidth.value = params.edgeWidth;
    mat.uniforms.uCenterWidth.value = params.centerWidth;
  }, [params]);

  useLayoutEffect(() => {
    if (meshRef.current && geomRef.current) {
      const roadTypes = new Float32Array(roads.length);
      const halfCell = worldConstants.cellSize / 2;

      roads.forEach((r, i) => {
        dummy.position.set(
          r.position[0] - halfCell,
          r.position[1],
          r.position[2] - halfCell,
        );
        dummy.scale.set(...r.scale);
        dummy.rotation.set(...(r.rotation || [0, 0, 0]));
        dummy.updateMatrix();

        meshRef.current!.setMatrixAt(i, dummy.matrix);
        roadTypes[i] = r.roadType || 0.0;
      });

      geomRef.current.setAttribute(
        "aRoadType",
        new THREE.InstancedBufferAttribute(roadTypes, 1),
      );
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [roads]);

  if (roads.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, roads.length]}>
      <boxGeometry ref={geomRef} />
      {/* mount the shader material declaratively */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={roadVert}
        fragmentShader={roadFrag}
        toneMapped={true}
        fog={true}
        uniforms={uniforms}
      />
    </instancedMesh>
  );
};

export default ProceduralRoads;
