import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const PublicRoute = ({ 
  children, 
  redirectPath = '/admin/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
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
            Checking authentication...
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
  
  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Not authenticated, show public content (login page)
  return children;
};

export default PublicRoute;
