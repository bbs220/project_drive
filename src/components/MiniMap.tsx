import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUIStore } from "../stores/useUIStore";
import { useAllVehicleInput } from "../hooks/useAllVehicleInput";
import { sceneConstants } from "../constants/otherConstants";
import { useVehicleStore } from "../stores/useVehicleStore";
import { generatorState } from "../utils/worldGenerator";
import { useTweakpane } from "../hooks/useTweakpane";

type ProceduralMapParams = {
  fullMapZoom: number;
  miniMapZoom: number;
  zoomLerpSpeed: number;
};

// define props to pass our refs and tweakpane parameters down into the canvas
type typeProceduralMapProps = {
  isExpandedRef: React.RefObject<boolean>;
  params: ProceduralMapParams;
};

// inner R3F component to handle the shader and high-performance useFrame loop
const ProceduralMapShader = ({
  isExpandedRef,
  params,
}: typeProceduralMapProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // memoize the uniforms to prevent unnecessary reallocation
  const uniforms = useMemo(
    () => ({
      uPlayerPos: { value: new THREE.Vector2(0, 0) },
      uMacroFreq: { value: generatorState.macroFrequency },
      uAspect: { value: 1.0 }, // added aspect ratio uniform
      uMapZoom: { value: 4000.0 }, // dynamic zoom uniform
    }),
    [],
  );

  // poll the active vehicle's telemetry purely for the map offset
  useFrame((state) => {
    if (!materialRef.current) return;

    // smoothly update the aspect ratio 120 times a second as GSAP resizes the container
    materialRef.current.uniforms.uAspect.value =
      state.size.width / state.size.height;

    // smoothly lerp the map zoom based on whether it is expanded or collapsed
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

    if (currentTelemetry) {
      // map 3D World X and Z to the 2D map X and Y coordinates
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
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            // Bypass camera projections and strictly fill the viewport
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec2 uPlayerPos;
          uniform float uMacroFreq;
          uniform float uAspect;
          uniform float uMapZoom;
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

          // Directly matches your JS fbm2D function
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
            // Shift the UV to center (0.0), scale the X-axis by our aspect ratio, then shift back
            vec2 centeredUv = vUv - 0.5;
            centeredUv.x *= uAspect;

            // Map the corrected UVs to physical world coordinates centering on the player
            // uMapZoom replaces the hardcoded 4000.0 value
            vec2 worldPos = uPlayerPos + centeredUv * vec2(uMapZoom, -uMapZoom);

            // Replicate macro biome generation
            float rawBiome = fbm2D(worldPos, 3, uMacroFreq, 0.5, 2.0);
            
            // Normalize -1 to 1 into 0 to 1
            float biomeScore = (rawBiome + 1.0) / 2.0;

            // Render pure black and white data
            gl_FragColor = vec4(vec3(biomeScore), 1.0);
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
  const tl = useRef<gsap.core.Timeline | null>(null);

  const isExpandedRef = useRef(false);
  const prevMapKeyRef = useRef(false);

  // setup tweakpane parameters for dynamic zooming
  const params: ProceduralMapParams = useTweakpane(
    { title: "🗺️ Minimap", expanded: false },
    {
      miniMapZoom: { value: 1500, min: 500, max: 10000, label: "mini zoom" },
      fullMapZoom: {
        value: 8000,
        min: 1000,
        max: 30000,
        label: "full map zoom",
      },
      zoomLerpSpeed: { value: 0.1, min: 0.01, max: 1, label: "zoom speed" },
    },
  );

  // setup the GSAP timeline
  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      tl.current = gsap.timeline({ paused: true }).to(wrapperRef.current, {
        width: "85vw",
        height: "80vh",
        right: "50%",
        top: "45%",
        xPercent: 50, // centers it horizontally against right: 50%
        yPercent: -50, // centers it vertically against top: 45%
        borderRadius: "16px", // smoothly rounds out more when expanded
        pointerEvents: "auto",
        duration: 0.35,
        ease: "power3.inOut",
      });

      // ensure state resets if unmounted/hidden
      isExpandedRef.current = false;
    },
    { scope: wrapperRef, dependencies: [showMap] },
  );

  // minimal polling loop JUST for the map key toggle
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
        <Canvas
          gl={{ antialias: false, alpha: false }}
          resize={{ debounce: 0 }}
        >
          <ProceduralMapShader isExpandedRef={isExpandedRef} params={params} />
        </Canvas>
      )}
    </div>
  );
};

export default MiniMap;
