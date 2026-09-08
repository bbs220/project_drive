import { create } from "zustand";
import { persist } from "zustand/middleware";

type typeAppStore = {
  // tracks the active environment
  appVersion: number;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  activeScene: "welcome" | "drive" | "garage";
  setActiveScene: (scene: "welcome" | "drive" | "garage") => void;
};

export const useAppStore = create<typeAppStore>()(
  persist(
    (set) => ({
      appVersion: 0.1,
      isPlaying: false,
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      activeScene: "welcome",
      setActiveScene: (scene) => set({ activeScene: scene }),
    }),
    {
      name: "projectDrive",
    },
  ),
);
