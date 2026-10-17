import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

// define a prop to customize the loading text per page
type typeLoaderProps = {
  title?: string;
};

const SceneLoader = ({ title = "INITIALIZING..." }: typeLoaderProps) => {
  const { progress, active } = useProgress();

  // decouple visibility from fading to ensure we cover the 3d canvas setup
  const [visible, setVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // only trigger the exit sequence when all assets are fully loaded
    if (!active && progress === 100) {
      const fadeTimer = setTimeout(() => setIsFading(true), 1200);

      // unmount the component entirely after the 700ms css transition finishes
      const unmountTimer = setTimeout(() => setVisible(false), 1200 + 700);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [active, progress]);

  // remove from dom entirely once fade is complete
  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label={title}
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-live="polite"
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-tron-bg transition-opacity duration-700 pointer-events-none select-none ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex w-80 flex-col items-center">
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
