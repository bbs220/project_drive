import { useGLTF } from "@react-three/drei";
import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { propSet } from "../../../utils/assetpaths";
import { worldConstants } from "../../../utils/worldGenerator";
import type { typeInstanceConfig } from "../../../hooks/useChunkGenerator";

// stable randomizer
const getPseudoRandom = (x: number, z: number) => {
  return Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
};

type PropSpawnerProps = {
  roads: typeInstanceConfig[];
  parkingLots?: typeInstanceConfig[];
};

const InstancedSubMesh = ({
  geometry,
  material,
  baseMatrix,
  instances,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  baseMatrix: THREE.Matrix4;
  instances: typeInstanceConfig[];
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current || instances.length === 0) return;

    instances.forEach((inst, i) => {
      dummy.position.set(...inst.position);
      dummy.scale.set(...inst.scale);
      dummy.rotation.set(...(inst.rotation || [0, 0, 0]));
      dummy.updateMatrix();
      dummy.matrix.multiply(baseMatrix);
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances, baseMatrix, dummy]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      castShadow
      receiveShadow
    />
  );
};

const InstancedProp = ({
  scene,
  instances,
}: {
  scene: THREE.Group;
  instances: typeInstanceConfig[];
}) => {
  const meshes = useMemo(() => {
    scene.updateMatrixWorld(true);

    const m: {
      geometry: THREE.BufferGeometry;
      material: THREE.Material | THREE.Material[];
      baseMatrix: THREE.Matrix4;
    }[] = [];

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh<
          THREE.BufferGeometry,
          THREE.Material | THREE.Material[]
        >;
        m.push({
          geometry: mesh.geometry,
          material: mesh.material,
          baseMatrix: mesh.matrixWorld.clone(),
        });
      }
    });

    return m;
  }, [scene]);

  if (instances.length === 0) return null;

  return (
    <group>
      {meshes.map((meshData, index) => (
        <InstancedSubMesh
          key={index}
          geometry={meshData.geometry}
          material={meshData.material}
          baseMatrix={meshData.baseMatrix}
          instances={instances}
        />
      ))}
    </group>
  );
};

const PropSpawner = ({ roads, parkingLots = [] }: PropSpawnerProps) => {
  const { scene: fenceLargeScene } = useGLTF(propSet.fenceLarge);
  const { scene: fenceSmallScene } = useGLTF(propSet.fenceSmall);
  const { scene: archScene } = useGLTF(propSet.roadsideArch);
  const { scene: shrineScene } = useGLTF(propSet.shrine);

  const { largeFences, smallFences, arches } = useMemo(() => {
    const tempLarge: typeInstanceConfig[] = [];
    const tempSmall: typeInstanceConfig[] = [];
    const tempArches: typeInstanceConfig[] = [];

    const halfCell = worldConstants.cellSize / 2;

    // map all straight road coordinates into a Set for instant neighbor lookups
    const straightRoads = new Set<string>();
    roads.forEach((road) => {
      if (road.roadType === 0.0) {
        // Math.round to avoid any Javascript floating point rounding errors
        straightRoads.add(
          `${Math.round(road.position[0])},${Math.round(road.position[2])}`,
        );
      }
    });

    roads.forEach((road) => {
      // physical 3D center of the road cell
      const physX = road.position[0] - halfCell;
      const physZ = road.position[2] - halfCell;

      if (road.isDeadEnd) {
        tempArches.push({
          key: `arch_${road.key}`,

          position: [
            road.position[0] - halfCell,
            4,
            road.position[2] - halfCell,
          ],
          scale: [1, 1, 1],
          rotation: road.archRotation || [0, 0, 0],
        });
      }

      if (road.roadType === 1.0) {
        // large fences intersections
        tempLarge.push({
          key: `lf_tl_${road.key}`,
          position: [physX - halfCell, 1.5, physZ - halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });
        tempLarge.push({
          key: `lf_tr_${road.key}`,
          position: [physX + halfCell, 1.5, physZ - halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });
        tempLarge.push({
          key: `lf_bl_${road.key}`,
          position: [physX - halfCell, 1.5, physZ + halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });
        tempLarge.push({
          key: `lf_br_${road.key}`,
          position: [physX + halfCell, 1.5, physZ + halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });
      } else {
        // small fences straight roads
        // if there are 7 buildings on a block, there are 6 gaps between them.
        // we only place a small fence at the boundary of a road cell if the next cell is also a straight road.
        const isHorizontal = road.rotation && road.rotation[1] > 0;

        if (isHorizontal) {
          // horizontal road runs east-west
          // look ahead to check if there is another straight road cell directly to the right (+x)
          const nextX = Math.round(road.position[0] + worldConstants.cellSize);
          const currentZ = Math.round(road.position[2]);

          if (straightRoads.has(`${nextX},${currentZ}`)) {
            // place fences on the right boundary (seam) connecting the two cells
            tempSmall.push({
              key: `sf_t_${road.key}`,
              position: [physX + halfCell, 0.7, physZ - halfCell],
              scale: [1, 1, 1],
              rotation: [0, 0, 0], // horizontal fence
            });
            tempSmall.push({
              key: `sf_b_${road.key}`,
              position: [physX + halfCell, 0.7, physZ + halfCell],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            });
          }
        } else {
          // vertical road (runs north-south)
          // look ahead to check if there is another straight road cell directly below (+z)
          const currentX = Math.round(road.position[0]);
          const nextZ = Math.round(road.position[2] + worldConstants.cellSize);

          if (straightRoads.has(`${currentX},${nextZ}`)) {
            // place fences on the bottom boundary (seam) connecting the two cells
            tempSmall.push({
              key: `sf_l_${road.key}`,
              position: [physX - halfCell, 0.7, physZ + halfCell],
              scale: [1, 1, 1],
              rotation: [0, 0, 0], // vertical fence
            });
            tempSmall.push({
              key: `sf_r_${road.key}`,
              position: [physX + halfCell, 0.7, physZ + halfCell],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            });
          }
        }
      }
    });

    return {
      largeFences: tempLarge,
      smallFences: tempSmall,
      arches: tempArches,
    };
  }, [roads]);

  const shrines = useMemo(() => {
    const tempShrines: typeInstanceConfig[] = [];
    const halfCell = worldConstants.cellSize / 2;

    parkingLots.forEach((lot) => {
      // calculate true visual center
      const cx = lot.position[0] - halfCell;
      const cz = lot.position[2] - halfCell;

      const hash = getPseudoRandom(cx, cz);

      // shrines in half the parking lots
      if (hash > 0.5) return;

      tempShrines.push({
        key: `shrine_${lot.key}`,
        position: [cx, 2.4, cz],
        scale: [4, 4, 4],
        rotation: lot.rotation || [0, 0, 0],
      });
    });

    return tempShrines;
  }, [parkingLots]);

  return (
    <group>
      {fenceLargeScene && (
        <InstancedProp scene={fenceLargeScene} instances={largeFences} />
      )}
      {fenceSmallScene && (
        <InstancedProp scene={fenceSmallScene} instances={smallFences} />
      )}
      {archScene && <InstancedProp scene={archScene} instances={arches} />}
      {shrineScene && <InstancedProp scene={shrineScene} instances={shrines} />}
    </group>
  );
};

useGLTF.preload(propSet.fenceLarge);
useGLTF.preload(propSet.fenceSmall);
useGLTF.preload(propSet.roadsideArch);
useGLTF.preload(propSet.shrine);

export default PropSpawner;
