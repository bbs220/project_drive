import { create } from "zustand";
import { persist } from "zustand/middleware";

type typeAppStore = {
  // tracks the active environment
  appVersion: number;
  activeScene: "welcome" | "drive" | "garage";
  setActiveScene: (scene: "welcome" | "drive" | "garage") => void;
};

export const useAppStore = create<typeAppStore>()(
  persist(
    (set) => ({
      appVersion: 0.1,
      activeScene: "welcome",
      setActiveScene: (scene) => set({ activeScene: scene }),
    }),
    {
      name: "drive-active-scene",
    },
  ),
);
