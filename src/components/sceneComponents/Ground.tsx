import { RigidBody } from "@react-three/rapier";

const groundDim = {
  width: 250,
  height: 0.1,
  depth: 250,
};

const Ground = () => {
  return (
    <RigidBody type={`fixed`} colliders={`cuboid`}>
      <mesh receiveShadow>
        <boxGeometry
          args={[groundDim.width, groundDim.height, groundDim.depth]}
        />
        <meshStandardMaterial color={"black"} />
      </mesh>
    </RigidBody>
  );
};

export default Ground;
