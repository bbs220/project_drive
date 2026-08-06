import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";

// initialize reusable three js objects outside the loop to prevent memory leaks
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const localX = new THREE.Vector3();
const localY = new THREE.Vector3();
const localZ = new THREE.Vector3();
const forceVector = new THREE.Vector3();

// initialize vectors for arcade stabilization
const globalUp = new THREE.Vector3(0, 1, 0);
const stabilizeTorque = new THREE.Vector3();
const dampingTorque = new THREE.Vector3();

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

    // fetch current quaternion rotation from rapier
    const currentRotation = chassis.rotation();

    // apply rapier rotation to three js quaternion
    quaternion.set(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z,
      currentRotation.w,
    );

    // convert quaternion to euler angles to check current pitch and roll limits
    euler.setFromQuaternion(quaternion);

    // extract local axes for world space force application
    localX.set(1, 0, 0).applyQuaternion(quaternion);
    localY.set(0, 1, 0).applyQuaternion(quaternion);
    localZ.set(0, 0, 1).applyQuaternion(quaternion);

    // apply lift logic along local up vector
    if (boost) {
      forceVector.copy(localY).multiplyScalar(tuning.liftForce);
      chassis.applyImpulse(forceVector, true);
    }

    // apply descent logic along local up vector
    if (brake) {
      forceVector.copy(localY).multiplyScalar(-tuning.descendForce);
      chassis.applyImpulse(forceVector, true);
    }

    // calculate maximum angle in radians for hard limit
    const maxAngle = Math.PI / 4;

    // apply pitch logic along local right vector with hard angle limits
    if ((forward || pitchDown) && euler.x > -maxAngle) {
      forceVector.copy(localX).multiplyScalar(tuning.pitchTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }
    if ((backward || pitchUp) && euler.x < maxAngle) {
      forceVector.copy(localX).multiplyScalar(-tuning.pitchTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }

    // apply roll logic along local forward vector with hard angle limits
    if ((left || rollLeft) && euler.z < maxAngle) {
      forceVector.copy(localZ).multiplyScalar(tuning.rollTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }
    if ((right || rollRight) && euler.z > -maxAngle) {
      forceVector.copy(localZ).multiplyScalar(-tuning.rollTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }

    // apply yaw logic along local up vector
    if (yawLeft) {
      forceVector.copy(localY).multiplyScalar(tuning.yawTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }
    if (yawRight) {
      forceVector.copy(localY).multiplyScalar(-tuning.yawTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }

    // fetch current angular velocity from rapier
    const currentAngVel = chassis.angvel();

    // apply angular damping to stop infinite spinning and maintain angle of attack
    dampingTorque
      .set(-currentAngVel.x, -currentAngVel.y, -currentAngVel.z)
      .multiplyScalar(tuning.pitchTorque);
    chassis.applyTorqueImpulse(dampingTorque, true);

    // forcefully stabilize helicopter if it exceeds the hard angle limit due to momentum
    if (Math.abs(euler.x) > maxAngle || Math.abs(euler.z) > maxAngle) {
      stabilizeTorque
        .crossVectors(localY, globalUp)
        .multiplyScalar(tuning.pitchTorque * 2);
      chassis.applyTorqueImpulse(stabilizeTorque, true);
    }

    // extract time step for smooth rotation
    const delta = world.timestep;

    // calculate target rpm based on lift input
    const targetRpm = boost ? tuning.rotorSpeed : 0;

    // smoothly interpolate current rpm towards target
    rpmRef.current = THREE.MathUtils.lerp(rpmRef.current, targetRpm, delta);

    // calculate target collective based on lift or descend inputs
    const targetCollective = boost
      ? tuning.liftForce
      : brake
        ? -tuning.descendForce
        : 0;

    // smoothly interpolate collective towards target
    collectiveRef.current = THREE.MathUtils.lerp(
      collectiveRef.current,
      targetCollective,
      delta,
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

    // extract pitch roll and yaw for ui attitude indicator
    const currentPitch = euler.x;
    const currentRoll = euler.z;
    const currentYaw = euler.y;

    // push calculated telemetry directly to zustand store without triggering a hook re render
    useVehicleStore.getState().setHelicopterTelemetry({
      altitude: altitude,
      pitch: currentPitch,
      roll: currentRoll,
      yaw: currentYaw,
      rotorRpm: Math.floor(rpmRef.current),
      collective: Math.floor(collectiveRef.current),
    });
  });
};
