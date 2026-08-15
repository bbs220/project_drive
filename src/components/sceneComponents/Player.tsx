import { forwardRef } from "react";
import * as THREE from "three";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";
import { unwrapParam } from "../../utils/unwrapParam";
import {
  playerConstants,
  playerRespawnValues,
} from "../../constants/otherConstants";

// main player component for walking around the world
const Player = forwardRef<THREE.Group>((_props, ref) => {
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
