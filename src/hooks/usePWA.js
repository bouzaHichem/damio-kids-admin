import { useState, useEffect, useCallback } from 'react';
import { initializePushNotifications, requestNotificationPermission, sendTokenToServer } from '../firebase/config';
import toast from 'react-hot-toast';

/**
 * Custom React Hook for PWA features and push notifications
 */
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification?.permission || 'default');
  const [fcmToken, setFcmToken] = useState(null);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Check if app is installed
  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isInWebApp);
    };

    checkIfInstalled();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkIfInstalled);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkIfInstalled);
    };
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 PWA install prompt available');
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA has been installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      toast.success('Admin Panel installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 App is online');
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 App is offline');
      toast.error('Working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker and check for updates
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered:', registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available');
                setUpdateAvailable(true);
                toast((t) => (
                  <div>
                    <strong>Update available!</strong>
                    <div style={{ marginTop: '8px' }}>
                      <button
                        onClick={() => {
                          window.location.reload();
                          toast.dismiss(t.id);
                        }}
                        style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          marginRight: '8px'
                        }}
                      >
                        Update Now
                      </button>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        Later
                      </button>
                    </div>
                  </div>
                ), { duration: 0 });
              }
            });
          });

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  // Initialize push notifications
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const result = await initializePushNotifications((payload) => {
          console.log('📨 Foreground message received:', payload);
          
          // Show toast notification for foreground messages
          const title = payload.notification?.title || 'New Notification';
          const body = payload.notification?.body || 'You have a new notification';
          
          toast((t) => (
            <div>
              <strong>{title}</strong>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>{body}</div>
              <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                  marginTop: '8px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                Dismiss
              </button>
            </div>
          ), { duration: 5000 });
        });

        if (result.success) {
          setFcmToken(result.token);
          setIsNotificationsEnabled(true);
          setNotificationPermission('granted');
          console.log('✅ Push notifications initialized');
          
          // Register token with backend
          try {
            const serverResult = await sendTokenToServer(result.token);
            if (serverResult.success) {
              console.log('✅ FCM token registered with backend');
              toast.success('Push notifications enabled!', { duration: 3000 });
            } else {
              console.warn('⚠️ Failed to register token with backend:', serverResult.error);
            }
          } catch (error) {
            console.warn('⚠️ Error registering token with backend:', error);
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize push notifications:', error);
      }
    };

    initNotifications();
  }, []);

  // Install PWA function
  const installPWA = useCallback(async () => {
    if (!installPrompt) {
      toast.error('Install not available. Try adding to home screen manually.');
      return false;
    }

    try {
      const result = await installPrompt.prompt();
      console.log('📱 Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        toast.success('Installing app...');
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      } else {
        toast.error('Installation cancelled');
        return false;
      }
    } catch (error) {
      console.error('❌ Error installing PWA:', error);
      toast.error('Installation failed');
      return false;
    }
  }, [installPrompt]);

  // Request notification permissions
  const requestNotifications = useCallback(async () => {
    try {
      const result = await requestNotificationPermission();
      
      if (result.success) {
        setFcmToken(result.token);
        setIsNotificationsEnabled(true);
        setNotificationPermission('granted');
        
        // Register token with backend
        try {
          const serverResult = await sendTokenToServer(result.token);
          if (serverResult.success) {
            toast.success('Notifications enabled! You\'ll receive alerts for new orders.');
          } else {
            toast.success('Notifications enabled locally, but backend registration failed.');
          }
        } catch (error) {
          console.warn('⚠️ Error registering token with backend:', error);
          toast.success('Notifications enabled locally.');
        }
        
        return true;
      } else {
        setNotificationPermission(result.permission || 'denied');
        toast.error(result.error || 'Failed to enable notifications');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notifications:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, []);

  // Show manual install instructions
  const showInstallInstructions = useCallback(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = 'To install this app:\n\n';
    
    if (isIOS) {
      instructions += '1. Tap the Share button (square with arrow)\n';
      instructions += '2. Tap "Add to Home Screen"\n';
      instructions += '3. Tap "Add" to confirm';
    } else if (isAndroid) {
      instructions += '1. Tap the menu button (⋮)\n';
      instructions += '2. Tap "Add to Home screen"\n';
      instructions += '3. Tap "Add" to confirm';
    } else {
      instructions += '1. Look for the install icon in your address bar\n';
      instructions += '2. Click it and select "Install"\n';
      instructions += '3. Or use your browser\'s menu to "Install App"';
    }
    
    toast((t) => (
      <div style={{ whiteSpace: 'pre-line', maxWidth: '300px' }}>
        <strong>Install Instructions</strong>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>{instructions}</div>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            marginTop: '8px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          Got it
        </button>
      </div>
    ), { duration: 0 });
  }, []);

  // Update app
  const updateApp = useCallback(() => {
    window.location.reload();
  }, []);

  // Get PWA status summary
  const getPWAStatus = useCallback(() => {
    return {
      isInstalled,
      isInstallable,
      isOnline,
      notificationPermission,
      isNotificationsEnabled,
      updateAvailable,
      fcmToken: fcmToken ? fcmToken.substring(0, 20) + '...' : null
    };
  }, [isInstalled, isInstallable, isOnline, notificationPermission, isNotificationsEnabled, updateAvailable, fcmToken]);

  return {
    // State
    isInstallable,
    isInstalled,
    isOnline,
    notificationPermission,
    isNotificationsEnabled,
    updateAvailable,
    fcmToken,

    // Actions
    installPWA,
    requestNotifications,
    showInstallInstructions,
    updateApp,
    getPWAStatus
  };
};

export default usePWA;