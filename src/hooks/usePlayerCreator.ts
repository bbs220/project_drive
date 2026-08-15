import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import respawnVehicle from "../utils/respawnVehicle";

export const usePlayerCreator = (
  playerRef: RefObject<RapierRigidBody | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
) => {
  // execute logic immediately after the physics engine calculates collisions
  useAfterPhysicsStep(() => {
    // exit early if references are missing
    if (!playerRef.current || !controlsRef.current) return;

    // fetch active control state from the global store
    const { activeControl } = useVehicleStore.getState();

    // strictly gate inputs to only process when the player is actually walking
    const controls =
      activeControl === "on_foot"
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

    const playerBody = playerRef.current;

    // manual respawn trigger resets character to standard spawn point
    if (controls.respawn) {
      // execute centralized respawn logic mapped to the player
      respawnVehicle({
        vehicleType: "on_foot",
        vehicleBody: playerBody,
      });

      // exit the physics step early to prevent applying forces to a teleporting body
      return;
    }
  });
};
