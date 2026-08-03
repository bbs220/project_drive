import { useMemo } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";

// import shaders
import testFrag from "./shaders/testFrag.glsl";
import testVert from "./shaders/testVert.glsl";

// define tweakpane configuration object
const boxesConfig = {
  boxColor: { value: "#b3de47", label: "box color" },
};

const Boxes = () => {
  // initialize tweakpane hook
  const params = useTweakpane("box tuning", boxesConfig);

  // memoize uniforms to prevent reallocation
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(params.boxColor) },
    }),
    [params.boxColor],
  );

  // update uniform value when tweakpane changes
  uniforms.uColor.value.set(params.boxColor);

  return (
    <RigidBody
      colliders={"cuboid"}
      restitution={1}
      type={"dynamic"}
      friction={0}
    >
      <mesh castShadow receiveShadow position={[0, 6, 6]}>
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          fragmentShader={testFrag}
          vertexShader={testVert}
          uniforms={uniforms}
        />
      </mesh>
    </RigidBody>
  );
};

export default Boxes;
