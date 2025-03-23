// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProtectedRoute = ({ requireAdmin }) => {
  const { currentUser, isLoading, isAdmin } = useContext(AuthContext);
  const location = useLocation();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentUser) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !isAdmin()) {
    // If admin route but user is not admin, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // If they are logged in and have appropriate permissions, show the route
  return <Outlet />;
};

export default ProtectedRoute;