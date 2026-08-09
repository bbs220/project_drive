// Official FastNoiseLite TypeScript Declarations
declare module "fastnoise-lite" {
  class FastNoiseLite {
    constructor(seed?: number);

    SetSeed(seed: number): void;
    SetNoiseType(type: FastNoiseLite.NoiseType): void;
    SetFrequency(frequency: number): void;

    SetFractalType(type: FastNoiseLite.FractalType): void;
    SetFractalOctaves(octaves: number): void;
    SetFractalLacunarity(lacunarity: number): void;
    SetFractalGain(gain: number): void;
    SetFractalWeightedStrength(weightedStrength: number): void;
    SetFractalPingPongStrength(pingPongStrength: number): void;

    SetCellularDistanceFunction(
      func: FastNoiseLite.CellularDistanceFunction,
    ): void;
    SetCellularReturnType(type: FastNoiseLite.CellularReturnType): void;
    SetCellularJitter(cellularJitter: number): void;

    SetDomainWarpType(type: FastNoiseLite.DomainWarpType): void;
    SetDomainWarpAmp(domainWarpAmp: number): void;

    SetRotationType3D(type: FastNoiseLite.RotationType3D): void;

    GetNoise(x: number, y: number, z?: number): number;

    // Note: Domain warp methods pass by reference in JS using an object { val: number }
    DomainWarp(
      x: { val: number },
      y: { val: number },
      z?: { val: number },
    ): void;
  }

  namespace FastNoiseLite {
    enum NoiseType {
      OpenSimplex2,
      OpenSimplex2S,
      Cellular,
      Perlin,
      ValueCubic,
      Value,
    }

    enum RotationType3D {
      None,
      ImproveXYPlanes,
      ImproveXZPlanes,
    }

    enum FractalType {
      None,
      FBm,
      Ridged,
      PingPong,
      DomainWarpProgressive,
      DomainWarpIndependent,
    }

    enum CellularDistanceFunction {
      Euclidean,
      EuclideanSq,
      Manhattan,
      Hybrid,
    }

    enum CellularReturnType {
      CellValue,
      Distance,
      Distance2,
      Distance2Add,
      Distance2Sub,
      Distance2Mul,
      Distance2Div,
    }

    enum DomainWarpType {
      OpenSimplex2,
      OpenSimplex2Reduced,
      BasicGrid,
    }
  }

  export default FastNoiseLite;
}
