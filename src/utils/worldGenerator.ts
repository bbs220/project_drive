import FastNoiseLite from "fastnoise-lite";

// define the data structure that the generator returns
export type typeTerrainData = {
  type: "empty" | "road" | "building";
  elevation: number;
};

// local mutable state for live tuning defaults
export const generatorState = {
  urbanFrequency: 0.004,
  heightFrequency: 0.01,
  urbanSprawl: 0.26,
  blockSize: 80,
  roadWidth: 10,
  maxBuildingHeight: 60,
};

// initialize urbanization noise for sprawling city islands
const urbanNoise = new FastNoiseLite();
urbanNoise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);

// initialize height noise for skyscrapers
const heightNoise = new FastNoiseLite();
heightNoise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);

// sync tweakpane params directly into the math state
export const syncGeneratorParams = (params: typeof generatorState) => {
  urbanNoise.SetFrequency(params.urbanFrequency);
  heightNoise.SetFrequency(params.heightFrequency);

  generatorState.urbanSprawl = params.urbanSprawl;
  generatorState.blockSize = params.blockSize;
  generatorState.roadWidth = params.roadWidth;
  generatorState.maxBuildingHeight = params.maxBuildingHeight;
};

// master evaluator function to determine chunk contents
export const getTerrainData = (x: number, z: number): typeTerrainData => {
  // normalize fastnoiselite from bounds to strict zero to one for sprawl
  const rawUrban = urbanNoise.GetNoise(x, z);
  const urbanScore = (rawUrban + 1) / 2;

  // leave the underlying grid completely empty if outside the urban sprawl percentage
  if (urbanScore < generatorState.urbanSprawl) {
    return { type: "empty", elevation: 0 };
  }

  // calculate positive modulo to ensure continuous grid across negative coordinates
  const modX =
    ((x % generatorState.blockSize) + generatorState.blockSize) %
    generatorState.blockSize;
  const modZ =
    ((z % generatorState.blockSize) + generatorState.blockSize) %
    generatorState.blockSize;

  // if the coordinate falls within the road width threshold it becomes a street
  if (modX < generatorState.roadWidth || modZ < generatorState.roadWidth) {
    return { type: "road", elevation: 0 };
  }

  // normalize height noise and apply scaling for buildings
  const rawHeight = (heightNoise.GetNoise(x, z) + 1) / 2;
  const buildingHeight =
    Math.max(0.1, rawHeight) * generatorState.maxBuildingHeight;

  // inner block squares become buildings
  return { type: "building", elevation: buildingHeight };
};
