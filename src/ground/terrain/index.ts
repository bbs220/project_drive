import * as THREE from "three";

export function buildTerrain() {
  const terrainShape = new THREE.PlaneGeometry(600, 600);

  const terrainMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    color: "#ff0000",
  });

  const terrain = new THREE.Mesh(terrainShape, terrainMaterial);
  terrain.rotateX(-Math.PI / 2);
  terrain.position.y = -0.5;
  terrain.receiveShadow = true;
  return terrain;
}
