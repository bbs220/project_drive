import * as THREE from "three";
import Stats from "stats.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "lil-gui";

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
main3D_RENDERER.shadowMap.enabled = true;
document.body.appendChild(main3D_RENDERER.domElement);

window.addEventListener("resize", () => {
  mainCAMERA.aspect = window.innerWidth / window.innerHeight;
  mainCAMERA.updateProjectionMatrix();
  main3D_RENDERER.setSize(window.innerWidth, window.innerHeight);
});

const debugControls = new OrbitControls(mainCAMERA, main3D_RENDERER.domElement);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

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

const yPosPointLight = 5;
const plIntensity = 30;
const plX = 3;
const plZ = 3;

const pLight_00 = new THREE.PointLight("#fff", plIntensity, 0, 2);
pLight_00.position.set(plX, yPosPointLight, plZ);
pLight_00.castShadow = true;
const plView_00 = new THREE.PointLightHelper(pLight_00, 0.5, "#fff");
plView_00.visible = false;

const pLight_01 = new THREE.PointLight("#fff", plIntensity, 0, 2);
pLight_01.position.set(-plX, yPosPointLight, -plZ);
pLight_01.castShadow = true;
const plView_01 = new THREE.PointLightHelper(pLight_01, 0.5, "#fff");
plView_01.visible = false;

const pLight_02 = new THREE.PointLight("#fff", plIntensity, 0, 2);
pLight_02.position.set(-plX, yPosPointLight, plZ);
pLight_02.castShadow = true;
const plView_02 = new THREE.PointLightHelper(pLight_02, 0.5, "#fff");
plView_02.visible = false;

const pLight_03 = new THREE.PointLight("#fff", plIntensity, 0, 2);
pLight_03.position.set(plX, yPosPointLight, -plZ);
pLight_03.castShadow = true;
const plView_03 = new THREE.PointLightHelper(pLight_03, 0.5, "#fff");
plView_03.visible = false;

mainSCENE.add(pLight_00, pLight_01, pLight_02, pLight_03);
mainSCENE.add(plView_00, plView_01, plView_02, plView_03);

const geo = new THREE.IcosahedronGeometry(1, 2);
const mat = new THREE.MeshStandardMaterial({
  wireframe: false,
  flatShading: true,
});
const mesh = new THREE.Mesh(geo, mat);
mesh.position.set(0, 0.5, 0);
mesh.castShadow = true;
mainSCENE.add(mesh);

const groundShape = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: "#fff",
  wireframe: false,
});
const groundMesh = new THREE.Mesh(groundShape, groundMaterial);
groundMesh.receiveShadow = true;
groundMesh.rotateX(Math.PI / -2);
groundMesh.position.set(0, -1, 0);
mainSCENE.add(groundMesh);

const gui = new GUI();
gui.close();

const sceneFolder = gui.addFolder("Scene");
sceneFolder.open();
sceneFolder.add(debugAxes, "visible").name("3D Axes");
sceneFolder.add(debugGrid, "visible").name("Grid");
sceneFolder.add(ambientLight, "visible").name("Fill Light");

const cubeFolder = gui.addFolder("Cube");
cubeFolder.open();
cubeFolder.add(mesh.material, "wireframe").name("Wireframe");

function cleanRenderLoop() {
  main3D_RENDERER.render(mainSCENE, mainCAMERA);
}

function animate() {
  requestAnimationFrame(animate);
  cleanRenderLoop();
  debugControls.update();
  stats.update();

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;
  mesh.rotation.z += 0.01;
}

animate();
