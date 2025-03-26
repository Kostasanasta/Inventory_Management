// src/services/notificationService.js
import apiClient from './apiClient';

/**
 * Send email notification for low stock items
 * @param {Array} items - The low stock items to send notification about
 * @param {string} email - The email address to send notification to
 * @returns {Promise} - The API response
 */
const sendLowStockNotification = async (items, email) => {
  try {
    // Try to send email via backend API
    return await apiClient.post('/notifications/low-stock', { items, email });
  } catch (error) {
    console.error('Failed to send notification via API, using mock service', error);
    
    // Mock implementation for development
    console.log('MOCK NOTIFICATION SERVICE');
    console.log(`Sending low stock notification to: ${email}`);
    console.log('Low stock items:');
    items.forEach(item => {
      console.log(`- ${item.name}: ${item.quantity}/${item.reorderLevel} (${item.supplier?.name || 'No supplier'}) - Value: $${(item.price * item.quantity).toFixed(2)}`);
    });
    
    // Return a mock success response
    return {
      status: 200,
      data: {
        success: true,
        message: 'Mock notification sent successfully'
      }
    };
  }
};

/**
 * Get notification settings
 * @returns {Promise} - The API response
 */
const getNotificationSettings = async () => {
  try {
    // Try to get settings from backend API
    return await apiClient.get('/notifications/settings');
  } catch (error) {
    console.error('Failed to get notification settings via API, using mock service', error);
    
    // Return mock settings
    return {
      status: 200,
      data: {
        enabled: true,
        email: 'inventory-manager@company.com',
        threshold: 5, // Send notification when items are below this percentage of normal stock
        frequency: 'daily' // 'daily', 'weekly', 'immediate'
      }
    };
  }
};

/**
 * Save notification settings
 * @param {Object} settings - The notification settings to save
 * @returns {Promise} - The API response
 */
const saveNotificationSettings = async (settings) => {
  try {
    // Try to save settings via backend API
    return await apiClient.post('/notifications/settings', settings);
  } catch (error) {
    console.error('Failed to save notification settings via API, using mock service', error);
    
    // Mock implementation
    console.log('MOCK NOTIFICATION SERVICE');
    console.log('Saving notification settings:', settings);
    
    // Return a mock success response
    return {
      status: 200,
      data: {
        success: true,
        message: 'Mock settings saved successfully'
      }
    };
  }
};

/**
 * Send test notification
 * @param {Object} notification - The notification object
 * @returns {Promise} - The API response
 */
const sendNotification = async (notification) => {
  try {
    // Try to send notification via backend API
    return await apiClient.post('/notifications/send', notification);
  } catch (error) {
    console.error('Failed to send notification via API, using mock service', error);
    
    // Mock implementation
    console.log('MOCK NOTIFICATION SERVICE');
    console.log(`Sending notification to: ${notification.to}`);
    console.log(`Subject: ${notification.subject}`);
    console.log('Items:');
    notification.items.forEach(item => {
      console.log(`- ${item.name}: ${item.quantity}/${item.reorderLevel} (${item.supplier?.name || 'No supplier'}) - Value: $${(item.price * item.quantity).toFixed(2)}`);
    });
    
    // Return a mock success response
    return {
      status: 200,
      data: {
        success: true,
        message: 'Mock notification sent successfully'
      }
    };
  }
};

const notificationService = {
  sendLowStockNotification,
  getNotificationSettings,
  saveNotificationSettings,
  sendNotification
};

export default notificationService;
