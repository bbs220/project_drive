import { Outlet } from "react-router";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <div className="overflow-x-hidden overflow-y-hidden h-full w-full">
        <Outlet />
      </div>
      <SpeedInsights />
      <Analytics />
    </>
  );
}

export default App;
