import { create } from "zustand";
import { worldConstants } from "../utils/worldGenerator";

type typeCityState = {
  version: number;
  chunkRadius: number;
  regenerateCity: () => void;
  setChunkRadius: (radius: number) => void;
};

export const useCityStore = create<typeCityState>((set) => ({
  version: 0,

  // initialize with the centralized default value
  chunkRadius: worldConstants.chunkRadius,

  // increment the version number to trigger a fresh 3d render
  regenerateCity: () => set((state) => ({ version: state.version + 1 })),

  // update the active radius dynamically
  setChunkRadius: (radius) => set({ chunkRadius: radius }),
}));
