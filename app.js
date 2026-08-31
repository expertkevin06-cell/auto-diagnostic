/* APP.JS FINAL — Firebase + accès + base complète */
const ADMIN_PASSWORD = 'Kevin83600';
const SESSION_KEY = 'autodiag_session';
let db, usersData = {}, brandsData = {}, deferredPrompt = null, listenersStarted = false, curBrand = null;

window.addEventListener('DOMContentLoaded', () => {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  setupInstall(); bindAdminTable(); boot();
});

/* ---------- utils ---------- */
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function screenIsActive(id) { return document.getElementById(id).classList.contains('active'); }
function notify(m, t) { const n = document.createElement('div'); n.className = 'notification' + (t === 'error' ? ' error' : ''); n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
function deviceId() { let id = localStorage.getItem('autodiag_device'); if (!id) { id = 'DEV-' + Math.random().toString(36).substr(2, 8).toUpperCase(); localStorage.setItem('autodiag_device', id); } return id; }

/* ---------- démarrage / temps réel ---------- */
function boot() {
  if (!listenersStarted) {
    listenersStarted = true;
    db.ref('access/users').on('value', s => { usersData = s.val() || {}; routeUser(); if (screenIsActive('screen-admin')) renderAdmin(); });
    db.ref('data/brands').on('value', s => { brandsData = s.val() || {}; if (screenIsActive('screen-admin')) fillBrandSelects(); });
  }
  routeUser();
}
function findKey(p) { return p ? Object.keys(usersData).find(k => usersData[k].prenom && usersData[k].prenom.toLowerCase() === p.toLowerCase()) || null : null; }
function routeUser() {
  const s = getSession();
  if (!s || !s.prenom) { showScreen('screen-home'); return; }
  const k = findKey(s.prenom);
  if (!k) { showPending(s.prenom); return; }
  s.status = usersData[k].status; saveSession(s);
  if (s.status === 'accepted') { document.getElementById('accepted-name').textContent = s.prenom; showScreen('screen-accepted'); }
  else if (s.status === 'refused') showScreen('screen-refused');
  else if (s.status === 'revoked') showScreen('screen-revoked');
  else showPending(s.prenom);
}

/* ---------- tiers ---------- */
async function requestAccess() {
  const p = document.getElementById('input-prenom').value.trim();
  if (p.length < 2) return notify('Prénom invalide', 'error');
  saveSession({ prenom: p, status: 'pending', date: Date.now() });
  await db.ref('access/users/user_' + p.toLowerCase().replace(/[^a-z0-9]+/g, '_')).set({ prenom: p, status: 'pending', device: deviceId(), date: Date.now() });
  showPending(p); notify('📨 Demande envoyée à l\'admin');
}
function showPending(p) {
  document.getElementById('pending-name').textContent = p;
  const m = encodeURIComponent('🔐 DEMANDE D\'ACCÈS Auto Diagnostic Pro\n👤 ' + p + '\n📱 ' + deviceId() + '\n📅 ' + new Date().toLocaleString('fr-FR'));
  document.getElementById('share-wa').href = 'https://wa.me/?text=' + m;
  document.getElementById('share-sms').href = 'sms:?body=' + m;
  document.getElementById('share-mail').href = 'mailto:?subject=Demande%20acc%C3%A8s&body=' + m;
  showScreen('screen-pending');
}
function checkStatus() { routeUser(); }
function resetSession() { localStorage.removeItem(SESSION_KEY); document.getElementById('input-prenom').value = ''; showScreen('screen-home'); }

/* ---------- admin ---------- */
function loginAdmin() {
  if (document.getElementById('admin-pwd').value === ADMIN_PASSWORD) {
    sessionStorage.setItem('autodiag_admin', '1');
    document.getElementById('admin-pwd').value = '';
    boot(); showScreen('screen-admin'); renderAdmin(); fillBrandSelects();
  } else notify('❌ Mot de passe incorrect', 'error');
}
function logoutAdmin() { sessionStorage.removeItem('autodiag_admin'); showScreen('screen-home'); }
function adminTab(id) {
  document.getElementById('tab-access').classList.toggle('hidden', id !== 'tab-access');
  document.getElementById('tab-data').classList.toggle('hidden', id !== 'tab-data');
  if (id === 'tab-data') fillBrandSelects();
}
function renderAdmin() {
  const c = document.getElementById('users-table-container');
  const keys = Object.keys(usersData).sort((a, b) => (usersData[b].date || 0) - (usersData[a].date || 0));
  if (!keys.length) { c.innerHTML = '<p style="color:#94a3b8;text-align:center">Aucun tiers</p>'; return; }
  const L = { pending: '⏳ Attente', accepted: '✅ Accepté', refused: '❌ Refusé', revoked: '🔒 Révoqué' };
  let h = '<table><thead><tr><th>Prénom</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
  keys.forEach(k => {
    const u = usersData[k], st = u.status || 'pending';
    let a = '';
    if (st === 'pending') a += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">✓</button><button class="btn btn-sm btn-danger" data-action="refuse" data-key="' + k + '">✗</button>';
    else if (st === 'accepted') a += '<button class="btn btn-sm btn-danger" data-action="revoke" data-key="' + k + '">Révoquer</button>';
    else a += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">Réautoriser</button>';
    a += '<button class="btn btn-sm btn-secondary" data-action="delete" data-key="' + k + '">🗑️</button>';
    h += '<tr><td>' + esc(u.prenom) + '</td><td><span class="badge badge-' + st + '">' + L[st] + '</span></td><td style="font-size:11px">' + (u.date ? new Date(u.date).toLocaleDateString('fr-FR') : '--') + '</td><td>' + a + '</td></tr>';
  });
  c.innerHTML = h + '</tbody></table>';
}
function bindAdminTable() {
  document.getElementById('users-table-container').addEventListener('click', e => {
    const b = e.target.closest('button[data-action]'); if (!b) return;
    const k = b.dataset.key, a = b.dataset.action;
    if (a === 'delete') { if (confirm('Supprimer ?')) db.ref('access/users/' + k).remove(); return; }
    db.ref('access/users/' + k).update({ status: a === 'accept' ? 'accepted' : a === 'refuse' ? 'refused' : 'revoked' });
  });
}
async function addUser() {
  const p = document.getElementById('new-prenom').value.trim();
  if (p.length < 2) return notify('Prénom invalide', 'error');
  await db.ref('access/users/user_' + p.toLowerCase().replace(/[^a-z0-9]+/g, '_')).set({ prenom: p, status: 'accepted', device: 'admin', date: Date.now() });
  document.getElementById('new-prenom').value = ''; notify('✅ ' + p + ' autorisé');
}
function shareAPK() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') return notify('❌ Réservé admin', 'error');
  const u = new URL('./index.html', location.href).href;
  if (navigator.share) navigator.share({ title: 'Auto Diagnostic Pro', text: 'Installez l\'APK :', url: u }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => notify('🔗 Lien APK copié'));
  else prompt('Lien :', u);
}
async function updateBase() {
  await db.ref('data/version').set({ version: Date.now(), lastUpdate: new Date().toISOString(), updateIntervalDays: 15 });
  notify('✅ MAJ diffusée sur toutes les APK');
}

