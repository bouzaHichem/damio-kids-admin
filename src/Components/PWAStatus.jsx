import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import './PWAStatus.css';

const PWAStatus = () => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    notificationPermission,
    isNotificationsEnabled,
    updateAvailable,
    installPWA,
    requestNotifications,
    showInstallInstructions,
    updateApp,
    getPWAStatus
  } = usePWA();

  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    if (!isOnline) return '🔴';
    if (isInstalled && isNotificationsEnabled) return '🟢';
    if (isInstalled || isNotificationsEnabled) return '🟡';
    return '⚪';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isInstalled && isNotificationsEnabled) return 'Fully Configured';
    if (isInstalled) return 'Installed';
    if (isNotificationsEnabled) return 'Notifications On';
    return 'Web App';
  };

  return (
    <div className="pwa-status">
      {/* Status Indicator */}
      <div 
        className="pwa-status-indicator"
        onClick={() => setShowDetails(!showDetails)}
        title="PWA Status - Click for details"
      >
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
        {updateAvailable && <span className="update-dot">🔄</span>}
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="pwa-details-panel">
          <div className="pwa-header">
            <h3>📱 PWA Status</h3>
            <button 
              className="close-btn"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </button>
          </div>

          <div className="pwa-details">
            {/* Online Status */}
            <div className="status-item">
              <span className="status-label">Connection:</span>
              <span className={`status-value ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? '🌐 Online' : '📴 Offline'}
              </span>
            </div>

            {/* Installation Status */}
            <div className="status-item">
              <span className="status-label">Installation:</span>
              <span className={`status-value ${isInstalled ? 'installed' : 'not-installed'}`}>
                {isInstalled ? '✅ Installed' : '📱 Not Installed'}
              </span>
            </div>

            {/* Notifications Status */}
            <div className="status-item">
              <span className="status-label">Notifications:</span>
              <span className={`status-value ${isNotificationsEnabled ? 'enabled' : 'disabled'}`}>
                {isNotificationsEnabled ? '🔔 Enabled' : '🔕 Disabled'}
              </span>
            </div>

            {/* Update Status */}
            {updateAvailable && (
              <div className="status-item">
                <span className="status-label">Update:</span>
                <span className="status-value update-available">
                  🔄 Available
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pwa-actions">
            {/* Install Button */}
            {isInstallable && !isInstalled && (
              <button 
                className="pwa-btn primary"
                onClick={installPWA}
              >
                📱 Install App
              </button>
            )}

            {/* Manual Install Instructions */}
            {!isInstallable && !isInstalled && (
              <button 
                className="pwa-btn secondary"
                onClick={showInstallInstructions}
              >
                📋 Install Instructions
              </button>
            )}

            {/* Enable Notifications */}
            {!isNotificationsEnabled && notificationPermission !== 'denied' && (
              <button 
                className="pwa-btn primary"
                onClick={requestNotifications}
              >
                🔔 Enable Notifications
              </button>
            )}

            {/* Notifications Denied */}
            {notificationPermission === 'denied' && (
              <div className="notification-denied">
                <p>🔕 Notifications blocked</p>
                <p className="help-text">
                  Enable in browser settings to receive order alerts
                </p>
              </div>
            )}

            {/* Update Button */}
            {updateAvailable && (
              <button 
                className="pwa-btn primary"
                onClick={updateApp}
              >
                🔄 Update Now
              </button>
            )}
          </div>

          {/* Success State */}
          {isInstalled && isNotificationsEnabled && (
            <div className="success-state">
              <div className="success-icon">🎉</div>
              <p><strong>Perfect Setup!</strong></p>
              <p>You'll receive instant notifications for new orders</p>
            </div>
          )}

          {/* Debug Info (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="debug-info">
              <summary>🐛 Debug Info</summary>
              <pre>{JSON.stringify(getPWAStatus(), null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default PWAStatus;