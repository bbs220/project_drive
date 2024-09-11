import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { gui } from "../helpers/visualHelpers";

const makePausedDiv = document.createElement("div");
makePausedDiv.id = "paused";
makePausedDiv.innerHTML = "<p>Paused</p>";
document.body.appendChild(makePausedDiv);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const pausedDiv = document.getElementById("paused") as HTMLDivElement;

function onKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case "w":
      moveForward = true;
      break;

    case "a":
      moveLeft = true;
      break;

    case "s":
      moveBackward = true;
      break;

    case "d":
      moveRight = true;
      break;

    case "space":
      if (canJump === true) velocity.y += 200;
      canJump = false;
      break;
  }
}

function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case "w":
      moveForward = false;
      break;

    case "a":
      moveLeft = false;
      break;

    case "s":
      moveBackward = false;
      break;

    case "d":
      moveRight = false;
      break;
  }
}

const vecA = new THREE.Vector3();
const vecB = new THREE.Vector3(0, -1, 0);
const viewHeight = 2;
const raycaster = new THREE.Raycaster(vecA, vecB, 0, viewHeight);

export function addPointerLock(camera: THREE.PerspectiveCamera) {
  const controls = new PointerLockControls(camera, document.body);

  pausedDiv.addEventListener("click", () => {
    controls.lock();
  });

  controls.addEventListener("lock", () => {
    pausedDiv.style.display = "none";
  });

  controls.addEventListener("unlock", () => {
    pausedDiv.style.display = "";
  });

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  const ptrLockFolder = gui.addFolder("FPS Settings");
  ptrLockFolder
    .add(controls, "pointerSpeed", 0.1, 10)
    .step(0.1)
    .name("Sensitivity");
  ptrLockFolder.add(camera.position, "y", 1, 50).step(1).name("Y Pos");

  return function syncPointerLock(delta: number) {
    {
      if (controls.isLocked === true) {
        const newDelta = delta * 1;

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= viewHeight;

        velocity.x -= velocity.x * 10.0 * newDelta;
        velocity.z -= velocity.z * 10.0 * newDelta;

        velocity.y -= 9.8 * 100.0 * newDelta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward)
          velocity.z -= direction.z * 400.0 * newDelta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * newDelta;

        controls.moveRight(-velocity.x * newDelta);
        controls.moveForward(-velocity.z * newDelta);
        controls.getObject().position.y += velocity.y * newDelta;
        if (controls.getObject().position.y < viewHeight) {
          velocity.y = 0;
          controls.getObject().position.y = viewHeight;
          canJump = true;
        }
      }
    }
  };
}
