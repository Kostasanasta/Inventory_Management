// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  CircularProgress,
  Link,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import itemService from '../services/itemService';
import supplierService from '../services/supplierService';

// Use this only if you have recharts installed
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Colors for charts
const COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#F44336', '#9C27B0', '#00BCD4'];

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: [],
    totalSuppliers: 0,
    totalInventoryValue: 0,
    categoryCounts: [],
    supplierCounts: [],
    stockStatus: [],
    topValueItems: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get mock items from localStorage or use default mock data
        const storedItems = localStorage.getItem('mockItems');
        const mockItems = storedItems ? JSON.parse(storedItems) : [
          { id: 1, name: 'Laptop', quantity: 25, reorderLevel: 5, price: 899.99, supplier: { name: 'Tech Supplies Inc.' }, category: 'Electronics' },
          { id: 2, name: 'Monitor', quantity: 15, reorderLevel: 3, price: 249.99, supplier: { name: 'Tech Supplies Inc.' }, category: 'Electronics' },
          { id: 3, name: 'Office Chair', quantity: 3, reorderLevel: 5, price: 179.99, supplier: { name: 'Office Solutions Ltd.' }, category: 'Furniture' },
          { id: 4, name: 'Desk', quantity: 8, reorderLevel: 2, price: 349.99, supplier: { name: 'Office Solutions Ltd.' }, category: 'Furniture' },
          { id: 5, name: 'Notebook', quantity: 50, reorderLevel: 10, price: 4.99, supplier: { name: 'Office Solutions Ltd.' }, category: 'Stationery' },
          { id: 6, name: 'Printer', quantity: 4, reorderLevel: 2, price: 299.99, supplier: { name: 'Tech Supplies Inc.' }, category: 'Electronics' }
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

        // Make sure all items have a price
        items = items.map(item => ({
          ...item,
          price: parseFloat(item.price || 0)
        }));

        // Calculate total inventory value
        const totalInventoryValue = items.reduce((total, item) => {
          return total + (parseFloat(item.price || 0) * parseInt(item.quantity || 0));
        }, 0);

        // Top value items (sorted by total value)
        const topValueItems = items
          .map(item => ({
            ...item,
            totalValue: item.price * item.quantity
          }))
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 5);

        const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);

        // Calculate category counts for charts
        const categoryMap = items.reduce((acc, item) => {
          const category = item.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        const categoryCounts = Object.keys(categoryMap).map(category => ({
          name: category,
          count: categoryMap[category]
        }));

        // Calculate supplier counts for charts
        const supplierMap = items.reduce((acc, item) => {
          const supplierName = item.supplier?.name || 'N/A';
          acc[supplierName] = (acc[supplierName] || 0) + 1;
          return acc;
        }, {});

        const supplierCounts = Object.keys(supplierMap).map(supplier => ({
          name: supplier,
          count: supplierMap[supplier]
        }));

        // Stock status data for charts
        const stockStatus = [
          { name: 'Low Stock', value: lowStockItems.length },
          { name: 'Normal Stock', value: items.length - lowStockItems.length }
        ];

        setStats({
          totalItems: items.length,
          lowStockItems: lowStockItems,
          totalSuppliers: suppliers.length,
          totalInventoryValue,
          categoryCounts,
          supplierCounts,
          stockStatus,
          topValueItems,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Dashboard data error:', error);
        // Fallback stats with mock data
        setStats({
          totalItems: 6,
          lowStockItems: [
            { id: 3, name: 'Office Chair', quantity: 3, reorderLevel: 5, supplier: { name: 'Office Solutions Ltd.' }, category: 'Furniture' }
          ],
          totalSuppliers: 2,
          totalInventoryValue: 16315, // Removed last two digits
          categoryCounts: [
            { name: 'Electronics', count: 3 },
            { name: 'Furniture', count: 2 },
            { name: 'Stationery', count: 1 }
          ],
          supplierCounts: [
            { name: 'Tech Supplies Inc.', count: 3 },
            { name: 'Office Solutions Ltd.', count: 3 }
          ],
          stockStatus: [
            { name: 'Low Stock', value: 1 },
            { name: 'Normal Stock', value: 5 }
          ],
          topValueItems: [
            { id: 1, name: 'Laptop', quantity: 25, price: 899.99, totalValue: 22499.75 },
            { id: 2, name: 'Monitor', quantity: 15, price: 249.99, totalValue: 3749.85 },
          ],
          loading: false,
          error: null,
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
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Total Items
            </Typography>
            <Typography variant="h2" color="primary.main">
              {stats.totalItems}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', 
            bgcolor: stats.lowStockItems.length > 0 ? '#FFEBEE' : 'white' }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            <Typography variant="h2" color={stats.lowStockItems.length > 0 ? '#D32F2F' : 'inherit'}>
              {stats.lowStockItems.length}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Suppliers
            </Typography>
            <Typography variant="h2" color="primary.main">
              {stats.totalSuppliers}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: '#E8F5E9' }}>
            <Typography variant="h6" gutterBottom>
              Total Inventory Value
            </Typography>
            <Typography variant="h2" color="#2E7D32">
              ${stats.totalInventoryValue.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Second Row - Changed Layout */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Stock Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Stock Status
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={stats.stockStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="cell-0" fill="#F44336" /> {/* Low Stock - Red */}
                    <Cell key="cell-1" fill="#4CAF50" /> {/* Normal Stock - Green */}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Items by Supplier (moved to top right) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Items by Supplier
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.supplierCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Items" fill="#81C784" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Third Row - Combination of Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Items by Category */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Items by Category
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Items" fill="#9FA8DA" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Value Items */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Top Value Items
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topValueItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        {item.name}
                      </TableCell>
                      <TableCell align="right">
                        ${item.totalValue.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Low Stock Items Alert Section */}
      {stats.lowStockItems.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#FFEBEE', borderLeft: '4px solid #F44336' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="#D32F2F" sx={{ mb: 0 }}>
                  Low Stock Alert
                </Typography>
                <Button 
                  variant="contained" 
                  color="error"
                  startIcon={<NotificationsIcon />}
                  component={RouterLink}
                  to="/notifications/settings"
                >
                  Manage Alerts
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                The following items are below their reorder levels and need attention.
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats.lowStockItems.map((item, index) => (
                  <Box key={item.id} sx={{ 
                    p: 2, 
                    mb: index < stats.lowStockItems.length - 1 ? 1 : 0,
                    bgcolor: 'white',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="subtitle1">
                        <Link component={RouterLink} to={`/items/edit/${item.id}`} color="primary">
                          {item.name}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity} | Reorder Level: {item.reorderLevel} | Supplier: {item.supplier?.name || 'N/A'} 
                        {item.price ? ` | Price: ${parseFloat(item.price).toFixed(2)}` : ''}
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      component={RouterLink}
                      to={`/items/edit/${item.id}`}
                    >
                      Restock
                    </Button>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default DashboardPage;
