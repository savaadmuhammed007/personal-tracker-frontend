import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ErrorBoundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xl w-full p-6 rounded-3xl bg-slate-800 border border-slate-700 space-y-4 shadow-xl text-left">
            <h2 className="text-lg font-bold text-rose-400">Application Notice</h2>
            <p className="text-xs text-slate-300 font-mono">
              {this.state.error?.toString() || 'An unexpected error occurred during rendering.'}
            </p>
            {this.state.error?.stack && (
              <pre className="text-[11px] text-rose-300/80 bg-slate-950/80 p-3 rounded-xl overflow-auto max-h-60 font-mono select-all">
                {this.state.error.stack}
              </pre>
            )}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-[#088ac1] hover:bg-[#1eb4eb] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Clear Cache & Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
