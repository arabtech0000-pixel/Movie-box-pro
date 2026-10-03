import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  push,
  remove,
  update,
  DatabaseReference,
} from 'firebase/database';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAHHiiAieJbHmKOlMDeEs3XeGdhQJ2UtlQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "streamverse-17a15.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://streamverse-17a15-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "streamverse-17a15",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "streamverse-17a15.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "389442199565",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:389442199565:web:da6c71fc739bee70b1f544",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KY4QVC3V8R",
};

// Initialize Firebase safely (avoid multi-initialization in HMR / dev reload)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Export Auth functions
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
};

export type { FirebaseUser };

// Realtime Database helpers for Streamverse / MovieBox
export interface UserDbData {
  username?: string;
  email?: string;
  movieBoxId?: string;
  plan?: 'Free Plan' | 'VIP Premium';
  avatarUrl?: string;
  lastActive?: string;
  bookmarks?: Record<string, any>;
  downloads?: Record<string, any>;
}

/**
 * Saves or updates user profile in Realtime Database under users/{uid}/profile
 */
export async function saveUserProfileToRtdb(
  uid: string,
  profile: {
    username: string;
    email?: string;
    movieBoxId: string;
    avatarUrl: string;
    plan: 'Free Plan' | 'VIP Premium';
  }
) {
  try {
    const profileRef = ref(database, `users/${uid}/profile`);
    await update(profileRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('saveUserProfileToRtdb note:', err);
  }
}

/**
 * Syncs user's bookmarks list in Realtime Database under users/{uid}/bookmarks
 */
export async function syncBookmarksToRtdb(uid: string, bookmarks: any[]) {
  const bookmarksRef = ref(database, `users/${uid}/bookmarks`);
  await set(bookmarksRef, bookmarks);
}

/**
 * Syncs user's downloads in Realtime Database under users/{uid}/downloads
 */
export async function syncDownloadsToRtdb(uid: string, downloads: any[]) {
  const downloadsRef = ref(database, `users/${uid}/downloads`);
  await set(downloadsRef, downloads);
}

/**
 * Subscribes to user profile, bookmarks, and downloads from Realtime Database
 */
export function subscribeToUserData(
  uid: string,
  callbacks: {
    onProfile?: (data: any) => void;
    onBookmarks?: (bookmarks: any[]) => void;
    onDownloads?: (downloads: any[]) => void;
  }
) {
  const profileRef = ref(database, `users/${uid}/profile`);
  const bookmarksRef = ref(database, `users/${uid}/bookmarks`);
  const downloadsRef = ref(database, `users/${uid}/downloads`);

  const unsubProfile = onValue(profileRef, (snapshot) => {
    if (callbacks.onProfile) {
      callbacks.onProfile(snapshot.val());
    }
  });

  const unsubBookmarks = onValue(bookmarksRef, (snapshot) => {
    if (callbacks.onBookmarks) {
      const val = snapshot.val();
      callbacks.onBookmarks(Array.isArray(val) ? val : (val ? Object.values(val) : []));
    }
  });

  const unsubDownloads = onValue(downloadsRef, (snapshot) => {
    if (callbacks.onDownloads) {
      const val = snapshot.val();
      callbacks.onDownloads(Array.isArray(val) ? val : (val ? Object.values(val) : []));
    }
  });

  return () => {
    unsubProfile();
    unsubBookmarks();
    unsubDownloads();
  };
}

/**
 * Updates user presence (online/offline) in Realtime Database under users/{uid}/presence
 */
export async function trackUserPresence(uid: string, isOnline: boolean = true) {
  try {
    const presenceRef = ref(database, `users/${uid}/presence`);
    await set(presenceRef, {
      online: isOnline,
      lastSeen: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Presence tracking error:', err);
  }
}

/**
 * Subscribes to ALL users in Realtime Database for the Admin Panel
 */
export function subscribeToAllUsers(callback: (users: any[]) => void) {
  const usersRef = ref(database, 'users');
  return onValue(usersRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }

    const userList: any[] = [];
    Object.keys(val).forEach((uid) => {
      const uData = val[uid];
      if (uData) {
        const profile = uData.profile || uData;
        if (profile && (profile.username || profile.movieBoxId)) {
          userList.push({
            uid,
            username: profile.username || 'MovieFan',
            email: profile.email || `${profile.movieBoxId || uid}@moviebox.app`,
            movieBoxId: profile.movieBoxId || 'MB-001',
            plan: profile.plan || 'Free Plan',
            avatarUrl: profile.avatarUrl || '/avatars/simba.webp',
            status: profile.status || 'Active',
            presence: uData.presence || { online: false, lastSeen: profile.updatedAt },
            bookmarksCount: uData.bookmarks ? (Array.isArray(uData.bookmarks) ? uData.bookmarks.length : Object.keys(uData.bookmarks).length) : 0,
            downloadsCount: uData.downloads ? (Array.isArray(uData.downloads) ? uData.downloads.length : Object.keys(uData.downloads).length) : 0,
          });
        }
      }
    });

    callback(userList);
  });
}

/**
 * Admin helper to update any user profile in RTDB
 */
export async function adminUpdateUserInRtdb(uid: string, updates: Record<string, any>) {
  try {
    const profileRef = ref(database, `users/${uid}/profile`);
    await update(profileRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    // Also update root user node if profile was stored at root
    const rootUserRef = ref(database, `users/${uid}`);
    await update(rootUserRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('adminUpdateUserInRtdb note:', err);
  }
}

/**
 * Listen to global Realtime Database connection status (.info/connected)
 */
export function subscribeToConnectionStatus(callback: (connected: boolean) => void) {
  const connectedRef = ref(database, '.info/connected');
  return onValue(connectedRef, (snap) => {
    callback(snap.val() === true);
  });
}
