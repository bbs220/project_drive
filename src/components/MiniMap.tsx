import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUIStore } from "../stores/useUIStore";
import { useAllVehicleInput } from "../hooks/useAllVehicleInput";
import { sceneConstants } from "../constants/otherConstants";
import {
  useVehicleStore,
  ENTITY_ID,
  CONTROL_STATE,
} from "../stores/useVehicleStore";
import { generatorState } from "../utils/worldGenerator";
import { useTweakpane } from "../hooks/useTweakpane";
import { iconsBank } from "../utils/assetpaths";
import mapFrag from "./sceneComponents/shaders/mapFrag.glsl";
import mapVert from "./sceneComponents/shaders/mapVert.glsl";
import { useCityStore } from "../stores/useCItyStore";
import { SimplexNoise } from "../utils/SimplexNoise";

type ProceduralMapParams = {
  fullMapZoom: number;
  miniMapZoom: number;
  zoomLerpSpeed: number;
  speedZoomMult: number;
  carMinZoom: number;
  carMaxZoom: number;
  heliMinZoom: number;
  heliMaxZoom: number;
  planeMinZoom: number;
  planeMaxZoom: number;
  edgeIconScale: number;
};

type typeProceduralMapProps = {
  isExpandedRef: React.RefObject<boolean>;
  params: ProceduralMapParams;
  northRef: React.RefObject<HTMLDivElement | null>;
  permTexture: THREE.DataTexture; // NEW PROP
};

