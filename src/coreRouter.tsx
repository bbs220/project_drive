import { createBrowserRouter } from "react-router";
import App from "./App";
import WelcomePage from "./pages/WelcomePage";
import GamePage from "./pages/GamePage";
import LayoutState from "./layout/LayoutState";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";

export const coreRouter = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <WelcomePage />,
      },
      {
        path: "/play",
        element: (
          <LayoutState>
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
