import { useState, useEffect } from "react";
import ColorPickerSlab from "./ColorPickerSlab";
import {
  useCustomizationStore,
  type typeGarageVehicle,
  type typeMaterialProps,
} from "../stores/useCustomizationStore";

// part configuration definition for vehicle components
type typePartConfig = {
  key: string;
  label: string;
};

// component properties for the customization vehicle panel
type typeCustomizationVehicleUIProps = {
  vehicleId?: typeGarageVehicle;
};

// schema defining customizable parts per vehicle
const vehiclePartsSchema: Record<typeGarageVehicle, typePartConfig[]> = {
  car01: [
    { key: "base", label: "Chassis" },
    { key: "neon", label: "Circuits" },
    { key: "chrome", label: "Axels" },
    { key: "interior", label: "Seats" },
    { key: "rubber", label: "Tires" },
  ],
  car02: [
    { key: "base", label: "Chassis" },
    { key: "neon", label: "Circuits" },
    { key: "chrome", label: "Axels" },
    { key: "interior", label: "Seats" },
    { key: "rubber", label: "Tires" },
  ],
  plane01: [
    { key: "base", label: "Fuselage" },
    { key: "neon", label: "Circuits" },
    { key: "glass", label: "Cockpit" },
  ],
  helicopter01: [
    { key: "base", label: "Fuselage" },
    { key: "neon", label: "Circuits" },
  ],
};

// main vehicle customization panel component
const CustomizationVehicleUI = ({
  vehicleId: explicitVehicleId,
}: typeCustomizationVehicleUIProps) => {
  // retrieve current active vehicle when not provided explicitly
  const activeGarageVehicle = useCustomizationStore(
    (state) => state.activeGarageVehicle,
  );
  const currentVehicleId = explicitVehicleId ?? activeGarageVehicle;

  // pull material mod slices from store
  const car01Mods = useCustomizationStore((state) => state.car01Mods);
  const car02Mods = useCustomizationStore((state) => state.car02Mods);
  const plane01Mods = useCustomizationStore((state) => state.plane01Mods);
  const helicopter01Mods = useCustomizationStore(
    (state) => state.helicopter01Mods,
  );

  // store setters for properties and nested materials
  const setVehicleMod = useCustomizationStore((state) => state.setVehicleMod);
  const setVehicleMaterial = useCustomizationStore(
    (state) => state.setVehicleMaterial,
  );

  // toggle state for syncing trail color with circuits
  const [syncTrails, setSyncTrails] = useState(true);

  // resolve current active mod state based on vehicle selection
  const vehicleMods =
    currentVehicleId === "car01"
      ? car01Mods
      : currentVehicleId === "car02"
        ? car02Mods
        : currentVehicleId === "plane01"
          ? plane01Mods
          : helicopter01Mods;

  // sync trail color with neon circuit color whenever sync is enabled
  useEffect(() => {
    if (syncTrails) {
      setVehicleMod(
        currentVehicleId,
        "trailColor" as never,
        vehicleMods.neon.color as never,
      );
    }
  }, [syncTrails, vehicleMods.neon.color, currentVehicleId, setVehicleMod]);

  const parts = vehiclePartsSchema[currentVehicleId];

  return (
    // render scrollable list of material cards and trail settings
    <div className="flex w-full flex-col gap-2">
      {parts.map((part) => {
        const material = (
          vehicleMods as unknown as Record<string, typeMaterialProps>
        )[part.key];

        return (
          // material configuration card
          <div
            key={part.key}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg"
          >
            <ColorPickerSlab
              label={part.label}
              color={material.color}
              onChange={(newColor) =>
                setVehicleMaterial(
                  currentVehicleId,
                  part.key as never,
                  "color",
                  newColor,
                )
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
                aria-label={`${part.label} Metalness`}
                value={material.metalness}
                onChange={(e) =>
                  setVehicleMaterial(
                    currentVehicleId,
                    part.key as never,
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
                aria-label={`${part.label} Roughness`}
                value={material.roughness}
                onChange={(e) =>
                  setVehicleMaterial(
                    currentVehicleId,
                    part.key as never,
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
                aria-label={`${part.label} Glow`}
                value={material.emission}
                onChange={(e) =>
                  setVehicleMaterial(
                    currentVehicleId,
                    part.key as never,
                    "emission",
                    parseFloat(e.target.value),
                  )
                }
                className="flex-1 accent-tron-cyan"
              />
            </label>
          </div>
        );
      })}

      {/* engine trails configuration card */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 shadow-lg">
        <ColorPickerSlab
          label="Trails"
          color={vehicleMods.trailColor}
          disabled={syncTrails}
          onChange={(newColor) => {
            if (syncTrails) setSyncTrails(false);
            setVehicleMod(
              currentVehicleId,
              "trailColor" as never,
              newColor as never,
            );
          }}
        />

        {/* toggle trail sync button */}
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

export default CustomizationVehicleUI;
