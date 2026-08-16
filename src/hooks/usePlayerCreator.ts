import { useAfterPhysicsStep, useRapier } from "@react-three/rapier";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import type { typeAllVehicleControls } from "./useAllVehicleInput";
import {
  useVehicleStore,
  CONTROL_STATE,
  ENTITY_ID,
} from "../stores/useVehicleStore";
import respawnVehicle from "../utils/respawnVehicle";
import { unwrapParam } from "../utils/unwrapParam";
import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";

type typePlayerTuning = {
  walkSpeed: number;
  sprintSpeed: number;
  jumpForce: number;
  gravityMultiplier: number;
};

// initialize vectors outside the loop to prevent aggressive memory leaks and stutters
const moveDir = new THREE.Vector3();
const cameraFront = new THREE.Vector3();
const cameraRight = new THREE.Vector3();
const desiredMovement = new THREE.Vector3();
const currentPosition = new THREE.Vector3();

// initialize quaternion for smooth rotational blending
const targetQuaternion = new THREE.Quaternion();

export const usePlayerCreator = (
  playerRef: RefObject<RapierRigidBody | null>,
  visualRef: RefObject<THREE.Group | null>,
  controlsRef: RefObject<typeAllVehicleControls>,
  tuning: typePlayerTuning,
) => {
  const { world } = useRapier();
  const { camera } = useThree();

  const controllerRef = useRef<KinematicCharacterController>(null);
  const verticalVelocity = useRef(0);

  useEffect(() => {
    const controller = world.createCharacterController(0.1);
    controller.setApplyImpulsesToDynamicBodies(true);
    controller.snapToGroundDistance();
    controller.setMaxSlopeClimbAngle(45 * (Math.PI / 180));

    controllerRef.current = controller;

    return () => {
      world.removeCharacterController(controller);
    };
  }, [world]);

  useAfterPhysicsStep(() => {
    if (!playerRef.current || !controlsRef.current || !controllerRef.current)
      return;

    // fetch the active ECS object from the global store
    const { active } = useVehicleStore.getState();

    // strictly check against the new ECS dictionary instead of a string
    const controls =
      active.control === CONTROL_STATE.ON_FOOT
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
            mount: false,
          };

    const playerBody = playerRef.current;
    const controller = controllerRef.current;

    if (controls.respawn) {
      respawnVehicle({
        vehicleType: "on_foot",
        vehicleBody: playerBody,
      });
      verticalVelocity.current = 0;
      return;
    }

    // kinematic movement math
    const delta = world.timestep;

    // dynamically unwrap tweakpane parameters
    const walkSpeed = unwrapParam(tuning.walkSpeed, 4);
    const sprintSpeed = unwrapParam(tuning.sprintSpeed, 8);
    const jumpForce = unwrapParam(tuning.jumpForce, 5);
    const gravityMult = unwrapParam(tuning.gravityMultiplier, 2);

    const speed = controls.boost ? sprintSpeed : walkSpeed;
    const gravity = -9.81 * gravityMult;

    camera.getWorldDirection(cameraFront);
    cameraFront.y = 0;
    cameraFront.normalize();

    cameraRight
      .crossVectors(cameraFront, new THREE.Vector3(0, 1, 0))
      .normalize();

    moveDir.set(0, 0, 0);

    // standard signs: W adds the forward vector, S subtracts it
    if (controls.forward) moveDir.add(cameraFront);
    if (controls.backward) moveDir.sub(cameraFront);

    // standard signs: D adds the right vector, A subtracts it
    if (controls.left) moveDir.sub(cameraRight);
    if (controls.right) moveDir.add(cameraRight);

    // if we are actively pressing movement keys, calculate which way the mesh should face
    if (moveDir.lengthSq() > 0 && visualRef.current) {
      // normalize the diagonal vector so we don't move too fast
      moveDir.normalize();

      // add math.pi (180 degrees) to perfectly flip the visual mesh forward
      const angle = Math.atan2(moveDir.x, moveDir.z) + Math.PI;

      // convert that angle into a quaternion on the y axis
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);

      // smoothly slerp (spherical linear interpolation) the visual mesh towards the target angle
      visualRef.current.quaternion.slerp(targetQuaternion, 0.15);

      // finally apply the speed to the normalized vector
      moveDir.multiplyScalar(speed * delta);
    }

    const isGrounded = controller.computedGrounded();

    if (isGrounded) {
      verticalVelocity.current = -0.1;

      if (controls.brake) {
        verticalVelocity.current = jumpForce;
      }
    } else {
      verticalVelocity.current += gravity * delta;
    }

    desiredMovement.copy(moveDir);
    desiredMovement.y = verticalVelocity.current * delta;

    if (playerBody.numColliders() === 0) return;
    const collider = playerBody.collider(0);

    controller.computeColliderMovement(collider, desiredMovement);

    const computedMovement = controller.computedMovement();
    currentPosition.copy(playerBody.translation() as THREE.Vector3);
    currentPosition.add(computedMovement as THREE.Vector3);

    playerBody.setNextKinematicTranslation(currentPosition);

    // push the live coordinates to the global store without causing a re-render
    useVehicleStore.getState().updateTelemetry(ENTITY_ID.PLAYER_1, {
      position: [currentPosition.x, currentPosition.y, currentPosition.z],
    });
  });
};
