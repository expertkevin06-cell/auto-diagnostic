/* APP.JS v3 — corrélation marque>modèle>motorisation + import massif */
const ADMIN_PASSWORD = 'Kevin83600';
const SESSION_KEY = 'autodiag_session';
const FUELS = { essence: '⛽ Essence', diesel: '🛢️ Diesel', hybride: '🔋 Hybride', electrique: '⚡ Électrique' };
const GENERIC = {
  diesel: { issues: [['Vanne EGR encrassée', 'Perte puissance, voyant moteur, ralenti instable', 'P0401 / P0490'], ['FAP colmaté', 'Régénérations fréquentes, perte puissance', 'P2002 / P2463'], ['Système AdBlue', 'Cristallisation, pompe HS, voyant', 'P20EE'], ['Préchauffage', 'Démarrage difficile à froid', 'P0380 / P0671'], ['Injecteurs HP', 'Claquement, fumée, surconso', 'P0201-P0204']], dtc: ['P0401', 'P0490', 'P2002', 'P2463', 'P0380', 'P0671', 'P0087', 'P20EE'] },
  essence: { issues: [['Ratés d\'allumage', 'Bougies/bobines usées, à-coups', 'P0300-P0304'], ['Distribution courroie/chaîne', 'Usure prématurée selon motorisation', 'P0016'], ['Catalyseur', 'Vieillissement, contre-pression', 'P0420'], ['Boîtier papillon', 'Ralenti instable', 'P0507']], dtc: ['P0300', 'P0301', 'P0335', 'P0340', 'P0171', 'P0172', 'P0420', 'P0507', 'P0016'] },
  hybride: { issues: [['Batterie traction', 'Vieillissement cellules, équilibrage', 'U0111'], ['Onduleur/convertisseur', 'Perte puissance, défaut isolement', 'P0AA6'], ['Freinage régénératif', 'À-coups, capteur pédale', 'C1365']], dtc: ['U0111', 'P0AA6', 'P0C00', 'C1365'] },
  electrique: { issues: [['Batterie HV', 'Dégradation, surchauffe modules, BMS', 'U0111 / P0AA6'], ['Charge/Connecteur', 'Charge lente, erreurs borne', 'P0D11'], ['Thermique batterie', 'Défaut refroidissement', 'P0C00']], dtc: ['U0111', 'P0AA6', 'P0C00', 'P0D11'] }
};
let db, usersData = {}, brandsData = {}, motorsCache = [], deferredPrompt = null, listenersStarted = false;
let curBrand = null, curModelId = null, curModelName = null;

window.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  setupInstall(); bindAdminTable(); boot();
});

function el(id) { return document.getElementById(id); }
function val(id) { return el(id).value; }
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); el(id).classList.add('active'); }
function screenIsActive(id) { return el(id).classList.contains('active'); }
function notify(m, t) { const n = document.createElement('div'); n.className = 'notification' + (t === 'error' ? ' error' : ''); n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
function deviceId() { let id = localStorage.getItem('autodiag_device'); if (!id) { id = 'DEV-' + Math.random().toString(36).substr(2, 8).toUpperCase(); localStorage.setItem('autodiag_device', id); } return id; }

/* ----- temps réel / routage ----- */
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
  if (s.status === 'accepted') { el('accepted-name').textContent = s.prenom; showScreen('screen-accepted'); }
  else if (s.status === 'refused') showScreen('screen-refused');
  else if (s.status === 'revoked') showScreen('screen-revoked');
  else showPending(s.prenom);
}
async function requestAccess() {
  const p = el('input-prenom').value.trim();
  if (p.length < 2) return notify('Prénom invalide', 'error');
  saveSession({ prenom: p, status: 'pending', date: Date.now() });
  await db.ref('access/users/user_' + p.toLowerCase().replace(/[^a-z0-9]+/g, '_')).set({ prenom: p, status: 'pending', device: deviceId(), date: Date.now() });
  showPending(p); notify('📨 Demande envoyée');
}
function showPending(p) {
  el('pending-name').textContent = p;
  const m = encodeURIComponent('🔐 DEMANDE D\'ACCÈS Auto Diagnostic Pro\n👤 ' + p + '\n📱 ' + deviceId() + '\n📅 ' + new Date().toLocaleString('fr-FR'));
  el('share-wa').href = 'https://wa.me/?text=' + m; el('share-sms').href = 'sms:?body=' + m; el('share-mail').href = 'mailto:?subject=Demande%20acc%C3%A8s&body=' + m;
  showScreen('screen-pending');
}
function checkStatus() { routeUser(); }
function resetSession() { localStorage.removeItem(SESSION_KEY); el('input-prenom').value = ''; showScreen('screen-home'); }

