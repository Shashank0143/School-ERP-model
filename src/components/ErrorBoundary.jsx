import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an analytics reporting service here
    console.error("EduDash ERP Runtime Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    // Clear caches and reset error state to recover
    try {
      localStorage.removeItem("edudash_state");
      sessionStorage.clear();
    } catch (e) {
      console.warn("Could not clear session storage in ErrorBoundary", e);
    }
    this.setState({ hasError: false, error: null });
    // Soft reload the route or trigger a window refresh as fallback
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center rounded-[2rem] bg-white border border-[#caf0f8] shadow-[0_12px_40px_rgba(3,4,94,0.06)] animate-fade-in">
          <div className="p-4 rounded-full bg-red-50 text-[#EF4444] mb-4">
            <AlertTriangle size={48} className="animate-bounce" />
          </div>
          
          <h2 className="text-xl font-extrabold text-[#03045e] mb-2">
            Portal Rendering Stabilized
          </h2>
          
          <p className="text-sm font-semibold text-gray-500 max-w-md mb-6 leading-relaxed">
            EduDash detected a transient rendering or cache hydration freeze. Click below to instantly recover and reload your section.
          </p>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-white shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #0077b6, #00b4d8)",
            }}
          >
            <RefreshCw size={18} className="animate-spin" style={{ animationDuration: '3s' }} />
            Recover Section
          </button>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-6 text-left max-w-xl w-full p-4 rounded-xl bg-gray-50 border border-gray-100 overflow-auto">
              <p className="text-[11px] font-mono text-red-500 font-bold mb-1">
                {this.state.error.toString()}
              </p>
              <p className="text-[9px] font-mono text-gray-400">
                Check browser console for stack trace.
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
