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
  mount: boolean; // f - for player to mount or unmount vehicles
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
    yawLeft: false,
    yawRight: false,
    respawn: false,
    mount: false,
  });

  // handle key press events
  useEffect(() => {
    // keydown event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        // standard driving and throttle and pitch
        case "KeyW":
          vehicleInputControls.current.forward = true;
          break;
        case "KeyS":
          vehicleInputControls.current.backward = true;
          break;
        // standard steering and roll
        case "KeyA":
          vehicleInputControls.current.left = true;
          break;
        case "KeyD":
          vehicleInputControls.current.right = true;
          break;
        // brakes and boost
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
        // respawn and mounting
        case "KeyR":
          vehicleInputControls.current.respawn = true;
          break;
        case "KeyF":
          vehicleInputControls.current.mount = true;
          break;
      }
    };

    // keyup event handler
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        // standard driving and throttle and pitch
        case "KeyW":
          vehicleInputControls.current.forward = false;
          break;
        case "KeyS":
          vehicleInputControls.current.backward = false;
          break;
        // standard steering and roll
        case "KeyA":
          vehicleInputControls.current.left = false;
          break;
        case "KeyD":
          vehicleInputControls.current.right = false;
          break;
        // brakes and boost
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
        // respawn and mounting
        case "KeyR":
          vehicleInputControls.current.respawn = false;
          break;
        case "KeyF":
          vehicleInputControls.current.mount = false;
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
