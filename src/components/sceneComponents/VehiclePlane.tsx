import { forwardRef, useRef, useEffect } from "react";
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
import type { VehicleProps } from "../../stores/useVehicleStore";
import TrailEngine from "./TrailEngine";
import { useCustomizationStore } from "../../stores/useCustomizationStore";

// define strict types for the airframe geometry
type typeAirframeGLTF = GLTF & {
  nodes: {
    planeBody: THREE.Mesh;
    planeStripes: THREE.Mesh;
  };
  materials: {
    bodyBlack: THREE.MeshStandardMaterial;
    stripesWhite: THREE.MeshStandardMaterial;
  };
};

// define strict types for the cockpit geometry
type typeCockpitGLTF = GLTF & {
  nodes: {
    planeCockpit: THREE.Mesh;
  };
  materials: {
    cockpitBlue: THREE.MeshStandardMaterial;
  };
};

// main vehicle component with four point sketchbook physics
const VehiclePlane = forwardRef<THREE.Group, VehicleProps>(
  ({ spawnMode }, ref) => {
    const initialSpawn = respawnValues[spawnMode].plane;

    const visualRef = useRef<THREE.Group>(null);

    // strict reference to the physics body so the hook can manipulate it
    const chassisRef = useRef<RapierRigidBody>(null);

    // initialize global input listener to capture flight controls and structural keys
    const controls = useAllVehicleInput();

    // extract the live plane mods from the customization store
    const planeMods = useCustomizationStore((state) => state.planeMods);

    // initialize tweakpane hook and store reactive parameters
    const params = useTweakpane(
      { title: "✈️ Plane Tuning", expanded: false },
      vehiclePlaneConstants.tuning,
    );

    // extract debug boolean
    const debugMesh = unwrapParam(params.debugMesh, false);

    // attach the plane physics hook to handle respawning
    useVehiclePlaneCreator(chassisRef, controls, params);

    // load the separated models
    const airframeGLTF = useGLTF(
      modelsSeperatedBank.lightPlane01airframe,
    ) as unknown as typeAirframeGLTF;
    const cockpitGLTF = useGLTF(
      modelsSeperatedBank.lightPlane01cockpit,
    ) as unknown as typeCockpitGLTF;

    // dynamically apply custom paint jobs from store to the plane materials
    useEffect(() => {
      // apply base airframe properties
      airframeGLTF.materials.bodyBlack.color.set(planeMods.base.color);
      airframeGLTF.materials.bodyBlack.metalness = planeMods.base.metalness;
      airframeGLTF.materials.bodyBlack.roughness = planeMods.base.roughness;
      airframeGLTF.materials.bodyBlack.emissive.set(planeMods.base.color);
      airframeGLTF.materials.bodyBlack.emissiveIntensity =
        planeMods.base.emission;

      // apply emissive stripes properties
      airframeGLTF.materials.stripesWhite.color.set(planeMods.neon.color);
      airframeGLTF.materials.stripesWhite.metalness = planeMods.neon.metalness;
      airframeGLTF.materials.stripesWhite.roughness = planeMods.neon.roughness;
      airframeGLTF.materials.stripesWhite.emissive.set(planeMods.neon.color);
      airframeGLTF.materials.stripesWhite.emissiveIntensity =
        planeMods.neon.emission;

      // apply cockpit glass properties
      cockpitGLTF.materials.cockpitBlue.color.set(planeMods.glass.color);
      cockpitGLTF.materials.cockpitBlue.metalness = planeMods.glass.metalness;
      cockpitGLTF.materials.cockpitBlue.roughness = planeMods.glass.roughness;
      cockpitGLTF.materials.cockpitBlue.emissive.set(planeMods.glass.color);
      cockpitGLTF.materials.cockpitBlue.emissiveIntensity =
        planeMods.glass.emission;

      // manually flag shaders for update in case properties changed drastically
      airframeGLTF.materials.bodyBlack.needsUpdate = true;
      airframeGLTF.materials.stripesWhite.needsUpdate = true;
      cockpitGLTF.materials.cockpitBlue.needsUpdate = true;
    }, [planeMods, airframeGLTF.materials, cockpitGLTF.materials]);

    // dynamically toggle wireframe directly on the shared materials
    useEffect(() => {
      airframeGLTF.materials.bodyBlack.wireframe = debugMesh;
      airframeGLTF.materials.stripesWhite.wireframe = debugMesh;
      cockpitGLTF.materials.cockpitBlue.wireframe = debugMesh;

      airframeGLTF.materials.bodyBlack.needsUpdate = true;
      airframeGLTF.materials.stripesWhite.needsUpdate = true;
      cockpitGLTF.materials.cockpitBlue.needsUpdate = true;
    }, [debugMesh, airframeGLTF.materials, cockpitGLTF.materials]);

    // extract visual offsets
    const pPosX = unwrapParam(params.planePosX, 0);
    const pPosY = unwrapParam(params.planePosY, 0);
    const pPosZ = unwrapParam(params.planePosZ, 2.7);

    const cPosX = unwrapParam(params.cockpitPosX, 0);
    const cPosY = unwrapParam(params.cockpitPosY, 0.68);
    const cPosZ = unwrapParam(params.cockpitPosZ, -2.8);

    return (
      <group>
        <RigidBody
          ref={chassisRef}
          colliders={false}
          canSleep={false}
          position={initialSpawn.position} // moved to rigidbody so trails stay at true 0,0,0
          rotation={initialSpawn.rotation} // moved to rigidbody
        >
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
          <group position={[pPosX, pPosY, pPosZ]} ref={visualRef}>
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
                    material={airframeGLTF.materials.bodyBlack}
                  />
                  <mesh
                    name="planeStripes"
                    castShadow
                    receiveShadow
                    geometry={airframeGLTF.nodes.planeStripes.geometry}
                    material={airframeGLTF.materials.stripesWhite}
                  />
                </group>
              </group>

              {/* cockpit attached with dialable anchor */}
              <group position={[cPosX, cPosY, cPosZ]}>
                <mesh
                  name="planeCockpit"
                  castShadow
                  receiveShadow
                  geometry={cockpitGLTF.nodes.planeCockpit.geometry}
                  material={cockpitGLTF.materials.cockpitBlue}
                />
              </group>
            </group>
          </group>
        </RigidBody>
        {/* side trails */}
        <TrailEngine
          targetRef={visualRef}
          offset={[-13.65, 0.4, -3.2]}
          color={planeMods.trailColor}
          height={0.1}
          width={0.1}
          length={100}
        />
        <TrailEngine
          targetRef={visualRef}
          offset={[13.65, 0.4, -3.2]}
          color={planeMods.trailColor}
          height={0.1}
          width={0.1}
          length={100}
        />
        {/* center trails */}
        <TrailEngine
          targetRef={visualRef}
          offset={[-0.5, 0, 12.3]}
          color={planeMods.trailColor}
          height={0.1}
          width={0.1}
          length={200}
        />
        <TrailEngine
          targetRef={visualRef}
          offset={[0.5, 0, 12.3]}
          color={planeMods.trailColor}
          height={0.1}
          width={0.1}
          length={200}
        />
      </group>
    );
  },
);

// assign display name for react devtools compatibility
VehiclePlane.displayName = "VehiclePlane";

export default VehiclePlane;

// preload assets to prevent frame drops on mount
useGLTF.preload(modelsSeperatedBank.lightPlane01airframe);
useGLTF.preload(modelsSeperatedBank.lightPlane01cockpit);
