import { create } from "zustand";
import { persist } from "zustand/middleware";

type typeAppStore = {
  // tracks the active environment
  activeScene: "welcome" | "drive" | "garage";
  setActiveScene: (scene: "welcome" | "drive" | "garage") => void;
};

export const useAppStore = create<typeAppStore>()(
  persist(
    (set) => ({
      activeScene: "welcome",
      setActiveScene: (scene) => set({ activeScene: scene }),
    }),
    {
      name: "drive-active-scene",
    },
  ),
);
