import { Client, type StompSubscription } from '@stomp/stompjs';
import { API_ORIGIN } from './apiClient';
import { getAuthAccessToken } from './authSession';

export function connectAdminSocket(onChange: () => void, onStatus: (connected: boolean) => void) {
  const token = getAuthAccessToken();
  if (!token) { onStatus(false); return () => undefined; }

  let subscription: StompSubscription | undefined;
  const client = new Client({
    brokerURL: `${API_ORIGIN.replace(/^http/, 'ws')}/ws`,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onConnect: () => {
      onStatus(true);
      subscription = client.subscribe('/topic/admin', onChange);
    },
    onStompError: () => onStatus(false),
    onWebSocketClose: () => onStatus(false),
  });

  client.activate();
  return () => { subscription?.unsubscribe(); onStatus(false); void client.deactivate(); };
}
