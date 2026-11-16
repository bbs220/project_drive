import { useState, useEffect } from "react";
import { useCustomizationStore } from "../stores/useCustomizationStore";
import HSLColorSlab from "./HSLColorSlab";

const CustomizationVehicleCar02UI = () => {
  const carMods = useCustomizationStore((state) => state.car02Mods);
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);
  const setVehicleMaterial = useCustomizationStore(
    (state) => state.setVehicleMaterial,
  );

  const [syncTrails, setSyncTrails] = useState(true);

  useEffect(() => {
    if (syncTrails) {
      setVehicleMod("car02", "trailColor", carMods.neon.color);
    }
  }, [syncTrails, carMods.neon.color, setVehicleMod]);

  return (
    <div className="flex w-full flex-col gap-2">
      {/* body paint section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Chassis"
          color={carMods.base.color}
          onChange={(newColor) =>
            setVehicleMaterial("car02", "base", "color", newColor)
          }
        />

        <label className="mt-1 flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Chassis Metalness"
            value={carMods.base.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "base",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Chassis Roughness"
            value={carMods.base.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "base",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            aria-label="Chassis Glow"
            value={carMods.base.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "base",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
      </div>

      {/* neon glow section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Circuits"
          color={carMods.neon.color}
          onChange={(newColor) =>
            setVehicleMaterial("car02", "neon", "color", newColor)
          }
        />

        <label className="mt-1 flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Circuits Metalness"
            value={carMods.neon.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "neon",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Circuits Roughness"
            value={carMods.neon.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "neon",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            aria-label="Circuits Glow"
            value={carMods.neon.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "neon",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
      </div>

      {/* chrome section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Axels"
          color={carMods.chrome.color}
          onChange={(newColor) =>
            setVehicleMaterial("car02", "chrome", "color", newColor)
          }
        />

        <label className="mt-1 flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Axels Metalness"
            value={carMods.chrome.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "chrome",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Axels Roughness"
            value={carMods.chrome.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "chrome",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            aria-label="Axels Glow"
            value={carMods.chrome.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "chrome",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
      </div>

      {/* interior section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Seats"
          color={carMods.interior.color}
          onChange={(newColor) =>
            setVehicleMaterial("car02", "interior", "color", newColor)
          }
        />

        <label className="mt-1 flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Seats Metalness"
            value={carMods.interior.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "interior",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Seats Roughness"
            value={carMods.interior.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "interior",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            aria-label="Seats Glow"
            value={carMods.interior.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "interior",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
      </div>

      {/* rubber tires section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Tires"
          color={carMods.rubber.color}
          onChange={(newColor) =>
            setVehicleMaterial("car02", "rubber", "color", newColor)
          }
        />

        <label className="mt-1 flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Metal
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Tires Metalness"
            value={carMods.rubber.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "rubber",
                "metalness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Rough
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            aria-label="Tires Roughness"
            value={carMods.rubber.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "rubber",
                "roughness",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
        <label className="flex w-full items-center gap-3 cursor-pointer">
          <span className="w-8 text-[9px] font-bold tracking-widest text-tron-cyan/60 uppercase">
            Glow
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            aria-label="Tires Glow"
            value={carMods.rubber.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "car02",
                "rubber",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </label>
      </div>

      {/* engine trails section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Trails"
          color={carMods.trailColor}
          disabled={syncTrails}
          onChange={(newColor) => {
            if (syncTrails) setSyncTrails(false);
            setVehicleMod("car02", "trailColor", newColor);
          }}
        />

        {/* toggle sync button */}
        <button
          type="button"
          aria-pressed={syncTrails}
          aria-label="Sync trails to circuits color"
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

export default CustomizationVehicleCar02UI;
