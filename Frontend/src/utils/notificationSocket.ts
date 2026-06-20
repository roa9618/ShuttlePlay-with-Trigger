import { Client } from '@stomp/stompjs';
import { API_ORIGIN } from './apiClient';
import { getAuthAccessToken } from './authSession';
import { loadNotifications, receiveNotification } from './notificationStore';
import { enqueueNotificationToast } from './notificationToastStore';
import type { NotificationItemResponse } from './notificationApi';

let client: Client | null = null;

function getWebSocketUrl() {
  return `${API_ORIGIN.replace(/^http/, 'ws')}/ws`;
}

export function connectNotificationSocket() {
  const accessToken = getAuthAccessToken();

  if (!accessToken || client?.active) {
    return;
  }

  client = new Client({
    brokerURL: getWebSocketUrl(),
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 2000,
    beforeConnect: () => {
      const latestToken = getAuthAccessToken();
      if (client) {
        client.connectHeaders = latestToken ? { Authorization: `Bearer ${latestToken}` } : {};
      }
    },
    onConnect: () => {
      void loadNotifications();
      client?.subscribe('/user/queue/notifications', message => {
        const notification = JSON.parse(message.body) as NotificationItemResponse;
        receiveNotification(notification);
        enqueueNotificationToast(notification);
      });
    },
  });

  client.activate();
}

export function disconnectNotificationSocket() {
  void client?.deactivate();
  client = null;
}
