import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import roadVert from "../shaders/roadVert.glsl";
import roadFrag from "../shaders/roadFrag.glsl";
import type { typeInstanceConfig } from "./ProceduralCity";

const dummy = new THREE.Object3D();

const ProceduralRoads = ({ roads }: { roads: typeInstanceConfig[] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geomRef = useRef<THREE.BoxGeometry>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: roadVert,
      fragmentShader: roadFrag,
      toneMapped: false,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),
    });
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current && geomRef.current) {
      const roadTypes = new Float32Array(roads.length);

      roads.forEach((r, i) => {
        dummy.position.set(...r.position);
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
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, roads.length]}
      material={material}
    >
      <boxGeometry ref={geomRef} />
    </instancedMesh>
  );
};

export default ProceduralRoads;