/* ----- admin ----- */
function loginAdmin() {
  if (el('admin-pwd').value === ADMIN_PASSWORD) { sessionStorage.setItem('autodiag_admin', '1'); el('admin-pwd').value = ''; boot(); showScreen('screen-admin'); renderAdmin(); fillBrandSelects(); }
  else notify('❌ Mot de passe incorrect', 'error');
}
function logoutAdmin() { sessionStorage.removeItem('autodiag_admin'); showScreen('screen-home'); }
function adminTab(id) { el('tab-access').classList.toggle('hidden', id !== 'tab-access'); el('tab-data').classList.toggle('hidden', id !== 'tab-data'); if (id === 'tab-data') { fillBrandSelects(); fillModelSelectAdmin(); } }
function renderAdmin() {
  const c = el('users-table-container'); const keys = Object.keys(usersData).sort((a, b) => (usersData[b].date || 0) - (usersData[a].date || 0));
  if (!keys.length) { c.innerHTML = '<p style="color:#94a3b8;text-align:center">Aucun tiers</p>'; return; }
  const L = { pending: '⏳ Attente', accepted: '✅ Accepté', refused: '❌ Refusé', revoked: '🔒 Révoqué' };
  let h = '<table><thead><tr><th>Prénom</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
  keys.forEach(k => {
    const u = usersData[k], st = u.status || 'pending'; let a = '';
    if (st === 'pending') a += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">✓</button><button class="btn btn-sm btn-danger" data-action="refuse" data-key="' + k + '">✗</button>';
    else if (st === 'accepted') a += '<button class="btn btn-sm btn-danger" data-action="revoke" data-key="' + k + '">Révoquer</button>';
    else a += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">Réautoriser</button>';
    a += '<button class="btn btn-sm btn-secondary" data-action="delete" data-key="' + k + '">🗑️</button>';
    h += '<tr><td>' + esc(u.prenom) + '</td><td><span class="badge badge-' + st + '">' + L[st] + '</span></td><td style="font-size:11px">' + (u.date ? new Date(u.date).toLocaleDateString('fr-FR') : '--') + '</td><td>' + a + '</td></tr>';
  });
  c.innerHTML = h + '</tbody></table>';
}
function bindAdminTable() {
  el('users-table-container').addEventListener('click', e => {
    const b = e.target.closest('button[data-action]'); if (!b) return;
    const k = b.dataset.key, a = b.dataset.action;
    if (a === 'delete') { if (confirm('Supprimer ?')) db.ref('access/users/' + k).remove(); return; }
    db.ref('access/users/' + k).update({ status: a === 'accept' ? 'accepted' : a === 'refuse' ? 'refused' : 'revoked' });
  });
}
async function addUser() {
  const p = el('new-prenom').value.trim(); if (p.length < 2) return notify('Prénom invalide', 'error');
  await db.ref('access/users/user_' + p.toLowerCase().replace(/[^a-z0-9]+/g, '_')).set({ prenom: p, status: 'accepted', device: 'admin', date: Date.now() });
  el('new-prenom').value = ''; notify('✅ ' + p + ' autorisé');
}
function shareAPK() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') return notify('❌ Réservé admin', 'error');
  const u = new URL('./index.html', location.href).href;
  if (navigator.share) navigator.share({ title: 'Auto Diagnostic Pro', text: 'Installez l\'APK :', url: u }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => notify('🔗 Lien copié'));
  else prompt('Lien :', u);
}
async function updateBase() { await db.ref('data/version').set({ version: Date.now(), lastUpdate: new Date().toISOString(), updateIntervalDays: 15 }); notify('✅ MAJ diffusée'); }

