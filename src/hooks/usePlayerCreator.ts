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
import { respawnValues } from "../constants/otherConstants";

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
const defaultPlayerQuat = new THREE.Quaternion();
const playerPosArr: [number, number, number] = [0, 0, 0];
const playerRotArr: [number, number, number, number] = [0, 0, 0, 1];

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

  // locally track if we were in a vehicle last frame to handle safe dismount teleportation
  const wasMounted = useRef(false);

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

    // fetch the active ecs object and telemetry dictionary from the global store
    const { active, telemetry } = useVehicleStore.getState();
    const playerBody = playerRef.current;
    const controller = controllerRef.current;

    // phase 1 mounted we are driving a vehicle
    if (active.control !== CONTROL_STATE.PLAYER) {
      wasMounted.current = true;

      // ensure visual mesh stays visible so we can see the player in the driver seat
      if (visualRef.current) visualRef.current.visible = true;

      const activeVehicleData = telemetry[active.entity];

      if (
        activeVehicleData &&
        "seatPosition" in activeVehicleData &&
        "seatRotation" in activeVehicleData
      ) {
        // apply position to the physics body
        currentPosition.set(
          activeVehicleData.seatPosition[0],
          activeVehicleData.seatPosition[1],
          activeVehicleData.seatPosition[2],
        );
        playerBody.setNextKinematicTranslation(currentPosition);

        // apply dynamic world rotation only to the physics body
        targetQuaternion.set(
          activeVehicleData.seatRotation[0],
          activeVehicleData.seatRotation[1],
          activeVehicleData.seatRotation[2],
          activeVehicleData.seatRotation[3],
        );
        playerBody.setNextKinematicRotation(targetQuaternion);

        // hardcode the visual mesh local rotation to prevent double spinning
        if (visualRef.current) {
          // flip the player 180 degrees on the y axis to align with the car forward
          visualRef.current.rotation.set(0, Math.PI, 0);
        }

        // sync complete telemetry to the seat so the store always knows where we are
        useVehicleStore.getState().updateTelemetry(ENTITY_ID.PLAYER_1, {
          position: [currentPosition.x, currentPosition.y, currentPosition.z],
          rotation: [
            targetQuaternion.x,
            targetQuaternion.y,
            targetQuaternion.z,
            targetQuaternion.w,
          ],
          speed: 0, // player is idle
          isGrounded: true,
        });
      }

      // exit early so wasd does not apply walking math while driving
      return;
    }

    // phase 2 unmount resolution we just exited a vehicle
    if (wasMounted.current) {
      wasMounted.current = false;

      // the mount system pre loaded the player telemetry with a safe exit coordinate
      const exitPos = telemetry[ENTITY_ID.PLAYER_1].position;

      // instantly snap the player to the street next to the car
      currentPosition.set(exitPos[0], exitPos[1], exitPos[2]);
      // force reset the physics body rotation so visual walk math aligns with the world again
      playerBody.setNextKinematicRotation({ x: 0, y: 0, z: 0, w: 1 });

      // instantly untwist the visual mesh so you do not stand backward on the street
      if (visualRef.current) {
        visualRef.current.rotation.set(0, 0, 0);
      }

      // exit early this frame to let rapier cleanly resolve the teleport
      return;
    }

    // phase 3 player standard walking physics
    // assign controls directly since we verified we are player in phase 1
    const controls = controlsRef.current;

    if (controls.respawn) {
      respawnVehicle({
        vehicleType: "player",
        vehicleBody: playerBody,
        mode: "drive",
      });
      verticalVelocity.current = 0;
      return;
    }

    if (playerBody.translation().y < respawnValues.universalRespawnLimit) {
      respawnVehicle({
        vehicleType: "player",
        vehicleBody: playerBody,
        mode: "drive",
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

    // standard signs w adds the forward vector s subtracts it
    if (controls.forward) moveDir.add(cameraFront);
    if (controls.backward) moveDir.sub(cameraFront);

    // standard signs d adds the right vector a subtracts it
    if (controls.left) moveDir.sub(cameraRight);
    if (controls.right) moveDir.add(cameraRight);

    // track whether the player is actually actively moving for telemetry
    const isMoving = moveDir.lengthSq() > 0;

    // if we are actively pressing movement keys calculate which way the mesh should face
    if (isMoving && visualRef.current) {
      // normalize the diagonal vector so we do not move too fast
      moveDir.normalize();

      // add math pi 180 degrees to perfectly flip the visual mesh forward
      const angle = Math.atan2(moveDir.x, moveDir.z) + Math.PI;

      // convert that angle into a quaternion on the y axis
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);

      // smoothly slerp spherical linear interpolation the visual mesh towards the target angle
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

    // aggressively lock the physics capsule rotation to zero every frame so local space matches world space
    playerBody.setNextKinematicRotation({ x: 0, y: 0, z: 0, w: 1 });

    // safely extract the raw quaternion array directly from the visual mesh
    const quat = visualRef.current?.quaternion || defaultPlayerQuat;

    // actual movement speed (returns 0 if standing still, otherwise walk or sprint speed)
    const actualSpeed = isMoving ? speed : 0;

    playerPosArr[0] = currentPosition.x;
    playerPosArr[1] = currentPosition.y;
    playerPosArr[2] = currentPosition.z;

    playerRotArr[0] = quat.x;
    playerRotArr[1] = quat.y;
    playerRotArr[2] = quat.z;
    playerRotArr[3] = quat.w;

    // push the completely updated live telemetry to the global store!
    useVehicleStore.getState().updateTelemetry(ENTITY_ID.PLAYER_1, {
      position: playerPosArr,
      rotation: playerRotArr,
      speed: actualSpeed,
      isGrounded: isGrounded,
    });
  });
};
