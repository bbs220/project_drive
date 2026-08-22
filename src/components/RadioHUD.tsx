import { useState, useEffect } from "react";
import useSound from "use-sound";
import { Play, Pause, SkipBack, SkipForward, Radio } from "lucide-react";
import { musicBank } from "../utils/assetpaths";
import { useUIStore } from "../stores/useUIStore";

// map the music bank into an array so we can easily skip forward and backward
const TRACK_LIST = [
  { id: "cyberEclipse", title: "CYBER ECLIPSE", src: musicBank.cyberEclipse },
  { id: "futureDesert", title: "FUTURE DESERT", src: musicBank.futureDesert },
  { id: "ghostCoast", title: "GHOST COAST", src: musicBank.ghostCoast },
  { id: "trapSoul", title: "TRON TRAP SOUL", src: musicBank.trapSoul },
  {
    id: "processorPulses",
    title: "PROCESSOR PULSES",
    src: musicBank.processorPulses,
  },
];

// statically define the equalizer bars to keep the component perfectly pure
const EQ_BARS = [
  { id: 1, height: "70%" },
  { id: 2, height: "100%" },
  { id: 3, height: "80%" },
];

const RadioHUD = () => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // pull the volume slider value directly from your global store
  const radioVolume = useUIStore((state) => state.radioVolume);
  const currentTrack = TRACK_LIST[trackIndex];

  // initialize the use-sound hook with the current track
  const [play, { pause, stop, sound }] = useSound(currentTrack.src, {
    volume: radioVolume / 100, // strictly convert 0-100 to 0.0-1.0
    onend: () => handleNext(), // auto-play next track when finished
  });

  // handle play/pause toggling safely
  const togglePlay = () => {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      play();
      setIsPlaying(true);
    }
  };

  // stop current audio before switching indices to prevent overlapping ghost tracks
  const handleNext = () => {
    stop();
    setTrackIndex((prev) => (prev + 1) % TRACK_LIST.length);
  };

  const handlePrev = () => {
    stop();
    setTrackIndex((prev) => (prev - 1 + TRACK_LIST.length) % TRACK_LIST.length);
  };

  // auto-play the new track immediately if the radio was already playing
  useEffect(() => {
    if (isPlaying && sound) {
      play();
    }

    // clean up audio on unmount
    return () => {
      if (sound) stop();
    };
  }, [trackIndex, sound, isPlaying, play, stop]);

  return (
    <div className="fixed bottom-8 right-10 z-100 flex flex-col border border-tron-cyan/40 bg-[#00050a]/80 p-4 font-mono text-tron-cyan backdrop-blur-md shadow-[4px_0_20px_rgba(0,243,255,0.15),inset_-4px_0_20px_rgba(0,243,255,0.05)] select-none">
      {/* header and animated equalizer */}
      <div className="mb-3 flex items-center justify-between border-b border-tron-cyan/30 pb-2">
        <div className="flex items-center gap-2">
          <Radio
            size={16}
            className={
              isPlaying ? "animate-pulse text-tron-cyan" : "text-tron-cyan/50"
            }
          />
          <span className="text-xs font-bold tracking-[3px] [text-shadow:0_0_5px_#00f3ff]">
            COMM_LINK
          </span>
        </div>

        {/* tiny equalizer bars using pure static heights */}
        <div className="flex h-3 items-end gap-0.5">
          {EQ_BARS.map((bar, index) => (
            <div
              key={bar.id}
              className={`w-1 bg-tron-cyan shadow-[0_0_4px_#00f3ff] transition-all duration-300 ${
                isPlaying ? "animate-pulse" : "opacity-40"
              }`}
              style={{
                height: isPlaying ? bar.height : "2px",
                animationDuration: `${0.3 + index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* track info screen */}
      <div className="mb-4 flex flex-col border border-tron-cyan/20 bg-[#000a14] p-2 shadow-inner">
        <span className="text-[10px] tracking-widest text-tron-cyan/60">
          {`NOW PLAYING...`}
        </span>
        <span className="truncate text-sm font-bold text-white [text-shadow:0_0_4px_#fff]">
          {currentTrack.title}
        </span>
      </div>

      {/* playback controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="flex h-8 w-12 skew-x-[-15deg] cursor-pointer items-center justify-center border border-tron-cyan/40 bg-black/50 transition-all hover:border-tron-cyan hover:bg-tron-cyan/10 hover:shadow-[0_0_10px_#00f3ff]"
        >
          <SkipBack size={16} className="skew-x-15" />
        </button>

        <button
          onClick={togglePlay}
          className="flex h-10 w-16 skew-x-[-15deg] cursor-pointer items-center justify-center border border-tron-cyan bg-tron-cyan/10 shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all hover:bg-tron-cyan hover:text-black hover:shadow-[0_0_15px_#00f3ff]"
        >
          <div className="skew-x-15">
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </div>
        </button>

        <button
          onClick={handleNext}
          className="flex h-8 w-12 skew-x-[-15deg] cursor-pointer items-center justify-center border border-tron-cyan/40 bg-black/50 transition-all hover:border-tron-cyan hover:bg-tron-cyan/10 hover:shadow-[0_0_10px_#00f3ff]"
        >
          <SkipForward size={16} className="skew-x-15" />
        </button>
      </div>
    </div>
  );
};

export default RadioHUD;
