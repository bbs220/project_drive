import { forwardRef, useRef } from "react";
import * as THREE from "three";
import {
  RigidBody,
  CapsuleCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";
import { unwrapParam } from "../../utils/unwrapParam";
import {
  playerConstants,
  playerRespawnValues,
} from "../../constants/otherConstants";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { usePlayerCreator } from "../../hooks/usePlayerCreator";

// main player component for walking around the world
const Player = forwardRef<THREE.Group>((_props, ref) => {
  // strict reference to the physics body so the hook can manipulate it
  const playerBodyRef = useRef<RapierRigidBody>(null);

  // initialize global input listener to capture wasd and structural keys
  const controls = useAllVehicleInput();

  // attach the player physics hook to handle respawning and eventual movement
  usePlayerCreator(playerBodyRef, controls);

  // initialize tweakpane hook and store reactive parameters
  const params = useTweakpane(
    { title: "🚶 Player Tuning", expanded: false },
    playerConstants.tuning,
  );

  // extract physical dimensions using type safe utility
  const capsuleHalfHeight = unwrapParam(params.capsuleHalfHeight, 0.7);
  const capsuleRadius = unwrapParam(params.capsuleRadius, 0.3);
  const playerMass = unwrapParam(params.playerMass, 70);

  return (
    <group>
      {/* physics body with locked rotations and isolated respawn coordinates */}
      <RigidBody
        ref={playerBodyRef}
        colliders={false}
        mass={playerMass}
        canSleep={false}
        enabledRotations={[false, false, false]}
        position={playerRespawnValues.position}
        rotation={playerRespawnValues.rotation}
      >
        {/* frictionless physical representation of the character */}
        <CapsuleCollider
          args={[capsuleHalfHeight, capsuleRadius]}
          friction={0}
        />

        {/* visual elements perfectly wrapped in the forwarded ref group */}
        <group ref={ref}>
          {/* placeholder mesh matching dynamic tweakpane capsule dimensions */}
          <mesh>
            <capsuleGeometry args={[capsuleRadius, capsuleHalfHeight * 2]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools compatibility
Player.displayName = "Player";

export default Player;
