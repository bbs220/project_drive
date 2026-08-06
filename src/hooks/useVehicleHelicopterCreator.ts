import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject } from "react";
import type * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import { vehicleHelicopterConstants } from "../constants/otherConstants";

// define helicopter tuning parameters
export type typeHelicopterTuning = {
  liftForce: number;
  descendForce: number;
  pitchTorque: number;
  rollTorque: number;
  yawTorque: number;
  rotorSpeed: number;
};

// define vehicle controller hook
export const useVehicleHelicopterCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  mainRotorRef: RefObject<THREE.Group | null>,
  tailRotorRef: RefObject<THREE.Group | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typeHelicopterTuning,
) => {
  // handle physics step updates
  useAfterPhysicsStep((world) => {
    // exit early if refs are missing
    if (!chassisRef.current || !controlsRef.current) return;

    // check global store to see if player is actively controlling the helicopter
    const { activeControl } = useVehicleStore.getState();

    // intercept controls and ignore inputs if player is in another vehicle
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
            pitchUp: false,
            pitchDown: false,
            rollLeft: false,
            rollRight: false,
            yawLeft: false,
            yawRight: false,
          };

    // assign refs to local variables
    const chassis = chassisRef.current;
    const {
      boost,
      brake,
      forward,
      backward,
      left,
      right,
      pitchUp,
      pitchDown,
      rollLeft,
      rollRight,
      yawLeft,
      yawRight,
    } = controls;
    const { zeroVector } = vehicleHelicopterConstants.physics;

    // apply lift logic
    if (boost) {
      chassis.applyImpulse(
        { x: zeroVector, y: tuning.liftForce, z: zeroVector },
        true,
      );
    }

    // apply descent logic
    if (brake) {
      chassis.applyImpulse(
        { x: zeroVector, y: -tuning.descendForce, z: zeroVector },
        true,
      );
    }

    // apply pitch logic
    if (forward || pitchDown) {
      chassis.applyTorqueImpulse(
        { x: tuning.pitchTorque, y: zeroVector, z: zeroVector },
        true,
      );
    }
    if (backward || pitchUp) {
      chassis.applyTorqueImpulse(
        { x: -tuning.pitchTorque, y: zeroVector, z: zeroVector },
        true,
      );
    }

    // apply roll logic
    if (left || rollLeft) {
      chassis.applyTorqueImpulse(
        { x: zeroVector, y: zeroVector, z: tuning.rollTorque },
        true,
      );
    }
    if (right || rollRight) {
      chassis.applyTorqueImpulse(
        { x: zeroVector, y: zeroVector, z: -tuning.rollTorque },
        true,
      );
    }

    // apply yaw logic
    if (yawLeft) {
      chassis.applyTorqueImpulse(
        { x: zeroVector, y: tuning.yawTorque, z: zeroVector },
        true,
      );
    }
    if (yawRight) {
      chassis.applyTorqueImpulse(
        { x: zeroVector, y: -tuning.yawTorque, z: zeroVector },
        true,
      );
    }

    // extract time step for smooth rotation
    const delta = world.timestep;

    // animate main rotor
    if (mainRotorRef.current && boost) {
      mainRotorRef.current.rotation.y += delta * tuning.rotorSpeed;
    }

    // animate tail rotor
    if (tailRotorRef.current && boost) {
      tailRotorRef.current.rotation.x += delta * tuning.rotorSpeed;
    }
  });
};
