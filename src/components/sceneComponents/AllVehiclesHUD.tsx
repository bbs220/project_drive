import { useCarStore } from "../../stores/useCarStore";

// display minimal car controls
const AllVehiclesControlsDisplay = () => {
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

// main heads up display wrapper
const AllVehiclesHUD = () => {
  // subscribe to speed value from global store
  const currentSpeed = useCarStore((state) => state.speed);

  // pad speed string for arcade styling
  const displaySpeed = String(currentSpeed).padStart(3, "0");

  return (
    // full screen non interactive overlay
    <div className="pointer-events-none absolute inset-0 z-10 font-sans">
      {/* // dynamic vehicle controls will swap here based on active vehicle */}
      <AllVehiclesControlsDisplay />
      {/* // inline speedometer */}
      <div className="absolute bottom-6 right-6 flex items-baseline drop-shadow-md text-white">
        {/* // inject live padded speed value with tabular mono font to prevent jumping */}
        <span className="font-mono text-6xl font-black italic tabular-nums tracking-tighter">
          {displaySpeed}
        </span>
        {/* // speed unit */}
        <span className="ml-2 text-xl font-bold text-gray-300">KM/H</span>
      </div>
    </div>
  );
};

export default AllVehiclesHUD;
