// src/pages/BarcodeScannerPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Paper,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const BarcodeScannerPage = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Barcode Scanner</Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Barcode scanner functionality is currently in development. This feature will allow you to scan 
          barcodes to quickly update inventory quantities. Check back soon!
        </Alert>
        
        <Box mt={2}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/barcodes')}
          >
            Return to Barcode Generator
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default BarcodeScannerPage;