// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import AddItemPage from './pages/AddItemPage';
import EditItemPage from './pages/EditItemPage';
import SuppliersPage from './pages/SuppliersPage';
import AddSupplierPage from './pages/AddSupplierPage';
import EditSupplierPage from './pages/EditSupplierPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              
              <Route path="/items" element={<ItemsPage />} />
              <Route path="/items/add" element={<AddItemPage />} />
              <Route path="/items/edit/:id" element={<EditItemPage />} />
              
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/add" element={<AddSupplierPage />} />
              <Route path="/suppliers/edit/:id" element={<EditSupplierPage />} />
            </Route>
          </Route>
          
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<MainLayout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;