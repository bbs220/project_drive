import { useCityStore } from "../../../stores/useCItyStore";
import { worldConstants } from "../../../utils/worldGenerator";
import ProceduralBuildings from "./ProceduralBuildings";
import ProceduralRoads from "./ProceduralRoads";
import ProceduralGrass from "./ProceduralGrass";
import PropSpawner from "./PropSpawner";
import type { RoadShaderParams } from "./ProceduralRoads";
import { useChunkGenerator } from "../../../hooks/useChunkGenerator";

type typeChunkProps = {
  chunkX: number;
  chunkZ: number;
  roadParams: RoadShaderParams;
};

const ProceduralCity = ({ chunkX, chunkZ, roadParams }: typeChunkProps) => {
  const version = useCityStore((state) => state.version);

  // all the heavy math is cleanly abstracted away
  const { buildings, roads, grass } = useChunkGenerator(
    chunkX,
    chunkZ,
    version,
  );

  return (
    <group
      position={[
        chunkX * worldConstants.chunkSize,
        -0.48,
        chunkZ * worldConstants.chunkSize,
      ]}
      key={`${version}_${chunkX}_${chunkZ}`}
    >
      <ProceduralBuildings buildings={buildings} />
      <ProceduralRoads roads={roads} params={roadParams} />
      <ProceduralGrass grass={grass} />
      <PropSpawner />
    </group>
  );
};

export default ProceduralCity;
