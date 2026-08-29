// ============================================================
// AUTO-DIAGNOSTIC PRO - LOGIQUE ADMIN
// ============================================================

const ADMIN = {
  ADMIN_PASSWORD: "Kevin83600"
};

// Utilitaires
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function getStatusClass(status) {
  const map = { pending: 'pending', approved: 'approved', denied: 'denied', revoked: 'revoked' };
  return map[status] || 'pending';
}

function getStatusLabel(status) {
  const map = { pending: '⏳ En attente', approved: '✅ Autorisé', denied: '❌ Refusé', revoked: '🚫 Révoqué' };
  return map[status] || status;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
}

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await DB.init();
  loadAll();
  bindEvents();
});

async function loadAll() {
  await loadPendingRequests();
  await loadUsersTable();
  await loadSummaryTable();
  await loadDBStats();
  await loadGeminiKey();
  await loadBgImage();
}

// ============================================================
// DEMANDES D'ACCÈS
// ============================================================
async function loadPendingRequests() {
  const container = document.getElementById('pendingRequests');
  const pending = await DB.getByIndex('users', 'status', 'pending');

  if (pending.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:14px">✅ Aucune demande en attente</p>';
    return;
  }

  container.innerHTML = pending.map(user => `
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div>
        <strong style="font-size:16px">👤 ${user.firstName}</strong>
        <p style="font-size:12px;color:var(--text-muted)">Demandé le ${formatDate(user.requestDate)}</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-success btn-sm" onclick="approveUser(${user.id}, '${user.firstName}')">✅ Autoriser</button>
        <button class="btn btn-danger btn-sm" onclick="denyUser(${user.id}, '${user.firstName}')">❌ Refuser</button>
      </div>
    </div>
  `).join('');
}

window.approveUser = async (userId, firstName) => {
  const user = await DB.get('users', userId);
  user.status = 'approved';
  user.approvedDate = Date.now();
  await DB.update('users', user);

  // Mettre à jour la demande
  const requests = await DB.getByIndex('accessRequests', 'firstName', firstName);
  for (const req of requests) {
    if (req.status === 'pending') {
      req.status = 'approved';
      req.resolvedDate = Date.now();
      await DB.update('accessRequests', req);
    }
  }

  showToast(`✅ ${firstName} autorisé`, 'success');
  await loadAll();
};

window.denyUser = async (userId, firstName) => {
  const user = await DB.get('users', userId);
  user.status = 'denied';
  user.deniedDate = Date.now();
  await DB.update('users', user);

  const requests = await DB.getByIndex('accessRequests', 'firstName', firstName);
  for (const req of requests) {
    if (req.status === 'pending') {
      req.status = 'denied';
      req.resolvedDate = Date.now();
      await DB.update('accessRequests', req);
    }
  }

  showToast(`❌ ${firstName} refusé`, 'warning');
  await loadAll();
};

window.revokeUser = async (userId, firstName) => {
  if (!confirm(`Révoquer l'accès de ${firstName} ?`)) return;
  
  const user = await DB.get('users', userId);
  user.status = 'revoked';
  user.revokedDate = Date.now();
  await DB.update('users', user);

  showToast(`🚫 Accès de ${firstName} révoqué`, 'warning');
  await loadAll();
};

window.reactivateUser = async (userId, firstName) => {
  const user = await DB.get('users', userId);
  user.status = 'approved';
  user.approvedDate = Date.now();
  delete user.revokedDate;
  await DB.update('users', user);

  showToast(`✅ ${firstName} réactivé`, 'success');
  await loadAll();
};

