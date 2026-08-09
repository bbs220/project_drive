import FastNoiseLite from "fastnoise-lite";
import {
  proceduralConstants,
  type typeTerrainData,
} from "../constants/proceduralConstants";

// initialize elevation noise for geography
const elevationNoise = new FastNoiseLite();
elevationNoise.SetNoiseType(proceduralConstants.enums.openSimplex);
elevationNoise.SetFrequency(proceduralConstants.noise.elevationFrequency);
elevationNoise.SetFractalType(proceduralConstants.enums.fbm);
elevationNoise.SetFractalOctaves(proceduralConstants.noise.elevationOctaves);

// initialize urbanization noise for density
const urbanNoise = new FastNoiseLite();
urbanNoise.SetNoiseType(proceduralConstants.enums.openSimplex);
urbanNoise.SetFrequency(proceduralConstants.noise.urbanFrequency);

// initialize city noise for architecture
const cityNoise = new FastNoiseLite();
cityNoise.SetNoiseType(proceduralConstants.enums.cellular);
cityNoise.SetFrequency(proceduralConstants.noise.cityFrequency);
cityNoise.SetCellularDistanceFunction(proceduralConstants.enums.euclidean);
cityNoise.SetCellularReturnType(proceduralConstants.enums.distance);

// master evaluator function to determine chunk contents
export const getTerrainData = (x: number, z: number): typeTerrainData => {
  // get raw noise values
  const rawElevation = elevationNoise.GetNoise(x, z);
  const urbanScore = urbanNoise.GetNoise(x, z);
  const cityCell = cityNoise.GetNoise(x, z);

  // calculate absolute world height
  const worldHeight =
    rawElevation * proceduralConstants.thresholds.heightMultiplier;

  // calculate slope steepness by checking a neighbor point
  const neighborHeight =
    elevationNoise.GetNoise(x + 1, z) *
    proceduralConstants.thresholds.heightMultiplier;
  const slope = Math.abs(worldHeight - neighborHeight);

  // water overrides everything
  if (worldHeight < proceduralConstants.thresholds.waterLevel) {
    return {
      type: "water",
      elevation: proceduralConstants.thresholds.waterLevel,
    };
  }

  // unbuildable terrain cliffs override cities
  if (slope > proceduralConstants.thresholds.cliffSlope) {
    return { type: "cliff", elevation: worldHeight };
  }

  // urban development city blocks and roads
  if (urbanScore > proceduralConstants.thresholds.urbanSprawl) {
    // borders between cells become roads
    if (cityCell < proceduralConstants.thresholds.roadEdge) {
      return { type: "road", elevation: worldHeight };
    }

    // inside of the cell becomes a building
    return { type: "building", elevation: worldHeight };
  }

  // default to nature if no other rules hit
  return { type: "nature", elevation: worldHeight };
};
