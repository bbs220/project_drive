import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralGround from "./ProceduralGround";
import { useCityStore } from "../../../stores/useCItyStore";
import { worldConstants } from "../../../utils/worldGenerator";
import ProceduralStars from "./ProceduralStars";
import ProceduralClouds from "./ProceduralClouds";
import ChunkWorker from "./worker/chunk.worker?worker";

type typeChunkManagerProps = {
  targetRef: React.RefObject<THREE.Group | null>;
};

const ChunkManager = ({ targetRef }: typeChunkManagerProps) => {
  const chunkRadius = useCityStore((state) => state.chunkRadius);
  const dummyPosition = useRef(new THREE.Vector3());

  // track the current center to prevent spamming the worker
  const currentCenter = useRef({ x: 0, z: 0 });
  const workerRef = useRef<Worker | null>(null);

  // store the generated chunks returned by the worker
  const [chunkData, setChunkData] = useState({
    activeChunks: [],
    skyChunks: [],
    // added this to state for safe rendering
    centerChunk: { x: 0, z: 0 },
  });

  // initialize the worker once on mount
  useEffect(() => {
    workerRef.current = new ChunkWorker();

    workerRef.current.onmessage = (event) => {
      if (event.data.type === "CHUNKS_READY") {
        // only trigger a React re-render when the heavy math is completely finished
        setChunkData({
          activeChunks: event.data.activeChunks,
          skyChunks: event.data.skyChunks,
          // reading a ref inside a callback is perfectly safe
          centerChunk: currentCenter.current,
        });
      }
    };

    // trigger the initial generation
    workerRef.current.postMessage({
      type: "GENERATE_CHUNKS",
      centerX: 0,
      centerZ: 0,
      chunkRadius,
    });

    return () => {
      workerRef.current?.terminate(); // clean up on unmount
    };
  }, [chunkRadius]);

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

    // if crossed a chunk border, tell the worker to start calculating the new grid
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
    </group>
  );
};

export default ChunkManager;
