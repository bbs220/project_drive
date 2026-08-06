import { useVehicleStore } from "../../stores/useVehicleStore";

// display minimal car controls
const CarControlsDisplay = () => {
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 whitespace-nowrap border-t border-white/10 bg-black/60 px-6 py-2 font-mono text-[10px] text-white/60 backdrop-blur-md sm:text-xs">
      <div className="flex items-center gap-3">
        <span>
          <strong className="text-white">WASD</strong> drive
        </span>
        <span className="h-1 w-1 bg-white/20"></span>
        <span>
          <strong className="text-white">SPACE</strong> brake
        </span>
        <span className="h-1 w-1 bg-white/20"></span>
        <span>
          <strong className="text-white">SHIFT</strong> boost
        </span>
        <span className="h-1 w-1 bg-white/20"></span>
        <span>
          <strong className="text-white">AD</strong> roll
        </span>
      </div>
    </div>
  );
};

// display minimal helicopter controls
const HelicopterControlsDisplay = () => {
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 whitespace-nowrap border-t border-white/10 bg-black/60 px-6 py-2 font-mono text-[10px] text-white/60 backdrop-blur-md sm:text-xs">
      <div className="flex items-center gap-3">
        <span>
          <strong className="text-white">SHIFT/SPACE</strong> lift/descend
        </span>
        <span className="h-1 w-1 bg-white/20"></span>
        <span>
          <strong className="text-white">WS</strong> pitch
        </span>
        <span className="h-1 w-1 bg-white/20"></span>
        <span>
          <strong className="text-white">AD</strong> roll
        </span>
        <span className="h-1 w-1 bg-white/20"></span>
        <span>
          <strong className="text-white">QE</strong> yaw
        </span>
      </div>
    </div>
  );
};

// main heads up display wrapper
const AllVehiclesHUD = () => {
  // subscribe to active control state to conditionally render ui
  const activeControl = useVehicleStore((state) => state.activeControl);

  // subscribe to strict car telemetry speed from global store
  const currentCarSpeed = useVehicleStore(
    (state) => state.carTelemetry?.speed || 0,
  );

  // subscribe to strict helicopter telemetry altitude from global store
  const currentHeliAltitude = useVehicleStore(
    (state) => state.helicopterTelemetry?.altitude || 0,
  );

  // subscribe to strict helicopter telemetry horizon lock from global store
  const isHorizonLocked = useVehicleStore(
    (state) => state.helicopterTelemetry?.horizonLock || false,
  );

  // pad speed string for arcade styling
  const displayCarSpeed = String(currentCarSpeed).padStart(3, "0");

  // pad altitude string for arcade styling
  const displayHeliAltitude = String(currentHeliAltitude).padStart(3, "0");

  // format lock status text
  const displayHorizonLock = isHorizonLocked ? "ON" : "OFF";

  return (
    // full screen non interactive overlay
    <div className="pointer-events-none absolute inset-0 z-10 font-sans">
      {/* only render car display if player is actively driving */}
      {activeControl === "car" && (
        <>
          {/* dynamic car controls */}
          <CarControlsDisplay />

          {/* inline speedometer */}
          <div className="absolute bottom-6 right-6 flex items-baseline drop-shadow-md text-white">
            {/* inject live padded speed value with tabular mono font to prevent jumping */}
            <span className="font-mono text-6xl font-black italic tabular-nums tracking-tighter">
              {displayCarSpeed}
            </span>

            {/* speed unit */}
            <span className="ml-2 text-xl font-bold text-gray-300">KM/H</span>
          </div>
        </>
      )}

      {/* only render helicopter display if player is actively flying */}
      {activeControl === "helicopter" && (
        <>
          {/* dynamic helicopter controls */}
          <HelicopterControlsDisplay />

          {/* telemetry container for altimeter and horizon lock */}
          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 drop-shadow-md text-white">
            {/* inline altimeter */}
            <div className="flex items-baseline">
              {/* inject live padded altitude value with tabular mono font to prevent jumping */}
              <span className="font-mono text-6xl font-black italic tabular-nums tracking-tighter">
                {displayHeliAltitude}
              </span>

              {/* altitude unit */}
              <span className="ml-2 text-xl font-bold text-gray-300">ALT</span>
            </div>

            {/* inline horizon lock status */}
            <div className="flex items-baseline opacity-80">
              {/* inject live horizon lock boolean status */}
              <span className="font-mono text-2xl font-black italic tracking-tighter uppercase">
                {displayHorizonLock}
              </span>

              {/* horizon lock unit */}
              <span className="ml-2 text-sm font-bold text-gray-300">HLK</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllVehiclesHUD;
