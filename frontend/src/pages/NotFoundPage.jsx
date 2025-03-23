// src/pages/NotFoundPage.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 500 }}>
        <Typography variant="h1" color="primary" sx={{ fontSize: '5rem', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h5" color="textSecondary" sx={{ mb: 3 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          startIcon={<HomeIcon />}
        >
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;