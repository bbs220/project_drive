import { Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";
import { worldConstants } from "../../../utils/worldGenerator";
import { useTweakpane } from "../../../hooks/useTweakpane";

type typeStormProps = {
  centerChunk: { x: number; z: number };
  chunkRadius: number;
};

const MIN_Y = 180;

const ProceduralClouds = ({ centerChunk, chunkRadius }: typeStormProps) => {
  const gridSpan = chunkRadius * 2 + 1;
  const stormSize = worldConstants.chunkSize * gridSpan;

  const params = useTweakpane(
    { title: "☁️ Weather System", expanded: false },
    {
      showClouds: { value: false, label: "enable clouds", folder: "Clouds" },
    },
  );

  return (
    <group
      position={[
        centerChunk.x * worldConstants.chunkSize,
        MIN_Y,
        centerChunk.z * worldConstants.chunkSize,
      ]}
      visible={params.showClouds}
    >
      <Clouds material={THREE.MeshBasicMaterial}>
        <Cloud
          segments={230} // Detail of the cloud texture
          bounds={[stormSize, 20, stormSize]} // One massive bounding box
          volume={180} // High volume to create a thick, unbroken blanket
          color="#003535" // Dark, stormy grey
          speed={0.8} // Howling wind speed
          opacity={0.6}
        />
      </Clouds>
    </group>
  );
};

export default ProceduralClouds;