/* ----- admin base ----- */
function fillBrandSelects() {
  ['nm-brand', 'is-brand'].forEach(id => { const s = el(id); if (!s) return; s.innerHTML = ''; Object.entries(brandsData).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, b]) => { s.innerHTML += '<option value="' + k + '">' + esc(b.name) + '</option>'; }); });
  fillModelSelect(); fillModelSelectAdmin();
}
function fillModelSelect() {
  const b = val('is-brand');
  db.ref('data/models').once('value').then(s => { const sel = el('is-model'); sel.innerHTML = ''; Object.values(s.val() || {}).filter(m => m.brandId === b).forEach(m => { sel.innerHTML += '<option value="' + esc(m.name) + '">' + esc(m.name) + '</option>'; }); });
}
function fillModelSelectAdmin() {
  db.ref('data/models').once('value').then(s => { const sel = el('mo-model'); if (!sel) return; sel.innerHTML = ''; Object.entries(s.val() || {}).sort((a, b) => (brandsData[a[1].brandId] ? brandsData[a[1].brandId].name : '') .localeCompare(brandsData[b[1].brandId] ? brandsData[b[1].brandId].name : '')).forEach(([k, m]) => { const bn = brandsData[m.brandId] ? brandsData[m.brandId].name : m.brandId; sel.innerHTML += '<option value="' + k + '">' + esc(bn + ' ' + m.name) + '</option>'; }); });
}
async function addBrand() { const n = el('nb-name').value.trim(); if (!n) return notify('Nom requis', 'error'); await db.ref('data/brands/' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-')).set({ name: n, region: val('nb-region') }); el('nb-name').value = ''; notify('✅ Marque ajoutée'); }
async function addModel() { const b = val('nm-brand'), n = el('nm-name').value.trim(); if (!b || !n) return notify('Infos requises', 'error'); await db.ref('data/models/' + b + '_' + Date.now()).set({ brandId: b, name: n, years: el('nm-years').value.trim() || '2017-2026' }); el('nm-name').value = ''; notify('✅ Modèle ajouté'); }
async function addMotor() {
  const mid = val('mo-model'), n = el('mo-name').value.trim(); if (!mid || !n) return notify('Infos requises', 'error');
  const ref = db.ref('data/motors/' + mid); const s = await ref.once('value'); const a = s.val() || [];
  a.push({ name: n, fuel: val('mo-fuel'), power: el('mo-power').value.trim() }); await ref.set(a);
  el('mo-name').value = ''; notify('✅ Motorisation ajoutée');
}
async function addIssue() {
  const t = el('is-title').value.trim(); if (!t) return notify('Titre requis', 'error');
  await db.ref('data/issues/iss_' + Date.now()).set({ brandId: val('is-brand'), model: val('is-model'), title: t, detail: el('is-detail').value.trim(), source: val('is-source'), dtc: el('is-dtc').value.trim() });
  el('is-title').value = ''; el('is-detail').value = ''; notify('✅ Panne ajoutée');
}
async function addDTC() {
  const c = el('dt-code').value.trim().toUpperCase(), d = el('dt-desc').value.trim(); if (!c || !d) return notify('Code+description requis', 'error');
  await db.ref('data/dtc/' + c.replace(/[^A-Z0-9]+/g, '_')).set({ code: c, description: d, cause: el('dt-cause').value.trim(), solution: el('dt-sol').value.trim() });
  el('dt-code').value = ''; notify('✅ DTC ajouté');
}
/* IMPORT MASSIF */
async function importJSON() {
  const txt = el('import-json').value.trim(); if (!txt) return notify('Collez un JSON', 'error');
  let arr; try { arr = JSON.parse(txt); } catch (e) { return notify('❌ JSON invalide', 'error'); }
  if (!Array.isArray(arr)) arr = [arr];
  const ms = (await db.ref('data/models').once('value')).val() || {};
  let n = 0;
  for (const it of arr) {
    if (it.type === 'motor' && it.brand && it.model && it.name) {
      const e2 = Object.entries(ms).find(([k, m]) => m.brandId === it.brand && m.name.toLowerCase() === String(it.model).toLowerCase());
      if (e2) { const ref = db.ref('data/motors/' + e2[0]); const s = await ref.once('value'); const a = s.val() || []; a.push({ name: it.name, fuel: it.fuel || 'essence', power: it.power || '' }); await ref.set(a); n++; }
    } else if (it.type === 'issue' && it.brand && it.title) {
      await db.ref('data/issues/imp_' + Date.now() + '_' + n).set({ brandId: it.brand, model: it.model || '', motor: it.motor || '', title: it.title, detail: it.detail || '', source: it.source || 'Import', dtc: it.dtc || '' }); n++;
    } else if (it.type === 'dtc' && it.code) {
      await db.ref('data/dtc/' + String(it.code).toUpperCase().replace(/[^A-Z0-9]+/g, '_')).set({ code: String(it.code).toUpperCase(), description: it.description || '', cause: it.cause || '', solution: it.solution || '' }); n++;
    }
  }
  el('import-json').value = ''; notify('✅ ' + n + ' fiches importées');
}

/* ----- application corrélée ----- */
async function enterApp() {
  const s = getSession(); const isAdmin = sessionStorage.getItem('autodiag_admin') === '1';
  if (!isAdmin && (!s || s.status !== 'accepted')) return notify('Accès non autorisé', 'error');
  el('app-user').textContent = isAdmin ? '👑 Admin' : s.prenom;
  showScreen('screen-app');
  const v = (await db.ref('data/version').once('value')).val();
  el('app-version').textContent = v && v.lastUpdate ? new Date(v.lastUpdate).toLocaleDateString('fr-FR') : '1.0';
  brandsData = (await db.ref('data/brands').once('value')).val() || {};
  const sel = el('sel-marque');
  const regions = { francaises: '🇫🇷 Françaises', europeennes: '🇪 Européennes', asiatiques: '🌏 Asiatiques', chinoises: '🇨 Chinoises', americaines: '🇺🇸 Américaines' };
  sel.innerHTML = '<option value="">-- Choisir --</option>';
  Object.entries(regions).forEach(([r, label]) => {
    const items = Object.entries(brandsData).filter(([, b]) => b.region === r);
    if (!items.length) return;
    sel.innerHTML += '<optgroup label="' + label + '">' + items.map(([k, b]) => '<option value="' + k + '">' + esc(b.name) + '</option>').join('') + '</optgroup>';
  });
}
function logoutApp() { showScreen(sessionStorage.getItem('autodiag_admin') === '1' ? 'screen-admin' : 'screen-accepted'); }
async function loadModels() {
  curBrand = val('sel-marque'); curModelId = null; motorsCache = [];
  el('sel-model').innerHTML = '<option value="">-- Modèle --</option>';
  el('sel-motor').innerHTML = '<option value="">-- Motorisation --</option>';
  el('issues-box').innerHTML = '<p style="color:#94a3b8">Sélectionnez un modèle…</p>';
  el('dtc-box').innerHTML = '<p style="color:#94a3b8">—</p>';
  if (!curBrand) return;
  const s = (await db.ref('data/models').once('value')).val() || {};
  Object.entries(s).filter(([k, m]) => m.brandId === curBrand).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, m]) => { el('sel-model').innerHTML += '<option value="' + k + '">' + esc(m.name) + ' (' + esc(m.years) + ')</option>'; });
}
async function loadMotors() {
  curModelId = val('sel-model'); motorsCache = [];
  el('sel-motor').innerHTML = '<option value="">-- Motorisation --</option>';
  if (!curModelId) { correlate(); return; }
  const m = (await db.ref('data/models/' + curModelId).once('value')).val();
  curModelName = m ? m.name : '';
  motorsCache = (await db.ref('data/motors/' + curModelId).once('value')).val() || [];
  motorsCache.forEach((mo, i) => { el('sel-motor').innerHTML += '<option value="' + i + '">' + esc(mo.name) + ' • ' + (FUELS[mo.fuel] || mo.fuel) + (mo.power ? ' • ' + esc(mo.power) : '') + '</option>'; });
  correlate();
}
async function correlate() {
  const box = el('issues-box'), dbox = el('dtc-box');
  if (!curBrand || !curModelName) { box.innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule…</p>'; dbox.innerHTML = '<p style="color:#94a3b8">—</p>'; return; }
  const mi = val('sel-motor'); const motor = mi !== '' ? motorsCache[mi] : null;
  const fuel = motor ? motor.fuel : null;
  const all = Object.values((await db.ref('data/issues').once('value')).val() || {}).filter(i => i.brandId === curBrand && (!i.model || i.model === curModelName));
  const specific = motor ? all.filter(i => i.motor && motor.name.toLowerCase().includes(String(i.motor).toLowerCase())) : [];
  const general = all.filter(i => !specific.includes(i));
  let html = '';
  specific.forEach(i => html += issueCard(i, '🎯 '));
  general.forEach(i => html += issueCard(i, ''));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].issues.forEach(g => { html += '<div class="issue-card"><strong>' + g[0] + '</strong><span class="src">Typique ' + FUELS[fuel] + '</span><p>' + g[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + g[2] + '</p></div>'; });
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune panne en base — vérifiez les sites officiels ci-dessous.</p>';
  const codes = new Set();
  all.forEach(i => String(i.dtc || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].dtc.forEach(c => codes.add(c));
  const D = (await db.ref('data/dtc').once('value')).val() || {};
  let dh = '';
  codes.forEach(c => { const d = D[c] || D[c.replace(/[^A-Z0-9]+/g, '_')]; dh += d ? '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>' : '<div class="dtc-card"><strong>' + esc(c) + '</strong><p>Code corrélé (détail à importer)</p></div>'; });
  dbox.innerHTML = dh || '<p style="color:#94a3b8">—</p>';
}
function issueCard(i, prefix) { return '<div class="issue-card"><strong>' + prefix + esc(i.title) + '</strong><span class="src">' + esc(i.source || '') + '</span>' + (i.motor ? '<span class="src">' + esc(i.motor) + '</span>' : '') + '<p>' + esc(i.detail || '') + '</p>' + (i.dtc ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + esc(i.dtc) + '</p>' : '') + '</div>'; }
async function searchDTC() {
  const q = el('dtc-search').value.toUpperCase().trim(); const c = el('dtc-results');
  if (q.length < 2) { c.innerHTML = ''; return; }
  const m = Object.values((await db.ref('data/dtc').once('value')).val() || {}).filter(d => (d.code || '').toUpperCase().includes(q) || (d.description || '').toLowerCase().includes(q.toLowerCase()));
  c.innerHTML = m.length ? m.slice(0, 12).map(d => '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>').join('') : '<p style="color:#94a3b8">Aucun DTC trouvé</p>';
}

/* ----- install ----- */
function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; el('install-btn').classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { el('install-btn').classList.add('hidden'); notify('🎉 APK installée !'); });
}
async function installApp() { if (!deferredPrompt) return notify('Non disponible ici', 'error'); deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; el('install-btn').classList.add('hidden'); }
