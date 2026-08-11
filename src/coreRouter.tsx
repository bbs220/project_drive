import { createBrowserRouter } from "react-router";
import App from "./App";
import WelcomePage from "./pages/WelcomePage";
import DrivePage from "./pages/DrivePage";
import LayoutState from "./layout/LayoutState";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";
import GaragePage from "./pages/GaragePage";

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
        path: "/drive",
        element: (
          <LayoutState>
            <DrivePage />
          </LayoutState>
        ),
      },
      {
        path: "/garage",
        element: (
          <LayoutState>
            <GaragePage />
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
