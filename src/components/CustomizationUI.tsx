import { useState } from "react";
import CustomizationVehicleCarUI from "./CustomizationVehicleCarUI";
import CustomizationVehiclePlaneUI from "./CustomizationVehiclePlaneUI";
import CustomizationVehicleHelicopterUI from "./CustomizationVehicleHelicopterUI";
import {
  useCustomizationStore,
  type typeGarageVehicle,
} from "../stores/useCustomizationStore";
import { useUISounds } from "../hooks/useUISounds";

const CustomizationUI = () => {
  const { activeGarageVehicle, setActiveGarageVehicle } =
    useCustomizationStore();

  const { playToggle } = useUISounds();

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
    <div className="pointer-events-none absolute inset-0 z-14 overflow-hidden">
      {/* cinematic transition curtain */}
      <div
        className={`absolute inset-0 z-0 bg-black transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* centralized tab interface container - expanded width to utilize horizontal space */}
      <div className="pointer-events-none absolute left-1/2 top-18 z-10 flex w-[95vw] -translate-x-1/2 flex-col items-center md:top-2 md:w-[90vw] lg:w-[80vw] max-w-7xl">
        {/* top navigation tabs */}
        <div className="flex w-full gap-1 overflow-x-auto md:w-auto md:gap-2 [&::-webkit-scrollbar]:hidden">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                playToggle();
                handleSwap(v.id);
              }}
              className={`pointer-events-auto relative top-px flex-1 whitespace-nowrap rounded-t-md border border-b-0 px-4 py-2 font-telemetry text-xs uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:cursor-pointer md:flex-none md:px-8 md:py-2.5 md:text-sm ${
                activeGarageVehicle === v.id
                  ? "border-tron-cyan text-tron-yellow [box-shadow:0_-5px_15px_rgba(0,243,255,0.15)] [text-shadow:0_0_8px_var(--color-tron-yellow)]"
                  : "border-transparent bg-transparent text-gray-400 hover:text-tron-cyan hover:[text-shadow:0_0_8px_var(--color-tron-cyan)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* modular customization panel - w-full ensures it stretches to fill the expanded parent */}
        <div className="pointer-events-auto relative z-0 flex w-full items-center justify-center rounded-md border border-tron-cyan px-2 py-3 font-telemetry text-sm text-gray-300 backdrop-blur-md md:px-6 [box-shadow:0_5px_15px_rgba(0,243,255,0.2)]">
          {/* conditionally mount only the ui matching the active vehicle */}
          <div className="flex w-full items-center justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden">
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
