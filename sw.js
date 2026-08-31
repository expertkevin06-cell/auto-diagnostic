/* Service Worker - Auto Diagnostic Sécurisé */
const CACHE_NAME = 'autodiag-v3';
const CORE_FILES = [
  './',
  './index.html',
  './admin.html',
  './check.html',
  './manifest.json',
  './styles.css',
  './app.js',
  './admin.js',
  './icon-192.png',
  './icon-512.png',
  './db.js',
  './dtc-db.js',
  './vehicles-db.js',
  './recalls-db.js',
  './extra-brands.js',
  './ai-search.js'
];
const ALWAYS_NETWORK = ['access.json', 'version.json'];

/* ===== INSTALLATION (tolérante aux fichiers manquants) ===== */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        CORE_FILES.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Non mis en cache :', url))
        )
      )
    )
  );
});

/* ===== ACTIVATION (nettoyage des anciens caches) ===== */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ===== INTERCEPTION DES REQUÊTES ===== */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* Fichiers de contrôle : toujours réseau d'abord (temps réel) */
  if (ALWAYS_NETWORK.some(f => url.pathname.endsWith(f))) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  /* Navigation : réseau d'abord, repli sur le cache (hors-ligne) */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  /* Le reste : cache d'abord, puis réseau */
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});

/* ===== MESSAGES DEPUIS L'APPLICATION ===== */
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'CHECK_UPDATE') self.registration.update();
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'ACCESS_REQUEST') {
    event.waitUntil(
      self.registration.showNotification("Nouvelle demande d'accès", {
        body: event.data.prenom + " demande un accès à l'application",
        icon: './icon-192.png',
        badge: './icon-192.png',
        requireInteraction: true
      }).catch(() => {})
    );
  }
});

/* ===== CLIC NOTIFICATION → ouvre le mode admin ===== */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('./admin.html');
    })
  );
});
