import React from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body text-center">
              <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
              <h2 className="card-title justify-center text-2xl mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="card-actions justify-center">
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
                <Link to="/" className="btn btn-ghost">
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
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


