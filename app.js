/* =====================================================
   APP.JS - Contrôle d'accès + installation + mises à jour
   ===================================================== */
const APP_VERSION = 2;
const UPDATE_INTERVAL_DAYS = 15;
const LS_SESSION = 'appsec_session';
const LS_REQUESTS = 'appsec_requests';
const LS_LAST_CHECK = 'appsec_last_update_check';

let deferredPrompt = null;

/* ===== UTILITAIRES ===== */
function $(id) { return document.getElementById(id); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  const el = $(id);
  if (el) el.style.display = 'block';
}
function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch (e) { return fallback; }
}
function writeLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function deviceId() {
  let id = localStorage.getItem('appsec_device');
  if (!id) {
    id = 'DEV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    localStorage.setItem('appsec_device', id);
  }
  return id;
}

/* ===== INITIALISATION ===== */
document.addEventListener('DOMContentLoaded', () => {
  registerSW();
  bindEvents();
  setupInstall();
  boot();
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => {
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      })
      .catch(err => console.error('[SW] erreur :', err));
  }
}

/* ===== DÉMARRAGE : version + statut ===== */
async function boot() {
  /* 1. Contrôle de version (accord admin obligatoire) */
  const version = await fetchJSON('./version.json');
  if (version && version.minAppVersion && APP_VERSION < version.minAppVersion) {
    $('update-message').innerHTML =
      'Version requise : <strong>' + version.minAppVersion + '</strong><br>' +
      'Contactez l\'administrateur pour obtenir la nouvelle installation.';
    showScreen('screen-update');
    return;
  }

  /* 2. Mise à jour automatique tous les 15 jours */
  checkPeriodicUpdate();

  /* 3. Résolution du statut de l'utilisateur */
  await resolveStatus();
}

async function fetchJSON(path) {
  try {
    const res = await fetch(path + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

async function resolveStatus() {
  const session = readLS(LS_SESSION, null);

  /* Pas de session → accueil */
  if (!session || !session.prenom) { showScreen('screen-home'); return; }

  /* Le serveur (access.json publié par l'admin) fait foi */
  const remote = await fetchJSON('./access.json');
  let status = session.status;
  if (remote && Array.isArray(remote.users)) {
    const found = remote.users.find(u =>
      u.prenom.toLowerCase() === session.prenom.toLowerCase());
    if (found) status = found.status;
  }

  session.status = status;
  writeLS(LS_SESSION, session);

  switch (status) {
    case 'accepted':
      $('user-name').textContent = session.prenom;
      notifyLocal('✅ Accès autorisé', 'Bienvenue ' + session.prenom + ' !');
      showScreen('screen-granted');
      break;
    case 'refused':  showScreen('screen-refused'); break;
    case 'revoked':  showScreen('screen-revoked'); break;
    case 'pending':  preparePending(session.prenom); showScreen('screen-pending'); break;
    default:         showScreen('screen-home');
  }
}

/* ===== DEMANDE D'ACCÈS (identification par prénom) ===== */
function requestAccess() {
  const prenom = $('input-prenom').value.trim();
  if (prenom.length < 2) { alert('Veuillez entrer votre prénom (2 caractères minimum)'); return; }

  const request = {
    prenom: prenom,
    status: 'pending',
    date: new Date().toISOString(),
    device: deviceId()
  };

  writeLS(LS_SESSION, request);
  const all = readLS(LS_REQUESTS, []);
  all.push(request);
  writeLS(LS_REQUESTS, all);

  /* Notification locale + notification via SW */
  notifyLocal('📨 Demande envoyée', 'Demande d\'accès pour ' + prenom);
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'ACCESS_REQUEST', prenom: prenom });
  }

  preparePending(prenom);
  showScreen('screen-pending');
}

/* Boutons d'envoi de la demande à l'admin (WhatsApp / SMS / Email) */
function preparePending(prenom) {
  const msg =
    '🔐 DEMANDE D\'ACCÈS - Auto Diagnostic\n' +
    '👤 Prénom : ' + prenom + '\n' +
    '📱 Appareil : ' + deviceId() + '\n' +
    '📅 Date : ' + new Date().toLocaleString('fr-FR') + '\n\n' +
    'Merci de m\'autoriser l\'accès à l\'application.';
  const enc = encodeURIComponent(msg);
  $('share-wa').href   = 'https://wa.me/?text=' + enc;
  $('share-sms').href  = 'sms:?body=' + enc;
  $('share-mail').href = 'mailto:?subject=' + encodeURIComponent('Demande d\'accès - ' + prenom) + '&body=' + enc;
}

function notifyLocal(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body: body, icon: './icon-192.png' }); } catch (e) {}
  }
}

/* ===== MISE À JOUR PÉRIODIQUE (15 jours) ===== */
function checkPeriodicUpdate() {
  const last = parseInt(localStorage.getItem(LS_LAST_CHECK) || '0', 10);
  const now = Date.now();
  if (now - last > UPDATE_INTERVAL_DAYS * 24 * 60 * 60 * 1000) {
    localStorage.setItem(LS_LAST_CHECK, String(now));
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
    }
  }
}

/* ===== INSTALLATION PWA (mode "installer sur APK") ===== */
function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    $('install-btn').classList.remove('hidden');
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    $('install-btn').classList.add('hidden');
  });
  $('install-btn').addEventListener('click', async () => {
    if (!deferredPrompt) { alert('Installation non disponible sur cet appareil.'); return; }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $('install-btn').classList.add('hidden');
  });
}

/* ===== ÉVÉNEMENTS ===== */
function bindEvents() {
  $('btn-request').addEventListener('click', requestAccess);
  $('btn-admin').addEventListener('click', () => { location.href = './admin.html'; });
  $('btn-enter-app').addEventListener('click', () => { location.href = './check.html'; });
  $('btn-home-granted').addEventListener('click', () => showScreen('screen-home'));
  $('btn-refresh-pending').addEventListener('click', () => resolveStatus());
  $('btn-retry-refused').addEventListener('click', resetRequest);
  $('btn-retry-revoked').addEventListener('click', resetRequest);
  $('btn-reload-update').addEventListener('click', () => location.reload());

  /* Temps réel même appareil (onglets ouverts) */
  window.addEventListener('storage', e => {
    if (e.key === LS_SESSION) resolveStatus();
  });
}

function resetRequest() {
  localStorage.removeItem(LS_SESSION);
  $('input-prenom').value = '';
  showScreen('screen-home');
}
