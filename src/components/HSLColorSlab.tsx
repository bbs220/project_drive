import { useMemo } from "react";
import { hexToHSL, hslToHex } from "../utils/colorTools";

const HSLColorSlab = ({
  label,
  color,
  onChange,
  disabled = false,
}: {
  label: string;
  color: string;
  onChange: (newColor: string) => void;
  disabled?: boolean;
}) => {
  const { h, s, l } = useMemo(() => hexToHSL(color), [color]);

  return (
    <div
      className={`flex w-full flex-col gap-2 transition-opacity duration-200 ${
        disabled ? "pointer-events-none opacity-40 grayscale-50" : "opacity-100"
      }`}
    >
      <div className="flex w-full items-center gap-2">
        <span className="text-[9px] font-bold tracking-widest text-tron-cyan uppercase opacity-80 whitespace-nowrap">
          {label}
        </span>
        <div
          className="h-3.5 flex-1 rounded border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-75"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        {/* HUE */}
        <input
          type="range"
          min="0"
          max="360"
          value={h}
          title="Hue"
          aria-label={`${label} Hue`}
          disabled={disabled}
          onChange={(e) => {
            const newH = Number(e.target.value);
            const activeS = s === 0 ? 100 : s;
            const activeL = l === 0 || l === 100 ? 50 : l;
            onChange(hslToHex(newH, activeS, activeL));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background:
              "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
          }}
        />

        {/* SATURATION */}
        <input
          type="range"
          min="0"
          max="100"
          value={s}
          title="Saturation"
          aria-label={`${label} Saturation`}
          disabled={disabled}
          onChange={(e) => onChange(hslToHex(h, Number(e.target.value), l))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`,
          }}
        />

        {/* LIGHTNESS */}
        <input
          type="range"
          min="0"
          max="100"
          value={l}
          title="Lightness"
          aria-label={`${label} Lightness`}
          disabled={disabled}
          onChange={(e) => onChange(hslToHex(h, s, Number(e.target.value)))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, #000 0%, hsl(${h}, ${s}%, 50%) 50%, #fff 100%)`,
          }}
        />
      </div>
    </div>
  );
};

export default HSLColorSlab;
