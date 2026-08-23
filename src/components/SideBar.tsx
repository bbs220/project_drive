import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { useUIStore } from "../stores/useUIStore";
import RadioHUD from "./RadioHUD";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const activeScene = useAppStore((state) => state.activeScene);

  // pull all settings and setters from the ui store
  const {
    masterVolume,
    sfxVolume,
    radioVolume,
    showControls,
    showSpeedometers,
    showRadar,
    showTelemetry,
    setMasterVolume,
    setSfxVolume,
    setRadioVolume,
    setShowControls,
    setShowSpeedometers,
    setShowRadar,
    setShowTelemetry,
  } = useUIStore();

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen w-1/5 bg-black/60 border-r-2 border-tron-cyan p-8 font-inter text-tron-cyan z-10 pointer-events-auto backdrop-blur-md shadow-[4px_0_20px_rgba(0,243,255,0.2),inset_-4px_0_20px_rgba(0,243,255,0.1)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* main wrapper forces full height and hides overflow at the root */}
        <div className="flex h-full flex-col overflow-hidden">
          {/* fixed header */}
          <h2 className="mb-4 border-b border-tron-cyan pb-4 text-xl font-telemetry uppercase tracking-[4px] [text-shadow:0_0_8px_#00f3ff] text-center shrink-0">
            SETTINGS:
            <span className="text-white ml-2">
              {activeScene?.toUpperCase()}
            </span>
          </h2>

          {/* scrollable content area with hidden scrollbar for a clean look */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pt-2 pb-8 text-sm">
            {activeScene === "garage" ? (
              <div className="flex flex-col gap-3">
                <h3 className="mb-2 text-lg font-bold text-tron-cyan">
                  [ GARAGE PROTOCOLS ]
                </h3>
                <p>
                  VEHICLE BAY: <span className="text-white">LOCKED</span>
                </p>
                <p>
                  DIAGNOSTICS:{" "}
                  <span className="animate-pulse text-yellow-400">
                    RUNNING...
                  </span>
                </p>
              </div>
            ) : activeScene === "drive" ? (
              <div className="flex flex-col gap-8">
                {/* --- AUDIO SECTION --- */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-tron-cyan border-b border-tron-cyan/30 pb-1">
                    AUDIO
                  </h3>

                  {/* master volume */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs tracking-wider">
                      <span>MASTER VOL</span>
                      <span className="text-white">{masterVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={masterVolume}
                      onChange={(e) => setMasterVolume(Number(e.target.value))}
                      className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                    />
                  </div>

                  {/* sfx volume */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs tracking-wider">
                      <span>SFX VOL</span>
                      <span className="text-white">{sfxVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sfxVolume}
                      onChange={(e) => setSfxVolume(Number(e.target.value))}
                      className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                    />
                  </div>

                  {/* radio volume */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs tracking-wider">
                      <span>RADIO VOL</span>
                      <span className="text-white">{radioVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={radioVolume}
                      onChange={(e) => setRadioVolume(Number(e.target.value))}
                      className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* --- HEADS UP DISPLAY SECTION --- */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-tron-cyan border-b border-tron-cyan/30 pb-1">
                    INTERFACE
                  </h3>

                  {/* controls toggle */}
                  <div className="flex items-center justify-between text-xs tracking-wider pr-3">
                    <span>SHOW CONTROLS</span>
                    <button
                      onClick={() => setShowControls(!showControls)}
                      className="relative flex h-4 w-10 cursor-pointer items-center border border-tron-cyan/40 bg-black/50 p-0.5 skew-x-[-15deg] hover:border-tron-cyan transition-colors"
                    >
                      <div
                        className={`h-full w-1/2 bg-tron-cyan transition-all duration-300 ease-out ${
                          showControls
                            ? "translate-x-full shadow-[0_0_10px_#00f3ff]"
                            : "translate-x-0 bg-tron-cyan/20"
                        }`}
                      />
                    </button>
                  </div>

                  {/* speedometers toggle */}
                  <div className="flex items-center justify-between text-xs tracking-wider pr-3">
                    <span>SPEEDOMETERS</span>
                    <button
                      onClick={() => setShowSpeedometers(!showSpeedometers)}
                      className="relative flex h-4 w-10 cursor-pointer items-center border border-tron-cyan/40 bg-black/50 p-0.5 skew-x-[-15deg] hover:border-tron-cyan transition-colors"
                    >
                      <div
                        className={`h-full w-1/2 bg-tron-cyan transition-all duration-300 ease-out ${
                          showSpeedometers
                            ? "translate-x-full shadow-[0_0_10px_#00f3ff]"
                            : "translate-x-0 bg-tron-cyan/20"
                        }`}
                      />
                    </button>
                  </div>

                  {/* radar toggle */}
                  <div className="flex items-center justify-between text-xs tracking-wider pr-3">
                    <span>MINI-MAP</span>
                    <button
                      onClick={() => setShowRadar(!showRadar)}
                      className="relative flex h-4 w-10 cursor-pointer items-center border border-tron-cyan/40 bg-black/50 skew-x-[-15deg] hover:border-tron-cyan transition-colors"
                    >
                      <div
                        className={`h-full w-1/2 bg-tron-cyan transition-all duration-300 ease-out ${
                          showRadar
                            ? "translate-x-full shadow-[0_0_10px_#00f3ff]"
                            : "translate-x-0 bg-tron-cyan/20"
                        }`}
                      />
                    </button>
                  </div>

                  {/* telemetry toggle */}
                  <div className="flex items-center justify-between text-xs tracking-wider pr-3">
                    <span>RAW TELEMETRY</span>
                    <button
                      onClick={() => setShowTelemetry(!showTelemetry)}
                      className="relative flex h-4 w-10 cursor-pointer items-center border border-tron-cyan/40 bg-black/50 skew-x-[-15deg] hover:border-tron-cyan transition-colors"
                    >
                      <div
                        className={`h-full w-1/2 bg-tron-cyan transition-all duration-300 ease-out ${
                          showTelemetry
                            ? "translate-x-full shadow-[0_0_10px_#00f3ff]"
                            : "translate-x-0 bg-tron-cyan/20"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="animate-pulse text-yellow-400">
                awaiting scene data...
              </p>
            )}
          </div>
          <RadioHUD />
        </div>
      </aside>

      {/* Center-Left Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 flex cursor-pointer items-center justify-center rounded-r-lg border-2 border-l-0 border-tron-cyan px-2 py-6 text-tron-cyan z-11 backdrop-blur-sm shadow-[4px_0_15px_rgba(0,243,255,0.3)] transition-[left] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "left-1/5" : "left-0"
        }`}
      >
        <ChevronRight
          size={24}
          strokeWidth={3}
          className={`drop-shadow-[0_0_4px_#00f3ff] transition-transform duration-300 ease-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
    </>
  );
};

export default SideBar;
