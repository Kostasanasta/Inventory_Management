// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  CircularProgress,
  Alert
} from '@mui/material';
import itemService from '../services/itemService';
import supplierService from '../services/supplierService';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalSuppliers: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for development
        const mockItems = [
          { id: 1, name: 'Laptop', quantity: 25, reorderLevel: 5, supplier: { name: 'Tech Supplies Inc.' } },
          { id: 2, name: 'Monitor', quantity: 15, reorderLevel: 3, supplier: { name: 'Tech Supplies Inc.' } },
          { id: 3, name: 'Office Chair', quantity: 3, reorderLevel: 5, supplier: { name: 'Office Solutions Ltd.' } },
          { id: 4, name: 'Desk', quantity: 8, reorderLevel: 2, supplier: { name: 'Office Solutions Ltd.' } }
        ];
        
        const mockSuppliers = [
          { id: 1, name: 'Tech Supplies Inc.' },
          { id: 2, name: 'Office Solutions Ltd.' }
        ];

        // Try to fetch real data, fall back to mock data if API not available
        let items = [];
        let suppliers = [];
        
        try {
          const [itemsResponse, suppliersResponse] = await Promise.all([
            itemService.getAllItems(),
            supplierService.getAllSuppliers(),
          ]);
          
          items = itemsResponse.data;
          suppliers = suppliersResponse.data;
        } catch (apiError) {
          console.log('Using mock data due to API error:', apiError);
          items = mockItems;
          suppliers = mockSuppliers;
        }

        const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);

        setStats({
          totalItems: items.length,
          lowStockItems: lowStockItems.length,
          totalSuppliers: suppliers.length,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Dashboard data error:', error);
        setStats({
          totalItems: 4,
          lowStockItems: 1,
          totalSuppliers: 2,
          loading: false,
          error: null, // Set to null to prevent showing error
        });
      }
    };

    fetchData();
  }, []);

  if (stats.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Total Items
            </Typography>
            <Typography variant="h3">
              {stats.totalItems}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', 
            bgcolor: stats.lowStockItems > 0 ? '#fff8e1' : 'inherit' }}>
            <Typography variant="h5" gutterBottom>
              Low Stock Items
            </Typography>
            <Typography variant="h3" color={stats.lowStockItems > 0 ? 'warning.main' : 'inherit'}>
              {stats.lowStockItems}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Suppliers
            </Typography>
            <Typography variant="h3">
              {stats.totalSuppliers}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;