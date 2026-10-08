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
import { respawnValues } from "../constants/otherConstants";

// define tweakpane parameter descriptor type structure
type TweakpaneParam<T> = {
  value: T;
  min?: number;
  max?: number;
  label?: string;
};

// define plane tuning parameters exactly matching the unity flight model
export type typePlaneTuning = {
  defaultSpeed: number | TweakpaneParam<number>;
  turboSpeed: number | TweakpaneParam<number>;
  accelerating: number | TweakpaneParam<number>;
  deaccelerating: number | TweakpaneParam<number>;
  yawSpeed: number | TweakpaneParam<number>;
  pitchSpeed: number | TweakpaneParam<number>;
  rollSpeed: number | TweakpaneParam<number>;
  yawTurboMultiplier: number | TweakpaneParam<number>;
  pitchTurboMultiplier: number | TweakpaneParam<number>;
  rollTurboMultiplier: number | TweakpaneParam<number>;
  sidewaysMovement: number | TweakpaneParam<number>;
  sidewaysMovementXRot: number | TweakpaneParam<number>;
  sidewaysMovementYRot: number | TweakpaneParam<number>;
  sidewaysMovementYPos: number | TweakpaneParam<number>;
  maxPitchAngle: number | TweakpaneParam<number>;
  maxRollAngle: number | TweakpaneParam<number>;
  altitudeLimit: number | TweakpaneParam<number>;
};

// initialize reusable three js objects outside the loop to prevent aggressive memory leaks
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const localX = new THREE.Vector3();
const localY = new THREE.Vector3();
const localZ = new THREE.Vector3();
const forwardVector = new THREE.Vector3();
const moveVelocity = new THREE.Vector3();
const angularVelocity = new THREE.Vector3();

