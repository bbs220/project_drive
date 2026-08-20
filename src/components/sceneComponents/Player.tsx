import { forwardRef, useRef } from "react";
import * as THREE from "three";
import {
  RigidBody,
  CapsuleCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import { useTweakpane } from "../../hooks/useTweakpane";
import { unwrapParam } from "../../utils/unwrapParam";
import { playerConstants, respawnValues } from "../../constants/otherConstants";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { usePlayerCreator } from "../../hooks/usePlayerCreator";

type GLTFResult = GLTF & {
  nodes: {
    base: THREE.Mesh;
    stripes: THREE.Mesh;
  };
  materials: {
    Albedo: THREE.MeshPhysicalMaterial;
    EmmissiveParts: THREE.MeshPhysicalMaterial;
  };
};

// main player component for walking around the world
const Player = forwardRef<THREE.Group>((_props, ref) => {
  // strict reference to the physics body so the hook can manipulate it
  const playerBodyRef = useRef<RapierRigidBody>(null);

  // dedicated reference purely for spinning the visual mesh independent of physics
  const visualRef = useRef<THREE.Group>(null);

  // load the model directly inside the player component
  const { nodes, materials } = useGLTF(
    "/models/player01Compressed.glb",
  ) as unknown as GLTFResult;

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
            {/* The inline model, shifted down by the capsule's half-height + radius so its feet touch the floor */}
            <group position={[0, 0, 0]} dispose={null}>
              <group name="Scene">
                <mesh
                  name="base"
                  castShadow
                  receiveShadow
                  geometry={nodes.base.geometry}
                  material={materials.Albedo}
                >
                  <mesh
                    name="stripes"
                    castShadow
                    receiveShadow
                    geometry={nodes.stripes.geometry}
                    material={materials.EmmissiveParts}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools compatibility
Player.displayName = "Player";

// preload the asset so it's ready before the component mounts
useGLTF.preload("/models/player01Compressed.glb");

export default Player;
