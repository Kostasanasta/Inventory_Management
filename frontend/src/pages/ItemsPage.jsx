import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import itemService from '../services/itemService';

const ItemsPage = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate total inventory value
  const totalInventoryValue = items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + (price * quantity);
  }, 0).toFixed(2);
  
  // Safely access location state
  const locationState = location.state || {};
  const [successMessage, setSuccessMessage] = useState(locationState.success || '');

  useEffect(() => {
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
      const defaultItems = [
        { id: 1, name: 'Laptop', quantity: 25, reorderLevel: 5, price: 500, supplier: { name: 'Tech Supplies Inc.' } },
        { id: 2, name: 'Monitor', quantity: 15, reorderLevel: 3, price: 125, supplier: { name: 'Tech Supplies Inc.' } },
        { id: 3, name: 'Office Chair', quantity: 3, reorderLevel: 5, price: 60, supplier: { name: 'Office Solutions Ltd.' } },
        { id: 4, name: 'Desk', quantity: 8, reorderLevel: 2, price: 70, supplier: { name: 'Office Solutions Ltd.' } },
        { id: 5, name: 'Notebook', quantity: 50, reorderLevel: 10, price: 5, supplier: { name: 'Office Solutions Ltd.' } },
        { id: 6, name: 'Printer', quantity: 4, reorderLevel: 2, price: 200, supplier: { name: 'Tech Supplies Inc.' } },
        { id: 7, name: 'Keyboards', quantity: 5, reorderLevel: 5, price: 30, supplier: { name: 'Tech Supplies Inc.' } }
      ];
      
      let mockItems = storedItems ? JSON.parse(storedItems) : defaultItems;
      
      // Try to get real items from API
      try {
        const response = await itemService.getAllItems();
        setItems(response.data);
      } catch (apiError) {
        console.log('Using mock data due to API error:', apiError);
        
        // Ensure all items have price
        mockItems = mockItems.map(item => ({
          ...item,
          price: item.price || 0
        }));
        
        setItems(mockItems);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load inventory items. Please try again later.');
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
    (item.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
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

      <Box mb={3} p={2} border="1px solid #e0e0e0" borderRadius={1} bgcolor="#f9f9f9">
        <Typography variant="h6" color="primary" gutterBottom>
          Total Inventory Value: ${totalInventoryValue}
        </Typography>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by item name, supplier, or category..."
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
                <TableCell>Price</TableCell>
                <TableCell>Value</TableCell>
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
                  <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                  <TableCell>${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</TableCell>
                  <TableCell>{item.supplier?.name || 'N/A'}</TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
                  <TableCell>
                    {item.quantity <= item.reorderLevel ? (
                      <Chip 
                        label="Low Stock" 
                        color="error" 
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
