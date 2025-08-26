import { useState, useEffect, createContext, useContext } from 'react';
import { adminAuthService } from '../services/adminAuthService';

// Create Admin Auth Context
const AdminAuthContext = createContext();

// Admin Auth Provider Component
export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if admin is authenticated
  const isAuthenticated = !!admin;
  
  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Pre-warm backend to reduce cold-start timeouts
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://damio-kids-backend.onrender.com' : 'http://localhost:4000');
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 20000);
          // Fire-and-forget warm-up of health endpoint
          fetch(`${BACKEND_URL}/health`, { signal: controller.signal }).catch(() => {});
          clearTimeout(id);
        } catch {}

        const token = adminAuthService.getToken();
        if (token) {
          // Verify token with backend
          const response = await adminAuthService.verifyToken();
          if (response.success) {
            setAdmin(response.admin);
          } else {
            // Invalid token, clear it
            adminAuthService.clearToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        adminAuthService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await adminAuthService.login(email, password);
      
      if (response.success) {
        setAdmin(response.admin);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call backend logout (optional, mainly for logging)
      try {
        await adminAuthService.logout();
      } catch (error) {
        console.warn('Backend logout failed:', error);
        // Continue with client-side logout even if backend fails
      }
      
      // Clear client-side state
      adminAuthService.clearToken();
      setAdmin(null);
      setError(null);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force client-side logout even on error
      adminAuthService.clearToken();
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh admin data
  const refreshAdmin = async () => {
    try {
      const response = await adminAuthService.getProfile();
      if (response.success) {
        setAdmin(response.admin);
        return response.admin;
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      // If profile fetch fails with 401, logout
      if (error.response?.status === 401) {
        logout();
      }
    }
  };
  
  // Check permissions
  const hasPermission = (permission) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true; // Super admin has all permissions
    return admin.permissions?.includes(permission) || false;
  };
  
  // Check role
  const hasRole = (roles) => {
    if (!admin) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(admin.role);
  };
  
  // Update admin data locally
  const updateAdminData = (newAdminData) => {
    setAdmin(prevAdmin => {
      const updatedAdmin = {
        ...prevAdmin,
        ...newAdminData
      };
      // Also update in localStorage
      adminAuthService.setAdminData(updatedAdmin);
      return updatedAdmin;
    });
  };
  
  // Clear error
  const clearError = () => {
    setError(null);
  };
  
  const value = {
    admin,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshAdmin,
    updateAdminData,
    hasPermission,
    hasRole,
    clearError
  };
  
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook to use admin auth
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
};

// HOC for components that require authentication
export const withAdminAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Please log in to access this page.</div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

export default useAdminAuth;
