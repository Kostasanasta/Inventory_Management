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
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

// Placeholder for the actual service - you'll need to create this file
const supplierService = {
  getAllSuppliers: () => {
    // Simulate API call with mock data for now
    return Promise.resolve({
      data: [
        { 
          id: 1, 
          name: 'Tech Supplies Inc.', 
          email: 'contact@techsupplies.com', 
          phone: '(555) 123-4567', 
          address: '123 Tech Street, Silicon Valley, CA' 
        },
        { 
          id: 2, 
          name: 'Office Solutions Ltd.', 
          email: 'info@officesolutions.com', 
          phone: '(555) 987-6543', 
          address: '456 Office Avenue, Business District, NY' 
        }
      ]
    });
  },
  deleteSupplier: (id) => {
    // Simulate API call
    console.log(`Deleting supplier ${id}`);
    return Promise.resolve({ data: { id } });
  }
};

const SuppliersPage = () => {
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Safely access location state
  const locationState = location.state || {};
  const [successMessage, setSuccessMessage] = useState(locationState.success || '');

  useEffect(() => {
    // Clear location state after reading it
    if (location.state?.success) {
      window.history.replaceState({}, document.title);
    }
    
    fetchSuppliers();
  }, [location]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAllSuppliers();
      console.log('Suppliers data:', response.data);
      setSuppliers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (supplier) => {
    if (!supplier) return;
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;
    
    try {
      await supplierService.deleteSupplier(supplierToDelete.id);
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDelete.id));
      setSuccessMessage(`"${supplierToDelete.name || 'Supplier'}" was successfully deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError('Failed to delete supplier. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  // Filter suppliers safely
  const filteredSuppliers = suppliers.filter(supplier => 
    (supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.phone || '').includes(searchTerm)
  );

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Suppliers</Typography>
        <Button
          component={RouterLink}
          to="/suppliers/add"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add New Supplier
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, email, or phone..."
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
      ) : filteredSuppliers.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact Info</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column">
                      {supplier.email && (
                        <Box display="flex" alignItems="center" mb={1}>
                          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                          {supplier.email}
                        </Box>
                      )}
                      {supplier.phone && (
                        <Box display="flex" alignItems="center">
                          <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                          {supplier.phone}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{supplier.address || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      component={RouterLink} 
                      to={`/suppliers/edit/${supplier.id}`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(supplier)}
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
            {searchTerm ? 'No suppliers match your search.' : 'No suppliers found.'}
          </Typography>
        </Paper>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{supplierToDelete?.name || 'this supplier'}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SuppliersPage;