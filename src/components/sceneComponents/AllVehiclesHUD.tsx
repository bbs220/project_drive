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

// interactive attitude indicator for pitch and roll visualization
const AttitudeIndicator = ({
  pitch,
  roll,
}: {
  pitch: number;
  roll: number;
}) => {
  // clamp pitch visual translation to prevent the horizon from leaving the circular bounds
  const pitchOffset = Math.max(Math.min(pitch * 40, 40), -40);

  return (
    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-sky-500 shadow-md">
      {/* rotating and translating container mapping to roll and pitch */}
      <div
        className="absolute inset-0 flex flex-col transition-transform duration-75 ease-linear"
        style={{
          transform: `rotate(${roll}rad) translateY(${pitchOffset}px)`,
        }}
      >
        {/* sky section */}
        <div className="h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/2 bg-sky-500" />
        {/* ground section */}
        <div className="h-[200%] w-[200%] -translate-x-1/4 border-t-2 border-white bg-amber-700" />
      </div>

      {/* fixed reticle overlay */}
      <div className="absolute flex items-center justify-center gap-4">
        <div className="h-0.5 w-4 bg-yellow-400" />
        <div className="h-1 w-1 rounded-full bg-yellow-400" />
        <div className="h-0.5 w-4 bg-yellow-400" />
      </div>
    </div>
  );
};

// smooth scrolling altimeter tape component
const AltimeterTape = ({ altitude }: { altitude: number }) => {
  // calculate nearest base of ten for smooth tape anchoring
  const baseAlt = Math.floor(altitude / 10) * 10;

  // extract remainder to dynamically shift the tape between intervals
  const remainder = altitude % 10;

  // calculate pixel offset treating each step as twenty four pixels high
  const offsetPx = -(remainder / 10) * 24;

  return (
    <div className="relative flex h-32 w-20 items-center overflow-hidden rounded-md border border-white/20 bg-black/50 pr-4 text-right font-mono text-xl shadow-lg backdrop-blur-md">
      {/* static center indicator arrow */}
      <div className="absolute right-0 top-1/2 z-10 -mt-2 h-0 w-0 border-y-8 border-r-8 border-y-transparent border-r-yellow-400" />

      {/* scrolling container shifting vertically per frame */}
      <div
        className="absolute right-4 top-1/2 flex w-full flex-col transition-transform duration-75 ease-linear"
        style={{ transform: `translateY(calc(-50% + ${offsetPx}px))` }}
      >
        {/* generate neighboring altitude labels based on current anchor */}
        {[40, 30, 20, 10, 0, -10, -20, -30, -40].map((offset) => {
          const val = baseAlt + offset;
          const isVisible = val >= 0;
          return (
            <div
              key={offset}
              className={`flex h-6 items-center justify-end font-bold tracking-tighter ${
                Math.abs(offset) > 10
                  ? "text-white/30"
                  : Math.abs(offset) > 0
                    ? "text-white/60"
                    : "text-white"
              }`}
            >
              {isVisible ? String(val).padStart(3, "0") : ""}
            </div>
          );
        })}
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

  // subscribe to strict helicopter telemetry pitch from global store
  const currentHeliPitch = useVehicleStore(
    (state) => state.helicopterTelemetry?.pitch || 0,
  );

  // subscribe to strict helicopter telemetry roll from global store
  const currentHeliRoll = useVehicleStore(
    (state) => state.helicopterTelemetry?.roll || 0,
  );

  // pad speed string for arcade styling
  const displayCarSpeed = String(currentCarSpeed).padStart(3, "0");

  return (
    // full screen non interactive overlay
    <div className="pointer-events-none absolute inset-0 z-10 font-sans">
      {/* only render car display if player is actively driving */}
      {activeControl === "car" && (
        <>
          {/* dynamic car controls */}
          <CarControlsDisplay />

          {/* inline speedometer */}
          <div className="absolute bottom-6 right-6 flex items-baseline text-white drop-shadow-md">
            {/* inject live padded speed value with tabular mono font to prevent jumping */}
            <span className="tabular-nums font-mono text-6xl font-black italic tracking-tighter">
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

          {/* advanced aviation instruments container */}
          <div className="absolute bottom-6 right-6 flex items-center gap-6">
            {/* dynamic artificial horizon */}
            <AttitudeIndicator
              pitch={currentHeliPitch}
              roll={currentHeliRoll}
            />

            {/* scrolling altimeter tape */}
            <AltimeterTape altitude={currentHeliAltitude} />
          </div>
        </>
      )}
    </div>
  );
};

export default AllVehiclesHUD;
