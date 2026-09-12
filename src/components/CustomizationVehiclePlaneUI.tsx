import { useCustomizationStore } from "../stores/useCustomizationStore";

const CustomizationVehiclePlaneUI = () => {
  const planeMods = useCustomizationStore((state) => state.planeMods);
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);

  return (
    <div className="flex w-full flex-col gap-4 overflow-y-auto overflow-x-hidden p-5">
      {/* airframe base color */}
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
          Airframe
        </span>
        <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:border-white/50">
          <input
            type="color"
            value={planeMods.baseColor}
            onChange={(e) =>
              setVehicleMod("plane", "baseColor", e.target.value)
            }
            className="absolute -left-2 -top-2 size-12 cursor-pointer"
            title="Airframe Color"
          />
        </div>
      </div>

      {/* emissive stripes color */}
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
          Neon Stripes
        </span>
        <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:border-white/50">
          <input
            type="color"
            value={planeMods.stripeColor}
            onChange={(e) =>
              setVehicleMod("plane", "stripeColor", e.target.value)
            }
            className="absolute -left-2 -top-2 size-12 cursor-pointer"
            title="Stripes Color"
          />
        </div>
      </div>

      {/* cockpit glass color */}
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-tron-cyan uppercase opacity-80">
          Cockpit Glass
        </span>
        <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:border-white/50">
          <input
            type="color"
            value={planeMods.glassColor}
            onChange={(e) =>
              setVehicleMod("plane", "glassColor", e.target.value)
            }
            className="absolute -left-2 -top-2 size-12 cursor-pointer"
            title="Cockpit Color"
          />
        </div>
      </div>

      {/* engine trail color */}
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
  );
};

export default CustomizationVehiclePlaneUI;
