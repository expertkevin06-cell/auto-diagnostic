/* APP.JS — VERSION FIREBASE (sans bugs) */
const ADMIN_PASSWORD = 'Kevin83600';
const SESSION_KEY = 'autodiag_session';

let db = null;
let usersData = {};
let deferredPrompt = null;
let listenersStarted = false;

window.addEventListener('DOMContentLoaded', () => {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  registerSW();
  setupInstall();
  bindAdminTable();
  boot();
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW:', e));
  }
}

/* ----- Session ----- */
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function resetSession() {
  localStorage.removeItem(SESSION_KEY);
  document.getElementById('input-prenom').value = '';
  showScreen('screen-home');
}

/* ----- Navigation ----- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function screenIsActive(id) { return document.getElementById(id).classList.contains('active'); }

/* ----- Démarrage + écoute temps réel ----- */
function boot() { startListeners(); routeUser(); }

function startListeners() {
  if (listenersStarted) return;
  listenersStarted = true;
  db.ref('access/users').on('value', snap => {
    usersData = snap.val() || {};
    routeUser();
    if (screenIsActive('screen-admin')) renderAdmin();
  });
}

function findUserKey(prenom) {
  if (!prenom) return null;
  return Object.keys(usersData).find(k =>
    usersData[k] && usersData[k].prenom &&
    String(usersData[k].prenom).toLowerCase() === String(prenom).toLowerCase()
  ) || null;
}

function routeUser() {
  const session = getSession();
  if (!session || !session.prenom) { showScreen('screen-home'); return; }
  const key = findUserKey(session.prenom);
  if (!key) { showPending(session.prenom); return; }
  const status = usersData[key].status;
  session.status = status;
  saveSession(session);
  if (status === 'accepted') {
    document.getElementById('accepted-name').textContent = session.prenom;
    showScreen('screen-accepted');
  } else if (status === 'refused') showScreen('screen-refused');
  else if (status === 'revoked') showScreen('screen-revoked');
  else showPending(session.prenom);
}

/* ----- Demande d'accès (prénom) ----- */
async function requestAccess() {
  const prenom = document.getElementById('input-prenom').value.trim();
  if (prenom.length < 2) { notify('Prénom invalide (2 caractères minimum)', 'error'); return; }
  saveSession({ prenom: prenom, status: 'pending', deviceId: getDeviceId(), date: Date.now() });
  const key = 'user_' + prenom.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  await db.ref('access/users/' + key).set({
    prenom: prenom, status: 'pending', device: getDeviceId(), date: Date.now()
  });
  showPending(prenom);
  notify('📨 Demande envoyée à l\'administrateur');
}

function showPending(prenom) {
  document.getElementById('pending-name').textContent = prenom;
  const msg = '🔐 DEMANDE D\'ACCÈS - Auto Diagnostic Pro\n👤 Prénom : ' + prenom +
    '\n📱 Appareil : ' + getDeviceId() + '\n📅 ' + new Date().toLocaleString('fr-FR');
  const enc = encodeURIComponent(msg);
  document.getElementById('share-wa').href = 'https://wa.me/?text=' + enc;
  document.getElementById('share-sms').href = 'sms:?body=' + enc;
  document.getElementById('share-mail').href = 'mailto:?subject=' + encodeURIComponent('Demande d\'accès - ' + prenom) + '&body=' + enc;
  showScreen('screen-pending');
}

function checkStatus() { notify('🔄 Vérification...'); routeUser(); }

/* ----- Admin ----- */
function loginAdmin() {
  if (document.getElementById('admin-pwd').value === ADMIN_PASSWORD) {
    sessionStorage.setItem('autodiag_admin', '1');
    document.getElementById('admin-pwd').value = '';
    startListeners();
    showScreen('screen-admin');
    renderAdmin();
  } else notify('❌ Mot de passe incorrect', 'error');
}

function logoutAdmin() { sessionStorage.removeItem('autodiag_admin'); showScreen('screen-home'); }

function renderAdmin() {
  const container = document.getElementById('users-table-container');
  const keys = Object.keys(usersData).sort((a, b) => (usersData[b].date || 0) - (usersData[a].date || 0));
  if (keys.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px">Aucun tiers enregistré</p>';
    return;
  }
  const labels = { pending: '⏳ Attente', accepted: '✅ Accepté', refused: '❌ Refusé', revoked: '🔒 Révoqué' };
  let html = '<table><thead><tr><th>Prénom</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
  keys.forEach(k => {
    const u = usersData[k];
    const st = u.status || 'pending';
    let actions = '';
    if (st === 'pending') {
     
