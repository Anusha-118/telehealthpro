import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // If auth is verifying, display a glassmorphic loader skeleton
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-darkBg-deep">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user's role is not authorized, redirect to their role's main page
    const fallbackPath = {
      patient: '/patient',
      doctor: '/doctor',
      admin: '/admin'
    }[user?.role] || '/';

    return <Navigate to={fallbackPath} replace />;
  }

  // Render children/nested routes
  return <Outlet />;
};

export default ProtectedRoute;
