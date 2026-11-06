/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import App from "./App";
import WelcomePage from "./pages/WelcomePage";
import LayoutState from "./layout/LayoutState";
import { RouteErrorBoundary } from "./components/ErrorBoundary";

const DrivePage = lazy(() => import("./pages/DrivePage"));
const GaragePage = lazy(() => import("./pages/GaragePage"));
const Copyright = lazy(() => import("./pages/Copyright"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

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
            <Suspense fallback={<div className="h-full w-full bg-tron-bg" />}>
              <DrivePage />
            </Suspense>
          </LayoutState>
        ),
      },
      {
        path: "/garage",
        element: (
          <LayoutState>
            <Suspense fallback={<div className="h-full w-full bg-tron-bg" />}>
              <GaragePage />
            </Suspense>
          </LayoutState>
        ),
      },
      {
        path: "/copyright",
        element: (
          <Suspense fallback={<div className="h-full w-full bg-tron-bg" />}>
            <Copyright />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<div className="h-full w-full bg-tron-bg" />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
