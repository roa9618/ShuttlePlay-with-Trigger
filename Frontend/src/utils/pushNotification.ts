import { apiClient } from './apiClient';

export type SystemNotificationStatus =
  | 'unsupported'
  | 'disabled'
  | 'denied'
  | 'unsubscribed'
  | 'subscribed';

type WebPushConfig = {
  enabled: boolean;
  publicKey: string;
};

const AUTO_PERMISSION_REQUEST_KEY = 'shuttleplay-push-permission-requested';
const PARTICIPANT_PERMISSION_REQUEST_KEY = 'shuttleplay-participant-push-permission-requested';

function isSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map(character => character.charCodeAt(0)));
}

function hasSameApplicationServerKey(subscription: PushSubscription, publicKey: string) {
  const currentKey = subscription.options.applicationServerKey;

  if (!currentKey) {
    return false;
  }

  const expectedKey = urlBase64ToUint8Array(publicKey);
  const currentBytes = new Uint8Array(currentKey);

  return currentBytes.length === expectedKey.length
    && currentBytes.every((byte, index) => byte === expectedKey[index]);
}

async function getServiceWorkerRegistration() {
  const existingRegistration = await navigator.serviceWorker.getRegistration();

  if (existingRegistration) {
    return existingRegistration;
  }

  return navigator.serviceWorker.register('/service-worker.js');
}

async function getConfig() {
  return apiClient.get<WebPushConfig>('/notifications/push/config', { auth: true });
}

async function registerSubscription(subscription: PushSubscription) {
  const serialized = subscription.toJSON();

  if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys?.auth) {
    throw new Error('시스템 알림 구독 정보를 확인할 수 없습니다.');
  }

  await apiClient.post<void>('/notifications/push/subscriptions', {
    endpoint: serialized.endpoint,
    keys: {
      p256dh: serialized.keys.p256dh,
      auth: serialized.keys.auth,
    },
  }, { auth: true });
}

export async function getSystemNotificationStatus(): Promise<SystemNotificationStatus> {
  if (!isSupported()) {
    return 'unsupported';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const config = await getConfig();

  if (!config.enabled) {
    return 'disabled';
  }

  const registration = await getServiceWorkerRegistration();
  const subscription = await registration.pushManager.getSubscription();

  return subscription ? 'subscribed' : 'unsubscribed';
}

export async function enableSystemNotifications(requestPermission = true) {
  if (!isSupported()) {
    return 'unsupported' as const;
  }

  let permission = Notification.permission;

  if (permission === 'default' && requestPermission) {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return permission === 'denied' ? 'denied' as const : 'unsubscribed' as const;
  }

  const config = await getConfig();

  if (!config.enabled) {
    return 'disabled' as const;
  }

  const registration = await getServiceWorkerRegistration();
  let subscription = await registration.pushManager.getSubscription();

  if (subscription && !hasSameApplicationServerKey(subscription, config.publicKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }

  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(config.publicKey),
  });

  await registerSubscription(subscription);
  return 'subscribed' as const;
}

export async function disableSystemNotifications() {
  if (!isSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  await apiClient.delete<void>('/notifications/push/subscriptions', {
    auth: true,
    body: { endpoint: subscription.endpoint },
  }).catch(() => {});
  await subscription.unsubscribe();
}

export async function requestSystemNotificationsAfterLogin() {
  if (
    !isSupported()
    || Notification.permission !== 'default'
    || window.sessionStorage.getItem(AUTO_PERMISSION_REQUEST_KEY)
  ) {
    if (Notification.permission === 'granted') {
      await enableSystemNotifications(false);
    }
    return;
  }

  window.sessionStorage.setItem(AUTO_PERMISSION_REQUEST_KEY, 'true');
  await enableSystemNotifications(true);
}

export async function requestSystemNotificationsFromParticipantStatus() {
  if (!isSupported()) {
    return 'unsupported' as const;
  }

  if (Notification.permission === 'granted') {
    return enableSystemNotifications(false);
  }

  if (
    Notification.permission !== 'default'
    || window.sessionStorage.getItem(PARTICIPANT_PERMISSION_REQUEST_KEY)
  ) {
    return Notification.permission === 'denied' ? 'denied' as const : 'unsubscribed' as const;
  }

  window.sessionStorage.setItem(PARTICIPANT_PERMISSION_REQUEST_KEY, 'true');
  return enableSystemNotifications(true);
}

export function clearSystemNotificationLoginRequest() {
  window.sessionStorage.removeItem(AUTO_PERMISSION_REQUEST_KEY);
  window.sessionStorage.removeItem(PARTICIPANT_PERMISSION_REQUEST_KEY);
}
