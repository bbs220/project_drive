import { useRef, useLayoutEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { typeInstanceConfig } from "./ProceduralCity";
import grassVert from "../shaders/grassVert.glsl";
import grassFrag from "../shaders/grassFrag.glsl";

const dummy = new THREE.Object3D();

const ProceduralGrass = ({ grass }: { grass: typeInstanceConfig[] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Use a ref for the material instead of useMemo to satisfy the React Compiler
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Geometry: A 3-vertex triangle blade
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.15,
      0.0,
      0.0, // bottom left
      0.15,
      0.0,
      0.0, // bottom right
      0.0,
      1.0,
      0.0, // top tip
    ]);
    const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.5, 1.0]);

    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    return geo;
  }, []);

  // Memoize just the uniforms object
  const uniforms = useMemo(() => {
    return THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { uTime: { value: 0 } },
    ]);
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current && grass.length > 0) {
      grass.forEach((blade, i) => {
        dummy.position.set(...blade.position);
        dummy.scale.set(...blade.scale);
        if (blade.rotation) {
          dummy.rotation.set(...blade.rotation);
        } else {
          dummy.rotation.set(0, 0, 0);
        }
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [grass]);

  // Mutating a ref is perfectly safe in React
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (grass.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, grass.length]}>
      {/* Declarative material attached as a child */}
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        fog={true}
        side={THREE.DoubleSide}
        vertexShader={grassVert}
        fragmentShader={grassFrag}
      />
    </instancedMesh>
  );
};

export default ProceduralGrass;
