// ─── Ripple Service Worker v1 ─────────────────────────────────
const CACHE_NAME  = 'ripple-v1';
const STATIC_URLS = [
  './',
  './index.html',
  './app-constants.js',
  './app-notifications.js',
  './app-components.jsx',
  './app-screens.jsx',
  './app-myday.jsx',
  './ios-frame.jsx',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  // External fonts + libs (cache on first fetch)
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
];

// ─── Install: pre-cache all static assets ────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can, ignore failures for external resources
      return Promise.allSettled(
        STATIC_URLS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: clean up old caches ───────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: cache-first for static, network-first for dynamic ─
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // For same-origin requests: cache first, fallback network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // For CDN resources (fonts, React, Babel): cache first
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('unpkg.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});

// ─── Push notifications (future) ─────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ripple', {
      body:  data.body  || '',
      icon:  './icon-192.png',
      badge: './icon-192.png',
      tag:   data.tag   || 'ripple',
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('./index.html');
    })
  );
});
