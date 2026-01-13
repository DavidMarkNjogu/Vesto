import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Authentication Check
  if (!isAuthenticated) {
    // Redirect to login, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Authorization Check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-gray-200 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">
            You are logged in as a <strong>{user?.role}</strong>, but you do not have permission to access the <strong>{allowedRoles[0]}</strong> portal.
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-outline btn-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 3. Access Granted
  return <Outlet />;
};

export default ProtectedRoute;