import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTweakpane } from "../hooks/useTweakpane";
import {
  generatorState,
  getTerrainData,
  syncGeneratorParams,
} from "../utils/worldGenerator";
import { useCityStore } from "../stores/useCItyStore";
import { useUIStore } from "../stores/useUIStore";
import { useVehicleStore, ENTITY_ID } from "../stores/useVehicleStore";
import { useAllVehicleInput } from "../hooks/useAllVehicleInput";
import { iconsBank } from "../utils/assetpaths";

const TRACKED_ENTITIES = Object.values(ENTITY_ID);

const tempQuat = new THREE.Quaternion();
const tempEuler = new THREE.Euler();

const ProceduralRadar = () => {
  const showRadar = useUIStore((state) => state.showRadar);
  const controlsRef = useAllVehicleInput();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const blipRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const tl = useRef<gsap.core.Timeline | null>(null);

  const isExpandedRef = useRef(false);
  const prevMapKeyRef = useRef(false);
  const panOffset = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useGSAP(
    () => {
      // guard against null refs when the component is hidden
      if (!wrapperRef.current || !legendRef.current) return;

      tl.current = gsap
        .timeline({ paused: true })
        .to(wrapperRef.current, {
          width: "85vw",
          height: "80vh",
          right: "50%",
          top: "45%",
          xPercent: 50,
          yPercent: -50,
          borderRadius: "16px",
          pointerEvents: "auto",
          duration: 0.35,
          ease: "power3.inOut",
        })
        .to(
          legendRef.current,
          {
            opacity: 1,
            pointerEvents: "auto",
            duration: 0.2,
            ease: "power2.out",
          },
          "-=0.1",
        );

      // reset the map state so it doesn't stay internally "expanded" when hidden from sidebar
      isExpandedRef.current = false;
      panOffset.current = { x: 0, z: 0 };
    },
    // force gsap to rebuild the timeline whenever showradar changes
    { scope: wrapperRef, dependencies: [showRadar] },
  );

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

  // smoothly pan to an entity when clicked in the legend
  const centerOnEntity = (id: string) => {
    const state = useVehicleStore.getState();
    const activeEntity = state.active.entity;
    const activeData = state.telemetry[activeEntity];
    const targetData = state.telemetry[id as keyof typeof state.telemetry];

    if (activeData && targetData) {
      const targetX = targetData.position[0] - activeData.position[0];
      const targetZ = targetData.position[2] - activeData.position[2];

      gsap.to(panOffset.current, {
        x: targetX,
        z: targetZ,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  };

  useEffect(() => {
    syncGeneratorParams(params as typeof generatorState);
    regenerateCity();

    if (!showRadar) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let currentDimX = 225; // 3:2 ratio matching the visual ui width for gta feel
    let currentDimY = 150;
    let currentRes = 2.0;

    canvas.width = currentDimX;
    canvas.height = currentDimY;
    let imgData = ctx.createImageData(currentDimX, currentDimY);

    let animationFrameId: number;
    let lastUpdate = 0;

    const renderRadar = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(renderRadar);

      const targetFPS = isExpandedRef.current ? 24 : 60;
      const interval = 1000 / targetFPS;

      if (timestamp - lastUpdate < interval) return;
      lastUpdate = timestamp;

      const currentMapKey = controlsRef.current.map;

      if (currentMapKey && !prevMapKeyRef.current) {
        isExpandedRef.current = !isExpandedRef.current;

        if (isExpandedRef.current) {
          tl.current?.play();
          if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
        } else {
          tl.current?.reverse();
          // animate back to center smoothly instead of snapping instantly
          gsap.to(panOffset.current, {
            x: 0,
            z: 0,
            duration: 0.4,
            ease: "power2.out",
          });
          if (wrapperRef.current) wrapperRef.current.style.cursor = "default";
        }
      }
      prevMapKeyRef.current = currentMapKey;

      let targetDimX = 225;
      let targetDimY = 150;
      let targetRes = 2.0;

      if (isExpandedRef.current) {
        const aspect = (window.innerWidth * 0.85) / (window.innerHeight * 0.8);
        targetDimY = 180;
        targetDimX = Math.floor(targetDimY * aspect);
        targetRes = 5.0;
      }

      if (currentDimX !== targetDimX || currentDimY !== targetDimY) {
        currentDimX = targetDimX;
        currentDimY = targetDimY;
        currentRes = targetRes;

        canvas.width = currentDimX;
        canvas.height = currentDimY;
        imgData = ctx.createImageData(currentDimX, currentDimY);
      }

      const state = useVehicleStore.getState();
      const activeEntity = state.active.entity;
      const activeData = state.telemetry[activeEntity];

      const posX = (activeData?.position?.[0] || 0) + panOffset.current.x;
      const posZ = (activeData?.position?.[2] || 0) + panOffset.current.z;

      let mapYawDeg = 0;

      if (!isExpandedRef.current && activeData?.rotation) {
        tempQuat.set(
          activeData.rotation[0],
          activeData.rotation[1],
          activeData.rotation[2],
          activeData.rotation[3],
        );
        tempEuler.setFromQuaternion(tempQuat, "YXZ");
        // spins the map in reverse relative to the player
        mapYawDeg = -tempEuler.y * (180 / Math.PI);
      }

      if (mapContainerRef.current) {
        mapContainerRef.current.style.transform = `translate(-50%, -50%) rotate(${mapYawDeg}deg)`;
      }

      let i = 0;
      for (let row = 0; row < currentDimY; row++) {
        for (let col = 0; col < currentDimX; col++) {
          const worldX = (col - currentDimX / 2) * currentRes + posX;
          const worldZ = (row - currentDimY / 2) * currentRes + posZ;

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

      TRACKED_ENTITIES.forEach((id) => {
        const blip = blipRefs.current[id];
        const data = state.telemetry[id as keyof typeof state.telemetry];

        if (!blip) return;

        if (
          !data ||
          (id === ENTITY_ID.PLAYER_1 && activeEntity !== ENTITY_ID.PLAYER_1)
        ) {
          blip.style.opacity = "0";
          return;
        }

        blip.style.opacity = "1";

        const dx = data.position[0] - posX;
        const dz = data.position[2] - posZ;

        const pctX = (dx / (currentDimX * currentRes) + 0.5) * 100;
        const pctY = (dz / (currentDimY * currentRes) + 0.5) * 100;

        blip.style.left = `${pctX}%`;
        blip.style.top = `${pctY}%`;

        let iconYaw = 0;
        if (data.rotation) {
          tempQuat.set(
            data.rotation[0],
            data.rotation[1],
            data.rotation[2],
            data.rotation[3],
          );
          tempEuler.setFromQuaternion(tempQuat, "YXZ");
          iconYaw = tempEuler.y * (180 / Math.PI);
        }

        // icon rotates forward (+yaw). because it's inside the counter-rotating map (-yaw),
        // the active vehicle nets out at exactly 0 degrees (pointing straight up on screen)
        blip.style.transform = `translate(-50%, -50%) rotate(${iconYaw}deg)`;
      });
    };

    animationFrameId = requestAnimationFrame(renderRadar);
    return () => cancelAnimationFrame(animationFrameId);
  }, [params, regenerateCity, showRadar, controlsRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isExpandedRef.current) return;
    // kill any active automated gsap pans if the user grabs the map manually
    gsap.killTweensOf(panOffset.current);

    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !isExpandedRef.current) return;
    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    const panSpeed = 6.0;
    panOffset.current.x -= deltaX * panSpeed;
    panOffset.current.z -= deltaY * panSpeed;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (wrapperRef.current && isExpandedRef.current) {
      wrapperRef.current.style.cursor = "grab";
    }
  };

  // helper for legend mapping
  const getEntityDetails = (id: string) => {
    switch (id) {
      case ENTITY_ID.PLAYER_1:
        return { label: "PLAYER", icon: iconsBank.playerRadar };
      case ENTITY_ID.CAR_1:
        return { label: "CAR", icon: iconsBank.carRadar };
      case ENTITY_ID.HELI_1:
        return { label: "HELI", icon: iconsBank.helicopterRadar };
      case ENTITY_ID.PLANE_1:
        return { label: "PLANE", icon: iconsBank.planeRadar };
      default:
        return { label: "UNKNOWN", icon: iconsBank.playerRadar };
    }
  };

  if (!showRadar) return null;

  return (
    <div
      ref={wrapperRef}
      style={{ borderRadius: "16px" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      // re-positioned back to the top right with original tron cyan bloom shadows
      className="pointer-events-none absolute right-6 top-6 z-20 h-48 w-72 overflow-hidden border-2 border-tron-cyan bg-[#00050a]/90 shadow-[0_0_20px_rgba(0,243,255,0.2),inset_0_0_20px_rgba(0,243,255,0.1)] backdrop-blur-md"
    >
      <div
        ref={mapContainerRef}
        className="absolute left-1/2 top-1/2 h-[150%] w-[150%] origin-center"
      >
        <canvas
          ref={canvasRef}
          style={{ imageRendering: "pixelated" }}
          className="h-full w-full opacity-80"
        />

        <div className="absolute inset-0 pointer-events-none">
          {TRACKED_ENTITIES.map((id) => {
            const { icon } = getEntityDetails(id);
            return (
              <img
                key={id}
                ref={(el) => {
                  blipRefs.current[id] = el;
                }}
                src={icon}
                alt={`${id} Icon`}
                // restored the original cyan drop shadow for the map blips
                className="absolute w-8 h-8 opacity-0 drop-shadow-[0_0_12px_rgba(0,243,255,1)] transition-opacity duration-300 z-30"
              />
            );
          })}
        </div>
      </div>

      <div className="absolute inset-0 bg-tron-cyan mix-blend-multiply opacity-20 pointer-events-none" />

      {/* interactive legend (only visible on expanded view) */}
      <div
        ref={legendRef}
        className="absolute top-6 left-6 opacity-0 pointer-events-none z-40 flex flex-col gap-2"
      >
        <div className="bg-[#00050a]/90 border border-tron-cyan/30 rounded-lg p-3 flex flex-col gap-3 backdrop-blur-md shadow-lg">
          <span className="text-tron-cyan text-xs font-bold tracking-widest border-b border-tron-cyan/20 pb-1">
            VEHICLE TRACKING
          </span>
          {TRACKED_ENTITIES.map((id) => {
            const { label, icon } = getEntityDetails(id);
            return (
              <button
                key={id}
                onClick={(e) => {
                  e.stopPropagation(); // prevents map drag from catching the click
                  centerOnEntity(id);
                }}
                className="flex items-center gap-3 text-white hover:text-tron-cyan hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
              >
                <img
                  src={icon}
                  className="w-5 h-5 drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]"
                  alt={label}
                />
                <span className="text-xs font-mono">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProceduralRadar;
