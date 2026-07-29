import { Outlet } from "react-router";

function App() {
  return (
    <>
      <div className="font-inter overflow-x-hidden h-full w-full">
        <Outlet />
      </div>
    </>
  );
}

export default App;
