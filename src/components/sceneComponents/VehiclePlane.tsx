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
  vehicleRespawnLimit,
  vehicleRespawnPos,
} from "../../constants/otherConstants";
import { useFrame } from "@react-three/fiber";
import respawnVehicle from "../../utils/respawnVehicle";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";
import { useTweakpane } from "../../hooks/useTweakpane";

// main plane component with built in respawn
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

  // initialize plane physics controller with required arguments
  useVehiclePlaneCreator(chassisRef, vehicleInput, params);

  // handle respawn logic
  useFrame(() => {
    // exit early if chassis is missing
    if (!chassisRef.current) return;

    // check if vehicle has fallen below bounds
    if (chassisRef.current.translation().y < vehicleRespawnLimit) {
      // trigger extracted respawn function
      respawnVehicle({
        vehicleBody: chassisRef.current,
        x: vehicleRespawnPos.plane[0],
        y: vehicleRespawnPos.plane[1],
        z: vehicleRespawnPos.plane[2],
      });
    }
  });

  return (
    <group>
      <RigidBody
        ref={chassisRef}
        colliders={false}
        friction={0}
        position={vehicleRespawnPos.plane}
        canSleep={false}
      >
        {/* manual collider for main fuselage */}
        <CuboidCollider
          args={vehiclePlaneConstants.colliders.fuselageArgs}
          position={vehiclePlaneConstants.colliders.fuselagePos}
        />

        {/* manual collider for wings */}
        <CuboidCollider
          args={vehiclePlaneConstants.colliders.wingsArgs}
          position={vehiclePlaneConstants.colliders.wingsPos}
        />

        {/* manual collider encompassing all landing gear wheels to prevent ground clipping */}
        <CuboidCollider
          args={vehiclePlaneConstants.colliders.wheelsArgs}
          position={vehiclePlaneConstants.colliders.wheelsPos}
        />

        {/* group to hold visual meshes and camera target ref */}
        <group ref={ref}>
          {/* create main fuselage using a stretched capsule */}
          <mesh rotation={[vehiclePlaneConstants.rotations.quarterTurn, 0, 0]}>
            <capsuleGeometry
              args={vehiclePlaneConstants.visuals.fuselageArgs}
            />
            <meshStandardMaterial color={"green"} />
          </mesh>

          {/* create dark cockpit window at the front */}
          <mesh position={vehiclePlaneConstants.visuals.cockpitPos}>
            <sphereGeometry args={vehiclePlaneConstants.visuals.cockpitArgs} />
            <meshStandardMaterial color={"black"} />
          </mesh>

          {/* create single low wing spanning across both sides */}
          <mesh position={vehiclePlaneConstants.visuals.wingPos}>
            <boxGeometry args={vehiclePlaneConstants.visuals.wingArgs} />
            <meshStandardMaterial color={"gray"} />
          </mesh>

          {/* create signature top mounted turbine engine */}
          <mesh
            position={vehiclePlaneConstants.visuals.turbinePos}
            rotation={[vehiclePlaneConstants.rotations.quarterTurn, 0, 0]}
          >
            <cylinderGeometry
              args={vehiclePlaneConstants.visuals.turbineArgs}
            />
            <meshStandardMaterial color={"darkslategray"} />
          </mesh>

          {/* create left v tail stabilizer angled outward */}
          <mesh
            position={vehiclePlaneConstants.visuals.leftTailPos}
            rotation={[0, 0, vehiclePlaneConstants.rotations.eighthTurn]}
          >
            <boxGeometry args={vehiclePlaneConstants.visuals.tailArgs} />
            <meshStandardMaterial color={"gray"} />
          </mesh>

          {/* create right v tail stabilizer angled outward */}
          <mesh
            position={vehiclePlaneConstants.visuals.rightTailPos}
            rotation={[0, 0, -vehiclePlaneConstants.rotations.eighthTurn]}
          >
            <boxGeometry args={vehiclePlaneConstants.visuals.tailArgs} />
            <meshStandardMaterial color={"gray"} />
          </mesh>

          {/* create front landing gear strut and wheel */}
          <group position={vehiclePlaneConstants.visuals.frontGearPos}>
            <mesh position={vehiclePlaneConstants.visuals.strutPos}>
              <cylinderGeometry
                args={vehiclePlaneConstants.visuals.strutArgs}
              />
              <meshStandardMaterial color={"gray"} />
            </mesh>
            <mesh
              position={vehiclePlaneConstants.visuals.frontWheelPos}
              rotation={[0, 0, vehiclePlaneConstants.rotations.quarterTurn]}
            >
              <cylinderGeometry
                args={vehiclePlaneConstants.visuals.frontWheelArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>

          {/* create left rear landing gear */}
          <group position={vehiclePlaneConstants.visuals.leftRearGearPos}>
            <mesh position={vehiclePlaneConstants.visuals.strutPos}>
              <cylinderGeometry
                args={vehiclePlaneConstants.visuals.strutArgs}
              />
              <meshStandardMaterial color={"gray"} />
            </mesh>
            <mesh
              position={vehiclePlaneConstants.visuals.rearWheelPos}
              rotation={[0, 0, vehiclePlaneConstants.rotations.quarterTurn]}
            >
              <cylinderGeometry
                args={vehiclePlaneConstants.visuals.rearWheelArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>

          {/* create right rear landing gear */}
          <group position={vehiclePlaneConstants.visuals.rightRearGearPos}>
            <mesh position={vehiclePlaneConstants.visuals.strutPos}>
              <cylinderGeometry
                args={vehiclePlaneConstants.visuals.strutArgs}
              />
              <meshStandardMaterial color={"gray"} />
            </mesh>
            <mesh
              position={vehiclePlaneConstants.visuals.rearWheelPos}
              rotation={[0, 0, vehiclePlaneConstants.rotations.quarterTurn]}
            >
              <cylinderGeometry
                args={vehiclePlaneConstants.visuals.rearWheelArgs}
              />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </group>
        </group>
      </RigidBody>
    </group>
  );
});

// assign display name for react devtools
VehiclePlane.displayName = "VehiclePlane";

export default VehiclePlane;
