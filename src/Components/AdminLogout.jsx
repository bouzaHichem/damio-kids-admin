import React, { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import './AdminLogout.css';

const AdminLogout = ({ 
  variant = 'button', // 'button' | 'menu-item' | 'icon'
  size = 'medium', // 'small' | 'medium' | 'large'
  showConfirmation = true,
  onLogout = null // Callback after successful logout
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { logout, admin } = useAdminAuth();
  
  const handleLogoutClick = () => {
    if (showConfirmation) {
      setShowConfirmModal(true);
    } else {
      performLogout();
    }
  };
  
  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      
      // Call callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Redirect will be handled by the auth system
    } catch (error) {
      console.error('Logout failed:', error);
      // Auth system will handle the cleanup even if API call fails
    } finally {
      setIsLoggingOut(false);
      setShowConfirmModal(false);
    }
  };
  
  const handleConfirmLogout = () => {
    performLogout();
  };
  
  const handleCancelLogout = () => {
    setShowConfirmModal(false);
  };
  
  // Different variants of the logout component
  const renderLogoutButton = () => {
    const baseClassName = `admin-logout admin-logout--${variant} admin-logout--${size}`;
    const isDisabled = isLoggingOut;
    
    switch (variant) {
      case 'icon':
        return (
          <button
            className={`${baseClassName} ${isDisabled ? 'admin-logout--disabled' : ''}`}
            onClick={handleLogoutClick}
            disabled={isDisabled}
            title="Logout"
            aria-label="Logout"
          >
            {isLoggingOut ? (
              <svg className="admin-logout__spinner" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="admin-logout__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
          </button>
        );
      
      case 'menu-item':
        return (
          <button
            className={`${baseClassName} ${isDisabled ? 'admin-logout--disabled' : ''}`}
            onClick={handleLogoutClick}
            disabled={isDisabled}
          >
            <svg className="admin-logout__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="admin-logout__text">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        );
      
      default: // button
        return (
          <button
            className={`${baseClassName} ${isDisabled ? 'admin-logout--disabled' : ''}`}
            onClick={handleLogoutClick}
            disabled={isDisabled}
          >
            {isLoggingOut ? (
              <>
                <svg className="admin-logout__spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <svg className="admin-logout__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </>
            )}
          </button>
        );
    }
  };
  
  return (
    <>
      {renderLogoutButton()}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="admin-logout-modal">
          <div className="admin-logout-modal__backdrop" onClick={handleCancelLogout} />
          <div className="admin-logout-modal__content">
            <div className="admin-logout-modal__header">
              <h3 className="admin-logout-modal__title">Confirm Logout</h3>
            </div>
            
            <div className="admin-logout-modal__body">
              <p>Are you sure you want to logout?</p>
              {admin && (
                <p className="admin-logout-modal__user-info">
                  Signed in as <strong>{admin.firstName} {admin.lastName}</strong> ({admin.email})
                </p>
              )}
            </div>
            
            <div className="admin-logout-modal__footer">
              <button
                className="admin-logout-modal__button admin-logout-modal__button--cancel"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className="admin-logout-modal__button admin-logout-modal__button--confirm"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <svg className="admin-logout__spinner" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </>
                ) : (
                  'Yes, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLogout;