const ProceduralMapShader = ({
  isExpandedRef,
  params,
  northRef,
  permTexture,
}: typeProceduralMapProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const dummyQ = useMemo(() => new THREE.Quaternion(), []);
  const dummyE = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);

  const icons = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return Object.fromEntries(
      Object.entries(iconsBank).map(([key, path]) => [
        key,
        loader.load(path as string),
      ]),
    );
  }, []);

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(0, 0) },
      uPlayerPos: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1.0 },
      uMapZoom: { value: 4000.0 },
      uPitch: { value: 0.0 },
      uLookAhead: { value: 0.0 },
      uActiveYaw: { value: 0.0 },
      uEdgeIconScale: { value: 0.65 },
      uPermTexture: { value: permTexture },
      uMacroFreq: { value: generatorState.macroFrequency },
      uUrbanFreq: { value: generatorState.urbanFrequency },
      uUrbanSprawl: { value: generatorState.urbanSprawl },
      uBlockSize: { value: generatorState.blockSize },
      uRoadWidth: { value: generatorState.roadWidth },
      uIconTexture: { value: icons.playerRadar },
      uPlayerTex: { value: icons.playerRadar },
      uCarTex: { value: icons.carRadar },
      uPlaneTex: { value: icons.planeRadar },
      uHeliTex: { value: icons.helicopterRadar },
      uCharPos: { value: new THREE.Vector2(0, 0) },
      uCarPos: { value: new THREE.Vector2(0, 0) },
      uPlanePos: { value: new THREE.Vector2(0, 0) },
      uHeliPos: { value: new THREE.Vector2(0, 0) },
      uCharYaw: { value: 0.0 },
      uCarYaw: { value: 0.0 },
      uPlaneYaw: { value: 0.0 },
      uHeliYaw: { value: 0.0 },
      uActiveEntity: { value: 0 },
    }),
    [icons, permTexture],
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uResolution.value.set(
      state.size.width,
      state.size.height,
    );
    materialRef.current.uniforms.uAspect.value =
      state.size.width / state.size.height;
    materialRef.current.uniforms.uEdgeIconScale.value = params.edgeIconScale;

    dummyE.setFromQuaternion(state.camera.quaternion, "YXZ");
    materialRef.current.uniforms.uActiveYaw.value = dummyE.y;

    if (northRef.current) {
      const yaw = dummyE.y;
      const nx = Math.sin(yaw);
      const ny = -Math.cos(yaw);
      const max = Math.max(Math.abs(nx), Math.abs(ny));

      northRef.current.style.left = `calc(50% + ${(nx / max) * 50}% - ${(nx / max) * 6}px)`;
      northRef.current.style.top = `calc(50% + ${(ny / max) * 50}% - ${(ny / max) * 6}px)`;
    }

    const { active, telemetry } = useVehicleStore.getState();
    const currentTelemetry = telemetry[active.entity];

    let currentSpeed = 0;
    if (currentTelemetry) {
      if ("speed" in currentTelemetry) {
        currentSpeed = currentTelemetry.speed;
      } else if ("airspeed" in currentTelemetry) {
        currentSpeed = currentTelemetry.airspeed;
      }
    }

    let targetZoom = params.miniMapZoom;
    if (active.entity === ENTITY_ID.CAR_1) {
      targetZoom = THREE.MathUtils.clamp(
        params.carMinZoom + currentSpeed * params.speedZoomMult,
        params.carMinZoom,
        params.carMaxZoom,
      );
    } else if (active.entity === ENTITY_ID.HELI_1) {
      targetZoom = THREE.MathUtils.clamp(
        params.heliMinZoom + currentSpeed * params.speedZoomMult,
        params.heliMinZoom,
        params.heliMaxZoom,
      );
    } else if (active.entity === ENTITY_ID.PLANE_1) {
      targetZoom = THREE.MathUtils.clamp(
        params.planeMinZoom + currentSpeed * params.speedZoomMult,
        params.planeMinZoom,
        params.planeMaxZoom,
      );
    }

    if (isExpandedRef.current) {
      targetZoom = params.fullMapZoom;
    }

    materialRef.current.uniforms.uMapZoom.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMapZoom.value,
      targetZoom,
      params.zoomLerpSpeed as number,
    );

    const targetPitch = active.control === CONTROL_STATE.PLAYER ? 0.0 : 0.6;
    const targetLookAhead =
      active.control === CONTROL_STATE.PLAYER ? 0.0 : 0.15;

    materialRef.current.uniforms.uPitch.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uPitch.value,
      targetPitch,
      params.zoomLerpSpeed as number,
    );

    materialRef.current.uniforms.uLookAhead.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uLookAhead.value,
      targetLookAhead,
      params.zoomLerpSpeed as number,
    );

    materialRef.current.uniforms.uIconTexture.value = icons.playerRadar;

    if (active.entity === ENTITY_ID.CAR_1) {
      materialRef.current.uniforms.uActiveEntity.value = 1;
    } else if (active.entity === ENTITY_ID.HELI_1) {
      materialRef.current.uniforms.uActiveEntity.value = 3;
    } else if (active.entity === ENTITY_ID.PLANE_1) {
      materialRef.current.uniforms.uActiveEntity.value = 2;
    } else {
      materialRef.current.uniforms.uActiveEntity.value = 0;
    }

    if (currentTelemetry) {
      materialRef.current.uniforms.uPlayerPos.value.set(
        currentTelemetry.position[0],
        currentTelemetry.position[2],
      );
    }

    const getYaw = (rot: [number, number, number, number]) => {
      dummyQ.set(rot[0], rot[1], rot[2], rot[3]);
      dummyE.setFromQuaternion(dummyQ, "YXZ");
      return dummyE.y;
    };

    const pTel = telemetry[ENTITY_ID.PLAYER_1];
    const cTel = telemetry[ENTITY_ID.CAR_1];
    const plTel = telemetry[ENTITY_ID.PLANE_1];
    const hTel = telemetry[ENTITY_ID.HELI_1];

    if (pTel) {
      materialRef.current.uniforms.uCharPos.value.set(
        pTel.position[0],
        pTel.position[2],
      );
      materialRef.current.uniforms.uCharYaw.value = getYaw(pTel.rotation);
    }
    if (cTel) {
      materialRef.current.uniforms.uCarPos.value.set(
        cTel.position[0],
        cTel.position[2],
      );
      materialRef.current.uniforms.uCarYaw.value = getYaw(cTel.rotation);
    }
    if (plTel) {
      materialRef.current.uniforms.uPlanePos.value.set(
        plTel.position[0],
        plTel.position[2],
      );
      materialRef.current.uniforms.uPlaneYaw.value = getYaw(plTel.rotation);
    }
    if (hTel) {
      materialRef.current.uniforms.uHeliPos.value.set(
        hTel.position[0],
        hTel.position[2],
      );
      materialRef.current.uniforms.uHeliYaw.value = getYaw(hTel.rotation);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent={true}
        vertexShader={mapVert}
        fragmentShader={mapFrag}
      />
    </mesh>
  );
};

