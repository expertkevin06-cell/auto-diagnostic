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
      actions += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">✓ Autoriser</button>';
      actions += '<button class="btn btn-sm btn-danger" data-action="refuse" data-key="' + k + '">✗ Refuser</button>';
    } else if (st === 'accepted') {
      actions += '<button class="btn btn-sm btn-danger" data-action="revoke" data-key="' + k + '">Révoquer</button>';
    } else {
      actions += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">Réautoriser</button>';
    }
    actions += '<button class="btn btn-sm btn-secondary" data-action="delete" data-key="' + k + '">🗑️</button>';
    html += '<tr><td><strong>' + escapeHtml(u.prenom || '?') + '</strong></td>' +
      '<td><span class="badge badge-' + st + '">' + (labels[st] || st) + '</span></td>' +
      '<td style="font-size:11px">' + (u.date ? new Date(u.date).toLocaleDateString('fr-FR') : '--') + '</td>' +
      '<td>' + actions + '</td></tr>';
  });
  container.innerHTML = html + '</tbody></table>';
}

function bindAdminTable() {
  document.getElementById('users-table-container').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const a = btn.dataset.action, k = btn.dataset.key;
    if (a === 'accept') setUserStatus(k, 'accepted');
    if (a === 'refuse') setUserStatus(k, 'refused');
    if (a === 'revoke') setUserStatus(k, 'revoked');
    if (a === 'delete') deleteUser(k);
  });
}

async function setUserStatus(key, status) {
  await db.ref('access/users/' + key).update({ status: status });
  notify('✅ Statut mis à jour : ' + status);
}

async function deleteUser(key) {
  if (!confirm('Supprimer définitivement ce tiers ?')) return;
  await db.ref('access/users/' + key).remove();
  notify('🗑️ Tiers supprimé');
}

async function addUser() {
  const prenom = document.getElementById('new-prenom').value.trim();
  if (prenom.length < 2) { notify('Prénom invalide', 'error'); return; }
  const key = 'user_' + prenom.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  await db.ref('access/users/' + key).set({ prenom: prenom, status: 'accepted', device: 'admin', date: Date.now() });
  document.getElementById('new-prenom').value = '';
  notify('✅ ' + prenom + ' ajouté et autorisé');
}

/* ----- Partage APK (admin uniquement) ----- */
function shareAPK() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') { notify('❌ Réservé à l\'admin', 'error'); return; }
  const url = new URL('./index.html', location.href).href;
  if (navigator.share) navigator.share({ title: 'Auto Diagnostic Pro', text: 'Installez l\'application :', url: url }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => notify('🔗 Lien copié'));
  else prompt('Copiez ce lien :', url);
}

/* ----- Mise à jour base (cycle 15 jours) ----- */
async function updateBase() {
  await db.ref('data/version').set({ version: Date.now(), lastUpdate: new Date().toISOString(), updateIntervalDays: 15 });
  notify('✅ Mise à jour diffusée sur toutes les APK');
}

/* ----- Application diagnostic ----- */
async function enterApp() {
  const session = getSession();
  if (!session || session.status !== 'accepted') { notify('Accès non autorisé', 'error'); return; }
  document.getElementById('app-user').textContent = session.prenom;
  showScreen('screen-app');
  const snap = await db.ref('data').once('value');
  const data = snap.val() || {};
  document.getElementById('app-version').textContent =
    (data.version && data.version.lastUpdate) ? new Date(data.version.lastUpdate).toLocaleDateString('fr-FR') : '1.0';
  const sel = document.getElementById('sel-marque');
  sel.innerHTML = '<option value="">-- Choisir une marque --</option>';
  Object.values(data.marques || {}).forEach(m => {
    sel.innerHTML += '<option value="' + m.id + '">' + escapeHtml(m.name) + '</option>';
  });
}

function logoutApp() { showScreen('screen-accepted'); }

async function loadModels() {
  const marqueId = document.getElementById('sel-marque').value;
  const selModel = document.getElementById('sel-model');
  selModel.innerHTML = '<option value="">-- Modèle --</option>';
  document.getElementById('sel-motor').innerHTML = '<option value="">-- Motorisation --</option>';
  document.getElementById('known-issues').innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule...</p>';
  if (!marqueId) return;
  const snap = await db.ref('data/models').once('value');
  Object.values(snap.val() || {}).filter(m => m.marqueId === marqueId).forEach(m => {
    selModel.innerHTML += '<option value="' + m.id + '">' + escapeHtml(m.name) + '</option>';
  });
}

async function loadMotorisations() {
  const modelId = document.getElementById('sel-model').value;
  const selMotor = document.getElementById('sel-motor');
  selMotor.innerHTML = '<option value="">-- Motorisation --</option>';
  if (!modelId) return;
  const snap = await db.ref('data/motorisations').once('value');
  Object.values(snap.val() || {}).filter(m => m.modelId === modelId).forEach(m => {
    selMotor.innerHTML += '<option value="' + m.id + '">' + escapeHtml(m.name) + '</option>';
  });
  const snapIssues = await db.ref('data/issues').once('value');
  const issues = Object.values(snapIssues.val() || {}).filter(i => i.modelId === modelId);
  document.getElementById('known-issues').innerHTML = issues.length === 0
    ? '<p style="color:#94a3b8">Aucune panne connue référencée.</p>'
    : issues.map(i => '<div class="dtc-card"><strong>' + escapeHtml(i.title || '') + '</strong><p>' + escapeHtml(i.detail || '') + '</p></div>').join('');
}

async function searchDTC() {
  const query = document.getElementById('dtc-search').value.toUpperCase().trim();
  const container = document.getElementById('dtc-results');
  if (query.length < 2) { container.innerHTML = ''; return; }
  const snap = await db.ref('data/dtc').once('value');
  const matches = Object.values(snap.val() || {}).filter(d =>
    (d.code || '').toUpperCase().includes(query) ||
    (d.description || '').toLowerCase().includes(query.toLowerCase()));
  container.innerHTML = matches.length === 0
    ? '<p style="color:#94a3b8">Aucun DTC trouvé</p>'
    : matches.slice(0, 10).map(d =>
        '<div class="dtc-card"><strong>' + escapeHtml(d.code) + '</strong>' +
        '<p><strong>' + escapeHtml(d.description || '') + '</strong></p>' +
        (d.cause ? '<p>🔍 Cause : ' + escapeHtml(d.cause) + '</p>' : '') +
        (d.solution ? '<p>🔧 Solution : ' + escapeHtml(d.solution) + '</p>' : '') +
        '</div>').join('');
}

/* ----- Installation PWA ----- */
function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').classList.remove('hidden');
  });
  window.addEventListener('appinstalled', () => {
    document.getElementById('install-btn').classList.add('hidden');
    notify('🎉 Application installée !');
  });
}

async function installApp() {
  if (!deferredPrompt) { notify('Installation non disponible ici', 'error'); return; }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('install-btn').classList.add('hidden');
}

/* ----- Utilitaires ----- */
function getDeviceId() {
  let id = localStorage.getItem('autodiag_device');
  if (!id) { id = 'DEV-' + Math.random().toString(36).substr(2, 8).toUpperCase(); localStorage.setItem('autodiag_device', id); }
  return id;
}
function notify(msg, type) {
  const n = document.createElement('div');
  n.className = 'notification' + (type === 'error' ? ' error' : '');
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}
function escapeHtml(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
