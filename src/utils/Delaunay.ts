// src/utils/Delaunay.ts

export type Point = { x: number; y: number };
export type Edge = [Point, Point];
export type Triangle = {
  a: Point;
  b: Point;
  c: Point;
  circumcenter: Point;
  circumradiusSq: number;
};

export class Delaunay {
  public points: Point[];
  public triangles: Triangle[];

  constructor(points: Point[]) {
    this.points = points;
    this.triangles = this.triangulate(points);
  }

  /**
   * Bowyer-Watson algorithm for Delaunay Triangulation
   */
  private triangulate(points: Point[]): Triangle[] {
    let triangles: Triangle[] = [];

    // 1. Create a "super-triangle" that encompasses all points
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    const dx = maxX - minX;
    const dy = maxY - minY;
    const deltaMax = Math.max(dx, dy);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const p1: Point = { x: midX - 20 * deltaMax, y: midY - deltaMax };
    const p2: Point = { x: midX, y: midY + 20 * deltaMax };
    const p3: Point = { x: midX + 20 * deltaMax, y: midY - deltaMax };

    triangles.push(this.createTriangle(p1, p2, p3));

    // 2. Add points one by one
    for (const p of points) {
      const badTriangles: Triangle[] = [];
      const polygon: Edge[] = [];

      // Find all triangles that are no longer valid due to the new point
      for (const t of triangles) {
        const distSq =
          (p.x - t.circumcenter.x) ** 2 + (p.y - t.circumcenter.y) ** 2;
        if (distSq < t.circumradiusSq) {
          badTriangles.push(t);
        }
      }

      // Find the boundary of the polygonal hole
      for (const t of badTriangles) {
        const edges: Edge[] = [
          [t.a, t.b],
          [t.b, t.c],
          [t.c, t.a],
        ];

        for (const edge of edges) {
          let isShared = false;
          for (const other of badTriangles) {
            if (t === other) continue;
            if (
              this.edgesEqual(edge, [other.a, other.b]) ||
              this.edgesEqual(edge, [other.b, other.c]) ||
              this.edgesEqual(edge, [other.c, other.a])
            ) {
              isShared = true;
              break;
            }
          }
          if (!isShared) polygon.push(edge);
        }
      }

      // Remove bad triangles
      triangles = triangles.filter((t) => !badTriangles.includes(t));

      // Re-triangulate the polygonal hole
      for (const edge of polygon) {
        triangles.push(this.createTriangle(edge[0], edge[1], p));
      }
    }

    // 3. Cleanup: Remove any triangles that share edges with the super-triangle
    triangles = triangles.filter((t) => {
      return !(
        t.a === p1 ||
        t.a === p2 ||
        t.a === p3 ||
        t.b === p1 ||
        t.b === p2 ||
        t.b === p3 ||
        t.c === p1 ||
        t.c === p2 ||
        t.c === p3
      );
    });

    return triangles;
  }

  private createTriangle(a: Point, b: Point, c: Point): Triangle {
    // Calculate circumcenter and circumradius squared
    const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    const ux =
      ((a.x ** 2 + a.y ** 2) * (b.y - c.y) +
        (b.x ** 2 + b.y ** 2) * (c.y - a.y) +
        (c.x ** 2 + c.y ** 2) * (a.y - b.y)) /
      d;
    const uy =
      ((a.x ** 2 + a.y ** 2) * (c.x - b.x) +
        (b.x ** 2 + b.y ** 2) * (a.x - c.x) +
        (c.x ** 2 + c.y ** 2) * (b.x - a.x)) /
      d;

    const circumcenter = { x: ux, y: uy };
    const circumradiusSq = (a.x - ux) ** 2 + (a.y - uy) ** 2;

    return { a, b, c, circumcenter, circumradiusSq };
  }

  private edgesEqual(e1: Edge, e2: Edge): boolean {
    return (
      (e1[0] === e2[0] && e1[1] === e2[1]) ||
      (e1[0] === e2[1] && e1[1] === e2[0])
    );
  }

  /**
   * Returns the unique Delaunay edges (your highway/road network)
   */
  public getEdges(): Edge[] {
    const edges: Edge[] = [];
    for (const t of this.triangles) {
      edges.push([t.a, t.b], [t.b, t.c], [t.c, t.a]);
    }

    // Deduplicate edges
    const uniqueEdges: Edge[] = [];
    for (const edge of edges) {
      const exists = uniqueEdges.some((e) => this.edgesEqual(e, edge));
      if (!exists) uniqueEdges.push(edge);
    }
    return uniqueEdges;
  }
}
