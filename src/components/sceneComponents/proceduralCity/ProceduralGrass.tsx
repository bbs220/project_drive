import { useRef, useLayoutEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldConstants } from "../../../utils/worldGenerator";
import grassVert from "../shaders/grassVert.glsl";
import grassFrag from "../shaders/grassFrag.glsl";
import type { typeInstanceConfig } from "../../../hooks/useChunkGenerator";
import { useVehicleStore } from "../../../stores/useVehicleStore";

const dummy = new THREE.Object3D();

// Geometry: A 3-vertex triangle blade
const sharedGrassGeometry = new THREE.BufferGeometry();
const grassVertices = new Float32Array([
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
const grassUvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.5, 1.0]);
sharedGrassGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(grassVertices, 3),
);
sharedGrassGeometry.setAttribute(
  "uv",
  new THREE.BufferAttribute(grassUvs, 2),
);

const ProceduralGrass = ({ grass }: { grass: typeInstanceConfig[] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Memoize uniforms including the new player tracking variables
  const uniforms = useMemo(() => {
    return THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uPlayerPos: { value: new THREE.Vector3(0, 0, 0) },
        uInteractRadius: { value: 3.5 },
      },
    ]);
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current && grass.length > 0) {
      const halfCell = worldConstants.cellSize / 2;

      grass.forEach((blade, i) => {
        // Apply the same grid offset used for buildings and roads
        dummy.position.set(
          blade.position[0] - halfCell,
          blade.position[1],
          blade.position[2] - halfCell,
        );
        dummy.scale.set(...blade.scale);

        // GPU billboarding overrides rotation, so we can save CPU cycles here
        dummy.rotation.set(0, 0, 0);

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

      // feed active vehicle or character world coordinates into grass trampling uniform
      const vehicleState = useVehicleStore.getState();
      const activeTel = vehicleState.telemetry[vehicleState.active.entity];
      if (activeTel?.position) {
        materialRef.current.uniforms.uPlayerPos.value.set(
          activeTel.position[0],
          activeTel.position[1],
          activeTel.position[2],
        );
      }
    }
  });

  if (grass.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[sharedGrassGeometry, undefined, grass.length]}>
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
