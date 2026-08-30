import { Gltf } from "@react-three/drei";

const PropSpawner = () => {
  return (
    <mesh>
      <Gltf src="/models/props/propRoadsideArch.glb" position={[5, 3, 0]} />
    </mesh>
  );
};
export default PropSpawner;
