import { RigidBody } from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useTerrainCreator } from "../../hooks/useTerrainCreator";
import Grass from "./Grass";
import { terrainConstants } from "../../constants/sceneConstants";

const Terrain = () => {
  // initialize tweakpane hook for live tuning
  const params = useTweakpane(
    { title: "🏞️ Terrain Tuning", expanded: false },
    terrainConstants,
  );

  // generate procedural geometry via custom hook
  const { geometry } = useTerrainCreator(params);

  return (
    <group>
      {/* // wrap in static rigid body with trimesh collider for accurate physics */}
      <RigidBody
        type={"fixed"}
        colliders={"trimesh"}
        friction={1}
        restitution={0}
      >
        {/* // render the actual visual terrain mesh */}
        <mesh receiveShadow geometry={geometry}>
          <meshStandardMaterial color={"#06402B"} />
        </mesh>
      </RigidBody>
      {/* // render procedural grass overlay */}
      <Grass params={params} />
    </group>
  );
};

export default Terrain;
