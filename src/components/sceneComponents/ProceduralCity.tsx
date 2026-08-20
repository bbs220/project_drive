import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { getTerrainData } from "../../utils/worldGenerator";
import { useCityStore } from "../../stores/useCItyStore";
import roadVert from "./shaders/roadVert.glsl";
import roadFrag from "./shaders/roadFrag.glsl";
import buildingVert from "./shaders/buildingVert.glsl";
import buildingFrag from "./shaders/buildingFrag.glsl";

// define typescript shape for our visual instances
export type typeInstanceConfig = {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  roadType?: number;
  colorIndex?: number;
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
  const buildingGeomRef = useRef<THREE.BoxGeometry>(null);

  // create the shader materials once so they don't recompile
  const buildingMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: buildingVert,
      fragmentShader: buildingFrag,
      toneMapped: false,
    });
  }, []);

  const roadMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: roadVert,
      fragmentShader: roadFrag,
      toneMapped: false,
    });
  }, []);

  // precompute all instance data for visuals in a single pass
  const { buildings, roads } = useMemo(() => {
    const activeVersion = version;

    const tempBuildings: typeInstanceConfig[] = [];
    const tempRoads: typeInstanceConfig[] = [];

    const chunkSize = 300;
    const halfChunk = chunkSize / 2;
    const cellSize = 10;
    const halfCell = cellSize / 2;

    const worldOffsetX = chunkX * chunkSize;
    const worldOffsetZ = chunkZ * chunkSize;

    for (let x = -halfChunk + halfCell; x < halfChunk; x += cellSize) {
      for (let z = -halfChunk + halfCell; z < halfChunk; z += cellSize) {
        const worldX = x + worldOffsetX;
        const worldZ = z + worldOffsetZ;
        const data = getTerrainData(worldX, worldZ);
        const key = `v${activeVersion}_${worldX}_${worldZ}`;

        if (data.type === "building") {
          tempBuildings.push({
            key: `b_${key}`,
            position: [x, data.elevation / 2, z],
            scale: [8, data.elevation, 8],
          });
        } else if (data.type === "road") {
          let roadType = 0.0;
          let rotation: [number, number, number] = [0, 0, 0];

          const n = getTerrainData(worldX, worldZ - cellSize).type === "road";
          const s = getTerrainData(worldX, worldZ + cellSize).type === "road";
          const e = getTerrainData(worldX + cellSize, worldZ).type === "road";
          const w = getTerrainData(worldX - cellSize, worldZ).type === "road";

          const hasVerticalNeighbor = n || s;
          const hasHorizontalNeighbor = e || w;

          if (hasVerticalNeighbor && hasHorizontalNeighbor) {
            roadType = 1.0;
          } else if (hasHorizontalNeighbor && !hasVerticalNeighbor) {
            rotation = [0, Math.PI / 2, 0];
          }

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

  // combined GPU Write phase for both Buildings and Roads
  useLayoutEffect(() => {
    if (buildingsRef.current && buildingGeomRef.current) {
      const buildingHeights = new Float32Array(buildings.length);

      buildings.forEach((b, i) => {
        dummy.position.set(...b.position);
        dummy.scale.set(...b.scale);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();

        buildingsRef.current!.setMatrixAt(i, dummy.matrix);
        buildingHeights[i] = b.scale[1]; // Save elevation
      });

      buildingGeomRef.current.setAttribute(
        "aHeight",
        new THREE.InstancedBufferAttribute(buildingHeights, 1),
      );
      buildingsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (roadsRef.current && roadGeomRef.current) {
      const roadTypes = new Float32Array(roads.length);

      roads.forEach((r, i) => {
        dummy.position.set(...r.position);
        dummy.scale.set(...r.scale);
        dummy.rotation.set(...(r.rotation || [0, 0, 0]));
        dummy.updateMatrix();

        roadsRef.current!.setMatrixAt(i, dummy.matrix);
        roadTypes[i] = r.roadType || 0.0;
      });

      roadGeomRef.current.setAttribute(
        "aRoadType",
        new THREE.InstancedBufferAttribute(roadTypes, 1),
      );
      roadsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildings, roads]);

  return (
    <group
      position={[chunkX * 300, 0, chunkZ * 300]}
      key={`${version}_${chunkX}_${chunkZ}`}
    >
      {buildings.length > 0 && (
        <instancedMesh
          ref={buildingsRef}
          args={[undefined, undefined, buildings.length]}
          material={buildingMaterial}
        >
          <boxGeometry ref={buildingGeomRef} />
        </instancedMesh>
      )}

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
