import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import respawnVehicle from "../utils/respawnVehicle";

export const useVehicleHelicopterCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  mainRotorRef: RefObject<THREE.Group | null>,
  tailRotorRef: RefObject<THREE.Group | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: object,
) => {
  // initialize refs for visual engine states
  const rpmRef = useRef(0);
  const collectiveRef = useRef(0);

  console.log(mainRotorRef, tailRotorRef, tuning);

  // execute logic immediately after the physics engine calculates collisions
  useAfterPhysicsStep(() => {
    // exit early if references are missing
    if (!chassisRef.current || !controlsRef.current) return;

    // fetch active control state from the global store
    const { activeControl } = useVehicleStore.getState();

    // strictly gate inputs to only process when the player is actively flying
    const controls =
      activeControl === "helicopter"
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

    // manual respawn trigger resets helicopter to standard spawn point
    if (controls.respawn) {
      // execute centralized respawn logic mapped to the helicopter
      respawnVehicle({
        vehicleType: "helicopter",
        vehicleBody: chassis,
      });

      // instantly kill rotor momentum visuals
      rpmRef.current = 0;
      collectiveRef.current = 0;

      // exit the physics step early to prevent applying forces to a teleporting body
      return;
    }
  });
};
