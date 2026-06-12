import { apiClient } from './apiClient';

export type NotificationType = 'SCHEDULE' | 'MATCH' | 'GROUP' | 'SYSTEM';

export type NotificationItemResponse = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  targetPath: string;
  read: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
};

export function getNotifications() {
  return apiClient.get<NotificationListResponse>(
    '/notifications?page=0&size=100',
    { auth: true },
  );
}

export function readNotification(notificationId: number) {
  return apiClient.patch<NotificationItemResponse>(
    `/notifications/${notificationId}/read`,
    undefined,
    { auth: true },
  );
}

export function readAllNotifications() {
  return apiClient.patch<void>('/notifications/read-all', undefined, {
    auth: true,
  });
}
