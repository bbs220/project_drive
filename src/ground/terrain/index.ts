import * as THREE from "three";

export function buildTerrain() {
  const terrainShape = new THREE.PlaneGeometry(600, 600, 100, 100);

  const previewNoise = document.createElement("canvas");
  previewNoise.style.width = "200px";
  previewNoise.style.height = "200px";
  previewNoise.style.border = "2px solid white";
  previewNoise.style.position = "absolute";
  previewNoise.style.left = "20px";
  previewNoise.style.bottom = "20px";
  previewNoise.style.display = "block";
  document.body.appendChild(previewNoise);

  // Get the 2D rendering context
  const ctx = previewNoise.getContext("2d");

  if (ctx) {
    // Set the canvas size
    previewNoise.width = 200;
    previewNoise.height = 200;

    // Create data array for the canvas
    const data = ctx.createImageData(200, 200);
    let index = 0;

    // Generate noise pattern
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        // Calculate noise value (0 - 255)
        const noiseValue = Math.floor(Math.random() * 256);

        // Set pixel color
        data.data[index] = noiseValue;
        data.data[index + 1] = noiseValue;
        data.data[index + 2] = noiseValue;
        data.data[index + 3] = 255;

        index += 4;
      }
    }

    // Put the data into the canvas context
    ctx.putImageData(data, 0, 0);
  }

  const noiseTexture = new THREE.CanvasTexture(previewNoise);

  const terrainMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    map: noiseTexture,
    displacementMap: noiseTexture,
  });

  const terrain = new THREE.Mesh(terrainShape, terrainMaterial);
  terrain.rotateX(-Math.PI / 2);
  terrain.position.y = -0.5;
  terrain.receiveShadow = true;
  return terrain;
}
