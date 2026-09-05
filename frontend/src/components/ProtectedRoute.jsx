import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * This is basically a bouncer for our pages.
 * It checks if you're logged in, and if the page needs a specific role (like Manager),
 * it checks that too. If you're not allowed in, it sends you somewhere safe.
 */
const ProtectedRoute = ({ user, allowedRoles }) => {
  // Not logged in? Go back to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but trying to visit a manager-only page? Nope, back to your reports
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/my-reports" replace />;
  }

  // All good! Show whatever page they were trying to get to
  return <Outlet />;
};

export default ProtectedRoute;

