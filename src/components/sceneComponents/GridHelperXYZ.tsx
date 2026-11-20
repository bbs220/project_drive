import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTweakpane } from "../../hooks/useTweakpane";
import { worldConstants } from "../../utils/worldGenerator";

// props defining the tracking target for snapping grids
type typeGridHelperXYZProps = {
  targetRef?: React.RefObject<THREE.Group | null>;
};

const GridHelperXYZ = ({ targetRef }: typeGridHelperXYZProps) => {
  const params = useTweakpane(
    { title: "📐 XYZ Grid", expanded: false },
    {
      visible: { value: true, label: "show xyz grid" },
      cellSize: {
        value: worldConstants.wfc.blockSize,
        min: 25,
        max: 200,
        step: 25,
        label: "snap size (m)",
      },
      gridSpan: {
        value: 600,
        min: 200,
        max: 2000,
        step: 200,
        label: "grid span (m)",
      },
      centerColor: { value: "#ffffff", label: "center line" },
      gridColor: { value: "#00ff66", label: "grid / node color" },
      showFloor: { value: true, label: "floor grid (xz)" },
      showPoints: { value: true, label: "3d snap points" },
      showPlanes: { value: false, label: "vertical planes" },
      pointSize: {
        value: 10,
        min: 1.0,
        max: 50.0,
        step: 0.5,
        label: "node point size",
      },
      elevationTiers: {
        value: 3,
        min: 1,
        max: 6,
        step: 1,
        label: "height tiers",
      },
      followTarget: { value: true, label: "snap to target" },
      elevationStep: {
        value: 0,
        min: -500,
        max: 500,
        step: 100,
        label: "y offset",
      },
    },
  );

  // container group tracking snapped world coordinates
  const groupRef = useRef<THREE.Group>(null);
  // temporary vector for extracting world coordinates
  const dummyVec = useRef(new THREE.Vector3());

  // track active target position and calculate grid snap
  useFrame(() => {
    if (!groupRef.current) return;

    if (params.followTarget && targetRef?.current) {
      targetRef.current.getWorldPosition(dummyVec.current);

      const step = params.cellSize as number;
      const sx = Math.round(dummyVec.current.x / step) * step;
      const sy =
        Math.max(0, Math.floor(dummyVec.current.y / step) * step) +
        (params.elevationStep as number);
      const sz = Math.round(dummyVec.current.z / step) * step;

      groupRef.current.position.set(sx, sy, sz);
    }
  });

  const step = params.cellSize as number;
  const rawSpan = params.gridSpan as number;
  const tiers = params.elevationTiers as number;
  const divisions = Math.max(2, Math.round(rawSpan / (step * 2)) * 2);
  const effectiveSpan = divisions * step;
  const centerColor = params.centerColor as string;
  const gridColor = params.gridColor as string;

  // generate spatial coordinates for snapping point matrix at cell corners
  const pointPositions = useMemo(() => {
    const positions: number[] = [];
    const halfCount = divisions / 2;

    for (let yLevel = 0; yLevel <= tiers; yLevel++) {
      const y = yLevel * step;
      for (let x = -halfCount; x <= halfCount; x++) {
        for (let z = -halfCount; z <= halfCount; z++) {
          positions.push(x * step, y, z * step);
        }
      }
    }
    return new Float32Array(positions);
  }, [divisions, step, tiers]);

  // custom shader uniforms memoized for circular glowing nodes
  const pointUniforms = useMemo(
    () => ({
      uSize: { value: params.pointSize },
      uColor: { value: new THREE.Color(gridColor) },
    }),
    [params.pointSize, gridColor],
  );

  if (!params.visible) return null;

  return (
    <group ref={groupRef}>
      {/* horizontal floor plane at baseline ground elevation */}
      {params.showFloor && (
        <gridHelper
          args={[effectiveSpan, divisions, centerColor, gridColor]}
          position={[0, 0, 0]}
        />
      )}

      {/* three dimensional snapping points matrix across spatial tiers */}
      {params.showPoints && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[pointPositions, 3]}
            />
          </bufferGeometry>
          <shaderMaterial
            transparent
            depthWrite={false}
            uniforms={pointUniforms}
            vertexShader={`
              uniform float uSize;
              void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = uSize * (260.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
              }
            `}
            fragmentShader={`
              uniform vec3 uColor;
              void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
                gl_FragColor = vec4(uColor, alpha * 0.95);
              }
            `}
          />
        </points>
      )}

      {/* vertical elevation plane rising from ground baseline upward */}
      {params.showPlanes && (
        <>
          <gridHelper
            args={[effectiveSpan, divisions, centerColor, gridColor]}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, effectiveSpan / 2, 0]}
          />
          <gridHelper
            args={[effectiveSpan, divisions, centerColor, gridColor]}
            rotation={[0, 0, Math.PI / 2]}
            position={[0, effectiveSpan / 2, 0]}
          />
        </>
      )}
    </group>
  );
};

export default GridHelperXYZ;
