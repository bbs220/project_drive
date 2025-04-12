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

export function buildTerrain(_scene: THREE.Scene, _world: CANNON.World) {
  const terrainFolder = pane.addFolder({
    title: "⛰️ Terrain",
    expanded: false,
  });

  const toggleCanvas = {
    show: false,
  };

  terrainFolder
    .addBinding(toggleCanvas, "show", {
      label: "Show Noise Texture",
    })
    .on("change", ({ value }) => {
      testCanvas.style.display = value ? "block" : "none";
    });

  terrainFolder
    .addBinding(noiseParams, "seed", {
      label: "Re-Seed",
      min: 0,
      max: 32,
      step: 1,
    })
    .on("change", () => {
      noise2D = createNoise2D(alea(noiseParams.seed));
      drawNoise2D();
    });

  terrainFolder
    .addBinding(noiseParams, "frequency", {
      label: "Frequency",
      min: 0.001,
      max: 1,
      step: 0.001,
    })
    .on("change", drawNoise2D);

  terrainFolder
    .addBinding(noiseParams, "amplitude", {
      label: "Amplitude",
      min: 0,
      max: 1,
      step: 0.01,
    })
    .on("change", drawNoise2D);

  terrainFolder
    .addBinding(noiseParams, "octaves", {
      label: "Octaves",
      min: 1,
      max: 8,
      step: 1,
    })
    .on("change", drawNoise2D);

  terrainFolder
    .addBinding(noiseParams, "persistence", {
      label: "Persistence",
      min: 0,
      max: 1,
      step: 0.01,
    })
    .on("change", drawNoise2D);

  terrainFolder
    .addBinding(noiseParams, "lacunarity", {
      label: "Lacunarity",
      min: 0,
      max: 1,
      step: 0.01,
    })
    .on("change", drawNoise2D);

  terrainFolder
    .addBinding(noiseParams, "scale", {
      label: "Scale",
      min: 1,
      max: 100,
      step: 1,
    })
    .on("change", drawNoise2D);
}
