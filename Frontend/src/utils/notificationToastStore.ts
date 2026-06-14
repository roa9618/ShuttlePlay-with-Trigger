import { useSyncExternalStore } from 'react';
import type { NotificationItemResponse } from './notificationApi';

export type NotificationToast = NotificationItemResponse & {
  toastId: number;
};

const MAX_VISIBLE_TOASTS = 3;

let nextToastId = 1;
let visibleToasts: NotificationToast[] = [];
let queuedToasts: NotificationToast[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return visibleToasts;
}

function promoteQueuedToasts() {
  while (visibleToasts.length < MAX_VISIBLE_TOASTS && queuedToasts.length > 0) {
    const nextToast = queuedToasts.shift();

    if (nextToast) {
      visibleToasts = [...visibleToasts, nextToast];
    }
  }
}

export function useNotificationToasts() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function enqueueNotificationToast(notification: NotificationItemResponse) {
  const toast = {
    ...notification,
    toastId: nextToastId++,
  };

  if (visibleToasts.length < MAX_VISIBLE_TOASTS) {
    visibleToasts = [...visibleToasts, toast];
  } else {
    queuedToasts = [...queuedToasts, toast];
  }

  emitChange();
}

export function dismissNotificationToast(toastId: number) {
  visibleToasts = visibleToasts.filter(toast => toast.toastId !== toastId);
  promoteQueuedToasts();
  emitChange();
}
