import { Link } from "react-router";

const WelcomePage = () => {
  return (
    // main container with deep void background and faint cyan grid
    <div className="relative flex flex-col items-center justify-center min-h-screen w-screen bg-tron-bg bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]">
      {/* // background ambient magenta glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-tron-magenta/10 blur-[120px] pointer-events-none"></div>
      {/* // header section */}
      <div className="relative z-10 flex flex-col items-center mb-16 text-center">
        {/* // main title with custom text shadow for bloom */}
        <h1 className="text-5xl md:text-8xl font-telemetry font-bold text-tron-cyan tracking-widest mb-4 [text-shadow:0_0_20px_var(--color-tron-cyan)]">
          PROJECT DRIVE
        </h1>
        {/* // subtitle using the clean label font */}
        <p className="text-xl md:text-2xl font-label text-tron-lime tracking-[0.3em] uppercase [text-shadow:0_0_10px_var(--color-tron-lime)]">
          procedural city & multi-vehicle sandbox
        </p>
      </div>
      {/* // interactive entry button */}
      <Link to={"/drive"}>
        {/* // button container utilizing the custom shadow neon magenta class */}
        <button className="group relative flex items-center justify-center px-12 py-5 bg-transparent border border-tron-magenta cursor-pointer overflow-hidden transition-all duration-500 ease-out hover:scale-105 shadow-neon-magenta hover:bg-tron-magenta">
          {/* // stark utilitarian cyan bar on the left edge */}
          <span className="absolute left-0 top-0 w-2 h-full bg-tron-cyan z-20 group-hover:bg-tron-bg transition-colors duration-500"></span>
          {/* // button text tracking out and inverting on hover */}
          <span className="relative z-10 font-telemetry font-black text-xl tracking-[0.4em] text-tron-magenta group-hover:text-tron-bg transition-colors duration-500">
            // DRIVE //
          </span>
          {/* // tech ui decal in the corner */}
          <span className="absolute right-3 top-3 w-2 h-2 bg-tron-cyan group-hover:bg-tron-bg transition-colors duration-500 z-20"></span>
        </button>
      </Link>
    </div>
  );
};

export default WelcomePage;
