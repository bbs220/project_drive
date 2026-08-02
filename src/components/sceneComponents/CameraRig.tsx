import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

// define props interface
interface CameraRigProps {
  targetRef: React.RefObject<THREE.Mesh | null>;
}

// preallocate vector to avoid garbage collection
const targetPosition = new THREE.Vector3();

const CameraRig = ({ targetRef }: CameraRigProps) => {
  // create a reference to the orbit controls instance
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // sync camera target to visual mesh every frame
  useFrame(() => {
    // exit early if refs are not mounted
    if (!targetRef.current || !controlsRef.current) return;

    // extract interpolated world position from visual mesh
    targetRef.current.getWorldPosition(targetPosition);

    // continuously update the controls target to the visual position
    controlsRef.current.target.copy(targetPosition);

    // manually update controls to apply target changes
    controlsRef.current.update();
  });

  // render default orbit controls
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      maxDistance={8}
      maxPolarAngle={1.3}
    />
  );
};

export default CameraRig;
