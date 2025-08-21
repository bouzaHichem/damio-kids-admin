import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://damio-kids-backend.onrender.com';

// Create axios instance for admin auth
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Token storage keys
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_DATA_KEY = 'adminData';

// Token management
const tokenManager = {
  getToken: () => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  
  setToken: (token) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  
  removeToken: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
  
  getAdminData: () => {
    const data = localStorage.getItem(ADMIN_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  setAdminData: (adminData) => {
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
  },
  
  removeAdminData: () => {
    localStorage.removeItem(ADMIN_DATA_KEY);
  },
  
  clearAll: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
  }
};

// Request interceptor to add admin token
adminApi.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    
    if (token) {
      // Add admin token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      // Also add to auth-token header for backward compatibility
      config.headers['auth-token'] = token;
    }
    
    // Log API requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Admin API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for admin auth handling
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle admin authentication errors
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      
      // Clear tokens on authentication failure
      if (['NO_TOKEN', 'INVALID_TOKEN', 'TOKEN_EXPIRED', 'MALFORMED_TOKEN', 'ADMIN_NOT_FOUND'].includes(errorCode)) {
        tokenManager.clearAll();
        
        // Redirect to admin login page if not already there
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }
    
    // Log API errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Admin API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// Admin Authentication Service
export const adminAuthService = {
  // Login admin
  async login(email, password) {
    try {
      const response = await adminApi.post('/api/admin/auth/login', {
        email: email.trim(),
        password
      });
      
      if (response.data.success) {
        // Store token and admin data
        tokenManager.setToken(response.data.token);
        tokenManager.setAdminData(response.data.admin);
        
        return response.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  // Logout admin
  async logout() {
    try {
      await adminApi.post('/api/admin/auth/logout');
    } catch (error) {
      console.warn('Admin logout request failed:', error.message);
      // Continue with client-side logout even if backend fails
    } finally {
      // Always clear client-side data
      tokenManager.clearAll();
    }
  },
  
  // Get admin profile
  async getProfile() {
    try {
      const response = await adminApi.get('/api/admin/auth/profile');
      
      if (response.data.success) {
        // Update stored admin data
        tokenManager.setAdminData(response.data.admin);
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to get profile');
    } catch (error) {
      throw error;
    }
  },
  
  // Verify admin token
  async verifyToken() {
    try {
      const response = await adminApi.get('/api/admin/auth/verify');
      
      if (response.data.success) {
        // Update stored admin data
        tokenManager.setAdminData(response.data.admin);
        return response.data;
      }
      
      throw new Error(response.data.message || 'Token verification failed');
    } catch (error) {
      throw error;
    }
  },
  
  // Refresh admin token
  async refreshToken() {
    try {
      const response = await adminApi.post('/api/admin/auth/refresh');
      
      if (response.data.success) {
        // Update token and admin data
        tokenManager.setToken(response.data.token);
        tokenManager.setAdminData(response.data.admin);
        
        return response.data;
      }
      
      throw new Error(response.data.message || 'Token refresh failed');
    } catch (error) {
      throw error;
    }
  },
  
  // Get stored token
  getToken() {
    return tokenManager.getToken();
  },
  
  // Get stored admin data
  getAdminData() {
    return tokenManager.getAdminData();
  },
  
  // Clear stored authentication data
  clearToken() {
    tokenManager.clearAll();
  },
  
  // Check if admin is authenticated
  isAuthenticated() {
    const token = tokenManager.getToken();
    const adminData = tokenManager.getAdminData();
    
    if (!token || !adminData) {
      return false;
    }
    
    try {
      // Basic JWT token validation (check if not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp < Date.now() / 1000;
      
      if (isExpired) {
        tokenManager.clearAll();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      tokenManager.clearAll();
      return false;
    }
  },
  
  // Check admin permission
  hasPermission(permission) {
    const adminData = tokenManager.getAdminData();
    if (!adminData) return false;
    
    // Super admin has all permissions
    if (adminData.role === 'super_admin') return true;
    
    return adminData.permissions?.includes(permission) || false;
  },
  
  // Check admin role
  hasRole(roles) {
    const adminData = tokenManager.getAdminData();
    if (!adminData) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(adminData.role);
  },
  
  // Set admin data
  setAdminData(adminData) {
    tokenManager.setAdminData(adminData);
  }
};

// Export axios instance for other admin API calls
export const adminApiClient = adminApi;

export default adminAuthService;
