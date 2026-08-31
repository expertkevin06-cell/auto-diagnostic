// ===== CONFIGURATION =====
const ADMIN_PASSWORD = 'Kevin83600';
const STORAGE_KEY = 'appsec_users';
const SESSION_KEY = 'appsec_session';

// ===== ÉTAT GLOBAL =====
let isAdmin = false;
let currentUser = null;
let deferredPrompt = null;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  setupInstallPrompt();
  checkInitialRoute();
  checkUserStatus();
});

// ===== SERVICE WORKER =====
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('SW enregistré:', reg.scope);
        // Demander permission notifications
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      })
      .catch(err => console.error('SW erreur:', err));
  }
}

// ===== NAVIGATION ENTRE ÉCRANS =====
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

function checkInitialRoute() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'admin') {
    showScreen('screen-admin-login');
  }
}

// ===== GESTION DES UTILISATEURS (localStorage) =====
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ===== VÉRIFICATION STATUT UTILISATEUR =====
function checkUserStatus() {
  const session = getCurrentUser();
  if (!session) return;

  const users = getUsers();
  const user = users.find(u => u.prenom === session.prenom);
  if (!user) return;

  switch (user.status) {
    case 'accepted':
      currentUser = user.prenom;
      document.getElementById('user-name').textContent = user.prenom;
      showScreen('screen-granted');
      break;
    case 'refused':
      showScreen('screen-refused');
      break;
    case 'revoked':
      showScreen('screen-revoked');
      break;
    case 'pending':
      showScreen('screen-pending');
      break;
  }
}

// ===== DEMANDE D'ACCÈS TIERS =====
function requestAccess() {
  const input = document.getElementById('input-prenom');
  const prenom = input.value.trim();

  if (!prenom) {
    alert('Veuillez entrer votre prénom');
    return;
  }

  if (prenom.length < 2) {
    alert('Le prénom doit contenir au moins 2 caractères');
    return;
  }

  const users = getUsers();
  const existing = users.find(u => u.prenom.toLowerCase() === prenom.toLowerCase());

  // Utilisateur déjà accepté
  if (existing && existing.status === 'accepted') {
    currentUser = existing.prenom;
    setCurrentUser({ prenom: existing.prenom });
    document.getElementById('user-name').textContent = existing.prenom;
    showScreen('screen-granted');
    return;
  }

  // Utilisateur déjà en attente
  if (existing && existing.status === 'pending') {
    showScreen('screen-pending');
    return;
  }

  // Utilisateur refusé/révoqué → nouvelle demande
  if (existing && (existing.status === 'refused' || existing.status === 'revoked')) {
    existing.status = 'pending';
    existing.date = new Date().toISOString();
    existing.deviceId = generateDeviceId();
    saveUsers(users);
    notifyAdmin(existing);
    showScreen('screen-pending');
    return;
  }

  // Nouvelle demande
  const newUser = {
    prenom: prenom,
    status: 'pending',
    date: new Date().toISOString(),
    deviceId: generateDeviceId()
  };
  users.push(newUser);
  saveUsers(users);
  notifyAdmin(newUser);
  input.value = '';
  showScreen('screen-pending');
}

function notifyAdmin(user) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'ACCESS_REQUEST',
      prenom: user.prenom,
      date: user.date,
      deviceId: user.deviceId
    });
  }
}

function generateDeviceId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// ===== ADMIN : LOGIN =====
function loginAdmin() {
  const input = document.getElementById('input-admin-pwd');
  const pwd = input.value;

  if (pwd === ADMIN_PASSWORD) {
    isAdmin = true;
    input.value = '';
    renderAdminTable();
    showScreen('screen-admin');
  } else {
    alert('❌ Mot de passe incorrect');
  }
}

function logoutAdmin() {
  isAdmin = false;
  showScreen('screen-home');
}

