import { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralGround from "./ProceduralGround";
import { useCityStore } from "../../../stores/useCItyStore";
import { worldConstants } from "../../../utils/worldGenerator";
import ProceduralSky from "./ProceduralSky";
import ProceduralStorm from "./ProceduralStorm";

type typeChunkManagerProps = {
  targetRef: React.RefObject<THREE.Group | null>;
};

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
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 });
  const chunkRadius = useCityStore((state) => state.chunkRadius);
  const dummyPosition = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!targetRef?.current) return;
    targetRef.current.getWorldPosition(dummyPosition.current);

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
    return generateChunkGrid(centerChunk.x, centerChunk.z, chunkRadius);
  }, [centerChunk, chunkRadius]);

  const skyChunks = useMemo(() => {
    return generateChunkGrid(centerChunk.x, centerChunk.z, chunkRadius + 1);
  }, [centerChunk, chunkRadius]);

  return (
    <group>
      <ProceduralGround activeChunks={activeChunks} />
      <ProceduralStorm centerChunk={centerChunk} chunkRadius={chunkRadius} />
      <ProceduralSky activeChunks={skyChunks} />
    </group>
  );
};

export default ChunkManager;
