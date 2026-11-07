import { useMemo } from "react";
import {
  generateChunkData,
  type typeInstanceConfig,
  type typeChunkGeneratedData,
} from "../utils/chunkDataGenerator";

export type { typeInstanceConfig, typeChunkGeneratedData };

// cache generated chunk configurations to prevent re-computing visited chunks
const chunkCache = new Map<string, typeChunkGeneratedData>();

export const useChunkGenerator = (
  chunkX: number,
  chunkZ: number,
  version: number,
) => {
  return useMemo(() => {
    const cacheKey = `${chunkX}_${chunkZ}_${version}`;
    let data = chunkCache.get(cacheKey);
    if (!data) {
      // all of this just to not rely on a magic number
      // tweakable grass parameters
      // generate neon grass patches (poisson disk)
      // chunk boundary avoidance
      // road avoidance math
      // generate structured grid city
      // modulus math to find good lots
      // dead end road calculation
      // face the arch perpendicularly toward the connecting road
      // parking lot math
      data = generateChunkData(chunkX, chunkZ, version);
      chunkCache.set(cacheKey, data);
    }
    return data;
  }, [version, chunkX, chunkZ]);
};
