import { useEffect, useRef } from "react";

// define control state
export type typeAllVehicleControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost: boolean;
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
  });

  // handle key press events
  useEffect(() => {
    // keydown event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
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
      }
    };

    // keyup event handler
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
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
