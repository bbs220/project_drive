import * as THREE from "three";
import * as CANNON from "cannon-es";
import alea from "alea";
import { createNoise2D } from "simplex-noise";
import { gui } from "../../helpers/visualHelpers";

const noiseParams = {
  seed: alea(Math.random() * 32),
  frequency: 1,
  amplitude: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 2,
};

export function buildTerrain(scene: THREE.Scene, world: CANNON.World) {
  console.log(scene, world);

  const terrainFolder = gui.addFolder("⛰️ Terrain");
  terrainFolder.close();
}
