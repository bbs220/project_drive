import * as CANNON from "cannon-es";

export const mvmtToggle = {
  value: false,
};

let keyDownHandler: (event: KeyboardEvent) => void;
let keyUpHandler: (event: KeyboardEvent) => void;

function onKeyDown(e: KeyboardEvent) {
  e.preventDefault();
  e.stopPropagation();

  switch (e.key) {
    case "w":
      console.log("w pressed");
      break;

    case "a":
      console.log("a pressed");
      break;

    case "s":
      console.log("s pressed");
      break;

    case "d":
      console.log("d pressed");
      break;

    case " ":
      console.log("space pressed");
      break;
  }
}

function onKeyUp(e: KeyboardEvent) {
  e.preventDefault();
  e.stopPropagation();

  switch (e.key) {
    case "w":
      console.log("w lifted");
      break;

    case "a":
      console.log("a lifted");
      break;

    case "s":
      console.log("s lifted");
      break;

    case "d":
      console.log("d lifted");
      break;

    case " ":
      console.log("space lifted");
      break;
  }
}

export function movementControls() {
  if (mvmtToggle.value) {
    console.log("controls hooked character =", mvmtToggle.value);

    keyDownHandler = (event: KeyboardEvent) => onKeyDown(event);
    keyUpHandler = (event: KeyboardEvent) => onKeyUp(event);

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
