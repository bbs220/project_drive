import {
  generatorState,
  syncGeneratorParams,
} from "../../../../utils/worldGenerator";

// function will eventually hold your heavy noise math and matrix calculations
const generateChunkGrid = (
  centerX: number,
  centerZ: number,
  radius: number,
) => {
  const chunks = [];
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      // generate building matrices and grass positions right here
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
  const { type, centerX, centerZ, chunkRadius, seed } = event.data;

  if (type === "GENERATE_CHUNKS") {
    // check if the seed from react is different than the worker's current seed
    if (seed !== undefined && seed !== generatorState.seed) {
      // sync it up so the underlying fbm2D logic uses the new seed!
      syncGeneratorParams({ ...generatorState, seed });
    }

    // run the heavy math
    const activeChunks = generateChunkGrid(centerX, centerZ, chunkRadius);
    const skyChunks = generateChunkGrid(centerX, centerZ, chunkRadius + 1);

    // send the finished data back to the main thread
    self.postMessage({
      type: "CHUNKS_READY",
      activeChunks,
      skyChunks,
    });
  }
};
