// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  // If token or role is missing OR role doesn't match, redirect to correct login page
  if (!token || role !== allowedRole) {
    // Redirect to the correct login page based on allowedRole
    const loginPath = 
      allowedRole === 'Patient' ? '/patient' :
      allowedRole === 'Doctor' ? '/doctor' :
      allowedRole === 'Admin' ? '/admin' :
      '/';

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Authorized: show the protected content
  return children;
};

export default ProtectedRoute;
