import { useEffect, useRef } from "react";
import { useTweakpane } from "../hooks/useTweakpane";
import {
  generatorState,
  getTerrainData,
  syncGeneratorParams,
} from "../utils/worldGenerator";
import { useCityStore } from "../stores/useCItyStore";

const ProceduralRadar = () => {
  // hook up tweakpane to live edit the procedural grid parameters
  const params = useTweakpane(
    { title: "🏙️ city generator", expanded: false },
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
    },
  );

  // pull the trigger function from our global store
  const regenerateCity = useCityStore((state) => state.regenerateCity);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // draw the raw noise arrays to a pixel canvas whenever parameters change
  useEffect(() => {
    // sync the math variables
    syncGeneratorParams(params as typeof generatorState);

    // tell the 3d scene to rebuild the meshes across the zustand bridge
    regenerateCity();

    // draw the 2d canvas radar
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // render radar at actual resolution for smooth gradients without skipping data
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

        // map elevation to a grayscale gradient
        if (data.type === "building") {
          // map building heights to a gradient from medium gray to pure white
          shade =
            100 + Math.floor((data.elevation / params.maxBuildingHeight) * 155);
        } else if (data.type === "road") {
          // roads are dark gray
          shade = 40;
        } else {
          // empty void is pitch black
          shade = 0;
        }

        // assign the calculated shade to rgb for perfect grayscale
        imgData.data[i++] = shade;
        imgData.data[i++] = shade;
        imgData.data[i++] = shade;

        // lock full alpha channel
        imgData.data[i++] = 255;
      }
    }

    // push the calculated pixel array into the canvas
    ctx.putImageData(imgData, 0, 0);
  }, [params, regenerateCity]);

  return (
    <div className="pointer-events-none border-2 border-gray-600 rounded-md overflow-hidden absolute right-64 top-2 z-50 -translate-x-1/2 ">
      <canvas ref={canvasRef} className="h-48 w-48" />
    </div>
  );
};

export default ProceduralRadar;
