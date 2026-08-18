import { forwardRef, useRef } from "react";
import * as THREE from "three";
import {
  RigidBody,
  CapsuleCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";
import { unwrapParam } from "../../utils/unwrapParam";
import { playerConstants, respawnValues } from "../../constants/otherConstants";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { usePlayerCreator } from "../../hooks/usePlayerCreator";

// main player component for walking around the world
const Player = forwardRef<THREE.Group>((_props, ref) => {
  // strict reference to the physics body so the hook can manipulate it
  const playerBodyRef = useRef<RapierRigidBody>(null);

  // dedicated reference purely for spinning the visual mesh independent of physics
  const visualRef = useRef<THREE.Group>(null);

  // initialize global input listener to capture wasd and structural keys
  const controls = useAllVehicleInput();

  // initialize tweakpane hook and store reactive parameters
  const params = useTweakpane(
    { title: "🚶 Player Tuning", expanded: false },
    playerConstants.tuning,
  );

  // attach the player physics hook and pass in the params and visual ref
  usePlayerCreator(playerBodyRef, visualRef, controls, params);

  // extract physical dimensions using type safe utility
  const capsuleHalfHeight = unwrapParam(params.capsuleHalfHeight, 0.7);
  const capsuleRadius = unwrapParam(params.capsuleRadius, 0.3);
  const playerMass = unwrapParam(params.playerMass, 70);

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
            {/* placeholder mesh matching dynamic tweakpane capsule dimensions */}
            <mesh>
              <capsuleGeometry args={[capsuleRadius, capsuleHalfHeight * 2]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>

            {/* neon cyan visor/nose to clearly indicate the forward facing direction */}
            <mesh
              position={[0, capsuleHalfHeight * 0.5, -(capsuleRadius + 0.1)]}
            >
              <boxGeometry args={[0.4, 0.15, 0.3]} />
              <meshStandardMaterial color="cyan" />
            </mesh>
          </group>
        </group>
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools compatibility
Player.displayName = "Player";

export default Player;
