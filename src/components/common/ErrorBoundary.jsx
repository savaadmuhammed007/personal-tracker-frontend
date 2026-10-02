import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[260px] p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center flex flex-col items-center justify-center space-y-3 m-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#e1f3fd] dark:bg-[#0c4059] text-[#088ac1] dark:text-[#3dc3f3] flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Display Refreshed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            A temporary view error was recovered. Your session and logged activities are completely intact.
          </p>
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-xl bg-[#088ac1] hover:bg-[#1eb4eb] text-white font-bold text-xs shadow-md shadow-[#088ac1]/20 transition-all cursor-pointer"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
