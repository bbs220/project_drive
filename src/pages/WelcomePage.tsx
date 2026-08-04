import { Link } from "react-router";

const WelcomePage = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-screen bg-zinc-950 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]">
      {/* Utilitarian dark background with a subtle technical grid for 'Realism' */}

      {/* Environmental lighting: A faint neon glow to ground the UI */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-fuchsia-500/10 blur-[120px] pointer-events-none"></div>

      <Link to={"/play"}>
        <button className="group relative flex items-center justify-center px-12 py-5 bg-zinc-900 border border-zinc-700 cursor-pointer overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-[0_0_40px_rgba(217,70,239,0.3)]">
          {/* Graphic Element: Stark utilitarian cyan bar on the left edge */}
          <span className="absolute left-0 top-0 w-1.5 h-full bg-cyan-400 z-20 group-hover:bg-zinc-950 transition-colors duration-500"></span>

          {/* Bold, hyper-saturated Marathon gradient (Cyan to Blue to Fuchsia) updated for Tailwind v4.3 */}
          <span className="absolute inset-0 w-full h-full bg-linear-to-br from-cyan-400 via-blue-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0"></span>

          {/* Typography: Technical, heavily tracked out, turning to stark dark contrast on hover */}
          <span className="relative z-10 font-mono uppercase font-black text-lg tracking-[0.4em] text-zinc-300 group-hover:text-zinc-950 transition-colors duration-500">
            {`// Drive //`}
          </span>

          {/* Tech UI Decal: A small square in the corner for that Designer's Republic feel */}
          <span className="absolute right-3 top-3 w-1.5 h-1.5 bg-zinc-600 group-hover:bg-zinc-950 transition-colors duration-500 z-20"></span>
        </button>
      </Link>
    </div>
  );
};

export default WelcomePage;
