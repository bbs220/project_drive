import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Stats, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { sceneConstants } from "../../constants/otherConstants";
import Floor from "./Floor";
import PostprocessingEffects from "./PostprocessingEffects";
import { useTweakpane } from "../../hooks/useTweakpane";
import { Physics } from "@react-three/rapier";
import CustomizationUI from "../CustomizationUI";
import { useCustomizationStore } from "../../stores/useCustomizationStore";
import VehicleCar from "./VehicleCar";
import VehiclePlane from "./VehiclePlane";
import VehicleHelicopter from "./VehicleHelicopter";
import GarageLights from "./GarageLights";

const GarageScene = () => {
  // pull the active vehicle string from your store
  const activeGarageVehicle = useCustomizationStore(
    (state) => state.activeGarageVehicle,
  );

  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const {
    fogValue,
    fogColor,
    carMinZoom,
    carMaxZoom,
    carTargetY,
    planeMinZoom,
    planeMaxZoom,
    planeTargetY,
    heliMinZoom,
    heliMaxZoom,
    heliTargetY,
  } = useTweakpane(
    { title: "☀️ Scene", expanded: true },
    {
      fogValue: { value: 0.03, min: 0.01, max: 1, label: "fog amount" },
      fogColor: { value: "#003535", label: "fog color" },

      // dedicated zoom limits for each vehicle to prevent camera clipping
      carMinZoom: { value: 6, min: 1, max: 50, label: "car min zoom" },
      carMaxZoom: { value: 9, min: 2, max: 50, label: "car max zoom" },
      carTargetY: { value: 0.6, min: -10, max: 10, label: "car target y" },

      planeMinZoom: { value: 19, min: 2, max: 50, label: "plane min zoom" },
      planeMaxZoom: { value: 32, min: 5, max: 50, label: "plane max zoom" },
      planeTargetY: { value: 1.5, min: -10, max: 10, label: "plane target y" },

      heliMinZoom: { value: 11, min: 1, max: 50, label: "heli min zoom" },
      heliMaxZoom: { value: 22, min: 3, max: 50, label: "heli max zoom" },
      heliTargetY: { value: 2.5, min: -10, max: 10, label: "heli target y" },
    },
  );

  // dynamically select the correct min, max, and target height based on the active vehicle
  const currentMinZoom =
    activeGarageVehicle === "car"
      ? (carMinZoom as number)
      : activeGarageVehicle === "plane"
        ? (planeMinZoom as number)
        : (heliMinZoom as number);

  const currentMaxZoom =
    activeGarageVehicle === "car"
      ? (carMaxZoom as number)
      : activeGarageVehicle === "plane"
        ? (planeMaxZoom as number)
        : (heliMaxZoom as number);

  const currentTargetY =
    activeGarageVehicle === "car"
      ? (carTargetY as number)
      : activeGarageVehicle === "plane"
        ? (planeTargetY as number)
        : (heliTargetY as number);

  // automatically push the camera back to max distance whenever the vehicle changes
  useEffect(() => {
    if (controlsRef.current) {
      const target = new THREE.Vector3(0, currentTargetY, 0);

      // calculate the current viewing angle from the target to the camera
      let direction = camera.position.clone().sub(target).normalize();

      // fallback just in case the camera perfectly overlaps the target somehow
      if (direction.lengthSq() === 0) {
        direction = new THREE.Vector3(0, 0, 1);
      }

      // multiply that direction by the max zoom and apply the new position
      const newPos = target
        .clone()
        .add(direction.multiplyScalar(currentMaxZoom));
      camera.position.copy(newPos);

      // manually update the orbit controls to register the new position
      controlsRef.current.update();
    }
  }, [activeGarageVehicle, currentMaxZoom, currentTargetY, camera]);

  return (
    <>
      <PerspectiveCamera makeDefault fov={35} position={[0, 3, 8]} />
      <Stats showPanel={sceneConstants.isDev ? 0 : 4} />
      <fogExp2 attach="fog" args={[fogColor as string, fogValue as number]} />
      <color attach="background" args={[fogColor as string]} />

      {/* lock the camera so the user cannot clip under the floor, and use our dynamic zoom constraints */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={currentMinZoom}
        maxDistance={currentMaxZoom}
        target={[0, currentTargetY, 0]}
      />

      {/* core showroom floor */}
      <Floor />

      {/* dynamic quad directional lights */}
      <GarageLights />

      {/* conditionally render only the active vehicle */}
      {activeGarageVehicle === "car" && <VehicleCar spawnMode="garage" />}
      {activeGarageVehicle === "plane" && <VehiclePlane spawnMode="garage" />}
      {activeGarageVehicle === "helicopter" && (
        <VehicleHelicopter spawnMode="garage" />
      )}
    </>
  );
};

const GarageCanvas = () => {
  // configure main canvas physics and rendering
  const { setDpr } = useTweakpane(
    { title: "☀️ Scene", expanded: true },
    {
      setDpr: {
        value: 1,
        min: 0.1,
        max: 1,
        step: 0.1,
        label: "viewport resolution",
      },
    },
  );

  return (
    // enabling shadows is critical for the showroom aesthetic
    <>
      <Canvas shadows={"variance"} dpr={setDpr as number}>
        <Physics>
          <GarageScene />
        </Physics>
        <PostprocessingEffects />
      </Canvas>
      <CustomizationUI />
    </>
  );
};

export default GarageCanvas;
