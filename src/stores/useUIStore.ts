import { create } from "zustand";

type UIState = {
  // audio settings
  masterVolume: number; // 0 to 100
  uiVolume: number; // ui clicks, toggles, sliders
  ambienceVolume: number; // vehicle engine, tires, nitro, crashes, and world noise
  radioVolume: number; // music and in-game radio

  // hud toggles
  showControls: boolean; // wasd and shift hints
  showSpeedometers: boolean; // car, plane, and heli instrument clusters
  showRadar: boolean; // procedural radar component visibility
  showTelemetry: boolean; // fps, ping, or raw physics debug text

  // audio setters
  setMasterVolume: (volume: number) => void;
  setUiVolume: (volume: number) => void;
  setAmbienceVolume: (volume: number) => void;
  setRadioVolume: (volume: number) => void;

  // hud setters
  setShowControls: (show: boolean) => void;
  setShowSpeedometers: (show: boolean) => void;
  setShowRadar: (show: boolean) => void;
  setShowTelemetry: (show: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  // default audio state
  masterVolume: 50,
  uiVolume: 50,
  ambienceVolume: 50,
  radioVolume: 50,

  // default hud state
  showControls: true,
  showSpeedometers: true,
  showRadar: true,
  showTelemetry: false, // usually off by default for a clean screen

  // audio actions
  setMasterVolume: (volume) => set({ masterVolume: volume }),
  setUiVolume: (volume) => set({ uiVolume: volume }),
  setAmbienceVolume: (volume) => set({ ambienceVolume: volume }),
  setRadioVolume: (volume) => set({ radioVolume: volume }),

  // hud actions
  setShowControls: (show) => set({ showControls: show }),
  setShowSpeedometers: (show) => set({ showSpeedometers: show }),
  setShowRadar: (show) => set({ showRadar: show }),
  setShowTelemetry: (show) => set({ showTelemetry: show }),
}));
