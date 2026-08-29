// ============================================================
// AUTO-DIAGNOSTIC PRO - LOGIQUE ADMIN (version finale corrigée)
// - Chargement dynamique des bases si scripts manquants
// - Peuplement réel (bulkAdd) via bouton "Forcer la MAJ"
// - Boutons d'action sans bug (délégation d'événements)
// - Fond d'écran, Gemini, partage APK, tableaux récapitulatifs
// ============================================================

const ADMIN = {
  ADMIN_PASSWORD: "Kevin83600"
};

// ============================================================
// UTILITAIRES
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function getStatusClass(status) {
  const map = { pending: 'pending', approved: 'approved', denied: 'denied', revoked: 'revoked' };
  return map[status] || 'pending';
}

function getStatusLabel(status) {
  const map = {
    pending: '⏳ En attente',
    approved: '✅ Autorisé',
    denied: '❌ Refusé',
    revoked: '🚫 Révoqué'
  };
  return map[status] || status;
}

function formatDate(timestamp) {
  if (!timestamp) return '--';
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }// ============================================================
// ADMIN = UTILISATEUR AUTORISÉ (accès direct aux tiroirs)
// ============================================================
async function ensureAdminUser() {
  try {
    const list = await DB.query('users', u => u.firstName === 'Admin');
    let adminUser;

    if (list.length > 0) {
      adminUser = list[0];
      if (adminUser.status !== 'approved') {
        adminUser.status = 'approved';
        await DB.update('users', adminUser);
      }
    } else {
      const id = await DB.add('users', {
        firstName: 'Admin',
        status: 'approved',
        requestDate: Date.now(),
        lastAccess: null,
        isAdmin: true
      });
      adminUser = { id: id, firstName: 'Admin', status: 'approved', isAdmin: true };
    }

    // Session utilisateur approuvée pour index.html
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
  } catch (e) {
    console.warn('ensureAdminUser:', e);
  }
});
}

// ============================================================
// CHARGEMENT DYNAMIQUE DES DÉPENDANCES (correctif clé)
// Si admin.html oublie vehicles-db.js / dtc-db.js / recalls-db.js,
// admin.js les injecte automatiquement.
// ============================================================
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Impossible de charger ' + src));
    document.head.appendChild(s);
  });
}

async function ensureDependencies() {
  const needed = [
    { obj: 'VEHICLES_DB', src: 'vehicles-db.js' },
    { obj: 'DTC_DB', src: 'dtc-db.js' },
    { obj: 'RECALLS_DB', src: 'recalls-db.js' }
  ];
  for (const dep of needed) {
    if (typeof window[dep.obj] === 'undefined') {
      console.log('📦 Chargement dynamique de ' + dep.src);
      await loadScript(dep.src);
    }
  }
}

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await DB.init();
    await ensureDependencies();
    await VEHICLES_DB.init();
    await DTC_DB.init();
    await RECALLS_DB.init();
  } catch (e) {
    console.error("❌ Erreur initialisation bases:", e);
    showToast('Erreur initialisation: ' + e.message, 'error');
  }

    await ensureAdminUser();
  await loadAll();
  bindEvents();
});

async function loadAll() {
  await loadPendingRequests();
  await loadUsersTable();
  await loadSummaryTable();
  await loadDBStats();
  loadGeminiKey();
  await loadBgImage();
}

