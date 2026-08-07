import { vehicleRespawnLimit } from "../../constants/otherConstants";
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
  yaw,
}: {
  pitch: number;
  roll: number;
  yaw: number;
}) => {
  // clamp pitch visual translation to prevent the horizon from leaving the circular bounds
  const pitchOffset = Math.max(Math.min(pitch * 40, 40), -40);

  return (
    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-black/40 p-2 shadow-md backdrop-blur-md">
      {/* rotating compass bezel mapping to yaw */}
      <div
        className="absolute inset-1 rounded-full font-mono text-xs font-bold text-white/80"
        style={{ transform: `rotate(${-yaw}rad)` }}
      >
        {/* counter rotate spans so text stays upright */}
        <span
          className="absolute left-1/2 top-0"
          style={{ transform: `translateX(-50%) rotate(${yaw}rad)` }}
        >
          N
        </span>
        <span
          className="absolute right-0 top-1/2"
          style={{ transform: `translateY(-50%) rotate(${yaw}rad)` }}
        >
          E
        </span>
        <span
          className="absolute bottom-0 left-1/2"
          style={{ transform: `translateX(-50%) rotate(${yaw}rad)` }}
        >
          S
        </span>
        <span
          className="absolute left-0 top-1/2"
          style={{ transform: `translateY(-50%) rotate(${yaw}rad)` }}
        >
          W
        </span>
        <span
          className="absolute right-2 top-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          NE
        </span>
        <span
          className="absolute bottom-2 right-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          SE
        </span>
        <span
          className="absolute bottom-2 left-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          SW
        </span>
        <span
          className="absolute left-2 top-2"
          style={{ transform: `rotate(${yaw}rad)` }}
        >
          NW
        </span>
      </div>

      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-sky-500 shadow-inner">
        {/* rotating and translating container mapping to roll and pitch */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            transform: `rotate(${roll}rad) translateY(${pitchOffset}px)`,
          }}
        >
          {/* sky section */}
          <div className="h-[400%] w-[400%] -translate-x-1/4 -translate-y-1/2 bg-sky-500" />
          {/* ground section */}
          <div className="h-[400%] w-[400%] -translate-x-1/4 border-t-2 border-white bg-red-800" />
        </div>

        {/* fixed reticle overlay */}
        <div className="absolute flex items-center justify-center gap-4">
          <div className="h-0.5 w-4 bg-yellow-400" />
          <div className="h-1 w-1 rounded-full bg-yellow-400" />
          <div className="h-0.5 w-4 bg-yellow-400" />
        </div>
      </div>
    </div>
  );
};

// smooth scrolling altimeter tape component
const AltimeterTape = ({ altitude }: { altitude: number }) => {
  // calculate base altitude for single unit increments
  const baseAlt = Math.floor(altitude);

  // extract remainder to dynamically shift the tape smoothly between single units
  const remainder = altitude % 1;

  // calculate pixel offset treating each single step as twenty four pixels high
  const offsetPx = -remainder * 24;

  // format altitude to prevent padding issues on negative numbers
  const formatAltitude = (val: number) => {
    const isNegative = val < 0;
    // pad negative values to maintain consistent character width
    const paddingLength = isNegative ? 2 : 3;
    const absoluteString = Math.abs(val)
      .toString()
      .padStart(paddingLength, "0");
    return isNegative ? `-${absoluteString}` : absoluteString;
  };

  return (
    <div className="relative flex h-24 w-20 items-center overflow-hidden rounded-md border border-white/20 bg-black/50 pl-2 pr-4 text-right font-mono text-xl shadow-lg backdrop-blur-md">
      {/* static center indicator chevron */}
      <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2 font-black text-yellow-400">
        {">"}
      </div>

      {/* scrolling container shifting vertically per frame */}
      <div
        className="absolute right-4 top-1/2 flex w-full flex-col"
        style={{ transform: `translateY(calc(-50% + ${offsetPx}px))` }}
      >
        {/* render items to prevent blank gaps during scroll but visually hide the outer elements */}
        {[2, 1, 0, -1, -2].map((offset) => {
          const val = baseAlt + offset;
          // allow dropping to negative bounds
          const isVisible = val >= vehicleRespawnLimit;

          return (
            <div
              key={offset}
              className={`flex h-6 items-center justify-end gap-1 font-bold tracking-tighter ${
                Math.abs(offset) > 1
                  ? "opacity-0"
                  : Math.abs(offset) === 1
                    ? "text-white/50"
                    : "text-white"
              }`}
            >
              {isVisible ? (
                <>
                  <span>{formatAltitude(val)}</span>
                  <span className="text-[10px] text-white/40">M</span>
                </>
              ) : (
                ""
              )}
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

  // subscribe to strict helicopter telemetry yaw from global store for the compass bezel
  const currentHeliYaw = useVehicleStore(
    (state) => state.helicopterTelemetry?.yaw || 0,
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
            {/* dynamic artificial horizon with compass bezel */}
            <AttitudeIndicator
              pitch={currentHeliPitch}
              roll={currentHeliRoll}
              yaw={currentHeliYaw}
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
