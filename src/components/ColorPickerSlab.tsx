import { useState } from "react";
import { HexColorPicker } from "react-colorful";

// props for color picker slab component
type typeColorPickerSlabProps = {
  label: string;
  color: string;
  onChange: (newColor: string) => void;
  disabled?: boolean;
};

// color slab with expandable visual picker
const ColorPickerSlab = ({
  label,
  color,
  onChange,
  disabled = false,
}: typeColorPickerSlabProps) => {
  // state to toggle the dropdown color picker
  const [isOpen, setIsOpen] = useState(false);

  return (
    // container for color preview and picker
    <div
      className={`flex w-full flex-col gap-2 transition-opacity duration-200 ${
        disabled ? "pointer-events-none opacity-40 grayscale-50" : "opacity-100"
      }`}
    >
      {/* header button to toggle picker */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded border border-white/10 bg-white/5 px-2.5 py-1.5 transition-colors hover:border-tron-cyan/40 hover:bg-white/10 cursor-pointer"
        aria-label={`${label} color picker`}
        aria-expanded={isOpen}
      >
        <span className="text-[9px] font-bold tracking-widest text-tron-cyan uppercase opacity-80 whitespace-nowrap">
          {label}
        </span>
        <div
          className="h-3.5 flex-1 rounded border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-75"
          style={{ backgroundColor: color }}
        />
      </button>

      {/* expandable color picker panel */}
      {isOpen && !disabled && (
        <div className="flex w-full flex-col gap-2 rounded-lg border border-tron-cyan/30 bg-black/60 p-2 shadow-inner">
          <HexColorPicker
            color={color}
            onChange={onChange}
            style={{ width: "100%", height: "130px" }}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPickerSlab;