// ============================================================
// DEMANDES D'ACCÈS EN ATTENTE
// ============================================================
async function loadPendingRequests() {
  const container = document.getElementById('pendingRequests');
  if (!container) return;

  const pending = await DB.getByIndex('users', 'status', 'pending');

  // Badge compteur sur l'onglet Demandes
  const tabReq = document.querySelector('.tab[data-tab="requests"]');
  if (tabReq) {
    tabReq.innerHTML = pending.length > 0
      ? `📨 Demandes (${pending.length})`
      : '📨 Demandes';
  }

  if (pending.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:14px">✅ Aucune demande en attente</p>';
    return;
  }

  container.innerHTML = pending.map(user => `
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div>
        <strong style="font-size:16px">👤 ${escapeHtml(user.firstName)}</strong>
        <p style="font-size:12px;color:var(--text-muted)">Demandé le ${formatDate(user.requestDate)}</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-success btn-sm" data-action="approve" data-id="${user.id}" data-name="${escapeHtml(user.firstName)}">✅ Autoriser</button>
        <button class="btn btn-danger btn-sm" data-action="deny" data-id="${user.id}" data-name="${escapeHtml(user.firstName)}">❌ Refuser</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleUserAction(btn.dataset.action, parseInt(btn.dataset.id), btn.dataset.name);
    });
  });
}

// ============================================================
// ACTIONS UTILISATEURS
// ============================================================
async function handleUserAction(action, userId, firstName) {
  const user = await DB.get('users', userId);
  if (!user) {
    showToast('❌ Utilisateur introuvable', 'error');
    return;
  }

  const now = Date.now();

  switch (action) {
    case 'approve':
      user.status = 'approved';
      user.approvedDate = now;
      delete user.revokedDate;
      delete user.deniedDate;
      await DB.update('users', user);
      await resolveRequests(firstName, 'approved');
      showToast(`✅ ${firstName} autorisé`, 'success');
      break;

    case 'deny':
      user.status = 'denied';
      user.deniedDate = now;
      await DB.update('users', user);
      await resolveRequests(firstName, 'denied');
      showToast(`❌ ${firstName} refusé`, 'warning');
      break;

    case 'revoke':
      if (!confirm(`Révoquer l'accès de ${firstName} ?`)) return;
      user.status = 'revoked';
      user.revokedDate = now;
      await DB.update('users', user);
      showToast(`🚫 Accès de ${firstName} révoqué`, 'warning');
      break;

    case 'reactivate':
      user.status = 'approved';
      user.approvedDate = now;
      delete user.revokedDate;
      delete user.deniedDate;
      await DB.update('users', user);
      showToast(`✅ ${firstName} réactivé`, 'success');
      break;
  }

  await loadAll();
}

async function resolveRequests(firstName, status) {
  try {
    const requests = await DB.getByIndex('accessRequests', 'firstName', firstName);
    for (const req of requests) {
      if (req.status === 'pending') {
        req.status = status;
        req.resolvedDate = Date.now();
        await DB.update('accessRequests', req);
      }
    }
  } catch (e) {
    console.warn('Store accessRequests indisponible:', e);
  }
}

// ============================================================
// TABLEAU UTILISATEURS
// ============================================================
async function loadUsersTable() {
  const container = document.getElementById('usersTable');
  if (!container) return;

  const users = await DB.getAll('users');

  if (users.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted)">Aucun utilisateur enregistré</p>';
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Statut</th>
            <th>Demande</th>
            <th>Dernier accès</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td><strong>${escapeHtml(u.firstName)}</strong></td>
              <td><span class="status-pill ${getStatusClass(u.status)}">${getStatusLabel(u.status)}</span></td>
              <td style="font-size:11px">${formatDate(u.requestDate)}</td>
              <td style="font-size:11px">${u.lastAccess ? formatDate(u.lastAccess) : 'Jamais'}</td>
              <td>
                ${u.status === 'approved'
                  ? `<button class="btn btn-danger btn-sm" data-action="revoke" data-id="${u.id}" data-name="${escapeHtml(u.firstName)}">Révoquer</button>`
                  : (u.status === 'revoked' || u.status === 'denied')
                    ? `<button class="btn btn-success btn-sm" data-action="reactivate" data-id="${u.id}" data-name="${escapeHtml(u.firstName)}">Réactiver</button>`
                    : `<button class="btn btn-success btn-sm" data-action="approve" data-id="${u.id}" data-name="${escapeHtml(u.firstName)}">Autoriser</button>`
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleUserAction(btn.dataset.action, parseInt(btn.dataset.id), btn.dataset.name);
    });
  });
}

