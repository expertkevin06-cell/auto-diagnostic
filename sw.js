const CACHE_NAME = 'auto-diag-v3';
const DB_UPDATE_INTERVAL = 15 * 24 * 60 * 60 * 1000;

const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/styles.css',
  '/app.js',
  '/admin.js',
  '/db.js',
  '/vehicles-db.js',
  '/dtc-db.js',
  '/recalls-db.js',
  '/ai-search.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'CHECK_DB_UPDATE') {
    const lastUpdate = parseInt(localStorage.getItem('lastDbUpdate') || '0');
    const now = Date.now();
    if (now - lastUpdate >= DB_UPDATE_INTERVAL) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ action: 'DB_UPDATE_REQUIRED' });
        });
      });
    }
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/admin.html'));
});
