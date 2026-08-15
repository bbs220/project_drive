import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import respawnVehicle from "../utils/respawnVehicle";

export const useVehiclePlaneCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: object,
) => {
  console.log(tuning);

  // execute logic immediately after the physics engine calculates collisions
  useAfterPhysicsStep(() => {
    // exit early if references are missing
    if (!chassisRef.current || !controlsRef.current) return;

    // fetch active control state from the global store
    const { activeControl } = useVehicleStore.getState();

    // strictly gate inputs to only process when the player is actively flying
    const controls =
      activeControl === "plane"
        ? controlsRef.current
        : {
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
          };

    const chassis = chassisRef.current;

    // manual respawn trigger resets plane to standard spawn point
    if (controls.respawn) {
      // execute centralized respawn logic mapped to the plane
      respawnVehicle({
        vehicleType: "plane",
        vehicleBody: chassis,
      });

      // exit the physics step early to prevent applying forces to a teleporting body
      return;
    }
  });
};
