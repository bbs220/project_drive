import { SimplexNoise } from "./SimplexNoise";
import { worldConstants } from "../constants/worldConstants";

export {
  worldConstants,
  wfcConstants,
  trackEditorConstants,
} from "../constants/worldConstants";

// wave function collapse configuration
// track editor modular piece catalog

// snap coordinate to grid block size
export const snapToGrid = (
  val: number,
  step = worldConstants.wfc.blockSize,
) => {
  return Math.floor(val / step) * step;
};

// snap spatial position to grid block coordinates
export const snapPositionXYZ = (
  x: number,
  y: number,
  z: number,
  step = worldConstants.wfc.blockSize,
): [number, number, number] => {
  return [
    Math.floor(x / step) * step,
    Math.floor(y / step) * step,
    Math.floor(z / step) * step,
  ];
};

export const generatorState = {
  seed: 1337,
  // macroFrequency dictates the massive continental spans of City vs Outland
  macroFrequency: 0.0005,
  urbanFrequency: 0.004,
  heightFrequency: 0.01,
  urbanSprawl: 0.26,
  blockSize: 64,
  roadWidth: 8,
  maxBuildingHeight: 64,
};

// export this instance
export let simplex = new SimplexNoise(generatorState.seed);

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
