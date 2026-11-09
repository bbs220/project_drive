import type { ReactNode } from "react";
import PauseUI from "../components/PauseUI";

type typeLayoutState = {
  children: ReactNode;
};

const LayoutState = ({ children }: typeLayoutState) => {
  return (
    <div className="w-full h-dvh flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <PauseUI />
        <main id="main-content" className="flex-1 relative w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};
export default LayoutState;
