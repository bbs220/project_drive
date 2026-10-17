import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";
import { useUISounds } from "../hooks/useUISounds";
import { Copyright, TriangleAlert } from "lucide-react";

const WelcomePage = () => {
  const setActiveScene = useAppStore((state) => state.setActiveScene);
  const appVersion = useAppStore((state) => state.appVersion);
  const navigate = useNavigate();

  const { playClick } = useUISounds();

  // explicitly register the active scene so the 3d environment logic stays suspended
  useEffect(() => {
    setActiveScene("welcome");
  }, [setActiveScene]);

  // intercept click to play sound and prevent thread-lock stutter on 3D load
  const handleNavigate = (path: string) => {
    playClick();
    setTimeout(() => {
      navigate(path);
    }, 150);
  };

  return (
    // main container with deep void background and faint cyan grid, using safe padding for small screens
    <main id="main-content" className="relative flex min-h-dvh w-screen flex-col items-center justify-center p-6 bg-tron-bg bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] select-none overflow-hidden">
      {/* background ambient magenta glow scaled for responsiveness */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 md:h-125 md:w-125 -translate-x-1/2 -translate-y-1/2 bg-tron-magenta/10 blur-[90px] md:blur-[120px]" />

      {/* header section */}
      <header className="relative z-10 mb-10 md:mb-16 flex flex-col items-center text-center px-4">
        {/* main title with fluid text sizing (scales smoothly between mobile and desktop) */}
        <h1 className="mb-3 md:mb-4 font-telemetry text-4xl sm:text-6xl md:text-8xl font-bold tracking-widest text-tron-cyan [text-shadow:0_0_15px_var(--color-tron-cyan)]">
          NEON DRIVES
        </h1>
        {/* subtitle using clean label font with responsive sizing */}
        <p className="font-label text-xs sm:text-base md:text-2xl tracking-[0.2em] md:tracking-[0.3em] text-tron-lime uppercase [text-shadow:0_0_8px_var(--color-tron-lime)]">
          procedural city & multi-vehicle sandbox
        </p>
      </header>

      {/* interactive action buttons container - stacks vertically on mobile, side-by-side on desktop */}
      <nav aria-label="Main navigation" className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 md:flex-row md:gap-16 w-full max-w-xl justify-center">
        {/* DRIVE BLOCK */}
        <div className="flex flex-col items-center gap-2 md:gap-4 w-full sm:w-auto">
          <Link
            to="/drive"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate("/drive");
            }}
            className="group relative flex w-56 sm:w-64 cursor-pointer items-center justify-center overflow-hidden border border-tron-magenta bg-transparent py-4 md:py-5 shadow-neon-magenta transition-all duration-500 ease-out hover:scale-105 hover:bg-tron-magenta"
          >
            {/* stark utilitarian cyan bar on the left edge */}
            <span className="absolute left-0 top-0 z-20 h-full w-2 bg-tron-cyan transition-colors duration-500 group-hover:bg-tron-bg"></span>
            {/* button text tracking out and inverting on hover */}
            <span className="relative z-10 font-telemetry text-lg md:text-xl font-black tracking-[0.4em] text-tron-magenta transition-colors duration-500 group-hover:text-tron-bg">
              {`[ DRIVE ]`}
            </span>
            {/* tech ui decal in the corner */}
            <span className="absolute right-3 top-3 z-20 h-2 w-2 bg-tron-cyan transition-colors duration-500 group-hover:bg-tron-bg"></span>
          </Link>
          {/* subtle info text */}
          <p className="font-label text-[10px] md:text-xs tracking-[0.2em] text-tron-magenta/70 uppercase">
            explore the open world
          </p>
        </div>

        {/* GARAGE BLOCK */}
        <div className="flex flex-col items-center gap-2 md:gap-4 w-full sm:w-auto">
          <Link
            to="/garage"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate("/garage");
            }}
            className="group relative flex w-56 sm:w-64 cursor-pointer items-center justify-center overflow-hidden border border-tron-cyan bg-transparent py-4 md:py-5 shadow-neon-cyan transition-all duration-500 ease-out hover:scale-105 hover:bg-tron-cyan"
          >
            {/* magenta bar on the left edge */}
            <span className="absolute left-0 top-0 z-20 h-full w-2 bg-tron-magenta transition-colors duration-500 group-hover:bg-tron-bg"></span>
            {/* button text tracking out and inverting on hover */}
            <span className="relative z-10 font-telemetry text-lg md:text-xl font-black tracking-[0.4em] text-tron-cyan transition-colors duration-500 group-hover:text-tron-bg">
              {`[ GARAGE ]`}
            </span>
            {/* magenta decal in the corner */}
            <span className="absolute right-3 top-3 z-20 h-2 w-2 bg-tron-magenta transition-colors duration-500 group-hover:bg-tron-bg"></span>
          </Link>
          {/* subtle info text */}
          <p className="font-label text-[10px] md:text-xs tracking-[0.2em] text-tron-cyan/70 uppercase">
            customize your vehicles
          </p>
        </div>
      </nav>

      {/* footer note & build version */}
      <footer className="fixed bottom-4 flex w-full items-center justify-center gap-4 px-4 select-none">
        {/* note */}
        <div className="flex items-center gap-1 text-tron-lime font-telemetry text-[10px] md:text-xs">
          <TriangleAlert className="h-4 w-4" />
          Note: <span className="text-white font-thin">Desktop only</span>
        </div>
        {/* divider */}
        <div className="h-6 w-0.5 bg-tron-lime/70" />
        <div className="font-telemetry text-[10px] md:text-xs tracking-widest text-white hover:text-tron-yellow">
          <a
            href="https://github.com/bbs220/project_drive"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source code on GitHub (opens in a new tab)"
            className="hover:underline focus:outline-none"
          >
            Source Code
          </a>
        </div>
        {/* divider */}
        <div className="h-6 w-0.5 bg-tron-lime/70" />
        {/* version */}
        <div className="font-telemetry text-[10px] md:text-xs tracking-widest text-white">
          {`( v ${appVersion}.alpha )`}
        </div>
        {/* divider */}
        <div className="h-6 w-0.5 bg-tron-lime/70" />
        <Link
          to={"/copyright"}
          className="font-telemetry text-[10px] md:text-xs tracking-widest text-white flex justify-center items-center"
        >
          <Copyright className="text-yellow-300 mr-2 size-4" />
          Copyright
        </Link>
      </footer>
    </main>
  );
};

export default WelcomePage;
