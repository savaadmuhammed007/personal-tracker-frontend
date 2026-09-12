import React from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              An unexpected error occurred. You can reload the application or reset your local session.
            </p>
            {this.state.error && (
              <pre className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-left text-[11px] font-mono overflow-auto max-h-40 border border-rose-200 dark:border-rose-900">
                {this.state.error.toString()}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-[#088ac1] hover:bg-[#076e9d] text-white font-bold text-xs shadow-md shadow-[#088ac1]/20 transition-all"
              >
                Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
