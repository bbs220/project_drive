import { SimplexNoise } from "./SimplexNoise";

export type typeTerrainData = {
  type: "empty" | "road" | "building";
  elevation: number;
};

export const worldConstants = {
  chunkSize: 300,
  chunkRadius: 1,
  cellSize: 10,
  groundHeight: 0.1,
  groundOffset: -0.5,
};

export const generatorState = {
  seed: 1337,
  // macroFrequency dictates the massive continental spans of City vs Outland
  macroFrequency: 0.0005,
  urbanFrequency: 0.004,
  heightFrequency: 0.01,
  urbanSprawl: 0.26,
  blockSize: 80,
  roadWidth: 10,
  maxBuildingHeight: 60,
};

let simplex = new SimplexNoise(generatorState.seed);

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

export const syncGeneratorParams = (params: typeof generatorState) => {
  if (generatorState.seed !== params.seed) {
    simplex = new SimplexNoise(params.seed);
  }
  generatorState.seed = params.seed;
  generatorState.macroFrequency = params.macroFrequency;
  generatorState.urbanFrequency = params.urbanFrequency;
  generatorState.heightFrequency = params.heightFrequency;
  generatorState.urbanSprawl = params.urbanSprawl;
  generatorState.blockSize = params.blockSize;
  generatorState.roadWidth = params.roadWidth;
  generatorState.maxBuildingHeight = params.maxBuildingHeight;
};

export const getTerrainData = (x: number, z: number): typeTerrainData => {
  // 1. MACRO BIOME GENERATION (Infinite)
  const rawBiome = fbm2D(x, z, 3, generatorState.macroFrequency, 0.5, 2.0);
  const biomeScore = (rawBiome + 1) / 2; // Normalize to 0 - 1

  // Threshold determining where city stops and nature begins
  const cityThreshold = 0.45;

  if (biomeScore < cityThreshold) {
    // 2. OUTLANDS / GRASSLANDS ZONE
    const rawTerrain = fbm2D(x, z, 4, 0.002, 0.5, 2.0);
    // Taper the rolling hills near the city borders to keep transitions smooth
    const borderBlend = Math.min(1.0, (cityThreshold - biomeScore) * 5.0);
    const outlandElevation = ((rawTerrain + 1) / 2) * 120 * borderBlend;

    return { type: "empty", elevation: Math.max(0, outlandElevation) };
  }

  // 3. INFINITE CITY ZONE
  // cityMask goes from 0.0 (edge of city) to 1.0 (deep downtown)
  const cityMask = Math.min(1.0, (biomeScore - cityThreshold) * 5.0);

  const modX =
    ((x % generatorState.blockSize) + generatorState.blockSize) %
    generatorState.blockSize;
  const modZ =
    ((z % generatorState.blockSize) + generatorState.blockSize) %
    generatorState.blockSize;

  const isRoad =
    modX < generatorState.roadWidth || modZ < generatorState.roadWidth;

  if (isRoad) {
    return { type: "road", elevation: 0.5 };
  }

  const blockX =
    Math.floor(x / generatorState.blockSize) * generatorState.blockSize;
  const blockZ =
    Math.floor(z / generatorState.blockSize) * generatorState.blockSize;

  const rawUrban = fbm2D(
    blockX,
    blockZ,
    2,
    generatorState.urbanFrequency,
    0.5,
    2.0,
  );

  // Multiply urban score by cityMask so suburbs naturally thin out into empty lots near the outlands
  const urbanScore = ((rawUrban + 1) / 2) * cityMask;

  if (urbanScore < generatorState.urbanSprawl) {
    return { type: "empty", elevation: 1 };
  }

  // 4. STRUCTURED SKYLINES
  const blockHeightNoise = fbm2D(
    blockX,
    blockZ,
    3,
    generatorState.heightFrequency,
    0.5,
    2.0,
  );

  const cellHeightNoise = fbm2D(
    x,
    z,
    2,
    generatorState.heightFrequency * 4.0,
    0.5,
    2.0,
  );

  const blendedHeight = blockHeightNoise * 0.85 + cellHeightNoise * 0.15;
  const normalizedHeight = (blendedHeight + 1) / 2;

  // Multiply final height by cityMask so skyscrapers only form deep in the city center,
  // and scale down to small buildings at the edge
  const buildingHeight =
    Math.max(0.1, normalizedHeight) *
    generatorState.maxBuildingHeight *
    cityMask;

  return { type: "building", elevation: Math.max(5, buildingHeight) };
};
