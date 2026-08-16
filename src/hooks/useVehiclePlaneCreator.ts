import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
} from "../stores/useVehicleStore";
import respawnVehicle from "../utils/respawnVehicle";

export const useVehiclePlaneCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: object,
) => {
  console.groupCollapsed(tuning);

  // execute logic immediately after the physics engine calculates collisions
  useAfterPhysicsStep(() => {
    // exit early if references are missing
    if (!chassisRef.current || !controlsRef.current) return;

    // fetch the active object from the global store
    const { active } = useVehicleStore.getState();

    // strictly check against the new dictionary instead of a string
    const controls =
      active.control === CONTROL_STATE.PLANE
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

    // fetch current world translation from the physics engine
    const pos = chassis.translation();

    // push the live coordinates to the global store without causing a re-render
    useVehicleStore.getState().updateTelemetry(ENTITY_ID.PLANE_1, {
      position: [pos.x, pos.y, pos.z],
    });
  });
};
