import * as THREE from "three";
import * as CANNON from "cannon-es";
import { createNoise2D } from "simplex-noise";
import alea from "alea";
import { pane } from "../../helpers/visualHelpers";
import { progressManager } from "../../ui/loadingScreenUI";
import { allImageTextures } from "../../utils/assetPaths";

// always remember that cannon has a half rule for measurements with threejs geometries
// eg. if threejs box is 1,1,1 then cannon box will be 0.5,0.5,0.5
// dont ever forget this since this does not give a proper error
// debugging will be nightmare

const noiseParams = {
  seed: alea("seed"),
  frequency: 1,
  amplitude: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 0.5,
};

// keep this a multiple of 2 for the heightfield to work properly
// this is the size of the terrain in threejs units
const terrainSize = 16;

// for how many repeats of the texture within the plane
// for consistency with the cannon heightfield
const tilingValue = terrainSize;

// this is max value dont go above 16
const anisotrophicValue = 16;

// a tiled texture for some reference
const blueprintTexture = new THREE.TextureLoader(progressManager).load(
  allImageTextures.blueSquare,
  (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(tilingValue, tilingValue);
    texture.anisotropy = anisotrophicValue;
    texture.colorSpace = THREE.SRGBColorSpace;
  }
);

let noise2D = createNoise2D(alea("seed"));

export function buildTerrain(_scene: THREE.Scene, _world: CANNON.World) {
  const terrainFolder = pane.addFolder({
    title: "⛰️ Terrain",
    expanded: false,
  });
}

export const terrainCollisonMaterial = new CANNON.Material("terrain");
