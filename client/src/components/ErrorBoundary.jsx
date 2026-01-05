import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    // Force a hard reload to clear any corrupted memory/state
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-2xl max-w-md w-full border border-error/20">
            <div className="card-body text-center items-center">
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-error" />
              </div>
              
              <h2 className="card-title text-2xl mb-2">Something went wrong</h2>
              
              <p className="text-gray-600 mb-8">
                We encountered an unexpected error. A fresh start should fix it.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Refreshing
                </button>
                
                {/* OG FIX: Use onClick with window.location to force a hard reset */}
                <button 
                  className="btn btn-ghost w-full" 
                  onClick={this.handleReset}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home (Reset)
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;