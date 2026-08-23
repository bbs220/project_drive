import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../hooks/useTweakpane";
import {
  generatorState,
  getTerrainData,
  syncGeneratorParams,
} from "../utils/worldGenerator";
import { useCityStore } from "../stores/useCItyStore";
import { useUIStore } from "../stores/useUIStore";
import { useVehicleStore } from "../stores/useVehicleStore";

// Initialize math objects outside the component so they don't leak memory in the loop
const tempQuat = new THREE.Quaternion();
const tempEuler = new THREE.Euler();

const ProceduralRadar = () => {
  const showRadar = useUIStore((state) => state.showRadar);

  // We separate the DOM references. One for drawing pixels, one for spinning.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

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
      urbanSprawl: { value: generatorState.urbanSprawl, min: 0.0, max: 1.0 },
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

  useEffect(() => {
    syncGeneratorParams(params as typeof generatorState);
    regenerateCity();

    if (!showRadar) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mapSize = 300;
    const resolution = 2;
    const dim = mapSize / resolution;

    canvas.width = dim;
    canvas.height = dim;
    const imgData = ctx.createImageData(dim, dim);

    let animationFrameId: number;
    let lastUpdate = 0;
    const TARGET_FPS = 120;
    const interval = 1000 / TARGET_FPS;

    const renderRadar = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(renderRadar);

      if (timestamp - lastUpdate < interval) return;
      lastUpdate = timestamp;

      const state = useVehicleStore.getState();

      const activeEntity = state.active.entity;
      const activeData = state.telemetry[activeEntity];

      const posX = activeData?.position?.[0] || 0;
      const posZ = activeData?.position?.[2] || 0;

      let activeYaw = 0;

      // Extract yaw mathematically from the universal quaternion
      if (activeData?.rotation) {
        tempQuat.set(
          activeData.rotation[0],
          activeData.rotation[1],
          activeData.rotation[2],
          activeData.rotation[3],
        );
        tempEuler.setFromQuaternion(tempQuat, "YXZ");
        activeYaw = tempEuler.y;
      }

      // SPIN THE WRAPPER DIV, NOT THE CANVAS
      if (mapContainerRef.current) {
        // Convert to degrees for perfect CSS parsing
        const activeYawDeg = activeYaw * (180 / Math.PI);

        // If the map spins opposite to your camera, simply add a minus sign: rotate(${-activeYawDeg}deg)
        mapContainerRef.current.style.transform = `translate(-50%, -50%) rotate(${activeYawDeg}deg)`;
      }

      let i = 0;
      for (let z = -mapSize / 2; z < mapSize / 2; z += resolution) {
        for (let x = -mapSize / 2; x < mapSize / 2; x += resolution) {
          const worldX = x + posX;
          const worldZ = z + posZ;

          const data = getTerrainData(worldX, worldZ);
          let shade: number;

          if (data.type === "building") {
            shade =
              100 +
              Math.floor((data.elevation / params.maxBuildingHeight) * 155);
          } else if (data.type === "road") {
            shade = 40;
          } else {
            shade = 0;
          }

          imgData.data[i++] = shade;
          imgData.data[i++] = shade;
          imgData.data[i++] = shade;
          imgData.data[i++] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    animationFrameId = requestAnimationFrame(renderRadar);
    return () => cancelAnimationFrame(animationFrameId);
  }, [params, regenerateCity, showRadar]);

  if (!showRadar) return null;

  return (
    <div className="pointer-events-none absolute right-6 top-6 z-20 h-56 w-56 overflow-hidden rounded-full border-2 border-tron-cyan bg-[#00050a]/90 shadow-[0_0_20px_rgba(0,243,255,0.2),inset_0_0_20px_rgba(0,243,255,0.1)] backdrop-blur-md transition-all duration-500 ease-out">
      {/* 
        NEW: We wrap the canvas in a div. 
        CSS rotates this div smoothly, while the canvas safely redraws pixels inside it.
      */}
      <div
        ref={mapContainerRef}
        className="absolute left-1/2 top-1/2 h-[150%] w-[150%] origin-center"
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full opacity-60 blur-[0.5px]"
        />
      </div>

      <div className="absolute inset-0 bg-tron-cyan mix-blend-multiply opacity-80" />

      <div className="absolute inset-6 rounded-full border border-tron-cyan/20" />
      <div className="absolute inset-14 rounded-full border border-tron-cyan/15" />
      <div className="absolute inset-20 rounded-full border border-tron-cyan/10" />

      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-tron-cyan/30" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-tron-cyan/30" />

      <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_75%,rgba(0,243,255,0.4)_100%)]" />

      {/* 
        STATIC CENTER BLIP: 
        Always points straight UP. The map rotates underneath it. 
      */}
      <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6 text-tron-yellow drop-shadow-[0_0_8px_#ffeb3b]"
        >
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
      </div>
    </div>
  );
};

export default ProceduralRadar;
