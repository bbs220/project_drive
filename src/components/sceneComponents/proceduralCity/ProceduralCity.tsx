import { useMemo } from "react";
import {
  getTerrainData,
  worldConstants,
  generatorState,
} from "../../../utils/worldGenerator";
import { useCityStore } from "../../../stores/useCItyStore";
import { PoissonDisk } from "../../../utils/PoissonDisk";
import ProceduralBuildings from "./ProceduralBuildings";
import ProceduralRoads from "./ProceduralRoads";
import ProceduralGrass from "./ProceduralGrass";
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

const getPseudoRandom = (x: number, z: number) => {
  return Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
};

const ProceduralCity = ({ chunkX, chunkZ, roadParams }: typeChunkProps) => {
  const version = useCityStore((state) => state.version);

  const { buildings, roads, grass } = useMemo(() => {
    const activeVersion = version;
    const tempBuildings: typeInstanceConfig[] = [];
    const tempRoads: typeInstanceConfig[] = [];
    const tempGrass: typeInstanceConfig[] = [];

    const chunkSize = worldConstants.chunkSize;
    const halfChunk = chunkSize / 2;
    const cellSize = worldConstants.cellSize;
    const halfCell = cellSize / 2;

    const worldOffsetX = chunkX * chunkSize;
    const worldOffsetZ = chunkZ * chunkSize;

    const GRASS_PARAMS = {
      patchSpacing: 20,
      patchRadius: 60,
      minBlades: 100,
      maxBlades: 200,
      bladeScale: 0.2,
    };

    const chunkSeed = Math.abs(chunkX * 73856 + chunkZ * 19349);

    const patchSampler = new PoissonDisk(
      chunkSize,
      chunkSize,
      GRASS_PARAMS.patchSpacing,
      chunkSeed,
    );
    const rawPatchPoints = patchSampler.generate();

    rawPatchPoints.forEach((point) => {
      const worldX = point.x - halfChunk + worldOffsetX;
      const worldZ = point.y - halfChunk + worldOffsetZ;

      const data = getTerrainData(worldX, worldZ);

      if (data.type === "empty") {
        const patchRand = getPseudoRandom(worldX, worldZ);

        const bladeRange = GRASS_PARAMS.maxBlades - GRASS_PARAMS.minBlades;
        const numBlades =
          GRASS_PARAMS.minBlades + Math.floor(patchRand * bladeRange);

        for (let i = 0; i < numBlades; i++) {
          const bladeRandX = getPseudoRandom(worldX + i, worldZ);
          const bladeRandZ = getPseudoRandom(worldX, worldZ + i);

          const radius = Math.sqrt(bladeRandX) * GRASS_PARAMS.patchRadius;
          const angle = bladeRandZ * Math.PI * 2;

          const offsetX = Math.cos(angle) * radius;
          const offsetZ = Math.sin(angle) * radius;

          // calculate local chunk coordinate
          const localX = point.x - halfChunk + offsetX;
          const localZ = point.y - halfChunk + offsetZ;

          // prevent scattered blades from rendering outside the 300x300 chunk bounds
          if (
            localX < -halfChunk ||
            localX >= halfChunk ||
            localZ < -halfChunk ||
            localZ >= halfChunk
          ) {
            continue;
          }

          // road avoid math
          const bladeWorldX = worldX + offsetX;
          const bladeWorldZ = worldZ + offsetZ;

          const blockSize = generatorState.blockSize;
          const roadWidth = generatorState.roadWidth;

          const modX = ((bladeWorldX % blockSize) + blockSize) % blockSize;
          const modZ = ((bladeWorldZ % blockSize) + blockSize) % blockSize;

          if (modX < roadWidth || modZ < roadWidth) {
            continue;
          }

          const scaleY = (1.5 + bladeRandX * 2.0) * GRASS_PARAMS.bladeScale;
          const scaleXZ = (1.0 + bladeRandZ * 0.8) * GRASS_PARAMS.bladeScale;

          tempGrass.push({
            key: `v${activeVersion}_grass_${worldX}_${worldZ}_${i}`,
            position: [localX, 0, localZ],
            scale: [scaleXZ, scaleY, scaleXZ],
            rotation: [0, 0, 0],
          });
        }
      }
    });

    // generate structured grid city
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
      grass: tempGrass,
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
      <ProceduralGrass grass={grass} />
    </group>
  );
};

export default ProceduralCity;
