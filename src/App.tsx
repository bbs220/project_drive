import { Outlet } from "react-router";

function App() {
  return (
    <>
      <div className="overflow-x-hidden overflow-y-hidden h-full w-full">
        <Outlet />
      </div>
    </>
  );
}

export default App;
