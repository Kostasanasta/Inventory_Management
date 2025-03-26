// src/pages/NotificationSettingsPage.jsx
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
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Switch,
  Slider,
  Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import notificationService from '../services/notificationService';
import itemService from '../services/itemService';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    enabled: true,
    email: '',
    threshold: 5,
    frequency: 'daily'
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch notification settings
        const settingsResponse = await notificationService.getNotificationSettings();
        setSettings(settingsResponse.data);
        
        // Fetch low stock items for preview
        try {
          const itemsResponse = await itemService.getAllItems();
          const items = itemsResponse.data;
          const lowStock = items.filter(item => item.quantity <= item.reorderLevel);
          setLowStockItems(lowStock);
        } catch (apiError) {
          // Use mock data if API fails
          const storedItems = localStorage.getItem('mockItems');
          const mockItems = storedItems ? JSON.parse(storedItems) : [];
          const lowStock = mockItems.filter(item => item.quantity <= item.reorderLevel);
          setLowStockItems(lowStock);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notification settings:', err);
        setError('Failed to load notification settings. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: name === 'enabled' ? checked : value,
    });
  };

  const handleSliderChange = (event, newValue) => {
    setSettings({
      ...settings,
      threshold: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await notificationService.saveNotificationSettings(settings);
      setSaving(false);
      setSuccess('Notification settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings. Please try again.');
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    setError(null);
    setSuccess(null);

    try {
      await notificationService.sendNotification({
        to: settings.email,
        subject: 'Test Notification: Low Stock Alert',
        items: lowStockItems
      });
      setSendingTest(false);
      setSuccess('Test notification sent successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError('Failed to send test notification. Please try again.');
      setSendingTest(false);
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
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">Notification Settings</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <NotificationsIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Email Notification Settings</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={handleChange}
                  name="enabled"
                  color="primary"
                />
              }
              label="Enable Low Stock Email Notifications"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Notification Email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              disabled={!settings.enabled}
              InputProps={{
                startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!settings.enabled}>
              <InputLabel>Notification Frequency</InputLabel>
              <Select
                name="frequency"
                value={settings.frequency}
                label="Notification Frequency"
                onChange={handleChange}
              >
                <MenuItem value="immediate">Immediate (As soon as stock is low)</MenuItem>
                <MenuItem value="daily">Daily Summary</MenuItem>
                <MenuItem value="weekly">Weekly Summary</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography id="threshold-slider" gutterBottom>
              Low Stock Threshold: {settings.threshold}%
            </Typography>
            <Slider
              aria-labelledby="threshold-slider"
              value={settings.threshold}
              onChange={handleSliderChange}
              disabled={!settings.enabled}
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={50}
            />
            <Typography variant="body2" color="text.secondary">
              Items will be considered low in stock when quantity falls below this percentage of the reorder level.
            </Typography>
          </Grid>

          {lowStockItems.length > 0 && (
            <Grid item xs={12}>
              <Box bgcolor="warning.light" p={2} borderRadius={1} mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                  {lowStockItems.length} items are currently low in stock
                </Typography>
                <Typography variant="body2">
                  With current settings, notifications will be sent for: 
                  {lowStockItems.map((item, index) => (
                    <span key={item.id}>{index > 0 ? ',' : ''} {item.name} ({item.quantity}/{item.reorderLevel})
                      {item.price && ` - Value: $${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}`}
                    </span>
                  ))}
                </Typography>
                <Button
                  variant="outlined"
                  color="warning"
                  sx={{ mt: 1 }}
                  onClick={handleSendTest}
                  disabled={sendingTest || !settings.enabled || !settings.email}
                >
                  {sendingTest ? <CircularProgress size={24} /> : 'Send Test Notification'}
                </Button>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || !settings.enabled}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default NotificationSettingsPage;
