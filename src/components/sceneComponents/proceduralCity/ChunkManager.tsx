import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralGround from "./ProceduralGround";
import {
  generatorState,
  syncGeneratorParams,
  worldConstants,
} from "../../../utils/worldGenerator";
import ProceduralStars from "./ProceduralStars";
import ProceduralClouds from "./ProceduralClouds";
import ChunkWorker from "./worker/chunk.worker?worker";
import { useCityStore } from "../../../stores/useCityStore";
import ProceduralRain from "./ProceduralRain";
import type { typeActiveChunk, typeSkyChunk } from "./worker/chunk.worker";

type typeChunkManagerProps = {
  targetRef: React.RefObject<THREE.Group | null>;
};

const ChunkManager = ({ targetRef }: typeChunkManagerProps) => {
  // grab the seed and version alongside the chunkRadius!
  const chunkRadius = useCityStore((state) => state.chunkRadius);
  const seed = useCityStore((state) => state.seed);
  const version = useCityStore((state) => state.version);

  useEffect(() => {
    if (seed !== generatorState.seed) {
      syncGeneratorParams({ ...generatorState, seed });
    }
  }, [seed]);

  const dummyPosition = useRef(new THREE.Vector3());
  const currentCenter = useRef({ x: 0, z: 0 });
  const workerRef = useRef<Worker | null>(null);

  const [chunkData, setChunkData] = useState<{
    activeChunks: typeActiveChunk[];
    skyChunks: typeSkyChunk[];
    centerChunk: { x: number; z: number };
  }>({
    activeChunks: [],
    skyChunks: [],
    centerChunk: { x: 0, z: 0 },
  });

  // initialize the worker and its message listener exactly once
  useEffect(() => {
    workerRef.current = new ChunkWorker();

    workerRef.current.onmessage = (event) => {
      if (event.data.type === "CHUNKS_READY") {
        setChunkData({
          activeChunks: event.data.activeChunks,
          skyChunks: event.data.skyChunks,
          centerChunk: currentCenter.current,
        });
      }
    };

    return () => {
      workerRef.current?.terminate(); // clean up on unmount
    };
  }, []);

  // trigger generation whenever radius, seed, or version updates
  useEffect(() => {
    if (!workerRef.current) return;

    workerRef.current.postMessage({
      type: "GENERATE_CHUNKS",
      centerX: currentCenter.current.x,
      centerZ: currentCenter.current.z,
      chunkRadius,
      seed,
      version,
    });
  }, [chunkRadius, seed, version]); // react automatically fires this when regenerateCity is called

  // track player position at 120fps
  useFrame(() => {
    if (!targetRef?.current || !workerRef.current) return;
    targetRef.current.getWorldPosition(dummyPosition.current);

    const currentX = Math.round(
      dummyPosition.current.x / worldConstants.chunkSize,
    );
    const currentZ = Math.round(
      dummyPosition.current.z / worldConstants.chunkSize,
    );

    if (
      currentX !== currentCenter.current.x ||
      currentZ !== currentCenter.current.z
    ) {
      currentCenter.current = { x: currentX, z: currentZ };

      workerRef.current.postMessage({
        type: "GENERATE_CHUNKS",
        centerX: currentX,
        centerZ: currentZ,
        chunkRadius,
        seed,
        version,
      });
    }
  });

  return (
    <group>
      <ProceduralGround activeChunks={chunkData.activeChunks} />
      <ProceduralClouds
        centerChunk={chunkData.centerChunk}
        chunkRadius={chunkRadius}
      />
      <ProceduralStars activeChunks={chunkData.skyChunks} />
      <ProceduralRain />
    </group>
  );
};

export default ChunkManager;
