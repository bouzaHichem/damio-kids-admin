import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminLogout from './AdminLogout';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { admin, hasPermission, hasRole } = useAdminAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊',
      current: location.pathname === '/admin/dashboard'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: '📦',
      current: location.pathname === '/admin/products',
      permission: 'read_products'
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: '🛒',
      current: location.pathname === '/admin/orders',
      permission: 'read_orders'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: '🏷️',
      current: location.pathname === '/admin/categories',
      permission: 'read_categories'
    },
    {
      name: 'Admin Users',
      href: '/admin/users',
      icon: '👥',
      current: location.pathname === '/admin/users',
      role: 'super_admin'
    }
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.role && !hasRole([item.role])) {
      return false;
    }
    return true;
  });

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">👶</span>
            <span className="logo-text">Damio Kids</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${item.current ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-text">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                {admin?.firstName?.[0]}{admin?.lastName?.[0]}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {admin?.firstName} {admin?.lastName}
                </div>
                <div className="user-role">{admin?.role}</div>
              </div>
            </div>
            <AdminLogout variant="menu-item" />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="page-title">
              {navigation.find(item => item.current)?.name || 'Admin Panel'}
            </h1>
          </div>
          <div className="top-bar-right">
            <div className="user-menu">
              <span className="welcome-text">
                Welcome, {admin?.firstName}
              </span>
              <AdminLogout variant="button" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
