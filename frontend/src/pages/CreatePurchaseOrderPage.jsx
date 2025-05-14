// src/pages/CreatePurchaseOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import purchaseOrderService from '../services/purchaseOrderService';
import supplierService from '../services/supplierService';
import itemService from '../services/itemService';

// Get current date formatted as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const initialPOData = {
  poNumber: `PO-${Date.now().toString().slice(-6)}`,
  supplierId: '',
  orderDate: formatDate(new Date()),
  expectedDeliveryDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  status: 'pending',
  notes: '',
  items: []
};

const initialItemData = {
  itemId: '',
  name: '',
  quantity: 1,
  unitPrice: 0
};

const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialPOData);
  const [itemData, setItemData] = useState(initialItemData);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock data for development
        const mockSuppliers = [
          { id: 1, name: 'Tech Supplies Inc.' },
          { id: 2, name: 'Office Solutions Ltd.' }
        ];
        
        const storedItems = localStorage.getItem('mockItems');
        const mockItems = storedItems ? JSON.parse(storedItems) : [];
        
        setSuppliers(mockSuppliers);
        setItems(mockItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate total amount whenever items change
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    setTotalAmount(total);
  }, [formData.items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemSelect = (event, newItem) => {
    if (newItem) {
      setItemData({
        itemId: newItem.id,
        name: newItem.name,
        quantity: 1,
        unitPrice: newItem.price || 0
      });
    } else {
      setItemData(initialItemData);
    }
  };

  const handleAddItem = () => {
    if (!itemData.itemId || !itemData.name || itemData.quantity <= 0) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...itemData }]
    }));
    
    // Reset item form
    setItemData(initialItemData);
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      setError("Please add at least one item to the purchase order.");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Add total amount to the PO data
      const purchaseOrderData = {
        ...formData,
        totalAmount
      };
      
      // Store in localStorage
      const storedPOs = localStorage.getItem('mockPurchaseOrders');
      const existingPOs = storedPOs ? JSON.parse(storedPOs) : [];
      
      // Generate ID and add supplier object
      const newPO = {
        ...purchaseOrderData,
        id: existingPOs.length > 0 ? Math.max(...existingPOs.map(po => po.id)) + 1 : 1,
        supplier: suppliers.find(s => s.id === parseInt(purchaseOrderData.supplierId))
      };
      
      localStorage.setItem('mockPurchaseOrders', JSON.stringify([...existingPOs, newPO]));
      
      navigate('/purchase-orders', {
        state: { success: `Purchase Order ${formData.poNumber} created successfully.` }
      });
    } catch (err) {
      console.error('Error creating purchase order:', err);
      setError('Failed to create purchase order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items based on selected supplier
  const filteredItems = formData.supplierId 
    ? items.filter(item => item.supplierId === parseInt(formData.supplierId)) 
    : items;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/purchase-orders')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">Create Purchase Order</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="PO Number"
              name="poNumber"
              value={formData.poNumber}
              onChange={handleChange}
              disabled // Auto-generated
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              select
              label="Supplier"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>Select a supplier</em>
              </MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Order Date"
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Expected Delivery Date"
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={filteredItems}
                  getOptionLabel={(option) => option.name}
                  onChange={handleItemSelect}
                  value={null}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={!formData.supplierId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Item"
                      fullWidth
                      helperText={!formData.supplierId ? "Please select a supplier first" : ""}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  name="quantity"
                  value={itemData.quantity}
                  onChange={handleItemChange}
                  inputProps={{ min: 1, step: 1 }}
                  disabled={!itemData.itemId}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Price"
                  name="unitPrice"
                  value={itemData.unitPrice}
                  onChange={handleItemChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                  disabled={!itemData.itemId}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  disabled={!itemData.itemId || itemData.quantity <= 0}
                >
                  Add Item
                </Button>
              </Grid>
            </Grid>

            <Box mt={3}>
              {formData.items.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">${parseFloat(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          Total Amount:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          ${totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No items added to this purchase order yet. Please add at least one item.
                </Alert>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/purchase-orders')}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting || formData.items.length === 0 || !formData.supplierId}
              >
                {submitting ? <CircularProgress size={24} /> : 'Create Purchase Order'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreatePurchaseOrderPage;