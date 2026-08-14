import {
  CoefficientCombineRule,
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

  // initialize tweakpane hook using extracted constants (strictly targeting the tuning wrapper)
  const params = useTweakpane(
    { title: "✈️ Plane Tuning", expanded: false },
    vehiclePlaneConstants.tuning,
  );

  // offload physics and animation logic to custom hook
  useVehiclePlaneCreator(chassisRef, vehicleInput, params as any);

  // load the separated models
  const airframeGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01airframe,
  ) as unknown as typeAirframeGLTF;
  const cockpitGLTF = useGLTF(
    modelsSeperatedBank.lightPlane01cockpit,
  ) as unknown as typeCockpitGLTF;

  // Helper to safely extract values from Tweakpane objects
  const getVal = (param: any, fallback: number) =>
    param?.value ?? param ?? fallback;

  // Extract dimensions for the plane
  const pWidth = getVal(params.planeWidth, 8.5);
  const pHeight = getVal(params.planeHeight, 3.5);
  const pLength = getVal(params.planeLength, 20);
  const pPosX = getVal(params.planePosX, 0);
  const pPosY = getVal(params.planePosY, 0);
  const pPosZ = getVal(params.planePosZ, 2.7);
  const mass = getVal(params.planeMass, 100);

  // Extract cockpit visual offset
  const cPosX = getVal(params.cockpitPosX, 0);
  const cPosY = getVal(params.cockpitPosY, 0.68);
  const cPosZ = getVal(params.cockpitPosZ, -2.8);

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
        {/* Main Hull Collider */}
        <CuboidCollider
          args={[pWidth / 2, pHeight / 2, pLength / 2]}
          position={[pPosX, pPosY, pPosZ]}
          mass={mass}
        />

        {/* INVISIBLE LANDING GEAR SKIDS (Friction = 0 to prevent drag) */}
        {/* Left Sled */}
        <CuboidCollider
          args={[0.2, 0.4, pLength / 2 - 1]} // long thin box
          position={[-pWidth / 2 + 1, pPosY - pHeight / 2 - 0.2, pPosZ]}
          friction={0}
          frictionCombineRule={CoefficientCombineRule.Min}
        />
        {/* Right Sled */}
        <CuboidCollider
          args={[0.2, 0.4, pLength / 2 - 1]} // long thin box
          position={[pWidth / 2 - 1, pPosY - pHeight / 2 - 0.2, pPosZ]}
          friction={0}
          frictionCombineRule={CoefficientCombineRule.Min}
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
