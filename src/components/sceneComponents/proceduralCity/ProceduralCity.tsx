import { useCityStore } from "../../../stores/useCityStore";
import { worldConstants } from "../../../utils/worldGenerator";
import ProceduralBuildings from "./ProceduralBuildings";
import ProceduralRoads from "./ProceduralRoads";
import ProceduralGrass from "./ProceduralGrass";
import PropSpawner from "./PropSpawner";
import type { RoadShaderParams } from "./ProceduralRoads";
import { useChunkGenerator } from "../../../hooks/useChunkGenerator";
import type { typeChunkGeneratedData } from "../../../utils/chunkDataGenerator";

type typeChunkProps = {
  chunkX: number;
  chunkZ: number;
  roadParams: RoadShaderParams;
  chunkData?: typeChunkGeneratedData;
};

const ProceduralCity = ({
  chunkX,
  chunkZ,
  roadParams,
  chunkData,
}: typeChunkProps) => {
  const version = useCityStore((state) => state.version);

  // all the heavy math is cleanly abstracted away
  const generatedFallback = useChunkGenerator(
    chunkX,
    chunkZ,
    version,
    !chunkData,
  );

  const { buildings, roads, grass, parkingLots } =
    chunkData || generatedFallback;

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
      <PropSpawner roads={roads} parkingLots={parkingLots} />
    </group>
  );
};

export default ProceduralCity;
