import { forwardRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useGLTF } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import { RigidBody, BallCollider } from "@react-three/rapier";
import { modelsSeperatedBank } from "../../utils/assetpaths";
import {
  vehiclePlaneConstants,
  vehicleRespawnValues,
} from "../../constants/otherConstants";
import { unwrapParam } from "../../utils/unwrapParam";

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
  const pPosX = unwrapParam(params.planePosX, 0);
  const pPosY = unwrapParam(params.planePosY, 0);
  const pPosZ = unwrapParam(params.planePosZ, 2.7);

  const cPosX = unwrapParam(params.cockpitPosX, 0);
  const cPosY = unwrapParam(params.cockpitPosY, 0.68);
  const cPosZ = unwrapParam(params.cockpitPosZ, -2.8);

  // extract asymmetric physics parameters
  const bRadius = unwrapParam(params.bearingRadius, 1.75);
  const bMass = unwrapParam(params.bearingMass, 25);
  const wingOffset = unwrapParam(params.wingOffset, 10);
  const noseOffsetZ = unwrapParam(params.noseOffsetZ, -10);
  const tailOffsetZ = unwrapParam(params.tailOffsetZ, 10);
  const bOffsetY = unwrapParam(params.bearingOffsetY, -0.65);

  return (
    <group
      position={vehicleRespawnValues.plane.position}
      rotation={vehicleRespawnValues.plane.rotation}
    >
      <RigidBody colliders={false} canSleep={false}>
        {/* left wing bearing */}
        <BallCollider
          args={[bRadius]}
          position={[wingOffset, bOffsetY, 0]}
          mass={bMass}
        />
        {/* right wing bearing */}
        <BallCollider
          args={[bRadius]}
          position={[-wingOffset, bOffsetY, 0]}
          mass={bMass}
        />
        {/* nose bearing pulling custom z offset */}
        <BallCollider
          args={[bRadius]}
          position={[0, bOffsetY, noseOffsetZ]}
          mass={bMass}
        />
        {/* tail bearing pulling custom z offset */}
        <BallCollider
          args={[bRadius]}
          position={[0, bOffsetY, tailOffsetZ]}
          mass={bMass}
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
