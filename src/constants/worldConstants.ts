export const worldConstants = {
  chunkSize: 512,
  chunkRadius: 1,
  groundHeight: 0.1,
  groundOffset: -0.5,
  wfc: {
    baseTileCount: 8,
    subdivisionsPerChunk: 8,
    blockSize: 64,
    tiles: [
      "empty",
      "straight",
      "corner",
      "tJunction",
      "crossroad",
      "deadEnd",
      "rampUp",
      "rampDown",
    ] as const,
  },
  trackEditor: {
    totalBlockCount: 24,
    categories: {
      flatRoads: 8,
      elevationAndHills: 6,
      bankedCorners: 4,
      arcadeInteractors: 4,
      driftPlazas: 2,
    },
  },
};

// wave function collapse configuration
export const wfcConstants = worldConstants.wfc;

// track editor modular piece catalog
export const trackEditorConstants = worldConstants.trackEditor;
