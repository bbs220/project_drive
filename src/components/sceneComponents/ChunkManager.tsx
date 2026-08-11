import ProceduralChunk from "./ProceduralChunk";

const ChunkManager = () => {
  // define an array to hold the grid coordinates
  const activeChunks = [];

  // loop through a three by three grid to generate the surrounding chunks
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      activeChunks.push({ chunkX: x, chunkZ: z });
    }
  }

  return (
    <group>
      {/* map through the generated coordinates and render isolated chunk components */}
      {activeChunks.map((coord) => (
        <ProceduralChunk
          key={`chunk_${coord.chunkX}_${coord.chunkZ}`}
          chunkX={coord.chunkX}
          chunkZ={coord.chunkZ}
        />
      ))}
    </group>
  );
};

export default ChunkManager;
