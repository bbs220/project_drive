import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { getTerrainData } from "../../utils/worldGenerator";
import { useCityStore } from "../../stores/useCItyStore";

// define typescript shape for our visual instances
export type typeInstanceConfig = {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
};

// reusable dummy object to calculate matrix math without memory overhead
const dummy = new THREE.Object3D();

const ProceduralChunk = () => {
  // subscribe strictly to the city version triggered by the ui radar
  const version = useCityStore((state) => state.version);

  // refs to directly manipulate the instanced meshes
  const buildingsRef = useRef<THREE.InstancedMesh>(null);
  const roadsRef = useRef<THREE.InstancedMesh>(null);

  // precompute all instance data for visuals in a single pass
  const { buildings, roads } = useMemo(() => {
    // read the version variable to satisfy the react compiler dependency checks
    const activeVersion = version;

    // hold temporary building instances
    const tempBuildings: typeInstanceConfig[] = [];

    // hold temporary road instances
    const tempRoads: typeInstanceConfig[] = [];

    // base dimensions for the procedural chunk
    const chunkSize = 300;
    const halfChunk = chunkSize / 2;
    const cellSize = 10;
    const halfCell = cellSize / 2;

    // loop through every coordinate offset by half a cell to perfectly center the grid
    for (let x = -halfChunk + halfCell; x < halfChunk; x += cellSize) {
      for (let z = -halfChunk + halfCell; z < halfChunk; z += cellSize) {
        // ask the generator what belongs at this exact world coordinate
        const data = getTerrainData(x, z);

        // inject version into the key to force dependency usage
        const key = `v${activeVersion}_${x}_${z}`;

        if (data.type === "building") {
          // buildings sit flush on the ground and stretch upwards
          tempBuildings.push({
            key: `b_${key}`,
            position: [x, data.elevation / 2, z],
            scale: [8, data.elevation, 8],
          });
        } else if (data.type === "road") {
          // roads sit slightly above the ground to avoid z fighting with the shader grid
          tempRoads.push({
            key: `r_${key}`,
            position: [x, 0.05, z],
            scale: [10, 0.1, 10],
          });
        }
      }
    }

    return {
      buildings: tempBuildings,
      roads: tempRoads,
    };
  }, [version]);

  // write the positional matrices to the gpu whenever the data changes
  useLayoutEffect(() => {
    if (buildingsRef.current) {
      buildings.forEach((b, i) => {
        dummy.position.set(...b.position);
        dummy.scale.set(...b.scale);
        dummy.updateMatrix();
        buildingsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      buildingsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (roadsRef.current) {
      roads.forEach((r, i) => {
        dummy.position.set(...r.position);
        dummy.scale.set(...r.scale);
        dummy.updateMatrix();
        roadsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      roadsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildings, roads]);

  return (
    <group key={version}>
      {buildings.length > 0 && (
        <instancedMesh
          ref={buildingsRef}
          args={[undefined, undefined, buildings.length]}
        >
          <boxGeometry />
          <meshBasicMaterial color="#00F3FF" toneMapped={false} />
        </instancedMesh>
      )}

      {/* roads are flat static objects using the laser magenta pulse color */}
      {roads.length > 0 && (
        <instancedMesh
          ref={roadsRef}
          args={[undefined, undefined, roads.length]}
        >
          <boxGeometry />
          <meshBasicMaterial color="#FF00FF" toneMapped={false} />
        </instancedMesh>
      )}
    </group>
  );
};

export default ProceduralChunk;
