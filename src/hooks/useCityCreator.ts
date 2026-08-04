import { useMemo } from "react";
import * as THREE from "three";
import { generateTerrainNoise } from "./useTerrainCreator";

// define city generation
export type CityParams = {
  buildingCount: number;
  minDistance: number;
  cityRadius: number;
  minHeight: number;
  maxHeight: number;
  noiseScale: number;
  noiseHeight: number;
};

// simple deterministic pseudo random number generator
// guarantees pure layout generation to satisfy react compiler
const createSeededRandom = (seed: number) => {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
};

// export city generation hook
export const useCityCreator = (params: CityParams) => {
  return useMemo(() => {
    // initialize pure random generator with fixed seed
    const random = createSeededRandom(1337);

    // track valid points for organic scattering
    const validPoints: THREE.Vector2[] = [];

    // build the unified instances array required by modern rapier
    const instances: {
      key: string;
      position: [number, number, number];
      scale: [number, number, number];
      rotation: [number, number, number];
      type: "fixed";
    }[] = [];

    // generate organic scatter points using simple rejection
    for (let i = 0; i < params.buildingCount * 10; i++) {
      // stop if we reached desired building count
      if (validPoints.length >= params.buildingCount) break;

      // generate random point in a circle using pure seeded random
      const angle = random() * Math.PI * 2;
      const radius = random() * params.cityRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // check distance against all existing points to ensure road gaps
      let isValid = true;
      for (const point of validPoints) {
        const dx = point.x - x;
        const dy = point.y - z;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < params.minDistance) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        validPoints.push(new THREE.Vector2(x, z));

        // determine base terrain height at this exact coordinate
        const terrainY =
          generateTerrainNoise(x * params.noiseScale, z * params.noiseScale) *
          params.noiseHeight;

        // randomize building height purely
        const height =
          params.minHeight + random() * (params.maxHeight - params.minHeight);

        // base width leaves room for roads based on min distance
        const width =
          params.minDistance * 0.6 + random() * (params.minDistance * 0.2);
        const depth =
          params.minDistance * 0.6 + random() * (params.minDistance * 0.2);

        // push unified instance object for rapier
        instances.push({
          key: `building_${validPoints.length}`,
          position: [x, terrainY + height / 2, z],
          scale: [width, height, depth],
          rotation: [0, random() * Math.PI, 0],
          type: "fixed",
        });
      }
    }

    return { instances, count: validPoints.length };
  }, [
    params.buildingCount,
    params.minDistance,
    params.cityRadius,
    params.minHeight,
    params.maxHeight,
    params.noiseScale,
    params.noiseHeight,
  ]);
};
