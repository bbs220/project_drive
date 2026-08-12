import { useAfterPhysicsStep } from "@react-three/rapier";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import { vehicleRespawnLimit } from "../constants/otherConstants";
import respawnVehicle from "../utils/respawnVehicle";

// initialize reusable objects outside the loop
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const localX = new THREE.Vector3();
const localY = new THREE.Vector3();
const localZ = new THREE.Vector3();
const forceVector = new THREE.Vector3();
const dampingTorque = new THREE.Vector3();

// add this new vector to hold our velocity
const currentVelVector = new THREE.Vector3();

// helper to safely pass library vectors to rapier without triggering rust memory aliasing
const asVec = (vec: THREE.Vector3) => ({ x: vec.x, y: vec.y, z: vec.z });

// define plane tuning parameters
export type typePlaneTuning = {
  thrustPower: number;
  brakeForce: number;
  pitchTorque: number;
  rollTorque: number;
  yawTorque: number;
  liftMultiplier: number;
  maxSpeed: number;
};

// define vehicle controller hook
export const useVehiclePlaneCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typePlaneTuning,
) => {
  // initialize refs for smooth telemetry interpolation
  const throttleRef = useRef(0);

  // handle physics step updates
  useAfterPhysicsStep((world) => {
    // exit early if refs are missing
    if (!chassisRef.current || !controlsRef.current) return;

    // check global store to see if player is actively controlling the plane
    const { activeControl } = useVehicleStore.getState();

    // intercept controls and ignore inputs if player is in another vehicle
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
          };

    // assign refs to local variables
    const chassis = chassisRef.current;

    // manual respawn trigger
    if (controls.respawn) {
      respawnVehicle({
        vehicleType: "plane",
        vehicleBody: chassis,
      });

      // zero out engine throttle on respawn
      throttleRef.current = 0;

      // exit the physics step early
      return;
    }

    const { boost, brake, forward, backward, left, right, yawLeft, yawRight } =
      controls;

    // extract time step for smooth physics
    const delta = world.timestep;

    // fetch current position translation from rapier
    const currentPosition = chassis.translation();

    // fetch current linear velocity from rapier
    const currentLinVel = chassis.linvel();

    // convert rapier plain object to a library vector
    currentVelVector.set(currentLinVel.x, currentLinVel.y, currentLinVel.z);

    // fetch mass of the chassis
    const chassisMass = chassis.mass();

    // calculate altitude by flooring the y axis value
    const altitude = Math.max(
      Math.floor(currentPosition.y),
      vehicleRespawnLimit,
    );

    // determine if plane is airborne
    const isAirborne = currentPosition.y > 1.5;

    // fetch current quaternion rotation from rapier
    const currentRotation = chassis.rotation();

    // apply rapier rotation to library quaternion
    quaternion.set(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z,
      currentRotation.w,
    );

    // convert quaternion to euler angles
    euler.setFromQuaternion(quaternion);

    // extract local axes for world space force application
    localX.set(1, 0, 0).applyQuaternion(quaternion);
    localY.set(0, 1, 0).applyQuaternion(quaternion);
    localZ.set(0, 0, 1).applyQuaternion(quaternion);

    // smoothly interpolate throttle towards max when boosting
    if (boost) {
      throttleRef.current = THREE.MathUtils.lerp(throttleRef.current, 1, delta);
    }

    // smoothly interpolate throttle towards zero when braking
    if (brake) {
      throttleRef.current = THREE.MathUtils.lerp(throttleRef.current, 0, delta);
    }

    // apply ground brakes by forcefully dampening horizontal velocity using tweakpane value
    const safeBrakeForce = tuning.brakeForce || 5;
    if (brake && !isAirborne) {
      chassis.setLinvel(
        {
          x: THREE.MathUtils.lerp(currentLinVel.x, 0, delta * safeBrakeForce),
          y: currentLinVel.y,
          z: THREE.MathUtils.lerp(currentLinVel.z, 0, delta * safeBrakeForce),
        },
        true,
      );
    }

    // calculate true dimensional speed early for engine governor
    const speedMps = currentVelVector.length();

    // calculate forward thrust
    let currentThrust = tuning.thrustPower * throttleRef.current * delta;

    // fallback speed limit
    const safeMaxSpeed = tuning.maxSpeed || 200;

    // engine governor overrides thrust if plane exceeds maximum procedural safe speed
    if (speedMps >= safeMaxSpeed) {
      currentThrust = 0;
    }

    // apply thrust along local forward axis
    forceVector.copy(localZ).multiplyScalar(-currentThrust);
    chassis.applyImpulse(asVec(forceVector), true);

    // convert to knots for authentic aviation telemetry
    const speedKnots = speedMps * 1.94384;

    // isolate forward velocity by taking the dot product against local forward axis
    const forwardSpeed = Math.max(0, -currentVelVector.dot(localZ));

    // calculate exact impulse required to counteract standard gravity
    const gravityImpulse = chassisMass * 9.81 * delta;

    // calculate dynamic lift scaling with forward speed
    const dynamicLift = Math.min(
      forwardSpeed * tuning.liftMultiplier * delta,
      gravityImpulse,
    );

    // apply lift force along local up vector
    forceVector.copy(localY).multiplyScalar(dynamicLift);
    chassis.applyImpulse(asVec(forceVector), true);

    // apply pitch torque along local right vector using primary movement keys
    if (forward) {
      forceVector.copy(localX).multiplyScalar(-tuning.pitchTorque);
      chassis.applyTorqueImpulse(asVec(forceVector), true);
    }
    if (backward) {
      forceVector.copy(localX).multiplyScalar(tuning.pitchTorque);
      chassis.applyTorqueImpulse(asVec(forceVector), true);
    }

    // apply roll torque along local forward vector using primary steering keys
    if (left) {
      forceVector.copy(localZ).multiplyScalar(tuning.rollTorque);
      chassis.applyTorqueImpulse(asVec(forceVector), true);
    }
    if (right) {
      forceVector.copy(localZ).multiplyScalar(-tuning.rollTorque);
      chassis.applyTorqueImpulse(asVec(forceVector), true);
    }

    // apply yaw torque along local up vector
    if (yawLeft) {
      forceVector.copy(localY).multiplyScalar(tuning.yawTorque);
      chassis.applyTorqueImpulse(asVec(forceVector), true);
    }
    if (yawRight) {
      forceVector.copy(localY).multiplyScalar(-tuning.yawTorque);
      chassis.applyTorqueImpulse(asVec(forceVector), true);
    }

    // fetch current angular velocity from rapier
    const currentAngVel = chassis.angvel();

    // apply angular damping to stabilize flight
    dampingTorque
      .set(-currentAngVel.x, -currentAngVel.y, -currentAngVel.z)
      .multiplyScalar(tuning.pitchTorque);
    chassis.applyTorqueImpulse(asVec(dampingTorque), true);

    // push calculated telemetry directly to zustand store without triggering a hook re render
    useVehicleStore.getState().setPlaneTelemetry({
      altitude: altitude,
      airspeed: Math.floor(speedKnots),
      throttle: Math.floor(throttleRef.current * 100),
      pitch: euler.x,
      roll: euler.z,
      yaw: euler.y,
    });
  });
};