/* ---------- admin base de données ---------- */
function fillBrandSelects() {
  ['nm-brand', 'mo-brand', 'is-brand'].forEach(id => {
    const s = document.getElementById(id); if (!s) return;
    s.innerHTML = '';
    Object.entries(brandsData).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, b]) => { s.innerHTML += '<option value="' + k + '">' + esc(b.name) + '</option>'; });
  });
  fillModelSelect();
}
function fillModelSelect() {
  const b = document.getElementById('is-brand').value;
  db.ref('data/models').once('value').then(s => {
    const sel = document.getElementById('is-model'); sel.innerHTML = '';
    Object.values(s.val() || {}).filter(m => m.brandId === b).forEach(m => { sel.innerHTML += '<option value="' + esc(m.name) + '">' + esc(m.name) + '</option>'; });
  });
}
async function addBrand() {
  const n = document.getElementById('nb-name').value.trim(), r = document.getElementById('nb-region').value;
  if (!n) return notify('Nom requis', 'error');
  await db.ref('data/brands/' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-')).set({ name: n, region: r });
  document.getElementById('nb-name').value = ''; notify('✅ Marque ajoutée');
}
async function addModel() {
  const b = document.getElementById('nm-brand').value, n = document.getElementById('nm-name').value.trim(), y = document.getElementById('nm-years').value.trim();
  if (!b || !n) return notify('Marque + modèle requis', 'error');
  await db.ref('data/models/' + b + '_' + Date.now()).set({ brandId: b, name: n, years: y || '2017-2026' });
  document.getElementById('nm-name').value = ''; notify('✅ Modèle ajouté');
}
async function addMotor() {
  const b = document.getElementById('mo-brand').value, n = document.getElementById('mo-name').value.trim();
  if (!b || !n) return notify('Infos requises', 'error');
  const ref = db.ref('data/motors/' + b);
  const s = await ref.once('value'); const arr = s.val() || []; arr.push(n);
  await ref.set(arr); notify('✅ Motorisation ajoutée');
}
async function addIssue() {
  const b = document.getElementById('is-brand').value, m = document.getElementById('is-model').value, t = document.getElementById('is-title').value.trim(), d = document.getElementById('is-detail').value.trim(), src = document.getElementById('is-source').value;
  if (!t) return notify('Titre requis', 'error');
  await db.ref('data/issues/iss_' + Date.now()).set({ brandId: b, model: m, title: t, detail: d, source: src });
  document.getElementById('is-title').value = ''; document.getElementById('is-detail').value = ''; notify('✅ Panne/rappel ajouté');
}
async function addDTC() {
  const c = document.getElementById('dt-code').value.trim().toUpperCase(), de = document.getElementById('dt-desc').value.trim();
  if (!c || !de) return notify('Code + description requis', 'error');
  await db.ref('data/dtc/' + c.replace(/[^A-Z0-9]+/g, '_')).set({ code: c, description: de, cause: document.getElementById('dt-cause').value.trim(), solution: document.getElementById('dt-sol').value.trim() });
  document.getElementById('dt-code').value = ''; document.getElementById('dt-desc').value = ''; notify('✅ DTC ajouté');
}

/* ---------- application ---------- */
async function enterApp() {
  const s = getSession();
  const isAdmin = sessionStorage.getItem('autodiag_admin') === '1';
  if (!isAdmin && (!s || s.status !== 'accepted')) return notify('Accès non autorisé', 'error');
  document.getElementById('app-user').textContent = isAdmin ? '👑 Admin' : s.prenom;
  showScreen('screen-app');
  const v = await db.ref('data/version').once('value');
  const vv = v.val(); document.getElementById('app-version').textContent = vv && vv.lastUpdate ? new Date(vv.lastUpdate).toLocaleDateString('fr-FR') : '1.0';
  const bs = await db.ref('data/brands').once('value');
  brandsData = bs.val() || {};
  const sel = document.getElementById('sel-marque');
  const regions = { francaises: '🇫🇷 Françaises', europeennes: '🇪🇺 Européennes', asiatiques: '🌏 Asiatiques', chinoises: '🇨🇳 Chinoises', americaines: '🇺🇸 Américaines' };
  sel.innerHTML = '<option value="">-- Choisir --</option>';
  Object.entries(regions).forEach(([r, label]) => {
    const items = Object.entries(brandsData).filter(([, b]) => b.region === r);
    if (!items.length) return;
    sel.innerHTML += '<optgroup label="' + label + '">' + items.map(([k, b]) => '<option value="' + k + '">' + esc(b.name) + '</option>').join('') + '</optgroup>';
  });
}
function logoutApp() { showScreen(sessionStorage.getItem('autodiag_admin') === '1' ? 'screen-admin' : 'screen-accepted'); }
async function loadModels() {
  curBrand = document.getElementById('sel-marque').value;
  const sm = document.getElementById('sel-model');
  sm.innerHTML = '<option value="">-- Modèle --</option>';
  document.getElementById('motor-list').innerHTML = '<p style="color:#94a3b8">—</p>';
  document.getElementById('known-issues').innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule…</p>';
  if (!curBrand) return;
  const s = await db.ref('data/models').once('value');
  Object.values(s.val() || {}).filter(m => m.brandId === curBrand).sort((a, b) => a.name.localeCompare(b.name)).forEach(m => {
    sm.innerHTML += '<option value="' + esc(m.name) + '">' + esc(m.name) + ' (' + esc(m.years) + ')</option>';
  });
}
async function loadMotorisations() {
  const model = document.getElementById('sel-model').value;
  if (!model || !curBrand) return;
  const mo = await db.ref('data/motors/' + curBrand).once('value');
  const motors = mo.val() || [];
  document.getElementById('motor-list').innerHTML = motors.length ? motors.map(m => '<span class="badge badge-accepted" style="margin:2px">' + esc(m) + '</span>').join(' ') : '<p style="color:#94a3b8">Non renseigné</p>';
  const is = await db.ref('data/issues').once('value');
  const issues = Object.values(is.val() || {}).filter(i => i.brandId === curBrand && (!i.model || i.model === model));
  document.getElementById('known-issues').innerHTML = issues.length ? issues.map(i => '<div class="issue-card"><strong>' + esc(i.title) + '</strong><span class="src">' + esc(i.source) + '</span><p>' + esc(i.detail || '') + '</p></div>').join('') : '<p style="color:#94a3b8">Aucune panne/rappel en base pour ce modèle — vérifiez les sites officiels ci-dessous.</p>';
}
async function searchDTC() {
  const q = document.getElementById('dtc-search').value.toUpperCase().trim();
  const c = document.getElementById('dtc-results');
  if (q.length < 2) { c.innerHTML = ''; return; }
  const s = await db.ref('data/dtc').once('value');
  const m = Object.values(s.val() || {}).filter(d => (d.code || '').toUpperCase().includes(q) || (d.description || '').toLowerCase().includes(q.toLowerCase()));
  c.innerHTML = m.length ? m.slice(0, 12).map(d => '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>').join('') : '<p style="color:#94a3b8">Aucun DTC trouvé</p>';
}

/* ---------- install ---------- */
function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; document.getElementById('install-btn').classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { document.getElementById('install-btn').classList.add('hidden'); notify('🎉 APK installée !'); });
}
async function installApp() { if (!deferredPrompt) return notify('Non disponible ici', 'error'); deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; document.getElementById('install-btn').classList.add('hidden'); }
