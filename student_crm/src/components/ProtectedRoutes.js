import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthorized } = useAuth();
  // debugger;
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !isAuthorized(requiredRole)) {
    // Redirect to unauthorized page if role is incorrect
    if(children.type.name === "Dashboard"){
      if(user.role === 'student')return <Navigate to="/student-profile" />;
      if(user.role === 'teacher')return <Navigate to="/teacher-profile" />;
    }
    return <Navigate to="/unauthorized" />;
  }

  return children; 
};

export default ProtectedRoute;
