import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  fallbackPath = '/admin/login',
  showLoading = true 
}) => {
  const { isAuthenticated, isLoading, admin, hasPermission, hasRole } = useAdminAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (isLoading && showLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            Verifying authentication...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // If not authenticated, redirect to login with current location
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }
  
  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#fef2f2',
          color: '#dc2626'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            padding: '2rem'
          }}>
            <svg 
              style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>Access Denied</h2>
            <p style={{ margin: '0 0 1rem', color: '#7f1d1d' }}>
              You don't have the required permissions to access this page.
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>
              Required permissions: {requiredPermissions.join(', ')}
            </p>
            {admin && (
              <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: '#991b1b' }}>
                Your permissions: {admin.permissions?.join(', ') || 'None'}
              </p>
            )}
          </div>
        </div>
      );
    }
  }
  
  // Check required roles
  if (requiredRoles.length > 0) {
    const hasValidRole = hasRole(requiredRoles);
    
    if (!hasValidRole) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#fef2f2',
          color: '#dc2626'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            padding: '2rem'
          }}>
            <svg 
              style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>Access Denied</h2>
            <p style={{ margin: '0 0 1rem', color: '#7f1d1d' }}>
              You don't have the required role to access this page.
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>
              Required roles: {requiredRoles.join(', ')}
            </p>
            {admin && (
              <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: '#991b1b' }}>
                Your role: {admin.role}
              </p>
            )}
          </div>
        </div>
      );
    }
  }
  
  // All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;
