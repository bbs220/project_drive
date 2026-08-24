import useSound from "use-sound";
import { useUIStore } from "../stores/useUIStore";
import { soundBank } from "../utils/assetpaths";

export const useUISounds = () => {
  // Subscribe to volume changes so the sounds update instantly when sliders move
  const masterVolume = useUIStore((state) => state.masterVolume);
  const sfxVolume = useUIStore((state) => state.uiVolume);

  // Convert 0-100 scales into a single 0.0-1.0 scale for use-sound
  const volume = (masterVolume / 100) * (sfxVolume / 100);

  // Initialize all UI sounds with the reactive volume applied
  const [playClick] = useSound(soundBank.click, { volume });
  const [playToggle] = useSound(soundBank.toggle, { volume });
  const [playSlider] = useSound(soundBank.slider, { volume });

  return { playClick, playToggle, playSlider };
};