// ============================================================
// TABLEAU RÉCAPITULATIF AUTORISATIONS / RÉVOCATIONS
// ============================================================
async function loadSummaryTable() {
  const container = document.getElementById('summaryTable');
  if (!container) return;

  const users = await DB.getAll('users');
  let requests = [];
  try { requests = await DB.getAll('accessRequests'); } catch (e) { /* store vide */ }

  const pending = users.filter(u => u.status === 'pending').length;
  const approved = users.filter(u => u.status === 'approved').length;
  const denied = users.filter(u => u.status === 'denied').length;
  const revoked = users.filter(u => u.status === 'revoked').length;

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px">
      <div class="stat-item">
        <div class="stat-value" style="color:var(--warning)">${pending}</div>
        <div class="stat-label">En attente</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" style="color:var(--success)">${approved}</div>
        <div class="stat-label">Autorisés</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" style="color:var(--danger)">${denied}</div>
        <div class="stat-label">Refusés</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" style="color:var(--text-muted)">${revoked}</div>
        <div class="stat-label">Révoqués</div>
      </div>
    </div>

    <h3 style="margin-bottom:8px">📜 Historique des demandes</h3>
    <div style="overflow-x:auto;max-height:300px;overflow-y:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Date demande</th>
            <th>Résolution</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${requests.sort((a, b) => (b.requestDate || 0) - (a.requestDate || 0)).map(r => `
            <tr>
              <td>${escapeHtml(r.firstName)}</td>
              <td style="font-size:11px">${formatDate(r.requestDate)}</td>
              <td style="font-size:11px">${r.resolvedDate ? formatDate(r.resolvedDate) : '--'}</td>
              <td><span class="status-pill ${getStatusClass(r.status)}">${getStatusLabel(r.status)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================================
// STATISTIQUES BASE
// ============================================================
async function loadDBStats() {
  const container = document.getElementById('dbStats');
  if (!container) return;

  try {
    const vehicles = await DB.getAll('vehicles');
    const dtcCodes = await DB.getAll('dtcCodes');
    const recalls = await DB.getAll('recalls');
    const users = await DB.getAll('users');

    // Nombre total de configurations (années × motorisations)
    const totalConfigs = vehicles.reduce((acc, v) =>
      acc + ((v.years ? v.years.length : 0) * (v.engines ? v.engines.length : 0)), 0);

    const lastUpdate = localStorage.getItem('lastDbUpdate');
    const nextUpdate = lastUpdate
      ? new Date(parseInt(lastUpdate) + 15 * 24 * 60 * 60 * 1000)
      : null;

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:16px">
        <div class="stat-item">
          <div class="stat-value">${vehicles.length}</div>
          <div class="stat-label">Modèles</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${totalConfigs}</div>
          <div class="stat-label">Configurations</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${dtcCodes.length}</div>
          <div class="stat-label">Codes DTC</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${recalls.length}</div>
          <div class="stat-label">Rappels</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${users.length}</div>
          <div class="stat-label">Utilisateurs</div>
        </div>
      </div>
      <p style="font-size:13px;color:var(--text-secondary)">
        📅 Dernière MAJ: ${lastUpdate ? new Date(parseInt(lastUpdate)).toLocaleDateString('fr-FR') : 'Jamais'}<br>
        🔄 Prochaine MAJ auto: ${nextUpdate ? nextUpdate.toLocaleDateString('fr-FR') : 'Dans 15 jours'}
      </p>
    `;
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger)">❌ Erreur lecture stats: ${e.message}</p>`;
  }
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================
function bindEvents() {

  // ----- Onglets -----
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      const content = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
      if (content) content.classList.add('active');
    });
  });

  // ----- Bouton ⚙️ (header) -> onglet Réglages -----
  const btnSettings = document.getElementById('btnSettings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      const tab = document.querySelector('.tab[data-tab="settings"]');
      if (tab) tab.click();
    });
  }

  // ----- Actualiser -----
  const btnRefresh = document.getElementById('btnRefresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      await loadAll();
      showToast('🔄 Données actualisées', 'info');
    });
  }

  // ----- Déconnexion admin -----
  const btnAdminLogout = document.getElementById('btnAdminLogout');
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      sessionStorage.removeItem('adminLogged');
      window.location.href = 'index.html';
    });
  }

  // ----- FORCER LA MISE À JOUR (peuplement RÉEL) -----
  const btnForceUpdate = document.getElementById('btnForceUpdate');
  if (btnForceUpdate) {
    btnForceUpdate.addEventListener('click', async () => {
      const status = document.getElementById('updateStatus');
      if (!status) return;
      status.classList.remove('hidden');
      status.className = 'status-box pending';
      status.textContent = '🔄 Mise à jour en cours...';

      try {
        await ensureDependencies();

        await DB.clear('vehicles');
        await VEHICLES_DB.populate();

        await DB.clear('recalls');
        await RECALLS_DB.populate();

        await DB.clear('dtcCodes');
        await DTC_DB.populate();

        localStorage.setItem('lastDbUpdate', Date.now().toString());

        status.className = 'status-box approved';
        status.textContent = '✅ Base mise à jour avec succès';
        showToast('✅ Base de données mise à jour', 'success');
        await loadDBStats();
      } catch (e) {
        console.error(e);
        status.className = 'status-box denied';
        status.textContent = '❌ Erreur: ' + e.message;
        showToast('❌ Erreur mise à jour', 'error');
      }
    });
  }

  // ----- Fond d'écran personnalisé -----
  const btnUploadBg = document.getElementById('btnUploadBg');
  const bgImageInput = document.getElementById('bgImageInput');
  if (btnUploadBg && bgImageInput) {
    btnUploadBg.addEventListener('click', () => bgImageInput.click());

    bgImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        showToast('Format non supporté. Utilisez JPEG ou PNG.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const preview = document.getElementById('bgPreview');
        if (preview) {
          preview.innerHTML = `<img src="${dataUrl}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)">`;
        }
        const btnApply = document.getElementById('btnApplyBg');
        const btnReset = document.getElementById('btnResetBg');
        if (btnApply) btnApply.classList.remove('hidden');
        if (btnReset) btnReset.classList.remove('hidden');

        localStorage.setItem('customBgImage', dataUrl);
        showToast('🖼️ Image chargée. Cliquez sur Appliquer.', 'info');
      };
      reader.readAsDataURL(file);
    });
  }

  const btnApplyBg = document.getElementById('btnApplyBg');
  if (btnApplyBg) {
    btnApplyBg.addEventListener('click', async () => {
      const bgImage = localStorage.getItem('customBgImage');
      if (!bgImage) {
        showToast('❌ Aucune image chargée', 'error');
        return;
      }
      try {
        await DB.update('meta', { key: 'customBgImage', value: bgImage });
      } catch (e) { /* meta indisponible */ }
      document.body.style.setProperty('--custom-bg-image', `url(${bgImage})`);
      document.body.classList.add('custom-bg');
      showToast('✅ Fond d\'écran appliqué à tous les appareils', 'success');
    });
  }

  const btnResetBg = document.getElementById('btnResetBg');
  if (btnResetBg) {
    btnResetBg.addEventListener('click', async () => {
      localStorage.removeItem('customBgImage');
      try { await DB.delete('meta', 'customBgImage'); } catch (e) { /* ignore */ }
      document.body.classList.remove('custom-bg');
      const preview = document.getElementById('bgPreview');
      if (preview) preview.innerHTML = '';
      const btnApply = document.getElementById('btnApplyBg');
      const btnReset2 = document.getElementById('btnResetBg');
      if (btnApply) btnApply.classList.add('hidden');
      if (btnReset2) btnReset2.classList.add('hidden');
      showToast('🗑️ Fond d\'écran réinitialisé', 'info');
    });
  }

  // ----- Clé API Gemini -----
  const btnSaveGeminiKey = document.getElementById('btnSaveGeminiKey');
  if (btnSaveGeminiKey) {
    btnSaveGeminiKey.addEventListener('click', () => {
      const key = document.getElementById('geminiKey').value.trim();
      const status = document.getElementById('geminiStatus');
      if (!status) return;
      status.classList.remove('hidden');

      if (!key) {
        status.className = 'status-box denied';
        status.textContent = '❌ Entrez une clé valide';
        return;
      }

      localStorage.setItem('GEMINI_API_KEY', key);
      if (typeof AI_SEARCH !== 'undefined') AI_SEARCH.saveApiKey(key);
      status.className = 'status-box approved';
      status.textContent = '✅ Clé Gemini enregistrée';
      showToast('✅ Clé API Gemini enregistrée', 'success');
    });
  }

  // ----- Notifications -----
  const btnNotifPermission = document.getElementById('btnNotifPermission');
  if (btnNotifPermission) {
    btnNotifPermission.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showToast('Notifications non supportées', 'error');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('✅ Notifications activées', 'success');
      } else {
        showToast('❌ Notifications refusées', 'error');
      }
    });
  }

  // ----- Partage APK (admin uniquement) -----
  const btnShareAPK = document.getElementById('btnShareAPK');
  if (btnShareAPK) btnShareAPK.addEventListener('click', () => generateShareLink());

  const btnGenerateShareLink = document.getElementById('btnGenerateShareLink');
  if (btnGenerateShareLink) btnGenerateShareLink.addEventListener('click', () => generateShareLink());

  const btnCopyLink = document.getElementById('btnCopyLink');
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', async () => {
      const link = document.getElementById('shareLink');
      if (!link) return;
      try {
        await navigator.clipboard.writeText(link.value);
      } catch (e) {
        link.select();
        document.execCommand('copy');
      }
      showToast('📋 Lien copié', 'success');
    });
  }

  // ----- Réinitialisation complète -----
  const btnResetDB = document.getElementById('btnResetDB');
  if (btnResetDB) {
    btnResetDB.addEventListener('click', async () => {
      if (!confirm('⚠️ ATTENTION: Toutes les données seront effacées. Continuer ?')) return;
      if (!confirm('Êtes-vous VRAIMENT sûr ? Cette action est irréversible.')) return;

      try {
        await DB.clear('vehicles');
        await DB.clear('dtcCodes');
        await DB.clear('recalls');
        await DB.clear('users');
        await DB.clear('accessRequests');
        await DB.clear('meta');
      } catch (e) { /* stores vides */ }

      localStorage.clear();
      showToast('🗑️ Base réinitialisée, rechargement...', 'warning');
      setTimeout(() => window.location.reload(), 1200);
    });
  }

  // ----- Changement mot de passe admin -----
  const btnChangePassword = document.getElementById('btnChangePassword');
  if (btnChangePassword) {
    btnChangePassword.addEventListener('click', () => {
      const newPass = prompt('Nouveau mot de passe admin (6 caractères min):');
      if (newPass === null) return;
      if (newPass.length >= 6) {
        ADMIN.ADMIN_PASSWORD = newPass;
        localStorage.setItem('ADMIN_PASSWORD', newPass);
        showToast('✅ Mot de passe admin modifié', 'success');
      } else {
        showToast('❌ Mot de passe trop court (min 6 caractères)', 'error');
      }
    });
  }

  // ----- Fermeture modal -----
  const modalClose = document.getElementById('modalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      const modal = document.getElementById('detailModal');
      if (modal) modal.classList.add('hidden');
    });
  }
}

