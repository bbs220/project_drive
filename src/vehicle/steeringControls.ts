import type CANNON from "cannon-es";
import {
  info,
  nosContainer,
  rechargeNitros,
  speedElement,
} from "../ui/vehicleUI";
import { boost, brake, engineReady, revving } from "../audio";

// flags for keeping me sane
let maxTorque = 300; // initial torque of the vehicle 200 does not produce burnout so fuck it 300
let isNitroActive = false; // debugging check
let isWPressed = false; // flag to only apply nitro if vehicle is going forward
const maxSteerVal = 0.5; // dont go above 1 or below 0 else steering angle goes bad
const brakeForce = maxTorque / 10; // handbrake force
const originalMaxForce = maxTorque; // redefining here instead of using torque directly
const nLimit = 1000; // the minimum duration between two consecutive activated nitrous boosts only takes effect after 1000ms each
const nMultiplier = 6; // speed multiplier for the nitro

export const ctrlToggle = {
  value: false,
};

let keyDownHandler: (event: KeyboardEvent) => void;
let keyUpHandler: (event: KeyboardEvent) => void;

// event listeners for controls WASD and B for handbrake and N for nitrous
function onKeyDown(event: KeyboardEvent, vehicle: CANNON.RaycastVehicle) {
  event.preventDefault();
  event.stopPropagation();
  switch (event.key) {
    case "w":
      // case "ArrowUp":
      isWPressed = true;
      forceApplyEngineForce();
      revving.setVolume(0.7);
      break;

    case "s":
      // case "ArrowDown":
      vehicle.applyEngineForce(maxTorque, 2);
      vehicle.applyEngineForce(maxTorque, 3);
      break;

    case "a":
      // case "ArrowLeft":
      vehicle.setSteeringValue(maxSteerVal, 0);
      vehicle.setSteeringValue(maxSteerVal, 1);
      break;

    case "d":
      // case "ArrowRight":
      vehicle.setSteeringValue(-maxSteerVal, 0);
      vehicle.setSteeringValue(-maxSteerVal, 1);
      break;

    case " ": // spacebar
      vehicle.setBrake(brakeForce, 0);
      vehicle.setBrake(brakeForce, 1);
      vehicle.setBrake(brakeForce, 2);
      vehicle.setBrake(brakeForce, 3);
      brake.play();
      brake.setVolume(0.5);
      break;
    case "Shift": // nitro boost its left shift key
      if (!isNitroActive) {
        // Activate nitro only if it's not already active
        isNitroActive = true; // Mark nitro as active
        maxTorque *= nMultiplier; // Increase maxForce
        if (isWPressed) {
          forceApplyEngineForce(); // Apply increased force if "W" is pressed
          rechargeNitros();
          boost.play();
          boost.setVolume(0.5);
        }
        setTimeout(() => {
          maxTorque = originalMaxForce; // Revert maxForce after nitro limit is passed
          isNitroActive = false; // Mark nitro as inactive
          if (isWPressed) {
            forceApplyEngineForce(); // Apply original force if "W" is still pressed
          }
        }, nLimit);
      }
      break;
  }
  function forceApplyEngineForce() {
    // Apply engine force based on current maxForce and nitro state
    vehicle.applyEngineForce(-maxTorque, 2);
    vehicle.applyEngineForce(-maxTorque, 3);
  }
}

function onKeyUp(event: KeyboardEvent, vehicle: CANNON.RaycastVehicle) {
  event.preventDefault();
  event.stopPropagation();
  switch (event.key) {
    case "w":
      // case "ArrowUp":
      isWPressed = false;
      vehicle.applyEngineForce(0, 2);
      vehicle.applyEngineForce(0, 3);
      revving.setVolume(0.5);
      break;

    case "s":
      // case "ArrowDown":
      vehicle.applyEngineForce(0, 2);
      vehicle.applyEngineForce(0, 3);
      break;

    case "a":
      // case "ArrowLeft":
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;

    case "d":
      // case "ArrowRight":
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;

    case " ": // spacebar
      vehicle.setBrake(0, 0);
      vehicle.setBrake(0, 1);
      vehicle.setBrake(0, 2);
      vehicle.setBrake(0, 3);
      brake.stop();
      break;
  }
}

export function enableControls(vehicle: CANNON.RaycastVehicle) {
  if (ctrlToggle.value) {
    console.log("controls hooked vehicle =", ctrlToggle.value);

    engineReady.stop();
    engineReady.setVolume(0.5);
    engineReady.play();
    revving.stop();
    revving.setLoop(true);
    revving.setVolume(0.5);
    revving.play();

    // if controls are hooked show ui
    info.style.display = "flex";
    speedElement.style.display = "block";
    nosContainer.style.display = "block";

    keyDownHandler = (event: KeyboardEvent) => onKeyDown(event, vehicle);
    keyUpHandler = (event: KeyboardEvent) => onKeyUp(event, vehicle);

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
  } else {
    console.log("controls unhooked vehicle =", ctrlToggle.value);

    revving.stop();

    // if vehicle controls are off then we dont show any ui
    info.style.display = "none";
    speedElement.style.display = "none";
    nosContainer.style.display = "none";

    if (keyDownHandler && keyUpHandler) {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);

      // Reset the handlers
      keyDownHandler = () => undefined;
      keyUpHandler = () => undefined;
    }
  }
}
