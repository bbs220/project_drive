import { useCustomizationStore } from "../stores/useCustomizationStore";
import HSLColorSlab from "./HSLColorSlab";

const CustomizationVehiclePlaneUI = () => {
  const planeMods = useCustomizationStore((state) => state.planeMods);
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);
  const setVehicleMaterial = useCustomizationStore(
    (state) => state.setVehicleMaterial,
  );

  return (
    <div className="grid w-full grid-cols-2 xl:grid-cols-4 gap-6 overflow-y-auto overflow-x-hidden p-2 max-h-[30vh]">
      <div className="flex flex-col gap-3">
        <HSLColorSlab
          label="Airframe"
          color={planeMods.base.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "base", "color", newColor)
          }
        />

        <div className="flex w-full items-center gap-3">
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

      <div className="flex flex-col gap-3">
        <HSLColorSlab
          label="Circuit"
          color={planeMods.stripes.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "stripes", "color", newColor)
          }
        />

        <div className="flex w-full items-center gap-3">
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

      <div className="flex flex-col gap-3">
        <HSLColorSlab
          label="Cockpit"
          color={planeMods.glass.color}
          onChange={(newColor) =>
            setVehicleMaterial("plane", "glass", "color", newColor)
          }
        />

        <div className="flex w-full items-center gap-3">
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

      <div className="flex flex-col gap-3">
        <HSLColorSlab
          label="Trails"
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
