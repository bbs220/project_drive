import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import fragmentShader from "./shaders/gridFrag.glsl";
import vertexShader from "./shaders/gridVert.glsl";
import { useTweakpane } from "../../hooks/useTweakpane";

const groundDim = {
  width: 300,
  height: 0.1,
  depth: 300,
};

// temporary vector to avoid garbage collection loops
const dummyPosition = new THREE.Vector3();

// define props to accept the active vehicle reference
type typeGroundProps = {
  targetRef: React.RefObject<THREE.Group | null>;
};

const ProceduralGround = ({ targetRef }: typeGroundProps) => {
  // track the current center chunk coordinate
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 });

  // get live values from the custom hook and nest them in a dedicated folder
  const params = useTweakpane(
    { title: "➕ Grid shader", expanded: false },
    {
      gridSize: { value: 10.0, min: 5.0, max: 50.0, step: 5 },
      subGridSize: { value: 2.5, min: 0.5, max: 2.5, step: 0.5 },
      crossSize: { value: 0.08, min: 0.01, max: 0.5 },
      crossOpacity: { value: 0.2, min: 0.0, max: 1.0 },
      gridThickness: { value: 0.1, min: 0.1, max: 5.0, step: 0.1 },
      fadeDistance: { value: 500.0, min: 50.0, max: 500.0 },
      lineColor: { value: "#ffffff" },
      crossColor: { value: "#00F3FF" },
      bgColor: { value: "#050505" },
    },
  );

  // memoize uniforms mapping initial values directly to the hook state
  // this singular object will be shared across all 9 ground meshes
  const uniforms = useMemo(
    () => ({
      uBgColor: { value: new THREE.Color(params.bgColor as string) },
      uLineColor: {
        value: new THREE.Color(params.lineColor as string).multiplyScalar(2),
      },
      uCrossColor: {
        value: new THREE.Color(params.crossColor as string).multiplyScalar(2),
      },
      uGridSize: { value: params.gridSize },
      uSubGridSize: { value: params.subGridSize },
      uCrossSize: { value: params.crossSize },
      uCrossOpacity: { value: params.crossOpacity },
      uGridThickness: { value: params.gridThickness },
      uFadeDistance: { value: params.fadeDistance },
    }),
    [
      params.bgColor,
      params.crossColor,
      params.crossOpacity,
      params.crossSize,
      params.fadeDistance,
      params.gridSize,
      params.gridThickness,
      params.lineColor,
      params.subGridSize,
    ], // empty dependency array so the memory reference never changes
  );

  // track active vehicle and update the chunk center boundary
  useFrame(() => {
    if (!targetRef?.current) return;
    targetRef.current.getWorldPosition(dummyPosition);

    // calculate which chunk the vehicle is currently standing inside
    const currentX = Math.round(dummyPosition.x / groundDim.width);
    const currentZ = Math.round(dummyPosition.z / groundDim.depth);

    // strictly update state only if the vehicle has crossed into a new chunk
    if (currentX !== centerChunk.x || currentZ !== centerChunk.z) {
      setCenterChunk({ x: currentX, z: currentZ });
    }
  });

  // map a 3x3 grid array (1 center + 8 surrounding) to perfectly match city chunks
  const activeChunks = useMemo(() => {
    const chunks = [];
    // loops from negative one to positive one to create exactly 9 tiles
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        chunks.push({
          chunkX: centerChunk.x + x,
          chunkZ: centerChunk.z + z,
        });
      }
    }
    return chunks;
  }, [centerChunk]);

  // sync uniform values directly to the shared uniform memory reference
  // this instantly applies to all 9 chunks without needing to map material refs
  useEffect(() => {
    uniforms.uGridSize.value = params.gridSize;
    uniforms.uSubGridSize.value = params.subGridSize;
    uniforms.uCrossSize.value = params.crossSize;
    uniforms.uCrossOpacity.value = params.crossOpacity;
    uniforms.uGridThickness.value = params.gridThickness;
    uniforms.uFadeDistance.value = params.fadeDistance;

    // update color uniforms with scalar multiplier for bloom intensity
    uniforms.uBgColor.value.set(params.bgColor);
    uniforms.uLineColor.value.set(params.lineColor).multiplyScalar(2);
    uniforms.uCrossColor.value.set(params.crossColor).multiplyScalar(2);
  }, [params, uniforms]);

  return (
    <group>
      {/* map 9 physical meshes. this bypasses the instancedmesh vertex shader bug entirely */}
      {activeChunks.map((c) => (
        <mesh
          key={`ground_${c.chunkX}_${c.chunkZ}`}
          position={[
            c.chunkX * groundDim.width,
            -1, // safely tucked 1 meter down to avoid z-fighting with roads
            c.chunkZ * groundDim.depth,
          ]}
          receiveShadow
        >
          <boxGeometry
            args={[groundDim.width, groundDim.height, groundDim.depth]}
          />
          {/* share the exact same uniforms object across all instances */}
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ProceduralGround;
