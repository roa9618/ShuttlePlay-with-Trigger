import { Client, type StompSubscription } from '@stomp/stompjs';
import { API_ORIGIN } from './apiClient';
import { getAuthAccessToken } from './authSession';

type MatchAlertPriority = 'NORMAL' | 'HIGH';
type ExtendedNotificationOptions = NotificationOptions & {
  renotify?: boolean;
  vibrate?: number[];
};

export function connectSessionEntrySocket(
  groupId: number,
  sessionId: number,
  onChange: () => void | Promise<void>,
  onStatus?: (connected: boolean) => void,
) {
  const token = getAuthAccessToken();
  let subscriptions: StompSubscription[] = [];
  let refreshTimer: number | null = null;
  let refreshRunning = false;
  let refreshPending = false;
  let disposed = false;

  const runRefresh = async () => {
    if (disposed) return;
    if (refreshRunning) {
      refreshPending = true;
      return;
    }

    refreshRunning = true;
    try {
      await onChange();
    } finally {
      refreshRunning = false;
      if (refreshPending && !disposed) {
        refreshPending = false;
        refreshTimer = window.setTimeout(() => {
          refreshTimer = null;
          void runRefresh();
        }, 200);
      }
    }
  };

  const requestRefresh = () => {
    if (disposed) return;
    if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;
      void runRefresh();
    }, 200);
  };

  const client = new Client({
    brokerURL: `${API_ORIGIN.replace(/^http/, 'ws')}/ws`,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: () => {
      const latestToken = getAuthAccessToken();
      client.connectHeaders = latestToken ? { Authorization: `Bearer ${latestToken}` } : {};
    },
    onConnect: () => {
      onStatus?.(true);
      subscriptions.forEach(subscription => subscription.unsubscribe());
      subscriptions = [
        client.subscribe(`/topic/groups/${groupId}/sessions`, requestRefresh),
        client.subscribe(`/topic/sessions/${sessionId}`, requestRefresh),
      ];
      requestRefresh();
    },
    onWebSocketClose: () => onStatus?.(false),
    onStompError: () => onStatus?.(false),
    onDisconnect: () => onStatus?.(false),
  });

  const handleResume = () => {
    if (document.visibilityState !== 'visible' || !navigator.onLine || disposed) return;
    requestRefresh();
    if (!client.active) client.activate();
  };

  document.addEventListener('visibilitychange', handleResume);
  window.addEventListener('pageshow', handleResume);
  window.addEventListener('focus', handleResume);
  window.addEventListener('online', handleResume);

  client.activate();

  return () => {
    disposed = true;
    if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    document.removeEventListener('visibilitychange', handleResume);
    window.removeEventListener('pageshow', handleResume);
    window.removeEventListener('focus', handleResume);
    window.removeEventListener('online', handleResume);
    subscriptions.forEach(subscription => subscription.unsubscribe());
    onStatus?.(false);
    void client.deactivate();
  };
}

async function showParticipantNotification(priority: MatchAlertPriority) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible' && priority !== 'HIGH') return;

  const highPriority = priority === 'HIGH';
  const title = highPriority ? '지금 경기 차례예요' : '다음 경기 예정이에요';
  const body = highPriority ? '지금 코트로 이동해 주세요.' : '곧 경기 차례가 와요. 준비해 주세요.';
  const tag = `session-match-${priority}`;
  const data = {
    title,
    message: body,
    type: 'MATCH',
    priority,
    tag,
    targetPath: window.location.pathname,
  };
  const options: ExtendedNotificationOptions = {
    body,
    icon: '/shuttleplay-icon-192.png',
    badge: '/shuttleplay-icon-192.png',
    tag,
    renotify: highPriority,
    requireInteraction: highPriority,
    vibrate: highPriority ? [300, 120, 300, 120, 500] : [180, 80, 180],
    data,
  };

  const registration = 'serviceWorker' in navigator
    ? await navigator.serviceWorker.getRegistration().catch(() => null)
    : null;
  if (registration?.showNotification) {
    await registration.showNotification(title, options);
    return;
  }

  new Notification(title, options);
}

export function vibrateParticipantAlert(priority: MatchAlertPriority) {
  if ('vibrate' in navigator) {
    navigator.vibrate(priority === 'HIGH' ? [300, 120, 300, 120, 500] : [180, 80, 180]);
  }

  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = priority === 'HIGH' ? 880 : 660;
    gain.gain.value = priority === 'HIGH' ? 0.12 : 0.07;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + (priority === 'HIGH' ? 0.45 : 0.25));
    oscillator.addEventListener('ended', () => void context.close());
  } catch {
    // 자동 재생이 막힌 환경에서는 진동과 화면 안내만 사용합니다.
  }

  void showParticipantNotification(priority);
}
