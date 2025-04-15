import * as THREE from "three";
import * as CANNON from "cannon-es";
import alea from "alea";
import { createNoise2D } from "simplex-noise";
import { pane } from "../../helpers/visualHelpers";

const noiseParams = {
  seed: Math.floor(Math.random() * 32),
  frequency: 1,
  amplitude: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 0.5,
  scale: 1,
};

let noise2D = createNoise2D(alea(noiseParams.seed));

export function buildTerrain(_scene: THREE.Scene, _world: CANNON.World) {
  const terrainFolder = pane.addFolder({
    title: "⛰️ Terrain",
    expanded: false,
  });
}
