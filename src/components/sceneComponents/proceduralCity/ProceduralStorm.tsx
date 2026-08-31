import { Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";
import { worldConstants } from "../../../utils/worldGenerator";

type typeStormProps = {
  centerChunk: { x: number; z: number };
  chunkRadius: number;
};

const ProceduralStorm = ({ centerChunk, chunkRadius }: typeStormProps) => {
  const gridSpan = chunkRadius * 2 + 1;
  const stormSize = worldConstants.chunkSize * gridSpan;

  return (
    <group
      position={[
        centerChunk.x * worldConstants.chunkSize,
        80, // Height of the storm
        centerChunk.z * worldConstants.chunkSize,
      ]}
    >
      <Clouds material={THREE.MeshBasicMaterial}>
        <Cloud
          segments={80} // Detail of the cloud texture
          bounds={[stormSize, 20, stormSize]} // One massive bounding box
          volume={800} // High volume to create a thick, unbroken blanket
          color="white" // Dark, stormy grey
          speed={0.8} // Howling wind speed
          opacity={1}
        />
      </Clouds>
    </group>
  );
};

export default ProceduralStorm;
