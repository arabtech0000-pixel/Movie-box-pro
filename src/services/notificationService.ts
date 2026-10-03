import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type?: 'film' | 'zap' | 'crown' | 'bell';
  unread: boolean;
  createdAt?: string;
}

const NOTIFS_STORAGE_KEY = 'mb_app_notifications';
const PUSH_PERM_KEY = 'mb_push_enabled';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'Dune: Part Two Now Available in 4K',
    desc: 'The epic sci-fi sequel is now streaming in 1080P Ultra HD and 4K HDR with surround audio.',
    time: '12m ago',
    type: 'film',
    unread: true,
  },
  {
    id: 'n-2',
    title: 'VidSrc Ultra Stream Online',
    desc: 'High-speed cloud servers connected with zero buffering. Enjoy seamless movie playback.',
    time: '2h ago',
    type: 'zap',
    unread: true,
  },
  {
    id: 'n-3',
    title: 'New DC & Marvel Character Avatars Added',
    desc: 'Customize your profile with official Batman, Superman, Wonder Woman, Spider-Man and Iron Man avatars.',
    time: 'Yesterday',
    type: 'bell',
    unread: false,
  },
];

/**
 * Request device push notification permissions from the browser / mobile OS
 */
export async function requestDeviceNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(PUSH_PERM_KEY, permission);
      return permission;
    } catch (e) {
      console.warn('Error requesting device notification permission:', e);
    }
  }
  return 'denied';
}

/**
 * Request permission and trigger a test notification directly into phone top bar
 */
export async function requestAndEnablePushNotifications(): Promise<NotificationPermission> {
  const perm = await requestDeviceNotificationPermission();
  if (perm === 'granted') {
    triggerNativeDeviceNotification(
      '🎬 MovieBox Pro Activated',
      'Push alerts are enabled! You will receive new movie releases and updates on your phone status bar.'
    );
  }
  return perm;
}

/**
 * Check current device notification permission status
 */
export function getDeviceNotificationPermission(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

/**
 * Trigger native mobile / desktop notification that appears in the top status bar / drawer of the phone
 */
export function triggerNativeDeviceNotification(
  title: string,
  body: string,
  icon = '/pwa-192x192.png'
) {
  if (typeof window === 'undefined') return;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            const options: any = {
              body,
              icon,
              badge: icon,
              vibrate: [200, 100, 200, 100, 200],
              tag: 'mb-push-' + Date.now(),
              renotify: true,
            };
            reg.showNotification(title, options);
          })
          .catch(() => {
            new Notification(title, { body, icon });
          });
      } else {
        new Notification(title, { body, icon });
      }
    } catch (e) {
      try {
        new Notification(title, { body, icon });
      } catch (err) {}
    }
  }
}

export function getLocalNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse local notifications:', err);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveLocalNotifications(notifications: AppNotification[], notifyEvent = true) {
  try {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications));
    if (notifyEvent) {
      window.dispatchEvent(new CustomEvent('mb_notifications_updated', { detail: notifications }));
    }
  } catch (err) {
    console.warn('Failed to save local notifications:', err);
  }
}

export function subscribeNotifications(callback: (notifications: AppNotification[]) => void): () => void {
  callback(getLocalNotifications());

  const handleUpdate = (e: Event) => {
    const custom = e as CustomEvent<AppNotification[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getLocalNotifications());
    }
  };

  window.addEventListener('mb_notifications_updated', handleUpdate);

  try {
    const notifsRef = ref(database, 'system/notifications');
    const unsubscribe = onValue(
      notifsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          let list: AppNotification[] = [];
          if (Array.isArray(val)) {
            list = val.filter(Boolean);
          } else if (typeof val === 'object') {
            list = Object.values(val);
          }
          if (list.length > 0) {
            saveLocalNotifications(list, false);
            callback(list);
          }
        }
      },
      (err) => {
        console.warn('RTDB notifications notice:', err);
      }
    );

    return () => {
      window.removeEventListener('mb_notifications_updated', handleUpdate);
      unsubscribe();
    };
  } catch (err) {
    return () => {
      window.removeEventListener('mb_notifications_updated', handleUpdate);
    };
  }
}

/**
 * Listen for live push broadcasts from Firebase RTDB across all connected devices
 */
export function subscribeLivePushBroadcasts(callback: (notif: AppNotification) => void): () => void {
  try {
    const latestPushRef = ref(database, 'system/latest_push');
    let isFirstMount = true;

    const unsubscribe = onValue(
      latestPushRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const notif = snapshot.val() as AppNotification;
          if (notif && notif.title) {
            // Trigger native phone top bar notification
            triggerNativeDeviceNotification(notif.title, notif.desc);

            // Also dispatch window event for top drawer banner in mobile frame
            window.dispatchEvent(new CustomEvent('mb_push_received', { detail: notif }));

            if (!isFirstMount) {
              callback(notif);
            }
          }
        }
        isFirstMount = false;
      },
      (err) => {
        console.warn('Live push RTDB listener error:', err);
      }
    );

    return () => unsubscribe();
  } catch (err) {
    return () => {};
  }
}

/**
 * Broadcast push notification to all devices & users via Firebase RTDB
 */
export async function broadcastPushNotification(
  title: string,
  desc: string,
  type: 'film' | 'zap' | 'crown' | 'bell' = 'bell'
): Promise<AppNotification> {
  const newNotif: AppNotification = {
    id: 'push-' + Date.now(),
    title: title.trim(),
    desc: desc.trim(),
    time: 'Just now',
    type,
    unread: true,
    createdAt: new Date().toISOString(),
  };

  const current = getLocalNotifications();
  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)];

  saveLocalNotifications(updated, true);

  // Trigger device notification on this device top status bar
  triggerNativeDeviceNotification(newNotif.title, newNotif.desc);

  // Sync list and latest_push to Firebase RTDB so all other devices receive it
  try {
    const notifsRef = ref(database, 'system/notifications');
    await set(notifsRef, updated);

    const latestPushRef = ref(database, 'system/latest_push');
    await set(latestPushRef, newNotif);
  } catch (err) {
    console.warn('Sync push notification to RTDB failed:', err);
  }

  // Trigger in-app top notification bar
  window.dispatchEvent(new CustomEvent('mb_push_received', { detail: newNotif }));
  return newNotif;
}
