// import required react hooks
import { useEffect, useRef } from "react";

// define control state
export type VehicleCarControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost: boolean;
};

// export default hook
export const useVehicleCarInput = () => {
  // ref to hold current inputs without triggering rerenders
  const vehicleInputControls = useRef<VehicleCarControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    boost: false,
  });

  // handle key press events
  useEffect(() => {
    // keydown event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          vehicleInputControls.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          vehicleInputControls.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          vehicleInputControls.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          vehicleInputControls.current.right = true;
          break;
        case "Space":
          vehicleInputControls.current.brake = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          vehicleInputControls.current.boost = true;
          break;
      }
    };

    // keyup event handler
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          vehicleInputControls.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          vehicleInputControls.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          vehicleInputControls.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          vehicleInputControls.current.right = false;
          break;
        case "Space":
          vehicleInputControls.current.brake = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          vehicleInputControls.current.boost = false;
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
