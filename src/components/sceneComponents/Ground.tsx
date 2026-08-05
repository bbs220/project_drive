import { RigidBody } from "@react-three/rapier";
import { bankTextures } from "../../utils/assetpaths";
import { RepeatWrapping, TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";

const groundDim = {
  width: 250,
  height: 0.1,
  depth: 250,
};

const Ground = () => {
  const originalMap = useLoader(TextureLoader, bankTextures.dark1);

  const gridMap = useMemo(() => {
    const texture = originalMap.clone();

    // set the wrapping mode to repeat
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.anisotropy = 16;

    // tile the texture 25 times
    texture.repeat.set(groundDim.width / 2, groundDim.depth / 2);

    // tell three.js the texture has been updated
    texture.needsUpdate = true;

    return texture;
  }, [originalMap]);

  return (
    <RigidBody type={`fixed`} colliders={`cuboid`}>
      <mesh receiveShadow>
        <boxGeometry
          args={[groundDim.width, groundDim.height, groundDim.depth]}
        />
        <meshStandardMaterial map={gridMap} />
      </mesh>
    </RigidBody>
  );
};

export default Ground;
