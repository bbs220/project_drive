import { useEffect, useState } from "react";
import { useUISounds } from "../hooks/useUISounds";
import { useUIStore } from "../stores/useUIStore";

const PlayButtonUI = () => {
  const isPaused = useUIStore((state) => state.isPaused);
  const { playClick } = useUISounds();

  // track pointer lock and cooldown status
  const [isLocked, setIsLocked] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  // handle chromium pointer lock cooldown and state sync
  useEffect(() => {
    const handleLockChange = () => {
      const locked = !!document.pointerLockElement;
      setIsLocked(locked);

      if (!locked) {
        setIsCooldown(true);

        // unlock button after timeout window completes
        setTimeout(() => {
          setIsCooldown(false);
        }, 1200);
      }
    };

    document.addEventListener("pointerlockchange", handleLockChange);
    return () =>
      document.removeEventListener("pointerlockchange", handleLockChange);
  }, []);

  // request pointer lock from canvas on click
  const handlePlay = () => {
    if (isCooldown) return;
    playClick();
    document.querySelector("canvas")?.requestPointerLock();
  };

  const isHidden = isLocked || isPaused;

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-30 pointer-events-none transition-opacity duration-300 select-none ${
        isHidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={handlePlay}
        disabled={isCooldown}
        id="play-button"
        className={`group flex items-center justify-center gap-3 rounded-md border border-tron-cyan px-8 py-2.5 font-label text-xs tracking-wider uppercase [box-shadow:0_0_15px_rgba(0,243,255,0.2)] backdrop-blur-md transition-all duration-300 select-none ${
          isHidden
            ? "pointer-events-none"
            : isCooldown
              ? "pointer-events-auto cursor-not-allowed opacity-50 border-gray-600 bg-black/60 text-gray-500 [box-shadow:none]"
              : "pointer-events-auto cursor-pointer bg-black/60 hover:bg-tron-cyan hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]"
        }`}
      >
        <strong
          className={`font-telemetry text-sm transition-colors ${
            isCooldown
              ? "text-gray-500"
              : "text-tron-yellow [text-shadow:0_0_8px_var(--color-tron-yellow)] group-hover:text-black group-hover:text-shadow-none"
          }`}
        >
          {">"}
        </strong>
        {/* swap text dynamically based on lock state */}
        <span
          className={`tracking-wider uppercase transition-colors ${
            isCooldown
              ? "text-gray-400"
              : "text-gray-200 group-hover:text-black"
          }`}
        >
          {isCooldown ? "COOLDOWN" : "PLAY"}
        </span>
        <span
          className={`h-1 w-1 rounded-full transition-colors ${
            isCooldown ? "bg-gray-600" : "bg-tron-cyan/50 group-hover:bg-black"
          }`}
        />
      </button>
    </div>
  );
};

export default PlayButtonUI;
