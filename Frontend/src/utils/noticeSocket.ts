import { Client, type StompSubscription } from '@stomp/stompjs';
import { API_ORIGIN } from './apiClient';
import { getAuthAccessToken } from './authSession';

export function connectNoticeSocket(onChange: () => void) {
  const token = getAuthAccessToken();
  if (!token) return () => undefined;
  let subscription: StompSubscription | undefined;
  const client = new Client({
    brokerURL: `${API_ORIGIN.replace(/^http/, 'ws')}/ws`,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onConnect: () => { subscription = client.subscribe('/topic/notices', onChange); },
  });
  client.activate();
  return () => { subscription?.unsubscribe(); void client.deactivate(); };
}
