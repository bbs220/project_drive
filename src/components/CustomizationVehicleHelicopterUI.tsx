import { useState, useEffect } from "react";
import { useCustomizationStore } from "../stores/useCustomizationStore";
import HSLColorSlab from "./HSLColorSlab";

const CustomizationVehicleHelicopterUI = () => {
  const helicopterMods = useCustomizationStore((state) => state.helicopterMods);
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);
  const setVehicleMaterial = useCustomizationStore(
    (state) => state.setVehicleMaterial,
  );

  const [syncTrails, setSyncTrails] = useState(true);

  useEffect(() => {
    if (syncTrails) {
      setVehicleMod("helicopter", "trailColor", helicopterMods.neon.color);
    }
  }, [syncTrails, helicopterMods.neon.color, setVehicleMod]);

  return (
    <div className="flex w-full flex-col gap-2">
      {/* hull paint section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Fuselage"
          color={helicopterMods.base.color}
          onChange={(newColor) =>
            setVehicleMaterial("helicopter", "base", "color", newColor)
          }
        />

        <div className="mt-1 flex w-full items-center gap-3">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={helicopterMods.base.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "helicopter",
                "base",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center gap-3">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={helicopterMods.base.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "helicopter",
                "base",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center gap-3">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={helicopterMods.base.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "helicopter",
                "base",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
      </div>

      {/* neon / glow section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Circuits"
          color={helicopterMods.neon.color}
          onChange={(newColor) =>
            setVehicleMaterial("helicopter", "neon", "color", newColor)
          }
        />

        <div className="mt-1 flex w-full items-center gap-3">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={helicopterMods.neon.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "helicopter",
                "neon",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center gap-3">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={helicopterMods.neon.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "helicopter",
                "neon",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
        <div className="flex w-full items-center gap-3">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={helicopterMods.neon.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "helicopter",
                "neon",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
      </div>

      {/* engine trails section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Trails"
          color={helicopterMods.trailColor}
          disabled={syncTrails}
          onChange={(newColor) => {
            if (syncTrails) setSyncTrails(false);
            setVehicleMod("helicopter", "trailColor", newColor);
          }}
        />

        {/* toggle sync button */}
        <button
          onClick={() => setSyncTrails(!syncTrails)}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded border py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all hover:cursor-pointer duration-200 ${
            syncTrails
              ? "border-tron-cyan bg-tron-cyan/10 text-tron-cyan shadow-[0_0_8px_rgba(0,243,255,0.2)]"
              : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80"
          }`}
        >
          <div
            className={`size-1.5 rounded-full transition-colors ${
              syncTrails
                ? "bg-tron-cyan shadow-[0_0_5px_rgba(0,243,255,1)]"
                : "bg-white/20"
            }`}
          />
          Sync to Circuits
        </button>
      </div>
    </div>
  );
};

export default CustomizationVehicleHelicopterUI;
