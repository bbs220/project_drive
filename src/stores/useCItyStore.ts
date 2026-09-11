import { create } from "zustand";
import { worldConstants } from "../utils/worldGenerator";

type typeCityState = {
  version: number;
  chunkRadius: number;
  seed: number;
  regenerateCity: () => void;
  setChunkRadius: (radius: number) => void;
  setSeed: (seed: number) => void;
};

export const useCityStore = create<typeCityState>((set) => ({
  version: 0,

  // initialize with the centralized default value
  chunkRadius: worldConstants.chunkRadius,

  // generate a random seed between 1 and 999999 when the app first loads
  seed: Math.floor(Math.random() * 999999) + 1,

  // increment the version number AND generate a new seed to trigger a completely fresh 3D city
  regenerateCity: () =>
    set((state) => ({
      version: state.version + 1,
      seed: Math.floor(Math.random() * 999999) + 1,
    })),

  // update the active radius dynamically
  setChunkRadius: (radius) => set({ chunkRadius: radius }),

  // bump the version here too
  // forces the ChunkManager to instantly rebuild the world with your typed seed
  setSeed: (newSeed) =>
    set((state) => ({
      seed: newSeed,
      version: state.version + 1,
    })),
}));
