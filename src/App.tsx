import { Outlet } from "react-router";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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