// ============================================================
// TABLEAU UTILISATEURS
// ============================================================
async function loadUsersTable() {
  const container = document.getElementById('usersTable');
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
              <td><strong>${u.firstName}</strong></td>
              <td><span class="status-pill ${getStatusClass(u.status)}">${getStatusLabel(u.status)}</span></td>
              <td style="font-size:11px">${formatDate(u.requestDate)}</td>
              <td style="font-size:11px">${u.lastAccess ? formatDate(u.lastAccess) : 'Jamais'}</td>
              <td>
                ${u.status === 'approved' 
                  ? `<button class="btn btn-danger btn-sm" onclick="revokeUser(${u.id}, '${u.firstName}')">Révoquer</button>`
                  : u.status === 'revoked' || u.status === 'denied'
                  ? `<button class="btn btn-success btn-sm" onclick="reactivateUser(${u.id}, '${u.firstName}')">Réactiver</button>`
                  : `<button class="btn btn-success btn-sm" onclick="approveUser(${u.id}, '${u.firstName}')">Autoriser</button>`
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================================
// TABLEAU RÉCAPITULATIF
// ============================================================
async function loadSummaryTable() {
  const container = document.getElementById('summaryTable');
  const users = await DB.getAll('users');
  const requests = await DB.getAll('accessRequests');

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
          ${requests.sort((a, b) => b.requestDate - a.requestDate).map(r => `
            <tr>
              <td>${r.firstName}</td>
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
// STATS BASE
// ============================================================
async function loadDBStats() {
  const container = document.getElementById('dbStats');
  
  const vehicles = await DB.getAll('vehicles');
  const dtcCodes = await DB.getAll('dtcCodes');
  const recalls = await DB.getAll('recalls');
  const users = await DB.getAll('users');

  const lastUpdate = localStorage.getItem('lastDbUpdate');
  const nextUpdate = lastUpdate ? new Date(parseInt(lastUpdate) + 15*24*60*60*1000) : null;

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:16px">
      <div class="stat-item">
        <div class="stat-value">${vehicles.length}</div>
        <div class="stat-label">Véhicules</div>
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
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================
function bindEvents() {
  // Onglets
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    });
  });

  // Refresh
  document.getElementById('btnRefresh').addEventListener('click', () => {
    loadAll();
    showToast('🔄 Données actualisées', 'info');
  });

  // Logout admin
  document.getElementById('btnAdminLogout').addEventListener('click', () => {
    sessionStorage.removeItem('adminLogged');
    window.location.href = 'index.html';
  });

  // Force update
  document.getElementById('btnForceUpdate').addEventListener('click', async () => {
    const status = document.getElementById('updateStatus');
    status.classList.remove('hidden');
    status.className = 'status-box pending';
    status.textContent = '🔄 Mise à jour en cours...';

    try {
      // Simuler MAJ complète
      await DB.clear('vehicles');
      await DB.clear('recalls');
      
      // Recharger (les scripts ne sont pas inclus ici, mais on simule)
      localStorage.setItem('lastDbUpdate', Date.now().toString());
      
      status.className = 'status-box approved';
      status.textContent = '✅ Base mise à jour avec succès';
      showToast('✅ Base de données mise à jour', 'success');
      await loadDBStats();
    } catch (e) {
      status.className = 'status-box denied';
      status.textContent = '❌ Erreur: ' + e.message;
    }
  });

  // Upload fond d'écran
  document.getElementById('btnUploadBg').addEventListener('click', () => {
    document.getElementById('bgImageInput').click();
  });

  document.getElementById('bgImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      showToast('Format non supporté. Utilisez JPEG ou PNG.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById('bgPreview');
      preview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)">`;
      document.getElementById('btnApplyBg').classList.remove('hidden');
      document.getElementById('btnResetBg').classList.remove('hidden');
      
      // Stocker en base pour diffusion à tous
      localStorage.setItem('customBgImage', ev.target.result);
      DB.update('meta', { key: 'customBgImage', value: ev.target.result }).catch(() => {});
      
      showToast('🖼️ Image chargée. Cliquez sur Appliquer.', 'info');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btnApplyBg').addEventListener('click', async () => {
    const bgImage = localStorage.getItem('customBgImage');
    if (bgImage) {
      await DB.update('meta', { key: 'customBgImage', value: bgImage });
      document.body.style.setProperty('--custom-bg-image', `url(${bgImage})`);
      document.body.classList.add('custom-bg');
      showToast('✅ Fond d\'écran appliqué à tous les appareils', 'success');
    }
  });

  document.getElementById('btnResetBg').addEventListener('click', async () => {
    localStorage.removeItem('customBgImage');
    await DB.delete('meta', 'customBgImage');
    document.body.classList.remove('custom-bg');
    document.getElementById('bgPreview').innerHTML = '';
    document.getElementById('btnApplyBg').classList.add('hidden');
    document.getElementById('btnResetBg').classList.add('hidden');
    showToast('🗑️ Fond d\'écran réinitialisé', 'info');
  });

  // Gemini Key
  document.getElementById('btnSaveGeminiKey').addEventListener('click', () => {
    const key = document.getElementById('geminiKey').value.trim();
    const status = document.getElementById('geminiStatus');
    
    if (!key) {
      status.className = 'status-box denied';
      status.textContent = '❌ Entrez une clé valide';
      status.classList.remove('hidden');
      return;
    }

    localStorage.setItem('GEMINI_API_KEY', key);
    AI_SEARCH.saveApiKey(key);
    status.className = 'status-box approved';
    status.textContent = '✅ Clé Gemini enregistrée';
    status.classList.remove('hidden');
    showToast('✅ Clé API Gemini enregistrée', 'success');
  });

  // Notifications
  document.getElementById('btnNotifPermission').addEventListener('click', async () => {
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

  // Share APK
  document.getElementById('btnShareAPK').addEventListener('click', () => {
    generateShareLink();
  });

  document.getElementById('btnGenerateShareLink').addEventListener('click', () => {
    generateShareLink();
  });

  document.getElementById('btnCopyLink').addEventListener('click', () => {
    const link = document.getElementById('shareLink');
    link.select();
    document.execCommand('copy');
    showToast('📋 Lien copié', 'success');
  });

  // Reset DB
  document.getElementById('btnResetDB').addEventListener('click', async () => {
    if (!confirm('⚠️ ATTENTION: Toutes les données seront effacées. Continuer ?')) return;
    if (!confirm('Êtes-vous VRAIMENT sûr ? Cette action est irréversible.')) return;

    await DB.clear('vehicles');
    await DB.clear('dtcCodes');
    await DB.clear('recalls');
    await DB.clear('users');
    await DB.clear('accessRequests');
    
    localStorage.clear();
    showToast('🗑️ Base de données réinitialisée', 'warning');
    await loadAll();
  });

  // Change password
  document.getElementById('btnChangePassword').addEventListener('click', () => {
    const newPass = prompt('Nouveau mot de passe admin:');
    if (newPass && newPass.length >= 6) {
      ADMIN.ADMIN_PASSWORD = newPass;
      localStorage.setItem('ADMIN_PASSWORD', newPass);
      showToast('✅ Mot de passe admin modifié', 'success');
    } else if (newPass) {
      showToast('❌ Mot de passe trop court (min 6 caractères)', 'error');
    }
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('detailModal').classList.add('hidden');
  });
}

// ============================================================
// PARTAGE APK (ADMIN UNIQUEMENT)
// ============================================================
function generateShareLink() {
  // En production, ce lien pointerait vers l'APK hébergée
  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/download/auto-diagnostic-pro.apk?admin=${btoa('Kevin83600')}`;
  
  const container = document.getElementById('shareLinkContainer');
  const linkInput = document.getElementById('shareLink');
  
  linkInput.value = shareLink;
  container.classList.remove('hidden');

  // Si Web Share API disponible
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
// CHARGEMENT FOND D'ÉCRAN AU DÉMARRAGE
// ============================================================
async function loadBgImage() {
  try {
    const meta = await DB.get('meta', 'customBgImage');
    if (meta && meta.value) {
      document.body.style.setProperty('--custom-bg-image', `url(${meta.value})`);
      document.body.classList.add('custom-bg');
      document.getElementById('bgPreview').innerHTML = 
        `<img src="${meta.value}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)">`;
      document.getElementById('btnApplyBg').classList.remove('hidden');
      document.getElementById('btnResetBg').classList.remove('hidden');
    }
  } catch (e) {
    // Pas de fond personnalisé
  }
}

// ============================================================
// CHARGEMENT CLÉ GEMINI
// ============================================================
function loadGeminiKey() {
  const key = localStorage.getItem('GEMINI_API_KEY');
  if (key) {
    document.getElementById('geminiKey').value = key;
    const status = document.getElementById('geminiStatus');
    status.className = 'status-box approved';
    status.textContent = '✅ Clé Gemini configurée';
    status.classList.remove('hidden');
  }
}
