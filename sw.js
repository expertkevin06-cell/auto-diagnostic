const CACHE_NAME = 'app-sec-v1';
const UPDATE_INTERVAL = 15 * 24 * 60 * 60 * 1000; // 15 jours
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
      .catch(() => caches.match('/index.html'))
  );
});

// Vérification de mise à jour toutes les 15 jours
setInterval(() => {
  self.registration.update();
}, UPDATE_INTERVAL);

// Notification de demande d'accès
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'ACCESS_REQUEST') {
    self.registration.showNotification('Nouvelle demande d\'accès', {
      body: `${event.data.prenom} demande un accès`,
      data: event.data
    });
  }
});
