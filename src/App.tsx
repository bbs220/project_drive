import { Outlet } from "react-router";

function App() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-tron-bg focus:text-tron-cyan focus:border focus:border-tron-cyan focus:font-telemetry focus:text-sm focus:tracking-widest focus:shadow-neon-cyan focus:outline-none"
      >
        Skip to main content
      </a>
      <div className="overflow-x-hidden overflow-y-hidden h-full w-full">
        <Outlet />
      </div>
    </>
  );
}

export default App;
