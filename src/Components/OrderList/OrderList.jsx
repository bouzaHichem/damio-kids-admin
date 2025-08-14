import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { backend_url } from "../../App";
import "./OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      const adminToken = "admin-token-123";
      const res = await axios.get(`${backend_url}/admin/orders`, {
        headers: {
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
      const adminToken = "admin-token-123";
      await axios.post(`${backend_url}/admin/updateorder`, {
        orderId,
        status: newStatus,
      }, {
        headers: {
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

  const filteredOrders = filter === "All" ? orders : orders.filter(order => order.status === filter);

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
                      {order.items.map((item, idx) => (
                        <div key={idx} className="product-item">
                          <span className="product-name">{item.name}</span>
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
                        <span className="detail-label">Delivery Fee:</span>
                        <span className="detail-value fee-amount">
                          {order.deliveryFee ? `${order.deliveryFee.toFixed(2)} د.ج` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="total-section">
                    <div className="subtotal-amount">
                      <span className="subtotal-label">Products Total:</span>
                      <span className="subtotal-value">
                        {(order.total - (order.deliveryFee || 0)).toFixed(2)} د.ج
                      </span>
                    </div>
                    <div className="delivery-fee-amount">
                      <span className="delivery-fee-label">Delivery Fee:</span>
                      <span className="delivery-fee-value">
                        {order.deliveryFee ? order.deliveryFee.toFixed(2) : '0.00'} د.ج
                      </span>
                    </div>
                    <div className="total-amount">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-value">{order.total.toFixed(2)} د.ج</span>
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
