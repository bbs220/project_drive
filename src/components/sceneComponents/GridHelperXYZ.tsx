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
      showXZ: { value: true, label: "floor plane (xz)" },
      showXY: { value: true, label: "front plane (xy)" },
      showYZ: { value: true, label: "side plane (yz)" },
      showSnapBox: { value: true, label: "snap box (cube)" },
      followTarget: { value: true, label: "snap to target" },
      elevationStep: {
        value: 0,
        min: 0,
        max: 500,
        step: 100,
        label: "y elevation",
      },
    },
  );

  // container group tracking snapped world coordinates
  const groupRef = useRef<THREE.Group>(null);
  // bounding box group marking active block footprint
  const snapBoxRef = useRef<THREE.Group>(null);
  // temporary vector for extracting world coordinates
  const dummyVec = useRef(new THREE.Vector3());

  // track active target position and calculate grid snap
  useFrame(() => {
    if (!groupRef.current) return;

    if (params.followTarget && targetRef?.current) {
      targetRef.current.getWorldPosition(dummyVec.current);

      const step = params.cellSize as number;
      const sx = Math.floor(dummyVec.current.x / step) * step;
      const sz = Math.floor(dummyVec.current.z / step) * step;
      const sy = params.elevationStep as number;

      groupRef.current.position.set(sx + step / 2, sy, sz + step / 2);

      if (snapBoxRef.current) {
        snapBoxRef.current.position.set(0, step / 2, 0);
      }
    }
  });

  if (!params.visible) return null;

  const step = params.cellSize as number;
  const span = params.gridSpan as number;
  const divisions = Math.max(1, Math.round(span / step));

  return (
    <group ref={groupRef}>
      {/* horizontal floor plane tracking elevation level */}
      {params.showXZ && (
        <gridHelper
          args={[span, divisions, "#00f3ff", "#004455"]}
          position={[0, 0.05, 0]}
        />
      )}

      {/* vertical elevation plane showing longitudinal profile */}
      {params.showXY && (
        <gridHelper
          args={[span, divisions, "#ff00ff", "#550044"]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, span / 2, 0]}
        />
      )}

      {/* vertical lateral plane showing cross section profile */}
      {params.showYZ && (
        <gridHelper
          args={[span, divisions, "#ffe600", "#554400"]}
          rotation={[0, 0, Math.PI / 2]}
          position={[0, span / 2, 0]}
        />
      )}

      {/* active block footprint highlighting piece volume */}
      {params.showSnapBox && (
        <group ref={snapBoxRef} position={[0, step / 2, 0]}>
          {/* wireframe cube marking the active piece footprint */}
          <mesh>
            <boxGeometry args={[step, step, step]} />
            <meshBasicMaterial
              color="#00f3ff"
              wireframe
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* subtle tinted volume for visual depth */}
          <mesh>
            <boxGeometry args={[step, step, step]} />
            <meshBasicMaterial
              color="#00f3ff"
              transparent
              opacity={0.06}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default GridHelperXYZ;
