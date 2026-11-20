import { useRef } from "react";
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
        value: worldConstants.chunkSize,
        min: 100,
        max: 2000,
        step: 100,
        label: "grid span (m)",
      },
      centerColor: { value: "#ffffff", label: "center line" },
      gridColor: { value: "#00ff66", label: "grid line" },
      showXZ: { value: true, label: "floor plane (xz)" },
      showXY: { value: true, label: "front plane (xy)" },
      showYZ: { value: true, label: "side plane (yz)" },
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

  if (!params.visible) return null;

  const step = params.cellSize as number;
  const span = params.gridSpan as number;
  const divisions = Math.max(1, Math.round(span / step));
  const centerColor = params.centerColor as string;
  const gridColor = params.gridColor as string;

  return (
    <group ref={groupRef}>
      {/* horizontal floor plane at baseline ground elevation */}
      {params.showXZ && (
        <gridHelper
          args={[span, divisions, centerColor, gridColor]}
          position={[0, 0, 0]}
        />
      )}

      {/* vertical elevation plane rising from ground baseline upward */}
      {params.showXY && (
        <gridHelper
          args={[span, divisions, centerColor, gridColor]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, span / 2, 0]}
        />
      )}

      {/* vertical lateral plane rising from ground baseline upward */}
      {params.showYZ && (
        <gridHelper
          args={[span, divisions, centerColor, gridColor]}
          rotation={[0, 0, Math.PI / 2]}
          position={[0, span / 2, 0]}
        />
      )}
    </group>
  );
};

export default GridHelperXYZ;
