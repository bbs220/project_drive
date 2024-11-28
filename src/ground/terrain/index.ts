import * as THREE from "three";

export function buildTerrain() {
  const terrainShape = new THREE.PlaneGeometry(600, 600, 100, 100);

  const terrainMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    color: "#00ffff",
  });

  const terrain = new THREE.Mesh(terrainShape, terrainMaterial);
  terrain.rotateX(-Math.PI / 2);
  terrain.position.y = -0.5;
  terrain.receiveShadow = true;
  return terrain;
}
