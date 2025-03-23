import apiClient from './apiClient';

const getAllSuppliers = () => {
  return apiClient.get('/suppliers');
};

const getSupplierById = (id) => {
  return apiClient.get(`/suppliers/${id}`);
};

const createSupplier = (supplierData) => {
  return apiClient.post('/suppliers', supplierData);
};

const updateSupplier = (id, supplierData) => {
  return apiClient.put(`/suppliers/${id}`, supplierData);
};

const deleteSupplier = (id) => {
  return apiClient.delete(`/suppliers/${id}`);
};

const supplierService = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};

export default supplierService;