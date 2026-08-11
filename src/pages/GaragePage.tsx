import { useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";
import SceneLoader from "../components/sceneComponents/SceneLoader";
import GarageCanvas from "../components/sceneComponents/GarageCanvas";

const GaragePage = () => {
  const setActiveScene = useAppStore((state) => state.setActiveScene);

  // tell the 3d world we are entering the garage
  useEffect(() => {
    setActiveScene("garage");
  }, [setActiveScene]);

  return (
    <div className="relative w-full h-full">
      {/* dynamic garage loader */}
      <SceneLoader title="ACCESSING GARAGE" />
      <GarageCanvas />
    </div>
  );
};

export default GaragePage;
