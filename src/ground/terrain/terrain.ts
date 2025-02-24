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
  lacunarity: 0.5,
  scale: 1,
};

let noise2D = createNoise2D(noiseParams.seed);

const testCanvas = document.createElement("canvas") as HTMLCanvasElement;
testCanvas.width = 256;
testCanvas.height = 256;
testCanvas.style.position = "absolute";
testCanvas.style.bottom = "6px";
testCanvas.style.left = "6px";
testCanvas.style.display = "none";
testCanvas.style.border = "1px solid white";
testCanvas.style.borderRadius = "6px";
document.body.appendChild(testCanvas);

function drawNoise2D() {
  const ctx = testCanvas.getContext("2d") as CanvasRenderingContext2D;

  if (!ctx) {
    console.log("no context 2d was found");
    return;
  }

  const imageData = ctx.createImageData(testCanvas.width, testCanvas.height);
  const data = imageData.data;

  const halfWidth = testCanvas.width / 2;
  const halfHeight = testCanvas.height / 2;

  for (let y = 0; y < testCanvas.height; y++) {
    for (let x = 0; x < testCanvas.width; x++) {
      let value = 0;
      let amplitude = noiseParams.amplitude;
      let frequency = noiseParams.frequency;

      for (let o = 0; o < noiseParams.octaves; o++) {
        const nx = ((x - halfWidth) * frequency) / noiseParams.scale;
        const ny = ((y - halfHeight) * frequency) / noiseParams.scale;
        value += noise2D(nx, ny) * amplitude;
        amplitude *= noiseParams.persistence;
        frequency *= noiseParams.lacunarity;
      }

      value = (value + 1) * 128; // Normalize to [0, 255]
      const cell = (x + y * testCanvas.width) * 4;
      data[cell] = value; // Red
      data[cell + 1] = value; // Green
      data[cell + 2] = value; // Blue
      data[cell + 3] = 255; // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export function buildTerrain(scene: THREE.Scene, world: CANNON.World) {
  const terrainFolder = gui.addFolder("⛰️ Terrain");
  terrainFolder.close();
  const toggleCanvas = {
    show: false,
  };
  terrainFolder
    .add(toggleCanvas, "show")
    .name("Show Noise Texture")
    .onChange((value: boolean) => {
      testCanvas.style.display = value ? "block" : "none";
    });
  terrainFolder
    .add(noiseParams, "seed", 0, 32, 1)
    .name("Re-Seed")
    .onChange(() => {
      noise2D = createNoise2D(noiseParams.seed);
      drawNoise2D();
    });
  terrainFolder
    .add(noiseParams, "frequency", 0.001, 1, 0.001)
    .name("Frequency")
    .onChange(drawNoise2D);
  terrainFolder
    .add(noiseParams, "amplitude", 0, 1, 0.01)
    .name("Amplitude")
    .onChange(drawNoise2D);
  terrainFolder
    .add(noiseParams, "octaves", 1, 8, 1)
    .name("Octaves")
    .onChange(drawNoise2D);
  terrainFolder
    .add(noiseParams, "persistence", 0, 1, 0.01)
    .name("Persistence")
    .onChange(drawNoise2D);
  terrainFolder
    .add(noiseParams, "lacunarity", 0, 1, 0.01)
    .name("Lacunarity")
    .onChange(drawNoise2D);
  terrainFolder
    .add(noiseParams, "scale", 1, 100, 1)
    .name("Scale")
    .onChange(drawNoise2D);
}
