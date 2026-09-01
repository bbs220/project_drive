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

type TweakpaneParam<T> = {
  value: T;
  min?: number;
  max?: number;
  label?: string;
};

// UPDATED: Tuning parameters now reflect absolute speeds and angles, not forces.
export type typeHelicopterTuning = {
  verticalSpeed: number | TweakpaneParam<number>;
  forwardSpeed: number | TweakpaneParam<number>;
  strafeSpeed: number | TweakpaneParam<number>;
  yawSpeed: number | TweakpaneParam<number>;
  maxPitch: number | TweakpaneParam<number>; // in degrees
  maxRoll: number | TweakpaneParam<number>; // in degrees
  smoothing: number | TweakpaneParam<number>; // how fast the chassis snaps to target angles
  rotorSpeed: number | TweakpaneParam<number>;
  altitudeLimit: number | TweakpaneParam<number>;
};

// initialize reusable three js objects
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const targetEuler = new THREE.Euler();
const targetQuat = new THREE.Quaternion();
const yawQuat = new THREE.Quaternion();
const moveDir = new THREE.Vector3();
const globalUp = new THREE.Vector3(0, 1, 0);

export const useVehicleHelicopterCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  mainRotorRef: RefObject<THREE.Group | null>,
  tailRotorRef: RefObject<THREE.Group | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typeHelicopterTuning,
) => {
  const { world } = useRapier();

  const rpmRef = useRef(0);
  const collectiveRef = useRef(0);

  useAfterPhysicsStep(() => {
    if (!chassisRef.current || !controlsRef.current) return;

    const { active } = useVehicleStore.getState();

    const controls =
      active.control === CONTROL_STATE.HELICOPTER
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
      respawnVehicle({
        vehicleType: "helicopter",
        vehicleBody: chassis,
        mode: "drive",
      });
      rpmRef.current = 0;
      collectiveRef.current = 0;
      return;
    }

    const pos = chassis.translation();
    const rot = chassis.rotation();
    const delta = world.timestep;

    // extract dynamic tweakpane values
    const verticalSpeedVal = unwrapParam(tuning.verticalSpeed, 15);
    const forwardSpeedVal = unwrapParam(tuning.forwardSpeed, 40);
    const strafeSpeedVal = unwrapParam(tuning.strafeSpeed, 25);
    const yawSpeedVal = unwrapParam(tuning.yawSpeed, 2.5);
    const maxPitchRad = unwrapParam(tuning.maxPitch, 25) * (Math.PI / 180);
    const maxRollRad = unwrapParam(tuning.maxRoll, 25) * (Math.PI / 180);
    const smoothingVal = unwrapParam(tuning.smoothing, 5);
    const rotorSpeedVal = unwrapParam(tuning.rotorSpeed, 20);
    const altitudeLimitVal = unwrapParam(tuning.altitudeLimit, 200);

    quaternion.set(rot.x, rot.y, rot.z, rot.w);
    euler.setFromQuaternion(quaternion, "YXZ");

    const targetRpm = active.control === CONTROL_STATE.HELICOPTER ? 1 : 0;
    rpmRef.current = THREE.MathUtils.lerp(
      rpmRef.current,
      targetRpm,
      delta * 0.5,
    );

    let targetCollective = 0;
    if (controls.boost) targetCollective = 1;
    if (controls.brake) targetCollective = -1;
    collectiveRef.current = THREE.MathUtils.lerp(
      collectiveRef.current,
      targetCollective,
      delta * 4,
    );

    const extraRotorSpeed = pos.y >= 100 ? 30 : pos.y >= 10 ? 20 : 0;
    const finalRotorSpeed = rotorSpeedVal + extraRotorSpeed;

    if (mainRotorRef.current)
      mainRotorRef.current.rotateY(finalRotorSpeed * rpmRef.current * delta);
    if (tailRotorRef.current)
      tailRotorRef.current.rotateX(finalRotorSpeed * rpmRef.current * delta);

    if (rpmRef.current > 0.1) {
      // lock all cyclic and pedal controls at low altitudes to prevent ground spins and sliding
      const controlsLocked = pos.y < 30;

      // raw Input Mapping, factoring in the control locks
      const pitchInput = controlsLocked
        ? 0
        : controls.forward
          ? -1
          : controls.backward
            ? 1
            : 0; // -1 leans forward
      const rollInput = controlsLocked
        ? 0
        : controls.left
          ? 1
          : controls.right
            ? -1
            : 0; // 1 leans left
      const yawInput = controlsLocked
        ? 0
        : controls.yawLeft
          ? 1
          : controls.yawRight
            ? -1
            : 0;

      let verticalInput = collectiveRef.current;
      if (pos.y > altitudeLimitVal && verticalInput > 0) verticalInput = 0;

      // calculate Absolute Yaw
      // extract current yaw and simply add to it, ignoring angular momentum
      const targetYaw = euler.y + yawInput * yawSpeedVal * delta;

      // calculate Target Rotation (Pitch and Roll)
      // we directly set the visual lean based on input, creating an instant, snappy response
      const targetPitch = pitchInput * maxPitchRad;
      const targetRoll = rollInput * maxRollRad;

      targetEuler.set(targetPitch, targetYaw, targetRoll, "YXZ");
      targetQuat.setFromEuler(targetEuler);

      // clerp current rotation towards target to prevent instantaneous snapping
      quaternion.slerp(targetQuat, smoothingVal * delta);
      chassis.setRotation(quaternion, true);

      // calculate Absolute Linear Velocity
      // calculate movement relative to the YAW, ignoring pitch and roll so the helicopter doesn't lose altitude when leaning
      moveDir.set(
        -rollInput * strafeSpeedVal, // strafe X
        verticalInput * verticalSpeedVal, // vertical Y
        pitchInput * forwardSpeedVal, // forward Z
      );

      // apply the yaw rotation to the movement vector so W always moves "forward" relative to where the camera/heli is looking
      yawQuat.setFromAxisAngle(globalUp, targetYaw);
      moveDir.applyQuaternion(yawQuat);

      // multiply by RPM so movement completely dies if the engine is off
      moveDir.multiplyScalar(rpmRef.current);

      // override Rapier Dynamics
      // setting linear velocity directly ignores mass and gravity entirely
      chassis.setLinvel(moveDir, true);
      // zeroing out angular velocity kills any physics-induced spinning from collisions
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
    } else {
      // engine is off, let normal gravity take over but kill rotation
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    const linvel = chassis.linvel();
    const currentSpeed = Math.sqrt(
      linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z,
    );

    const localSeatOffset = new THREE.Vector3(0, -0.6, -5);
    localSeatOffset.applyQuaternion(quaternion);
    const worldSeat = new THREE.Vector3(pos.x, pos.y, pos.z).add(
      localSeatOffset,
    );

    const seatRotationOffset = new THREE.Quaternion().setFromAxisAngle(
      globalUp,
      Math.PI,
    );
    const finalSeatQuat = quaternion.clone().multiply(seatRotationOffset);

    const seatRot: [number, number, number, number] = [
      finalSeatQuat.x,
      finalSeatQuat.y,
      finalSeatQuat.z,
      finalSeatQuat.w,
    ];

    useVehicleStore.getState().updateTelemetry(ENTITY_ID.HELI_1, {
      airspeed: Math.round(currentSpeed * 3.6),
      rotorRpm: rpmRef.current,
      altitude: Math.round(pos.y),
      collective: collectiveRef.current,
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
