import React, { useState, useEffect } from 'react';
import './DeliveryManagement.css';
import { adminApiClient } from '../../services/adminAuthService';

const DeliveryManagement = () => {
  // State for delivery rates
  const [deliveryRates, setDeliveryRates] = useState([]);
  const [rateFormData, setRateFormData] = useState({
    wilaya: '',
    commune: '',
    deliveryType: 'home',
    fee: ''
  });
  const [editingRateId, setEditingRateId] = useState(null);
  
  // State for wilayas and communes
  const [wilayas, setWilayas] = useState([]);
  const [wilayaFormData, setWilayaFormData] = useState({
    name: '',
    communes: ['']
  });
  const [editingWilayaId, setEditingWilayaId] = useState(null);
  
  // General state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('wilayas'); // 'wilayas' or 'rates'

  // Fetch data on component mount
  useEffect(() => {
    fetchDeliveryRates();
    fetchWilayas();
  }, []);

const fetchDeliveryRates = async () => {
    try {
      setLoading(true);
      const { data } = await adminApiClient.get('/api/admin/deliveryrates');
      setDeliveryRates(data);
    } catch (error) {
      setMessage('Error fetching delivery rates');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWilayas = async () => {
    try {
      setLoading(true);
const { data } = await adminApiClient.get('/api/admin/wilayas');
      setWilayas(data);
        setMessage('Failed to fetch wilayas');
      }
    } catch (error) {
      setMessage('Error fetching wilayas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Wilaya management functions
  const handleWilayaInputChange = (e) => {
    const { name, value } = e.target;
    setWilayaFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCommuneChange = (index, value) => {
    const updatedCommunes = [...wilayaFormData.communes];
    updatedCommunes[index] = value;
    setWilayaFormData(prev => ({
      ...prev,
      communes: updatedCommunes
    }));
  };

  const addCommuneField = () => {
    setWilayaFormData(prev => ({
      ...prev,
      communes: [...prev.communes, '']
    }));
  };

  const removeCommuneField = (index) => {
    if (wilayaFormData.communes.length > 1) {
      const updatedCommunes = wilayaFormData.communes.filter((_, i) => i !== index);
      setWilayaFormData(prev => ({
        ...prev,
        communes: updatedCommunes
      }));
    }
  };

  const handleWilayaSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!wilayaFormData.name.trim()) {
      setMessage('Please enter a wilaya name');
      return;
    }

    const validCommunes = wilayaFormData.communes.filter(commune => commune.trim() !== '');
    if (validCommunes.length === 0) {
      setMessage('Please enter at least one commune');
      return;
    }

    try {
      setLoading(true);
const url = editingWilayaId 
        ? `/api/admin/wilayas/${editingWilayaId}`
        : '/api/admin/wilayas';
      
      await adminApiClient.request({ url, method: editingWilayaId ? 'PUT' : 'POST', data: { name: wilayaFormData.name.trim(), communes: validCommunes } });

      {
        setMessage(editingWilayaId ? 'Wilaya updated successfully!' : 'Wilaya added successfully!');
        setWilayaFormData({ name: '', communes: [''] });
        setEditingWilayaId(null);
        fetchWilayas();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to save wilaya');
      }
    } catch (error) {
      setMessage('Error saving wilaya');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditWilaya = (wilaya) => {
    setWilayaFormData({
      name: wilaya.name,
      communes: [...wilaya.communes]
    });
    setEditingWilayaId(wilaya._id);
    setMessage('');
  };

  const handleDeleteWilaya = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wilaya? This will also affect related delivery rates.')) {
      return;
    }

    try {
      setLoading(true);
await adminApiClient.delete(`/api/admin/wilayas/${id}`);

    {
        setMessage('Wilaya deleted successfully!');
        fetchWilayas();
        fetchDeliveryRates(); // Refresh delivery rates as they might be affected
      } else {
        setMessage('Failed to delete wilaya');
      }
    } catch (error) {
      setMessage('Error deleting wilaya');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWilaya = () => {
    setWilayaFormData({ name: '', communes: [''] });
    setEditingWilayaId(null);
    setMessage('');
  };

  // Delivery rate management functions
  const handleRateInputChange = (e) => {
    const { name, value } = e.target;
    setRateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!rateFormData.wilaya || !rateFormData.commune || !rateFormData.fee) {
      setMessage('Please fill in all fields');
      return;
    }

    if (isNaN(rateFormData.fee) || parseFloat(rateFormData.fee) < 0) {
      setMessage('Please enter a valid fee amount');
      return;
    }

    try {
      setLoading(true);
const url = editingRateId 
        ? `/api/admin/deliveryrates/${editingRateId}`
        : '/api/admin/deliveryrates';
      
      await adminApiClient.request({ url, method: editingRateId ? 'PUT' : 'POST', data: { ...rateFormData, fee: parseFloat(rateFormData.fee) } });

      {
        setMessage(editingRateId ? 'Delivery rate updated successfully!' : 'Delivery rate added successfully!');
        setRateFormData({ wilaya: '', commune: '', deliveryType: 'home', fee: '' });
        setEditingRateId(null);
        fetchDeliveryRates();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to save delivery rate');
      }
    } catch (error) {
      setMessage('Error saving delivery rate');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRate = (rate) => {
    setRateFormData({
      wilaya: rate.wilaya,
      commune: rate.commune,
      deliveryType: rate.deliveryType,
      fee: rate.fee.toString()
    });
    setEditingRateId(rate._id);
    setMessage('');
  };

  const handleDeleteRate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery rate?')) {
      return;
    }

    try {
      setLoading(true);
await adminApiClient.delete(`/api/admin/deliveryrates/${id}`);

    {
        setMessage('Delivery rate deleted successfully!');
        fetchDeliveryRates();
      } else {
        setMessage('Failed to delete delivery rate');
      }
    } catch (error) {
      setMessage('Error deleting delivery rate');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRate = () => {
    setRateFormData({ wilaya: '', commune: '', deliveryType: 'home', fee: '' });
    setEditingRateId(null);
    setMessage('');
  };

  // Get available communes for selected wilaya
  const getAvailableCommunes = () => {
    const selectedWilaya = wilayas.find(w => w.name === rateFormData.wilaya);
    return selectedWilaya ? selectedWilaya.communes : [];
  };

  return (
    <div className="delivery-management">
      <h2>Delivery Fee Management</h2>
      
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'wilayas' ? 'active' : ''}`}
          onClick={() => setActiveTab('wilayas')}
        >
          Manage Wilayas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`}
          onClick={() => setActiveTab('rates')}
        >
          Manage Delivery Rates
        </button>
      </div>

      {/* Wilaya Management Tab */}
      {activeTab === 'wilayas' && (
        <div className="tab-content">
          <div className="delivery-form-container">
            <h3>{editingWilayaId ? 'Edit Wilaya' : 'Add New Wilaya'}</h3>
            <form onSubmit={handleWilayaSubmit} className="delivery-form">
              <div className="form-group">
                <label htmlFor="wilayaName">Wilaya Name:</label>
                <input
                  type="text"
                  id="wilayaName"
                  name="name"
                  value={wilayaFormData.name}
                  onChange={handleWilayaInputChange}
                  placeholder="Enter wilaya name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Communes:</label>
                {wilayaFormData.communes.map((commune, index) => (
                  <div key={index} className="commune-input-group">
                    <input
                      type="text"
                      value={commune}
                      onChange={(e) => handleCommuneChange(index, e.target.value)}
                      placeholder={`Enter commune ${index + 1}`}
                      required
                    />
                    {wilayaFormData.communes.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeCommuneField(index)}
                        className="remove-commune-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addCommuneField}
                  className="add-commune-btn"
                >
                  Add Another Commune
                </button>
              </div>
              
              <div className="form-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingWilayaId ? 'Update Wilaya' : 'Add Wilaya')}
                </button>
                {editingWilayaId && (
                  <button type="button" onClick={handleCancelWilaya} className="cancel-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="delivery-rates-container">
            <h3>Current Wilayas</h3>
            {loading && !editingWilayaId ? (
              <p>Loading wilayas...</p>
            ) : wilayas.length === 0 ? (
              <p>No wilayas found. Add your first wilaya above.</p>
            ) : (
              <div className="delivery-rates-table">
                <table>
                  <thead>
                    <tr>
                      <th>Wilaya Name</th>
                      <th>Communes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wilayas.map((wilaya) => (
                      <tr key={wilaya._id}>
                        <td>{wilaya.name}</td>
                        <td>{wilaya.communes.join(', ')}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditWilaya(wilaya)}
                              className="edit-btn"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteWilaya(wilaya._id)}
                              className="delete-btn"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Rates Management Tab */}
      {activeTab === 'rates' && (
        <div className="tab-content">
          <div className="delivery-form-container">
            <h3>{editingRateId ? 'Edit Delivery Rate' : 'Add New Delivery Rate'}</h3>
            <form onSubmit={handleRateSubmit} className="delivery-form">
              <div className="form-group">
                <label htmlFor="wilaya">Wilaya:</label>
                <select
                  id="wilaya"
                  name="wilaya"
                  value={rateFormData.wilaya}
                  onChange={handleRateInputChange}
                  required
                >
                  <option value="">Select a wilaya</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya._id} value={wilaya.name}>
                      {wilaya.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="commune">Commune:</label>
                <select
                  id="commune"
                  name="commune"
                  value={rateFormData.commune}
                  onChange={handleRateInputChange}
                  required
                  disabled={!rateFormData.wilaya}
                >
                  <option value="">Select a commune</option>
                  {getAvailableCommunes().map((commune, index) => (
                    <option key={index} value={commune}>
                      {commune}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="deliveryType">Delivery Type:</label>
                <select
                  id="deliveryType"
                  name="deliveryType"
                  value={rateFormData.deliveryType}
                  onChange={handleRateInputChange}
                  required
                >
                  <option value="home">Home Delivery</option>
                  <option value="pickup">Pickup Point</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="fee">Delivery Fee (DA):</label>
                <input
                  type="number"
                  id="fee"
                  name="fee"
                  value={rateFormData.fee}
                  onChange={handleRateInputChange}
                  placeholder="Enter delivery fee"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingRateId ? 'Update Rate' : 'Add Rate')}
                </button>
                {editingRateId && (
                  <button type="button" onClick={handleCancelRate} className="cancel-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="delivery-rates-container">
            <h3>Current Delivery Rates</h3>
            {loading && !editingRateId ? (
              <p>Loading delivery rates...</p>
            ) : deliveryRates.length === 0 ? (
              <p>No delivery rates found. Add your first delivery rate above.</p>
            ) : (
              <div className="delivery-rates-table">
                <table>
                  <thead>
                    <tr>
                      <th>Wilaya</th>
                      <th>Commune</th>
                      <th>Delivery Type</th>
                      <th>Fee (DA)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryRates.map((rate) => (
                      <tr key={rate._id}>
                        <td>{rate.wilaya}</td>
                        <td>{rate.commune}</td>
                        <td>
                          <span className={`delivery-type ${rate.deliveryType}`}>
                            {rate.deliveryType === 'home' ? 'Home Delivery' : 'Pickup Point'}
                          </span>
                        </td>
                        <td>{rate.fee} DA</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditRate(rate)}
                              className="edit-btn"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRate(rate._id)}
                              className="delete-btn"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;
