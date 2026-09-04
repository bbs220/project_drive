import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    // main container with deep void background and faint cyan grid
    <div className="relative flex flex-col items-center justify-center min-h-screen w-screen bg-tron-bg bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]">
      {/* // ambient warning glow in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-tron-warn/10 blur-[120px] pointer-events-none"></div>
      {/* // error text section */}
      <div className="relative z-10 flex flex-col items-center mb-16 text-center">
        {/* // massive 404 text using the warning color and heavy bloom */}
        <h1 className="text-8xl md:text-[150px] font-telemetry font-bold text-tron-warn tracking-widest mb-2 [text-shadow:0_0_30px_var(--color-tron-warn)]">
          404
        </h1>
        {/* // tech styled subtitle using the clean label font */}
        <p className="text-xl md:text-3xl font-label text-tron-cyan tracking-[0.4em] uppercase [text-shadow:0_0_10px_var(--color-tron-cyan)]">
          sector not found
        </p>
      </div>
      {/* // interactive return button */}
      <Link to={"/"}>
        {/* // button container utilizing the custom shadow neon cyan class */}
        <button className="group relative flex items-center justify-center px-10 py-4 bg-transparent border border-tron-cyan cursor-pointer overflow-hidden transition-all duration-500 ease-out hover:scale-105 shadow-neon-cyan hover:bg-tron-cyan">
          {/* // stark warning bar on the left edge */}
          <span className="absolute left-0 top-0 w-2 h-full bg-tron-warn z-20 group-hover:bg-tron-bg transition-colors duration-500"></span>
          {/* // button text tracking out and inverting on hover */}
          <span className="relative z-10 font-telemetry font-black text-lg tracking-[0.3em] text-tron-cyan group-hover:text-tron-bg transition-colors duration-500 uppercase">
            [ return to home ]
          </span>
          {/* // tech ui decal in the corner */}
          <span className="absolute right-3 top-3 w-2 h-2 bg-tron-warn group-hover:bg-tron-bg transition-colors duration-500 z-20"></span>
        </button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
