import React, { useState, useEffect } from 'react';
import { adminApiClient } from '../../services/adminAuthService';
import './CollectionsManagement.css';

const CollectionsManagement = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    bannerImage: '',
    products: [],
    isVisible: true,
    order: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

const fetchCollections = async () => {
    try {
      const { data } = await adminApiClient.get('/api/admin/collections');
      console.log('Collections response:', data);
      
      if (data.success) {
        setCollections(data.collections);
      } else {
        console.error('Failed to fetch collections:', data.message);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

const fetchProducts = async () => {
    try {
      const { data } = await adminApiClient.get('/api/admin/products');
      setProducts(data.data?.products || data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size on frontend
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WEBP are allowed.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    setUploadingBanner(true);
    const formDataUpload = new FormData();
    formDataUpload.append('banner', file);

    try {
      const authToken = localStorage.getItem('auth-token') || 'admin-token-123';
      console.log('Using auth token for upload:', authToken);

const { data } = await adminApiClient.post('/api/admin/collections/upload-banner', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload response:', data);
      
      if (data.success) {
        setFormData(prev => ({ ...prev, bannerImage: data.image_url }));
        alert('Banner uploaded successfully!');
      } else {
        alert(data.message || 'Failed to upload banner image');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert(`Error uploading banner image: ${error.message}`);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Collection name is required');
      return;
    }

    setLoading(true);
    try {
const url = editingId 
        ? `/api/admin/collections/${editingId}`
        : '/api/admin/collections';
      
      const { data } = await adminApiClient.request({
        url,
        method: editingId ? 'PUT' : 'POST',
        data: formData
      });
      if (data.success) {
        alert(editingId ? 'Collection updated successfully' : 'Collection created successfully');
        resetForm();
        fetchCollections();
      } else {
        alert(data.message || 'Failed to save collection');
      }
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Error saving collection');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (collection) => {
    setFormData({
      name: collection.name,
      bannerImage: collection.bannerImage || '',
      products: collection.products.map(p => p._id),
      isVisible: collection.isVisible,
      order: collection.order || 0
    });
    setSelectedProducts(collection.products);
    setEditingId(collection._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
const { data } = await adminApiClient.delete(`/api/admin/collections/${id}`);
      if (data.success) {
        alert('Collection deleted successfully');
        fetchCollections();
      } else {
        alert('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Error deleting collection');
    }
  };

  const toggleVisibility = async (id) => {
    try {
const { data } = await adminApiClient.post(`/api/admin/collections/${id}/toggle-visibility`);
      if (data.success) {
        fetchCollections();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bannerImage: '',
      products: [],
      isVisible: true,
      order: 0
    });
    setSelectedProducts([]);
    setEditingId(null);
  };

  const openProductModal = () => {
    setShowProductModal(true);
  };

  const handleProductSelection = (productId) => {
    const isSelected = formData.products.includes(productId);
    let newProducts;
    
    if (isSelected) {
      newProducts = formData.products.filter(id => id !== productId);
      setSelectedProducts(prev => prev.filter(p => p._id !== productId));
    } else {
      newProducts = [...formData.products, productId];
      const product = products.find(p => p._id === productId);
      if (product) {
        setSelectedProducts(prev => [...prev, product]);
      }
    }
    
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const removeProduct = (productId) => {
    const newProducts = formData.products.filter(id => id !== productId);
    setFormData(prev => ({ ...prev, products: newProducts }));
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  };

  return (
    <div className="collections-management">
      <div className="collections-header">
        <h1>Collections Management</h1>
        <p>Create and manage product collections for your shop</p>
      </div>

      {/* Collection Form */}
      <div className="collection-form-container">
        <div className="form-header">
          <h2>{editingId ? 'Edit Collection' : 'Create New Collection'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="collection-form">
          <div className="form-row">
            <div className="form-group">
              <label>Collection Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Summer Collection"
                required
              />
            </div>

            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Banner Image</label>
            <div className="banner-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
              />
              {uploadingBanner && <span>Uploading...</span>}
              {formData.bannerImage && (
                <div className="banner-preview">
                  <img src={`${backend_url}${formData.bannerImage}`} alt="Banner preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Products in Collection</label>
            <div className="products-section">
              <button type="button" onClick={openProductModal} className="add-products-btn">
                Add Products ({selectedProducts.length})
              </button>
              
              <div className="selected-products">
                {selectedProducts.map(product => (
                  <div key={product._id} className="selected-product">
                    <img src={`${backend_url}${product.image}`} alt={product.name} />
                    <span>{product.name}</span>
                    <button type="button" onClick={() => removeProduct(product._id)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleInputChange}
              />
              Visible on website
            </label>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : (editingId ? 'Update Collection' : 'Create Collection')}
          </button>
        </form>
      </div>

      {/* Collections List */}
      <div className="collections-list">
        <h2>Existing Collections</h2>
        <div className="collections-grid">
          {collections.map(collection => (
            <div key={collection._id} className="collection-card">
              <div className="collection-banner">
                {collection.bannerImage ? (
                  <img src={`${backend_url}${collection.bannerImage}`} alt={collection.name} />
                ) : (
                  <div className="no-banner">No Banner</div>
                )}
              </div>
              
              <div className="collection-info">
                <h3>{collection.name}</h3>
                <p>{collection.products.length} products</p>
                <p>Order: {collection.order}</p>
                <p className={`status ${collection.isVisible ? 'visible' : 'hidden'}`}>
                  {collection.isVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>

              <div className="collection-actions">
                <button onClick={() => handleEdit(collection)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => toggleVisibility(collection._id)} className="toggle-btn">
                  {collection.isVisible ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => handleDelete(collection._id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="product-modal">
            <div className="modal-header">
              <h3>Select Products</h3>
              <button onClick={() => setShowProductModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="products-grid">
                {products.map(product => (
                  <div 
                    key={product._id} 
                    className={`product-item ${formData.products.includes(product._id) ? 'selected' : ''}`}
                    onClick={() => handleProductSelection(product._id)}
                  >
                    <img src={`${backend_url}${product.image}`} alt={product.name} />
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p>{product.new_price} د.ج</p>
                    </div>
                    {formData.products.includes(product._id) && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowProductModal(false)} className="done-btn">
                Done ({selectedProducts.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsManagement;
