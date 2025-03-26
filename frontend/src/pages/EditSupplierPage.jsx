// src/pages/EditSupplierPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import supplierService from '../services/supplierService';

const EditSupplierPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await supplierService.getSupplierById(id);
        const supplier = response.data;
        
        setFormData({
          name: supplier.name,
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          notes: supplier.notes || '',
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load supplier data');
        setLoading(false);
      }
    };

    fetchSupplier();
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
      await supplierService.updateSupplier(id, formData);
      navigate('/suppliers', { state: { success: `Supplier "${formData.name}" updated successfully` } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update supplier. Please try again.');
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
          onClick={() => navigate('/suppliers')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">Edit Supplier</Typography>
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
              label="Supplier Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => navigate('/suppliers')}
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

export default EditSupplierPage;
