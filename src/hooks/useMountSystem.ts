import { useEffect } from "react";
import * as THREE from "three";
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
  type TypeControlState,
  type TypeEntityId,
} from "../stores/useVehicleStore";

export const useMountSystem = () => {
  useEffect(() => {
    // listen for discrete f keydown to prevent physics loop mount/unmount flickering
    const handleKeyDown = (e: KeyboardEvent) => {
      // f - for player to mount or unmount vehicles
      if (e.key.toLowerCase() !== "f") return;

      const state = useVehicleStore.getState();
      const { active, telemetry, setActive, updateTelemetry } = state;

      // handle unmounting if player is actively driving a vehicle
      if (active.control !== CONTROL_STATE.PLAYER) {
        // grab the exact world coordinates of the active vehicle
        const vehiclePos = telemetry[active.entity].position;

        // calculate a safe exit vector offset to prevent collision explosions
        const exitX = vehiclePos[0] + 2;
        const exitY = vehiclePos[1] + 1;
        const exitZ = vehiclePos[2];

        // preload player telemetry with safe exit coordinates before swapping state
        updateTelemetry(ENTITY_ID.PLAYER_1, {
          position: [exitX, exitY, exitZ],
        });

        // hand control back to the player character
        setActive(CONTROL_STATE.PLAYER, ENTITY_ID.PLAYER_1);
        return;
      }

      // handle mounting if player is in use
      const playerPos = new THREE.Vector3(
        ...telemetry[ENTITY_ID.PLAYER_1].position,
      );

      // define strict list of mountable vehicles mapped to their entities
      const vehicles = [
        { control: CONTROL_STATE.CAR, entity: ENTITY_ID.CAR_1 },
        { control: CONTROL_STATE.HELICOPTER, entity: ENTITY_ID.HELI_1 },
        { control: CONTROL_STATE.PLANE, entity: ENTITY_ID.PLANE_1 },
      ];

      let closestVehicle = null;
      let minDistance = Infinity;

      // calculate distance to every vehicle in the world
      for (const v of vehicles) {
        const vPos = new THREE.Vector3(...telemetry[v.entity].position);
        const dist = playerPos.distanceTo(vPos);

        // register vehicle as target if it is within 4 meters
        if (dist < 4 && dist < minDistance) {
          minDistance = dist;
          closestVehicle = v;
        }
      }

      // hijack the closest valid vehicle
      if (closestVehicle) {
        setActive(
          closestVehicle.control as TypeControlState,
          closestVehicle.entity as TypeEntityId,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
