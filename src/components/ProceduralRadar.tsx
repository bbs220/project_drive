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
  const decorationsRef = useRef<HTMLDivElement>(null);
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
      if (!wrapperRef.current || !decorationsRef.current) return;

      tl.current = gsap
        .timeline({ paused: true })
        .to(wrapperRef.current, {
          width: "85vw",
          height: "80vh",
          right: "50%",
          top: "45%",
          xPercent: 50,
          yPercent: -50,
          borderRadius: "24px", // Matches our new starting radius exactly for zero morphing!
          pointerEvents: "auto",
          duration: 0.3,
          ease: "power3.inOut",
        })
        .to(
          decorationsRef.current,
          {
            opacity: 0,
            duration: 0.15,
            ease: "power2.out",
          },
          "<",
        );

      // reset the map state so it doesn't stay internally "expanded" when hidden from sidebar
      isExpandedRef.current = false;
      panOffset.current = { x: 0, z: 0 };
    },
    // force GSAP to rebuild the timeline whenever showRadar changes!
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

  useEffect(() => {
    syncGeneratorParams(params as typeof generatorState);
    regenerateCity();

    if (!showRadar) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let currentDimX = 150;
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
          panOffset.current = { x: 0, z: 0 };
          if (wrapperRef.current) wrapperRef.current.style.cursor = "default";
        }
      }
      prevMapKeyRef.current = currentMapKey;

      let targetDimX = 150;
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
        // Spins the map in reverse relative to the player
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

        // Icon rotates forward (+yaw). Because it's inside the counter-rotating map (-yaw),
        // the active vehicle nets out at exactly 0 degrees (pointing straight UP on screen!)
        blip.style.transform = `translate(-50%, -50%) rotate(${iconYaw}deg)`;
      });
    };

    animationFrameId = requestAnimationFrame(renderRadar);
    return () => cancelAnimationFrame(animationFrameId);
  }, [params, regenerateCity, showRadar, controlsRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isExpandedRef.current) return;
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

  if (!showRadar) return null;

  return (
    <div
      ref={wrapperRef}
      style={{ borderRadius: "24px" }} // NEW: Starts precisely at 24px so the corners never morph!
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      // Removed overflow-hidden class since inline styles manage border radius
      className="pointer-events-none absolute right-6 top-6 z-20 h-56 w-56 overflow-hidden border-2 border-tron-cyan bg-[#00050a]/90 shadow-[0_0_20px_rgba(0,243,255,0.2),inset_0_0_20px_rgba(0,243,255,0.1)] backdrop-blur-md"
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
            let src = iconsBank.playerRadar;
            if (id === ENTITY_ID.CAR_1) src = iconsBank.carRadar;
            if (id === ENTITY_ID.HELI_1) src = iconsBank.helicopterRadar;
            if (id === ENTITY_ID.PLANE_1) src = iconsBank.planeRadar;

            return (
              <img
                key={id}
                ref={(el) => {
                  blipRefs.current[id] = el;
                }}
                src={src}
                alt={`${id} Icon`}
                className="absolute w-8 h-8 opacity-0 drop-shadow-[0_0_12px_rgba(0,243,255,1)] transition-opacity duration-300 z-30"
              />
            );
          })}
        </div>
      </div>

      <div className="absolute inset-0 bg-tron-cyan mix-blend-multiply opacity-80 pointer-events-none" />

      <div
        ref={decorationsRef}
        className="absolute inset-0 pointer-events-none"
      >
        {/* NEW: Updated the decorative rings to be concentric rounded rectangles instead of perfect circles */}
        <div className="absolute inset-4 rounded-2xl border border-tron-cyan/20" />
        <div className="absolute inset-10 rounded-xl border border-tron-cyan/15" />
        <div className="absolute inset-16 rounded-lg border border-tron-cyan/10" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-tron-cyan/30" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-tron-cyan/30" />

        {/* Scanner sweep matches the 24px container radius perfectly */}
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-3xl bg-[conic-gradient(from_0deg,transparent_75%,rgba(0,243,255,0.4)_100%)]" />
      </div>
    </div>
  );
};

export default ProceduralRadar;
