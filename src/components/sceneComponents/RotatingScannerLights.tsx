import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RotatingScannerLights = () => {
  const rigRef = useRef<THREE.Group>(null);

  // slowly rotate the entire rig to sweep reflections across the vehicle body
  useFrame((_state, delta) => {
    if (rigRef.current) {
      // tweak this multiplier to make the sweep faster or slower
      rigRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={rigRef}>
      {/* front scanning tube light */}
      <group position={[0, 4, 3]} rotation={[-Math.PI / 4, 0, 0]}>
        <rectAreaLight
          width={10}
          height={0.2}
          color="#00f3ff" // tron-cyan
          intensity={15}
        />
        {/* visual representation of the glowing tube */}
        <mesh>
          <planeGeometry args={[10, 0.2]} />
          <meshBasicMaterial color="#00f3ff" />
        </mesh>
      </group>

      {/* rear scanning tube light */}
      <group position={[0, 4, -3]} rotation={[Math.PI / 4, 0, 0]}>
        <rectAreaLight
          width={10}
          height={0.2}
          color="#ffcc00" // tron-yellow
          intensity={15}
        />
        {/* visual representation of the glowing tube */}
        <mesh>
          <planeGeometry args={[10, 0.2]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
      </group>
    </group>
  );
};

export default RotatingScannerLights;
