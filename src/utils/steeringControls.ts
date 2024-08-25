import type CANNON from "cannon-es";

const maxSteerVal = 0.5; // dont go above 1 or below 0 else steering angle goes bad
let maxTorque = 200; // initial torque of the vehicle
const brakeForce = maxTorque / 10; // handbrake force

// event listeners for controls WASD and B for handbrake and N for nitrous
export function controlsForVehicle(vehicle: CANNON.RaycastVehicle) {
  // flags for keeping me sane
  let isWPressed = false; // flag to only apply nitro if vehicle is going forward
  let isNitroActive = false; // debugging check
  const originalMaxForce = maxTorque; // redefining here instead of using torque directly
  const nLimit = 1000; // the minimum duration between two consecutive activated nitrous boosts only takes effect after 1000ms each
  const nMultiplier = 4; // speed multiplier for the nitro

  document.addEventListener("keydown", (event) => {
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
  });

  function forceApplyEngineForce() {
    // Apply engine force based on current maxForce and nitro state
    vehicle.applyEngineForce(-maxTorque, 2);
    vehicle.applyEngineForce(-maxTorque, 3);
  }

  // Reset force on keyup
  document.addEventListener("keyup", (event) => {
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
  });
}
