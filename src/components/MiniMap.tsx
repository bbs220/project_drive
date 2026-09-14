import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUIStore } from "../stores/useUIStore";
import { useAllVehicleInput } from "../hooks/useAllVehicleInput";
import { sceneConstants } from "../constants/otherConstants";
import { useVehicleStore, ENTITY_ID } from "../stores/useVehicleStore";
import { generatorState } from "../utils/worldGenerator";
import { useTweakpane } from "../hooks/useTweakpane";
import { iconsBank } from "../utils/assetpaths";

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
      uMacroFreq: { value: generatorState.macroFrequency },
      uUrbanFreq: { value: generatorState.urbanFrequency },
      uUrbanSprawl: { value: generatorState.urbanSprawl },
      uBlockSize: { value: generatorState.blockSize },
      uRoadWidth: { value: generatorState.roadWidth },
      uIconTexture: { value: icons.playerRadar },
    }),
    [icons],
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uAspect.value =
      state.size.width / state.size.height;

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

    // Switch the shader's active texture based on what entity we are driving
    if (active.entity === ENTITY_ID.CAR_1) {
      materialRef.current.uniforms.uIconTexture.value = icons.carRadar;
    } else if (active.entity === ENTITY_ID.HELI_1) {
      materialRef.current.uniforms.uIconTexture.value = icons.helicopterRadar;
    } else if (active.entity === ENTITY_ID.PLANE_1) {
      materialRef.current.uniforms.uIconTexture.value = icons.planeRadar;
    } else {
      materialRef.current.uniforms.uIconTexture.value = icons.playerRadar;
    }

    if (currentTelemetry) {
      materialRef.current.uniforms.uPlayerPos.value.set(
        currentTelemetry.position[0],
        currentTelemetry.position[2],
      );
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
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec2 uPlayerPos;
          uniform float uAspect;
          uniform float uMapZoom;
          
          uniform float uMacroFreq;
          uniform float uUrbanFreq;
          uniform float uUrbanSprawl;
          uniform float uBlockSize;
          uniform float uRoadWidth;
          
          uniform sampler2D uIconTexture;

          varying vec2 vUv;

          // --- Ashima Simplex Noise 2D ---
          vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
          float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }

          float fbm2D(vec2 p, int octaves, float frequency, float persistence, float lacunarity) {
            float total = 0.0;
            float currentFreq = frequency;
            float amplitude = 1.0;
            float maxValue = 0.0;

            for (int i = 0; i < octaves; i++) {
              total += snoise(p * currentFreq) * amplitude;
              maxValue += amplitude;
              amplitude *= persistence;
              currentFreq *= lacunarity;
            }
            return total / maxValue;
          }

          void main() {
            vec2 centeredUv = vUv - 0.5;
            centeredUv.x *= uAspect;
            
            // Map uses original axes coordinates exactly as you had them
            vec2 worldPos = uPlayerPos + centeredUv * vec2(uMapZoom, -uMapZoom);

            // MACRO BIOME LOGIC
            float rawBiome = fbm2D(worldPos, 3, uMacroFreq, 0.5, 2.0);
            float biomeScore = (rawBiome + 1.0) / 2.0;
            float cityThreshold = 0.45;
            
            float isCity = step(cityThreshold, biomeScore);
            float cityMask = clamp((biomeScore - cityThreshold) * 5.0, 0.0, 1.0);

            vec3 emptyColor = mix(vec3(0.08, 0.12, 0.08), vec3(0.15, 0.22, 0.12), biomeScore);

            // CITY GRID MATH
            vec2 localPos = mod(worldPos, uBlockSize);
            vec2 blockOrigin = floor(worldPos / uBlockSize) * uBlockSize;

            float isRoadX = step(localPos.x, uRoadWidth);
            float isRoadZ = step(localPos.y, uRoadWidth);
            float isRoad = clamp(isRoadX + isRoadZ, 0.0, 1.0);
            
            isRoad *= isCity; 
            vec3 roadColor = vec3(0.2, 0.22, 0.25);

            // URBAN SPRAWL & BUILDINGS
            float rawUrban = fbm2D(blockOrigin, 2, uUrbanFreq, 0.5, 2.0);
            float urbanScore = ((rawUrban + 1.0) / 2.0) * cityMask;
            
            float hasBuilding = step(uUrbanSprawl, urbanScore);
            float isBuilding = hasBuilding * (1.0 - isRoad) * isCity;
            
            vec3 buildingColor = mix(vec3(0.4, 0.45, 0.5), vec3(0.7, 0.75, 0.8), urbanScore);

            vec3 mapColor = mix(emptyColor, buildingColor, isBuilding);
            mapColor = mix(mapColor, roadColor, isRoad);

            // RENDER ICON & BACKGROUND
            float iconScale = 0.04 * (1500.0 / uMapZoom); 
            
            // 1. Create a white circular background slightly larger than the icon
            float bgRadius = iconScale * 0.55;
            float isBg = 1.0 - smoothstep(bgRadius - 0.005, bgRadius, length(centeredUv));
            
            // 2. Prep the texture UVs
            vec2 iconUv = (centeredUv / iconScale) + 0.5;
            float inIconBounds = step(0.0, iconUv.x) * step(iconUv.x, 1.0) * step(0.0, iconUv.y) * step(iconUv.y, 1.0);
            vec4 iconTex = texture2D(uIconTexture, iconUv);
            
            // 3. Blend the white circle onto the map first
            vec3 finalColor = mix(mapColor, vec3(1.0), isBg);
            
            // 4. Blend the black icon onto the white background using its alpha channel
            finalColor = mix(finalColor, iconTex.rgb, iconTex.a * inIconBounds);
            
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
    </mesh>
  );
};

