import { Client, type StompSubscription } from '@stomp/stompjs';
import { API_ORIGIN } from './apiClient';
import { getAuthAccessToken } from './authSession';

export function connectSessionEntrySocket(groupId: number, sessionId: number, onChange: () => void, onStatus?: (connected: boolean) => void) {
  const token = getAuthAccessToken();
  let subscriptions: StompSubscription[] = [];
  const client = new Client({
    brokerURL: `${API_ORIGIN.replace(/^http/, 'ws')}/ws`,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
    onConnect: () => {
      onStatus?.(true);
      subscriptions = [
        client.subscribe(`/topic/groups/${groupId}/sessions`, onChange),
        client.subscribe(`/topic/sessions/${sessionId}`, onChange),
      ];
    },
    onWebSocketClose: () => onStatus?.(false),
    onStompError: () => onStatus?.(false),
  });

  client.activate();
  return () => {
    subscriptions.forEach(subscription => subscription.unsubscribe());
    onStatus?.(false);
    void client.deactivate();
  };
}

export function vibrateParticipantAlert(priority: 'NORMAL' | 'HIGH') {
  if (!('vibrate' in navigator)) return;
  navigator.vibrate(priority === 'HIGH' ? [250, 120, 250, 120, 350] : [160, 80, 160]);
}
