import { useState } from "react";
import { ChevronRight } from "lucide-react";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen w-1/5 bg-black/60 border-r-2 border-tron-cyan p-8 font-inter text-tron-cyan z-1000 pointer-events-auto backdrop-blur-md shadow-[4px_0_20px_rgba(0,243,255,0.2),inset_-4px_0_20px_rgba(0,243,255,0.1)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <h2 className="mb-8 border-b border-tron-cyan pb-4 text-2xl font-telemetry uppercase tracking-[4px] [text-shadow:0_0_8px_#00f3ff] text-center">
            SETTINGS
          </h2>
        </div>
      </aside>

      {/* Center-Left Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 flex cursor-pointer items-center justify-center rounded-r-lg border-2 border-l-0 border-tron-cyan px-2 py-6 text-tron-cyan z-1001 backdrop-blur-sm shadow-[4px_0_15px_rgba(0,243,255,0.3)] transition-[left] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
