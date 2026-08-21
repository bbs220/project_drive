import { useMemo } from "react";
import { getTerrainData } from "../../../utils/worldGenerator";
import { useCityStore } from "../../../stores/useCItyStore";
import ProceduralBuildings from "./ProceduralBuildings";
import ProceduralRoads from "./ProceduralRoads";

// Define and export the typescript shape for the visual instances
export type typeInstanceConfig = {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  roadType?: number;
  colorIndex?: number;
};

type typeChunkProps = {
  chunkX: number;
  chunkZ: number;
};

const ProceduralCity = ({ chunkX, chunkZ }: typeChunkProps) => {
  // subscribe strictly to the city version triggered by the ui radar
  const version = useCityStore((state) => state.version);

  // precompute all instance data for visuals in a single pass
  const { buildings, roads } = useMemo(() => {
    const activeVersion = version;

    const tempBuildings: typeInstanceConfig[] = [];
    const tempRoads: typeInstanceConfig[] = [];

    const chunkSize = 300;
    const halfChunk = chunkSize / 2;
    const cellSize = 10;
    const halfCell = cellSize / 2;

    const worldOffsetX = chunkX * chunkSize;
    const worldOffsetZ = chunkZ * chunkSize;

    for (let x = -halfChunk + halfCell; x < halfChunk; x += cellSize) {
      for (let z = -halfChunk + halfCell; z < halfChunk; z += cellSize) {
        const worldX = x + worldOffsetX;
        const worldZ = z + worldOffsetZ;
        const data = getTerrainData(worldX, worldZ);
        const key = `v${activeVersion}_${worldX}_${worldZ}`;

        if (data.type === "building") {
          tempBuildings.push({
            key: `b_${key}`,
            position: [x, data.elevation / 2, z],
            scale: [8, data.elevation, 8],
          });
        } else if (data.type === "road") {
          let roadType = 0.0;
          let rotation: [number, number, number] = [0, 0, 0];

          const n = getTerrainData(worldX, worldZ - cellSize).type === "road";
          const s = getTerrainData(worldX, worldZ + cellSize).type === "road";
          const e = getTerrainData(worldX + cellSize, worldZ).type === "road";
          const w = getTerrainData(worldX - cellSize, worldZ).type === "road";

          const hasVerticalNeighbor = n || s;
          const hasHorizontalNeighbor = e || w;

          if (hasVerticalNeighbor && hasHorizontalNeighbor) {
            roadType = 1.0;
          } else if (hasHorizontalNeighbor && !hasVerticalNeighbor) {
            rotation = [0, Math.PI / 2, 0];
          }

          tempRoads.push({
            key: `r_${key}`,
            position: [x, 0.05, z],
            scale: [10, 0.1, 10],
            rotation,
            roadType,
          });
        }
      }
    }

    return {
      buildings: tempBuildings,
      roads: tempRoads,
    };
  }, [version, chunkX, chunkZ]);

  return (
    <group
      position={[chunkX * 300, -0.48, chunkZ * 300]}
      key={`${version}_${chunkX}_${chunkZ}`}
    >
      <ProceduralBuildings buildings={buildings} />
      <ProceduralRoads roads={roads} />
    </group>
  );
};

export default ProceduralCity;
