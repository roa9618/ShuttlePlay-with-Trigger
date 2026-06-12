import { useSyncExternalStore } from 'react';
import {
  getNotifications,
  readAllNotifications,
  readNotification,
  type NotificationItemResponse,
  type NotificationType,
} from './notificationApi';

export type { NotificationType };
export type AppNotification = NotificationItemResponse;

let notifications: AppNotification[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return notifications;
}

function formatCreatedAt(createdAt: string) {
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60),
  );

  if (elapsedMinutes < 1) return '방금 전';
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;
  if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}시간 전`;
  if (elapsedMinutes < 2880) return '어제';
  return `${Math.floor(elapsedMinutes / 1440)}일 전`;
}

function toAppNotification(notification: NotificationItemResponse) {
  return {
    ...notification,
    createdAt: formatCreatedAt(notification.createdAt),
  };
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function loadNotifications() {
  const response = await getNotifications();
  notifications = response.items.map(toAppNotification);
  emitChange();
}

export async function markNotificationAsRead(notificationId: number) {
  const notification = toAppNotification(await readNotification(notificationId));
  notifications = notifications.map(current => (
    current.id === notificationId ? notification : current
  ));
  emitChange();
}

export async function markAllNotificationsAsRead() {
  await readAllNotifications();
  notifications = notifications.map(notification => ({
    ...notification,
    read: true,
  }));
  emitChange();
}
