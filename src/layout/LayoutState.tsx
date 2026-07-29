import type { ReactNode } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";

type typeLayoutState = {
  children: ReactNode;
};

const LayoutState = ({ children }: typeLayoutState) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main className="flex-1 relative w-full h-full">{children}</main>
      </div>
    </div>
  );
};
export default LayoutState;
