import { Link } from "react-router";
import { useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";
import { useUISounds } from "../hooks/useUISounds";

const WelcomePage = () => {
  const setActiveScene = useAppStore((state) => state.setActiveScene);

  const { playClick } = useUISounds();

  // explicitly register the active scene so the 3d environment logic stays suspended
  useEffect(() => {
    setActiveScene("welcome");
  }, [setActiveScene]);

  return (
    // main container with deep void background and faint cyan grid
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-tron-bg bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] select-none">
      {/* background ambient magenta glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 bg-tron-magenta/10 blur-[120px]"></div>

      {/* header section */}
      <div className="relative z-10 mb-16 flex flex-col items-center text-center">
        {/* main title with custom text shadow for bloom */}
        <h1 className="mb-4 font-telemetry text-5xl font-bold tracking-widest text-tron-cyan [text-shadow:0_0_20px_var(--color-tron-cyan)] md:text-8xl">
          PROJECT DRIVE
        </h1>
        {/* subtitle using the clean label font */}
        <p className="font-label text-xl tracking-[0.3em] text-tron-lime uppercase [text-shadow:0_0_10px_var(--color-tron-lime)] md:text-2xl">
          procedural city & multi-vehicle sandbox
        </p>
      </div>

      {/* interactive action buttons container */}
      <div className="relative z-10 flex flex-col items-center gap-10 md:flex-row md:gap-16">
        {/* DRIVE BLOCK */}
        <div className="flex flex-col items-center gap-4">
          <Link to={"/drive"}>
            <button
              onClick={() => playClick()}
              className="group relative flex w-64 cursor-pointer items-center justify-center overflow-hidden border border-tron-magenta bg-transparent py-5 shadow-neon-magenta transition-all duration-500 ease-out hover:scale-105 hover:bg-tron-magenta"
            >
              {/* stark utilitarian cyan bar on the left edge */}
              <span className="absolute left-0 top-0 z-20 h-full w-2 bg-tron-cyan transition-colors duration-500 group-hover:bg-tron-bg"></span>
              {/* button text tracking out and inverting on hover */}
              <span className="relative z-10 font-telemetry text-xl font-black tracking-[0.4em] text-tron-magenta transition-colors duration-500 group-hover:text-tron-bg">
                // DRIVE //
              </span>
              {/* tech ui decal in the corner */}
              <span className="absolute right-3 top-3 z-20 h-2 w-2 bg-tron-cyan transition-colors duration-500 group-hover:bg-tron-bg"></span>
            </button>
          </Link>
          {/* subtle info text */}
          <p className="font-label text-xs tracking-[0.2em] text-tron-magenta/70 uppercase">
            deploy to open world
          </p>
        </div>

        {/* GARAGE BLOCK */}
        <div className="flex flex-col items-center gap-4">
          <Link to={"/garage"}>
            {/* swapping the primary color to cyan for visual distinction */}
            <button
              onClick={() => playClick()}
              className="group relative flex w-64 cursor-pointer items-center justify-center overflow-hidden border border-tron-cyan bg-transparent py-5 shadow-neon-cyan transition-all duration-500 ease-out hover:scale-105 hover:bg-tron-cyan"
            >
              {/* magenta bar on the left edge */}
              <span className="absolute left-0 top-0 z-20 h-full w-2 bg-tron-magenta transition-colors duration-500 group-hover:bg-tron-bg"></span>
              {/* button text tracking out and inverting on hover */}
              <span className="relative z-10 font-telemetry text-xl font-black tracking-[0.4em] text-tron-cyan transition-colors duration-500 group-hover:text-tron-bg">
                // GARAGE //
              </span>
              {/* magenta decal in the corner */}
              <span className="absolute right-3 top-3 z-20 h-2 w-2 bg-tron-magenta transition-colors duration-500 group-hover:bg-tron-bg"></span>
            </button>
          </Link>
          {/* subtle info text */}
          <p className="font-label text-xs tracking-[0.2em] text-tron-cyan/70 uppercase">
            configure & tune vehicles
          </p>
        </div>
      </div>
      <div className="text-tron-lime font-telemetry fixed bottom-2 font-bold uppercase select-none animate-pulse">
        ⚠️Note:{" "}
        <span className="text-white uppercase font-thin">
          For now 🖥️Desktop only
        </span>
      </div>
    </div>
  );
};

export default WelcomePage;
