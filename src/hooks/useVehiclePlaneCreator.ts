import { useAfterPhysicsStep, useRapier } from "@react-three/rapier";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
} from "../stores/useVehicleStore";
import respawnVehicle from "../utils/respawnVehicle";
import { unwrapParam } from "../utils/unwrapParam";

// define tweakpane parameter descriptor type structure
type TweakpaneParam<T> = {
  value: T;
  min?: number;
  max?: number;
  label?: string;
};

// define plane tuning parameters
export type typePlaneTuning = {
  engineForce: number | TweakpaneParam<number>;
  liftMultiplier: number | TweakpaneParam<number>;
  pitchTorque: number | TweakpaneParam<number>;
  rollTorque: number | TweakpaneParam<number>;
  yawTorque: number | TweakpaneParam<number>;
  dragCoefficient: number | TweakpaneParam<number>;
  angularDamping: number | TweakpaneParam<number>;
  autoLevelStrength: number | TweakpaneParam<number>;
  maxSpeed: number | TweakpaneParam<number>;
  altitudeLimit: number | TweakpaneParam<number>;
  maxLeanAngle: number | TweakpaneParam<number>;
};

// initialize reusable three js objects outside the loop to prevent aggressive memory leaks
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const localX = new THREE.Vector3();
const localY = new THREE.Vector3();
const localZ = new THREE.Vector3();
const forwardVector = new THREE.Vector3();
const forceVector = new THREE.Vector3();

// initialize vectors for arcade stabilization
const globalUp = new THREE.Vector3(0, 1, 0);
const stabilizeTorque = new THREE.Vector3();
const dampingTorque = new THREE.Vector3();

