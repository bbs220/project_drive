import { create } from "zustand";

type typeCityState = {
  version: number;
  regenerateCity: () => void;
};

export const useCityStore = create<typeCityState>((set) => ({
  version: 0,
  // increment the version number to trigger a fresh 3d render
  regenerateCity: () => set((state) => ({ version: state.version + 1 })),
}));
