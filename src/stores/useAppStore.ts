import { create } from "zustand";

type typeAppState = {
  // tracks the active environment
  activeScene: "welcome" | "drive" | "garage";
  setActiveScene: (scene: "welcome" | "drive" | "garage") => void;
};

export const useAppStore = create<typeAppState>((set) => ({
  activeScene: "welcome",
  setActiveScene: (scene) => set({ activeScene: scene }),
}));
