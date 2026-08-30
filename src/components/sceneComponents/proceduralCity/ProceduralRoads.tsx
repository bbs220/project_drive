import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import roadVert from "../shaders/roadVert.glsl";
import roadFrag from "../shaders/roadFrag.glsl";
import type { typeInstanceConfig } from "./ProceduralCity";
import { worldConstants } from "../../../utils/worldGenerator"; //

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
      const halfCell = worldConstants.cellSize / 2; // 2. calculate the offset

      roads.forEach((r, i) => {
        // 3. subtract half a cell to shift the corner into the dead center
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
    <instancedMesh
      ref={meshRef}
      // using null as any to stop TS from yelling about undefined args
      args={[undefined, undefined, roads.length]}
      material={material}
    >
      <boxGeometry ref={geomRef} />
    </instancedMesh>
  );
};

export default ProceduralRoads;