const MiniMap = () => {
  const showMap = useUIStore((state) => state.showMap);
  const citySeed = useCityStore((state) => state.seed);
  const controlsRef = useAllVehicleInput();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const northRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const isExpandedRef = useRef(false);
  const prevMapKeyRef = useRef(false);

  const playerDistRef = useRef<HTMLSpanElement>(null);
  const carDistRef = useRef<HTMLSpanElement>(null);
  const planeDistRef = useRef<HTMLSpanElement>(null);
  const heliDistRef = useRef<HTMLSpanElement>(null);

  const params: ProceduralMapParams = useTweakpane(
    { title: "🗺️ Minimap", expanded: false },
    {
      miniMapZoom: { value: 680, min: 50, max: 5000, label: "walk zoom" },
      fullMapZoom: { value: 2200, min: 50, max: 10000, label: "full map zoom" },
      zoomLerpSpeed: { value: 0.1, min: 0.01, max: 1, label: "zoom speed" },
      speedZoomMult: { value: 8.0, min: 1, max: 50, label: "speed mult" },
      carMinZoom: { value: 680, min: 50, max: 5000, label: "car min z" },
      carMaxZoom: { value: 1000, min: 50, max: 10000, label: "car max z" },
      heliMinZoom: { value: 680, min: 50, max: 8000, label: "heli min z" },
      heliMaxZoom: { value: 1000, min: 50, max: 15000, label: "heli max z" },
      planeMinZoom: { value: 680, min: 50, max: 10000, label: "plane min z" },
      planeMaxZoom: { value: 1000, min: 50, max: 20000, label: "plane max z" },
      edgeIconScale: {
        value: 0.8,
        min: 0.1,
        max: 1.0,
        label: "edge icon scale",
      },
    },
  );

  // pack perm array into texture
  const permTexture = useMemo(() => {
    // local instance guaranteed to match the global seed
    const localSimplex = new SimplexNoise(citySeed);

    const data = new Uint8Array(512 * 4);
    for (let i = 0; i < 512; i++) {
      // map from the local instance
      data[i * 4] = localSimplex.perm[i];
      data[i * 4 + 1] = 0;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, 512, 1, THREE.RGBAFormat);

    // prevent WebGL from blurring the exact array values
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, [citySeed]); // re-run whenever the seed changes

  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      const timeline = gsap.timeline({ paused: true });

      timeline.to(
        wrapperRef.current,
        {
          width: "85vw",
          height: "80vh",
          right: "50%",
          top: "48.5%",
          xPercent: 50,
          yPercent: -55,
          pointerEvents: "auto",
          duration: 0.35,
          ease: "power3.inOut",
        },
        0,
      );

      if (legendRef.current) {
        timeline.to(
          legendRef.current,
          {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          0.15,
        );
      }

      tl.current = timeline;
      isExpandedRef.current = false;
    },
    { scope: wrapperRef, dependencies: [showMap] },
  );

  useEffect(() => {
    if (!showMap) return;

    let animationFrameId: number;

    const checkInput = () => {
      animationFrameId = requestAnimationFrame(checkInput);
      const currentMapKey = controlsRef.current.map;

      if (currentMapKey && !prevMapKeyRef.current) {
        isExpandedRef.current = !isExpandedRef.current;

        if (isExpandedRef.current) {
          tl.current?.play();
        } else {
          tl.current?.reverse();
        }
      }
      prevMapKeyRef.current = currentMapKey;

      if (isExpandedRef.current) {
        const state = useVehicleStore.getState();
        const activeId = state.active.entity;
        const activeTel = state.telemetry[activeId];

        if (activeTel) {
          const tel = state.telemetry;

          const calcDist = (
            t1?: { position: [number, number, number] },
            t2?: { position: [number, number, number] },
          ) => {
            if (!t1 || !t2) return 0;
            return Math.round(
              Math.hypot(
                t1.position[0] - t2.position[0],
                t1.position[2] - t2.position[2],
              ),
            );
          };

          if (playerDistRef.current) {
            playerDistRef.current.innerText =
              activeId === ENTITY_ID.PLAYER_1
                ? "ACTIVE"
                : `${calcDist(activeTel, tel[ENTITY_ID.PLAYER_1])}m`;
          }
          if (carDistRef.current) {
            carDistRef.current.innerText =
              activeId === ENTITY_ID.CAR_1
                ? "ACTIVE"
                : `${calcDist(activeTel, tel[ENTITY_ID.CAR_1])}m`;
          }
          if (planeDistRef.current) {
            planeDistRef.current.innerText =
              activeId === ENTITY_ID.PLANE_1
                ? "ACTIVE"
                : `${calcDist(activeTel, tel[ENTITY_ID.PLANE_1])}m`;
          }
          if (heliDistRef.current) {
            heliDistRef.current.innerText =
              activeId === ENTITY_ID.HELI_1
                ? "ACTIVE"
                : `${calcDist(activeTel, tel[ENTITY_ID.HELI_1])}m`;
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(checkInput);
    return () => cancelAnimationFrame(animationFrameId);
  }, [showMap, controlsRef]);

  return (
    <div
      ref={wrapperRef}
      className={`${showMap ? "block" : "hidden"} fixed ${
        sceneConstants.isDev ? "right-90" : "right-2"
      } top-2 z-14 size-60 pointer-events-none rounded-2xl border backdrop-blur-xs border-tron-cyan shadow-[0_0_15px_rgba(0,243,255,0.2)]`}
    >
      {showMap && (
        <>
          <div className="absolute inset-1.5 rounded-2xl bg-black/40 backdrop-blur-md pointer-events-auto" />

          <Canvas
            gl={{ antialias: false, alpha: true }}
            resize={{ debounce: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <ProceduralMapShader
              isExpandedRef={isExpandedRef}
              params={params}
              northRef={northRef}
              permTexture={permTexture}
            />
          </Canvas>

          <div
            ref={northRef}
            className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-bold text-black bg-white border border-tron-cyan rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)] z-20 pointer-events-none"
            style={{
              transform: "translate(-50%, -50%)",
              left: "50%",
              top: "6px",
            }}
          >
            N
          </div>

          <div
            ref={legendRef}
            className="absolute top-4 left-4 opacity-0 pointer-events-none flex flex-col gap-5 bg-black/60 backdrop-blur-md border border-tron-cyan/30 rounded-md p-4 text-xs text-white/80 shadow-[0_0_15px_rgba(0,243,255,0.1)] w-48 font-telemetry"
          >
            <div className="flex flex-col gap-2.5">
              <div className="text-tron-cyan font-bold tracking-widest mb-1 border-b border-tron-cyan/30 pb-2">
                ZONES
              </div>
              <div className="flex items-center gap-3 uppercase">
                <div className="w-3 h-3 bg-[#1a231a] border border-white/20 rounded-sm" />
                <span>Outlands</span>
              </div>
              <div className="flex items-center gap-3 uppercase">
                <div className="w-3 h-3 bg-[#333840] border border-white/20 rounded-sm" />
                <span>Roads</span>
              </div>
              <div className="flex items-center gap-3 uppercase">
                <div className="w-3 h-3 bg-[#8c95a1] border border-white/20 rounded-sm" />
                <span>Buildings</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <div className="text-tron-cyan font-bold tracking-widest mb-1 border-b border-tron-cyan/30 pb-2 mt-1">
                ICONS
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)] p-0.5">
                    <img
                      src={iconsBank.playerRadar}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="uppercase">User</span>
                </div>
                <span
                  ref={playerDistRef}
                  className="text-[10px] text-tron-cyan opacity-80"
                />
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)] p-0.5">
                    <img
                      src={iconsBank.carRadar}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="uppercase">Grid Runner</span>
                </div>
                <span
                  ref={carDistRef}
                  className="text-[10px] text-tron-cyan opacity-80"
                />
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)] p-0.5">
                    <img
                      src={iconsBank.planeRadar}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="uppercase">Aero Synth</span>
                </div>
                <span
                  ref={planeDistRef}
                  className="text-[10px] text-tron-cyan opacity-80"
                />
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)] p-0.5">
                    <img
                      src={iconsBank.helicopterRadar}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="uppercase">Neon Vortex</span>
                </div>
                <span
                  ref={heliDistRef}
                  className="text-[10px] text-tron-cyan opacity-80"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MiniMap;