const MiniMap = () => {
  const showMap = useUIStore((state) => state.showMap);
  const controlsRef = useAllVehicleInput();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null); // NEW: Track the legend UI
  const tl = useRef<gsap.core.Timeline | null>(null);

  const isExpandedRef = useRef(false);
  const prevMapKeyRef = useRef(false);

  const params: ProceduralMapParams = useTweakpane(
    { title: "🗺️ Minimap", expanded: false },
    {
      miniMapZoom: { value: 680, min: 50, max: 10000, label: "mini zoom" },
      fullMapZoom: { value: 3000, min: 50, max: 10000, label: "full map zoom" },
      zoomLerpSpeed: { value: 0.1, min: 0.01, max: 1, label: "zoom speed" },
    },
  );

  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      const timeline = gsap.timeline({ paused: true });

      // Animate the main wrapper
      timeline.to(
        wrapperRef.current,
        {
          width: "85vw",
          height: "80vh",
          right: "50%",
          top: "48.5%",
          xPercent: 50,
          yPercent: -50,
          borderRadius: "16px",
          pointerEvents: "auto",
          duration: 0.35,
          ease: "power3.inOut",
        },
        0, // Start at timeline 0
      );

      // Only animate the legend if it's currently rendered in the DOM
      if (legendRef.current) {
        timeline.to(
          legendRef.current,
          {
            opacity: 1,
            duration: 0.25,
            ease: "power2.out",
          },
          0.15, // Start fading in shortly after expansion begins
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

          {/* Non-interactable Legend: Matches shader colors exactly */}
          <div
            ref={legendRef}
            className="absolute top-6 left-6 opacity-0 pointer-events-none flex flex-col gap-2.5 bg-black/60 backdrop-blur-md border border-tron-cyan/30 rounded-md p-4 text-xs text-white/80 font-mono shadow-[0_0_15px_rgba(0,243,255,0.1)]"
          >
            <div className="text-tron-cyan font-bold tracking-widest mb-1 border-b border-tron-cyan/30 pb-2">
              MAP LEGEND
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#1a231a] border border-white/20 rounded-sm" />
              <span>Outlands / Parks</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#333840] border border-white/20 rounded-sm" />
              <span>Roads</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#8c95a1] border border-white/20 rounded-sm" />
              <span>Buildings</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
              <span>Player / Vehicle</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MiniMap;
