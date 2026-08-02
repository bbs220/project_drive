import { RigidBody } from "@react-three/rapier";

const Ground = () => {
  return (
    <RigidBody type={`fixed`} colliders={`cuboid`}>
      <mesh receiveShadow>
        <boxGeometry args={[50, 0.1, 50]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>
    </RigidBody>
  );
};
export default Ground;
