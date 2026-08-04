// display standard car controls
const AllVehiclesControlsDisplay = () => {
  return (
    // container for bottom center positioning
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4 text-white">
      {/* // accelerate and brake */}
      <div className="flex flex-col items-center gap-2">
        <div className="rounded bg-black/50 px-4 py-2 font-bold">W</div>
        <div className="rounded bg-black/50 px-4 py-2 font-bold">S</div>
      </div>
      {/* // steering controls */}
      <div className="flex flex-col items-center justify-end gap-2">
        <div className="flex gap-2">
          <div className="rounded bg-black/50 px-4 py-2 font-bold">A</div>
          <div className="rounded bg-black/50 px-4 py-2 font-bold">D</div>
        </div>
      </div>
      {/* // extra controls */}
      <div className="flex flex-col items-center justify-end gap-2">
        <div className="rounded bg-black/50 px-4 py-2 font-bold text-xs uppercase tracking-widest">
          Shift
        </div>
        <div className="rounded bg-black/50 px-4 py-2 font-bold text-xs uppercase tracking-widest">
          Space
        </div>
      </div>
    </div>
  );
};

// main heads up display wrapper
const AllVehiclesHUD = () => {
  return (
    // full screen non interactive overlay
    <div className="pointer-events-none absolute inset-0 font-sans z-10">
      {/* // dynamic vehicle controls will swap here based on active vehicle */}
      <AllVehiclesControlsDisplay />
      {/* // inline speedometer replacing the extra component */}
      <div className="absolute bottom-6 right-6 flex items-baseline text-white drop-shadow-md">
        {/* // speed value placeholder */}
        <span className="text-6xl font-black italic tracking-tighter">000</span>
        {/* // speed unit */}
        <span className="ml-2 text-xl font-bold text-gray-300">KM/H</span>
      </div>
    </div>
  );
};

export default AllVehiclesHUD;
