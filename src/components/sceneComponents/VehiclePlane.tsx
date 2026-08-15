import { forwardRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import { modelsSeperatedBank } from "../../utils/assetpaths";
import {
  vehiclePlaneConstants,
  vehicleRespawnValues,
} from "../../constants/otherConstants";
import { getVal } from "../../utils/getVal";

// define strict types for the airframe geometry
type typeAirframeGLTF = GLTF & {
  nodes: {
    planeBody: THREE.Mesh;
    planeStripes: THREE.Mesh;
    planeThrusters: THREE.Mesh;
  };
  materials: {
    ["black.001"]: THREE.MeshStandardMaterial;
    ["tron.002"]: THREE.MeshStandardMaterial;
    ["tron.003"]: THREE.MeshStandardMaterial;
  };
};

// define strict types for the cockpit geometry
type typeCockpitGLTF = GLTF & {
  nodes: {
    planeCockpit: THREE.Mesh;
  };
  materials: {
    ["Material.001"]: THREE.MeshStandardMaterial;
  };
};

// main vehicle component purely for visual rendering
const VehiclePlane = forwardRef<THREE.Group>((_props, ref) => {
  // initialize tweakpane hook and store reactive parameters
  const params = useTweakpane(
    { title: "✈️ Plane Tuning", expanded: false },
    vehiclePlaneConstants.tuning,
  );

  // load the separated models
  const airframeGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01airframe,
  ) as unknown as typeAirframeGLTF;
  const cockpitGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01cockpit,
  ) as unknown as typeCockpitGLTF;

  // extract visual offsets
  const pPosX = getVal(params.planePosX, 0);
  const pPosY = getVal(params.planePosY, 0);
  const pPosZ = getVal(params.planePosZ, 2.7);

  const cPosX = getVal(params.cockpitPosX, 0);
  const cPosY = getVal(params.cockpitPosY, 0.68);
  const cPosZ = getVal(params.cockpitPosZ, -2.8);

  return (
    <group
      position={vehicleRespawnValues.plane.position}
      rotation={vehicleRespawnValues.plane.rotation}
    >
      {/* offset group for tweakpane tuning */}
      <group position={[pPosX, pPosY, pPosZ]}>
        {/* visual elements perfectly wrapped in the forwarded ref group */}
        <group ref={ref}>
          {/* core airframe hierarchy mapped directly from blender export */}
          <group name="Scene">
            <group name="origin">
              <mesh
                name="planeBody"
                castShadow
                receiveShadow
                geometry={airframeGLTF.nodes.planeBody.geometry}
                material={airframeGLTF.materials["black.001"]}
              >
                <mesh
                  name="planeStripes"
                  castShadow
                  receiveShadow
                  geometry={airframeGLTF.nodes.planeStripes.geometry}
                  material={airframeGLTF.materials["tron.002"]}
                />
                <mesh
                  name="planeThrusters"
                  castShadow
                  receiveShadow
                  geometry={airframeGLTF.nodes.planeThrusters.geometry}
                  material={airframeGLTF.materials["tron.003"]}
                />
              </mesh>
            </group>
          </group>

          {/* cockpit attached with dialable anchor */}
          <group position={[cPosX, cPosY, cPosZ]}>
            <mesh
              name="planeCockpit"
              castShadow
              receiveShadow
              geometry={cockpitGLTF.nodes.planeCockpit.geometry}
              material={cockpitGLTF.materials["Material.001"]}
            />
          </group>
        </group>
      </group>
    </group>
  );
});

// assign display name for react devtools compatibility
VehiclePlane.displayName = "VehiclePlane";

export default VehiclePlane;

// preload assets to prevent frame drops on mount
useGLTF.preload(modelsSeperatedBank.lightPlane01airframe);
useGLTF.preload(modelsSeperatedBank.lightPlane01cockpit);
