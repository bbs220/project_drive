import { createBrowserRouter } from "react-router";
import App from "./App";
import WelcomePage from "./pages/WelcomePage";
import GamePage from "./pages/GamePage";
import LayoutState from "./layout/LayoutState";
import NotFoundPage from "./pages/NotFoundPage";

export const coreRouter = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <WelcomePage />,
      },
      {
        path: "/play",
        element: (
          <LayoutState>
            {/* this page mounts the 3d canvas */}
            <GamePage />
          </LayoutState>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
