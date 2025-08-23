import React, { useState, useEffect } from 'react';
import './Analytics.css';
import { backend_url } from '../../App';

const Analytics = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesTrends, setSalesTrends] = useState([]);
  const [customerInsights, setCustomerInsights] = useState(null);
  const [inventoryInsights, setInventoryInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats
      const statsResponse = await fetch(
        `${backend_url}/api/admin/dashboard/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers }
      );
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setDashboardStats(statsData.data);
      }

      // Fetch sales trends
      const trendsResponse = await fetch(
        `${backend_url}/api/admin/analytics/sales-trends?period=${period}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers }
      );
      const trendsData = await trendsResponse.json();
      if (trendsData.success) {
        setSalesTrends(trendsData.data.trends);
      }

      // Fetch customer insights
      const customersResponse = await fetch(
        `${backend_url}/api/admin/analytics/customers?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers }
      );
      const customersData = await customersResponse.json();
      if (customersData.success) {
        setCustomerInsights(customersData.data);
      }

      // Fetch inventory insights
      const inventoryResponse = await fetch(
        `${backend_url}/api/admin/analytics/inventory`,
        { headers }
      );
      const inventoryData = await inventoryResponse.json();
      if (inventoryData.success) {
        setInventoryInsights(inventoryData.data);
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        
        <div className="analytics-controls">
          <div className="date-range-controls">
            <label>From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <label>To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          
          <div className="period-controls">
            <label>Period:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(dashboardStats.totalRevenue || 0)}</p>
              <span className="stat-change positive">
                +{dashboardStats.revenueGrowth || 0}% from last period
              </span>
            </div>
          </div>

          <div className="stat-card orders">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{dashboardStats.totalOrders || 0}</p>
              <span className="stat-change positive">
                +{dashboardStats.ordersGrowth || 0}% from last period
              </span>
            </div>
          </div>

          <div className="stat-card customers">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Customers</h3>
              <p className="stat-value">{dashboardStats.totalCustomers || 0}</p>
              <span className="stat-change positive">
                +{dashboardStats.newCustomers || 0} new customers
              </span>
            </div>
          </div>

          <div className="stat-card products">
            <div className="stat-icon">🛍️</div>
            <div className="stat-content">
              <h3>Total Products</h3>
              <p className="stat-value">{dashboardStats.totalProducts || 0}</p>
              <span className="stat-change">
                {dashboardStats.activeProducts || 0} active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sales Trends Chart */}
      {salesTrends.length > 0 && (
        <div className="chart-section">
          <h2>📈 Sales Trends</h2>
          <div className="trends-chart">
            {salesTrends.map((trend, index) => (
              <div key={index} className="trend-bar">
                <div 
                  className="bar" 
                  style={{
                    height: `${(trend.revenue / Math.max(...salesTrends.map(t => t.revenue))) * 100}%`
                  }}
                ></div>
                <div className="trend-label">
                  <span className="date">{new Date(trend._id || trend.date).toLocaleDateString()}</span>
                  <span className="amount">{formatCurrency(trend.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Insights */}
      {customerInsights && (
        <div className="insights-section">
          <h2>👥 Customer Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>New Customers</h3>
              <p className="insight-value">{customerInsights.newCustomers || 0}</p>
            </div>
            <div className="insight-card">
              <h3>Returning Customers</h3>
              <p className="insight-value">{customerInsights.returningCustomers || 0}</p>
            </div>
            <div className="insight-card">
              <h3>Average Order Value</h3>
              <p className="insight-value">{formatCurrency(customerInsights.averageOrderValue || 0)}</p>
            </div>
            <div className="insight-card">
              <h3>Customer Retention</h3>
              <p className="insight-value">{customerInsights.retentionRate || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Insights */}
      {inventoryInsights && (
        <div className="inventory-section">
          <h2>📦 Inventory Overview</h2>
          <div className="inventory-alerts">
            {inventoryInsights.lowStockCount > 0 && (
              <div className="alert warning">
                ⚠️ {inventoryInsights.lowStockCount} products are running low on stock
              </div>
            )}
            {inventoryInsights.outOfStockCount > 0 && (
              <div className="alert danger">
                🚫 {inventoryInsights.outOfStockCount} products are out of stock
              </div>
            )}
          </div>
          
          <div className="inventory-stats">
            <div className="inventory-stat">
              <span className="label">Total Products:</span>
              <span className="value">{inventoryInsights.totalProducts || 0}</span>
            </div>
            <div className="inventory-stat">
              <span className="label">Total Stock Value:</span>
              <span className="value">{formatCurrency(inventoryInsights.totalStockValue || 0)}</span>
            </div>
            <div className="inventory-stat">
              <span className="label">Low Stock Products:</span>
              <span className="value warning">{inventoryInsights.lowStockCount || 0}</span>
            </div>
            <div className="inventory-stat">
              <span className="label">Out of Stock Products:</span>
              <span className="value danger">{inventoryInsights.outOfStockCount || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