// ============================================================
// PARTAGE APK (réservé admin)
// ============================================================
function generateShareLink() {
  const baseUrl = window.location.origin || window.location.href;
  const shareLink = `${baseUrl}/download/auto-diagnostic-pro.apk?admin=${btoa(ADMIN.ADMIN_PASSWORD)}`;

  const container = document.getElementById('shareLinkContainer');
  const linkInput = document.getElementById('shareLink');

  if (container && linkInput) {
    linkInput.value = shareLink;
    container.classList.remove('hidden');
  }

  if (navigator.share) {
    navigator.share({
      title: 'Auto Diagnostic Pro - APK',
      text: 'Téléchargez l\'application Auto Diagnostic Pro',
      url: shareLink
    }).catch(() => {});
  }

  showToast('🔗 Lien de partage généré', 'success');
}

// ============================================================
// FOND D'ÉCRAN AU DÉMARRAGE
// ============================================================
async function loadBgImage() {
  try {
    let saved = null;
    try {
      const meta = await DB.get('meta', 'customBgImage');
      saved = meta ? meta.value : null;
    } catch (e) { /* meta vide */ }
    if (!saved) saved = localStorage.getItem('customBgImage');

    if (saved) {
      document.body.style.setProperty('--custom-bg-image', `url(${saved})`);
      document.body.classList.add('custom-bg');
      const preview = document.getElementById('bgPreview');
      if (preview) {
        preview.innerHTML = `<img src="${saved}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)">`;
      }
      const btnApply = document.getElementById('btnApplyBg');
      const btnReset = document.getElementById('btnResetBg');
      if (btnApply) btnApply.classList.remove('hidden');
      if (btnReset) btnReset.classList.remove('hidden');
    }
  } catch (e) {
    // Pas de fond personnalisé
  }
}

// ============================================================
// CLÉ GEMINI AU DÉMARRAGE
// ============================================================
function loadGeminiKey() {
  const key = localStorage.getItem('GEMINI_API_KEY');
  const input = document.getElementById('geminiKey');
  const status = document.getElementById('geminiStatus');

  if (key && input) {
    input.value = key;
    if (status) {
      status.classList.remove('hidden');
      status.className = 'status-box approved';
      status.textContent = '✅ Clé Gemini configurée';
    }
  }
}
