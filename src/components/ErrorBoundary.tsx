import { Component, type ErrorInfo, type ReactNode } from "react";
import { useRouteError } from "react-router";

// route error element for react router
export const RouteErrorBoundary = () => {
  const error = useRouteError();
  console.error("route error caught", error);

  // reload page on user request
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex h-dvh w-screen flex-col items-center justify-center bg-[#010102] p-4 text-center text-white select-none">
      <div className="flex flex-col items-center justify-center rounded-md border border-red-500/40 bg-black/80 px-10 py-8 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-md">
        <h2 className="font-telemetry text-2xl md:text-3xl font-black uppercase tracking-[0.25em] text-red-500 [text-shadow:0_0_15px_rgba(239,68,68,0.6)]">
          ENGINE FAULT DETECTED
        </h2>
        <p className="mt-3 font-label text-xs uppercase tracking-widest text-gray-400">
          check the console for telemetry
        </p>
        <button
          type="button"
          onClick={handleReload}
          className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-red-500/60 bg-red-950/30 px-8 py-2.5 font-telemetry text-xs font-bold uppercase tracking-[0.25em] text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] backdrop-blur-md transition-all duration-300 hover:border-red-400 hover:bg-red-500 hover:text-black hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
        >
          <span>RELOAD SIMULATION</span>
        </button>
      </div>
    </div>
  );
};

// define props
type Props = {
  children?: ReactNode;
};

// define state
type State = {
  hasError: boolean;
};

// create standard error boundary class
class ErrorBoundary extends Component<Props, State> {
  // initialize default state
  public state: State = {
    hasError: false,
  };

  // catch errors and update state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  // log error data to console
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("error caught by boundary", error, errorInfo);
  }

  // reload page on user request
  private handleReload = () => {
    window.location.reload();
  };

  // render fallback or children
  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex h-dvh w-screen flex-col items-center justify-center bg-[#010102] p-4 text-center text-white select-none">
          <div className="flex flex-col items-center justify-center rounded-md border border-red-500/40 bg-black/80 px-10 py-8 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-md">
            <h2 className="font-telemetry text-2xl md:text-3xl font-black uppercase tracking-[0.25em] text-red-500 [text-shadow:0_0_15px_rgba(239,68,68,0.6)]">
              ENGINE FAULT DETECTED
            </h2>
            <p className="mt-3 font-label text-xs uppercase tracking-widest text-gray-400">
              check the console for telemetry
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-red-500/60 bg-red-950/30 px-8 py-2.5 font-telemetry text-xs font-bold uppercase tracking-[0.25em] text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] backdrop-blur-md transition-all duration-300 hover:border-red-400 hover:bg-red-500 hover:text-black hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
            >
              <span>RELOAD SIMULATION</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
