import React, { useState, useEffect } from 'react';
import './DeliveryManagement.css';
import { adminApiClient } from '../../services/adminAuthService';

const DeliveryManagement = () => {
  // State for delivery rates
  const [deliveryRates, setDeliveryRates] = useState([]);
  const [rateFormData, setRateFormData] = useState({
    wilaya: '',
    communes: [],
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
  const [listingSupported, setListingSupported] = useState(true);
  // Filters for rates list
  const [rateFilters, setRateFilters] = useState({ search: '', wilaya: '' });

  // Fetch data on component mount
  useEffect(() => {
    fetchDeliveryRates();
    fetchWilayas();
  }, []);

  // Generic helper to try multiple endpoint paths to avoid 404 differences between deployments
  const requestWithFallback = async ({ method, paths, data, params }) => {
    let lastError;
    for (const url of paths) {
      try {
        const res = await adminApiClient.request({ url, method, data, params });
        return res;
      } catch (err) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err?.message || 'Request failed';
        // Debug which path failed (only in development)
        try { if (process.env.NODE_ENV === 'development') console.warn('[delivery] endpoint failed', { method, url, status, msg }); } catch {}
        // Continue on 404/405 (missing route), and also 308/307 permanent/temporary redirects not followed
        if (status === 404 || status === 405 || status === 308 || status === 307) {
          lastError = err;
          continue;
        }
        // Otherwise stop early
        lastError = err;
        break;
      }
    }
    throw lastError || new Error('All endpoints failed');
  };

const fetchDeliveryRates = async () => {
    setLoading(true);
    try {
      const res = await adminApiClient.get('/api/admin/deliveryrates');
      const list = res?.data?.rates ?? res?.data?.data ?? res?.data ?? [];
      setDeliveryRates(Array.isArray(list) ? list : []);
      setMessage('');
    } catch (error) {
      setDeliveryRates([]);
      setMessage('Error fetching delivery rates');
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching delivery rates:', error);
      }
    } finally {
      setLoading(false);
    }
  };

const fetchWilayas = async () => {
    setLoading(true);
    try {
      let list = [];

      // Try admin endpoint first; it may 404 in some environments
      try {
        const adminRes = await adminApiClient.get('/api/admin/wilayas');
        list = adminRes?.data?.wilayas ?? adminRes?.data?.data ?? adminRes?.data ?? [];
      } catch (adminErr) {
        // Fallback to public endpoint used by storefront
        const publicRes = await adminApiClient.get('/wilayas');
        list = publicRes?.data?.wilayas ?? publicRes?.data?.data ?? publicRes?.data ?? [];
      }

      // Normalize to array
      setWilayas(Array.isArray(list) ? list : []);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching wilayas');
      console.error('Error fetching wilayas:', error);
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

      setMessage(editingWilayaId ? 'Wilaya updated successfully!' : 'Wilaya added successfully!');
      setWilayaFormData({ name: '', communes: [''] });
      setEditingWilayaId(null);
      fetchWilayas();
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

    setMessage('Wilaya deleted successfully!');
    fetchWilayas();
    fetchDeliveryRates(); // Refresh delivery rates as they might be affected
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
    const { name, value, options } = e.target;
    if (name === 'communes') {
      const selected = Array.from(options || [])
        .filter(o => o.selected)
        .map(o => o.value);
      setRateFormData(prev => ({
        ...prev,
        communes: selected
      }));
    } else {
      setRateFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!rateFormData.wilaya || !rateFormData.deliveryType || !rateFormData.fee) {
      setMessage('Please fill in all fields');
      return;
    }

    const selectedCommunes = Array.isArray(rateFormData.communes)
      ? rateFormData.communes.filter(Boolean)
      : [];

    if (selectedCommunes.length === 0) {
      setMessage('Please select at least one commune');
      return;
    }

    const numericFee = parseFloat(rateFormData.fee);
    if (isNaN(numericFee) || numericFee < 0) {
      setMessage('Please enter a valid fee amount');
      return;
    }

    try {
      setLoading(true);

      if (editingRateId) {
        if (selectedCommunes.length !== 1) {
          setMessage('When editing a delivery rate, select exactly one commune.');
          return;
        }
        await adminApiClient.put(`/api/admin/deliveryrates/${editingRateId}`, {
          wilaya: rateFormData.wilaya,
          commune: selectedCommunes[0],
          deliveryType: rateFormData.deliveryType,
          fee: numericFee
        });
        setMessage('Delivery rate updated successfully!');
      } else {
        // Create one rate per selected commune
        const ops = selectedCommunes.map((commune) =>
          adminApiClient
            .post('/api/admin/deliveryrates', {
              wilaya: rateFormData.wilaya,
              commune,
              deliveryType: rateFormData.deliveryType,
              fee: numericFee
            })
            .then(() => ({ commune, ok: true }))
            .catch((err) => ({ commune, ok: false, err }))
        );

        const results = await Promise.all(ops);
        const successCount = results.filter(r => r.ok).length;
        const failureCount = results.length - successCount;

        if (successCount > 0 && failureCount === 0) {
          setMessage(`Delivery rate added for ${successCount} commune(s) successfully!`);
        } else if (successCount > 0 && failureCount > 0) {
          setMessage(`Added rate for ${successCount} commune(s), but ${failureCount} failed. Try again for the failed ones.`);
        } else {
          const backendMsg = results[0]?.err?.response?.data?.message || results[0]?.err?.message || 'Unknown error';
          setMessage(`Failed to add delivery rates: ${backendMsg}`);
        }
      }

      setRateFormData({ wilaya: '', communes: [], deliveryType: 'home', fee: '' });
      setEditingRateId(null);
      fetchDeliveryRates();
    } catch (error) {
      const backendMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      setMessage(`Error saving delivery rate${backendMsg ? `: ${backendMsg}` : ''}`);
      console.error('Error saving delivery rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRate = (rate) => {
    setRateFormData({
      wilaya: rate.wilaya,
      communes: [rate.commune],
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

      setMessage('Delivery rate deleted successfully!');
      fetchDeliveryRates();
    } catch (error) {
      setMessage('Error deleting delivery rate');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRate = () => {
    setRateFormData({ wilaya: '', communes: [], deliveryType: 'home', fee: '' });
    setEditingRateId(null);
    setMessage('');
  };

  // Get available communes for selected wilaya
  const getAvailableCommunes = () => {
    const selectedWilaya = wilayas.find(w => w.name === rateFormData.wilaya);
    return selectedWilaya ? selectedWilaya.communes : [];
  };

  // Filters handlers and derived data
  const handleRateFilterInputChange = (e) => {
    const { name, value } = e.target;
    setRateFilters(prev => ({ ...prev, [name]: value }));
  };

  const getFilteredRates = () => {
    const q = rateFilters.search.trim().toLowerCase();
    const list = Array.isArray(deliveryRates) ? deliveryRates : [];
    return list.filter((rate) => {
      const matchesWilaya = rateFilters.wilaya ? rate.wilaya === rateFilters.wilaya : true;
      const matchesQuery = q
        ? ((rate.wilaya || '').toLowerCase().includes(q) || (rate.commune || '').toLowerCase().includes(q) || (rate.deliveryType || '').toLowerCase().includes(q))
        : true;
      return matchesWilaya && matchesQuery;
    });
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
                <label htmlFor="communes">Communes:</label>
                <div className="multiselect-row">
                  <select
                    id="communes"
                    name="communes"
                    multiple
                    value={rateFormData.communes}
                    onChange={handleRateInputChange}
                    required
                    disabled={!rateFormData.wilaya}
                    size={Math.min(8, Math.max(3, getAvailableCommunes().length))}
                  >
                    {getAvailableCommunes().map((commune, index) => (
                      <option key={index} value={commune}>
                        {commune}
                      </option>
                    ))}
                  </select>
                  <div className="multiselect-actions">
                    <button
                      type="button"
                      className="small-btn"
                      onClick={() =>
                        setRateFormData(prev => ({
                          ...prev,
                          communes: getAvailableCommunes()
                        }))
                      }
                      disabled={!rateFormData.wilaya}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="small-btn"
                      onClick={() =>
                        setRateFormData(prev => ({
                          ...prev,
                          communes: []
                        }))
                      }
                      disabled={!rateFormData.wilaya}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                {!editingRateId && (
                  <small className="hint">
                    Hold Cmd (Mac) or Ctrl (Windows) to select multiple communes.
                  </small>
                )}
                {editingRateId && (
                  <small className="hint">
                    Editing a rate requires exactly one commune selected.
                  </small>
                )}
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
            <div className="filters-bar">
              <div className="filter-group">
                <label htmlFor="filterWilaya">Filter by wilaya</label>
                <select id="filterWilaya" name="wilaya" value={rateFilters.wilaya} onChange={handleRateFilterInputChange}>
                  <option value="">All wilayas</option>
                  {wilayas.map((w) => (
                    <option key={w._id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="filterSearch">Search</label>
                <input
                  id="filterSearch"
                  name="search"
                  type="text"
                  placeholder="Search wilaya, commune, or type"
                  value={rateFilters.search}
                  onChange={handleRateFilterInputChange}
                />
              </div>
              <div className="filter-actions">
                <button
                  type="button"
                  className="small-btn"
                  onClick={() => setRateFilters({ search: '', wilaya: '' })}
                  disabled={!rateFilters.search && !rateFilters.wilaya}
                >
                  Clear filters
                </button>
              </div>
            </div>
            <small className="hint">Showing {getFilteredRates().length} of {Array.isArray(deliveryRates) ? deliveryRates.length : 0} rate(s)</small>
            {loading && !editingRateId ? (
              <p>Loading delivery rates...</p>
            ) : (!Array.isArray(deliveryRates) || deliveryRates.length === 0) ? (
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
                    {getFilteredRates().length === 0 ? (
                      <tr>
                        <td colSpan="5">No results match your filters.</td>
                      </tr>
                    ) : (
                      getFilteredRates().map((rate) => (
                        <tr key={rate._id}>
                          <td>
                            <button
                              type="button"
                              className="link-like"
                              onClick={() => setRateFilters(prev => ({ ...prev, wilaya: rate.wilaya }))}
                            >
                              {rate.wilaya}
                            </button>
                          </td>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;
