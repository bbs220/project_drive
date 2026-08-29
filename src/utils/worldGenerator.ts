import { SimplexNoise } from "./SimplexNoise";

// define the data structure that the generator returns
export type typeTerrainData = {
  type: "empty" | "road" | "building" | "water";
  elevation: number;
};

// store all configurations for the 3D grid and chunk rendering
export const worldConstants = {
  chunkSize: 300,
  chunkRadius: 1,
  cellSize: 10,
  groundHeight: 0.1,
  groundOffset: -0.5,
};

// local mutable state for live tuning defaults
export const generatorState = {
  seed: 1337,
  islandRadius: 2000,
  cityRadius: 800,
  urbanFrequency: 0.004,
  heightFrequency: 0.01,
  urbanSprawl: 0.26,
  blockSize: 80,
  roadWidth: 10,
  maxBuildingHeight: 60,
};

// initialize our standalone pure-math simplex noise
let simplex = new SimplexNoise(generatorState.seed);

// fbm helper for organic layered noise
const fbm2D = (
  x: number,
  z: number,
  octaves = 4,
  frequency = 1,
  persistence = 0.5,
  lacunarity = 2.0,
) => {
  let total = 0;
  let currentFreq = frequency;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += simplex.noise2D(x * currentFreq, z * currentFreq) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    currentFreq *= lacunarity;
  }
  return total / maxValue;
};

// circular gradient mask to blend zones and sink the island into the sea
const getGradientMask = (distance: number, radius: number) => {
  return Math.max(0, 1.0 - distance / radius);
};

// sync tweakpane params directly into the math state
export const syncGeneratorParams = (params: typeof generatorState) => {
  // apply the global seed to the noise instance if it changed
  if (generatorState.seed !== params.seed) {
    simplex = new SimplexNoise(params.seed);
  }

  generatorState.seed = params.seed;
  generatorState.islandRadius = params.islandRadius;
  generatorState.cityRadius = params.cityRadius;

  generatorState.urbanFrequency = params.urbanFrequency;
  generatorState.heightFrequency = params.heightFrequency;
  generatorState.urbanSprawl = params.urbanSprawl;
  generatorState.blockSize = params.blockSize;
  generatorState.roadWidth = params.roadWidth;
  generatorState.maxBuildingHeight = params.maxBuildingHeight;
};

// master evaluator function to determine chunk contents
export const getTerrainData = (x: number, z: number): typeTerrainData => {
  // calculate distance from the island's center hub
  const distanceToCenter = Math.sqrt(x * x + z * z);

  // zone 1: the sea
  if (distanceToCenter > generatorState.islandRadius) {
    return { type: "water", elevation: -5 };
  }

  // calculate how close we are to the island edge for tapering
  const islandMask = getGradientMask(
    distanceToCenter,
    generatorState.islandRadius,
  );

  // zone 2: the outlands
  if (distanceToCenter > generatorState.cityRadius) {
    // generate rolling hills and mountains using fbm
    const rawTerrain = fbm2D(x, z, 4, 0.002, 0.5, 2.0);

    // multiply elevation by the mask so mountains naturally taper off into flat beaches
    const outlandElevation = ((rawTerrain + 1) / 2) * 120 * islandMask;

    return { type: "empty", elevation: Math.max(0, outlandElevation) };
  }

  // zone 3: the city center

  // taper the city sprawl so it naturally fades into the outlands
  const cityMask = getGradientMask(distanceToCenter, generatorState.cityRadius);

  // use fbm for a more organic urban sprawl pattern
  const rawUrban = fbm2D(x, z, 2, generatorState.urbanFrequency, 0.5, 2.0);
  const urbanScore = ((rawUrban + 1) / 2) * cityMask;

  // leave the underlying grid completely empty if outside the urban sprawl percentage
  if (urbanScore < generatorState.urbanSprawl) {
    return { type: "empty", elevation: 1 };
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
    return { type: "road", elevation: 0.5 };
  }

  // normalize height noise and apply fbm for varied building clusters
  const rawHeight = fbm2D(x, z, 3, generatorState.heightFrequency, 0.5, 2.0);
  const normalizedHeight = (rawHeight + 1) / 2;

  // normalize height noise and apply scaling for buildings
  const buildingHeight =
    Math.max(0.1, normalizedHeight) *
    generatorState.maxBuildingHeight *
    cityMask;

  // inner block squares become buildings
  return { type: "building", elevation: Math.max(5, buildingHeight) };
};
