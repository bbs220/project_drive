import { useMemo } from "react";
import {
  generateChunkData,
  type typeInstanceConfig,
  type typeChunkGeneratedData,
} from "../utils/chunkDataGenerator";

export type { typeInstanceConfig, typeChunkGeneratedData };

export const useChunkGenerator = (
  chunkX: number,
  chunkZ: number,
  version: number,
  enabled: boolean = true,
) => {
  return useMemo(() => {
    if (!enabled) {
      return {
        buildings: [],
        roads: [],
        grass: [],
        parkingLots: [],
      };
    }

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
    return generateChunkData(chunkX, chunkZ, version);
  }, [version, chunkX, chunkZ, enabled]);
};
