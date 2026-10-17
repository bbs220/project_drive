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
  const appVersion = useAppStore((state) => state.appVersion);
  const seed = useCityStore((state) => state.seed);

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
    showMap,
    setMasterVolume,
    setUiVolume,
    setAmbienceVolume,
    setRadioVolume,
    setShowControls,
    setShowSpeedometers,
    setShowMap,
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
        id="settings-menu"
        aria-label="Settings"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        className={`fixed top-0 select-none left-0 w-full h-dvh bg-black/40 border-b-2 border-tron-cyan p-0.5 font-inter text-tron-cyan z-40 pointer-events-auto backdrop-blur-md shadow-[0_4px_20px_rgba(0,243,255,0.2),inset_0_-4px_20px_rgba(0,243,255,0.1)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* main wrapper forces full height of the screen */}
        <div className="flex h-full w-full flex-col">
          <h2 className="relative mb-6 mt-2 flex items-center justify-center border-b border-tron-cyan pb-4 pt-2 text-xl font-telemetry uppercase tracking-[6px] text-white [text-shadow:0_0_8px_#00f3ff] shrink-0 select-none">
            <span>{`[ ${activeScene} ]`}</span>
            {/* version string absolutely positioned to the far right, overriding parent text effects */}
            <span className="absolute right-2 md:right-8 bottom-4 text-[10px] md:text-xs tracking-widest text-white normal-case text-shadow-none select-none">
              {`( v ${appVersion}.alpha )`}
            </span>
          </h2>

          {/* scrollable content area, flex layout to center the grid vertically on larger screens */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-6 px-4 md:px-12 lg:px-24 text-sm flex items-start md:items-center">
            {/* max-width container keeps the grid perfectly proportioned on ultrawide monitors */}
            <div className="w-full max-w-7xl mx-auto">
              {activeScene === "garage" ? (
                // Open 3-column garage reference guide separated by sleek dividers (no enclosed boxes)
                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10 my-auto py-6">
                  {/* --- COLUMN 1: SURFACE SHADERS --- */}
                  <div className="flex flex-col gap-6 pb-8 lg:pb-0 lg:pr-10">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="size-2 rounded-full bg-tron-cyan shadow-[0_0_8px_#00f3ff]" />
                      <h3 className="text-lg md:text-xl font-bold font-telemetry tracking-[0.2em] text-tron-cyan uppercase">
                        SURFACE SHADERS
                      </h3>
                    </div>

                    <div className="flex flex-col gap-5 divide-y divide-white/5">
                      <div className="pt-0">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-yellow uppercase mb-1">
                          METAL <span className="text-white/60 font-mono text-xs">[ 0.0 — 1.0 ]</span>
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          Controls electrical conductivity. Set to <strong className="text-white font-semibold">1.0</strong> for <strong className="text-tron-cyan font-semibold">polished cyber chrome</strong>, or down to <strong className="text-white font-semibold">0.0</strong> for non-metallic matte composite bodywork.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-yellow uppercase mb-1">
                          ROUGH <span className="text-white/60 font-mono text-xs">[ 0.0 — 1.0 ]</span>
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          Governs micro-facet scattering. Lower values produce <strong className="text-white font-semibold">razor-sharp specular reflections</strong>; higher values soften and diffuse light into a <strong className="text-tron-cyan font-semibold">smooth satin sheen</strong>.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-yellow uppercase mb-1">
                          GLOW <span className="text-white/60 font-mono text-xs">[ 0.0 — 5.0 ]</span>
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          Multiplies HDR radiative luminance, driving the post-processing pipeline to project <strong className="text-tron-cyan font-semibold">volumetric neon bloom</strong> across circuit lines and engine exhausts.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* --- COLUMN 2: COLOR ENGINE --- */}
                  <div className="flex flex-col gap-6 py-8 lg:py-0 lg:px-10">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="size-2 rounded-full bg-tron-lime shadow-[0_0_8px_#39ff14]" />
                      <h3 className="text-lg md:text-xl font-bold font-telemetry tracking-[0.2em] text-tron-lime uppercase">
                        COLOR ENGINE
                      </h3>
                    </div>

                    <div className="flex flex-col gap-5 divide-y divide-white/5">
                      <div className="pt-0">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-lime uppercase mb-1">
                          HUE SPECTRUM <span className="text-white/60 font-mono text-xs">[ 0° — 360° ]</span>
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          Sweeps through the full <strong className="text-white font-semibold">360-degree rainbow spectrum</strong>. Each vehicle material zone (<strong className="text-white font-semibold">Chassis, Circuits, Axels, Cockpit, Tires</strong>) can be assigned an independent wavelength.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-lime uppercase mb-1">
                          SATURATION & LIGHTNESS
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          <strong className="text-white font-semibold">Saturation</strong> shifts between monochromatic stealth titanium and hyper-vivid laser tones. <strong className="text-white font-semibold">Lightness</strong> shifts from deep void black to high-voltage white.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-lime uppercase mb-1">
                          TRAIL SYNCHRONIZATION
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          Engage <strong className="text-tron-cyan font-semibold">"Sync to Circuits"</strong> to automatically slave aerodynamic engine exhaust particles to match your vehicle's circuit neon hue.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* --- COLUMN 3: SHOWROOM CONTROLS --- */}
                  <div className="flex flex-col gap-6 pt-8 lg:pt-0 lg:pl-10">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="size-2 rounded-full bg-tron-magenta shadow-[0_0_8px_#ff00ff]" />
                      <h3 className="text-lg md:text-xl font-bold font-telemetry tracking-[0.2em] text-tron-magenta uppercase">
                        SHOWROOM CONTROLS
                      </h3>
                    </div>

                    <div className="flex flex-col gap-5 divide-y divide-white/5">
                      <div className="pt-0">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-magenta uppercase mb-1">
                          ORBIT TUMBLE
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          <strong className="text-white font-semibold">Left Click + Drag</strong> outside the sidebar to rotate <strong className="text-white font-semibold">360°</strong> around the vehicle's center of mass.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-magenta uppercase mb-1">
                          PAN & ZOOM
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          <strong className="text-white font-semibold">Right Click + Drag</strong> to pan camera focal point. Use the <strong className="text-white font-semibold">Scroll Wheel</strong> to zoom with vehicle-clamped distance bounds.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-telemetry font-bold tracking-wider text-tron-magenta uppercase mb-1">
                          DRAWER ACCORDION
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-label">
                          Click the <strong className="text-tron-yellow font-semibold">active vehicle tab</strong> on the left edge to collapse or re-expand the customization drawer for clean, unobstructed viewing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeScene === "drive" ? (
                // master grid container holding all categories
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* --- AUDIO SECTION --- */}
                  <div className="flex flex-col gap-4 p-4 rounded-2xl h-65 bg-black/20">
                    <h3 className="text-lg font-bold text-tron-cyan border-b border-tron-cyan/30 pb-1 text-center">
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
                        aria-label="Master volume"
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
                        aria-label="Interface volume"
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
                        aria-label="Ambience volume"
                        onChange={(e) =>
                          handleSliderChange(e, setAmbienceVolume)
                        }
                        className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                      />
                    </div>

                    {/* radio volume */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs tracking-wider">
                        <span>SOUNDTRACK</span>
                        <span className="text-white">{radioVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={radioVolume}
                        aria-label="Soundtrack volume"
                        onChange={(e) => handleSliderChange(e, setRadioVolume)}
                        className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* --- WORLD SECTION --- */}
                  <div className="flex flex-col gap-4 p-4 rounded-2xl h-65 bg-black/20">
                    <h3 className="text-lg font-bold text-tron-cyan border-b border-tron-cyan/30 pb-1 text-center">
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
                        aria-label="Render distance"
                        onChange={(e) => handleSliderChange(e, setChunkRadius)}
                        className="h-0.5 w-full cursor-pointer appearance-none bg-tron-cyan/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:bg-tron-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f3ff] hover:[&::-webkit-slider-thumb]:w-2 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between pr-3 mt-2 text-xs tracking-wider">
                      <span className="text-tron-cyan">WORLD SEED</span>
                      <div className="flex h-5 items-center">
                        <span className="font-telemetry text-xl">{seed}</span>
                      </div>
                    </div>
                  </div>

                  {/* --- HEADS UP DISPLAY SECTION --- */}
                  <div className="flex flex-col gap-4 p-4 rounded-2xl h-65 bg-black/20">
                    <h3 className="text-lg font-bold text-tron-cyan border-b border-tron-cyan/30 pb-1 text-center">
                      INTERFACE
                    </h3>

                    {/* controls toggle */}
                    <div className="flex items-center justify-between text-xs tracking-wider pr-3">
                      <span>SHOW CONTROLS</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showControls}
                        aria-label="Toggle show controls"
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
                        type="button"
                        role="switch"
                        aria-checked={showSpeedometers}
                        aria-label="Toggle show speedometers"
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
                        type="button"
                        role="switch"
                        aria-checked={showMap}
                        aria-label="Toggle show map"
                        onClick={() => {
                          playToggle();
                          setShowMap(!showMap);
                        }}
                        className="relative flex h-4 w-10 cursor-pointer items-center border border-tron-cyan/40 bg-black/50 p-0.5 skew-x-[-15deg] hover:border-tron-cyan transition-colors"
                      >
                        <div
                          className={`h-full w-1/2 bg-tron-cyan transition-all duration-300 ease-out ${
                            showMap
                              ? "translate-x-full shadow-[0_0_10px_#00f3ff]"
                              : "translate-x-0 bg-tron-cyan/20"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* --- radio section --- */}
                  <div className="flex flex-col gap-4 p-4 rounded-2xl h-65 bg-black/20">
                    <h3 className="text-lg font-bold text-tron-cyan border-b border-tron-cyan/30 text-center">
                      SOUNDTRACK
                    </h3>
                    <RadioHUD />
                  </div>
                </div>
              ) : (
                <p className="animate-pulse text-yellow-400 text-center w-full">
                  awaiting scene data...
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* top-left fixed toggle button (hamburger / cross switcher) */}
      <button
        type="button"
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="fixed top-2 left-2 flex cursor-pointer items-center justify-center rounded-md border-2 border-tron-cyan p-2 text-tron-cyan z-45 backdrop-blur-sm shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:bg-tron-cyan hover:text-black transition-colors"
        aria-label={isOpen ? "Close settings menu" : "Open settings menu"}
        aria-expanded={isOpen}
        aria-controls="settings-menu"
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
