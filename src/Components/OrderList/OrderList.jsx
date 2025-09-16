import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { backend_url, currency } from "../../App";
import "./OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await axios.get(`${backend_url}/api/admin/orders`, {
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "auth-token": adminToken
        }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axios.post(`${backend_url}/api/admin/updateorder`, {
        orderId,
        status: newStatus,
      }, {
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "auth-token": adminToken
        }
      });
      toast.success("Order status updated successfully! 🎉");
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err.response?.data || err.message);
      toast.error("Failed to update status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return "⏳";
      case "Processing": return "🔄";
      case "Shipped": return "🚚";
      case "Delivered": return "✅";
      default: return "📋";
    }
  };

  // Helpers for money and totals (supports both old and new backend payloads)
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const computeProductsTotal = (order) => {
    if (order && order.productsTotal != null) return toNumber(order.productsTotal);
    if (order && order.total != null && order.deliveryFee != null) {
      return toNumber(order.total) - toNumber(order.deliveryFee);
    }
    const items = (order?.items || []);
    return items.reduce((sum, item) => sum + toNumber(item.price) * toNumber(item.quantity), 0);
  };

  const computeDeliveryFee = (order) => {
    if (order && order.deliveryFee != null) return toNumber(order.deliveryFee);
    return 0;
  };

  const computeTotalAmount = (order) => {
    if (order && order.totalAmount != null) return toNumber(order.totalAmount);
    if (order && order.total != null) return toNumber(order.total);
    return computeProductsTotal(order) + computeDeliveryFee(order);
  };

  const formatCurrency = (amount) => `${toNumber(amount).toFixed(2)} ${currency}`;

  const filteredOrders = filter === "All" ? orders : orders.filter(order => order.status === filter);

  const downloadCSV = () => {
    const rows = [];
    // Header
    rows.push([
      'Order ID',
      'Date',
      'Status',
      'Customer',
      'Phone',
      'Wilaya',
      'Commune',
      'Delivery Type',
      'Delivery Address',
      'Product Name',
      'Variant Size',
      'Variant Color',
      'Variant Age',
      'Quantity',
      'Unit Price',
      'Line Total',
      'Order Total',
      'Delivery Fee'
    ].join(','));

    const safe = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      // Wrap in quotes to keep commas newlines safe
      return `"${str}"`;
    };

    (filteredOrders || []).forEach(order => {
      const base = [
        safe(order._id),
        safe(new Date(order.date).toISOString()),
        safe(order.status),
        safe(order.userId || ''),
        safe(order.phone || order.telephone || ''),
        safe(order.wilaya || ''),
        safe(order.commune || ''),
        safe(order.deliveryType || ''),
        safe(order.address || ''),
      ];
      (order.items || []).forEach(item => {
        const variant = item.variant || {};
        const unit = Number(item.price || 0);
        const qty = Number(item.quantity || 0);
        const lineTotal = unit * qty;
        const row = base.concat([
          safe(item.name),
          safe(variant.size || ''),
          safe(variant.color || ''),
          safe(variant.age || ''),
          safe(qty),
          safe(unit),
          safe(lineTotal),
          safe(order.total || 0),
          safe(order.deliveryFee || 0),
        ]);
        rows.push(row.join(','));
      });
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    link.download = `orders_${now.toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateId = (id) => `#${id.slice(-6).toUpperCase()}`;

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <h1 className="main-title">
            📦 Order Management
          </h1>
          <p className="subtitle">Manage and track all customer orders</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === "Pending").length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card processing">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === "Processing").length}</h3>
              <p>Processing</p>
            </div>
          </div>
          <div className="stat-card shipped">
            <div className="stat-icon">🚚</div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === "Shipped").length}</h3>
              <p>Shipped</p>
            </div>
          </div>
          <div className="stat-card delivered">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === "Delivered").length}</h3>
              <p>Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-buttons">
          {["All", "Pending", "Processing", "Shipped", "Delivered"].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === "All" ? "🔍" : getStatusIcon(status)} {status}
            </button>
          ))}
        </div>
      </div>

      <div className="export-actions">
        <button className="export-btn" onClick={downloadCSV}>⬇️ Export CSV</button>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No orders found</h3>
            <p>There are no orders matching your current filter.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id-section">
                    <span className="order-id">{truncateId(order._id)}</span>
                    <span className="order-date">{formatDate(order.date)}</span>
                  </div>
                  <div className={`status-badge status-${order.status.toLowerCase()}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>

                <div className="order-content">
                  <div className="customer-info">
                    <h4>👤 Customer</h4>
                    <p>{order.userId}</p>
                  </div>

                  <div className="products-info">
                    <h4>🛍️ Products</h4>
                    <div className="products-list">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="product-item">
                          <span className="product-name">
                            {item.name}
                            {item.variant && (
                              <span style={{ marginLeft: 8, display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                                {item.variant.size && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 9999,
                                    background: '#eef2ff',
                                    border: '1px solid #e0e7ff',
                                    fontSize: 12,
                                    color: '#4338ca'
                                  }}>Size: {item.variant.size}</span>
                                )}
                                {item.variant.color && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 9999,
                                    background: '#fdf2f8',
                                    border: '1px solid #fce7f3',
                                    fontSize: 12,
                                    color: '#be185d'
                                  }}>Color: {item.variant.color}</span>
                                )}
                                {item.variant.age && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 9999,
                                    background: '#ecfeff',
                                    border: '1px solid #cffafe',
                                    fontSize: 12,
                                    color: '#0e7490'
                                  }}>Age: {item.variant.age}</span>
                                )}
                              </span>
                            )}
                          </span>
                          <span className="product-quantity">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="address-info">
                    <h4>📍 Delivery Address</h4>
                    <p className="address-text">{order.address}</p>
                  </div>

                  <div className="delivery-info">
                    <h4>🚚 Delivery Information</h4>
                    <div className="delivery-details">
                      <div className="delivery-detail">
                        <span className="detail-label">Wilaya:</span>
                        <span className="detail-value">{order.wilaya || 'N/A'}</span>
                      </div>
                      <div className="delivery-detail">
                        <span className="detail-label">Commune:</span>
                        <span className="detail-value">{order.commune || 'N/A'}</span>
                      </div>
                      <div className="delivery-detail">
                        <span className="detail-label">Method:</span>
                        <span className={`detail-value delivery-type ${order.deliveryType || 'home'}`}>
                          {order.deliveryType === 'pickup' ? '📦 Pickup Point' : '🏠 Home Delivery'}
                        </span>
                      </div>
                      <div className="delivery-detail">
                        <span className="detail-label">Products Total:</span>
                        <span className="detail-value">{formatCurrency(computeProductsTotal(order))}</span>
                      </div>
                      <div className="delivery-detail">
                        <span className="detail-label">Delivery Fee:</span>
                        <span className="detail-value fee-amount">{formatCurrency(computeDeliveryFee(order))}</span>
                      </div>
                      <div className="delivery-detail">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value">{formatCurrency(computeTotalAmount(order))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="total-section">
                    <div className="subtotal-amount">
                      <span className="subtotal-label">Products Total:</span>
                      <span className="subtotal-value">
                        {formatCurrency(computeProductsTotal(order))}
                      </span>
                    </div>
                    <div className="delivery-fee-amount">
                      <span className="delivery-fee-label">Delivery Fee:</span>
                      <span className="delivery-fee-value">
                        {formatCurrency(computeDeliveryFee(order))}
                      </span>
                    </div>
                    <div className="total-amount">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-value">{formatCurrency(computeTotalAmount(order))}</span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <label className="action-label">Update Status:</label>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  >
                    <option value="Pending">⏳ Pending</option>
                    <option value="Processing">🔄 Processing</option>
                    <option value="Shipped">🚚 Shipped</option>
                    <option value="Delivered">✅ Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
