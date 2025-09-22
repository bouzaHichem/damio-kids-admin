// Firebase Messaging Service Worker for Background Push Notifications
// This file must be at the root level (public folder)

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - Damio Kids Admin config
const firebaseConfig = {
  apiKey: "AIzaSyDENBudkzlpnz4tThml9_iT74pre5-UMTI",
  authDomain: "damiokids-admin.firebaseapp.com",
  projectId: "damiokids-admin",
  storageBucket: "damiokids-admin.firebasestorage.app",
  messagingSenderId: "364049567310",
  appId: "1:364049567310:web:ab103cd7e18f0a97b83d1f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📱 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Damio Kids Admin';
  const notificationOptions = {
    body: payload.notification?.body || 'New notification received',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/favicon.ico',
    tag: payload.data?.tag || 'admin-notification',
    data: {
      ...payload.data,
      url: payload.data?.url || '/',
      timestamp: Date.now()
    },
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ],
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    silent: false,
    renotify: true
  };

  // Customize notification based on payload data
  if (payload.data) {
    if (payload.data.type === 'new-order') {
      notificationOptions.body = `New order #${payload.data.orderNumber} - ${payload.data.total || 'Amount'} DZD`;
      notificationOptions.icon = '/icon-192x192.png';
      notificationOptions.tag = 'new-order';
      notificationOptions.data.url = `/orders/${payload.data.orderId}`;
      notificationOptions.requireInteraction = true;
      
      // High priority for new orders
      notificationOptions.vibrate = [200, 100, 200, 100, 200];
    } else if (payload.data.type === 'order-update') {
      notificationOptions.body = `Order #${payload.data.orderNumber} status updated`;
      notificationOptions.tag = 'order-update';
      notificationOptions.data.url = `/orders/${payload.data.orderId}`;
    } else if (payload.data.type === 'low-stock') {
      notificationOptions.body = `Low stock alert: ${payload.data.productName}`;
      notificationOptions.tag = 'low-stock';
      notificationOptions.data.url = `/products/${payload.data.productId}`;
    }
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event);
  
  event.notification.close();

  // Handle action buttons
  if (event.action === 'dismiss') {
    return;
  }

  // Get URL to open
  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            if (client.navigate) {
              return client.navigate(urlToOpen);
            }
            return;
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('❌ Error handling notification click:', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification closed:', event);
  
  // Track notification close events if needed
  // You could send analytics data here
});

console.log('🔥 Firebase Messaging Service Worker loaded and ready!');