// Frontend Web Push fallback for browsers where FCM is not supported (e.g., iOS Safari)
// Usage: call tryWebPushFallback() after attempting FCM

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
};

export const isLikelyIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export async function tryWebPushFallback() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      console.warn('Web Push not supported in this browser');
      return { success: false, reason: 'unsupported' };
    }

    // If permission not granted, request it
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      return { success: false, reason: 'permission-denied' };
    }

    const registration = await navigator.serviceWorker.ready;
    const pubKey = process.env.REACT_APP_WEBPUSH_VAPID_PUBLIC_KEY;
    if (!pubKey) {
      console.warn('Missing REACT_APP_WEBPUSH_VAPID_PUBLIC_KEY');
      return { success: false, reason: 'missing-public-key' };
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pubKey)
      });
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const adminToken = localStorage.getItem('admin-token') || localStorage.getItem('auth-token');
    const res = await fetch(`${backendUrl}/api/admin/webpush/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ subscription, deviceType: isLikelyIOS() ? 'ios-pwa' : 'web', userAgent: navigator.userAgent })
    });
    const data = await res.json();
    if (!data.success) {
      console.warn('Web Push subscribe failed:', data.error);
      return { success: false, reason: 'subscribe-failed' };
    }

    return { success: true };
  } catch (e) {
    console.warn('Web Push fallback error:', e);
    return { success: false, reason: e.message };
  }
}
