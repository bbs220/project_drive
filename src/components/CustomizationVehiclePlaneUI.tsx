import { useCustomizationStore } from "../stores/useCustomizationStore";

const CustomizationVehiclePlaneUI = () => {
  const planeMods = useCustomizationStore((state) => state.planeMods);
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);
  const setVehicleMaterial = useCustomizationStore(
    (state) => state.setVehicleMaterial,
  );

  return (
    <div className="flex w-full gap-6 overflow-y-auto overflow-x-hidden p-5">
      {/* --- airframe section --- */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
        {/* airframe base color */}
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
            Airframe
          </span>
          <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:border-white/50">
            <input
              type="color"
              value={planeMods.base.color}
              onChange={(e) =>
                setVehicleMaterial("plane", "base", "color", e.target.value)
              }
              className="absolute -left-2 -top-2 size-12 cursor-pointer"
              title="Airframe Color"
            />
          </div>
        </div>

        {/* airframe material sliders */}
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
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
        {/* stripes color */}
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
            Neon Stripes
          </span>
          <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:border-white/50">
            <input
              type="color"
              value={planeMods.stripes.color}
              onChange={(e) =>
                setVehicleMaterial("plane", "stripes", "color", e.target.value)
              }
              className="absolute -left-2 -top-2 size-12 cursor-pointer"
              title="Stripes Color"
            />
          </div>
        </div>

        {/* stripes material sliders */}
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
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
        {/* glass color */}
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
            Cockpit Glass
          </span>
          <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:border-white/50">
            <input
              type="color"
              value={planeMods.glass.color}
              onChange={(e) =>
                setVehicleMaterial("plane", "glass", "color", e.target.value)
              }
              className="absolute -left-2 -top-2 size-12 cursor-pointer"
              title="Cockpit Color"
            />
          </div>
        </div>

        {/* glass material sliders */}
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
      <div className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
            Engine Trails
          </span>
          <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:border-white/50">
            <input
              type="color"
              value={planeMods.trailColor}
              onChange={(e) =>
                setVehicleMod("plane", "trailColor", e.target.value)
              }
              className="absolute -left-2 -top-2 size-12 cursor-pointer"
              title="Trail Color"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationVehiclePlaneUI;
