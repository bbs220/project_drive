import * as THREE from "three";
import * as CANNON from "cannon-es";
import { gui } from "../../helpers/visualHelpers";
import { createNoise2D } from "simplex-noise";
import alea from "alea";

export function buildTerrain(scene: THREE.Scene, world: CANNON.World) {
  const simplex = {
    noise2D: createNoise2D(alea(Math.floor(Math.random() * Math.random()))),
  };

  const toggle = {
    value: false,
  };

  const terrainFolder = gui.addFolder("⛰️ Terrain");
  terrainFolder.close();
  terrainFolder.add(toggle, "value").name("Enabled");
}
