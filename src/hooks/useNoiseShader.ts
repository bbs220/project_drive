import { useMemo } from "react";
import * as THREE from "three";

// --- glsl shaders ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 u_position;
  uniform vec2 u_resolution;
  uniform float u_res;
  uniform float u_blockSize;
  uniform float u_roadWidth;
  uniform float u_islandRadius;
  uniform float u_cityRadius;

  varying vec2 vUv;

  // basic pseudo-random hash for visual variation
  float hash(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // fast 2d value noise for the radar (mimics our cpu fbm visually)
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  void main() {
    // calculate world position
    vec2 centeredUv = vec2(vUv.x - 0.5, 0.5 - vUv.y);
    vec2 worldPos = centeredUv * u_resolution * u_res + u_position;
    
    // distance to island center (0,0)
    float distToCenter = length(worldPos);

    // base color setup
    vec3 color = vec3(0.0);

    // zone 1: the sea
    if (distToCenter > u_islandRadius) {
      color = vec3(0.0, 0.1, 0.3); // deep blue
    } 
    // zone 2: outlands (inside island, outside city)
    else if (distToCenter > u_cityRadius) {
      // create some visual bumpiness using noise
      float terrain = noise(worldPos * 0.01);
      color = vec3(0.1, 0.4 + (terrain * 0.2), 0.1); // forest green variations
    } 
    // zone 3: the city center
    else {
      // mask for urban sprawl (roughly mimics cpu urbanScore logic)
      float urbanMask = noise(worldPos * 0.005);
      
      if (urbanMask < 0.4) {
        // empty lots / parks in the city
        color = vec3(0.15, 0.2, 0.15); // dark muddy green/grey
      } else {
        // city grid rendering
        float cellSize = u_blockSize;
        vec2 localPos = mod(worldPos, cellSize);
        
        bool isRoad = localPos.x < u_roadWidth || localPos.y < u_roadWidth;

        if (isRoad) {
          color = vec3(0.4); // street grey
        } else {
          // buildings
          vec2 blockId = floor(worldPos / cellSize);
          float buildingHeight = hash(blockId); 
          color = vec3(0.5 + (buildingHeight * 0.5)); // varying shades of white/light grey
        }
      }
    }

    // output final pixel
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const useNoiseShader = () => {
  // initialize the layout exactly once for strict react data flow
  const baseUniforms = useMemo(
    () => ({
      u_position: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(300, 300) },
      u_res: { value: 20.0 }, // zoomed out to see the island radius
      u_blockSize: { value: 80.0 },
      u_roadWidth: { value: 10.0 },
      u_islandRadius: { value: 2000.0 },
      u_cityRadius: { value: 800.0 },
    }),
    [],
  );

  return {
    vertexShader,
    fragmentShader,
    baseUniforms,
  };
};
