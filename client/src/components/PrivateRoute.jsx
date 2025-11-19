import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const userId = userData.id;

  const token = userId
    ? localStorage.getItem(`accessToken_${userId}`)
    : null;

  const isLoggedIn = userId
    ? localStorage.getItem(`isLoggedIn_${userId}`)
    : null;

  if (!token || isLoggedIn !== 'true') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
