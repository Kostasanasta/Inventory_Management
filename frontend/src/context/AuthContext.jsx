// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import authService from '../services/authService';

// Create context
export const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setCurrentUser(JSON.parse(localStorage.getItem('user')));
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Try to authenticate with the backend
      try {
        console.log('Attempting to login with backend...', email, password);
        const response = await authService.login(email, password);
        console.log('Backend login response:', response);
        
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } catch (apiError) {
        console.error('Backend authentication failed:', apiError);
        
        // Fallback to mock authentication for development
        if ((email === 'admin@example.com' && password === 'admin123') || 
            (email === 'kostas' && password === '2004')) {
          
          console.log('Using mock authentication');
          const mockUser = {
            id: email === 'kostas' ? 2 : 1,
            name: email === 'kostas' ? 'Kostas' : 'Admin User',
            email: email === 'kostas' ? 'kostas@example.com' : 'admin@example.com',
            role: 'ADMIN'
          };
          
          const mockToken = 'mock-jwt-token';
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          setCurrentUser(mockUser);
          return mockUser;
        }
        
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === 'ADMIN';
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;