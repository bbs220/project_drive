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

// define helicopter tuning parameters allowing flat numbers or tweakpane objects
export type typeHelicopterTuning = {
  liftForce: number | TweakpaneParam<number>;
  descendForce: number | TweakpaneParam<number>;
  pitchTorque: number | TweakpaneParam<number>;
  rollTorque: number | TweakpaneParam<number>;
  yawTorque: number | TweakpaneParam<number>;
  rotorSpeed: number | TweakpaneParam<number>;
  autoLevelStrength: number | TweakpaneParam<number>;
  angularDamping: number | TweakpaneParam<number>;
  altitudeLimit: number | TweakpaneParam<number>;
  maxLeanAngle: number | TweakpaneParam<number>;
};

// initialize reusable three js objects outside the loop to prevent aggressive memory leaks
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

export const useVehicleHelicopterCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  mainRotorRef: RefObject<THREE.Group | null>,
  tailRotorRef: RefObject<THREE.Group | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typeHelicopterTuning,
) => {
  const { world } = useRapier();

  // initialize refs for visual engine states
  const rpmRef = useRef(0);
  const collectiveRef = useRef(0);

  // execute logic immediately after the physics engine calculates collisions
  useAfterPhysicsStep(() => {
    // exit early if references are missing
    if (!chassisRef.current || !controlsRef.current) return;

    // fetch the active object from the global store
    const { active } = useVehicleStore.getState();

    // strictly check against the new ecs dictionary instead of a string
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

    // fetch current physical state
    const pos = chassis.translation();
    const rot = chassis.rotation();
    const linvel = chassis.linvel();
    const angvel = chassis.angvel();
    const mass = chassis.mass();
    const delta = world.timestep;

    // extract dynamic tweakpane values
    const liftForceVal = unwrapParam(tuning.liftForce, 4000);
    const descendForceVal = unwrapParam(tuning.descendForce, 2000);
    const pitchTorqueVal = unwrapParam(tuning.pitchTorque, 800);
    const rollTorqueVal = unwrapParam(tuning.rollTorque, 800);
    const yawTorqueVal = unwrapParam(tuning.yawTorque, 1200);
    const rotorSpeedVal = unwrapParam(tuning.rotorSpeed, 20);
    const autoLevelVal = unwrapParam(tuning.autoLevelStrength, 1500);
    const angularDampingVal = unwrapParam(tuning.angularDamping, 0.95);
    const altitudeLimitVal = unwrapParam(tuning.altitudeLimit, 200);

    // convert degrees to radians for raw quaternion math
    const maxLeanAngleVal = unwrapParam(tuning.maxLeanAngle, 30);
    const maxLeanRad = maxLeanAngleVal * (Math.PI / 180);

    // populate our global reusable quaternion
    quaternion.set(rot.x, rot.y, rot.z, rot.w);
    // ensure order is set so x is pitch y is yaw z is roll
    euler.setFromQuaternion(quaternion, "YXZ");

    // extract local directional axes from the quaternion
    localX.set(1, 0, 0).applyQuaternion(quaternion);
    localY.set(0, 1, 0).applyQuaternion(quaternion);
    localZ.set(0, 0, 1).applyQuaternion(quaternion);

    // handle rotor spooling based on whether a player is in the pilot seat
    const targetRpm = active.control === CONTROL_STATE.HELICOPTER ? 1 : 0;

    // smoothly lerp the rpm up or down
    rpmRef.current = THREE.MathUtils.lerp(
      rpmRef.current,
      targetRpm,
      delta * 0.5,
    );

    // handle vertical collective logic
    let targetCollective = 0;
    if (controls.boost) targetCollective = 1;
    if (controls.brake) targetCollective = -1;

    // smoothly lerp collective to prevent jerky elevation changes
    collectiveRef.current = THREE.MathUtils.lerp(
      collectiveRef.current,
      targetCollective,
      delta * 4,
    );

    // rotate visual meshes based on current rpm
    if (mainRotorRef.current) {
      mainRotorRef.current.rotateY(rotorSpeedVal * rpmRef.current * delta);
    }
    if (tailRotorRef.current) {
      // rotate x or z depending on how your tail rotor was exported
      tailRotorRef.current.rotateX(rotorSpeedVal * rpmRef.current * delta);
    }

    // only apply physics forces if the rotors are actually spinning
    if (rpmRef.current > 0.1) {
      // phase 1 lift mechanics
      // calculate baseline force needed to perfectly counteract gravity for a fake auto hover
      const gravityCounterForce = mass * 9.81;

      // calculate active lift based on player input
      let inputLift = 0;
      if (collectiveRef.current > 0) {
        inputLift = collectiveRef.current * liftForceVal;
      } else if (collectiveRef.current < 0) {
        inputLift = collectiveRef.current * descendForceVal;
      }

      // arcade soft ceiling altitude limiter
      if (pos.y > altitudeLimitVal) {
        // instantly kill upward input lift so the player cannot climb further
        if (inputLift > 0) inputLift = 0;

        // if the helicopter is still moving up apply drag strictly against upward velocity
        // this prevents the bouncy rubber band effect by never pushing the helicopter down
        if (linvel.y > 0) {
          inputLift -= linvel.y * mass * 10;
        }
      }

      // combine forces multiply by rpm so you drop like a rock if the engine cuts and apply locally upward
      const totalLift = (gravityCounterForce + inputLift) * rpmRef.current;
      forceVector.copy(localY).multiplyScalar(totalLift * delta);

      chassis.applyImpulse(forceVector, true);

      // phase 2 rotational mechanics
      // calculate raw input axis limits
      // pitch uses w and s to lean forward and backward inverted by flipping the 1 and negative 1
      let pitchInput = controls.forward ? -1 : controls.backward ? 1 : 0;
      // roll uses a and d to lean left and right
      let rollInput = controls.left ? 1 : controls.right ? -1 : 0;
      // yaw uses special keys to spin the tail
      const yawInput = controls.yawLeft ? 1 : controls.yawRight ? -1 : 0;

      // arcade angle limiter
      // if the helicopter exceeds the lean limit zero out any inputs trying to push it further
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
      stabilizeTorque.addScaledVector(
        localZ,
        rollInput * rollTorqueVal * delta,
      );
      stabilizeTorque.addScaledVector(localY, yawInput * yawTorqueVal * delta);

      // phase 3 arcade auto leveler
      // if the player is not actively trying to lean twist the helicopter back upright
      if (pitchInput === 0 && rollInput === 0) {
        // cross product finds the exact rotational axis needed to push local y towards global y
        dampingTorque
          .crossVectors(localY, globalUp)
          .multiplyScalar(autoLevelVal * delta);
        stabilizeTorque.add(dampingTorque);
      }

      // phase 4 manual angular damping
      // fight the current angular velocity so the helicopter does not swing wildly like a pendulum
      stabilizeTorque.x -= angvel.x * angularDampingVal * mass * delta;
      stabilizeTorque.y -= angvel.y * angularDampingVal * mass * delta;
      stabilizeTorque.z -= angvel.z * angularDampingVal * mass * delta;

      // apply accumulated torques to the rigid body
      chassis.applyTorqueImpulse(stabilizeTorque, true);
    }

    // calculate current true speed
    const currentSpeed = Math.sqrt(
      linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z,
    );

    // seat position and rotation socket math
    // define local offset for the pilot seat tweak these to perfectly align the pink capsule
    const localSeatOffset = new THREE.Vector3(0, 1, -4);
    localSeatOffset.applyQuaternion(quaternion);
    const worldSeat = new THREE.Vector3(pos.x, pos.y, pos.z).add(
      localSeatOffset,
    );

    // format strict rotation array for the player hook to consume
    const seatRot: [number, number, number, number] = [
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w,
    ];

    // always broadcast full telemetry so UI and mount systems function properly
    useVehicleStore.getState().updateTelemetry(ENTITY_ID.HELI_1, {
      airspeed: Math.round(currentSpeed * 3.6),
      rotorRpm: rpmRef.current,
      altitude: Math.round(pos.y),
      collective: collectiveRef.current,
      pitch: euler.x,
      roll: euler.z,
      yaw: euler.y,
      position: [pos.x, pos.y, pos.z],
      seatPosition: [worldSeat.x, worldSeat.y, worldSeat.z],
      seatRotation: seatRot,
    });
  });
};
