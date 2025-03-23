// src/pages/EditItemPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import itemService from '../services/itemService';
import supplierService from '../services/supplierService';

const EditItemPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    reorderLevel: '',
    supplierId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemResponse, suppliersResponse] = await Promise.all([
          itemService.getItemById(id),
          supplierService.getAllSuppliers(),
        ]);
        
        const item = itemResponse.data;
        setFormData({
          name: item.name,
          description: item.description || '',
          quantity: item.quantity.toString(),
          reorderLevel: item.reorderLevel.toString(),
          supplierId: item.supplierId ? item.supplierId.toString() : '',
        });
        
        setSuppliers(suppliersResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load item data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const itemData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        reorderLevel: parseInt(formData.reorderLevel, 10),
        supplierId: formData.supplierId ? parseInt(formData.supplierId, 10) : null,
      };

      await itemService.updateItem(id, itemData);
      navigate('/items', { state: { success: `Item "${formData.name}" updated successfully` } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item. Please try again.');
      setSaving(false);
    }
  };

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
          onClick={() => navigate('/items')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">Edit Inventory Item</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Item Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Reorder Level"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Supplier"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => navigate('/items')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default EditItemPage;