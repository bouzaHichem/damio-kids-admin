// Enhanced API service for damio-kids-frontend
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://damio-kids-backend.onrender.com';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    // Prefer admin token for admin endpoints; fallback to user token
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('authToken') || localStorage.getItem('auth-token');
    const token = adminToken || userToken;

    if (token) {
      // Add both Authorization header (new format) and auth-token header (backward compatibility)
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['auth-token'] = token;
    }
    
    // Log API requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Log API errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      
      if (response.data.success && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('auth-token', response.data.token); // Backward compatibility
        
        // Store user data if provided
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
      }
      
      throw new Error(response.data.errors || 'Login failed');
    } catch (error) {
      throw new Error(error.response?.data?.errors || error.message);
    }
  },

  async signup(userData) {
    try {
      const response = await api.post('/signup', userData);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('auth-token', response.data.token);
        
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
      }
      
      throw new Error(response.data.errors || 'Signup failed');
    } catch (error) {
      throw new Error(error.response?.data?.errors || error.message);
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
};

// Product services
export const productService = {
  async getAllProducts() {
    const response = await api.get('/allproducts');
    return response.data;
  },

  async searchProducts(params) {
    const response = await api.get('/products/search', { params });
    return response.data;
  },

  async getNewCollections() {
    const response = await api.get('/newcollections');
    return response.data;
  },

  async getPopularProducts() {
    const response = await api.get('/popularinwomen');
    return response.data;
  },

  async getRelatedProducts(category) {
    const response = await api.post('/relatedproducts', { category });
    return response.data;
  },

  async addProduct(productData) {
    const response = await api.post('/addproduct', productData);
    return response.data;
  },

  async removeProduct(id) {
    const response = await api.post('/removeproduct', { id });
    return response.data;
  }
};

// Cart services
export const cartService = {
  async addToCart(itemId) {
    const response = await api.post('/addtocart', { itemId });
    return response.data;
  },

  async removeFromCart(itemId) {
    const response = await api.post('/removefromcart', { itemId });
    return response.data;
  },

  async getCart() {
    const response = await api.post('/getcart');
    return response.data;
  }
};

// Order services
export const orderService = {
  async placeOrder(orderData) {
    const response = await api.post('/placeorder', orderData);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.post('/admin/updateorder', { orderId, status });
    return response.data;
  }
};

// Upload services
export const uploadService = {
  async uploadSingle(file) {
    const formData = new FormData();
    formData.append('product', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  },

  async uploadMultiple(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('products', file);
    });
    
    const response = await api.post('/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  }
};

// Utility services
export const utilityService = {
  async getWilayas() {
    const response = await api.get('/wilayas');
    return response.data;
  },

  async getDeliveryFee(data) {
    const response = await api.post('/deliveryfee', data);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  }
};

// Admin services (compatibility helpers for varying backend payload shapes)
export const adminService = {
  async getShopImages(params = {}) {
    const res = await api.get('/api/admin/shop-images', { params });
    const images = res?.data?.images ?? res?.data?.data ?? [];
    return { success: !!res?.data?.success, images, raw: res.data };
  },
  
  async getDeliveryRates(params = {}) {
    const res = await api.get('/api/admin/deliveryrates', { params });
    const rates = res?.data?.rates ?? res?.data?.data ?? [];
    return { success: !!res?.data?.success, rates, raw: res.data };
  }
};

// Default export
export default api;
