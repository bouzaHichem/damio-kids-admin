import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./hooks/useAdminAuth";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin";
import AdminLogin from "./Components/AdminLogin";
import { useState } from "react";
import { Toaster } from 'react-hot-toast';

// Environment-based backend URL configuration
export const backend_url = process.env.REACT_APP_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://damio-kids-backend.onrender.com'  // Replace with your actual Render URL
    : 'http://localhost:4000');
export const currency = 'د.ج';

// Protected Admin Wrapper Component
const AdminWrapper = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div>
      <Navbar onMobileMenuToggle={handleMobileToggle} />
      <Admin mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/*" element={<AdminWrapper />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
