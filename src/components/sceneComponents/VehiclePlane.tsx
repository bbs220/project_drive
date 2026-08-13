import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { useVehiclePlaneCreator } from "../../hooks/useVehiclePlaneCreator";
import {
  vehiclePlaneConstants,
  vehicleRespawnPos,
  vehicleRespawnRot,
} from "../../constants/otherConstants";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import { modelsSeperatedBank } from "../../utils/assetpaths";

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

// main vehicle component updated to match group typing
const VehiclePlane = forwardRef<THREE.Group>((_props, ref) => {
  // ref for the main chassis rigid body
  const chassisRef = useRef<RapierRigidBody>(null);

  // initialize vehicle controls
  const vehicleInput = useAllVehicleInput();

  // initialize tweakpane hook using extracted constants
  const params = useTweakpane(
    { title: "✈️ Plane Tuning", expanded: false },
    vehiclePlaneConstants.tuning,
  );

  // offload physics and animation logic to custom hook
  useVehiclePlaneCreator(chassisRef, vehicleInput, params);

  // load the separated models
  const airframeGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01airframe,
  ) as unknown as typeAirframeGLTF;
  const cockpitGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01cockpit,
  ) as unknown as typeCockpitGLTF;

  return (
    <group>
      <RigidBody
        ref={chassisRef}
        colliders={false}
        friction={vehiclePlaneConstants.physics.friction}
        position={vehicleRespawnPos.plane}
        rotation={[
          vehicleRespawnRot.plane.x,
          vehicleRespawnRot.plane.y,
          vehicleRespawnRot.plane.z,
        ]}
        canSleep={false}
      >
        {/* dynamic plane collider */}
        <CuboidCollider
          args={[
            params.planeWidth / 2,
            params.planeHeight / 2,
            params.planeLength / 2,
          ]}
          position={[params.planePosX, params.planePosY, params.planePosZ]}
          mass={params.planeMass}
        />

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

          {/* cockpit attached with dialable xyz anchor */}
          <group
            position={[
              params.cockpitPosX,
              params.cockpitPosY,
              params.cockpitPosZ,
            ]}
          >
            <mesh
              name="planeCockpit"
              castShadow
              receiveShadow
              geometry={cockpitGLTF.nodes.planeCockpit.geometry}
              material={cockpitGLTF.materials["Material.001"]}
            />
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
