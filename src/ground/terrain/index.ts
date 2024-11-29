import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import alea from "alea";
import { gui } from "../../helpers/visualHelpers";

const previewNoise = document.createElement("canvas");
previewNoise.width = 256;
previewNoise.height = 256;
previewNoise.style.display = "block";
previewNoise.style.position = "absolute";
previewNoise.style.left = "10px";
previewNoise.style.bottom = "10px";
previewNoise.style.border = "1px solid white";
previewNoise.style.borderRadius = "8px";
document.body.appendChild(previewNoise);

const simplex = {
  noise2D: createNoise2D(alea(Math.random() * 2.0 - 1.0)),
};

const terrainGeometry = new THREE.PlaneGeometry(600, 600, 100, 100);

const terrainMaterial = new THREE.MeshStandardMaterial({
  wireframe: false,
  flatShading: false,
  color: "#00fff0",
});
const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrainMesh.rotateX(-Math.PI / 2);
terrainMesh.position.y = -0.5;

export function buildTerrain(scene: THREE.Scene) {
  scene.add(terrainMesh);

  const terrainFolder = gui.addFolder("⛰️ Terrain");
  terrainFolder.close();
}
