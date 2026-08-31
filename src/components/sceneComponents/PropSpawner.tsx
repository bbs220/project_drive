import { Gltf } from "@react-three/drei";
import { propSet } from "../../utils/assetpaths";

const PropSpawner = () => {
  return (
    <mesh>
      <Gltf src={propSet.lightPool} position={[0, 0, 0]} />
    </mesh>
  );
};
export default PropSpawner;
