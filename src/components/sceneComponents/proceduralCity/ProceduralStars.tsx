import * as THREE from "three";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { worldConstants } from "../../../utils/worldGenerator";
import starsVert from "../shaders/starsVert.glsl";
import starsFrag from "../shaders/starsFrag.glsl";
import { useCityStore } from "../../../stores/useCItyStore";
import { useTweakpane } from "../../../hooks/useTweakpane";

type ProceduralSkyProps = {
  activeChunks: Array<{ chunkX: number; chunkZ: number }>;
};

// sky config
const STARS_PER_CHUNK = 50;
const MIN_Y = 180;
const MAX_Y = 400;

// share one material globally
const sharedStarMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uSize: { value: 20.0 },
      uIntensity: { value: 2.5 },
    },
  ]),
  vertexShader: starsVert,
  fragmentShader: starsFrag,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  fog: true,
});

const StarChunk = ({
  chunkX,
  chunkZ,
  globalSeed,
}: {
  chunkX: number;
  chunkZ: number;
  globalSeed: number;
}) => {
  const { positions, offsets, colors } = useMemo(() => {
    // simple deterministic pseudo-random generator
    // Now incorporating the global world seed so the sky matches the city!
    let seed = globalSeed + chunkX * 73856 + chunkZ * 19284;

    const rand = () => {
      seed += 1;
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const pos = new Float32Array(STARS_PER_CHUNK * 3);
    const offs = new Float32Array(STARS_PER_CHUNK);
    const cols = new Float32Array(STARS_PER_CHUNK * 3);

    const offsetX = chunkX * worldConstants.chunkSize;
    const offsetZ = chunkZ * worldConstants.chunkSize;
    const tempColor = new THREE.Color();

    let i3 = 0;
    for (let i = 0; i < STARS_PER_CHUNK; i++) {
      // random positions
      pos[i3] = offsetX + (rand() - 0.5) * worldConstants.chunkSize;

      // square root skews the random distribution heavily toward 1.0
      // this means higher star density at the top (near MAX_Y) and sparse at the bottom (near MIN_Y)
      pos[i3 + 1] = MIN_Y + Math.sqrt(rand()) * (MAX_Y - MIN_Y);

      pos[i3 + 2] = offsetZ + (rand() - 0.5) * worldConstants.chunkSize;

      // random twinkle offset
      offs[i] = rand() * Math.PI * 2;

      // generate a bright random color
      tempColor.setHSL(rand(), 0.7 + rand() * 0.3, 0.5 + rand() * 0.3);

      cols[i3] = tempColor.r;
      cols[i3 + 1] = tempColor.g;
      cols[i3 + 2] = tempColor.b;

      i3 += 3;
    }

    return { positions: pos, offsets: offs, colors: cols };
  }, [chunkX, chunkZ, globalSeed]); // Added globalSeed to dependency array

  return (
    <points material={sharedStarMaterial}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute
          attach="attributes-aTwinkleOffset"
          args={[offsets, 1]}
        />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
    </points>
  );
};

const ProceduralStars = ({ activeChunks }: ProceduralSkyProps) => {
  // Grab the global seed from your store
  const globalSeed = useCityStore((state) => state.seed);

  const params = useTweakpane(
    { title: "☁️ Weather System", expanded: false },
    {
      enableStars: { value: false, label: "enable stars", folder: "Stars" },
    },
  );

  useFrame((state) => {
    sharedStarMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group visible={params.enableStars}>
      {activeChunks.map((c) => (
        <StarChunk
          key={`sky_${c.chunkX}_${c.chunkZ}_${globalSeed}`}
          chunkX={c.chunkX}
          chunkZ={c.chunkZ}
          globalSeed={globalSeed}
        />
      ))}
    </group>
  );
};

export default ProceduralStars;
