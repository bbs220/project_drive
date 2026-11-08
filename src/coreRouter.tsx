import { createBrowserRouter } from "react-router";
import App from "./App";
import WelcomePage from "./pages/WelcomePage";
import DrivePage from "./pages/DrivePage";
import GaragePage from "./pages/GaragePage";
import Copyright from "./pages/Copyright";
import NotFoundPage from "./pages/NotFoundPage";
import LayoutState from "./layout/LayoutState";
import { RouteErrorBoundary } from "./components/ErrorBoundary";

export const coreRouter = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteErrorBoundary />,
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
        path: "/copyright",
        element: <Copyright />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
