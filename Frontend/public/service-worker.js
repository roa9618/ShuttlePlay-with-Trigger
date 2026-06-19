const CACHE_NAME = 'shuttleplay-shell-v2';
const APP_SHELL = ['/', '/index.html', '/site.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match('/index.html')),
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const priority = data.priority ?? (data.type === 'MATCH' ? 'HIGH' : 'NORMAL');

  event.waitUntil(self.registration.showNotification(data.title ?? '셔틀플레이 알림', {
    body: data.message ?? '',
    icon: '/shuttleplay-icon-192.png',
    badge: '/shuttleplay-icon-192.png',
    tag: data.tag ?? `shuttleplay-${data.type ?? 'notification'}-${data.id ?? Date.now()}`,
    renotify: priority === 'HIGH',
    requireInteraction: priority === 'HIGH',
    vibrate: priority === 'HIGH' ? [300, 120, 300, 120, 500] : [180, 80, 180],
    actions: [
      { action: 'open', title: '확인하기' },
      { action: 'close', title: '닫기' },
    ],
    data: {
      id: data.id,
      type: data.type,
      targetPath: data.targetPath ?? '/notifications',
    },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = new URL(event.notification.data?.targetPath ?? '/notifications', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find(client => new URL(client.url).origin === self.location.origin);

      if (existingClient) {
        return existingClient.navigate(targetUrl).then(client => client?.focus());
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
