export function getIslandMask(
  x: number,
  y: number,
  islandWidth: number,
  islandHeight: number,
): number {
  const nx = (x / islandWidth) * 2 - 1;
  const ny = (y / islandHeight) * 2 - 1;
  const distance = Math.sqrt(nx * nx + ny * ny);
  // Returns 1.0 at the center, fading to 0.0 at the edges
  return Math.max(0, 1.0 - distance);
}
