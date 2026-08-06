import { useEffect, useRef } from "react";

// define all possible control states
export type typeAllVehicleControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost: boolean;
  pitchUp: boolean;
  pitchDown: boolean;
  rollLeft: boolean;
  rollRight: boolean;
  yawLeft: boolean;
  yawRight: boolean;
};

// export default hook
export const useAllVehicleInput = () => {
  // ref to hold current inputs without triggering rerenders
  const vehicleInputControls = useRef<typeAllVehicleControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    boost: false,
    pitchUp: false,
    pitchDown: false,
    rollLeft: false,
    rollRight: false,
    yawLeft: false,
    yawRight: false,
  });

  // handle key press events
  useEffect(() => {
    // keydown event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        // standard driving and throttle
        case "KeyW":
          vehicleInputControls.current.forward = true;
          break;
        case "KeyS":
          vehicleInputControls.current.backward = true;
          break;
        case "KeyA":
          vehicleInputControls.current.left = true;
          break;
        case "KeyD":
          vehicleInputControls.current.right = true;
          break;
        case "Space":
          vehicleInputControls.current.brake = true;
          break;
        case "ShiftLeft":
          vehicleInputControls.current.boost = true;
          break;
        // yaw controls
        case "KeyQ":
          vehicleInputControls.current.yawLeft = true;
          break;
        case "KeyE":
          vehicleInputControls.current.yawRight = true;
          break;
        // pitch controls
        case "Numpad5":
          vehicleInputControls.current.pitchUp = true;
          break;
        case "Numpad8":
          vehicleInputControls.current.pitchDown = true;
          break;
        // roll controls
        case "Numpad4":
          vehicleInputControls.current.rollLeft = true;
          break;
        case "Numpad6":
          vehicleInputControls.current.rollRight = true;
          break;
      }
    };

    // keyup event handler
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        // standard driving and throttle
        case "KeyW":
          vehicleInputControls.current.forward = false;
          break;
        case "KeyS":
          vehicleInputControls.current.backward = false;
          break;
        case "KeyA":
          vehicleInputControls.current.left = false;
          break;
        case "KeyD":
          vehicleInputControls.current.right = false;
          break;
        case "Space":
          vehicleInputControls.current.brake = false;
          break;
        case "ShiftLeft":
          vehicleInputControls.current.boost = false;
          break;
        // yaw controls
        case "KeyQ":
          vehicleInputControls.current.yawLeft = false;
          break;
        case "KeyE":
          vehicleInputControls.current.yawRight = false;
          break;
        // pitch controls
        case "Numpad5":
          vehicleInputControls.current.pitchUp = false;
          break;
        case "Numpad8":
          vehicleInputControls.current.pitchDown = false;
          break;
        // roll controls
        case "Numpad4":
          vehicleInputControls.current.rollLeft = false;
          break;
        case "Numpad6":
          vehicleInputControls.current.rollRight = false;
          break;
      }
    };

    // attach event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // cleanup event listeners on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // return the mutable ref
  return vehicleInputControls;
};
