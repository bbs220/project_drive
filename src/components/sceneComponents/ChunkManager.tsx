import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralChunk from "./ProceduralChunk";

// define props to accept the active vehicle reference
type typeChunkManagerProps = {
  targetRef: React.RefObject<THREE.Group | null>;
};

// match this exactly to the chunksize used in your proceduralchunk math
const chunkSize = 300;

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

    // calculate which chunk the vehicle is currently standing inside
    // math.round is used because chunk 0 spans from -150 to 150
    const currentX = Math.round(dummyPosition.current.x / chunkSize);
    const currentZ = Math.round(dummyPosition.current.z / chunkSize);

    // strictly update state only if the vehicle has crossed into a completely new chunk
    if (currentX !== centerChunk.x || currentZ !== centerChunk.z) {
      setCenterChunk({ x: currentX, z: currentZ });
    }
  });

  // dynamically generate the 3x3 grid centered around the vehicle
  const activeChunks = [];
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      activeChunks.push({
        chunkX: centerChunk.x + x,
        chunkZ: centerChunk.z + z,
      });
    }
  }

  return (
    <group>
      {/* map through the active coordinates and strictly assign keys so react handles the unmounting cleanly */}
      {activeChunks.map((coord) => (
        <ProceduralChunk
          key={`chunk_${coord.chunkX}_${coord.chunkZ}`}
          chunkX={coord.chunkX}
          chunkZ={coord.chunkZ}
        />
      ))}
    </group>
  );
};

export default ChunkManager;
