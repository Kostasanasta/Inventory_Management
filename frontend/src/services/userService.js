import apiClient from './apiClient';

const getAllUsers = () => {
  return apiClient.get('/users');
};

const getUserById = (id) => {
  return apiClient.get(`/users/${id}`);
};

const updateUserRole = (id, role) => {
  return apiClient.put(`/users/${id}/role`, { role });
};

const userService = {
  getAllUsers,
  getUserById,
  updateUserRole,
};

export default userService;