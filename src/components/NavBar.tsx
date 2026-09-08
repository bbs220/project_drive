import { useUIStore } from "../stores/useUIStore";

const NavBar = () => {
  const showHints = useUIStore((state) => state.showHints);

  return (
    <nav
      className={`
        fixed top-3.5 left-18 right-4 z-30 h-11.5 select-none rounded-md border border-tron-cyan/30 bg-black/20 backdrop-blur-md transition-all duration-500 ease-in-out
        ${
          showHints
            ? "pointer-events-auto translate-y-0 opacity-100" // Visible and clickable
            : "pointer-events-none -translate-y-20 opacity-0" // Slid up off-screen, faded out, and unclickable
        }
      `}
    >
      {/* Navbar content will go here */}
    </nav>
  );
};

export default NavBar;
