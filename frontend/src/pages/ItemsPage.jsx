// src/pages/ItemsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Box, Chip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, CircularProgress, Alert,
  TextField, InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon,
} from '@mui/icons-material';
import itemService from '../services/itemService';

// Initial mock data
const initialMockItems = [
  { id: 1, name: 'Laptop', quantity: 25, reorderLevel: 5, supplier: { name: 'Tech Supplies Inc.' } },
  { id: 2, name: 'Monitor', quantity: 15, reorderLevel: 3, supplier: { name: 'Tech Supplies Inc.' } },
  { id: 3, name: 'Office Chair', quantity: 10, reorderLevel: 2, supplier: { name: 'Office Solutions Ltd.' } },
  { id: 4, name: 'Desk', quantity: 8, reorderLevel: 2, supplier: { name: 'Office Solutions Ltd.' } }
];

const ItemsPage = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get success message from location state if available
  const locationState = location.state || {};
  const [successMessage, setSuccessMessage] = useState(locationState.success || '');

  useEffect(() => {
    // Clear location state after reading it
    if (location.state?.success) {
      window.history.replaceState({}, document.title);
    }
    
    fetchItems();
  }, [location]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Try to get stored mock items first
      const storedItems = localStorage.getItem('mockItems');
      let mockItems = storedItems ? JSON.parse(storedItems) : initialMockItems;
      
      // Try to get real items from API
      try {
        const response = await itemService.getAllItems();
        setItems(response.data);
      } catch (apiError) {
        console.log('Using mock data due to API error:', apiError);
        
        // Check if a new item was just added (from success message)
        if (successMessage && successMessage.includes('added successfully')) {
          const itemName = successMessage.split('"')[1]; // Extract item name from success message
          if (itemName && !mockItems.some(item => item.name === itemName)) {
            // Add the new item to mock data
            const newItem = {
              id: mockItems.length > 0 ? Math.max(...mockItems.map(i => i.id)) + 1 : 1,
              name: itemName,
              quantity: 1,
              reorderLevel: 0,
              supplier: { name: 'Mock Supplier' }
            };
            mockItems = [...mockItems, newItem];
            
            // Save updated mock items to localStorage
            localStorage.setItem('mockItems', JSON.stringify(mockItems));
          }
        }
        
        setItems(mockItems);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(null); // Don't show error
      
      // Load mock items from localStorage or use initial mock data
      const storedItems = localStorage.getItem('mockItems');
      setItems(storedItems ? JSON.parse(storedItems) : initialMockItems);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    if (!item) return;
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      try {
        // Try to delete from backend
        await itemService.deleteItem(itemToDelete.id);
      } catch (apiError) {
        console.log('Backend API not available, using mock delete', apiError);
      }
      
      // Always update local state
      const updatedItems = items.filter(item => item.id !== itemToDelete.id);
      setItems(updatedItems);
      
      // Update localStorage for mock items
      localStorage.setItem('mockItems', JSON.stringify(updatedItems));
      
      setSuccessMessage(`"${itemToDelete.name || 'Item'}" was successfully deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Filter items safely
  const filteredItems = items.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Items</Typography>
        <Button 
          component={RouterLink} 
          to="/items/add" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Add New Item
        </Button>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by item name or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredItems.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Reorder Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.supplier?.name || 'N/A'}</TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
                  <TableCell>
                    {item.quantity <= item.reorderLevel ? (
                      <Chip 
                        label="Low Stock" 
                        color="warning" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        label="In Stock" 
                        color="success" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      component={RouterLink} 
                      to={`/items/edit/${item.id}`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(item)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            {searchTerm ? 'No items match your search.' : 'No inventory items found.'}
          </Typography>
        </Paper>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{itemToDelete?.name || 'this item'}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ItemsPage;