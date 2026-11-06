import { useEffect, useRef } from "react";

// define all possible control states without redundant numpad axes
export type typeAllVehicleControls = {
  forward: boolean; // w - also pitch up for aerial vehicles
  backward: boolean; // s - also pitch down for aerial vehicles
  left: boolean; // a - also roll left for aerial vehicles
  right: boolean; // d - also roll right for aerial vehicles
  brake: boolean; // space - decend for heli and slow down for plane
  boost: boolean; // left shift - ascend for heli and take off for plane
  yawLeft: boolean; // q - only on aerial vehicles
  yawRight: boolean; // e - only on aerial vehicles
  respawn: boolean; // r - works across all vehicles
  map: boolean; // m - opens the big scale map
};

const sharedInputControls: typeAllVehicleControls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
  boost: false,
  yawLeft: false,
  yawRight: false,
  respawn: false,
  map: false,
};

let activeListenersCount = 0;

// keydown event handler
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.code) {
    // standard driving and throttle and pitch
    case "KeyW":
    case "ArrowUp":
      sharedInputControls.forward = true;
      break;
    case "KeyS":
    case "ArrowDown":
      sharedInputControls.backward = true;
      break;
    // standard steering and roll
    case "KeyA":
    case "ArrowLeft":
      sharedInputControls.left = true;
      break;
    case "KeyD":
    case "ArrowRight":
      sharedInputControls.right = true;
      break;
    // brakes and boost
    case "Space":
      sharedInputControls.brake = true;
      break;
    case "ShiftLeft":
    case "ShiftRight":
      sharedInputControls.boost = true;
      break;
    // yaw controls
    case "KeyQ":
      sharedInputControls.yawLeft = true;
      break;
    case "KeyE":
      sharedInputControls.yawRight = true;
      break;
    // respawn and mounting
    case "KeyR":
      sharedInputControls.respawn = true;
      break;
    // big scale map
    case "KeyM":
      sharedInputControls.map = true;
      break;
  }
};

// keyup event handler
const handleKeyUp = (e: KeyboardEvent) => {
  switch (e.code) {
    // standard driving and throttle and pitch
    case "KeyW":
    case "ArrowUp":
      sharedInputControls.forward = false;
      break;
    case "KeyS":
    case "ArrowDown":
      sharedInputControls.backward = false;
      break;
    // standard steering and roll
    case "KeyA":
    case "ArrowLeft":
      sharedInputControls.left = false;
      break;
    case "KeyD":
    case "ArrowRight":
      sharedInputControls.right = false;
      break;
    // brakes and boost
    case "Space":
      sharedInputControls.brake = false;
      break;
    case "ShiftLeft":
    case "ShiftRight":
      sharedInputControls.boost = false;
      break;
    // yaw controls
    case "KeyQ":
      sharedInputControls.yawLeft = false;
      break;
    case "KeyE":
      sharedInputControls.yawRight = false;
      break;
    // respawn and mounting
    case "KeyR":
      sharedInputControls.respawn = false;
      break;
    // big scale map
    case "KeyM":
      sharedInputControls.map = false;
      break;
  }
};

// reset inputs when window loses focus to prevent stuck keys
const handleBlur = () => {
  sharedInputControls.forward = false;
  sharedInputControls.backward = false;
  sharedInputControls.left = false;
  sharedInputControls.right = false;
  sharedInputControls.brake = false;
  sharedInputControls.boost = false;
  sharedInputControls.yawLeft = false;
  sharedInputControls.yawRight = false;
  sharedInputControls.respawn = false;
  sharedInputControls.map = false;
};

// export default hook
export const useAllVehicleInput = () => {
  // ref to hold current inputs without triggering rerenders
  const vehicleInputControls = useRef<typeAllVehicleControls>(sharedInputControls);

  // handle key press events
  useEffect(() => {
    if (activeListenersCount === 0) {
      // attach event listeners
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      window.addEventListener("blur", handleBlur);
    }
    activeListenersCount++;

    // cleanup event listeners on unmount
    return () => {
      activeListenersCount--;
      if (activeListenersCount === 0) {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("blur", handleBlur);
      }
    };
  }, []);

  // return the mutable ref
  return vehicleInputControls;
};
