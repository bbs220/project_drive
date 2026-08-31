import { forwardRef, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import {
  RigidBody,
  CapsuleCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { GLTF } from "three-stdlib";
import { useTweakpane } from "../../hooks/useTweakpane";
import { unwrapParam } from "../../utils/unwrapParam";
import { playerConstants, respawnValues } from "../../constants/otherConstants";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { usePlayerCreator } from "../../hooks/usePlayerCreator";
import { useVehicleStore, ENTITY_ID } from "../../stores/useVehicleStore";

// action names exported from blender
type ActionName =
  | "Cheering"
  | "Clapping"
  | "CrossJumps"
  | "DancingTwerk"
  | "Driving"
  | "EnteringCar"
  | "Excited"
  | "ExitingCar"
  | "Falling"
  | "FastRun"
  | "Idle"
  | "Jump"
  | "KipUp"
  | "LayingIdle"
  | "LeftTurn"
  | "RightTurn"
  | "Sitting"
  | "Walking";

// create a strict interface extending three animation clip
interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

// extend gltf result to include skinned meshes and typed animations
type GLTFResult = GLTF & {
  nodes: {
    base: THREE.SkinnedMesh;
    stripes: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    Albedo: THREE.MeshPhysicalMaterial;
    EmmissiveParts: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

// main player component for walking around the world
const Player = forwardRef<THREE.Group>((_props, ref) => {
  // strict reference to the physics body so the hook can manipulate it
  const playerBodyRef = useRef<RapierRigidBody>(null);

  // dedicated reference purely for spinning the visual mesh independent of physics
  const visualRef = useRef<THREE.Group>(null);

  // load the model and typed animations directly inside the player component
  const { nodes, materials, animations } = useGLTF(
    "/models/player01CompressedAnimated.glb",
  ) as unknown as GLTFResult;

  // initialize the animation hook bound to the visual ref
  const { actions } = useAnimations(animations, visualRef);

  // initialize global input listener to capture wasd and structural keys
  const controls = useAllVehicleInput();

  // initialize tweakpane hook and store reactive parameters
  const params = useTweakpane(
    { title: "🚶 Player Tuning", expanded: false },
    playerConstants.tuning,
  );

  // extract physical dimensions using type safe utility
  const capsuleHalfHeight = unwrapParam(params.capsuleHalfHeight, 0.7);
  const capsuleRadius = unwrapParam(params.capsuleRadius, 0.3);
  const playerMass = unwrapParam(params.playerMass, 70);

  // extract emission settings
  const emissionColor = unwrapParam(params.emissionColor, "#ffffff");
  const emissionStrength = unwrapParam(params.emissionStrength, 1);

  // extract debug booleans
  const debugBones = unwrapParam(params.debugBones, false);
  const debugMesh = unwrapParam(params.debugMesh, false);

  // state to hold the dynamically generated skeleton helper
  const [skeletonHelper, setSkeletonHelper] =
    useState<THREE.SkeletonHelper | null>(null);

  // attach the player physics hook and pass in the params and visual ref
  usePlayerCreator(playerBodyRef, visualRef, controls, params);

  // animation controller
  // Keep track of the currently playing animation to handle crossfades
  const currentAnim = useRef<ActionName>("Idle");

  // safely play the idle animation on mount
  useEffect(() => {
    if (actions.Idle) {
      actions.Idle.reset().fadeIn(0.2).play();
    }
  }, [actions]);

  // high-performance loop to poll telemetry and switch animations
  useFrame(() => {
    const telemetry = useVehicleStore.getState().telemetry[ENTITY_ID.PLAYER_1];
    if (!telemetry) return;

    const { speed, isGrounded } = telemetry;
    const currentY = playerBodyRef.current?.translation().y || 0;

    // derived animation state
    let nextAnim: ActionName = "Idle";

    if (!isGrounded) {
      if (currentY > 1.4) {
        nextAnim = "Falling"; // airborne above standard jump height triggers falling
      } else {
        nextAnim = "Jump"; // airborne overrides all ground movement
      }
    } else if (speed > 4.5) {
      nextAnim = "FastRun"; // greater than walkSpeed triggers sprint
    } else if (speed > 0.1) {
      nextAnim = "Walking"; // slight movement triggers walking
    }

    // If the required animation has changed, execute a smooth crossfade
    if (nextAnim !== currentAnim.current) {
      const prevAction = actions[currentAnim.current];
      const nextAction = actions[nextAnim];

      if (prevAction) {
        prevAction.fadeOut(0.2);
      }
      if (nextAction) {
        nextAction.reset().fadeIn(0.2).play();
      }

      currentAnim.current = nextAnim;
    }
  });

  // dynamically toggle wireframe directly on the shared materials
  useEffect(() => {
    materials.Albedo.wireframe = debugMesh;
    materials.EmmissiveParts.wireframe = debugMesh;

    // apply tweakpane emission settings to the stripes material
    materials.EmmissiveParts.emissive.set(emissionColor);
    materials.EmmissiveParts.emissiveIntensity = emissionStrength;

    materials.Albedo.needsUpdate = true;
    materials.EmmissiveParts.needsUpdate = true;
  }, [debugMesh, emissionColor, emissionStrength, materials]);

  // generate the skeleton helper targeting the root bone directly
  useEffect(() => {
    if (!debugBones) return;

    // pass the root hip bone so it traverses down the entire skeleton
    const helper = new THREE.SkeletonHelper(nodes.mixamorigHips);
    setSkeletonHelper(helper);

    // clean up memory when toggled off
    return () => {
      helper.dispose();
      setSkeletonHelper(null);
    };
  }, [debugBones, nodes.mixamorigHips]);

  return (
    <group>
      {/* physics body with locked rotations and isolated respawn coordinates */}
      <RigidBody
        ref={playerBodyRef}
        type="kinematicPosition"
        colliders={false}
        mass={playerMass}
        canSleep={false}
        enabledRotations={[false, false, false]}
        position={respawnValues.drive.player.position}
        rotation={respawnValues.drive.player.rotation}
      >
        {/* frictionless physical representation of the character */}
        <CapsuleCollider
          args={[capsuleHalfHeight, capsuleRadius]}
          friction={0}
        />

        {/* the outer group handles the camera targeting so the camera doesn't spin wildly */}
        <group ref={ref}>
          {/* the inner group handles the smooth visual rotation from the physics hook */}
          <group ref={visualRef}>
            {/* shift the inline model down by capsule bounds so feet touch the floor */}
            <group
              position={[0, -(capsuleHalfHeight + capsuleRadius), 0]}
              rotation={[0, Math.PI, 0]}
              dispose={null}
            >
              <group name="Scene">
                {/* scale mixamo rigs down to match standard blender units */}
                <group name="Armature" scale={0.01}>
                  <skinnedMesh
                    name="base"
                    castShadow
                    receiveShadow
                    geometry={nodes.base.geometry}
                    material={materials.Albedo}
                    skeleton={nodes.base.skeleton}
                  />
                  <skinnedMesh
                    name="stripes"
                    castShadow
                    receiveShadow
                    geometry={nodes.stripes.geometry}
                    material={materials.EmmissiveParts}
                    skeleton={nodes.stripes.skeleton}
                  />
                  {/* inject the root bone primitive required for animations */}
                  <primitive object={nodes.mixamorigHips} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </RigidBody>
      {/* prevents the double-transform trap so it maps perfectly 1:1 with the world */}
      {skeletonHelper && <primitive object={skeletonHelper} />}
    </group>
  );
});

// assign display name for react devtools compatibility
Player.displayName = "Player";

// preload the asset so it's ready before the component mounts
useGLTF.preload("/models/player01CompressedAnimated.glb");

export default Player;
