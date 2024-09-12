import type CANNON from "cannon-es";
import { rechargeNitros } from "../ui/vehicleUI";

// flags for keeping me sane
let maxTorque = 200; // initial torque of the vehicle
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

let keydownHandler: (event: KeyboardEvent) => void;
let keyupHandler: (event: KeyboardEvent) => void;

// event listeners for controls WASD and B for handbrake and N for nitrous
function onKeyDown(event: KeyboardEvent, vehicle: CANNON.RaycastVehicle) {
  event.preventDefault();
  event.stopPropagation();
  switch (event.key) {
    case "w":
      // case "ArrowUp":
      isWPressed = true;
      forceApplyEngineForce();
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

    case "b":
      vehicle.setBrake(brakeForce, 0);
      vehicle.setBrake(brakeForce, 1);
      vehicle.setBrake(brakeForce, 2);
      vehicle.setBrake(brakeForce, 3);
      break;
    case "n": // Nitro boost
      if (!isNitroActive) {
        // Activate nitro only if it's not already active
        isNitroActive = true; // Mark nitro as active
        maxTorque *= nMultiplier; // Increase maxForce
        if (isWPressed) {
          forceApplyEngineForce(); // Apply increased force if "W" is pressed
          rechargeNitros();
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

    case "b":
      vehicle.setBrake(0, 0);
      vehicle.setBrake(0, 1);
      vehicle.setBrake(0, 2);
      vehicle.setBrake(0, 3);
      break;
  }
}

export function enableControls(vehicle: CANNON.RaycastVehicle) {
  if (ctrlToggle.value) {
    console.log("vehicle controls hooked", ctrlToggle.value);
    keydownHandler = (event: KeyboardEvent) => onKeyDown(event, vehicle);
    keyupHandler = (event: KeyboardEvent) => onKeyUp(event, vehicle);

    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", keyupHandler);
  } else {
    console.log("vehicle controls unhooked", ctrlToggle.value);

    if (keydownHandler && keyupHandler) {
      document.removeEventListener("keydown", keydownHandler);
      document.removeEventListener("keyup", keyupHandler);

      // Reset the handlers
      keydownHandler = () => undefined;
      keyupHandler = () => undefined;
    }
  }
}
