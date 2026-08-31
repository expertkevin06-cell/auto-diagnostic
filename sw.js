// ===== Configuration =====
const CACHE_NAME = 'app-sec-v2';
const UPDATE_INTERVAL_MS = 15 * 24 * 60 * 60 * 1000; // 15 jours

// Fichiers à mettre en cache
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ===== INSTALLATION =====
self.addEventListener('install', event => {
  console.log('[SW] Installation...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[SW] Erreur cache:', err))
  );
});

// ===== ACTIVATION =====
self.addEventListener('activate', event => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===== INTERCEPTION DES REQUÊTES =====
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// ===== MESSAGES DEPUIS L'APPLICATION =====
self.addEventListener('message', event => {
  if (!event.data) return;

  // Demande d'accès d'un tiers
  if (event.data.type === 'ACCESS_REQUEST') {
    const { prenom } = event.data;
    event.waitUntil(
      self.registration.showNotification('Nouvelle demande d\'accès', {
        body: `${prenom} demande un accès à l'application`,
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: 'access-request-' + Date.now(),
        requireInteraction: true,
        data: { prenom: prenom }
      })
    );
  }

  // Forcer la mise à jour
  if (event.data.type === 'CHECK_UPDATE') {
    self.registration.update();
  }

  // Forcer le skip waiting
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ===== CLIC SUR NOTIFICATION =====
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html?mode=admin');
    })
  );
});

// ===== MISE À JOUR PÉRIODIQUE (15 jours) =====
// Note : setInterval fonctionne tant que le SW est actif
let lastUpdateCheck = Date.now();

self.addEventListener('fetch', event => {
  const now = Date.now();
  if (now - lastUpdateCheck > UPDATE_INTERVAL_MS) {
    lastUpdateCheck = now;
    self.registration.update();
  }
});

console.log('[SW] Service Worker chargé');
