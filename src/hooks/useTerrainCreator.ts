import { useMemo } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

// create a singleton noise generator so grass and terrain always match perfectly
export const generateTerrainNoise = createNoise2D();

// define terrain hook parameters
export type TerrainParams = {
  size: number;
  resolution: number;
  noiseScale: number;
  noiseHeight: number;
};

// export terrain generator hook
export const useTerrainCreator = (params: TerrainParams) => {
  return useMemo(() => {
    // create base plane geometry
    const geometry = new THREE.PlaneGeometry(
      params.size,
      params.size,
      params.resolution,
      params.resolution,
    );

    // rotate plane to lay flat on the ground
    geometry.rotateX(-Math.PI / 2);

    // extract raw vertex position array
    const positions = geometry.attributes.position.array;

    // iterate through vertices to apply procedural noise height
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      // calculate smooth elevation using shared singleton noise
      const y =
        generateTerrainNoise(x * params.noiseScale, z * params.noiseScale) *
        params.noiseHeight;

      // apply height to vertical axis
      positions[i + 1] = y;
    }

    // recompute normals so shadows and lighting curve over the hills properly
    geometry.computeVertexNormals();

    return { geometry };
  }, [params.size, params.resolution, params.noiseScale, params.noiseHeight]);
};
