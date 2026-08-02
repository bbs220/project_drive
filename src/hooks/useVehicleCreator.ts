import type { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import {
  type RapierRigidBody,
  useAfterPhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import type { VehicleControls } from "./useVehicleInput";

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
  brakeForce: number;
  steeringAngle: number;
};

// define vehicle controller hook
export const useVehicleCreator = (
  chassisRef: RefObject<RapierRigidBody | null>,
  wheelsRef: RefObject<THREE.Object3D[]>,
  wheelsInfo: WheelInfo[],
  controlsRef: RefObject<VehicleControls>,
  tuning: ControllerTuning,
) => {
  // get rapier world
  const { world } = useRapier();

  // initialize vehicle controller ref
  const vehicleCreator = useRef<DynamicRayCastVehicleController | null>(null);

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
    vehicleCreator.current = vehicle;

    // cleanup on unmount
    return () => {
      vehicleCreator.current = null;
      world.removeVehicleController(vehicle);
    };
  }, [chassisRef, wheelsInfo, wheelsRef, world]);

  // handle physics step updates
  useAfterPhysicsStep((world) => {
    if (!vehicleCreator.current || !controlsRef.current) return;

    const controller = vehicleCreator.current;
    const controls = controlsRef.current;

    // calculate applied engine force
    const currentEngineForce = controls.forward
      ? tuning.engineForce
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

    // update vehicle forces
    controller.updateVehicle(world.timestep);

    const { current: wheels } = wheelsRef;

    // iterate through wheels to sync visual meshes
    for (const [index, wheel] of wheels.entries()) {
      const wheelAxleCs = controller.wheelAxleCs(index)!;
      const connection =
        controller.wheelChassisConnectionPointCs(index)?.y || 0;
      const suspension = controller.wheelSuspensionLength(index) || 0;
      const steering = controller.wheelSteering(index) || 0;
      const rotationRad = controller.wheelRotation(index) || 0;

      // sync vertical position
      wheel.position.y = connection - suspension;

      // apply steering and rotation quaternions
      _wheelSteeringQuat.setFromAxisAngle(up, steering);
      _wheelRotationQuat.setFromAxisAngle(wheelAxleCs, rotationRad);

      // combine quaternions onto wheel
      wheel.quaternion.multiplyQuaternions(
        _wheelSteeringQuat,
        _wheelRotationQuat,
      );
    }
  });

  return {
    vehicleCreator,
  };
};
