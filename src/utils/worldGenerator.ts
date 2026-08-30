import { SimplexNoise } from "./SimplexNoise";

export type typeTerrainData = {
  type: "empty" | "road" | "building";
  elevation: number;
};

export const worldConstants = {
  chunkSize: 100,
  chunkRadius: 1,
  cellSize: 10,
  groundHeight: 0.1,
  groundOffset: -0.5,
};

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

const getGradientMask = (distance: number, radius: number) => {
  return Math.max(0, 1.0 - distance / radius);
};

export const syncGeneratorParams = (params: typeof generatorState) => {
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

export const getTerrainData = (x: number, z: number): typeTerrainData => {
  const distanceToCenter = Math.sqrt(x * x + z * z);

  // zone 1: beyond the island bounds
  if (distanceToCenter > generatorState.islandRadius) {
    return { type: "empty", elevation: 0 };
  }

  const islandMask = getGradientMask(
    distanceToCenter,
    generatorState.islandRadius,
  );

  // zone 2: the outlands
  if (distanceToCenter > generatorState.cityRadius) {
    const rawTerrain = fbm2D(x, z, 4, 0.002, 0.5, 2.0);
    const outlandElevation = ((rawTerrain + 1) / 2) * 120 * islandMask;
    return { type: "empty", elevation: Math.max(0, outlandElevation) };
  }

  // zone 3: the grid city

  // calculate modulo to figure out if this specific coordinate is a road
  const modX =
    ((x % generatorState.blockSize) + generatorState.blockSize) %
    generatorState.blockSize;
  const modZ =
    ((z % generatorState.blockSize) + generatorState.blockSize) %
    generatorState.blockSize;

  const isRoad =
    modX < generatorState.roadWidth || modZ < generatorState.roadWidth;

  // rule 1: roads generate infinitely inside the city radius, completely unbroken
  if (isRoad) {
    return { type: "road", elevation: 0.5 };
  }

  // rule 2: lock the noise coordinates to the top-left corner of the current block
  // this forces all cells inside this 80x80 block to share the same urban score
  const blockX =
    Math.floor(x / generatorState.blockSize) * generatorState.blockSize;
  const blockZ =
    Math.floor(z / generatorState.blockSize) * generatorState.blockSize;

  const cityMask = getGradientMask(distanceToCenter, generatorState.cityRadius);
  const rawUrban = fbm2D(
    blockX,
    blockZ,
    2,
    generatorState.urbanFrequency,
    0.5,
    2.0,
  );
  const urbanScore = ((rawUrban + 1) / 2) * cityMask;

  // rule 3: whole blocks toggle on or off together
  // if the block fails the sprawl test, it becomes a completely empty city park or vacant lot
  if (urbanScore < generatorState.urbanSprawl) {
    return { type: "empty", elevation: 1 };
  }

  // rule 4: structured skylines
  // get a master height for the whole block so downtown blocks are tall together
  const blockHeightNoise = fbm2D(
    blockX,
    blockZ,
    3,
    generatorState.heightFrequency,
    0.5,
    2.0,
  );

  // get a tiny bit of local noise for the individual cell so buildings arent perfectly flat
  const cellHeightNoise = fbm2D(
    x,
    z,
    2,
    generatorState.heightFrequency * 4.0,
    0.5,
    2.0,
  );

  // blend them: 85% block trend, 15% local variation
  const blendedHeight = blockHeightNoise * 0.85 + cellHeightNoise * 0.15;
  const normalizedHeight = (blendedHeight + 1) / 2;

  const buildingHeight =
    Math.max(0.1, normalizedHeight) *
    generatorState.maxBuildingHeight *
    cityMask;

  return { type: "building", elevation: Math.max(5, buildingHeight) };
};
