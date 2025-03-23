// src/services/itemService.js
import apiClient from './apiClient';

const getAllItems = () => {
  return apiClient.get('/items');
};

const getItemById = (id) => {
  return apiClient.get(`/items/${id}`);
};

const createItem = (itemData) => {
  return apiClient.post('/items', itemData);
};

const updateItem = (id, itemData) => {
  return apiClient.put(`/items/${id}`, itemData);
};

const deleteItem = (id) => {
  return apiClient.delete(`/items/${id}`);
};

const itemService = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};

export default itemService;