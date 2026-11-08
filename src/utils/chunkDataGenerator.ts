import {
  generatorState,
  getTerrainData,
  worldConstants,
} from "./worldGenerator";
import { PoissonDisk } from "./PoissonDisk";

export type typeInstanceConfig = {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  roadType?: number;
  colorIndex?: number;
  isDeadEnd?: boolean;
  archRotation?: [number, number, number];
};

export type typeChunkGeneratedData = {
  buildings: typeInstanceConfig[];
  roads: typeInstanceConfig[];
  grass: typeInstanceConfig[];
  parkingLots: typeInstanceConfig[];
};

// reuse static rotation array to avoid millions of allocations
const defaultZeroRotation: [number, number, number] = [0, 0, 0];

// deterministic pseudorandom calculation
const getPseudoRandom = (x: number, z: number) => {
  return Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
};

// generate all geometry transform configs for a chunk
export const generateChunkData = (
  chunkX: number,
  chunkZ: number,
  version: number,
): typeChunkGeneratedData => {
  const tempBuildings: typeInstanceConfig[] = [];
  const tempRoads: typeInstanceConfig[] = [];
  const tempGrass: typeInstanceConfig[] = [];
  const tempParking: typeInstanceConfig[] = [];

  const chunkSize = worldConstants.chunkSize;
  const halfChunk = chunkSize / 2;
  const cellSize = worldConstants.cellSize;
  const halfCell = cellSize / 2;

  const worldOffsetX = chunkX * chunkSize;
  const worldOffsetZ = chunkZ * chunkSize;

  const blockSize = generatorState.blockSize;
  const roadWidth = generatorState.roadWidth;

  // cache terrain queries to prevent thousands of duplicate simplex noise calls
  const terrainCache = new Map<string, ReturnType<typeof getTerrainData>>();
  const getCachedTerrain = (tx: number, tz: number) => {
    const k = `${tx}_${tz}`;
    let res = terrainCache.get(k);
    if (!res) {
      res = getTerrainData(tx, tz);
      terrainCache.set(k, res);
    }
    return res;
  };

  // all of this just to not rely on a magic number
  const buildableCells = (blockSize - roadWidth) / cellSize;
  const centerCellIndex = Math.floor(buildableCells / 2);
  const centerOffset = roadWidth + centerCellIndex * cellSize + cellSize / 2;

  // tweakable grass parameters
  const GRASS_PARAMS = {
    patchSpacing: 20,
    patchRadius: 60,
    minBlades: 100,
    maxBlades: 200,
    bladeScale: 0.2,
  };

  // generate neon grass patches (poisson disk)
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

    const data = getCachedTerrain(worldX, worldZ);

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

        const localX = point.x - halfChunk + offsetX;
        const localZ = point.y - halfChunk + offsetZ;

        // chunk boundary avoidance
        if (
          localX < -halfChunk ||
          localX >= halfChunk ||
          localZ < -halfChunk ||
          localZ >= halfChunk
        ) {
          continue;
        }

        // road avoidance math
        const bladeWorldX = worldX + offsetX;
        const bladeWorldZ = worldZ + offsetZ;

        const modX = ((bladeWorldX % blockSize) + blockSize) % blockSize;
        const modZ = ((bladeWorldZ % blockSize) + blockSize) % blockSize;

        if (modX < roadWidth || modZ < roadWidth) {
          continue;
        }

        const scaleY = (1.5 + bladeRandX * 2.0) * GRASS_PARAMS.bladeScale;
        const scaleXZ = (1.0 + bladeRandZ * 0.8) * GRASS_PARAMS.bladeScale;

        tempGrass.push({
          key: `v${version}_grass_${worldX}_${worldZ}_${i}`,
          position: [localX, 0, localZ],
          scale: [scaleXZ, scaleY, scaleXZ],
          rotation: defaultZeroRotation,
        });
      }
    }
  });

  // generate structured grid city
  for (let x = -halfChunk + halfCell; x < halfChunk; x += cellSize) {
    for (let z = -halfChunk + halfCell; z < halfChunk; z += cellSize) {
      const worldX = x + worldOffsetX;
      const worldZ = z + worldOffsetZ;
      const data = getCachedTerrain(worldX, worldZ);
      const key = `v${version}_${worldX}_${worldZ}`;

      // modulus math to find good lots
      const modX = ((worldX % blockSize) + blockSize) % blockSize;
      const modZ = ((worldZ % blockSize) + blockSize) % blockSize;

      if (data.type === "building") {
        tempBuildings.push({
          key: `b_${key}`,
          position: [x, data.elevation / 2, z],
          scale: [8, data.elevation, 8],
        });
      } else if (data.type === "road") {
        let roadType = 0.0;
        let rotation: [number, number, number] = [0, 0, 0];
        let isDeadEnd = false;
        let archRotation: [number, number, number] = [0, 0, 0];

        const n = getCachedTerrain(worldX, worldZ - cellSize).type === "road";
        const s = getCachedTerrain(worldX, worldZ + cellSize).type === "road";
        const e = getCachedTerrain(worldX + cellSize, worldZ).type === "road";
        const w = getCachedTerrain(worldX - cellSize, worldZ).type === "road";

        const hasVerticalNeighbor = n || s;
        const hasHorizontalNeighbor = e || w;

        // dead end road calculation
        const neighborCount =
          (n ? 1 : 0) + (s ? 1 : 0) + (e ? 1 : 0) + (w ? 1 : 0);

        if (neighborCount === 1) {
          isDeadEnd = true;
          // face the arch perpendicularly toward the connecting road
          if (n) archRotation = [0, 0, 0];
          else if (s) archRotation = [0, Math.PI, 0];
          else if (e) archRotation = [0, -Math.PI / 2, 0];
          else if (w) archRotation = [0, Math.PI / 2, 0];
        }

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
          isDeadEnd,
          archRotation,
        });
      } else if (data.type === "empty") {
        // parking lot math
        if (modX === centerOffset && modZ === centerOffset) {
          const nBlock =
            getCachedTerrain(worldX, worldZ - blockSize).type === "building";
          const sBlock =
            getCachedTerrain(worldX, worldZ + blockSize).type === "building";
          const eBlock =
            getCachedTerrain(worldX + blockSize, worldZ).type === "building";
          const wBlock =
            getCachedTerrain(worldX - blockSize, worldZ).type === "building";

          if (nBlock && sBlock && eBlock && wBlock) {
            tempParking.push({
              key: `park_${key}`,
              position: [x, 0, z],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            });
          }
        }
      }
    }
  }

  return {
    buildings: tempBuildings,
    roads: tempRoads,
    grass: tempGrass,
    parkingLots: tempParking,
  };
};
