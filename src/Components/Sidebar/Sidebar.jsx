import React, { useState, useEffect } from 'react'
import './Sidebar.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose()
    }
  }, [location.pathname])

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileOpen && onMobileClose) {
        onMobileClose()
      }
    }

    if (mobileOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when mobile sidebar is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen, onMobileClose])

  const menuItems = [
    // Dashboard & Analytics
    {
      path: '/analytics',
      icon: '📊',
      label: 'Analytics',
      description: 'Business insights & reports',
      section: 'dashboard'
    },
    
    // Product Management
    {
      path: '/addproduct',
      icon: '📦',
      label: 'Add Product',
      description: 'Create new products',
      section: 'products'
    },
    {
      path: '/listproduct',
      icon: '📋',
      label: 'Product List',
      description: 'Manage all products',
      section: 'products'
    },
    {
      path: '/inventory',
      icon: '📦',
      label: 'Inventory',
      description: 'Stock management & alerts',
      section: 'products'
    },
    
    // Order Management
    {
      path: '/OrderList',
      icon: '🛒',
      label: 'Orders',
      description: 'View and manage orders',
      section: 'orders'
    },
    {
      path: '/DeliveryManagement',
      icon: '🚚',
      label: 'Delivery',
      description: 'Manage deliveries',
      section: 'orders'
    },
    
    // Content Management
    {
      path: '/categorymanagement',
      icon: '🏷️',
      label: 'Categories',
      description: 'Organize product categories',
      section: 'content'
    },
    {
      path: '/shopimagemanagement',
      icon: '🖼️',
      label: 'Shop Images',
      description: 'Manage shop visuals',
      section: 'content'
    },
    {
      path: '/collectionsmanagement',
      icon: '📚',
      label: 'Collections',
      description: 'Manage product collections',
      section: 'content'
    },
    
    // Communication
    {
      path: '/email-notifications',
      icon: '📧',
      label: 'Email Notifications',
      description: 'Email management & templates',
      section: 'communication'
    },
    
    // Settings
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'Admin profile & account settings',
      section: 'settings'
    }
  ]

  const menuSections = {
    dashboard: 'DASHBOARD',
    products: 'PRODUCTS',
    orders: 'ORDERS',
    content: 'CONTENT',
    communication: 'COMMUNICATION',
    settings: 'SETTINGS'
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force navigation even if logout fails
      navigate('/admin/login')
    }
  }

  // Handle settings navigation
  const handleSettings = () => {
    navigate('/settings')
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`sidebar ${
          collapsed ? 'collapsed' : ''
        } ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon" role="img" aria-label="Crown">👑</span>
            {!collapsed && (
              <div className="logo-text">
                <h3>Damio Kids</h3>
                <span>Admin Panel</span>
              </div>
            )}
          </div>
          
          {/* Desktop Collapse Button */}
          <button 
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
          
          {/* Mobile Close Button */}
          <button 
            className="close-btn"
            onClick={onMobileClose}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            ✕
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
            <div className="user-avatar">
              {admin?.profileIcon ? (
                <img src={admin.profileIcon} alt="Profile" />
              ) : (
                '👨‍💼'
              )}
            </div>
            <div className="user-details">
              <span className="user-name">
                {admin ? `${admin.firstName} ${admin.lastName}` : 'Admin User'}
              </span>
              <span className="user-role">
                {admin?.role === 'super_admin' ? 'Super Admin' : 
                 admin?.role === 'admin' ? 'Administrator' : 
                 admin?.role === 'moderator' ? 'Moderator' : 'Admin'}
              </span>
            </div>
          </div>
          <div className="footer-actions">
            <button 
              className="footer-btn" 
              title="Settings"
              onClick={handleSettings}
            >
              ⚙️
            </button>
            <button 
              className="footer-btn" 
              title="Logout"
              onClick={handleLogout}
            >
              🚪
            </button>
          </div>
        </div>
      )}
      </aside>
    </>
  )
}

export default Sidebar
