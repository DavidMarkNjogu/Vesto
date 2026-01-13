import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();

  // --- DIAGNOSTIC LOGS ---
  console.log("🛡️ ProtectedRoute Check:", {
    path: location.pathname,
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    loading
  });

  // 0. Wait for Hydration
  if (loading) {
    console.log("⏳ ProtectedRoute: Loading state active...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 1. Authentication Check
  if (!isAuthenticated) {
    console.warn("⛔ ProtectedRoute: Not authenticated. Redirecting to /login");
    // Redirect to login, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Authorization Check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.error(`🚫 ProtectedRoute: Role mismatch. User: ${user?.role}, Required: ${allowedRoles}`);
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
  console.log("✅ ProtectedRoute: Access Granted");
  return <Outlet />;
};

export default ProtectedRoute;