import { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralCity from "./ProceduralCity";
import ProceduralGround from "./ProceduralGround";
import { worldConstants } from "../../../constants/proceduralConstants";

type typeChunkManagerProps = {
  targetRef: React.RefObject<THREE.Group | null>;
};

// pure helper function to generate a dynamic grid of surrounding chunks based on radius
const generateChunkGrid = (
  centerX: number,
  centerZ: number,
  radius: number,
) => {
  const chunks = [];
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      chunks.push({
        chunkX: centerX + x,
        chunkZ: centerZ + z,
      });
    }
  }
  return chunks;
};

const ChunkManager = ({ targetRef }: typeChunkManagerProps) => {
  // keep track of the current center chunk to trigger re-renders only when crossing boundaries
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 });

  // dummy vector to extract world position without memory leaks every frame
  const dummyPosition = useRef(new THREE.Vector3());

  // core tracking loop
  useFrame(() => {
    // strictly exit if no vehicle is active
    if (!targetRef?.current) return;

    // extract the exact 3d position of the currently driven vehicle
    targetRef.current.getWorldPosition(dummyPosition.current);

    // strictly use the global chunk size
    const currentX = Math.round(
      dummyPosition.current.x / worldConstants.chunkSize,
    );
    const currentZ = Math.round(
      dummyPosition.current.z / worldConstants.chunkSize,
    );

    if (currentX !== centerChunk.x || currentZ !== centerChunk.z) {
      setCenterChunk({ x: currentX, z: currentZ });
    }
  });

  const activeChunks = useMemo(() => {
    // pull radius from your global constants falling back to 1 if it is missing
    const radius = worldConstants.chunkRadius || 1;

    // call the pure function to build the new dynamic array
    return generateChunkGrid(centerChunk.x, centerChunk.z, radius);
  }, [centerChunk]);

  return (
    <group>
      <ProceduralGround activeChunks={activeChunks} />
      {activeChunks.map((coord) => (
        <ProceduralCity
          key={`chunk_${coord.chunkX}_${coord.chunkZ}`}
          chunkX={coord.chunkX}
          chunkZ={coord.chunkZ}
        />
      ))}
    </group>
  );
};

export default ChunkManager;
