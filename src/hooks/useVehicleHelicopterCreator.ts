import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import { vehicleRespawnLimit } from "../constants/otherConstants";

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
  hoverMultiplier: number;
  pitchTorque: number;
  rollTorque: number;
  yawTorque: number;
  rotorSpeed: number;
  altitudeLimit: number;
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

    // extract time step for smooth rotation and physics
    const delta = world.timestep;

    // fetch current position translation from rapier
    const currentPosition = chassis.translation();

    // fetch current linear velocity
    const currentLinVel = chassis.linvel();

    // fetch mass of the chassis
    const chassisMass = chassis.mass();

    // calculate altitude by flooring the y axis value and clamping to negative bounds
    const altitude = Math.max(
      Math.floor(currentPosition.y),
      vehicleRespawnLimit,
    );

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

    // create a strictly horizontal forward vector to prevent thrust from pushing helicopter down
    const flatForward = new THREE.Vector3(localZ.x, 0, localZ.z).normalize();

    // calculate exact impulse required to counteract standard gravity using tweakable multiplier
    const hoverImpulse = chassisMass * tuning.hoverMultiplier * delta;

    // apply baseline hover force along global up vector to prevent falling
    if (!brake) {
      forceVector.copy(globalUp).multiplyScalar(hoverImpulse);
      chassis.applyImpulse(forceVector, true);
    }

    // apply additional lift logic along local up vector if below altitude limit
    if (boost && currentPosition.y < tuning.altitudeLimit) {
      forceVector.copy(localY).multiplyScalar(tuning.liftForce * delta);
      chassis.applyImpulse(forceVector, true);
    }

    // apply descent logic along global up vector by overriding hover
    if (brake) {
      forceVector.copy(globalUp).multiplyScalar(-tuning.descendForce * delta);
      chassis.applyImpulse(forceVector, true);
    }

    // dampen vertical velocity to stabilize hover when no vertical input is active
    if (!boost && !brake) {
      chassis.setLinvel(
        {
          x: currentLinVel.x,
          y: THREE.MathUtils.lerp(currentLinVel.y, 0, delta * 5),
          z: currentLinVel.z,
        },
        true,
      );
    }

    // determine if helicopter is high enough off the ground to maneuver
    const isAirborne = currentPosition.y > 1.5;

    // calculate forward and backward thrust scalar
    const thrustPower = tuning.liftForce * delta * 10;

    // apply forward thrust along flat horizontal plane
    if (forward && isAirborne) {
      forceVector.copy(flatForward).multiplyScalar(-thrustPower);
      chassis.applyImpulse(forceVector, true);
    }

    // apply backward thrust along flat horizontal plane
    if (backward && isAirborne) {
      forceVector.copy(flatForward).multiplyScalar(thrustPower);
      chassis.applyImpulse(forceVector, true);
    }

    // apply pitch logic along local right vector
    if ((forward || pitchDown) && isAirborne) {
      forceVector.copy(localX).multiplyScalar(-tuning.pitchTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }
    if ((backward || pitchUp) && isAirborne) {
      forceVector.copy(localX).multiplyScalar(tuning.pitchTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }

    // apply roll logic along local forward vector
    if ((left || rollLeft) && isAirborne) {
      forceVector.copy(localZ).multiplyScalar(tuning.rollTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }
    if ((right || rollRight) && isAirborne) {
      forceVector.copy(localZ).multiplyScalar(-tuning.rollTorque);
      chassis.applyTorqueImpulse(forceVector, true);
    }

    // apply yaw logic along local up vector
    // yaw is allowed on the ground to simulate pedal turning
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

    // apply angular damping to stop infinite spinning
    dampingTorque
      .set(-currentAngVel.x, -currentAngVel.y, -currentAngVel.z)
      .multiplyScalar(tuning.pitchTorque);
    chassis.applyTorqueImpulse(dampingTorque, true);

    // calculate soft auto leveling spring force to replace hard jitter limits
    stabilizeTorque.crossVectors(localY, globalUp);

    // apply continuous self leveling torque that naturally resists extreme angles
    stabilizeTorque.multiplyScalar(tuning.pitchTorque * 2.5);
    chassis.applyTorqueImpulse(stabilizeTorque, true);

    // determine target rpm based on flight state and player input
    let targetRpm: number;

    // handle airborne rotor states
    if (isAirborne) {
      if (boost) {
        // max speed when gaining altitude
        targetRpm = tuning.rotorSpeed;
      } else if (brake) {
        // reduced speed when losing altitude
        targetRpm = tuning.rotorSpeed * 0.6;
      } else {
        // high idle speed to maintain illusion of flight
        targetRpm = tuning.rotorSpeed * 0.8;
      }
    } else {
      // handle grounded rotor states
      if (boost) {
        // spool up for takeoff
        targetRpm = tuning.rotorSpeed;
      } else {
        // engine off
        targetRpm = 0;
      }
    }

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
