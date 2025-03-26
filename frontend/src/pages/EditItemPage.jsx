// src/pages/EditItemPage.jsx
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
  Autocomplete,
  InputAdornment
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import itemService from '../services/itemService';
import supplierService from '../services/supplierService';

// Predefined categories
const predefinedCategories = [
  'Electronics',
  'Furniture',
  'Stationery',
  'Office Supplies',
  'Kitchen',
  'Cleaning Supplies',
  'IT Equipment',
  'Peripherals'
];

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
    price: '',
    supplierId: '',
    category: '',
  });

  // Default mock data - will be used if no stored items
  const DEFAULT_MOCK_ITEMS = [
    { id: 1, name: 'Laptop', quantity: 25, reorderLevel: 5, price: 899.99, supplier: { name: 'Tech Supplies Inc.', id: 1 }, supplierId: 1, category: 'Electronics' },
    { id: 2, name: 'Monitor', quantity: 15, reorderLevel: 3, price: 249.99, supplier: { name: 'Tech Supplies Inc.', id: 1 }, supplierId: 1, category: 'Electronics' },
    { id: 3, name: 'Office Chair', quantity: 3, reorderLevel: 5, price: 179.99, supplier: { name: 'Office Solutions Ltd.', id: 2 }, supplierId: 2, category: 'Furniture' },
    { id: 4, name: 'Desk', quantity: 8, reorderLevel: 2, price: 349.99, supplier: { name: 'Office Solutions Ltd.', id: 2 }, supplierId: 2, category: 'Furniture' },
    { id: 5, name: 'Notebook', quantity: 50, reorderLevel: 10, price: 4.99, supplier: { name: 'Office Solutions Ltd.', id: 2 }, supplierId: 2, category: 'Stationery' },
    { id: 6, name: 'Printer', quantity: 4, reorderLevel: 2, price: 299.99, supplier: { name: 'Tech Supplies Inc.', id: 1 }, supplierId: 1, category: 'Electronics' },
    { id: 7, name: 'Headphones', quantity: 12, reorderLevel: 3, price: 89.99, supplier: { name: 'Tech Supplies Inc.', id: 1 }, supplierId: 1, category: 'Electronics' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching data for item with ID:", id);

        // Default suppliers for fallback
        const DEFAULT_SUPPLIERS = [
          { id: 1, name: 'Tech Supplies Inc.' },
          { id: 2, name: 'Office Solutions Ltd.' }
        ];
        
        // Get stored mock items or use defaults
        let storedItems;
        try {
          storedItems = localStorage.getItem('mockItems');
          console.log("Retrieved from localStorage:", storedItems);
        } catch (e) {
          console.error("Error accessing localStorage:", e);
          storedItems = null;
        }
        
        const mockItems = storedItems ? JSON.parse(storedItems) : DEFAULT_MOCK_ITEMS;
        console.log("Mock items available:", mockItems.map(item => `ID: ${item.id}, Name: ${item.name}`));
        
        let item = null;
        let suppliersList = [];
        
        try {
          // Try to fetch from API
          console.log("Attempting to fetch from API...");
          const [itemResponse, suppliersResponse] = await Promise.all([
            itemService.getItemById(id),
            supplierService.getAllSuppliers(),
          ]);
          
          item = itemResponse.data;
          suppliersList = suppliersResponse.data;
          console.log("Successfully fetched from API:", item);
        } catch (apiError) {
          console.log('API fetch failed, using mock data:', apiError);
          
          // Find item in mock data - try both string and numeric comparison
          const itemId = id;
          item = mockItems.find(item => 
            String(item.id) === String(itemId) || 
            item.id === Number(itemId)
          );
          
          console.log("Found item in mock data:", item);
          suppliersList = DEFAULT_SUPPLIERS;
        }
        
        // If still no item found, use a placeholder
        if (!item) {
          console.warn(`Item with ID ${id} not found in API or mock data. Using placeholder`);
          
          // Create a new placeholder item with the requested ID
          item = {
            id: Number(id) || 1,
            name: `Item ${id}`,
            description: "No description available",
            quantity: 0,
            reorderLevel: 0,
            price: 0,
            supplierId: null,
            supplier: null,
            category: "Uncategorized"
          };
        }
        
        setFormData({
          name: item.name || '',
          description: item.description || '',
          quantity: String(item.quantity || 0),
          reorderLevel: String(item.reorderLevel || 0),
          price: String(item.price || 0),
          supplierId: item.supplierId ? String(item.supplierId) : '',
          category: item.category || '',
        });
        
        setSuppliers(suppliersList);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load item data. Please try again.');
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

  const handleCategoryChange = (event, newValue) => {
    setFormData({
      ...formData,
      category: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const itemData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10) || 0,
        reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
        price: parseFloat(formData.price) || 0,
        supplierId: formData.supplierId ? parseInt(formData.supplierId, 10) : null,
      };

      try {
        // Try to update via API
        await itemService.updateItem(id, itemData);
        console.log("Updated item via API");
      } catch (apiError) {
        console.log('Backend API update failed, updating mock data', apiError);
        
        // Update in localStorage
        try {
          const storedItems = localStorage.getItem('mockItems');
          if (storedItems) {
            const mockItems = JSON.parse(storedItems);
            
            // Find the item using a flexible comparison
            const itemIndex = mockItems.findIndex(item => 
              String(item.id) === String(id) || 
              item.id === Number(id)
            );
            
            if (itemIndex !== -1) {
              // Get the supplier object based on the selected supplierId
              const supplierObj = suppliers.find(s => 
                String(s.id) === String(itemData.supplierId) || 
                s.id === Number(itemData.supplierId)
              );
              
              // Update the item
              mockItems[itemIndex] = {
                ...mockItems[itemIndex],
                ...itemData,
                id: Number(id),
                supplier: supplierObj || mockItems[itemIndex].supplier
              };
              
              localStorage.setItem('mockItems', JSON.stringify(mockItems));
              console.log("Updated item in localStorage");
            } else {
              // If item doesn't exist in mock data, add it
              const newItem = {
                ...itemData,
                id: Number(id),
                supplier: suppliers.find(s => s.id === Number(itemData.supplierId)) || { name: 'Unknown Supplier' }
              };
              
              mockItems.push(newItem);
              localStorage.setItem('mockItems', JSON.stringify(mockItems));
              console.log("Added new item to localStorage");
            }
          } else {
            // Initialize mock items if not present
            const initialItems = DEFAULT_MOCK_ITEMS.slice();
            
            // Replace or add the current item
            const existingIndex = initialItems.findIndex(item => 
              String(item.id) === String(id) || 
              item.id === Number(id)
            );
            
            if (existingIndex !== -1) {
              initialItems[existingIndex] = {
                ...initialItems[existingIndex],
                ...itemData,
                id: Number(id),
                supplier: suppliers.find(s => s.id === Number(itemData.supplierId)) || { name: 'Unknown Supplier' }
              };
            } else {
              initialItems.push({
                ...itemData,
                id: Number(id),
                supplier: suppliers.find(s => s.id === Number(itemData.supplierId)) || { name: 'Unknown Supplier' }
              });
            }
            
            localStorage.setItem('mockItems', JSON.stringify(initialItems));
            console.log("Initialized localStorage with default items plus the updated item");
          }
        } catch (localStorageError) {
          console.error("Error updating localStorage:", localStorageError);
        }
      }
      
      navigate('/items', { state: { success: `Item "${formData.name}" updated successfully` } });
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('Failed to update item. Please try again.');
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

          <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={4}>
            <TextField
              required
              fullWidth
              type="number"
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
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
                <MenuItem key={supplier.id} value={String(supplier.id)}>
                  {supplier.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              freeSolo
              options={predefinedCategories}
              value={formData.category}
              onChange={handleCategoryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  placeholder="Select or enter a category"
                  fullWidth
                />
              )}
            />
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
