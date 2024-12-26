import * as THREE from "three";
import * as CANNON from "cannon-es";
import alea from "alea";
import { createNoise2D } from "simplex-noise";
import { gui } from "../../helpers/visualHelpers";

// another object cause gui loves object based changes
const noiseOptions = {
  seed: alea(Math.floor(Math.random() * 32)),
  amplitude: 2,
  frequency: 5,
  octaves: 4,
  lacunarity: 2,
  gain: 0.5,
};

// basic ass noise function
const simplex = {
  noise2D: createNoise2D(noiseOptions.seed),
};

export function buildTerrain(scene: THREE.Scene, world: CANNON.World) {
  console.log(`${scene} ${world}`);

  const terrainFolder = gui.addFolder("⛰️ Terrain");
  terrainFolder.close();
}
