import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthorized } = useAuth();

  if (user === null) {
    // Still restoring user from localStorage, show a loader
    return <p>Loading...</p>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (!isAuthorized(requiredRole)) {
    // Redirect to home if role is incorrect
    return <Navigate to="/" />;
  }

  return children; // Render the requested page if authorized
};

export default ProtectedRoute;
