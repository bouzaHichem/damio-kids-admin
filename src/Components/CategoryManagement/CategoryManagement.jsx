import React, { useState, useEffect } from 'react';
import { backend_url } from '../../App';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    isActive: true
  });
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true
  });
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Use admin API to ensure proper shape and auth
      const response = await fetch(`${backend_url}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'auth-token': localStorage.getItem('adminToken')
        }
      });
      const data = await response.json();
      if (data?.success) {
        setCategories(data.categories || []);
      } else if (Array.isArray(data)) {
        // Fallback if server returns raw array
        setCategories(data);
      } else {
        setError(data?.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${backend_url}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'auth-token': localStorage.getItem('adminToken')
        },
        body: JSON.stringify(categoryForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Category added successfully!');
        setCategoryForm({ name: '', description: '', isActive: true });
        setShowAddCategory(false);
        fetchCategories();
      } else {
        setError(data.message || 'Failed to add category');
      }
    } catch (err) {
      setError('Error adding category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${backend_url}/api/admin/categories/${subcategoryForm.parentCategory}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'auth-token': localStorage.getItem('adminToken')
        },
        body: JSON.stringify({
          name: subcategoryForm.name,
          description: subcategoryForm.description,
          isActive: subcategoryForm.isActive
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Subcategory added successfully!');
        setSubcategoryForm({ name: '', description: '', parentCategory: '', isActive: true });
        setShowAddSubcategory(false);
        fetchCategories();
      } else {
        setError(data.message || 'Failed to add subcategory');
      }
    } catch (err) {
      setError('Error adding subcategory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId, updatedData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${backend_url}/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'auth-token': localStorage.getItem('adminToken')
        },
        body: JSON.stringify(updatedData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Category updated successfully!');
        setEditingCategory(null);
        fetchCategories();
      } else {
        setError(data.message || 'Failed to update category');
      }
    } catch (err) {
      setError('Error updating category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all its subcategories.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${backend_url}/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'auth-token': localStorage.getItem('adminToken')
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Category deleted successfully!');
        fetchCategories();
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${backend_url}/api/admin/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'auth-token': localStorage.getItem('adminToken')
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Subcategory deleted successfully!');
        fetchCategories();
      } else {
        setError(data.message || 'Failed to delete subcategory');
      }
    } catch (err) {
      setError('Error deleting subcategory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="category-management">
      <div className="category-header">
        <h1>Category Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowAddCategory(true);
              clearMessages();
            }}
          >
            Add Category
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowAddSubcategory(true);
              clearMessages();
            }}
          >
            Add Subcategory
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          {error}
          <button onClick={clearMessages}>×</button>
        </div>
      )}
      
      {success && (
        <div className="message success-message">
          {success}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddCategory(false)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showAddSubcategory && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Subcategory</h2>
            <form onSubmit={handleAddSubcategory}>
              <div className="form-group">
                <label>Parent Category *</label>
                <select
                  value={subcategoryForm.parentCategory}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, parentCategory: e.target.value })}
                  required
                >
                  <option value="">Select Parent Category</option>
                  {categories.map(category => (
                    <option key={category._id || category.id} value={category.id || category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subcategory Name *</label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={subcategoryForm.isActive}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddSubcategory(false)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="categories-container">
        {loading && <div className="loading">Loading...</div>}
        
        {categories.length === 0 && !loading && (
          <div className="empty-state">
            <p>No categories found. Add your first category to get started!</p>
          </div>
        )}

        {categories.map(category => (
          <div key={category._id} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
            <div className="category-header-item">
              <div className="category-info">
                <h3>
                  {category.name}
                  {!category.isActive && <span className="status inactive">Inactive</span>}
                  <span className="subcategory-count">
                    ({category.subcategories?.length || 0} subcategories)
                  </span>
                </h3>
                {category.description && <p className="category-description">{category.description}</p>}
              </div>
              <div className="category-actions">
                <button
                  className="btn btn-small"
                  onClick={() => toggleCategoryExpansion(category._id)}
                >
                  {expandedCategories.has(category._id) ? 'Collapse' : 'Expand'}
                </button>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => setEditingCategory(category)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteCategory(category.id || category._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {expandedCategories.has(category._id) && (
              <div className="subcategories">
                <h4>Subcategories</h4>
                {(!category.subcategories || category.subcategories.length === 0) ? (
                  <p className="no-subcategories">No subcategories yet</p>
                ) : (
                  category.subcategories.map(subcategory => (
                    <div key={subcategory._id} className={`subcategory-item ${!subcategory.isActive ? 'inactive' : ''}`}>
                      <div className="subcategory-info">
                        <h5>
                          {subcategory.name}
                          {!subcategory.isActive && <span className="status inactive">Inactive</span>}
                        </h5>
                        {subcategory.description && <p>{subcategory.description}</p>}
                      </div>
                      <div className="subcategory-actions">
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => setEditingSubcategory({ ...subcategory, parentId: category.id || category._id })}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteSubcategory(category.id || category._id, subcategory.id || subcategory._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
