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
const currentVelVector = new THREE.Vector3();

const asVec = (vec: THREE.Vector3) => ({ x: vec.x, y: vec.y, z: vec.z });

// strict types
type TweakpaneParam<T> = {
  value: T;
  min?: number;
  max?: number;
  label?: string;
};

export type typePlaneTuning = {
  thrustPower: number | TweakpaneParam<number>;
  brakeForce: number | TweakpaneParam<number>;
  pitchTorque: number | TweakpaneParam<number>;
  rollTorque: number | TweakpaneParam<number>;
  yawTorque: number | TweakpaneParam<number>;
  liftMultiplier: number | TweakpaneParam<number>;
  maxSpeed: number | TweakpaneParam<number>;
  airborneThreshold: number | TweakpaneParam<number>;
};

// safe extractor
const getVal = (
  param: number | TweakpaneParam<number> | undefined,
  fallback: number,
): number => {
  if (param === undefined) return fallback;
  return typeof param === "object" && param !== null && "value" in param
    ? param.value
    : (param as number);
};

export const useVehiclePlaneCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typePlaneTuning,
) => {
  const throttleRef = useRef(0);

  useAfterPhysicsStep((world) => {
    if (!chassisRef.current || !controlsRef.current) return;

    const { activeControl } = useVehicleStore.getState();
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

    const chassis = chassisRef.current;

    if (controls.respawn) {
      respawnVehicle({ vehicleType: "plane", vehicleBody: chassis });
      throttleRef.current = 0;
      return;
    }

    const { boost, brake, forward, backward, left, right, yawLeft, yawRight } =
      controls;
    const delta = world.timestep;

    const thrustPowerVal = getVal(tuning.thrustPower, 300);
    const brakeForceVal = getVal(tuning.brakeForce, 5);
    const pitchTorqueVal = getVal(tuning.pitchTorque, 10);
    const rollTorqueVal = getVal(tuning.rollTorque, 10);
    const yawTorqueVal = getVal(tuning.yawTorque, 10);
    const liftMultiplierVal = getVal(tuning.liftMultiplier, 0.1);
    const maxSpeedVal = getVal(tuning.maxSpeed, 200);
    const airborneThresholdVal = getVal(tuning.airborneThreshold, 2.5);

    const currentPosition = chassis.translation();
    const currentLinVel = chassis.linvel();
    currentVelVector.set(currentLinVel.x, currentLinVel.y, currentLinVel.z);
    const chassisMass = chassis.mass();

    const altitude = Math.max(
      Math.floor(currentPosition.y),
      vehicleRespawnLimit,
    );
    const isAirborne = currentPosition.y > airborneThresholdVal;

    const currentRotation = chassis.rotation();
    quaternion.set(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z,
      currentRotation.w,
    );

    // convert to euler with yxz order to prevent gimbal lock
    euler.setFromQuaternion(quaternion, "YXZ");

    localX.set(1, 0, 0).applyQuaternion(quaternion);
    localY.set(0, 1, 0).applyQuaternion(quaternion);
    localZ.set(0, 0, 1).applyQuaternion(quaternion);

    // throttle logic
    if (boost)
      throttleRef.current = THREE.MathUtils.lerp(throttleRef.current, 1, delta);
    if (brake)
      throttleRef.current = THREE.MathUtils.lerp(throttleRef.current, 0, delta);

    // apply ground brakes
    if (brake && !isAirborne) {
      chassis.setLinvel(
        {
          x: THREE.MathUtils.lerp(currentLinVel.x, 0, delta * brakeForceVal),
          y: currentLinVel.y,
          z: THREE.MathUtils.lerp(currentLinVel.z, 0, delta * brakeForceVal),
        },
        true,
      );
    }

    // strict local forward speed calculation
    const forwardSpeed = Math.max(0, -currentVelVector.dot(localZ));

    let currentThrust = thrustPowerVal * throttleRef.current * delta;

    if (forwardSpeed >= maxSpeedVal) {
      currentThrust = 0;
    }

    // apply thrust purely along local forward z axis with zero perpendicular bleed
    forceVector.copy(localZ).multiplyScalar(-currentThrust);
    chassis.applyImpulse(asVec(forceVector), true);

    const speedKnots = forwardSpeed * 1.94384;
    const gravityImpulse = chassisMass * 9.81 * delta;

    const dynamicLift = Math.min(
      forwardSpeed * liftMultiplierVal * delta,
      gravityImpulse * 2.5,
    );

    forceVector.copy(localY).multiplyScalar(dynamicLift);
    chassis.applyImpulse(asVec(forceVector), true);

    const takeoffSpeedThreshold = maxSpeedVal * 0.25;

    if (!isAirborne && forwardSpeed > takeoffSpeedThreshold && backward) {
      chassis.applyImpulse({ x: 0, y: gravityImpulse * 0.8, z: 0 }, true);
    }

    // safety limit checking for thirty degrees max orientation boundary
    const maxAllowedAngle = Math.PI / 6;
    const hasExceededBounds =
      Math.abs(euler.x) > maxAllowedAngle ||
      Math.abs(euler.z) > maxAllowedAngle;

    if (hasExceededBounds) {
      // kill user controls and apply stabilizing recovery torque to bring plane down to stable orientation
      const recoveryPitch = -euler.x * pitchTorqueVal * 2;
      const recoveryRoll = -euler.z * rollTorqueVal * 2;

      forceVector.copy(localX).multiplyScalar(recoveryPitch);
      chassis.applyTorqueImpulse(asVec(forceVector), true);

      forceVector.copy(localZ).multiplyScalar(recoveryRoll);
      chassis.applyTorqueImpulse(asVec(forceVector), true);
    } else {
      // standard control processing only when inside safe angle limits
      const canProcessFlightControls =
        isAirborne || forwardSpeed > takeoffSpeedThreshold;

      if (canProcessFlightControls) {
        if (forward && euler.x > -maxAllowedAngle) {
          forceVector.copy(localX).multiplyScalar(-pitchTorqueVal);
          chassis.applyTorqueImpulse(asVec(forceVector), true);
        }
        if (backward && euler.x < maxAllowedAngle) {
          forceVector.copy(localX).multiplyScalar(pitchTorqueVal);
          chassis.applyTorqueImpulse(asVec(forceVector), true);
        }
        if (left) {
          forceVector.copy(localZ).multiplyScalar(rollTorqueVal);
          chassis.applyTorqueImpulse(asVec(forceVector), true);
        }
        if (right) {
          forceVector.copy(localZ).multiplyScalar(-rollTorqueVal);
          chassis.applyTorqueImpulse(asVec(forceVector), true);
        }
      }

      if (yawLeft) {
        forceVector.copy(localY).multiplyScalar(yawTorqueVal);
        chassis.applyTorqueImpulse(asVec(forceVector), true);
      }
      if (yawRight) {
        forceVector.copy(localY).multiplyScalar(-yawTorqueVal);
        chassis.applyTorqueImpulse(asVec(forceVector), true);
      }
    }

    const currentAngVel = chassis.angvel();
    dampingTorque
      .set(-currentAngVel.x, -currentAngVel.y, -currentAngVel.z)
      .multiplyScalar(pitchTorqueVal);
    chassis.applyTorqueImpulse(asVec(dampingTorque), true);

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
