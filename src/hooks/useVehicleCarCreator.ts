// import required types and hooks
import type { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import {
  type RapierRigidBody,
  useAfterPhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import type { VehicleCarControls } from "./useVehicleCarInput";
import { useCarStore } from "../stores/useVehicleStore";

// define up vector
const up = new THREE.Vector3(0, 1, 0);

// define quaternions for steering and rotation
const _wheelSteeringQuat = new THREE.Quaternion();
const _wheelRotationQuat = new THREE.Quaternion();

// define wheel info interface
export type WheelInfo = {
  axleCs: THREE.Vector3;
  suspensionRestLength: number;
  suspensionStiffness: number;
  maxSuspensionTravel: number;
  frictionSlip: number;
  sideFrictionStiffness: number;
  position: THREE.Vector3;
  radius: number;
};

// define controller tuning parameters
export type ControllerTuning = {
  engineForce: number;
  boostMultiplier: number;
  brakeForce: number;
  steeringAngle: number;
  flipImpulse: number;
};

// define vehicle controller hook
export const useVehicleCarCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  wheelsRef: RefObject<THREE.Object3D[]>,
  wheelsInfo: WheelInfo[],
  controlsRef: RefObject<VehicleCarControls>,
  tuning: ControllerTuning,
) => {
  // get rapier world
  const { world } = useRapier();

  // initialize vehicle controller ref
  const vehicleCarCreator = useRef<DynamicRayCastVehicleController | null>(
    null,
  );

  // initialize ref to store manually calculated wheel rotations
  const manualWheelRotations = useRef([0, 0, 0, 0]);

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

    // iterate through wheels and apply config
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
  }, [chassisRef, wheelsInfo, wheelsRef, world]);

  // handle physics step updates
  useAfterPhysicsStep((world) => {
    if (
      !vehicleCarCreator.current ||
      !controlsRef.current ||
      !chassisRef.current
    )
      return;

    const controller = vehicleCarCreator.current;
    const controls = controlsRef.current;
    const chassis = chassisRef.current;

    // extract current rotation quaternion
    const rot = chassis.rotation();
    const chassisQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

    // calculate local up vector to check if vehicle is flipped
    const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(chassisQuat);
    const isFlipped = localUp.y < 0.2;

    // handle gta style mid air flip recovery
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
          pitchInput * tuning.flipImpulse,
          0,
          rollInput * tuning.flipImpulse,
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

      // calculate boost multiplier using live tuning value
      const boostMultiplier = controls.boost ? tuning.boostMultiplier : 1;

      // calculate applied engine force with boost only on forward acceleration
      const currentEngineForce = controls.forward
        ? tuning.engineForce * boostMultiplier
        : controls.backward
          ? -tuning.engineForce
          : 0;

      // calculate applied steering angle
      const currentSteering = controls.left
        ? tuning.steeringAngle
        : controls.right
          ? -tuning.steeringAngle
          : 0;

      // calculate applied brake force
      const currentBrake = controls.brake ? tuning.brakeForce : 0;

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
    const linvel = chassis.linvel();
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

    // update global state store with current speed
    useCarStore.setState({ speed: speedKmh });

    // iterate through wheels to sync visual meshes
    for (const [index, wheel] of wheels.entries()) {
      const wheelAxleCs = controller.wheelAxleCs(index)!;
      const connection =
        controller.wheelChassisConnectionPointCs(index)?.y || 0;
      const suspension = controller.wheelSuspensionLength(index) || 0;
      const steering = controller.wheelSteering(index) || 0;

      // strictly force manual rotation math and invert the speed to fix backward spinning
      const angularVelocity = -(forwardSpeed / wheelsInfo[index].radius);

      // accumulate the rotation over time
      manualWheelRotations.current[index] += angularVelocity * world.timestep;

      // extract final rotation value
      const rotationRad = manualWheelRotations.current[index];

      // sync vertical position
      wheel.position.y = connection - suspension;

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
  };
};
