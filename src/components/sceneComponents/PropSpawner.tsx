import { Gltf } from "@react-three/drei";

const PropSpawner = () => {
  return (
    <mesh>
      <Gltf src="/models/props/propRoadsideArch.glb" position={[0, 3, 0]} />
    </mesh>
  );
};
export default PropSpawner;
