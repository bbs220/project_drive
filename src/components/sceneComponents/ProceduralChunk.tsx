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

// define props to accept chunk grid coordinates
type typeChunkProps = {
  chunkX: number;
  chunkZ: number;
};

const ProceduralChunk = ({ chunkX, chunkZ }: typeChunkProps) => {
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

    // calculate the exact mathematical world offset for this specific chunk
    const worldOffsetX = chunkX * chunkSize;
    const worldOffsetZ = chunkZ * chunkSize;

    // loop through local coordinates offset by half a cell to perfectly center the grid
    for (let x = -halfChunk + halfCell; x < halfChunk; x += cellSize) {
      for (let z = -halfChunk + halfCell; z < halfChunk; z += cellSize) {
        // inject the chunk offset into the local loop to find the true world coordinate
        const worldX = x + worldOffsetX;
        const worldZ = z + worldOffsetZ;

        // strictly ask the generator what belongs at the absolute world coordinate
        const data = getTerrainData(worldX, worldZ);

        // inject version and world coordinates into the key for perfect caching
        const key = `v${activeVersion}_${worldX}_${worldZ}`;

        if (data.type === "building") {
          // position instances locally so they stay perfectly inside their chunk wrapper
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
  }, [version, chunkX, chunkZ]);

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
    // shift the entire chunk group to its proper grid location in the 3d world
    <group
      position={[chunkX * 300, 0, chunkZ * 300]}
      key={`${version}_${chunkX}_${chunkZ}`}
    >
      {/* buildings are static objects using the neon cyan grid color */}
      {buildings.length > 0 && (
        <instancedMesh
          ref={buildingsRef}
          args={[undefined, undefined, buildings.length]}
        >
          <boxGeometry />
          <meshBasicMaterial color="blue" toneMapped={false} />
        </instancedMesh>
      )}

      {/* roads are flat static objects using the laser magenta pulse color */}
      {roads.length > 0 && (
        <instancedMesh
          ref={roadsRef}
          args={[undefined, undefined, roads.length]}
        >
          <boxGeometry />
          <meshBasicMaterial color="red" toneMapped={false} />
        </instancedMesh>
      )}
    </group>
  );
};

export default ProceduralChunk;
