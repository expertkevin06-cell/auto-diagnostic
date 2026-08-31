// ===== Configuration =====
const CACHE_NAME = 'app-sec-v1';
const UPDATE_INTERVAL = 15 * 24 * 60 * 60 * 1000; // 15 jours en millisecondes
const ADMIN_PASSWORD_HASH = 'Kevin83600'; // À remplacer par un vrai hash côté serveur

// ===== Liste des fichiers à mettre en cache =====
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ===== Installation du Service Worker =====
self.addEventListener('install', event => {
  console.log('[SW] Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Mise en cache des fichiers');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[SW] Erreur de cache:', err);
      })
  );
  self.skipWaiting(); // Activation immédiate
});

// ===== Activation du Service Worker =====
self.addEventListener('activate', event => {
  console.log('[SW] Activation en cours...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Prendre le contrôle immédiatement
});

// ===== Interception des requêtes réseau =====
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Retourner la version en cache
          return cachedResponse;
        }
        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then(networkResponse => {
            // Vérifier que la réponse est valide
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Mettre en cache la réponse
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          })
          .catch(() => {
            // Si la requête échoue, retourner la page d'accueil
            return caches.match('./index.html');
          });
      })
  );
});

// ===== Mise à jour automatique tous les 15 jours =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    self.registration.update();
  }
});

// Vérification périodique de mise à jour
setInterval(() => {
  self.registration.update()
    .then(() => console.log('[SW] Vérification de mise à jour effectuée'))
    .catch(err => console.error('[SW] Erreur vérification MAJ:', err));
}, UPDATE_INTERVAL);

// ===== Gestion des notifications de demande d'accès =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'ACCESS_REQUEST') {
    const { prenom, date, deviceId } = event.data;
    
    // Afficher une notification
    self.registration.showNotification('Nouvelle demande d\'accès', {
      body: `${prenom} demande un accès à l'application`,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'access-request',
      requireInteraction: true,
      data: {
        prenom: prenom,
        date: date,
        deviceId: deviceId,
        type: 'ACCESS_REQUEST'
      },
      actions: [
        { action: 'accept', title: 'Accepter' },
        { action: 'refuse', title: 'Refuser' }
      ]
    });
  }
});

// ===== Gestion des clics sur les notifications =====
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const { prenom, date, deviceId } = event.notification.data;
  
  if (event.action === 'accept') {
    // Ouvrir l'application en mode admin pour accepter
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('index.html') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./index.html?mode=admin&action=accept&user=' + encodeURIComponent(prenom));
        }
      })
    );
  } else if (event.action === 'refuse') {
    // Ouvrir l'application en mode admin pour refuser
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('index.html') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./index.html?mode=admin&action=refuse&user=' + encodeURIComponent(prenom));
        }
      })
    );
  } else {
    // Clic sur la notification elle-même
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('index.html') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./index.html?mode=admin');
        }
      })
    );
  }
});

// ===== Synchronisation en arrière-plan =====
self.addEventListener('sync', event => {
  if (event.tag === 'sync-users') {
    event.waitUntil(syncUsersData());
  }
});

async function syncUsersData() {
  // Fonction de synchronisation des données utilisateurs
  // À implémenter avec votre backend
  console.log('[SW] Synchronisation des données utilisateurs');
}

// ===== Gestion des mises à jour du Service Worker =====
self.addEventListener('controllerchange', () => {
  // Recharger la page quand un nouveau SW prend le contrôle
  window.location.reload();
});

// ===== Logs de débogage =====
console.log('[SW] Service Worker chargé avec succès');
console.log('[SW] Cache name:', CACHE_NAME);
console.log('[SW] Update interval:', UPDATE_INTERVAL / 1000 / 60 / 60 / 24, 'jours');
