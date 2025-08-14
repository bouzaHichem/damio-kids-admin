import React, { useState } from 'react'
import './Sidebar.css'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const menuItems = [
    {
      path: '/addproduct',
      icon: '📦',
      label: 'Add Product',
      description: 'Create new products'
    },
    {
      path: '/listproduct',
      icon: '📋',
      label: 'Product List',
      description: 'Manage all products'
    },
    {
      path: '/OrderList',
      icon: '🛒',
      label: 'Orders',
      description: 'View and manage orders'
    },
    {
      path: '/DeliveryManagement',
      icon: '🚚',
      label: 'Delivery',
      description: 'Manage deliveries'
    },
    {
      path: '/categorymanagement',
      icon: '🏷️',
      label: 'Categories',
      description: 'Organize product categories'
    },
    {
      path: '/shopimagemanagement',
      icon: '🖼️',
      label: 'Shop Images',
      description: 'Manage shop visuals'
    },
    {
      path: '/collectionsmanagement',
      icon: '📚',
      label: 'Collections',
      description: 'Manage product collections'
    }
  ]

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">👑</span>
          {!collapsed && (
            <div className="logo-text">
              <h3>Damio Kids</h3>
              <span>Admin Panel</span>
            </div>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <span className="nav-section-title">MAIN MENU</span>}
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`sidebar-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && (
                <div className="sidebar-content">
                  <span className="sidebar-label">{item.label}</span>
                  <span className="sidebar-description">{item.description}</span>
                </div>
              )}
              {location.pathname === item.path && (
                <div className="active-indicator"></div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👨‍💼</div>
            <div className="user-details">
              <span className="user-name">Admin User</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <div className="footer-actions">
            <button className="footer-btn" title="Settings">⚙️</button>
            <button className="footer-btn" title="Logout">🚪</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
