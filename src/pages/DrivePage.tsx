import { useEffect } from "react";
import DriveCanvas from "../components/sceneComponents/DriveCanvas";
import { useAppStore } from "../stores/useAppStore";
import SceneLoader from "../components/sceneComponents/SceneLoader";

const DrivePage = () => {
  const setActiveScene = useAppStore((state) => state.setActiveScene);

  // tell the 3d world we are entering drive mode
  useEffect(() => {
    setActiveScene("drive");
  }, [setActiveScene]);

  return (
    <div className="relative w-full h-full">
      <h1 className="sr-only">Neon Drives - Open World Simulation</h1>
      {/* dynamic simulation loader */}
      <SceneLoader title="INITIALIZING SIMULATION" />
      <DriveCanvas />
    </div>
  );
};

export default DrivePage;
