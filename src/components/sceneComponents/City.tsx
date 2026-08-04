import { useEffect, useRef } from "react";
import * as THREE from "three";
import { InstancedRigidBodies } from "@react-three/rapier";
import { useTweakpane } from "../../hooks/useTweakpane";
import { cityConstants } from "../../constants/sceneConstants";
import { useCityCreator } from "../../hooks/useCityCreator";
import type { TerrainParams } from "../../hooks/useTerrainCreator";

// update city component to accept terrain params via props
type CityProps = {
  terrainParams: TerrainParams;
};

// shared geometry for all skyscrapers
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const dummy = new THREE.Object3D();

const City = ({ terrainParams }: CityProps) => {
  // only call city tuning here
  const cityParams = useTweakpane(
    { title: "🏙️ City Tuning", expanded: false },
    cityConstants,
  );

  // combine params to sync city with terrain shape
  const combinedParams = { ...cityParams, ...terrainParams };

  // destructure the new instances array
  const { instances, count } = useCityCreator(combinedParams);

  // mesh ref for visual updates
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // sync matrices to visual mesh
  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      // access the unified object properties
      dummy.position.set(...instances[i].position);
      dummy.scale.set(...instances[i].scale);
      dummy.rotation.set(...instances[i].rotation);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances, count]);

  return (
    // pass the single instances array directly to rapier
    <InstancedRigidBodies instances={instances} colliders="cuboid">
      <instancedMesh
        ref={meshRef}
        args={[boxGeometry, undefined, count]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#88929e" roughness={0.7} metalness={0.2} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
};

export default City;
