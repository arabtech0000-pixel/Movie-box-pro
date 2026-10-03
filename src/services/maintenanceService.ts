import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';

export interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  updatedAt?: string;
}

const MAINTENANCE_STORAGE_KEY = 'mb_maintenance_status';

export const DEFAULT_MAINTENANCE_STATUS: MaintenanceStatus = {
  enabled: false,
  message: 'Our system is currently under maintenance. Please check back shortly.',
};

export function getLocalMaintenanceStatus(): MaintenanceStatus {
  try {
    const raw = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          enabled: Boolean(parsed.enabled),
          message: parsed.message || DEFAULT_MAINTENANCE_STATUS.message,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse local maintenance status:', err);
  }
  return DEFAULT_MAINTENANCE_STATUS;
}

export function saveLocalMaintenanceStatus(status: MaintenanceStatus, notifyEvent = true) {
  try {
    localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(status));
    if (notifyEvent) {
      window.dispatchEvent(new CustomEvent('mb_maintenance_updated', { detail: status }));
    }
  } catch (err) {
    console.warn('Failed to save maintenance status:', err);
  }
}

export function subscribeMaintenanceStatus(callback: (status: MaintenanceStatus) => void): () => void {
  callback(getLocalMaintenanceStatus());

  const handleUpdate = (e: Event) => {
    const custom = e as CustomEvent<MaintenanceStatus>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getLocalMaintenanceStatus());
    }
  };

  window.addEventListener('mb_maintenance_updated', handleUpdate);

  try {
    const maintRef = ref(database, 'system/maintenance');
    const unsubscribe = onValue(
      maintRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (typeof val === 'object' && val !== null) {
            const nextStatus: MaintenanceStatus = {
              enabled: Boolean(val.enabled),
              message: val.message || DEFAULT_MAINTENANCE_STATUS.message,
              updatedAt: val.updatedAt,
            };
            saveLocalMaintenanceStatus(nextStatus, false);
            callback(nextStatus);
          }
        }
      },
      (err) => {
        console.warn('RTDB maintenance sub notice:', err);
      }
    );

    return () => {
      window.removeEventListener('mb_maintenance_updated', handleUpdate);
      unsubscribe();
    };
  } catch (err) {
    return () => {
      window.removeEventListener('mb_maintenance_updated', handleUpdate);
    };
  }
}

export async function setMaintenanceStatus(enabled: boolean, message?: string): Promise<MaintenanceStatus> {
  const nextStatus: MaintenanceStatus = {
    enabled,
    message: message?.trim() || 'Our system is currently under maintenance. Please check back shortly.',
    updatedAt: new Date().toISOString(),
  };

  saveLocalMaintenanceStatus(nextStatus, true);

  try {
    const maintRef = ref(database, 'system/maintenance');
    await set(maintRef, nextStatus);
  } catch (err) {
    console.warn('Failed to sync maintenance status to RTDB:', err);
  }

  return nextStatus;
}
