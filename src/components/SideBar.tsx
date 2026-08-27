import { useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { useUIStore } from "../stores/useUIStore";
import RadioHUD from "./RadioHUD";
import { useUISounds } from "../hooks/useUISounds";
import { useCityStore } from "../stores/useCItyStore";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const activeScene = useAppStore((state) => state.activeScene);

  const { playClick, playToggle, playSlider } = useUISounds();

  // ref to track the last time the slider sound played
  const lastPlayed = useRef(0);

  // pull all settings and setters from the updated ui store
  const {
    masterVolume,
    uiVolume,
    ambienceVolume,
    radioVolume,
    showControls,
    showSpeedometers,
    showRadar,
    setMasterVolume,
    setUiVolume,
    setAmbienceVolume,
    setRadioVolume,
    setShowControls,
    setShowSpeedometers,
    setShowRadar,
  } = useUIStore();

  const { chunkRadius, setChunkRadius } = useCityStore();

  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: number) => void,
  ) => {
    // update the visual state instantly
    setter(Number(e.target.value));

    // throttle the audio to max 1 tick per 80ms
    const now = Date.now();
    if (now - lastPlayed.current > 80) {
      playSlider();
      lastPlayed.current = now;
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen w-[80%] md:w-2/5 lg:w-1/5 bg-black/60 border-r-2 border-tron-cyan p-4 font-inter text-tron-cyan z-10 pointer-events-auto backdrop-blur-md shadow-[4px_0_20px_rgba(0,243,255,0.2),inset_-4px_0_20px_rgba(0,243,255,0.1)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* main wrapper forces full height and hides overflow at the root */}
        <div className="flex h-full flex-col overflow-hidden">
          <h2 className="mb-3 flex items-center justify-center border-b border-tron-cyan pb-5 pt-2.5 pl-2 text-xl font-telemetry uppercase tracking-[6px] text-white [text-shadow:0_0_8px_#00f3ff] shrink-0">
            {`[ ${activeScene} ]`}
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
                      <span>MASTER</span>
                      <span className="text-white">{masterVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={masterVolume}
                      onChange={(e) => handleSliderChange(e, setMasterVolume)}
                      className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                    />
                  </div>

                  {/* ui volume */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs tracking-wider">
                      <span>INTERFACE</span>
                      <span className="text-white">{uiVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={uiVolume}
                      onChange={(e) => handleSliderChange(e, setUiVolume)}
                      className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                    />
                  </div>

                  {/* ambience volume */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs tracking-wider">
                      <span>AMBIENCE</span>
                      <span className="text-white">{ambienceVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ambienceVolume}
                      onChange={(e) => handleSliderChange(e, setAmbienceVolume)}
                      className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                    />
                  </div>

                  {/* radio volume */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs tracking-wider">
                      <span>RADIO</span>
                      <span className="text-white">{radioVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={radioVolume}
                      onChange={(e) => handleSliderChange(e, setRadioVolume)}
                      className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* --- WORLD SECTION --- */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-tron-cyan border-b border-tron-cyan/30 pb-1">
                    WORLD
                  </h3>

                  {/* chunk distance slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs tracking-wider uppercase">
                      <span>Render Distance</span>
                      <span className="text-white">{chunkRadius}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={chunkRadius}
                      onChange={(e) => handleSliderChange(e, setChunkRadius)}
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
                      onClick={() => {
                        playToggle();
                        setShowControls(!showControls);
                      }}
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
                      onClick={() => {
                        playToggle();
                        setShowSpeedometers(!showSpeedometers);
                      }}
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
                    <span>MAP</span>
                    <button
                      onClick={() => {
                        playToggle();
                        setShowRadar(!showRadar);
                      }}
                      className="relative flex h-4 w-10 cursor-pointer items-center border border-tron-cyan/40 bg-black/50 p-0.5 skew-x-[-15deg] hover:border-tron-cyan transition-colors"
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
                </div>

                <RadioHUD />
              </div>
            ) : (
              <p className="animate-pulse text-yellow-400">
                awaiting scene data...
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* top-left fixed toggle button (hamburger / cross switcher) */}
      <button
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="fixed top-4 left-4 flex cursor-pointer items-center justify-center rounded-md border-2 border-tron-cyan p-2 text-tron-cyan z-15 backdrop-blur-sm shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:bg-tron-cyan hover:text-black transition-colors"
        aria-label="toggle settings menu"
      >
        {isOpen ? (
          <X
            size={24}
            strokeWidth={2.5}
            className="drop-shadow-[0_0_4px_#00f3ff]"
          />
        ) : (
          <Menu
            size={24}
            strokeWidth={2.5}
            className="drop-shadow-[0_0_4px_#00f3ff]"
          />
        )}
      </button>
    </>
  );
};

export default SideBar;
