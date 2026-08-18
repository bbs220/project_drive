import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import {
  RigidBody,
  type RapierRigidBody,
  RoundCuboidCollider,
} from "@react-three/rapier";
import { modelsSeperatedBank } from "../../utils/assetpaths";
import {
  vehiclePlaneConstants,
  respawnValues,
} from "../../constants/otherConstants";
import { unwrapParam } from "../../utils/unwrapParam";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { useVehiclePlaneCreator } from "../../hooks/useVehiclePlaneCreator";

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

// main vehicle component with four point sketchbook physics
const VehiclePlane = forwardRef<THREE.Group>((_props, ref) => {
  // strict reference to the physics body so the hook can manipulate it
  const chassisRef = useRef<RapierRigidBody>(null);

  // initialize global input listener to capture flight controls and structural keys
  const controls = useAllVehicleInput();

  // initialize tweakpane hook and store reactive parameters
  const params = useTweakpane(
    { title: "✈️ Plane Tuning", expanded: false },
    vehiclePlaneConstants.tuning,
  );
  // attach the plane physics hook to handle respawning
  useVehiclePlaneCreator(chassisRef, controls, params);

  // load the separated models
  const airframeGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01airframe,
  ) as unknown as typeAirframeGLTF;
  const cockpitGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01cockpit,
  ) as unknown as typeCockpitGLTF;

  // extract visual offsets
  const pPosX = unwrapParam(params.planePosX, 0);
  const pPosY = unwrapParam(params.planePosY, 0);
  const pPosZ = unwrapParam(params.planePosZ, 2.7);

  const cPosX = unwrapParam(params.cockpitPosX, 0);
  const cPosY = unwrapParam(params.cockpitPosY, 0.68);
  const cPosZ = unwrapParam(params.cockpitPosZ, -2.8);

  return (
    <group
      position={respawnValues.drive.plane.position}
      rotation={respawnValues.drive.plane.rotation}
    >
      <RigidBody ref={chassisRef} colliders={false} canSleep={false}>
        {/* central fuselage collider. wings are intentionally left as ghost meshes so they do not snag on buildings */}
        <RoundCuboidCollider
          args={[
            unwrapParam(params.chassisWidth, 1.5),
            unwrapParam(params.chassisHeight, 1.0),
            unwrapParam(params.chassisLength, 5.0),
            unwrapParam(params.chassisRadius, 0.2),
          ]}
          position={[0, 0, 0]}
          mass={unwrapParam(params.chassisMass, 500)}
        />

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
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools compatibility
VehiclePlane.displayName = "VehiclePlane";

export default VehiclePlane;

// preload assets to prevent frame drops on mount
useGLTF.preload(modelsSeperatedBank.lightPlane01airframe);
useGLTF.preload(modelsSeperatedBank.lightPlane01cockpit);
