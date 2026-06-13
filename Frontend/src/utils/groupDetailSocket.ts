import { Client, type StompSubscription } from '@stomp/stompjs';
import { API_ORIGIN } from './apiClient';
import { getAuthAccessToken } from './authSession';

export function connectGroupDetailSocket(groupId: number, onChange: () => void) {
  const token = getAuthAccessToken();
  if (!token) return () => undefined;

  let subscriptions: StompSubscription[] = [];
  const client = new Client({
    brokerURL: `${API_ORIGIN.replace(/^http/, 'ws')}/ws`,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onConnect: () => {
      subscriptions = ['', '/sessions', '/posts', '/members', '/join-requests']
        .map(path => client.subscribe(`/topic/groups/${groupId}${path}`, onChange));
    },
  });
  client.activate();
  return () => {
    subscriptions.forEach(subscription => subscription.unsubscribe());
    void client.deactivate();
  };
}
