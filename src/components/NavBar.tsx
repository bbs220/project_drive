import { useUIStore } from "../stores/useUIStore";
import { useAppStore } from "../stores/useAppStore";

const NavBar = () => {
  const showHints = useUIStore((state) => state.showHints);
  const showMap = useUIStore((state) => state.showMap);
  const activeScene = useAppStore((state) => state.activeScene);

  if (activeScene !== "drive") return null;

  return (
    <nav
      className={`
        fixed top-2 left-15 ${showMap ? "right-64" : "right-2"} z-30 h-11 select-none rounded-md border border-tron-cyan/30 bg-black/20 backdrop-blur-md transition-all duration-500 ease-in-out
        ${
          showHints
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-20 opacity-0"
        }
      `}
    >
      {/* Navbar content will go here */}
    </nav>
  );
};

export default NavBar;
