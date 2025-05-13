// src/pages/PurchaseOrdersPage.jsx
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
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import purchaseOrderService from '../services/purchaseOrderService';

const statusColors = {
  pending: 'warning',
  ordered: 'info',
  received: 'success',
  cancelled: 'error'
};

const PurchaseOrdersPage = () => {
  const location = useLocation();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [poToUpdateStatus, setPoToUpdateStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // Safely access location state
  const locationState = location.state || {};
  const [successMessage, setSuccessMessage] = useState(locationState.success || '');

  useEffect(() => {
    if (location.state?.success) {
      window.history.replaceState({}, document.title);
    }
    fetchPurchaseOrders();
  }, [location]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      
      // Get from localStorage or use empty array
      const storedPOs = localStorage.getItem('mockPurchaseOrders');
      const mockPOs = storedPOs ? JSON.parse(storedPOs) : [];
      setPurchaseOrders(mockPOs);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setError('Failed to load purchase orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (po) => {
    if (!po) return;
    setPoToDelete(po);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!poToDelete) return;
    
    try {
      // Update state
      setPurchaseOrders(prevPOs => prevPOs.filter(po => po.id !== poToDelete.id));
      
      // Update localStorage
      const storedPOs = localStorage.getItem('mockPurchaseOrders');
      if (storedPOs) {
        const mockPOs = JSON.parse(storedPOs);
        const filteredPOs = mockPOs.filter(po => po.id !== poToDelete.id);
        localStorage.setItem('mockPurchaseOrders', JSON.stringify(filteredPOs));
      }
      
      setSuccessMessage(`Purchase Order ${poToDelete.poNumber} was successfully deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting purchase order:', err);
      setError('Failed to delete purchase order. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setPoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPoToDelete(null);
  };

  const handleRowExpand = (poId) => {
    setExpandedRows(prev => ({
      ...prev,
      [poId]: !prev[poId]
    }));
  };

  const handleStatusClick = (po, status) => {
    setPoToUpdateStatus(po);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!poToUpdateStatus || !newStatus) return;
    
    try {
      await purchaseOrderService.updatePurchaseOrderStatus(poToUpdateStatus.id, newStatus);
      
      // Update state
      setPurchaseOrders(prevPOs => prevPOs.map(po => 
        po.id === poToUpdateStatus.id ? { ...po, status: newStatus } : po
      ));
      
      setSuccessMessage(`Purchase Order ${poToUpdateStatus.poNumber} status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating purchase order status:', err);
      setError('Failed to update purchase order status. Please try again.');
    } finally {
      setStatusDialogOpen(false);
      setPoToUpdateStatus(null);
      setNewStatus('');
    }
  };

  const handleStatusCancel = () => {
    setStatusDialogOpen(false);
    setPoToUpdateStatus(null);
    setNewStatus('');
  };

  const handleGeneratePOs = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await purchaseOrderService.generatePurchaseOrdersForLowStock();
      const generatedPOs = response.data;
      
      if (generatedPOs.length === 0) {
        setSuccessMessage('No new purchase orders needed at this time.');
      } else {
        setPurchaseOrders(prevPOs => [...generatedPOs, ...prevPOs]);
        setSuccessMessage(`Successfully generated ${generatedPOs.length} purchase orders for low stock items.`);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error generating purchase orders:', err);
      setError('Failed to generate purchase orders. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Filter purchase orders
  const filteredPOs = purchaseOrders.filter(po => 
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date string to readable format without date-fns
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Purchase Orders</Typography>
        <Box>
          <Button 
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleGeneratePOs}
            disabled={generating}
            sx={{ mr: 2 }}
          >
            {generating ? <CircularProgress size={24} /> : 'Generate POs for Low Stock'}
          </Button>
          <Button 
            component={RouterLink} 
            to="/purchase-orders/create" 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
          >
            Create Purchase Order
          </Button>
        </Box>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by PO number, supplier, or status..."
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
      ) : filteredPOs.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PO Number</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Expected Delivery</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPOs.map((po) => (
                <React.Fragment key={po.id}>
                  <TableRow>
                    <TableCell>{po.poNumber}</TableCell>
                    <TableCell>{po.supplier?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(po.orderDate)}</TableCell>
                    <TableCell>{formatDate(po.expectedDeliveryDate)}</TableCell>
                    <TableCell>${po.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={po.status.charAt(0).toUpperCase() + po.status.slice(1)} 
                        color={statusColors[po.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex">
                        {po.status === 'pending' && (
                          <Tooltip title="Mark as Ordered">
                            <IconButton 
                              color="info" 
                              size="small"
                              onClick={() => handleStatusClick(po, 'ordered')}
                            >
                              <ShippingIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {po.status === 'ordered' && (
                          <Tooltip title="Mark as Received">
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleStatusClick(po, 'received')}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {(po.status === 'pending' || po.status === 'ordered') && (
                          <Tooltip title="Cancel Order">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleStatusClick(po, 'cancelled')}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {po.status === 'pending' && (
                          <Tooltip title="Edit">
                            <IconButton
                              component={RouterLink}
                              to={`/purchase-orders/edit/${po.id}`}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {po.status === 'pending' && (
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteClick(po)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRowExpand(po.id)}
                      >
                        {expandedRows[po.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded row for items */}
                  <TableRow>
                    <TableCell colSpan={8} style={{ paddingTop: 0, paddingBottom: 0 }}>
                      <Collapse in={expandedRows[po.id]} timeout="auto" unmountOnExit>
                        <Box p={2} bgcolor="#f9f9f9">
                          <Typography variant="h6" gutterBottom>
                            Items
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                                <TableCell align="right">Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {po.items && po.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell component="th" scope="row">
                                    {item.name}
                                  </TableCell>
                                  <TableCell align="right">{item.quantity}</TableCell>
                                  <TableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</TableCell>
                                  <TableCell align="right">
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                  Total:
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  ${po.totalAmount?.toFixed(2) || '0.00'}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          
                          {po.notes && (
                            <Box mt={2}>
                              <Typography variant="subtitle2">Notes:</Typography>
                              <Typography variant="body2">{po.notes}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            {searchTerm ? 'No purchase orders match your search.' : 'No purchase orders found.'}
          </Typography>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete purchase order "{poToDelete?.poNumber || ''}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleStatusCancel}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {newStatus === 'ordered' && `Are you sure you want to mark PO "${poToUpdateStatus?.poNumber || ''}" as Ordered?`}
            {newStatus === 'received' && `Are you sure you want to mark PO "${poToUpdateStatus?.poNumber || ''}" as Received? This will update your inventory levels.`}
            {newStatus === 'cancelled' && `Are you sure you want to cancel PO "${poToUpdateStatus?.poNumber || ''}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusCancel} color="primary">Cancel</Button>
          <Button onClick={handleStatusConfirm} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PurchaseOrdersPage;