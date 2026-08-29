// src/utils/PoissonDisk.ts

export type Point = { x: number; y: number };

export class PoissonDisk {
  private width: number;
  private height: number;
  private radius: number;
  private k: number;
  private cellSize: number;
  private gridWidth: number;
  private gridHeight: number;
  private grid: (Point | null)[];
  private activeList: Point[];
  private points: Point[];

  // Internal PRNG state
  private currentSeed: number;

  /**
   * @param width The width of the generation area
   * @param height The height of the generation area
   * @param radius The minimum distance between any two points
   * @param seed Optional seed for deterministic generation
   * @param k Maximum number of attempts before rejection (30 is industry standard)
   */
  constructor(
    width: number,
    height: number,
    radius: number,
    seed: number = Math.random(),
    k: number = 30,
  ) {
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.k = k;
    this.currentSeed = seed;

    // The grid cell size must be r / sqrt(2) so that each cell can contain at most one point
    this.cellSize = this.radius / Math.SQRT2;
    this.gridWidth = Math.ceil(this.width / this.cellSize);
    this.gridHeight = Math.ceil(this.height / this.cellSize);

    this.grid = new Array(this.gridWidth * this.gridHeight).fill(null);
    this.activeList = [];
    this.points = [];
  }

  // Simple deterministic PRNG returning a float between 0 and 1
  private random(): number {
    this.currentSeed = (this.currentSeed * 9301 + 49297) % 233280;
    return this.currentSeed / 233280;
  }

  private insertPoint(p: Point): void {
    const col = Math.floor(p.x / this.cellSize);
    const row = Math.floor(p.y / this.cellSize);
    this.grid[row * this.gridWidth + col] = p;
    this.activeList.push(p);
    this.points.push(p);
  }

  private isValidPoint(candidate: Point): boolean {
    // Check bounds
    if (
      candidate.x < 0 ||
      candidate.x >= this.width ||
      candidate.y < 0 ||
      candidate.y >= this.height
    ) {
      return false;
    }

    const col = Math.floor(candidate.x / this.cellSize);
    const row = Math.floor(candidate.y / this.cellSize);

    // Check neighboring cells (up to 2 cells away in any direction)
    const startRow = Math.max(0, row - 2);
    const endRow = Math.min(this.gridHeight - 1, row + 2);
    const startCol = Math.max(0, col - 2);
    const endCol = Math.min(this.gridWidth - 1, col + 2);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const neighbor = this.grid[r * this.gridWidth + c];
        if (neighbor) {
          const dx = candidate.x - neighbor.x;
          const dy = candidate.y - neighbor.y;
          // If the distance is less than the radius, it's invalid
          if (dx * dx + dy * dy < this.radius * this.radius) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Executes the algorithm and returns the array of organic points.
   */
  public generate(): Point[] {
    // Generate a random starting point
    const startPoint: Point = {
      x: this.random() * this.width,
      y: this.random() * this.height,
    };

    this.insertPoint(startPoint);

    while (this.activeList.length > 0) {
      // Pick a random point from the active list
      const randIdx = Math.floor(this.random() * this.activeList.length);
      const p = this.activeList[randIdx];
      let found = false;

      // Try 'k' times to find a valid neighbor
      for (let i = 0; i < this.k; i++) {
        const angle = this.random() * Math.PI * 2;
        // Distance must be between radius and 2 * radius
        const r = this.radius + this.random() * this.radius;
        const candidate: Point = {
          x: p.x + Math.cos(angle) * r,
          y: p.y + Math.sin(angle) * r,
        };

        if (this.isValidPoint(candidate)) {
          this.insertPoint(candidate);
          found = true;
          break; // Found one, move on
        }
      }

      // If we couldn't find a valid neighbor after 'k' tries, remove it from the active list
      if (!found) {
        this.activeList.splice(randIdx, 1);
      }
    }

    return this.points;
  }
}
