import FastNoiseLite from "fastnoise-lite";

// define the data structure that the generator returns
export type typeTerrainData = {
  type: "water" | "cliff" | "road" | "building" | "nature";
  elevation: number;
};

// store all configurations for the procedural world
export const proceduralConstants = {
  noise: {
    elevationFrequency: 0.005,
    elevationOctaves: 3,
    urbanFrequency: 0.002,
    cityFrequency: 0.01,
  },
  thresholds: {
    heightMultiplier: 50,
    waterLevel: -10,
    cliffSlope: 1.5,
    urbanSprawl: 0.3,
    roadEdge: 0.75,
  },
  enums: {
    openSimplex: FastNoiseLite.NoiseType.OpenSimplex2,
    cellular: FastNoiseLite.NoiseType.Cellular,
    fbm: FastNoiseLite.FractalType.FBm,
    euclidean: FastNoiseLite.CellularDistanceFunction.Euclidean,
    distance: FastNoiseLite.CellularReturnType.Distance,
  },
};
