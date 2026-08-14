import type { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import {
  type RapierRigidBody,
  useAfterPhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { type RefObject, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import { useVehicleStore } from "../stores/useVehicleStore";
import respawnVehicle from "../utils/respawnVehicle";

// define up vector
const up = new THREE.Vector3(0, 1, 0);

// define quaternions for steering and rotation
const _wheelSteeringQuat = new THREE.Quaternion();
const _wheelRotationQuat = new THREE.Quaternion();

// define wheel info structure
export type typeWheelInfo = {
  axleCs: THREE.Vector3;
  suspensionRestLength: number;
  suspensionStiffness: number;
  maxSuspensionTravel: number;
  frictionSlip: number;
  sideFrictionStiffness: number;
  position: THREE.Vector3;
  radius: number;
};

// define Tweakpane parameter descriptor type structure
type TweakpaneParam<T> = {
  value: T;
  min?: number;
  max?: number;
  label?: string;
};

// define controller tuning parameters allowing flat numbers or Tweakpane objects
export type typeCarTuning = {
  engineForce: number | TweakpaneParam<number>;
  boostMultiplier: number | TweakpaneParam<number>;
  brakeForce: number | TweakpaneParam<number>;
  steeringAngle: number | TweakpaneParam<number>;
  flipImpulse: number | TweakpaneParam<number>;
  maxSpeed: number | TweakpaneParam<number>;
  wheelPosX: number | TweakpaneParam<number>;
  wheelPosY: number | TweakpaneParam<number>;
  frontWheelPosZ: number | TweakpaneParam<number>;
  rearWheelPosZ: number | TweakpaneParam<number>;
  wheelRadius: number | TweakpaneParam<number>;
  suspensionRestLength: number | TweakpaneParam<number>;
  suspensionStiffness: number | TweakpaneParam<number>;
  maxSuspensionTravel: number | TweakpaneParam<number>;
  frictionSlip: number | TweakpaneParam<number>;
  sideFrictionStiffness: number | TweakpaneParam<number>;
};

// helper to safely extract numeric value whether passed raw or as a Tweakpane object
const getValue = (
  param: number | TweakpaneParam<number> | undefined,
  fallback: number = 0,
): number => {
  if (param === undefined) return fallback;
  return typeof param === "object" && param !== null && "value" in param
    ? param.value
    : (param as number);
};

// define vehicle controller hook
export const useVehicleCarCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  wheelsRef: RefObject<THREE.Object3D[]>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typeCarTuning,
) => {
  // get rapier world
  const { world } = useRapier();

  // initialize vehicle controller ref
  const vehicleCarCreator = useRef<DynamicRayCastVehicleController | null>(
    null,
  );

  // initialize ref to store manually calculated wheel rotations
  const manualWheelRotations = useRef([0, 0, 0, 0]);

  // dynamically generate wheel positions and physics info
  const wheelsInfo = useMemo<typeWheelInfo[]>(() => {
    const x = getValue(tuning.wheelPosX, 0.8);
    const y = getValue(tuning.wheelPosY, 0.2);
    const frontZ = getValue(tuning.frontWheelPosZ, 1.2);
    const rearZ = getValue(tuning.rearWheelPosZ, -1.2);
    const radius = getValue(tuning.wheelRadius, 0.35);
    const suspensionRestLength = getValue(tuning.suspensionRestLength, 0.125);
    const suspensionStiffness = getValue(tuning.suspensionStiffness, 24);
    const maxSuspensionTravel = getValue(tuning.maxSuspensionTravel, 1);
    const frictionSlip = getValue(tuning.frictionSlip, 1.5);
    const sideFrictionStiffness = getValue(tuning.sideFrictionStiffness, 3);
    const axleCs = new THREE.Vector3(-1, 0, 0);

    return [
      {
        position: new THREE.Vector3(-x, y, frontZ),
        axleCs,
        radius,
        suspensionRestLength,
        suspensionStiffness,
        maxSuspensionTravel,
        frictionSlip,
        sideFrictionStiffness,
      }, // front left
      {
        position: new THREE.Vector3(x, y, frontZ),
        axleCs,
        radius,
        suspensionRestLength,
        suspensionStiffness,
        maxSuspensionTravel,
        frictionSlip,
        sideFrictionStiffness,
      }, // front right
      {
        position: new THREE.Vector3(-x, y, rearZ),
        axleCs,
        radius,
        suspensionRestLength,
        suspensionStiffness,
        maxSuspensionTravel,
        frictionSlip,
        sideFrictionStiffness,
      }, // rear left
      {
        position: new THREE.Vector3(x, y, rearZ),
        axleCs,
        radius,
        suspensionRestLength,
        suspensionStiffness,
        maxSuspensionTravel,
        frictionSlip,
        sideFrictionStiffness,
      }, // rear right
    ];
  }, [
    tuning.wheelPosX,
    tuning.wheelPosY,
    tuning.frontWheelPosZ,
    tuning.rearWheelPosZ,
    tuning.wheelRadius,
    tuning.suspensionRestLength,
    tuning.suspensionStiffness,
    tuning.maxSuspensionTravel,
    tuning.frictionSlip,
    tuning.sideFrictionStiffness,
  ]);

  // handle vehicle mount and unmount
  useEffect(() => {
    const { current: chassis } = chassisRef;
    const { current: wheels } = wheelsRef;

    // exit early if missing refs
    if (!chassis || !wheels) return;

    // create vehicle controller instance
    const vehicle = world.createVehicleController(chassis);

    // define downward suspension direction
    const suspensionDirection = new THREE.Vector3(0, -1, 0);

    // iterate through locally calculated wheels array and apply config
    for (const [index, wheel] of wheelsInfo.entries()) {
      vehicle.addWheel(
        wheel.position,
        suspensionDirection,
        wheel.axleCs,
        wheel.suspensionRestLength,
        wheel.radius,
      );
      vehicle.setWheelSuspensionStiffness(index, wheel.suspensionStiffness);
      vehicle.setWheelMaxSuspensionTravel(index, wheel.maxSuspensionTravel);
      vehicle.setWheelFrictionSlip(index, wheel.frictionSlip);
      vehicle.setWheelSideFrictionStiffness(index, wheel.sideFrictionStiffness);
    }

    // assign to ref
    vehicleCarCreator.current = vehicle;

    // cleanup on unmount
    return () => {
      vehicleCarCreator.current = null;
      world.removeVehicleController(vehicle);
    };
  }, [chassisRef, wheelsInfo, wheelsRef, world]); // remounts physics wheels dynamically if tweakpane updates

  // handle physics step updates
  useAfterPhysicsStep((world) => {
    if (
      !vehicleCarCreator.current ||
      !controlsRef.current ||
      !chassisRef.current
    )
      return;

    const controller = vehicleCarCreator.current;
    const chassis = chassisRef.current;

    // extract current dynamic values safely
    const flipImpulseVal = getValue(tuning.flipImpulse, 0.5);
    const engineForceVal = getValue(tuning.engineForce, 5);
    const boostMultiplierVal = getValue(tuning.boostMultiplier, 2.5);
    const maxSpeedVal = getValue(tuning.maxSpeed, 88);
    const steeringAngleVal = getValue(tuning.steeringAngle, 0.5);
    const brakeForceVal = getValue(tuning.brakeForce, 2);

    // check global store to see if player is actively controlling the car
    const { activeControl } = useVehicleStore.getState();

    // intercept controls to apply parking brake and ignore inputs if player is in another vehicle
    const controls =
      activeControl === "car"
        ? controlsRef.current
        : {
            forward: false,
            backward: false,
            left: false,
            right: false,
            brake: true,
            boost: false,
            yawLeft: false,
            yawRight: false,
            respawn: false,
          };

    // manual respawn trigger
    if (controls.respawn) {
      // execute centralized respawn logic
      respawnVehicle({
        vehicleType: "car",
        vehicleBody: chassis,
      });

      // exit the physics step early to prevent applying forces to a teleporting body
      return;
    }

    // extract current rotation quaternion and linear velocity
    const rot = chassis.rotation();
    const chassisQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    const linvel = chassis.linvel();

    // calculate local up vector to check if vehicle is flipped
    const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(chassisQuat);
    const isFlipped = localUp.y < 0.2;

    // handle mid air flip recovery
    if (isFlipped) {
      // zero out engine and steering to prevent weird wheel behavior while flipped
      controller.setWheelEngineForce(2, 0);
      controller.setWheelEngineForce(3, 0);
      controller.setWheelSteering(0, 0);
      controller.setWheelSteering(1, 0);
      controller.setWheelBrake(0, 0);
      controller.setWheelBrake(1, 0);
      controller.setWheelBrake(2, 0);
      controller.setWheelBrake(3, 0);

      // calculate raw rotational inputs
      const rollInput = controls.left ? -1 : controls.right ? 1 : 0;
      const pitchInput = controls.forward ? 1 : controls.backward ? -1 : 0;

      // apply torque impulse if user is pressing keys
      if (rollInput !== 0 || pitchInput !== 0) {
        // create a torque vector based on tuning input
        const localTorque = new THREE.Vector3(
          pitchInput * flipImpulseVal,
          0,
          rollInput * flipImpulseVal,
        );

        // convert local torque to world space so it rolls intuitively
        const worldTorque = localTorque.applyQuaternion(chassisQuat);

        // apply the actual rotational bounce impulse to the chassis
        chassis.applyTorqueImpulse(
          { x: worldTorque.x, y: worldTorque.y, z: worldTorque.z },
          true,
        );
      }
    } else {
      // normal driving physics when wheels are down

      // calculate three dimensional velocity magnitude
      const currentSpeed = Math.sqrt(
        linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z,
      );

      // calculate boost multiplier using live tuning value
      const boostMultiplier = controls.boost ? boostMultiplierVal : 1;

      // calculate applied engine force with boost only on forward acceleration
      let currentEngineForce = controls.forward
        ? engineForceVal * boostMultiplier
        : controls.backward
          ? -engineForceVal
          : 0;

      // fallback speed
      const safeMaxSpeed = maxSpeedVal || 50;

      // engine governor overrides throttle if vehicle exceeds maximum procedural safe speed
      if (currentSpeed >= safeMaxSpeed && controls.forward) {
        currentEngineForce = 0;
      }

      // calculate applied steering angle
      const currentSteering = controls.left
        ? steeringAngleVal
        : controls.right
          ? -steeringAngleVal
          : 0;

      // calculate applied brake force
      const currentBrake = controls.brake ? brakeForceVal : 0;

      // apply engine force to rear wheels
      controller.setWheelEngineForce(2, currentEngineForce);
      controller.setWheelEngineForce(3, currentEngineForce);

      // apply steering to front wheels
      controller.setWheelSteering(0, currentSteering);
      controller.setWheelSteering(1, currentSteering);

      // apply brakes to all wheels
      controller.setWheelBrake(0, currentBrake);
      controller.setWheelBrake(1, currentBrake);
      controller.setWheelBrake(2, currentBrake);
      controller.setWheelBrake(3, currentBrake);
    }

    // update vehicle forces
    controller.updateVehicle(world.timestep);

    const { current: wheels } = wheelsRef;

    // calculate exact forward speed of the car for forced manual rotation
    const velocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);

    // determine forward direction vector based on chassis rotation
    const forwardVector = new THREE.Vector3(0, 0, 1).applyQuaternion(
      chassisQuat,
    );
    const forwardSpeed = velocity.dot(forwardVector);

    // calculate two dimensional ground speed ignoring vertical falling
    const groundSpeedMs = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);

    // convert meters per second to kilometers per hour
    const speedKmh = Math.round(groundSpeedMs * 3.6);

    // only update global state if car is actively being driven to save performance
    if (activeControl === "car") {
      useVehicleStore.getState().setCarTelemetry({ speed: speedKmh });
    }

    // iterate through wheels to sync visual meshes
    for (const [index, wheel] of wheels.entries()) {
      const wheelAxleCs = controller.wheelAxleCs(index)!;
      // Get the full 3D connection point from the physics engine
      const connection = controller.wheelChassisConnectionPointCs(index)!;
      const suspension = controller.wheelSuspensionLength(index) || 0;
      const steering = controller.wheelSteering(index) || 0;

      // strictly force manual rotation math and invert the speed to fix backward spinning
      const angularVelocity = -(forwardSpeed / wheelsInfo[index].radius);

      // accumulate the rotation over time
      manualWheelRotations.current[index] += angularVelocity * world.timestep;

      // extract final rotation value
      const rotationRad = manualWheelRotations.current[index];

      // sync X, Y, and Z positions directly from engine calculations
      wheel.position.set(connection.x, connection.y - suspension, connection.z);

      // convert raw rapier object to three vector safely
      const axleVector = new THREE.Vector3(
        wheelAxleCs.x,
        wheelAxleCs.y,
        wheelAxleCs.z,
      );

      // apply steering and rotation quaternions
      _wheelSteeringQuat.setFromAxisAngle(up, steering);
      _wheelRotationQuat.setFromAxisAngle(axleVector, rotationRad);

      // combine quaternions onto wheel
      wheel.quaternion.multiplyQuaternions(
        _wheelSteeringQuat,
        _wheelRotationQuat,
      );
    }
  });

  return {
    vehicleCarCreator,
    wheelsInfo,
  };
};
