import React, { useState, useEffect } from 'react';
import { adminApiClient } from '../../services/adminAuthService';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import './AdminSettings.css';

const AdminSettings = () => {
  const { admin, updateAdminData } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileIconUrl: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Profile picture upload state
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Load admin profile data
  useEffect(() => {
    if (admin) {
      setProfileData({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        profileIconUrl: admin.profileIcon || ''
      });
      setPreviewImage(admin.profileIcon);
    }
  }, [admin]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await adminApiClient.put('/api/admin/settings', profileData);
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        updateAdminData(response.data.data);
        setPreviewImage(response.data.data.profileIcon);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to update profile' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const updateData = {
        ...profileData,
        ...passwordData
      };

      const response = await adminApiClient.put('/api/admin/settings', updateData);
      
      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        updateAdminData(response.data.data);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to change password' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ profileImage: 'Please select a valid image file' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ profileImage: 'Image size must be less than 5MB' });
      return;
    }

    setUploading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('profileIcon', file);

      const response = await adminApiClient.post('/api/admin/settings/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const newProfileIcon = response.data.data.profileIcon;
        setPreviewImage(newProfileIcon);
        setProfileData(prev => ({
          ...prev,
          profileIconUrl: newProfileIcon
        }));
        setSuccess('Profile picture uploaded successfully!');
        
        // Update admin data in context
        updateAdminData({ ...admin, profileIcon: newProfileIcon });
      }
    } catch (error) {
      setErrors({ 
        profileImage: error.response?.data?.message || 'Failed to upload image' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    setErrors({});

    try {
      const response = await adminApiClient.delete('/api/admin/settings/avatar');
      
      if (response.data.success) {
        setPreviewImage(null);
        setProfileData(prev => ({
          ...prev,
          profileIconUrl: ''
        }));
        setSuccess('Profile picture removed successfully!');
        
        // Update admin data in context
        updateAdminData({ ...admin, profileIcon: null });
      }
    } catch (error) {
      setErrors({ 
        profileImage: error.response?.data?.message || 'Failed to remove image' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1>Admin Settings</h1>
        <p>Manage your profile information and account settings</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <div className="alert alert-error">
          <span className="alert-icon">❌</span>
          {errors.general}
        </div>
      )}

      {/* Settings Tabs */}
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon">👤</span>
          Profile Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <span className="tab-icon">🔒</span>
          Change Password
        </button>
        <button 
          className={`tab-button ${activeTab === 'picture' ? 'active' : ''}`}
          onClick={() => setActiveTab('picture')}
        >
          <span className="tab-icon">📷</span>
          Profile Picture
        </button>
      </div>

      <div className="settings-content">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h2>Profile Information</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className={errors.firstName ? 'error' : ''}
                    required
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className={errors.lastName ? 'error' : ''}
                    required
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className={errors.email ? 'error' : ''}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="settings-section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={errors.currentPassword ? 'error' : ''}
                  required
                />
                {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={errors.newPassword ? 'error' : ''}
                  minLength="6"
                  required
                />
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                <small className="form-hint">Password must be at least 6 characters long</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  required
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Picture Tab */}
        {activeTab === 'picture' && (
          <div className="settings-section">
            <h2>Profile Picture</h2>
            
            <div className="profile-picture-section">
              <div className="current-picture">
                <div className="picture-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" />
                  ) : (
                    <div className="no-picture">
                      <span className="no-picture-icon">👤</span>
                      <span>No profile picture</span>
                    </div>
                  )}
                </div>
                
                <div className="picture-info">
                  <h3>Current Profile Picture</h3>
                  <p>Upload a new image to change your profile picture. Recommended size: 200x200 pixels.</p>
                  {errors.profileImage && <span className="error-message">{errors.profileImage}</span>}
                </div>
              </div>

              <div className="picture-actions">
                <div className="upload-section">
                  <input
                    type="file"
                    id="profileImageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="profileImageUpload" 
                    className="btn btn-primary"
                  >
                    {uploading ? 'Uploading...' : 'Upload New Picture'}
                  </label>
                  <small className="form-hint">
                    Supported formats: JPG, PNG, GIF, WEBP (max 5MB)
                  </small>
                </div>

                {previewImage && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    {loading ? 'Removing...' : 'Remove Picture'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
