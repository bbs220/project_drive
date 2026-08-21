import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import buildingVert from "../shaders/buildingVert.glsl";
import buildingFrag from "../shaders/buildingFrag.glsl";
import type { typeInstanceConfig } from "./ProceduralCity";

// Reusable dummy object for matrix calculations
const dummy = new THREE.Object3D();

const ProceduralBuildings = ({
  buildings,
}: {
  buildings: typeInstanceConfig[];
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geomRef = useRef<THREE.BoxGeometry>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: buildingVert,
      fragmentShader: buildingFrag,
      toneMapped: false,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),
    });
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current && geomRef.current) {
      const buildingHeights = new Float32Array(buildings.length);

      buildings.forEach((b, i) => {
        dummy.position.set(...b.position);
        dummy.scale.set(...b.scale);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();

        meshRef.current!.setMatrixAt(i, dummy.matrix);
        buildingHeights[i] = b.scale[1]; // Save elevation
      });

      geomRef.current.setAttribute(
        "aHeight",
        new THREE.InstancedBufferAttribute(buildingHeights, 1),
      );
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildings]);

  if (buildings.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, buildings.length]}
      material={material}
    >
      <boxGeometry ref={geomRef} />
    </instancedMesh>
  );
};

export default ProceduralBuildings;
