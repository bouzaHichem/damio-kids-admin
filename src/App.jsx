import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './hooks/useAdminAuth';

// Route components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Page components
import AdminLogin from './components/AdminLogin';
// import AdminDashboard from './pages/AdminDashboard';
// import ProductsPage from './pages/ProductsPage';
// import OrdersPage from './pages/OrdersPage';
// import CategoriesPage from './pages/CategoriesPage';
// import AdminsPage from './pages/AdminsPage';

// Temporary placeholder components for development
const AdminDashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Admin Dashboard</h1>
    <p>Welcome to the admin dashboard!</p>
  </div>
);

const ProductsPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Products Management</h1>
    <p>Manage your products here.</p>
  </div>
);

const OrdersPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Orders Management</h1>
    <p>View and manage orders here.</p>
  </div>
);

const CategoriesPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Categories Management</h1>
    <p>Manage product categories here.</p>
  </div>
);

const AdminsPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Admin Users Management</h1>
    <p>Manage admin users here (super admin only).</p>
  </div>
);

const App = () => {
  return (
    <AdminAuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/admin/login" 
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Products route - requires 'read_products' permission */}
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute requiredPermissions={['read_products']}>
                  <ProductsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Orders route - requires 'read_orders' permission */}
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute requiredPermissions={['read_orders']}>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Categories route - requires 'read_categories' permission */}
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute requiredPermissions={['read_categories']}>
                  <CategoriesPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin management - requires 'super_admin' role */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AdminsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirects */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AdminAuthProvider>
  );
};

export default App;
