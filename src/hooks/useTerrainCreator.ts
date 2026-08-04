import { useMemo } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

// define terrain hook parameters
interface TerrainParams {
  size: number;
  resolution: number;
  noiseScale: number;
  noiseHeight: number;
}

// export terrain generator hook
export const useTerrainCreator = (params: TerrainParams) => {
  return useMemo(() => {
    // initialize simplex noise generator
    const generateNoise = createNoise2D();

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

      // calculate smooth elevation using simplex noise
      const y =
        generateNoise(x * params.noiseScale, z * params.noiseScale) *
        params.noiseHeight;

      // apply height to vertical axis
      positions[i + 1] = y;
    }

    // recompute normals so shadows and lighting curve over the hills properly
    geometry.computeVertexNormals();

    return { geometry };
  }, [params.size, params.resolution, params.noiseScale, params.noiseHeight]);
};
