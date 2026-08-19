import { useState } from "react";
// import CustomizationVehicleCarUI from "./CustomizationVehicleCarUI";
import CustomizationVehiclePlaneUI from "./CustomizationVehiclePlaneUI";
import CustomizationVehicleHelicopterUI from "./CustomizationVehicleHelicopterUI";
import {
  useCustomizationStore,
  type typeGarageVehicle,
} from "../stores/useCustomizationStore";
import CustomizationVehicleCarUI from "./CustomizationVehicleCarUI";

const CustomizationUI = () => {
  const { activeGarageVehicle, setActiveGarageVehicle } =
    useCustomizationStore();

  // local state to handle the cinematic transition curtain
  const [isTransitioning, setIsTransitioning] = useState(false);

  // strictly defined garage vehicles only
  const vehicles: { id: typeGarageVehicle; label: string }[] = [
    { id: "car", label: "Grid Runner" },
    { id: "plane", label: "Aero Synth" },
    { id: "helicopter", label: "Neon Vortex" },
  ];

  // smooth transition handler
  const handleSwap = (vehicleId: typeGarageVehicle) => {
    // ignore clicks if we are already looking at this vehicle or currently swapping
    if (vehicleId === activeGarageVehicle || isTransitioning) return;

    // drop the black curtain
    setIsTransitioning(true);

    // wait for the screen to go fully black before swapping the heavy 3d models
    setTimeout(() => {
      setActiveGarageVehicle(vehicleId);

      // give the new physics model a tiny split second to mount before lifting the curtain
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 400);
  };

  return (
    // full screen container strictly set to not block 3d orbit controls unless clicking buttons
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* cinematic transition curtain */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* modular right side customization panel */}
      <div className="pointer-events-auto absolute right-6 top-6 flex max-h-[90vh] w-80 flex-col gap-4 overflow-y-auto rounded-md border border-tron-cyan bg-tron-bg/80 p-6 font-telemetry text-sm text-gray-300 backdrop-blur-md transition-all [box-shadow:0_0_15px_rgba(0,243,255,0.2)]">
        <h2 className="mb-2 border-b border-gray-700 pb-3 text-lg font-bold uppercase tracking-wider text-white">
          {activeGarageVehicle} Mods
        </h2>

        {/* conditionally mount only the ui matching the active vehicle */}
        {activeGarageVehicle === "car" && <CustomizationVehicleCarUI />}
        {activeGarageVehicle === "plane" && <CustomizationVehiclePlaneUI />}
        {activeGarageVehicle === "helicopter" && (
          <CustomizationVehicleHelicopterUI />
        )}
      </div>

      {/* invisible flex container to space out the separate buttons */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-6">
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => handleSwap(v.id)}
            // base styles applied directly to the button now
            className={`pointer-events-auto whitespace-nowrap rounded-md border bg-tron-bg/80 px-8 py-3 font-telemetry text-sm uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:cursor-pointer ${
              activeGarageVehicle === v.id
                ? "scale-110 border-tron-yellow text-tron-yellow [box-shadow:0_0_15px_rgba(255,204,0,0.3)] [text-shadow:0_0_8px_var(--color-tron-yellow)]"
                : "border-tron-cyan text-gray-400 [box-shadow:0_0_15px_rgba(0,243,255,0.2)] hover:scale-105 hover:text-tron-cyan hover:[text-shadow:0_0_8px_var(--color-tron-cyan)]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomizationUI;