export const useVehiclePlaneCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typePlaneTuning,
) => {
  const { world } = useRapier();

  // initialize refs for engine states
  const throttleRef = useRef(0);

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
          };

    const chassis = chassisRef.current;

    // manual respawn trigger resets plane to standard spawn point
    if (controls.respawn) {
      // execute centralized respawn logic mapped to the plane
      respawnVehicle({
        vehicleType: "plane",
        vehicleBody: chassis,
      });

      // kill engine momentum on respawn
      throttleRef.current = 0;

      // exit the physics step early to prevent applying forces to a teleporting body
      return;
    }

    // fetch current physical state
    const pos = chassis.translation();
    const rot = chassis.rotation();
    const linvel = chassis.linvel();
    const angvel = chassis.angvel();
    const mass = chassis.mass();
    const delta = world.timestep;

    // extract dynamic tweakpane values
    const engineForceVal = unwrapParam(tuning.engineForce, 40);
    const liftMultiplierVal = unwrapParam(tuning.liftMultiplier, 0.8);
    const pitchTorqueVal = unwrapParam(tuning.pitchTorque, 1200);
    const rollTorqueVal = unwrapParam(tuning.rollTorque, 1800);
    const yawTorqueVal = unwrapParam(tuning.yawTorque, 800);
    const dragCoefficientVal = unwrapParam(tuning.dragCoefficient, 0.05);
    const angularDampingVal = unwrapParam(tuning.angularDamping, 0.95);
    const autoLevelVal = unwrapParam(tuning.autoLevelStrength, 800);
    const maxSpeedVal = unwrapParam(tuning.maxSpeed, 150);
    const altitudeLimitVal = unwrapParam(tuning.altitudeLimit, 300);

    // convert degrees to radians for raw quaternion math
    const maxLeanAngleVal = unwrapParam(tuning.maxLeanAngle, 60);
    const maxLeanRad = maxLeanAngleVal * (Math.PI / 180);

    // populate our global reusable quaternion
    quaternion.set(rot.x, rot.y, rot.z, rot.w);
    euler.setFromQuaternion(quaternion, "YXZ");

    // extract local directional axes from the quaternion
    localX.set(1, 0, 0).applyQuaternion(quaternion);
    localY.set(0, 1, 0).applyQuaternion(quaternion);
    localZ.set(0, 0, 1).applyQuaternion(quaternion);

    // the plane geometry faces negative z natively
    forwardVector.copy(localZ).multiplyScalar(-1);

    // check if pilot is in the seat to allow engine spooling
    const isPiloted = active.control === CONTROL_STATE.PLANE;

    // phase 1 throttle logic
    // boost ramps up throttle brake cuts it down
    let targetThrottle = throttleRef.current;
    if (isPiloted) {
      if (controls.boost) targetThrottle += delta * 0.5;
      if (controls.brake) targetThrottle -= delta * 0.5;
    } else {
      // automatically cut throttle if no pilot is in the seat
      targetThrottle -= delta * 0.5;
    }

    // clamp throttle between 0 and 1
    throttleRef.current = THREE.MathUtils.clamp(targetThrottle, 0, 1);

    // phase 2 aerodynamics and lift
    // convert raw rapier velocity object into a three js vector so we can use dot products
    const linvelVec = new THREE.Vector3(linvel.x, linvel.y, linvel.z);

    const forwardSpeed = linvelVec.dot(forwardVector);

    // zero out the accumulator
    forceVector.set(0, 0, 0);

    // apply forward engine thrust but strictly cut it if the plane exceeds maximum allowed speed
    let thrust = engineForceVal * throttleRef.current * mass;
    if (forwardSpeed > maxSpeedVal) {
      thrust = 0;
    }
    forceVector.addScaledVector(forwardVector, thrust * delta);

    // apply aerodynamic lift scaled by forward velocity
    // planes only generate lift when moving fast
    const lift = Math.max(0, forwardSpeed) * liftMultiplierVal * mass;
    forceVector.addScaledVector(localY, lift * delta);

    // apply natural air resistance drag
    const drag = forwardSpeed * dragCoefficientVal * mass;
    forceVector.addScaledVector(forwardVector, -drag * delta);

    // apply extreme anti slip lateral drag
    // airplane wings prevent the plane from drifting sideways like a car
    const sideSpeed = linvelVec.dot(localX);
    forceVector.addScaledVector(localX, -sideSpeed * mass * 4 * delta);

    // arcade soft ceiling altitude limiter
    if (pos.y > altitudeLimitVal) {
      // if the plane is still moving upward apply heavy drag strictly against the upward velocity axis
      if (linvelVec.y > 0) {
        forceVector.addScaledVector(globalUp, -linvelVec.y * mass * 15 * delta);
      }
    }

    // push all accumulated linear forces to the rigid body
    chassis.applyImpulse(forceVector, true);

    // phase 3 rotational flight controls
    // pitch uses w and s to lean forward and backward
    let pitchInput = controls.forward ? 1 : controls.backward ? -1 : 0;
    // roll uses a and d to bank the wings
    let rollInput = controls.left ? -1 : controls.right ? 1 : 0;
    // yaw uses special keys to steer the tail rudder
    const yawInput = controls.yawLeft ? 1 : controls.yawRight ? -1 : 0;

    // arcade angle limiter
    // if the plane exceeds the lean limit zero out any inputs trying to push it further
    if (euler.x > maxLeanRad && pitchInput > 0) pitchInput = 0;
    if (euler.x < -maxLeanRad && pitchInput < 0) pitchInput = 0;
    if (euler.z > maxLeanRad && rollInput > 0) rollInput = 0;
    if (euler.z < -maxLeanRad && rollInput < 0) rollInput = 0;

    // zero out the torque accumulator
    stabilizeTorque.set(0, 0, 0);

    // apply raw input torques mapped to local axes
    stabilizeTorque.addScaledVector(
      localX,
      pitchInput * pitchTorqueVal * delta,
    );
    stabilizeTorque.addScaledVector(localZ, rollInput * rollTorqueVal * delta);
    stabilizeTorque.addScaledVector(localY, yawInput * yawTorqueVal * delta);

    // phase 4 arcade auto leveler
    // gently roll the wings flat when the player lets go of the roll keys
    if (rollInput === 0) {
      // project the planes right wing onto the global flat plane to calculate offset
      const flatRight = new THREE.Vector3()
        .crossVectors(globalUp, forwardVector)
        .normalize();

      dampingTorque
        .crossVectors(localX, flatRight)
        .multiplyScalar(autoLevelVal * delta);
      stabilizeTorque.add(dampingTorque);
    }

    // phase 5 manual angular damping
    // fight the current angular velocity so the plane does not spiral wildly
    stabilizeTorque.x -= angvel.x * angularDampingVal * mass * delta;
    stabilizeTorque.y -= angvel.y * angularDampingVal * mass * delta;
    stabilizeTorque.z -= angvel.z * angularDampingVal * mass * delta;

    // apply accumulated torques to the rigid body
    chassis.applyTorqueImpulse(stabilizeTorque, true);

    // calculate current true speed
    const currentSpeed = Math.sqrt(
      linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z,
    );

    // seat position and rotation socket math
    // local offset matches your constant file definition perfectly
    const localSeatOffset = new THREE.Vector3(0, 2, 1);
    localSeatOffset.applyQuaternion(quaternion);
    const worldSeat = new THREE.Vector3(pos.x, pos.y, pos.z).add(
      localSeatOffset,
    );

    // apply a 180 degree y axis rotation to flip the player forward in the cockpit
    const seatRotationOffset = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      Math.PI,
    );
    const finalSeatQuat = quaternion.clone().multiply(seatRotationOffset);

    // format strict rotation array for the player hook to consume
    const seatRot: [number, number, number, number] = [
      finalSeatQuat.x,
      finalSeatQuat.y,
      finalSeatQuat.z,
      finalSeatQuat.w,
    ];

    // always broadcast full telemetry so ui and mount systems function properly
    useVehicleStore.getState().updateTelemetry(ENTITY_ID.PLANE_1, {
      airspeed: Math.round(currentSpeed * 3.6),
      throttle: throttleRef.current,
      altitude: Math.round(pos.y),
      pitch: euler.x,
      roll: euler.z,
      yaw: euler.y,
      position: [pos.x, pos.y, pos.z],
      seatPosition: [worldSeat.x, worldSeat.y, worldSeat.z],
      seatRotation: seatRot,
    });
  });
};
