import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Stats, OrbitControls } from "@react-three/drei";
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
import RotatingScannerLights from "./RotatingScannerLights";

const GarageScene = () => {
  // pull the active vehicle string from your store
  const activeGarageVehicle = useCustomizationStore(
    (state) => state.activeGarageVehicle,
  );

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

  return (
    <>
      <PerspectiveCamera makeDefault fov={35} position={[0, 3, 8]} />
      <Stats showPanel={sceneConstants.isDev ? 0 : 4} />
      <fogExp2 attach="fog" args={[fogColor as string, fogValue as number]} />
      <color attach="background" args={[fogColor as string]} />

      {/* lock the camera so the user cannot clip under the floor, and use our dynamic zoom/target constraints */}
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={currentMinZoom}
        maxDistance={currentMaxZoom}
        target={[0, currentTargetY, 0]}
      />

      {/* quad spotlight setup targeting the center origin */}
      {/* front right */}
      <spotLight
        position={[4, 5, 4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />
      {/* front left */}
      <spotLight
        position={[-4, 5, 4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />
      {/* back right */}
      <spotLight
        position={[4, 5, -4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />
      {/* back left */}
      <spotLight
        position={[-4, 5, -4]}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        castShadow
      />

      {/* core showroom floor */}
      <Floor />

      <RotatingScannerLights />

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
      <Canvas shadows={"soft"} dpr={setDpr as number}>
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
