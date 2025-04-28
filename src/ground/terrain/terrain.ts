import * as THREE from "three";
import * as CANNON from "cannon-es";
import { createNoise2D } from "simplex-noise";
import { pane } from "../../helpers/visualHelpers";

const noiseParams = {
  seed: Math.floor(Math.random() * 100),
  frequency: 1,
  amplitude: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 0.5,
  scale: 1,
};

let noise2D = createNoise2D(() => noiseParams.seed);

export function buildTerrain(_scene: THREE.Scene, _world: CANNON.World) {
  const terrainFolder = pane.addFolder({
    title: "⛰️ Terrain",
    expanded: false,
  });

  const terrainSize = 100;
  const elementSize = 1;

  const heightfieldData: number[][] = [];
  for (let i = 0; i < terrainSize; i++) {
    heightfieldData[i] = [];
    for (let j = 0; j < terrainSize; j++) {
      heightfieldData[i][j] = 0;
    }
  }

  const heightfieldShape = new CANNON.Heightfield(heightfieldData, {
    elementSize: elementSize,
  });

  const terrainBody = new CANNON.Body({
    mass: 0,
    shape: heightfieldShape,
  });

  terrainBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  terrainBody.position.set(-terrainSize / 2, 0, terrainSize / 2);

  _world.addBody(terrainBody);

  return {
    getTerrainBody: () => terrainBody,
  };
}
