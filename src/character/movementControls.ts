import * as CANNON from "cannon-es";

export const mvmtToggle = {
  value: false,
};

let keyDownHandler: (event: KeyboardEvent) => void;
let keyUpHandler: (event: KeyboardEvent) => void;

const inputVec = new CANNON.Vec3();

function onKeyDown(e: KeyboardEvent, body: CANNON.Body) {
  e.preventDefault();

  switch (e.key) {
    case "w":
      body.applyLocalForce(inputVec.set(0, 0, -10));
      break;

    case "a":
      body.quaternion.setFromEuler(0, Math.PI / 2, 0);
      break;

    case "s":
      body.applyLocalForce(inputVec.set(0, 0, 10));
      break;

    case "d":
      body.quaternion.setFromEuler(0, -Math.PI / 2, 0);
      break;

    case " ":
      body.applyLocalForce(inputVec.set(0, 10, 0));
      break;
  }
}

function onKeyUp(e: KeyboardEvent, body: CANNON.Body) {
  e.preventDefault();

  inputVec.setZero();

  switch (e.key) {
    case "w":
      body.velocity = inputVec;
      break;

    case "a":
      body.velocity = inputVec;
      break;

    case "s":
      body.velocity = inputVec;
      break;

    case "d":
      body.velocity = inputVec;
      break;

    case " ":
      body.velocity = inputVec;
      break;
  }
}

export function movementControls(body: CANNON.Body) {
  if (mvmtToggle.value) {
    console.log("controls hooked character =", mvmtToggle.value);

    keyDownHandler = (event: KeyboardEvent) => onKeyDown(event, body);
    keyUpHandler = (event: KeyboardEvent) => onKeyUp(event, body);

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
  } else {
    console.log("controls unhooked character =", mvmtToggle.value);

    if (keyDownHandler && keyUpHandler) {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);

      // Reset the handlers
      keyDownHandler = () => undefined;
      keyUpHandler = () => undefined;
    }
  }
}