// ===== ADMIN : TABLEAU =====
function renderAdminTable() {
  const tbody = document.getElementById('users-body');
  const users = getUsers();

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Aucune demande</td></tr>';
    return;
  }

  // Trier par date (plus récent en premier)
  users.sort((a, b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = '';
  users.forEach((u, originalIndex) => {
    const tr = document.createElement('tr');
    const date = new Date(u.date).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const statusLabels = {
      pending: { text: 'En attente', class: 'pending' },
      accepted: { text: 'Accepté', class: 'accepted' },
      refused: { text: 'Refusé', class: 'refused' },
      revoked: { text: 'Révoqué', class: 'revoked' }
    };

    const status = statusLabels[u.status] || statusLabels.pending;
    const realIndex = getUsers().indexOf(u);

    let actions = '';
    if (u.status === 'pending') {
      actions = `
        <button class="btn-action accept" onclick="updateStatus(${realIndex}, 'accepted')" title="Accepter">✓</button>
        <button class="btn-action refuse" onclick="updateStatus(${realIndex}, 'refused')" title="Refuser">✗</button>
      `;
    } else if (u.status === 'accepted') {
      actions = `
        <button class="btn-action revoke" onclick="updateStatus(${realIndex}, 'revoked')" title="Révoquer">🔒</button>
      `;
    } else {
      actions = `
        <button class="btn-action reaccept" onclick="updateStatus(${realIndex}, 'accepted')" title="Réaccepter">↻</button>
      `;
    }

    tr.innerHTML = `
      <td><strong>${escapeHtml(u.prenom)}</strong></td>
      <td><span class="badge ${status.class}">${status.text}</span></td>
      <td class="date-cell">${date}</td>
      <td>${actions}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStatus(index, newStatus) {
  const users = getUsers();
  if (!users[index]) return;

  const oldStatus = users[index].status;
  users[index].status = newStatus;
  users[index].lastUpdate = new Date().toISOString();
  saveUsers(users);

  console.log(`Statut de ${users[index].prenom}: ${oldStatus} → ${newStatus}`);
  renderAdminTable();

  // Notification de confirmation
  const messages = {
    accepted: `✅ Accès accordé à ${users[index].prenom}`,
    refused: `❌ Accès refusé à ${users[index].prenom}`,
    revoked: `🔒 Accès révoqué pour ${users[index].prenom}`
  };
  alert(messages[newStatus]);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== PARTAGE APK (ADMIN UNIQUEMENT) =====
function shareAPK() {
  if (!isAdmin) {
    alert('⛔ Seul l\'administrateur peut partager l\'APK');
    return;
  }

  const shareData = {
    title: 'Application Sécurisée',
    text: 'Invitation à installer l\'application sécurisée',
    url: window.location.origin + window.location.pathname
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('Partage réussi'))
      .catch(err => {
        if (err.name !== 'AbortError') {
          fallbackCopy(shareData.url);
        }
      });
  } else {
    fallbackCopy(shareData.url);
  }
}

function fallbackCopy(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 Lien copié dans le presse-papier :\n' + url);
    }).catch(() => {
      prompt('Copiez ce lien :', url);
    });
  } else {
    prompt('Copiez ce lien :', url);
  }
}

// ===== INSTALLATION PWA =====
function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installée');
    deferredPrompt = null;
    document.getElementById('install-btn').classList.add('hidden');
  });
}

async function installPWA() {
  if (!deferredPrompt) {
    alert('Installation non disponible sur cet appareil');
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log('Installation:', outcome);
  deferredPrompt = null;
  document.getElementById('install-btn').classList.add('hidden');
}

// ===== MISE À JOUR AUTOMATIQUE (toutes les 15 jours) =====
function scheduleUpdateCheck() {
  const LAST_UPDATE_KEY = 'appsec_last_update';
  const UPDATE_INTERVAL = 15 * 24 * 60 * 60 * 1000;
  const lastUpdate = parseInt(localStorage.getItem(LAST_UPDATE_KEY) || '0');
  const now = Date.now();

  if (now - lastUpdate > UPDATE_INTERVAL) {
    localStorage.setItem(LAST_UPDATE_KEY, now.toString());
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
    }
  }
}

// Vérification au chargement
window.addEventListener('load', () => {
  scheduleUpdateCheck();
  // Vérification périodique toutes les heures (tant que la page est ouverte)
  setInterval(scheduleUpdateCheck, 60 * 60 * 1000);
});

// ===== GESTION DES MISES À JOUR DU SW =====
let refreshing = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});
