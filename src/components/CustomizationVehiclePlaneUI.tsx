import { useMemo } from "react";
import { useCustomizationStore } from "../stores/useCustomizationStore";

// --- Color Math Helpers ---
const hexToHSL = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    // eslint-disable-next-line prefer-const
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color =
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// --- Custom Hue Slider Component ---
const HueColorSlab = ({
  label,
  color,
  onChange,
}: {
  label: string;
  color: string;
  onChange: (newColor: string) => void;
}) => {
  // Extract current hue, saturation, and lightness
  const { h, s, l } = useMemo(() => hexToHSL(color), [color]);

  const handleHueChange = (newHue: number) => {
    // If the base color was totally white/black/grey (0 saturation),
    // bump saturation and lightness so sliding the hue actually shows color!
    const activeS = s === 0 ? 100 : s;
    const activeL = l === 0 || l === 100 ? 50 : l;
    onChange(hslToHex(newHue, activeS, activeL));
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-3 shadow-inner">
      <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
        {label}
      </span>

      {/* Massive Color Preview Box */}
      <div
        className="h-16 w-full rounded-md border-2 border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-75"
        style={{ backgroundColor: color }}
      />

      {/* Full-Spectrum Hue Slider */}
      <input
        type="range"
        min="0"
        max="360"
        value={h}
        onChange={(e) => handleHueChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md"
        style={{
          background:
            "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
        }}
      />
    </div>
  );
};

const CustomizationVehiclePlaneUI = () => {
  const planeMods = useCustomizationStore((state) => state.planeMods);
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);
  const setVehicleMaterial = useCustomizationStore(
    (state) => state.setVehicleMaterial,
  );

  return (
    <div className="flex w-full flex-col gap-6 overflow-y-auto overflow-x-hidden p-5">
      {/* --- airframe section --- */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <HueColorSlab
          label="Airframe Color"
          color={planeMods.base.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "base", "color", newColor)
          }
        />

        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={planeMods.base.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "base",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={planeMods.base.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "base",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={planeMods.base.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "base",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
      </div>

      {/* --- emissive stripes section --- */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <HueColorSlab
          label="Neon Stripes"
          color={planeMods.stripes.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "stripes", "color", newColor)
          }
        />

        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={planeMods.stripes.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "stripes",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={planeMods.stripes.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "stripes",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={planeMods.stripes.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "stripes",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
      </div>

      {/* --- cockpit glass section --- */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <HueColorSlab
          label="Cockpit Glass"
          color={planeMods.glass.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "glass", "color", newColor)
          }
        />

        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={planeMods.glass.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "glass",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={planeMods.glass.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "glass",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={planeMods.glass.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "glass",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="w-32 accent-tron-cyan"
          />
        </div>
      </div>

      {/* --- engine trails (flat color) --- */}
      <div className="flex flex-col gap-4">
        <HueColorSlab
          label="Engine Trails"
          color={planeMods.trailColor}
          onChange={(newColor) =>
            setVehicleMod("plane", "trailColor", newColor)
          }
        />
      </div>
    </div>
  );
};

export default CustomizationVehiclePlaneUI;
