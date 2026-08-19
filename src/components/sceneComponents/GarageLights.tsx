import { useRef } from "react";
import * as THREE from "three";
import { useHelper } from "@react-three/drei";
import { useTweakpane } from "../../hooks/useTweakpane";

const GarageLights = () => {
  // initialize refs with a non null assertion to satisfy strict typing
  const lightOneRef = useRef<THREE.DirectionalLight>(null!);
  const lightTwoRef = useRef<THREE.DirectionalLight>(null!);
  const lightThreeRef = useRef<THREE.DirectionalLight>(null!);
  const lightFourRef = useRef<THREE.DirectionalLight>(null!);

  const { lightY, lightDist, lightIntensity, lightColor, showHelpers } =
    useTweakpane(
      { title: "💡 Garage Lights", expanded: false },
      {
        lightY: { value: 5, min: 1, max: 20, label: "height" },
        lightDist: { value: 5, min: 1, max: 20, label: "distance" },
        lightIntensity: { value: 0.4, min: 0, max: 30, label: "intensity" },
        lightColor: { value: "#ffffff", label: "color" },
        showHelpers: { value: false, label: "show helpers" },
      },
    );

  // cast the ref to any to prevent typescript from panicking over the ternary null
  useHelper(showHelpers ? lightOneRef : null, THREE.DirectionalLightHelper, 1);
  useHelper(showHelpers ? lightTwoRef : null, THREE.DirectionalLightHelper, 1);
  useHelper(
    showHelpers ? lightThreeRef : null,
    THREE.DirectionalLightHelper,
    1,
  );
  useHelper(showHelpers ? lightFourRef : null, THREE.DirectionalLightHelper, 1);

  // extract primitive values for inline use
  const y = lightY as number;
  const d = lightDist as number;
  const intensity = lightIntensity as number;
  const color = lightColor as string;

  return (
    <group>
      {/* front right */}
      <directionalLight
        ref={lightOneRef}
        position={[d, y, d]}
        color={color}
        intensity={intensity}
        castShadow
      />
      {/* front left */}
      <directionalLight
        ref={lightTwoRef}
        position={[-d, y, d]}
        color={color}
        intensity={intensity}
        castShadow
      />
      {/* back right */}
      <directionalLight
        ref={lightThreeRef}
        position={[d, y, -d]}
        color={color}
        intensity={intensity}
        castShadow
      />
      {/* back left */}
      <directionalLight
        ref={lightFourRef}
        position={[-d, y, -d]}
        color={color}
        intensity={intensity}
        castShadow
      />
    </group>
  );
};

export default GarageLights;
