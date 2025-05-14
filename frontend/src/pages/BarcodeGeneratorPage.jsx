// src/pages/BarcodeGeneratorPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  Code as BarcodeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import itemService from '../services/itemService';

// Barcode types
const barcodeTypes = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'UPC', label: 'UPC' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'ITF', label: 'ITF-14' },
  { value: 'QR', label: 'QR Code' }
];

const BarcodeGeneratorPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [showItemInfo, setShowItemInfo] = useState(true);
  const [labelsPerPage, setLabelsPerPage] = useState(12);
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        // Get items from localStorage
        const storedItems = localStorage.getItem('mockItems');
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        } else {
          setItems([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...filteredItems]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items by search term
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">Barcode Generator</Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print Barcodes
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Barcode generation settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Barcode Settings</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Barcode Type</InputLabel>
              <Select
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value)}
                label="Barcode Type"
              >
                {barcodeTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Labels Per Page</InputLabel>
              <Select
                value={labelsPerPage}
                onChange={(e) => setLabelsPerPage(e.target.value)}
                label="Labels Per Page"
              >
                <MenuItem value={8}>8 (Large)</MenuItem>
                <MenuItem value={12}>12 (Medium)</MenuItem>
                <MenuItem value={24}>24 (Small)</MenuItem>
                <MenuItem value={30}>30 (Mini)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showItemInfo}
                  onChange={(e) => setShowItemInfo(e.target.checked)}
                />
              }
              label="Include item information on labels"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={barcodeType === 'QR' ? <QrCodeIcon /> : <BarcodeIcon />}
              disabled={selectedItems.length === 0}
            >
              Generate {barcodeType === 'QR' ? 'QR Codes' : 'Barcodes'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Item selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Select Items</Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '50%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="outlined"
            onClick={handleSelectAll}
          >
            {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
          </Button>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredItems.length > 0 ? (
          <Grid container spacing={2}>
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(i => i.id === item.id);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.light' : 'white',
                      '&:hover': {
                        borderColor: 'primary.main',
                      }
                    }}
                    onClick={() => handleItemSelect(item)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                          {item.name}
                        </Typography>
                        <Checkbox checked={isSelected} />
                      </Box>
                      
                      <Typography color="text.secondary" gutterBottom>
                        {item.category ? (
                          <Chip label={item.category} size="small" color="primary" variant="outlined" />
                        ) : 'No category'}
                      </Typography>
                      
                      <Box mt={1}>
                        <Typography variant="body2">
                          Quantity: {item.quantity}
                        </Typography>
                        <Typography variant="body2">
                          Price: ${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Alert severity="info">
            No items match your search criteria.
          </Alert>
        )}
      </Paper>

      {/* Information about scanner feature */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Barcode Scanner</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Use the barcode scanner feature to quickly update inventory quantities by scanning barcodes.
        </Alert>
        
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/barcodes/scanner')}
          >
            Go to Barcode Scanner
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default BarcodeGeneratorPage;