export const useVehiclePlaneCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typePlaneTuning,
) => {
  const { world } = useRapier();

  // strict tracker for raw forward speed replicating unity cruise control
  const currentSpeedRef = useRef(0);

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

    if (
      controls.respawn ||
      chassis.translation().y < respawnValues.universalRespawnLimit
    ) {
      // execute centralized respawn logic
      respawnVehicle({
        vehicleType: "plane",
        vehicleBody: chassis,
        mode: "drive",
      });

      // kill engine momentum on respawn
      currentSpeedRef.current = 0;

      // exit the physics step early to prevent applying forces to a teleporting body
      return;
    }

    // fetch current physical state
    const pos = chassis.translation();
    const rot = chassis.rotation();
    const delta = world.timestep;

    // extract dynamic tweakpane values to perfectly emulate unity inputs
    const defaultSpeedVal = unwrapParam(tuning.defaultSpeed, 30);
    const turboSpeedVal = unwrapParam(tuning.turboSpeed, 60);
    const acceleratingVal = unwrapParam(tuning.accelerating, 10);
    const deacceleratingVal = unwrapParam(tuning.deaccelerating, 5);

    const yawSpeedVal = unwrapParam(tuning.yawSpeed, 30);
    const pitchSpeedVal = unwrapParam(tuning.pitchSpeed, 100);
    const rollSpeedVal = unwrapParam(tuning.rollSpeed, 200);

    const yawTurboMult = unwrapParam(tuning.yawTurboMultiplier, 0.3);
    const pitchTurboMult = unwrapParam(tuning.pitchTurboMultiplier, 0.5);
    const rollTurboMult = unwrapParam(tuning.rollTurboMultiplier, 1.0);

    const sideMoveVal = unwrapParam(tuning.sidewaysMovement, 15);
    const sideXRotVal = unwrapParam(tuning.sidewaysMovementXRot, 0.012);
    const sideYRotVal = unwrapParam(tuning.sidewaysMovementYRot, 1.5);
    const sideYPosVal = unwrapParam(tuning.sidewaysMovementYPos, 0.1);

    // convert angle limits strictly to radians
    const maxPitchAngleVal = unwrapParam(tuning.maxPitchAngle, 20);
    const maxRollAngleVal = unwrapParam(tuning.maxRollAngle, 20);
    const maxPitchRad = maxPitchAngleVal * (Math.PI / 180);
    const maxRollRad = maxRollAngleVal * (Math.PI / 180);

    // extract altitude limit defaulting to 500
    const altitudeLimitVal = unwrapParam(tuning.altitudeLimit, 500);

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

    // phase 1 strictly emulate unity kinematic update loop
    if (isPiloted) {
      // default target speed to whatever we are currently doing so it stays perfectly still on mount
      // eslint-disable-next-line no-useless-assignment
      let targetMaxSpeed = currentSpeedRef.current;

      let activeYawSpeed = yawSpeedVal;
      let activePitchSpeed = pitchSpeedVal;
      let activeRollSpeed = rollSpeedVal;

      // handle unity style turbo mode which overrides standard speed and rotation multipliers
      if (controls.boost) {
        targetMaxSpeed = turboSpeedVal;
        activeYawSpeed *= yawTurboMult;
        activePitchSpeed *= pitchTurboMult;
        activeRollSpeed *= rollTurboMult;
      } else if (controls.brake) {
        // anti magic suspension check
        if (pos.y < 5) {
          // we are safely on the ground allow full stop
          targetMaxSpeed = 0;
        } else {
          // we are in the sky limit air brake to 20 units roughly 72 knots
          targetMaxSpeed = 20;
        }
      } else {
        // automatically return to cruise speed if we are flying
        if (pos.y > 5) {
          targetMaxSpeed = defaultSpeedVal;
        } else {
          // stay parked if we are on the ground and not pressing anything
          targetMaxSpeed = currentSpeedRef.current;
        }
      }

      // unity cruise control acceleration loop
      if (currentSpeedRef.current < targetMaxSpeed) {
        currentSpeedRef.current += acceleratingVal * delta;
      } else if (currentSpeedRef.current > targetMaxSpeed) {
        currentSpeedRef.current -= deacceleratingVal * delta;
      }
      currentSpeedRef.current = Math.max(0, currentSpeedRef.current);

      // strictly lock flight controls if the plane is stationary
      const speedZero = currentSpeedRef.current === 0;
      // lock roll and yaw at low altitudes to prevent ground spins, but allow pitch so the plane can take off
      const rollYawLocked = speedZero || pos.y < 10; // altitude limit
      const pitchLocked = speedZero;

      // phase 2 map keyboard inputs exactly to unity axis inputs, factoring in the control locks
      const rollInput = rollYawLocked
        ? 0
        : controls.left
          ? 1
          : controls.right
            ? -1
            : 0;
      const pitchInput = pitchLocked
        ? 0
        : controls.forward
          ? -1
          : controls.backward
            ? 1
            : 0;
      const yawInput = rollYawLocked
        ? 0
        : controls.yawLeft
          ? 1
          : controls.yawRight
            ? -1
            : 0;

      // convert raw unity degrees to safe radians
      let rollRad = rollInput * activeRollSpeed * (Math.PI / 180);
      let pitchRad = pitchInput * activePitchSpeed * (Math.PI / 180);
      const yawRad = yawInput * activeYawSpeed * (Math.PI / 180);

      // phase 3 exact unity sideways force emulation
      const rollRatio = Math.sin(euler.z);
      const absRoll = Math.abs(rollRatio);

      const multXRot = sideMoveVal * sideXRotVal;
      const multYRot = sideMoveVal * sideYRotVal;
      const multYPos = sideMoveVal * sideYPosVal;

      // add the artificial unity curved flight path pitch to our raw pitch request
      pitchRad += absRoll * multXRot * activePitchSpeed * (Math.PI / 180);

      // strict angle limiters prevent mid air flips and barrel rolls
      // rubber band wall if the plane exceeds the 20 degree limit actively force the angular velocity backward
      if (euler.x > maxPitchRad && pitchRad >= 0) {
        pitchRad = -(euler.x - maxPitchRad) * 10;
      } else if (euler.x < -maxPitchRad && pitchRad <= 0) {
        pitchRad = -(euler.x + maxPitchRad) * 10;
      }

      if (euler.z > maxRollRad && rollRad >= 0) {
        rollRad = -(euler.z - maxRollRad) * 10;
      } else if (euler.z < -maxRollRad && rollRad <= 0) {
        rollRad = -(euler.z + maxRollRad) * 10;
      }

      // zero out angular velocity accumulator
      angularVelocity.set(0, 0, 0);

      // apply raw rotational speeds locally strictly protected by our limiters
      angularVelocity.addScaledVector(localZ, rollRad);
      angularVelocity.addScaledVector(localX, pitchRad);
      angularVelocity.addScaledVector(localY, yawRad);

      // sideways yaw effect forces the plane to yaw towards the bank
      angularVelocity.addScaledVector(
        localY,
        rollRatio * multYRot * (Math.PI / 180),
      );

      // zero out linear velocity accumulator
      moveVelocity.set(0, 0, 0);

      // forcefully translate forward based on unity cruise speed
      moveVelocity.addScaledVector(forwardVector, currentSpeedRef.current);

      // apply artificial slip to slowly push the plane sideways towards the roof vector when banked
      moveVelocity.addScaledVector(localY, absRoll * multYPos);

      // enforce arcade altitude limit so the plane cannot fly into space
      // zero out any upward momentum if we exceed the ceiling boundary
      if (pos.y > altitudeLimitVal && moveVelocity.y > 0) {
        moveVelocity.y = 0;
      }

      // directly set velocity bypassing rapier gravity completely
      chassis.setLinvel(moveVelocity, true);
      chassis.setAngvel(angularVelocity, true);
    } else {
      // if empty instantly clear kinematic overrides so the plane falls out of the sky naturally
      currentSpeedRef.current = 0;
    }

    // seat position and rotation socket math
    // local offset matches your constant file definition perfectly
    const localSeatOffset = new THREE.Vector3(0, 1, -7);
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
      airspeed: Math.round(currentSpeedRef.current * 3.6),
      throttle: turboSpeedVal > 0 ? currentSpeedRef.current / turboSpeedVal : 0,
      altitude: Math.round(pos.y),
      pitch: euler.x,
      roll: euler.z,
      yaw: euler.y,
      position: [pos.x, pos.y, pos.z],
      rotation: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
      seatPosition: [worldSeat.x, worldSeat.y, worldSeat.z],
      seatRotation: seatRot,
    });
  });
};
