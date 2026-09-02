import { useMemo } from "react";
import { getTerrainData, worldConstants } from "../../../utils/worldGenerator";
import { useCityStore } from "../../../stores/useCItyStore";
import { PoissonDisk } from "../../../utils/PoissonDisk";
import ProceduralBuildings from "./ProceduralBuildings";
import ProceduralRoads from "./ProceduralRoads";
import ProceduralRocks from "./ProceduralRocks";
import type { RoadShaderParams } from "./ProceduralRoads";

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
  roadParams: RoadShaderParams;
};

// simple deterministic random function for organic rock scaling/rotation
const getPseudoRandom = (x: number, z: number) => {
  return Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
};

const ProceduralCity = ({ chunkX, chunkZ, roadParams }: typeChunkProps) => {
  const version = useCityStore((state) => state.version);

  const { buildings, roads, rocks } = useMemo(() => {
    const activeVersion = version;
    const tempBuildings: typeInstanceConfig[] = [];
    const tempRoads: typeInstanceConfig[] = [];
    const tempRocks: typeInstanceConfig[] = [];

    const chunkSize = worldConstants.chunkSize;
    const halfChunk = chunkSize / 2;
    const cellSize = worldConstants.cellSize;
    const halfCell = cellSize / 2;

    const worldOffsetX = chunkX * chunkSize;
    const worldOffsetZ = chunkZ * chunkSize;

    // --- 1. GENERATE ORGANIC OUTLAND ROCKS (Poisson Disk) ---
    // Create a unique, repeatable seed for this specific chunk
    const chunkSeed = Math.abs(chunkX * 73856 + chunkZ * 19349);

    // Minimum 30 units between rocks so it feels like a vast landscape, not a dense forest
    const rockSampler = new PoissonDisk(chunkSize, chunkSize, 30, chunkSeed);
    const rawRockPoints = rockSampler.generate();

    rawRockPoints.forEach((point) => {
      // Map local Poisson coordinates (0 to chunkSize) to world coordinates
      const worldX = point.x - halfChunk + worldOffsetX;
      const worldZ = point.y - halfChunk + worldOffsetZ;

      const data = getTerrainData(worldX, worldZ);
      const key = `v${activeVersion}_rock_${worldX}_${worldZ}`;

      // Only place rocks if the terrain generator designated this area as "empty" (outlands)
      if (data.type === "empty") {
        const rand = getPseudoRandom(worldX, worldZ);
        const scale = 2 + rand * 8; // Rocks between 2 and 10 units in size

        tempRocks.push({
          key,
          // Shift point to local chunk space (-halfChunk to +halfChunk)
          position: [point.x - halfChunk, scale / 2, point.y - halfChunk],
          // Randomize proportions slightly so they aren't all perfect spheres
          scale: [
            scale,
            scale * (0.5 + rand * 0.5),
            scale * (0.8 + rand * 0.4),
          ],
          // Randomly tumble the rock on all axes
          rotation: [rand * Math.PI, rand * Math.PI * 2, (1 - rand) * Math.PI],
        });
      }
    });

    // --- 2. GENERATE STRUCTURED GRID CITY ---
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
      rocks: tempRocks,
    };
  }, [version, chunkX, chunkZ]);

  return (
    <group
      position={[
        chunkX * worldConstants.chunkSize,
        -0.48,
        chunkZ * worldConstants.chunkSize,
      ]}
      key={`${version}_${chunkX}_${chunkZ}`}
    >
      <ProceduralBuildings buildings={buildings} />
      <ProceduralRoads roads={roads} params={roadParams} />
      <ProceduralRocks rocks={rocks} />
    </group>
  );
};

export default ProceduralCity;
