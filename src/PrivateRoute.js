import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Get token from local storage
  const token = localStorage.getItem('token');
  
  // If token is not present, redirect to login page
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PrivateRoute;