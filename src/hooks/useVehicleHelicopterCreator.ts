import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import { vehicleHelicopterConstants } from "../constants/otherConstants";

// initialize reusable threejs objects outside the loop to prevent memory leaks
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();

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
  // initialize refs for smooth telemetry interpolation
  const rpmRef = useRef(0);
  const collectiveRef = useRef(0);

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

    // calculate target rpm based on lift input
    const targetRpm = boost ? tuning.rotorSpeed * 10 : 0;

    // smoothly interpolate current rpm towards target
    rpmRef.current = THREE.MathUtils.lerp(rpmRef.current, targetRpm, delta * 2);

    // calculate target collective based on lift or descend inputs
    const targetCollective = boost ? 100 : brake ? -100 : 0;

    // smoothly interpolate collective towards target
    collectiveRef.current = THREE.MathUtils.lerp(
      collectiveRef.current,
      targetCollective,
      delta * 5,
    );

    // animate main rotor using smoothed rpm
    if (mainRotorRef.current) {
      mainRotorRef.current.rotation.y += delta * rpmRef.current;
    }

    // animate tail rotor using smoothed rpm
    if (tailRotorRef.current) {
      tailRotorRef.current.rotation.x += delta * rpmRef.current;
    }

    // fetch current position translation from rapier
    const currentPosition = chassis.translation();

    // calculate altitude by flooring the y axis value and ensuring it does not drop below zero
    const altitude = Math.max(Math.floor(currentPosition.y), 0);

    // fetch current quaternion rotation from rapier
    const currentRotation = chassis.rotation();

    // apply rapier rotation to threejs quaternion
    quaternion.set(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z,
      currentRotation.w,
    );

    // convert quaternion to euler angles for easier mathematical comparison
    euler.setFromQuaternion(quaternion);

    // check if pitch angle is extremely close to flat
    const isPitchLevel = Math.abs(euler.x) < 0.05;

    // check if roll angle is extremely close to flat
    const isRollLevel = Math.abs(euler.z) < 0.05;

    // verify the player is not actively trying to pitch or roll the vehicle
    const hasNoRotationInput =
      !forward &&
      !backward &&
      !left &&
      !right &&
      !pitchUp &&
      !pitchDown &&
      !rollLeft &&
      !rollRight;

    // lock horizon if the helicopter is physically level and player is not fighting it
    const horizonLock = isPitchLevel && isRollLevel && hasNoRotationInput;

    // push calculated telemetry directly to zustand store without triggering a hook re render
    useVehicleStore.getState().setHelicopterTelemetry({
      altitude: altitude,
      horizonLock: horizonLock,
      rotorRpm: Math.floor(rpmRef.current),
      collective: Math.floor(collectiveRef.current),
    });
  });
};
