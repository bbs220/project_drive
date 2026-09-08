import { Clone, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { propSet } from "../../../utils/assetpaths";
import { worldConstants } from "../../../utils/worldGenerator";
import type { typeInstanceConfig } from "../../../hooks/useChunkGenerator";

type PropSpawnerProps = {
  roads: typeInstanceConfig[];
};

const PropSpawner = ({ roads }: PropSpawnerProps) => {
  const { scene: fenceLargeScene } = useGLTF(propSet.fenceLarge);

  const largeFences = useMemo(() => {
    const fences: typeInstanceConfig[] = [];
    const halfCell = worldConstants.cellSize / 2;

    roads.forEach((road) => {
      if (road.roadType === 1.0) {
        // Apply the exact same baseline offset that ProceduralRoads uses!
        const baseX = road.position[0] - halfCell;
        const baseZ = road.position[2] - halfCell;

        // 1. Top-Left Corner
        fences.push({
          key: `lf_tl_${road.key}`,
          position: [baseX - halfCell, 1.5, baseZ - halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });

        // 2. Top-Right Corner
        fences.push({
          key: `lf_tr_${road.key}`,
          position: [baseX + halfCell, 1.5, baseZ - halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });

        // 3. Bottom-Left Corner
        fences.push({
          key: `lf_bl_${road.key}`,
          position: [baseX - halfCell, 1.5, baseZ + halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });

        // 4. Bottom-Right Corner
        fences.push({
          key: `lf_br_${road.key}`,
          position: [baseX + halfCell, 1.5, baseZ + halfCell],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        });
      }
    });

    return fences;
  }, [roads]);

  if (!fenceLargeScene || largeFences.length === 0) return null;

  return (
    <group>
      {largeFences.map((fence) => (
        <Clone
          key={fence.key}
          object={fenceLargeScene}
          position={fence.position}
          scale={fence.scale}
          rotation={fence.rotation || [0, 0, 0]}
          castShadow
        />
      ))}
    </group>
  );
};

useGLTF.preload(propSet.fenceLarge);

export default PropSpawner;
