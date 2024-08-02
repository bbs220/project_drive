import * as THREE from "three";
import Stats from "stats.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "dat.gui";

const mainSCENE = new THREE.Scene();

const mainCAMERA = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  5000
);

mainCAMERA.position.set(0, 5, 10);

const main3D_RENDERER = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(main3D_RENDERER.domElement);

window.addEventListener("resize", () => {
  mainCAMERA.aspect = window.innerWidth / window.innerHeight;
  mainCAMERA.updateProjectionMatrix();
  main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
});

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const cubeShape = new THREE.BoxGeometry(5, 5, 5);
const cubeMaterial = new THREE.MeshStandardMaterial({ wireframe: false });
const cubeMesh = new THREE.Mesh(cubeShape, cubeMaterial);
mainSCENE.add(cubeMesh);

const debugGrid = new THREE.GridHelper(10, 10, "#ffff00", "#00ffff");
debugGrid.position.set(0, -0.001, 0);
debugGrid.visible = false;
mainSCENE.add(debugGrid);

const debugAxes = new THREE.AxesHelper(50);
debugAxes.visible = false;
mainSCENE.add(debugAxes);

const ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
ambientLight.visible = true;
mainSCENE.add(ambientLight);

const debugControls = new OrbitControls(mainCAMERA, main3D_RENDERER.domElement);

const gui = new GUI();
gui.close();

const sceneFolder = gui.addFolder("Scene");
sceneFolder.open();
sceneFolder.add(debugAxes, "visible").name("3D Axes");
sceneFolder.add(debugGrid, "visible").name("Grid");
sceneFolder.add(ambientLight, "visible").name("Fill Light");

const cubeFolder = gui.addFolder("Cube");
cubeFolder.open();
cubeFolder.add(cubeMesh.material, "wireframe").name("Wireframe");

function cleanRenderLoop() {
  main3D_RENDERER.render(mainSCENE, mainCAMERA);
}

function animate() {
  requestAnimationFrame(animate);
  cleanRenderLoop();
  debugControls.update();
  stats.update();
}

animate();
