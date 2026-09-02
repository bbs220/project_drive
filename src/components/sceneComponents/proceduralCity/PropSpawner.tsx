import { Clone, useGLTF } from "@react-three/drei";
import { propSet } from "../../../utils/assetpaths";

const PropSpawner = () => {
  const { scene } = useGLTF(propSet.roadsidePlant);
  if (!scene) return null;

  return (
    <group>
      <Clone object={scene} castShadow />
    </group>
  );
};

useGLTF.preload(propSet.roadsideSignLarge);

export default PropSpawner;
