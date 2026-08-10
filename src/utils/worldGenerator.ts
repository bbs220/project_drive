import FastNoiseLite from "fastnoise-lite";

// define the data structure that the generator returns
export type typeTerrainData = {
  type: "empty" | "road" | "building";
  elevation: number;
};

// local mutable state for live tuning defaults
export const generatorState = {
  urbanFrequency: 0.007,
  cityFrequency: 0.01,
  heightFrequency: 0.05,
  urbanSprawl: 0,
  roadEdge: 0.75,
  maxBuildingHeight: 80,
};

// initialize urbanization noise for density
const urbanNoise = new FastNoiseLite();
urbanNoise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);

// initialize city noise for architecture
const cityNoise = new FastNoiseLite();
cityNoise.SetNoiseType(FastNoiseLite.NoiseType.Cellular);
cityNoise.SetCellularDistanceFunction(
  FastNoiseLite.CellularDistanceFunction.Euclidean,
);
cityNoise.SetCellularReturnType(FastNoiseLite.CellularReturnType.Distance);

// initialize height noise for skyscrapers
const heightNoise = new FastNoiseLite();
heightNoise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);

// sync tweakpane params directly into the noise instances
export const syncGeneratorParams = (params: typeof generatorState) => {
  urbanNoise.SetFrequency(params.urbanFrequency);
  cityNoise.SetFrequency(params.cityFrequency);
  heightNoise.SetFrequency(params.heightFrequency);

  generatorState.urbanSprawl = params.urbanSprawl;
  generatorState.roadEdge = params.roadEdge;
  generatorState.maxBuildingHeight = params.maxBuildingHeight;
};

// master evaluator function to determine chunk contents
export const getTerrainData = (x: number, z: number): typeTerrainData => {
  const urbanScore = urbanNoise.GetNoise(x, z);

  // leave the underlying grid completely empty if outside the urban sprawl
  if (urbanScore < generatorState.urbanSprawl) {
    return { type: "empty", elevation: 0 };
  }

  const cityCell = cityNoise.GetNoise(x, z);

  // outer edges of the voronoi cells become the road network
  if (cityCell > generatorState.roadEdge) {
    return { type: "road", elevation: 0 };
  }

  // normalize noise to ensure buildings always have a minimum height
  const rawHeight = (heightNoise.GetNoise(x, z) + 1) / 2;
  const buildingHeight =
    Math.max(0.1, rawHeight) * generatorState.maxBuildingHeight;

  // inner cells become buildings with procedural heights
  return { type: "building", elevation: buildingHeight };
};
