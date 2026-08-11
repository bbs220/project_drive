import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

// define a prop to customize the loading text per page
type typeLoaderProps = {
  title?: string;
};

const SceneLoader = ({ title = "INITIALIZING..." }: typeLoaderProps) => {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-tron-bg transition-opacity duration-700 pointer-events-none ${
        active || progress < 100 ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex w-80 flex-col items-center">
        {/* inject the dynamic title prop here */}
        <div className="mb-4 font-telemetry text-xl tracking-[0.3em] text-tron-cyan [text-shadow:0_0_10px_var(--color-tron-cyan)] uppercase">
          {title}
        </div>

        <div className="h-2 w-full border border-tron-magenta bg-black shadow-neon-magenta">
          <div
            className="h-full bg-tron-magenta transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-4 font-label text-sm tracking-widest text-tron-lime [text-shadow:0_0_10px_var(--color-tron-lime)]">
          {progress.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default SceneLoader;
