import { SimplexNoise } from "./SimplexNoise";

const simplex = new SimplexNoise(1337);

export function fbm2D(
  x: number,
  y: number,
  octaves = 4,
  persistence = 0.5,
  lacunarity = 2.0,
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0; // Used for normalizing result

  for (let i = 0; i < octaves; i++) {
    total += simplex.noise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue; // Returns -1.0 to 1.0
}
