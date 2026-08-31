/* =====================================================
   ADMIN.JS - Gestion des tiers + publication + partage APK
   ===================================================== */
const ADMIN_PASSWORD = 'Kevin83600';
const LS_SESSION = 'appsec_session';
const LS_REQUESTS = 'appsec_requests';

let users = [];          // liste de travail
let remoteVersion = 1;   // version actuelle de access.json
let dirty = false;

function $(id) { return document.getElementById(id); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  $(id).style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('appsec_admin') === '1') {
    enterPanel();
  } else {
    showScreen('admin-login');
  }
  bind();
});

function bind() {
  $('btn-login').addEventListener('click', login);
  $('admin-pwd').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('btn-back').addEventListener('click', () => { location.href = './index.html'; });
  $('btn-add').addEventListener('click', addUser);
  $('btn-generate').addEventListener('click', generateJSON);
  $('btn-share-apk').addEventListener('click', shareAPK);
  $('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('appsec_admin');
    location.href = './index.html';
  });
}

/* ===== CONNEXION ADMIN ===== */
function login() {
  if ($('admin-pwd').value === ADMIN_PASSWORD) {
    sessionStorage.setItem('appsec_admin', '1');
    $('admin-pwd').value = '';
    enterPanel();
  } else {
    alert('❌ Mot de passe incorrect');
  }
}

async function enterPanel() {
  showScreen('admin-panel');
  await loadAll();
  loadVersionInfo();
}

/* ===== CHARGEMENT : access.json publié + demandes locales ===== */
async function loadAll() {
  users = [];
  remoteVersion = 1;

  /* 1. Données publiées sur GitHub (fait foi pour tous les APK) */
  try {
    const res = await fetch('./access.json?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      remoteVersion = data.version || 1;
      if (Array.isArray(data.users)) users = data.users.slice();
    }
  } catch (e) { /* hors-ligne : on garde le local */ }

  /* 2. Demandes locales (tests sur le même appareil) */
  const local = [];
  try { local.push(...JSON.parse(localStorage.getItem(LS_REQUESTS) || '[]')); } catch (e) {}
  const sess = localStorage.getItem(LS_SESSION);
  if (sess) { try { local.push(JSON.parse(sess)); } catch (e) {} }

  local.forEach(u => {
    if (!u || !u.prenom) return;
    const exists = users.find(x => x.prenom.toLowerCase() === u.prenom.toLowerCase());
    if (!exists) users.push({ prenom: u.prenom, status: 'pending', date: u.date || new Date().toISOString() });
  });

  render();
}

/* ===== TABLEAU RÉCAPITULATIF ===== */
function render() {
  const tbody = $('users-body');
  tbody.innerHTML = '';

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Aucun tiers enregistré</td></tr>';
    return;
  }

  const sorted = users.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const labels = {
    pending:  ['En attente', 'pending'],
    accepted: ['Accepté',   'accepted'],
    refused:  ['Refusé',    'refused'],
    revoked:  ['Révoqué',   'revoked']
  };

  sorted.forEach(u => {
    const i = users.indexOf(u);
    const st = labels[u.status] || labels.pending;
    const tr = document.createElement('tr');
    let actions = '';
    if (u.status === 'pending') {
      actions += '<button class="btn-action accept" data-i="' + i + '" data-s="accepted" title="Autoriser">✓</button>';
      actions += '<button class="btn-action refuse" data-i="' + i + '" data-s="refused" title="Refuser">✗</button>';
    }
    if (u.status === 'accepted') {
      actions += '<button class="btn-action revoke" data-i="' + i + '" data-s="revoked" title="Révoquer">🔒</button>';
    }
    if (u.status === 'refused' || u.status === 'revoked') {
      actions += '<button class="btn-action reaccept" data-i="' + i + '" data-s="accepted" title="Réautoriser">↻</button>';
    }
    tr.innerHTML =
      '<td><strong>' + escapeHtml(u.prenom) + '</strong></td>' +
      '<td><span class="badge ' + st[1] + '">' + st[0] + '</span></td>' +
      '<td class="date-cell">' + new Date(u.date).toLocaleDateString('fr-FR') + '</td>' +
      '<td>' + actions + '</td>';
    tbody.appendChild(tr);
  });

  /* Délégation des clics sur les boutons d'action */
  tbody.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i, 10);
      users[i].status = btn.dataset.s;
      dirty = true;
      updateDirty();
      render();
    });
  });
}

function addUser() {
  const prenom = $('add-prenom').value.trim();
  if (prenom.length < 2) { alert('Prénom invalide'); return; }
  const exists = users.find(u => u.prenom.toLowerCase() === prenom.toLowerCase());
  if (exists) { alert('Ce tiers existe déjà'); return; }
  users.push({ prenom: prenom, status: 'accepted', date: new Date().toISOString() });
  $('add-prenom').value = '';
  dirty = true;
  updateDirty();
  render();
}

function updateDirty() {
  $('dirty-badge').classList.toggle('hidden', !dirty);
}

/* ===== GÉNÉRATION + COPIE du access.json à publier ===== */
async function generateJSON() {
  const payload = { version: remoteVersion + 1, users: users };
  const text = JSON.stringify(payload, null, 2);
  $('publish-json').value = text;
  try {
    await navigator.clipboard.writeText(text);
    alert('✅ access.json copié !\n\nCollez-le maintenant dans le fichier access.json sur GitHub (bouton ci-dessus), puis Commit.');
  } catch (e) {
    prompt('Copiez ce contenu puis collez-le dans access.json sur GitHub :', text);
  }
  dirty = false;
  updateDirty();
}

/* ===== PARTAGE APK (réservé admin) ===== */
function shareAPK() {
  const url = new URL('./index.html', location.href).href;
  const data = {
    title: 'Auto Diagnostic',
    text: 'Installez l\'application Auto Diagnostic :',
    url: url
  };
  if (navigator.share) {
    navigator.share(data).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert('🔗 Lien copié :\n' + url));
  } else {
    prompt('Copiez ce lien :', url);
  }
}

/* ===== INFO VERSION ===== */
async function loadVersionInfo() {
  try {
    const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const v = await res.json();
      $('version-info').innerHTML =
        'Version publiée : <strong>' + v.appVersion + '</strong> | ' +
        'Version minimum imposée : <strong>' + v.minAppVersion + '</strong> | ' +
        'Dernière mise à jour : ' + v.lastUpdate + ' | Cycle : ' + v.updateIntervalDays + ' jours';
      return;
    }
  } catch (e) {}
  $('version-info').textContent = 'version.json introuvable — créez-le à la racine du dépôt.';
}

function escapeHtml(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}
