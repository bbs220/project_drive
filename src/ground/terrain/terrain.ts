import * as THREE from "three";
import * as CANNON from "cannon-es";
import { createNoise2D } from "simplex-noise";
import { pane } from "../../helpers/visualHelpers";
import { progressManager } from "../../ui/loadingScreenUI";
import { allImageTextures } from "../../utils/assetPaths";

// always remember that cannon has a half rule for measurements with threejs geometries
// eg. if threejs box is 1,1,1 then cannon box will be 0.5,0.5,0.5
// dont ever forget this since this does not give a proper error
// debugging will be nightmare

const noiseParams = {
  seed: Math.floor(Math.random() * 100),
  frequency: 1,
  amplitude: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 0.5,
  scale: 1,
};

// for how many repeats of the texture within the plane
const tilingValue = 16;

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

let noise2D = createNoise2D(() => noiseParams.seed);

export function buildTerrain(_scene: THREE.Scene, _world: CANNON.World) {
  const terrainFolder = pane.addFolder({
    title: "⛰️ Terrain",
    expanded: false,
  });

  const terrainSize = 10;
  const elementSize = 1;

  const heightfieldData: number[][] = [];
  for (let i = 0; i <= terrainSize; i++) {
    heightfieldData[i] = [];
    for (let j = 0; j <= terrainSize; j++) {
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

  const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize);
  const terrainMaterial = new THREE.MeshStandardMaterial({
    map: blueprintTexture,
  });
  const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.set(0, 0, 0);
  terrainMesh.receiveShadow = true;
  _scene.add(terrainMesh);

  return {
    getTerrainBody: () => terrainBody,
  };
}

export const groundCollisonMaterial = new CANNON.Material("ground");
