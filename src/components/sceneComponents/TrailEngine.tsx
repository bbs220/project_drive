import { Trail } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export type VehicleTrailProps = {
  width?: number;
  length?: number;
  decay?: number;
  color?: string | THREE.Color;
  emissiveIntensity?: number;
  offset?: [number, number, number];
};

const TrailEngine = ({
  width = 0.2,
  length = 20,
  decay = 1,
  color = "#00ffff",
  emissiveIntensity = 2.0,
  offset = [0, 0, 0],
}: VehicleTrailProps) => {
  const intenseColor = useMemo(() => {
    const c = new THREE.Color(color);
    return new THREE.Color(
      c.r * emissiveIntensity,
      c.g * emissiveIntensity,
      c.b * emissiveIntensity,
    );
  }, [color, emissiveIntensity]);

  return (
    <Trail
      width={width}
      length={length}
      decay={decay}
      attenuation={(w) => w}
      color={intenseColor}
    >
      <mesh position={offset}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </Trail>
  );
};

export default TrailEngine;
