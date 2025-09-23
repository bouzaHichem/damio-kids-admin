// Firebase Configuration for Damio Kids Admin PWA
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - Using environment variables for security
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// VAPID key - Get this from Firebase Console > Project Settings > Cloud Messaging
// If not set, notifications will still work but you need to get and set this for production
const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || null;

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Requesting notification permission...');
    
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.error('❌ This browser does not support notifications');
      return { success: false, error: 'Browser does not support notifications' };
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('❌ This browser does not support service workers');
      return { success: false, error: 'Browser does not support service workers' };
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get registration token
      const tokenOptions = {
        serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
      };
      
      // Add VAPID key only if available
      if (vapidKey) {
        tokenOptions.vapidKey = vapidKey;
      }
      
      const currentToken = await getToken(messaging, tokenOptions);
      
      if (currentToken) {
        console.log('🎯 FCM Registration Token:', currentToken);
        return { 
          success: true, 
          token: currentToken,
          permission: 'granted'
        };
      } else {
        console.warn('⚠️ No registration token available');
        return { 
          success: false, 
          error: 'No registration token available' 
        };
      }
    } else if (permission === 'denied') {
      console.warn('❌ Notification permission denied');
      return { 
        success: false, 
        error: 'Notification permission denied',
        permission: 'denied'
      };
    } else {
      console.warn('⚠️ Notification permission dismissed');
      return { 
        success: false, 
        error: 'Notification permission dismissed',
        permission: 'default'
      };
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Get current token
export const getCurrentToken = async () => {
  try {
    const tokenOptions = {
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
    };
    
    if (vapidKey) {
      tokenOptions.vapidKey = vapidKey;
    }
    
    const currentToken = await getToken(messaging, tokenOptions);
    
    if (currentToken) {
      console.log('📱 Current FCM token:', currentToken);
      return currentToken;
    } else {
      console.warn('⚠️ No registration token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting current token:', error);
    return null;
  }
};

// Handle incoming messages when the app is in the foreground
export const setupForegroundMessageHandler = (onMessageReceived) => {
  onMessage(messaging, (payload) => {
    console.log('📨 Message received in foreground:', payload);
    
    const notificationTitle = payload.notification?.title || 'Damio Kids Admin';
    const notificationOptions = {
      body: payload.notification?.body || 'New notification received',
      icon: payload.notification?.icon || '/icon-192x192.png',
      badge: '/favicon.ico',
      tag: payload.data?.tag || 'admin-notification',
      data: payload.data || {},
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    // Show notification if page is not visible
    if (document.hidden) {
      new Notification(notificationTitle, notificationOptions);
    } else {
      // App is in foreground, handle the message
      if (onMessageReceived) {
        onMessageReceived(payload);
      }
      
      // Still show notification for important messages
      if (payload.data?.priority === 'high') {
        new Notification(notificationTitle, notificationOptions);
      }
    }
  });
};

// Send device token to backend
export const sendTokenToServer = async (token) => {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    const adminToken =
      localStorage.getItem('adminToken') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('admin-token') ||
      localStorage.getItem('auth-token'); // support multiple keys
    
    console.log('📤 Sending FCM token to backend...');
    
    const response = await fetch(`${backendUrl}/api/admin/fcm/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fcmToken: token,
        deviceType: 'web',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ FCM token sent to backend successfully');
      localStorage.setItem('fcm-token-sent', 'true');
      localStorage.setItem('fcm-token', token);
      return { success: true };
    } else {
      console.error('❌ Failed to send FCM token to backend:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Error sending FCM token to backend:', error);
    return { success: false, error: error.message };
  }
};

// Check if token needs to be refreshed
export const checkTokenRefresh = async () => {
  try {
    const currentToken = await getCurrentToken();
    const storedToken = localStorage.getItem('fcm-token');
    
    if (currentToken && currentToken !== storedToken) {
      console.log('🔄 FCM token refreshed, sending to backend...');
      await sendTokenToServer(currentToken);
    }
    
    return currentToken;
  } catch (error) {
    console.error('❌ Error checking token refresh:', error);
    return null;
  }
};

// Initialize push notifications
export const initializePushNotifications = async (onMessageReceived) => {
  try {
    console.log('🚀 Initializing push notifications...');
    
    // Request permission and get token
    const result = await requestNotificationPermission();
    
    if (result.success) {
      // Send token to backend
      await sendTokenToServer(result.token);
      
      // Set up foreground message handler
      setupForegroundMessageHandler(onMessageReceived);
      
      // Check for token refresh periodically
      setInterval(checkTokenRefresh, 60000); // Check every minute
      
      console.log('✅ Push notifications initialized successfully');
      return { success: true, token: result.token };
    } else {
      console.warn('⚠️ Failed to initialize push notifications:', result.error);
      return result;
    }
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
    return { success: false, error: error.message };
  }
};

export { messaging };
export default app;