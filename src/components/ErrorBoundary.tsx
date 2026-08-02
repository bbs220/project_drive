// import required react dependencies
import { Component, type ErrorInfo, type ReactNode } from "react";

// define props interface
interface Props {
  children?: ReactNode;
}

// define state interface
interface State {
  hasError: boolean;
}

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

  // render fallback or children
  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900 text-white">
          <h2 className="font-inter text-2xl font-bold">
            engine fault detected
          </h2>
          <p className="font-inter mt-2 text-zinc-400">
            check the console for telemetry
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
