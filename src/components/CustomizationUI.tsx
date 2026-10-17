import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  // local state to toggle customization panel visibility
  const [isOpen, setIsOpen] = useState(false);

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

      {/* centralized tab interface container - Locked to bottom-0 to prevent scroll cut-off */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 top-16 z-10 flex pl-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-60"
        }`}
      >
        {/* modular customization panel - acts as the main sidebar body */}
        <div
          id="customization-panel"
          role="region"
          aria-label="Vehicle customization controls"
          aria-hidden={!isOpen}
          inert={!isOpen ? true : undefined}
          className="pointer-events-auto relative z-0 flex h-full w-60 flex-col rounded-tr-lg border-r border-t border-tron-cyan backdrop-blur-xs [box-shadow:5px_0_20px_rgba(0,243,255,0.15)]"
        >
          {/* main scrollable container for the customization categories */}
          <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden p-2 pb-2 [&::-webkit-scrollbar]:hidden">
            {/* conditionally mount only the ui matching the active vehicle */}
            {activeGarageVehicle === "car" && <CustomizationVehicleCarUI />}
            {activeGarageVehicle === "plane" && <CustomizationVehiclePlaneUI />}
            {activeGarageVehicle === "helicopter" && (
              <CustomizationVehicleHelicopterUI />
            )}
          </div>
        </div>

        {/* side navigation tabs - attached directly to the right edge of the sidebar */}
        <div
          role="tablist"
          aria-label="Vehicle selection"
          className="pointer-events-auto mt-8 flex flex-col gap-2 pl-0 -ml-px"
        >
          {vehicles.map((v) => {
            const isActive = activeGarageVehicle === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-controls="customization-panel"
                aria-selected={isActive}
                aria-expanded={isActive ? isOpen : undefined}
                aria-label={
                  isActive
                    ? `${v.label} (active) - click to ${isOpen ? "collapse" : "expand"} panel`
                    : `Switch to ${v.label}`
                }
                title={
                  isActive
                    ? `Click to ${isOpen ? "collapse" : "expand"} panel`
                    : `Switch to ${v.label}`
                }
                onClick={() => {
                  playToggle();
                  if (isActive) {
                    setIsOpen((prev) => !prev);
                  } else {
                    handleSwap(v.id);
                    if (!isOpen) setIsOpen(true);
                  }
                }}
                className={`group relative flex items-center justify-center whitespace-nowrap rounded-r-lg border border-l-0 py-2.5 px-3 font-telemetry text-xs uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:cursor-pointer ${
                  isActive
                    ? "border-tron-cyan bg-tron-cyan/15 text-tron-yellow [box-shadow:5px_0_15px_rgba(0,243,255,0.2)] [text-shadow:0_0_8px_var(--color-tron-yellow)]"
                    : "border-white/10 bg-black/10 text-gray-400 hover:border-tron-cyan/50 hover:bg-black/40 hover:text-tron-cyan hover:[text-shadow:0_0_8px_var(--color-tron-cyan)]"
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  {isActive && (
                    <span className="[writing-mode:horizontal-tb] text-tron-cyan transition-transform group-hover:scale-125">
                      {isOpen ? (
                        <ChevronLeft size={11} strokeWidth={3} />
                      ) : (
                        <ChevronRight
                          size={11}
                          strokeWidth={3}
                          className="animate-pulse text-tron-yellow"
                        />
                      )}
                    </span>
                  )}
                  <span className="[writing-mode:vertical-rl]">{v.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomizationUI;
