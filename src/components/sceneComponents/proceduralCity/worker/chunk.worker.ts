import {
  generatorState,
  syncGeneratorParams,
} from "../../../../utils/worldGenerator";
import {
  generateChunkData,
  type typeChunkGeneratedData,
} from "../../../../utils/chunkDataGenerator";

export type typeActiveChunk = {
  chunkX: number;
  chunkZ: number;
  data: typeChunkGeneratedData;
};

export type typeSkyChunk = {
  chunkX: number;
  chunkZ: number;
};

// chunk data cache to avoid regenerating unchanging chunks
const chunkCache = new Map<string, typeChunkGeneratedData>();

// function will eventually hold your heavy noise math and matrix calculations
const generateChunkGrid = (
  centerX: number,
  centerZ: number,
  radius: number,
  version: number,
): typeActiveChunk[] => {
  const chunks: typeActiveChunk[] = [];
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const chunkX = centerX + x;
      const chunkZ = centerZ + z;
      const cacheKey = `${chunkX}_${chunkZ}_${version}`;

      let data = chunkCache.get(cacheKey);
      if (!data) {
        // generate building matrices and grass positions right here
        data = generateChunkData(chunkX, chunkZ, version);
        chunkCache.set(cacheKey, data);
      }

      chunks.push({
        chunkX,
        chunkZ,
        data,
      });
    }
  }
  return chunks;
};

// generate sky grid chunks
const generateSkyGrid = (
  centerX: number,
  centerZ: number,
  radius: number,
): typeSkyChunk[] => {
  const chunks: typeSkyChunk[] = [];
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

// listen for messages from the main React thread
self.onmessage = (event) => {
  const { type, centerX, centerZ, chunkRadius, seed, version = 0 } = event.data;

  if (type === "GENERATE_CHUNKS") {
    // check if the seed from react is different than the worker's current seed
    if (seed !== undefined && seed !== generatorState.seed) {
      // sync it up so the underlying fbm2D logic uses the new seed!
      syncGeneratorParams({ ...generatorState, seed });
      chunkCache.clear();
    }

    // run the heavy math
    const activeChunks = generateChunkGrid(
      centerX,
      centerZ,
      chunkRadius,
      version,
    );
    const skyChunks = generateSkyGrid(centerX, centerZ, chunkRadius + 1);

    // send the finished data back to the main thread
    self.postMessage({
      type: "CHUNKS_READY",
      activeChunks,
      skyChunks,
    });
  }
};
