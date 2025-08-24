import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { adminApiClient } from '../../services/adminAuthService';
import './ShopImageManagement.css';

const ShopImageManagement = () => {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageType, setImageType] = useState('hero');
  const [category, setCategory] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [replacingImage, setReplacingImage] = useState(null);
  const [newReplacementImage, setNewReplacementImage] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

// Use centralized admin axios client that auto-attaches Authorization header

  useEffect(() => {
    fetchImages();
  }, []);

const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await adminApiClient.get('/api/admin/shop-images');
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Error fetching images. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Image preview handler
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image replacement handler
  const handleImageReplacement = async (imageId) => {
    if (!newReplacementImage) {
      alert('Please select an image to replace with');
      return;
    }

    const formData = new FormData();
    formData.append('shopImage', newReplacementImage);

    try {
      setLoading(true);
const response = await adminApiClient.put(`/api/admin/shop-images/${imageId}/replace`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      
      if (response.data.success) {
        alert('Image replaced successfully!');
        fetchImages();
        setReplacingImage(null);
        setNewReplacementImage(null);
      }
    } catch (error) {
      console.error('Error replacing image:', error);
      alert(error.response?.data?.message || 'Error replacing image');
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (e, imageId) => {
    setDraggedItem(imageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetImageId) => {
    e.preventDefault();
    if (draggedItem === targetImageId) return;

    const draggedImage = images.find(img => img.id === draggedItem);
    const targetImage = images.find(img => img.id === targetImageId);

    if (draggedImage && targetImage && draggedImage.imageType === targetImage.imageType) {
      try {
        setLoading(true);
        const typeImages = images.filter(img => img.imageType === draggedImage.imageType);
        const reorderedIds = typeImages.map(img => {
          if (img.id === draggedItem) {
            return targetImageId;
          } else if (img.id === targetImageId) {
            return draggedItem;
          }
          return img.id;
        });

await adminApiClient.post('/api/admin/shop-images/reorder', { imageIds: reorderedIds });
        fetchImages();
      } catch (error) {
        console.error('Error reordering images:', error);
        alert('Error reordering images');
      } finally {
        setLoading(false);
      }
    }
    setDraggedItem(null);
  };

  // File validation
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!newImage || !title || !imageType) {
      alert('Title, image, and type are required!');
      return;
    }

    const formData = new FormData();
    formData.append('shopImage', newImage);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('imageType', imageType);
    formData.append('category', category);

    try {
      setLoading(true);
const response = await adminApiClient.post('/api/admin/shop-images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      
      if (response.data.success) {
        alert('Image uploaded successfully!');
        fetchImages();
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setNewImage(null);
        setImagePreview(null);
        setImageType('hero');
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.message || 'Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setLoading(true);
const response = await adminApiClient.delete(`/api/admin/shop-images/${imageId}`);
      if (response.data.success) {
        alert('Image deleted successfully!');
        fetchImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (imageId) => {
    try {
      setLoading(true);
const response = await adminApiClient.post(`/api/admin/shop-images/${imageId}/toggle-visibility`);
      if (response.data.success) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Error toggling visibility');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (image) => {
    setEditingImage(image.id);
    setEditTitle(image.title);
    setEditDescription(image.description || '');
    setEditCategory(image.category || '');
  };

  const cancelEditing = () => {
    setEditingImage(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategory('');
  };

  const saveEdit = async (imageId) => {
    try {
      setLoading(true);
const response = await adminApiClient.put(`/api/admin/shop-images/${imageId}`, {
        title: editTitle,
        description: editDescription,
        category: editCategory
      });
      
      if (response.data.success) {
        alert('Image updated successfully!');
        fetchImages();
        cancelEditing();
      }
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error updating image');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = filterType === 'all' 
    ? images 
    : images.filter(img => img.imageType === filterType);

  const groupedImages = filteredImages.reduce((acc, img) => {
    if (!acc[img.imageType]) {
      acc[img.imageType] = [];
    }
    acc[img.imageType].push(img);
    return acc;
  }, {});

  return (
    <div className='shop-image-management'>
      <h1>Shop Images Management</h1>
      
      {/* Upload Form */}
      <div className='upload-section'>
        <h2>Upload New Image</h2>
        <div className='upload-form'>
          <div className='form-row'>
            <div className='file-upload-wrapper'>
              <input 
                type='file' 
                id='image-upload'
                accept='image/jpeg,image/jpg,image/png,image/webp'
                onChange={handleImageSelect}
                className='file-input'
              />
              <label htmlFor='image-upload' className='file-label'>
                📸 Choose Image (Max 5MB - JPEG, PNG, WebP)
              </label>
              {imagePreview && (
                <div className='image-preview'>
                  <img src={imagePreview} alt='Preview' />
                  <div className='preview-info'>
                    <p>✅ Image selected</p>
                    <p>Size: {(newImage?.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </div>
            <input 
              type='text' 
              placeholder='Image Title *' 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className='title-input'
            />
          </div>
          <div className='form-row'>
            <textarea 
              placeholder='Description (optional)' 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows='3'
              className='description-input'
            />
          </div>
          <div className='form-row'>
            <div className='select-wrapper'>
              <label htmlFor='imageType'>Image Type *</label>
              <select 
                id='imageType'
                value={imageType} 
                onChange={(e) => setImageType(e.target.value)}
                className='image-type-select'
              >
                <option value='hero'>🏠 Hero Banner (Main homepage banner)</option>
                <option value='category'>📂 Category Image (Fille, garçon, Bébé sections)</option>
                <option value='promotional'>🎯 Promotional Banner (New Arrivals, Trending sections)</option>
                <option value='feature'>⭐ Feature Image (Special info sections)</option>
              </select>
              <div className='type-info'>
                {imageType === 'hero' && <small>💡 Recommended: 1200x600px for best display</small>}
                {imageType === 'category' && <small>💡 Recommended: 400x300px. Please specify category below.</small>}
                {imageType === 'promotional' && <small>💡 Recommended: 600x400px for featured sections</small>}
                {imageType === 'feature' && <small>💡 Recommended: 300x200px for info cards</small>}
              </div>
            </div>
            {(imageType === 'category' || imageType === 'promotional') && (
              <div className='category-wrapper'>
                <input 
                  type='text' 
                  placeholder={imageType === 'category' ? 'Category (Fille, Garçon, Bébé) *' : 'Section name (New Arrivals, Trending)'}
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className='category-input'
                  required={imageType === 'category'}
                />
                {imageType === 'category' && (
                  <div className='category-suggestions'>
                    <button type='button' onClick={() => setCategory('fille')}>fille</button>
                    <button type='button' onClick={() => setCategory('garcon')}>garcon</button>
                    <button type='button' onClick={() => setCategory('bébé')}>bébé</button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={handleUpload} 
            disabled={loading || !newImage || !title || (imageType === 'category' && !category)}
            className='upload-btn'
          >
            {loading ? 'Uploading...' : '⬆️ Upload Image'}
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className='filter-section'>
        <h2>Existing Images</h2>
        <div className='filter-controls'>
          <label>Filter by type: </label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value='all'>All Types</option>
            <option value='hero'>Hero Banners</option>
            <option value='category'>Category Images</option>
            <option value='promotional'>Promotional Banners</option>
            <option value='feature'>Feature Images</option>
          </select>
        </div>
      </div>

      {/* Images Display */}
      {loading && <div className='loading'>Loading...</div>}
      
      {Object.keys(groupedImages).map(type => (
        <div key={type} className='image-type-section'>
          <h3 className='type-title'>{type.charAt(0).toUpperCase() + type.slice(1)} Images</h3>
          <div className='image-grid'>
            {groupedImages[type].map(img => (
              <div 
                key={img.id} 
                className={`image-card ${!img.visible ? 'hidden' : ''} ${draggedItem === img.id ? 'dragging' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, img.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, img.id)}
              >
                <div className='drag-handle'>⋮⋮</div>
                
                <div className='image-container'>
                  <img src={`${backend_url}${img.image}`} alt={img.title} />
                  {!img.visible && <div className='hidden-overlay'>🙈 Hidden</div>}
                  
                  {/* Replace Image Modal */}
                  {replacingImage === img.id && (
                    <div className='replace-modal'>
                      <div className='replace-content'>
                        <h4>Replace Image</h4>
                        <input 
                          type='file'
                          accept='image/jpeg,image/jpg,image/png,image/webp'
                          onChange={(e) => setNewReplacementImage(e.target.files[0])}
                        />
                        <div className='replace-actions'>
                          <button 
                            onClick={() => handleImageReplacement(img.id)}
                            disabled={!newReplacementImage}
                            className='replace-confirm'
                          >
                            Replace
                          </button>
                          <button 
                            onClick={() => {
                              setReplacingImage(null);
                              setNewReplacementImage(null);
                            }}
                            className='replace-cancel'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className='image-info'>
                  {editingImage === img.id ? (
                    <div className='edit-form'>
                      <input 
                        type='text' 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder='Title'
                      />
                      <textarea 
                        value={editDescription} 
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder='Description'
                        rows='2'
                      />
                      {img.imageType === 'category' && (
                        <input 
                          type='text' 
                          value={editCategory} 
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder='Category'
                        />
                      )}
                      <div className='edit-buttons'>
                        <button onClick={() => saveEdit(img.id)} className='save-btn'>💾 Save</button>
                        <button onClick={cancelEditing} className='cancel-btn'>❌ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className='image-details'>
                      <h4>{img.title}</h4>
                      {img.description && <p className='description'>{img.description}</p>}
                      {img.category && (
                        <div className='category-tag'>
                          <span className='tag-label'>📂 {img.category}</span>
                        </div>
                      )}
                      <div className='meta-info'>
                        <span className='type-badge'>{img.imageType}</span>
                        <span className='order-badge'>#{img.order}</span>
                        {img.visible ? <span className='status-badge visible'>👁️ Visible</span> : <span className='status-badge hidden'>🙈 Hidden</span>}
                      </div>
                    </div>
                  )}
                </div>
                
                {editingImage !== img.id && (
                  <div className='image-actions'>
                    <button onClick={() => startEditing(img)} className='edit-btn' title='Edit details'>
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => setReplacingImage(img.id)} 
                      className='replace-btn'
                      title='Replace image file'
                    >
                      🔄 Replace
                    </button>
                    <button 
                      onClick={() => handleToggleVisibility(img.id)} 
                      className={`visibility-btn ${img.visible ? 'hide' : 'show'}`}
                      title={img.visible ? 'Hide from shop' : 'Show in shop'}
                    >
                      {img.visible ? '🙈 Hide' : '👁️ Show'}
                    </button>
                    <button 
                      onClick={() => handleDelete(img.id)} 
                      className='delete-btn'
                      title='Delete permanently'
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {filteredImages.length === 0 && !loading && (
        <div className='no-images'>No images found.</div>
      )}
    </div>
  );
};

export default ShopImageManagement;

