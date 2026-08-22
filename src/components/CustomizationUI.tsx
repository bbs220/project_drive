import { useState } from "react";
import CustomizationVehicleCarUI from "./CustomizationVehicleCarUI";
import CustomizationVehiclePlaneUI from "./CustomizationVehiclePlaneUI";
import CustomizationVehicleHelicopterUI from "./CustomizationVehicleHelicopterUI";
import {
  useCustomizationStore,
  type typeGarageVehicle,
} from "../stores/useCustomizationStore";

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
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {/* cinematic transition curtain */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out z-0 ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* centralized tab interface container */}
      <div className="pointer-events-none absolute left-1/2 top-2 flex -translate-x-1/2 flex-col items-center z-10">
        {/* top navigation tabs */}
        <div className="flex gap-2">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => handleSwap(v.id)}
              className={`pointer-events-auto relative top-px whitespace-nowrap rounded-t-md border border-b-0 px-8 py-2.5 font-telemetry text-sm uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:cursor-pointer ${
                activeGarageVehicle === v.id
                  ? "border-tron-cyan text-tron-yellow [box-shadow:0_-5px_15px_rgba(0,243,255,0.15)] [text-shadow:0_0_8px_var(--color-tron-yellow)]"
                  : "border-transparent bg-transparent text-gray-400 hover:text-tron-cyan hover:[text-shadow:0_0_8px_var(--color-tron-cyan)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* modular customization panel */}
        <div className="pointer-events-auto relative z-0 w-2xl flex items-center justify-center whitespace-nowrap rounded-md border border-tron-cyan py-3 font-telemetry text-sm text-gray-300 backdrop-blur-md [box-shadow:0_5px_15px_rgba(0,243,255,0.2)]">
          {/* conditionally mount only the ui matching the active vehicle */}
          <div className="flex w-fit items-center justify-center">
            {activeGarageVehicle === "car" && <CustomizationVehicleCarUI />}
            {activeGarageVehicle === "plane" && <CustomizationVehiclePlaneUI />}
            {activeGarageVehicle === "helicopter" && (
              <CustomizationVehicleHelicopterUI />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationUI;
