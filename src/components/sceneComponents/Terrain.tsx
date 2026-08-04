import { RigidBody } from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useTerrainCreator } from "../../hooks/useTerrainCreator";
import { terrainConstants } from "../../constants/sceneConstants";

const Terrain = () => {
  // initialize tweakpane hook for live tuning
  const params = useTweakpane("🏞️ Terrain Tuning", terrainConstants);

  // generate procedural geometry via custom hook
  const { geometry } = useTerrainCreator(params);

  return (
    // wrap in static rigid body with trimesh collider for accurate physics
    <RigidBody
      type={"fixed"}
      colliders={"trimesh"}
      friction={1}
      restitution={0}
    >
      // render the actual visual mesh
      <mesh receiveShadow geometry={geometry}>
        <meshStandardMaterial color={"#3d4a32"} />
      </mesh>
    </RigidBody>
  );
};

export default Terrain;
