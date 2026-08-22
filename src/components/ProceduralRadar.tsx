import { useEffect, useRef } from "react";
import { useTweakpane } from "../hooks/useTweakpane";
import {
  generatorState,
  getTerrainData,
  syncGeneratorParams,
} from "../utils/worldGenerator";
import { useCityStore } from "../stores/useCItyStore";
import { useUIStore } from "../stores/useUIStore";

const ProceduralRadar = () => {
  // hook up UI store for global visibility
  const showRadar = useUIStore((state) => state.showRadar);

  // hook up tweakpane
  const params = useTweakpane(
    { title: "🏙️ City Generator", expanded: false },
    {
      urbanFrequency: {
        value: generatorState.urbanFrequency,
        min: 0.0001,
        max: 0.02,
      },
      heightFrequency: {
        value: generatorState.heightFrequency,
        min: 0.001,
        max: 0.2,
      },
      urbanSprawl: {
        value: generatorState.urbanSprawl,
        min: 0.0,
        max: 1.0,
      },
      blockSize: {
        value: generatorState.blockSize,
        min: 30,
        max: 150,
        step: 10,
      },
      roadWidth: {
        value: generatorState.roadWidth,
        min: 10,
        max: 60,
        step: 10,
      },
      maxBuildingHeight: {
        value: generatorState.maxBuildingHeight,
        min: 10,
        max: 200,
      },
      seed: {
        value: generatorState.seed,
        min: 0,
        max: 10000,
        step: 1,
        label: "regenerate seed",
      },
    },
  );

  const regenerateCity = useCityStore((state) => state.regenerateCity);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    syncGeneratorParams(params as typeof generatorState);
    regenerateCity();

    // bail out early if radar is hidden globally in settings
    if (!showRadar) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mapSize = 300;
    const resolution = 1;
    const dim = mapSize / resolution;

    canvas.width = dim;
    canvas.height = dim;
    const imgData = ctx.createImageData(dim, dim);

    let i = 0;
    for (let z = -mapSize / 2; z < mapSize / 2; z += resolution) {
      for (let x = -mapSize / 2; x < mapSize / 2; x += resolution) {
        const data = getTerrainData(x, z);
        let shade: number;

        if (data.type === "building") {
          shade =
            100 + Math.floor((data.elevation / params.maxBuildingHeight) * 155);
        } else if (data.type === "road") {
          shade = 40;
        } else {
          shade = 0;
        }

        // keep it grayscale in memory to save processing time
        imgData.data[i++] = shade;
        imgData.data[i++] = shade;
        imgData.data[i++] = shade;
        imgData.data[i++] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [params, regenerateCity, showRadar]);

  // if disabled in the UI settings, return null to completely unmount
  if (!showRadar) return null;

  return (
    // turn right 90 to right 60 before shipping
    <div className="pointer-events-none absolute right-90 top-6 z-20 h-56 w-56 overflow-hidden rounded-full border-2 border-tron-cyan bg-[#00050a]/90 shadow-[0_0_20px_rgba(0,243,255,0.2),inset_0_0_20px_rgba(0,243,255,0.1)] backdrop-blur-md transition-all duration-500 ease-out">
      {/* underlying procedural map lowered opacity fades it into the background. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-60"
      />

      {/* colorize Trick: instantly turns the white/gray canvas below into neon cyan */}
      <div className="absolute inset-0 bg-tron-cyan mix-blend-multiply opacity-80" />

      {/* concentric Tactical Rings */}
      <div className="absolute inset-6 rounded-full border border-tron-cyan/20" />
      <div className="absolute inset-14 rounded-full border border-tron-cyan/15" />
      <div className="absolute inset-20 rounded-full border border-tron-cyan/10" />

      {/* static Crosshairs */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-tron-cyan/30" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-tron-cyan/30" />

      {/* rotating Radar Sweep via conic-gradient */}
      <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_75%,rgba(0,243,255,0.4)_100%)]" />

      {/* center Player Blip (Glowing Triangle) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3">
        <div className="h-0 w-0 border-b-10 border-l-[6px] border-r-[6px] border-b-tron-yellow border-l-transparent border-r-transparent drop-shadow-[0_0_8px_#ffeb3b]" />
      </div>
    </div>
  );
};

export default ProceduralRadar;
