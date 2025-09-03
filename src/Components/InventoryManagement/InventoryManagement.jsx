import React, { useState, useEffect } from 'react';
import './InventoryManagement.css';
import { adminApiClient } from '../../services/adminAuthService';

const InventoryManagement = () => {
  const [inventoryReport, setInventoryReport] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('report');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    status: '',
    lowStock: false,
    outOfStock: false
  });
  const [bulkUpdates, setBulkUpdates] = useState([]);
  const [stockThreshold, setStockThreshold] = useState(10);

  useEffect(() => {
    fetchInventoryData();
  }, [filters, stockThreshold]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
// Fetch inventory report
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

const { data: reportData } = await adminApiClient.get(`/api/admin/inventory?${queryParams.toString()}`);
      if (reportData.success) {
        setInventoryReport(reportData.data);
      }

      // Fetch low stock products
const { data: lowStockData } = await adminApiClient.get(`/api/admin/inventory/low-stock?threshold=${stockThreshold}`);
      if (lowStockData.success) {
        setLowStockProducts(lowStockData.data.products);
      }

      // Fetch out of stock products
const { data: outOfStockData } = await adminApiClient.get('/api/admin/inventory/out-of-stock');
      if (outOfStockData.success) {
        setOutOfStockProducts(outOfStockData.data.products);
      }

    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId, newQuantity, reason = 'manual_adjustment') => {
    try {
const { data } = await adminApiClient.post('/api/admin/inventory/update-stock', { productId, quantity: newQuantity, reason });
      if (data.success) {
        // Refresh inventory data
        fetchInventoryData();
        alert('Stock updated successfully!');
      } else {
        alert('Error updating stock: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    }
  };

  const handleBulkStockUpdate = async () => {
    if (bulkUpdates.length === 0) {
      alert('No updates to process');
      return;
    }

    try {
const { data } = await adminApiClient.post('/api/admin/inventory/bulk-update', { updates: bulkUpdates });
      if (data.success) {
        setBulkUpdates([]);
        fetchInventoryData();
        alert(`Bulk update completed! ${data.data.successful} successful, ${data.data.failed} failed.`);
      } else {
        alert('Error with bulk update: ' + data.error);
      }
    } catch (error) {
      console.error('Error with bulk update:', error);
      alert('Error with bulk update');
    }
  };

  const addToBulkUpdate = (productId, productName, currentStock) => {
    const newQuantity = prompt(`Update stock for ${productName} (current: ${currentStock}):`);
    if (newQuantity !== null && !isNaN(newQuantity)) {
      setBulkUpdates(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item => 
            item.productId === productId 
              ? { ...item, quantity: parseInt(newQuantity) }
              : item
          );
        } else {
          return [...prev, {
            productId,
            productName,
            quantity: parseInt(newQuantity),
            reason: 'bulk_adjustment'
          }];
        }
      });
    }
  };

  const removeBulkUpdate = (productId) => {
    setBulkUpdates(prev => prev.filter(item => item.productId !== productId));
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= stockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusBadge = (quantity) => {
    const status = getStockStatus(quantity);
    return (
      <span className={`stock-badge ${status}`}>
        {status === 'out-of-stock' ? '🚫 Out of Stock' : 
         status === 'low-stock' ? '⚠️ Low Stock' : 
         '✅ In Stock'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner"></div>
        <p>Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>📦 Inventory Management</h1>
        
        <div className="inventory-actions">
          <button 
            className="btn-export"
            onClick={() => {/* TODO: Implement export */}}
          >
            📊 Export Report
          </button>
          
          {bulkUpdates.length > 0 && (
            <button 
              className="btn-bulk-update"
              onClick={handleBulkStockUpdate}
            >
              📝 Apply Bulk Updates ({bulkUpdates.length})
            </button>
          )}
        </div>
      </div>

      {/* Bulk Updates Queue */}
      {bulkUpdates.length > 0 && (
        <div className="bulk-updates-queue">
          <h3>📝 Pending Bulk Updates</h3>
          <div className="bulk-updates-list">
            {bulkUpdates.map((update, index) => (
              <div key={index} className="bulk-update-item">
                <span className="product-name">{update.productName}</span>
                <span className="quantity">New Stock: {update.quantity}</span>
                <button 
                  className="btn-remove"
                  onClick={() => removeBulkUpdate(update.productId)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="inventory-tabs">
        <button 
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          📊 Inventory Report
        </button>
        <button 
          className={`tab ${activeTab === 'low-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('low-stock')}
        >
          ⚠️ Low Stock ({lowStockProducts.length})
        </button>
        <button 
          className={`tab ${activeTab === 'out-of-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('out-of-stock')}
        >
          🚫 Out of Stock ({outOfStockProducts.length})
        </button>
      </div>

      {/* Filters */}
      <div className="inventory-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories</option>
            <option value="garcon">Garçon</option>
            <option value="fille">Fille</option>
            <option value="bébé">Bébé</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Stock Threshold:</label>
          <input 
            type="number" 
            value={stockThreshold}
            onChange={(e) => setStockThreshold(parseInt(e.target.value))}
            min="1"
            max="100"
          />
        </div>

        <button 
          className="btn-clear-filters"
          onClick={() => setFilters({category: '', brand: '', status: '', lowStock: false, outOfStock: false})}
        >
          Clear Filters
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="inventory-content">
        {activeTab === 'report' && (
          <div className="inventory-table-container">
            <h2>📊 Complete Inventory Report</h2>
            <div className="table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="product-info">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="product-thumb"
                          />
                          <div>
                            <div className="product-name">{product.name}</div>
                            <div className="product-sku">SKU: {product.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="stock-quantity">{product.stock_quantity || 0}</td>
                      <td>{getStockStatusBadge(product.stock_quantity || 0)}</td>
                      <td>{new Date(product.date).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-update"
                            onClick={() => {
                              const newQuantity = prompt(`Update stock for ${product.name}:`, product.stock_quantity || 0);
                              if (newQuantity !== null) {
                                handleStockUpdate(product._id, parseInt(newQuantity));
                              }
                            }}
                          >
                            ✏️ Update
                          </button>
                          <button 
                            className="btn-bulk-add"
                            onClick={() => addToBulkUpdate(product._id, product.name, product.stock_quantity || 0)}
                          >
                            📝 Add to Bulk
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'low-stock' && (
          <div className="low-stock-container">
            <h2>⚠️ Low Stock Products (≤ {stockThreshold})</h2>
            <div className="products-grid">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="product-card low-stock">
                  <img src={product.image} alt={product.name} />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <div className="stock-info">
                      <span className="current-stock">Stock: {product.stock_quantity || 0}</span>
                      {getStockStatusBadge(product.stock_quantity || 0)}
                    </div>
                    <button 
                      className="btn-restock"
                      onClick={() => {
                        const newQuantity = prompt(`Restock ${product.name}:`, 50);
                        if (newQuantity !== null) {
                          handleStockUpdate(product._id, parseInt(newQuantity), 'restock');
                        }
                      }}
                    >
                      📦 Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'out-of-stock' && (
          <div className="out-of-stock-container">
            <h2>🚫 Out of Stock Products</h2>
            <div className="products-grid">
              {outOfStockProducts.map((product) => (
                <div key={product._id} className="product-card out-of-stock">
                  <img src={product.image} alt={product.name} />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <div className="stock-info">
                      <span className="current-stock">Stock: 0</span>
                      {getStockStatusBadge(0)}
                    </div>
                    <button 
                      className="btn-restock urgent"
                      onClick={() => {
                        const newQuantity = prompt(`Urgent restock for ${product.name}:`, 50);
                        if (newQuantity !== null) {
                          handleStockUpdate(product._id, parseInt(newQuantity), 'urgent_restock');
                        }
                      }}
                    >
                      🚨 Urgent Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
