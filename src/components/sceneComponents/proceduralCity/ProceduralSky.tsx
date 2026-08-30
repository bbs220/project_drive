import * as THREE from "three";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { worldConstants } from "../../../utils/worldGenerator";

type ProceduralSkyProps = {
  activeChunks: Array<{ chunkX: number; chunkZ: number }>;
};

// sky config
const STARS_PER_CHUNK = 20;
const MIN_Y = 100;
const MAX_Y = 400;

// gpu shaders for twinkling and blooming
const starVert = `
  uniform float uTime;
  uniform float uSize;
  
  attribute float aTwinkleOffset;
  attribute vec3 aColor; 
  
  varying float vPulse;
  varying vec3 vColor; 

  #include <fog_pars_vertex>

  void main() {
    vColor = aColor;

    // calculate a unique pulse for each star based on time and its random offset
    float pulse = sin(uTime * 2.0 + aTwinkleOffset) * 0.5 + 0.5; 
    vPulse = pulse;

    vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
    
    // dynamically change point size to create a blooming physical effect
    gl_PointSize = (uSize + pulse * 15.0) * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    #include <fog_vertex>
  }
`;

const starFrag = `
  uniform float uIntensity;
  
  varying float vPulse;
  varying vec3 vColor;

  #include <fog_pars_fragment>

  void main() {
    // calculate distance from the center of the point
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if(dist > 0.5) discard; 

    // smoothstep creates a soft glowing radial gradient
    float alpha = smoothstep(0.5, 0.0, dist);
    
    // boost the core brightness based on the pulse using the unique star color
    vec3 bloomColor = vColor * (1.0 + vPulse * uIntensity);
    
    gl_FragColor = vec4(bloomColor, alpha * (0.4 + vPulse * 0.6));
    
    #include <fog_fragment>
  }
`;

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
  vertexShader: starVert,
  fragmentShader: starFrag,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  fog: true,
});

const SkyChunk = ({ chunkX, chunkZ }: { chunkX: number; chunkZ: number }) => {
  const { positions, offsets, colors } = useMemo(() => {
    // simple deterministic pseudo-random generator
    // given the same chunkX and chunkZ, it will ALWAYS return the same sequence
    // making this function 100% pure and react-safe
    let seed = chunkX * 73856 + chunkZ * 19284;
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
  }, [chunkX, chunkZ]);

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

const ProceduralSky = ({ activeChunks }: ProceduralSkyProps) => {
  useFrame((state) => {
    sharedStarMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      {activeChunks.map((c) => (
        <SkyChunk
          key={`sky_${c.chunkX}_${c.chunkZ}`}
          chunkX={c.chunkX}
          chunkZ={c.chunkZ}
        />
      ))}
    </group>
  );
};

export default ProceduralSky;
