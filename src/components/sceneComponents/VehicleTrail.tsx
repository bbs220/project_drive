import { Trail } from "@react-three/drei";
import * as THREE from "three";

export type VehicleTrailProps = {
  width: number;
  length: number;
  decay: number;
  color: string | THREE.Color;
  emissiveIntensity: number;
  offset: [number, number, number];
  geo: [number, number, number];
};

const VehicleTrail = ({
  width = 0.2,
  length = 20,
  decay = 1,
  color = "#ffffff",
  emissiveIntensity = 5.0,
  offset = [0, 0, 0],
  geo = [0.1, 0.1, 0.1],
}: VehicleTrailProps) => {
  return (
    <Trail width={width} length={length} decay={decay} attenuation={(w) => w}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        toneMapped={false}
        transparent
        opacity={0.8}
      />
      <mesh position={offset}>
        <boxGeometry args={geo} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </Trail>
  );
};

export default VehicleTrail;
