import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { getTerrainData } from "../../utils/worldGenerator";
import { useCityStore } from "../../stores/useCItyStore";
import roadVert from "./shaders/roadVert.glsl";
import roadFrag from "./shaders/roadFrag.glsl";

// define typescript shape for our visual instances
export type typeInstanceConfig = {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  roadType?: number;
};

// reusable dummy object to calculate matrix math without memory overhead
const dummy = new THREE.Object3D();

// define props to accept chunk grid coordinates
type typeChunkProps = {
  chunkX: number;
  chunkZ: number;
};

const ProceduralCity = ({ chunkX, chunkZ }: typeChunkProps) => {
  // subscribe strictly to the city version triggered by the ui radar
  const version = useCityStore((state) => state.version);

  // refs to directly manipulate the instanced meshes and geometries
  const buildingsRef = useRef<THREE.InstancedMesh>(null);
  const roadsRef = useRef<THREE.InstancedMesh>(null);
  const roadGeomRef = useRef<THREE.BoxGeometry>(null);

  // create the shader material once so it doesn't recompile
  const roadMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: roadVert,
      fragmentShader: roadFrag,
      toneMapped: false,
    });
  }, []);

  // precompute all instance data for visuals in a single pass
  const { buildings, roads } = useMemo(() => {
    // read the version variable to satisfy the react compiler dependency checks
    const activeVersion = version;

    // hold temporary instances
    const tempBuildings: typeInstanceConfig[] = [];
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
          let roadType = 0.0;
          let rotation: [number, number, number] = [0, 0, 0];

          // query the grid neighbors to see where connected roads are
          const n = getTerrainData(worldX, worldZ - cellSize).type === "road";
          const s = getTerrainData(worldX, worldZ + cellSize).type === "road";
          const e = getTerrainData(worldX + cellSize, worldZ).type === "road";
          const w = getTerrainData(worldX - cellSize, worldZ).type === "road";

          const hasVerticalNeighbor = n || s;
          const hasHorizontalNeighbor = e || w;

          // if it has both vertical and horizontal connections it is an intersection
          if (hasVerticalNeighbor && hasHorizontalNeighbor) {
            roadType = 1.0;
          }
          // if it is purely east to west we rotate the dashes ninety degrees
          else if (hasHorizontalNeighbor && !hasVerticalNeighbor) {
            rotation = [0, Math.PI / 2, 0];
          }

          // roads sit slightly above the ground to avoid z fighting with the shader grid
          tempRoads.push({
            key: `r_${key}`,
            position: [x, 0.05, z],
            scale: [10, 0.1, 10],
            rotation,
            roadType,
          });
        }
      }
    }

    return {
      buildings: tempBuildings,
      roads: tempRoads,
    };
  }, [version, chunkX, chunkZ]);

  // write the positional matrices and custom attributes to the gpu
  useLayoutEffect(() => {
    if (buildingsRef.current) {
      buildings.forEach((b, i) => {
        dummy.position.set(...b.position);
        dummy.scale.set(...b.scale);
        dummy.rotation.set(0, 0, 0); // reset rotation for buildings
        dummy.updateMatrix();
        buildingsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      buildingsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (roadsRef.current && roadGeomRef.current) {
      // create the array to hold our custom intersection flag
      const roadTypes = new Float32Array(roads.length);

      roads.forEach((r, i) => {
        dummy.position.set(...r.position);
        dummy.scale.set(...r.scale);
        // apply rotation if it exists
        dummy.rotation.set(...(r.rotation || [0, 0, 0]));
        dummy.updateMatrix();

        roadsRef.current!.setMatrixAt(i, dummy.matrix);
        // assign the road type into the array
        roadTypes[i] = r.roadType || 0.0;
      });

      // push the array to the geometry as an instanced buffer attribute
      roadGeomRef.current.setAttribute(
        "aRoadType",
        new THREE.InstancedBufferAttribute(roadTypes, 1),
      );

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

      {/* roads powered by our custom glsl instanced shader */}
      {roads.length > 0 && (
        <instancedMesh
          ref={roadsRef}
          args={[undefined, undefined, roads.length]}
          material={roadMaterial}
        >
          <boxGeometry ref={roadGeomRef} />
        </instancedMesh>
      )}
    </group>
  );
};

export default ProceduralCity;
