import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
              <p className="text-slate-300 mb-4">
                The application encountered an error. Please check the browser console for more details.
              </p>
              
              {this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                    Error Details
                  </summary>
                  <pre className="text-sm text-slate-400 bg-slate-800 p-3 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              
              {this.state.errorInfo && (
                <details>
                  <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                    Component Stack
                  </summary>
                  <pre className="text-sm text-slate-400 bg-slate-800 p-3 rounded overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
              >
                Reload Page
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
