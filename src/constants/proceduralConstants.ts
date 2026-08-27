import FastNoiseLite from "fastnoise-lite";

// define the data structure that the generator returns
export type typeTerrainData = {
  type: "empty" | "road" | "building";
  elevation: number;
};

// store all configurations for the procedural world
export const proceduralConstants = {
  noise: {
    urbanFrequency: 0.002,
    cityFrequency: 0.01,
    heightFrequency: 0.05,
  },
  thresholds: {
    urbanSprawl: 0.1,
    roadEdge: 0.75,
    maxBuildingHeight: 80,
  },
  enums: {
    openSimplex: FastNoiseLite.NoiseType.OpenSimplex2,
    cellular: FastNoiseLite.NoiseType.Cellular,
    euclidean: FastNoiseLite.CellularDistanceFunction.Euclidean,
    distance: FastNoiseLite.CellularReturnType.Distance,
  },
};

export const worldConstants = {
  chunkSize: 300,
  chunkRadius: 2,
  cellSize: 10,
  groundHeight: 0.1,
  groundOffset: -0.5,
};
