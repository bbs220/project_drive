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

type ProceduralMapParams = {
  fullMapZoom: number;
  miniMapZoom: number;
  zoomLerpSpeed: number;
};

type typeProceduralMapProps = {
  isExpandedRef: React.RefObject<boolean>;
  params: ProceduralMapParams;
};

const ProceduralMapShader = ({
  isExpandedRef,
  params,
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
      uPlayerPos: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1.0 },
      uMapZoom: { value: 4000.0 },
      uPitch: { value: 0.0 },
      uLookAhead: { value: 0.0 },
      uActiveYaw: { value: 0.0 },
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
    [icons],
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uAspect.value =
      state.size.width / state.size.height;

    dummyE.setFromQuaternion(state.camera.quaternion, "YXZ");
    materialRef.current.uniforms.uActiveYaw.value = dummyE.y;

    const targetZoom = isExpandedRef.current
      ? (params.fullMapZoom as number)
      : (params.miniMapZoom as number);

    materialRef.current.uniforms.uMapZoom.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMapZoom.value,
      targetZoom,
      params.zoomLerpSpeed as number,
    );

    const { active, telemetry } = useVehicleStore.getState();
    const currentTelemetry = telemetry[active.entity];

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

    if (active.entity === ENTITY_ID.CAR_1) {
      materialRef.current.uniforms.uIconTexture.value = icons.carRadar;
      materialRef.current.uniforms.uActiveEntity.value = 1;
    } else if (active.entity === ENTITY_ID.HELI_1) {
      materialRef.current.uniforms.uIconTexture.value = icons.helicopterRadar;
      materialRef.current.uniforms.uActiveEntity.value = 3;
    } else if (active.entity === ENTITY_ID.PLANE_1) {
      materialRef.current.uniforms.uIconTexture.value = icons.planeRadar;
      materialRef.current.uniforms.uActiveEntity.value = 2;
    } else {
      materialRef.current.uniforms.uIconTexture.value = icons.playerRadar;
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
  const controlsRef = useAllVehicleInput();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
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
      miniMapZoom: { value: 680, min: 50, max: 10000, label: "mini zoom" },
      fullMapZoom: { value: 1500, min: 50, max: 10000, label: "full map zoom" },
      zoomLerpSpeed: { value: 0.1, min: 0.01, max: 1, label: "zoom speed" },
    },
  );

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
          borderRadius: "16px",
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

          const calcDist = (t1: any, t2: any) => {
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
      } top-2 z-14 size-60 overflow-hidden pointer-events-none rounded-md border border-tron-cyan bg-black/40 backdrop-blur-md [box-shadow:0_0_15px_rgba(0,243,255,0.2)]`}
    >
      {showMap && (
        <>
          <Canvas
            gl={{ antialias: false, alpha: false }}
            resize={{ debounce: 0 }}
          >
            <ProceduralMapShader
              isExpandedRef={isExpandedRef}
              params={params}
            />
          </Canvas>

          <div
            ref={legendRef}
            className="absolute top-6 left-6 opacity-0 pointer-events-none flex flex-col gap-5 bg-black/60 backdrop-blur-md border border-tron-cyan/30 rounded-md p-4 text-xs text-white/80 font-mono shadow-[0_0_15px_rgba(0,243,255,0.1)] w-48"
          >
            <div className="flex flex-col gap-2.5">
              <div className="text-tron-cyan font-bold tracking-widest mb-1 border-b border-tron-cyan/30 pb-2">
                ZONES
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#1a231a] border border-white/20 rounded-sm" />
                <span>Outlands</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#333840] border border-white/20 rounded-sm" />
                <span>Roads</span>
              </div>
              <div className="flex items-center gap-3">
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
                  <span>Player</span>
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
                  <span>Car</span>
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
                  <span>Plane</span>
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
                  <span>Helicopter</span>
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
