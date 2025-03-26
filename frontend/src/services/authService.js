import apiClient from './apiClient';

const login = (email, password) => {
  console.log('authService.login called with:', { email });
  return apiClient.post('/auth/login', { email, password });
};

const register = (userData) => {
  return apiClient.post('/auth/register', userData);
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authService = {
  login,
  register,
  getCurrentUser,
};

export default authService;
