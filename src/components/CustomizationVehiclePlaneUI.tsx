import { useState, useEffect } from "react";
import { useCustomizationStore } from "../stores/useCustomizationStore";
import HSLColorSlab from "./HSLColorSlab";

const CustomizationVehiclePlaneUI = () => {
  const planeMods = useCustomizationStore((state) => state.planeMods);
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);
  const setVehicleMaterial = useCustomizationStore(
    (state) => state.setVehicleMaterial,
  );

  const [syncTrails, setSyncTrails] = useState(true);

  useEffect(() => {
    if (syncTrails) {
      setVehicleMod("plane", "trailColor", planeMods.stripes.color);
    }
  }, [syncTrails, planeMods.stripes.color, setVehicleMod]);

  return (
    <div className="flex w-full flex-col gap-5 px-6 pb-12">
      {/* airframe section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Airframe"
          color={planeMods.base.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "base", "color", newColor)
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
            value={planeMods.base.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
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
            value={planeMods.base.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
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
            value={planeMods.base.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "base",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
      </div>

      {/* circuit/stripes section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Circuit"
          color={planeMods.stripes.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "stripes", "color", newColor)
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
            value={planeMods.stripes.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "stripes",
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
            value={planeMods.stripes.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "stripes",
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
            value={planeMods.stripes.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "stripes",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
      </div>

      {/* cockpit section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Cockpit"
          color={planeMods.glass.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "glass", "color", newColor)
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
            value={planeMods.glass.metalness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "glass",
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
            value={planeMods.glass.roughness}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "glass",
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
            value={planeMods.glass.emission}
            onChange={(e) =>
              setVehicleMaterial(
                "plane",
                "glass",
                "emission",
                parseFloat(e.target.value),
              )
            }
            className="flex-1 accent-tron-cyan"
          />
        </div>
      </div>

      {/* trails section */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <HSLColorSlab
          label="Trails"
          color={planeMods.trailColor}
          disabled={syncTrails}
          onChange={(newColor) => {
            if (syncTrails) setSyncTrails(false);
            setVehicleMod("plane", "trailColor", newColor);
          }}
        />

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
          Sync to Circuit
        </button>
      </div>
    </div>
  );
};

export default CustomizationVehiclePlaneUI;
