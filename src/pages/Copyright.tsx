import { useNavigate } from "react-router";
import { useUISounds } from "../hooks/useUISounds";
import {
  Scale,
  ShieldCheck,
  Copyright as CopyrightIcon,
  ExternalLink,
} from "lucide-react";

const Copyright = () => {
  const navigate = useNavigate();
  const { playClick } = useUISounds();

  // intercept click to play sound before routing back to the menu
  const handleReturn = () => {
    playClick();
    setTimeout(() => {
      navigate("/");
    }, 150);
  };

  return (
    // main container matching the welcome page grid background
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center p-4 bg-tron-bg bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] select-none overflow-hidden">
      {/* background ambient magenta glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 md:h-125 md:w-125 -translate-x-1/2 -translate-y-1/2 bg-tron-magenta/10 blur-[90px] md:blur-[120px]" />

      {/* clean content wrapper - no background, no borders */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center px-4">
        {/* title section */}
        <div className="mb-6 flex items-center justify-center gap-3 text-tron-cyan [text-shadow:0_0_15px_var(--color-tron-cyan)]">
          <Scale className="h-6 w-6 md:h-8 md:w-8" />
          <h1 className="font-telemetry text-2xl md:text-3xl font-bold tracking-widest uppercase">
            Legal Disclaimer
          </h1>
          <Scale className="h-6 w-6 md:h-8 md:w-8" />
        </div>

        {/* intellectual property notice */}
        <div className="mb-6 flex flex-col items-center">
          <CopyrightIcon className="mb-2 h-4 w-4 md:h-5 md:w-5 text-tron-magenta filter-[drop-shadow(0_0_8px_var(--color-tron-magenta))]" />
          <p className="font-label text-[10px] sm:text-xs md:text-sm tracking-[0.2em] text-gray-400 uppercase leading-relaxed max-w-2xl">
            All 3D models, characters, environmental designs, and related visual
            or audio assets utilized within{" "}
            <span className="font-bold text-tron-lime [text-shadow:0_0_8px_var(--color-tron-lime)]">
              NEON DRIVES
            </span>{" "}
            remain the exclusive intellectual property of{" "}
            <a
              href="https://thewaltdisneycompany.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-tron-magenta underline decoration-tron-magenta/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white [text-shadow:0_0_8px_var(--color-tron-magenta)] cursor-pointer"
            >
              The Walt Disney Company
              <ExternalLink className="h-3 w-3 inline-block" />
            </a>{" "}
            and its affiliated entities.
          </p>
        </div>

        {/* fair use & developer rights */}
        <div className="mb-8 flex flex-col items-center border-t border-tron-cyan/20 pt-6">
          <ShieldCheck className="mb-2 h-4 w-4 md:h-5 md:w-5 text-tron-cyan filter-[drop-shadow(0_0_8px_var(--color-tron-cyan))]" />
          <p className="font-label text-[10px] sm:text-xs md:text-sm tracking-[0.2em] text-gray-400 uppercase leading-relaxed max-w-3xl">
            This software application is a strictly non-commercial,
            non-monetized prototype developed solely for educational, research,
            and portfolio demonstration purposes in accordance with the doctrine
            of{" "}
            <a
              href="https://www.law.cornell.edu/uscode/text/17/107"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-gray-200 underline decoration-gray-500/50 underline-offset-4 transition-colors hover:text-tron-cyan hover:decoration-tron-cyan cursor-pointer"
            >
              Fair Use (17 U.S.C. § 107)
              <ExternalLink className="h-3 w-3 inline-block" />
            </a>
            .
            <br />
            <br />
            The developer claims no ownership, affiliation, sponsorship, or
            endorsement regarding the aforementioned registered assets. No
            copyright infringement is intended. The proprietary underlying
            codebase, procedural generation architecture, and original game
            mechanics remain the sole property of the developer.
          </p>
        </div>

        {/* back button */}
        <button
          onClick={handleReturn}
          className="group relative flex w-48 sm:w-56 cursor-pointer items-center justify-center overflow-hidden border border-tron-cyan bg-transparent py-3 md:py-4 shadow-neon-cyan transition-all duration-500 ease-out hover:scale-105 hover:bg-tron-cyan"
        >
          {/* magenta bar on the left edge */}
          <span className="absolute left-0 top-0 z-20 h-full w-2 bg-tron-magenta transition-colors duration-500 group-hover:bg-tron-bg"></span>

          {/* button text tracking out and inverting on hover */}
          <span className="relative z-10 font-telemetry text-sm md:text-base font-black tracking-[0.4em] text-tron-cyan transition-colors duration-500 group-hover:text-tron-bg">
            {`[ HOME ]`}
          </span>

          {/* magenta decal in the corner */}
          <span className="absolute right-3 top-3 z-20 h-2 w-2 bg-tron-magenta transition-colors duration-500 group-hover:bg-tron-bg"></span>
        </button>
      </div>
    </div>
  );
};

export default Copyright;
