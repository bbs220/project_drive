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
        className={`flex items-center justify-center gap-4 px-16 py-6 bg-black/40 border-2 border-tron-cyan font-telemetry text-2xl tracking-[0.25em] uppercase backdrop-blur-sm transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.25)] group ${
          isHidden
            ? "pointer-events-none"
            : isCooldown
              ? "pointer-events-auto cursor-not-allowed opacity-50 text-gray-500 border-gray-600"
              : "pointer-events-auto cursor-pointer text-tron-cyan hover:bg-tron-cyan hover:text-black hover:shadow-[0_0_30px_rgba(0,243,255,0.7)]"
        }`}
      >
        {/* swap text dynamically based on lock state */}
        <span>{isCooldown ? "COOLDOWN" : "PLAY"}</span>
        <span
          className={`text-3xl transition-transform duration-300 ${
            isCooldown ? "" : "group-hover:scale-125"
          }`}
        >
          🕹️
        </span>
      </button>

      {!isHidden && (
        <p className="mt-4 font-label text-xs tracking-widest text-tron-cyan/60 uppercase">
          click to lock cursor and drive
        </p>
      )}
    </div>
  );
};

export default PlayButtonUI;
