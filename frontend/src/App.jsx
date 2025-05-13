// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout'; 
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import AddItemPage from './pages/AddItemPage';
import EditItemPage from './pages/EditItemPage';
import SuppliersPage from './pages/SuppliersPage';
import AddSupplierPage from './pages/AddSupplierPage';
import EditSupplierPage from './pages/EditSupplierPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
// Import new pages
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import CreatePurchaseOrderPage from './pages/CreatePurchaseOrderPage';
import BarcodeGeneratorPage from './pages/BarcodeGeneratorPage';
import BarcodeScannerPage from './pages/BarcodeScannerPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected routes inside MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Items routes */}
              <Route path="/items" element={<ItemsPage />} />
              <Route path="/items/add" element={<AddItemPage />} />
              <Route path="/items/edit/:id" element={<EditItemPage />} />
              
              {/* Supplier routes */}
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/add" element={<AddSupplierPage />} />
              <Route path="/suppliers/edit/:id" element={<EditSupplierPage />} />
              
              {/* Purchase Order routes */}
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
              <Route path="/purchase-orders/edit/:id" element={<CreatePurchaseOrderPage />} />
              
              {/* Barcode routes */}
              <Route path="/barcodes" element={<BarcodeGeneratorPage />} />
              <Route path="/barcodes/scanner" element={<BarcodeScannerPage />} />
              
              {/* Notification routes */}
              <Route path="/notifications" element={<Navigate to="/notifications/settings" replace />} />
              <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
