// ============================================================
// AUTO-DIAGNOSTIC PRO - LOGIQUE PRINCIPALE
// Régions FRANCE / EUROPE / AUTRES + origines marques
// Tiroirs : Région -> Marque -> Modèle -> Motorisation
// Pannes MASSIVES via RECALLS_DB.getIssuesForVehicle
// ============================================================

const APP = {
  currentUser: null,
  currentRegion: 'ALL',
  deferredPrompt: null,
  ADMIN_PASSWORD: "Kevin83600"
};

// ============================================================
// UTILITAIRES
// ============================================================
function normalizeStr(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function showToast(message, type) {
  type = type || 'info';
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'toast ' + type;
  d.textContent = message;
  c.appendChild(d);
  setTimeout(() => d.remove(), 4000);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function on(id, evt, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(evt, fn);
  return el;
}

function sevClass(s) {
  if (s === 'Élevée') return 'high';
  if (s === 'Moyenne') return 'medium';
  return 'low';
}

function srcClass(s) {
  const m = { NHTSA: 'nhtsa', SAFETY_GATE: 'safetygate', RAPPEL_CONSO: 'rappelconso', SPECIALISTES: 'specialistes' };
  return m[s] || 'specialistes';
}

function srcName(s) {
  const m = { NHTSA: 'NHTSA', SAFETY_GATE: 'Safety Gate', RAPPEL_CONSO: 'Rappel Conso', SPECIALISTES: 'Spécialistes' };
  return m[s] || s;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await DB.init();
    await VEHICLES_DB.init();
    await DTC_DB.init();
    await RECALLS_DB.init();
  } catch (e) {
    console.error("❌ Erreur init bases:", e);
    showToast('Erreur initialisation: ' + e.message, 'error');
  }

  try { await checkAutoUpdates(); } catch (e) { console.warn(e); }

  await checkUserStatus();

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    APP.deferredPrompt = e;
    const btn = document.getElementById('btnInstallPWA');
    if (btn) btn.classList.remove('hidden');
  });

  // Service Worker protégé (file:// et sans HTTPS OK)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data && event.data.action === 'DB_UPDATE_REQUIRED') {
        showToast('🔄 Mise à jour base en cours...', 'info');
        try { await checkAutoUpdates(); } catch (e) { console.warn(e); }
        showToast('✅ Base mise à jour', 'success');
      }
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('⚠️ Service Worker non disponible:', err);
      });
    });
  }

  bindEvents();
});

async function checkAutoUpdates() {
  const vUpd = await VEHICLES_DB.checkAndUpdate();
  const rUpd = await RECALLS_DB.checkAndUpdate();
  const el = document.getElementById('lastUpdateText');
  if (vUpd || rUpd) {
    localStorage.setItem('lastDbUpdate', Date.now().toString());
    if (el) el.textContent = 'Dernière MAJ: ' + new Date().toLocaleDateString('fr-FR');
  } else {
    const last = localStorage.getItem('lastDbUpdate');
    if (last && el) el.textContent = 'Dernière MAJ: ' + new Date(parseInt(last)).toLocaleDateString('fr-FR');
  }
}

// ============================================================
// ACCÈS UTILISATEUR
// ============================================================
async function checkUserStatus() {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      const dbUser = await DB.get('users', user.id);
      if (dbUser && dbUser.status === 'approved') {
        dbUser.lastAccess = Date.now();
        await DB.update('users', dbUser);
        APP.currentUser = dbUser;
        enterMainApp();
        return;
      } else if (dbUser && dbUser.status === 'pending') {
        showPendingStatus(); return;
      } else if (dbUser && (dbUser.status === 'denied' || dbUser.status === 'revoked')) {
        localStorage.removeItem('currentUser');
        showDeniedStatus(dbUser.status); return;
      }
    } catch (e) { console.warn(e); }
  }
  showScreen('accessScreen');
}

function showPendingStatus() {
  showScreen('accessScreen');
  const b = document.getElementById('accessStatus');
  if (b) {
    b.classList.remove('hidden');
    b.className = 'status-box pending';
    b.innerHTML = '⏳ Votre demande est en attente de validation par l\'administrateur.';
  }
}

function showDeniedStatus(status) {
  showScreen('accessScreen');
  const b = document.getElementById('accessStatus');
  if (b) {
    b.classList.remove('hidden');
    b.className = 'status-box denied';
    b.innerHTML = (status === 'revoked')
      ? '🚫 Votre accès a été révoqué par l\'administrateur.'
      : '❌ Votre demande a été refusée. Contactez l\'administrateur.';
  }
}

function enterMainApp() {
  showScreen('mainScreen');
  const w = document.getElementById('userWelcome');
  if (w && APP.currentUser) w.textContent = '👤 ' + APP.currentUser.firstName;
  loadVehiclesTab();
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================
function bindEvents() {

  on('accessForm', 'submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('firstName');
    const firstName = input ? input.value.trim() : '';
    if (firstName.length < 2) { showToast('Prénom trop court', 'error'); return; }

    const existing = await DB.query('users', u => u.firstName.toLowerCase() === firstName.toLowerCase());
    if (existing.length > 0) {
      const user = existing[0];
      if (user.status === 'approved') {
        APP.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        enterMainApp();
      } else if (user.status === 'pending') { showPendingStatus(); }
      else { showDeniedStatus(user.status); }
      return;
    }

    const userId = await DB.add('users', {
      firstName: firstName, status: 'pending', requestDate: Date.now(), lastAccess: null
    });
    try {
      await DB.add('accessRequests', {
        userId: userId, firstName: firstName, requestDate: Date.now(), status: 'pending'
      });
    } catch (e) { console.warn(e); }

    if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification('🔔 Nouvelle demande d\'accès', {
          body: firstName + ' demande l\'accès à Auto Diagnostic Pro',
          icon: 'icons/icon-192.png', tag: 'access-request'
        });
      }).catch(() => {});
    }

    showPendingStatus();
    showToast('📨 Demande envoyée à l\'administrateur', 'success');
  });

  on('btnBackFromAdmin', 'click', () => showScreen('accessScreen'));

  on('adminLoginForm', 'submit', (e) => {
    e.preventDefault();
    const p = document.getElementById('adminPassword');
    const pass = p ? p.value : '';
    const stored = localStorage.getItem('ADMIN_PASSWORD') || APP.ADMIN_PASSWORD;
    if (pass === stored) {
      sessionStorage.setItem('adminLogged', 'true');
      window.location.href = 'admin.html';
    } else {
      const err = document.getElementById('adminLoginError');
      if (err) { err.classList.remove('hidden'); err.textContent = '❌ Mot de passe incorrect'; }
      showToast('Mot de passe incorrect', 'error');
    }
  });

  on('btnInstallPWA', 'click', async () => {
    if (APP.deferredPrompt) {
      APP.deferredPrompt.prompt();
      const choice = await APP.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') showToast('✅ Application installée', 'success');
      APP.deferredPrompt = null;
      const btn = document.getElementById('btnInstallPWA');
      if (btn) btn.classList.add('hidden');
    }
  });

  on('btnLogout', 'click', () => {
    localStorage.removeItem('currentUser');
    APP.currentUser = null;
    showScreen('accessScreen');
    showToast('Déconnecté', 'info');
  });

  // Onglets
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('tab' + capitalize(tab.dataset.tab));
      if (content) content.classList.add('active');
    });
  });

  // Recherche globale massive
  on('btnValidateSearch', 'click', () => performGlobalSearch());
  on('globalSearch', 'keypress', (e) => { if (e.key === 'Enter') performGlobalSearch(); });

  // Filtres région (FRANCE / EUROPE / AUTRES)
  document.querySelectorAll('.region-btn[data-region]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.region-btn[data-region]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      APP.currentRegion = btn.dataset.region;
      loadVehiclesTab();
    });
  });

  // DTC
  on('btnDtcSearch', 'click', () => searchDTC());
  on('dtcSearch', 'keypress', (e) => { if (e.key === 'Enter') searchDTC(); });
  document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterDTCByCategory(btn.dataset.category);
    });
  });

  // Rappels
  on('btnRecallSearch', 'click', () => searchRecalls());
  on('recallSearch', 'keypress', (e) => { if (e.key === 'Enter') searchRecalls(); });
  document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterRecallsBySeverity(btn.dataset.severity);
    });
  });

  // IA
  on('btnAiSearch', 'click', () => performAISearch());
  on('btnAiClear', 'click', () => {
    const q = document.getElementById('aiQuery'); if (q) q.value = '';
    const rc = document.getElementById('aiResponseContainer'); if (rc) rc.classList.add('hidden');
    const lr = document.getElementById('aiLocalResults'); if (lr) lr.innerHTML = '';
  });

  // Modal
  on('modalClose', 'click', () => {
    const m = document.getElementById('detailModal'); if (m) m.classList.add('hidden');
  });
  const modal = document.getElementById('detailModal');
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
}

// ============================================================
// ONGLET VÉHICULES : TIROIRS + ORIGINES MARQUES
// ============================================================
async function loadVehiclesTab() {
  const container = document.getElementById('brandsContainer');
  if (!container) return;
  container.innerHTML = '<div class="loading">Chargement des marques<span class="loading-dots"></span></div>';

  try {
    const stats = await VEHICLES_DB.getStats();
    const statsBar = document.getElementById('statsBar');
    if (statsBar) {
      statsBar.innerHTML =
        '<div class="stat-item"><div class="stat-value">' + stats.FRANCE + '</div><div class="stat-label">🇫 France</div></div>' +
        '<div class="stat-item"><div class="stat-value">' + stats.EUROPE + '</div><div class="stat-label">🇪🇺 Europe</div></div>' +
        '<div class="stat-item"><div class="stat-value">' + stats.AUTRES + '</div><div class="stat-label">🌍 Autres</div></div>';
    }

    const brands = await VEHICLES_DB.getBrands(APP.currentRegion);
    if (brands.length === 0) {
      container.innerHTML = '<div class="loading">Aucun véhicule. Admin → Base → Forcer la MAJ.</div>';
      return;
    }

    container.innerHTML = '';

    for (const brand of brands) {
      const meta = await VEHICLES_DB.getBrandMeta(APP.currentRegion, brand);
      const models = await VEHICLES_DB.getModels(APP.currentRegion, brand);

      const drawer = document.createElement('div');
      drawer.className = 'drawer';
      drawer.innerHTML =
        '<div class="drawer-header">' +
          '<div class="drawer-title">' +
            '<span class="icon">' + (meta.flag || '🚗') + '</span>' +
            '<span>' + brand + '</span>' +
            '<span style="font-size:11px;color:var(--text-muted)">(' + meta.country + ' • ' + models.length + ' modèles)</span>' +
          '</div>' +
          '<span class="drawer-arrow">▼</span>' +
        '</div>' +
        '<div class="drawer-content"><div class="drawer-inner"></div></div>';

      drawer.querySelector('.drawer-header').addEventListener('click', async () => {
        drawer.classList.toggle('open');
        if (drawer.classList.contains('open')) {
          const mc = drawer.querySelector('.drawer-inner');
          if (mc && mc.children.length === 0) await loadModelsDrawer(mc, brand);
        }
      });

      container.appendChild(drawer);
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="loading">❌ Erreur: ' + e.message + '</div>';
  }
}

async function loadModelsDrawer(container, brand) {
  const models = await VEHICLES_DB.getModels(APP.currentRegion, brand);
  container.innerHTML = '';

  for (const model of models) {
    const sub = document.createElement('div');
    sub.className = 'sub-drawer';
    sub.innerHTML =
      '<div class="sub-drawer-header"><span>📌 ' + model + '</span><span class="drawer-arrow">▼</span></div>' +
      '<div class="sub-drawer-content"><div class="sub-drawer-inner"></div></div>';

    sub.querySelector('.sub-drawer-header').addEventListener('click', async () => {
      sub.classList.toggle('open');
      if (sub.classList.contains('open')) {
        const ec = sub.querySelector('.sub-drawer-inner');
        if (ec && ec.children.length === 0) {
          const engines = await VEHICLES_DB.getEngines(APP.currentRegion, brand, model);
          loadEnginesList(ec, brand, model, engines);
        }
      }
    });

    container.appendChild(sub);
  }
}

function loadEnginesList(container, brand, model, engines) {
  container.innerHTML = '';
  const byYear = {};
  engines.forEach(e => {
    if (!byYear[e.year]) byYear[e.year] = [];
    byYear[e.year].push(e);
  });
  const years = Object.keys(byYear).sort();

  for (const year of years) {
    const yl = document.createElement('div');
    yl.style.cssText = 'font-size:12px;color:var(--text-muted);margin:8px 0 4px;font-weight:600';
    yl.textContent = '📅 ' + year;
    container.appendChild(yl);

    byYear[year].forEach(engine => {
      const item = document.createElement('div');
      item.className = 'engine-item';
      const fuelClass = engine.fuelType.toLowerCase().replace(/\s/g, '');
      item.innerHTML =
        '<div><span class="fuel-badge ' + fuelClass + '">' + engine.fuelType + '</span>' +
        '<span style="margin-left:8px">' + engine.engineCode + '</span></div>' +
        '<span class="engine-power">' + engine.power + '</span>';
      item.addEventListener('click', () => showVehicleDetails(brand, model, engine));
      container.appendChild(item);
    });
  }
}

// ============================================================
// DÉTAIL VÉHICULE : PANNES MASSIVES (spécifiques + famille moteur)
// ============================================================
async function showVehicleDetails(brand, model, engine) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  body.innerHTML = '<div class="loading">Chargement<span class="loading-dots"></span></div>';
  modal.classList.remove('hidden');

  const issues = RECALLS_DB.getIssuesForVehicle(brand, model, engine.year, engine);

  let html =
    '<h2 style="margin-bottom:4px">' + brand + ' ' + model + '</h2>' +
    '<p style="color:var(--text-secondary);font-size:13px;margin-bottom:14px">' +
      engine.year + ' • ' + engine.fuelType + ' • ' + engine.power + ' • ' + engine.engineCode +
    '</p>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">⚠️ ' + issues.length + ' pannes connues / rappels pour cette configuration</p>';

  issues.forEach(i => {
    const dtcs = i.dtcRelated || i.dtc || [];
    const repair = i.repairAction || i.repair || '';
    html +=
      '<div class="result-card" style="margin-bottom:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">' +
          '<h3 style="font-size:14px">' + i.title + '</h3>' +
          '<span class="severity-badge ' + sevClass(i.severity) + '">' + i.severity + '</span>' +
        '</div>' +
        '<span class="source-badge ' + srcClass(i.source) + '">' + srcName(i.source) + '</span>' +
        (i.description ? '<p class="description" style="margin-top:8px">' + i.description + '</p>' : '') +
        (dtcs.length ? '<div class="dtc-list">' + dtcs.map(c => '<span class="dtc-chip" data-code="' + c + '">' + c + '</span>').join('') + '</div>' : '') +
        (repair ? '<p style="font-size:12px;color:var(--success);margin-top:8px">🔧 ' + repair + '</p>' : '') +
      '</div>';
  });

  body.innerHTML = html;

  body.querySelectorAll('.dtc-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const dtc = await DTC_DB.getByCode(chip.dataset.code);
      if (dtc) showDTCModal(dtc);
    });
  });
}

// ============================================================
// DTC
// ============================================================
async function searchDTC() {
  const input = document.getElementById('dtcSearch');
  const query = input ? input.value.trim() : '';
  const container = document.getElementById('dtcResults');
  if (!container) return;

  if (!query) {
    container.innerHTML = '<div class="loading">Entrez un code DTC (ex: P200E, P20EE)<span class="loading-dots"></span></div>';
    return;
  }

  container.innerHTML = '<div class="loading">Recherche<span class="loading-dots"></span></div>';

  const exact = await DTC_DB.getByCode(query.toUpperCase());
  if (exact) { showDTCModal(exact); return; }

  const results = await DTC_DB.search(query);
  if (results.length === 0) {
    container.innerHTML = '<div class="loading">Aucun code trouvé pour "' + query + '"</div>';
    return;
  }
  displayDTCResults(results);
}

async function filterDTCByCategory(category) {
  const container = document.getElementById('dtcResults');
  if (!container) return;
  container.innerHTML = '<div class="loading">Chargement<span class="loading-dots"></span></div>';
  let results;
  if (category === 'ALL') results = (await DB.getAll('dtcCodes')).slice(0, 20);
  else results = await DB.query('dtcCodes', d => d.category && d.category.includes(category));
  displayDTCResults(results);
}

function displayDTCResults(results) {
  const container = document.getElementById('dtcResults');
  if (!container) return;
  if (results.length === 0) { container.innerHTML = '<div class="loading">Aucun résultat</div>'; return; }

  container.innerHTML = results.map(dtc =>
    '<div class="result-card" style="cursor:pointer" data-code="' + dtc.code + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">' +
        '<h3 style="font-family:monospace;font-size:18px;color:var(--accent)">' + dtc.code + '</h3>' +
        '<span class="severity-badge ' + sevClass(dtc.severity) + '">' + dtc.severity + '</span>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--text-muted);margin-bottom:4px">📂 ' + dtc.category + ' • 🔩 ' + dtc.system + '</p>' +
      (dtc.description ? '<p class="description">' + dtc.description + '</p>' : '') +
      '<p style="font-size:11px;color:var(--text-muted);margin-top:6px">Marques: ' + dtc.brands.slice(0, 5).join(', ') + (dtc.brands.length > 5 ? '...' : '') + '</p>' +
    '</div>'
  ).join('');

  container.querySelectorAll('.result-card').forEach(card => {
    card.addEventListener('click', async () => {
      const dtc = await DTC_DB.getByCode(card.dataset.code);
      if (dtc) showDTCModal(dtc);
    });
  });
}

async function showDTCModal(dtc) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  const recalls = await RECALLS_DB.getByDTC(dtc.code);

  let html =
    '<h2 style="font-family:monospace;font-size:24px;color:var(--accent);margin-bottom:8px">' + dtc.code + '</h2>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">' +
      '<span class="severity-badge ' + sevClass(dtc.severity) + '">⚠️ ' + dtc.severity + '</span>' +
      '<span style="padding:4px 10px;border-radius:12px;font-size:11px;background:var(--bg-secondary);border:1px solid var(--border)">📂 ' + dtc.category + '</span>' +
    '</div>' +
    '<p style="font-size:15px;margin-bottom:16px"><strong>Système:</strong> ' + dtc.system + '</p>';

  if (dtc.description) {
    html += '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;padding:12px;background:var(--bg-secondary);border-radius:8px;border-left:3px solid var(--accent)">' + dtc.description + '</p>';
  }

  html += '<p style="font-size:13px;margin-bottom:16px"><strong>Marques:</strong> ' + dtc.brands.join(', ') + '</p>';

  if (recalls.length > 0) {
    html += '<h3 style="margin-bottom:8px;color:var(--danger)">📋 Rappels liés à ce code</h3>';
    recalls.forEach(r => {
      html +=
        '<div class="result-card" style="margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
            '<strong style="font-size:13px">' + r.brand + ' ' + r.model + '</strong>' +
            '<span class="severity-badge ' + sevClass(r.severity) + '">' + r.severity + '</span>' +
          '</div>' +
          '<p style="font-size:12px;color:var(--text-secondary)">' + r.title + '</p>' +
          '<p style="font-size:11px;color:var(--text-muted);margin-top:4px">🔧 ' + r.repairAction + '</p>' +
        '</div>';
    });
  }

  body.innerHTML = html;
  modal.classList.remove('hidden');
}

// ============================================================
// RAPPELS
// ============================================================
async function searchRecalls() {
  const input = document.getElementById('recallSearch');
  const query = input ? input.value.trim() : '';
  const container = document.getElementById('recallResults');
  if (!container) return;

  container.innerHTML = '<div class="loading">Recherche<span class="loading-dots"></span></div>';

  const all = await DB.getAll('recalls');
  const q = normalizeStr(query);

  const results = q
    ? all.filter(r =>
        normalizeStr(r.brand).includes(q) ||
        normalizeStr(r.model).includes(q) ||
        normalizeStr(r.title).includes(q) ||
        normalizeStr(r.description).includes(q))
    : all.slice(0, 20);

  displayRecallResults(results);
}

async function filterRecallsBySeverity(severity) {
  const container = document.getElementById('recallResults');
  if (!container) return;
  container.innerHTML = '<div class="loading">Chargement<span class="loading-dots"></span></div>';
  const results = (severity === 'ALL') ? await DB.getAll('recalls') : await RECALLS_DB.getBySeverity(severity);
  displayRecallResults(results);
}

function displayRecallResults(results) {
  const container = document.getElementById('recallResults');
  if (!container) return;
  if (results.length === 0) { container.innerHTML = '<div class="loading">Aucun rappel trouvé</div>'; return; }

  container.innerHTML = results.map(r =>
    '<div class="result-card">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">' +
        '<h3 style="font-size:14px">' + r.brand + ' ' + r.model + '</h3>' +
        '<span class="severity-badge ' + sevClass(r.severity) + '">' + r.severity + '</span>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--text-muted);margin-bottom:6px">📅 ' + r.years.join(', ') +
        ' • <span class="source-badge ' + srcClass(r.source) + '">' + srcName(r.source) + '</span></p>' +
      '<p style="font-size:14px;font-weight:600;margin-bottom:6px">' + r.title + '</p>' +
      '<p class="description">' + r.description + '</p>' +
      (r.dtcRelated ? '<div class="dtc-list">' + r.dtcRelated.map(c => '<span class="dtc-chip" data-code="' + c + '">' + c + '</span>').join('') + '</div>' : '') +
      '<p style="font-size:12px;color:var(--success);margin-top:8px">🔧 <strong>Action:</strong> ' + r.repairAction + '</p>' +
      '<p style="font-size:10px;color:var(--text-muted);margin-top:6px">Publié: ' + r.datePublished + '</p>' +
    '</div>'
  ).join('');

  container.querySelectorAll('.dtc-chip').forEach(chip => {
    chip.addEventListener('click', async (e) => {
      e.stopPropagation();
      const dtc = await DTC_DB.getByCode(chip.dataset.code);
      if (dtc) showDTCModal(dtc);
    });
  });
}

// ============================================================
// RECHERCHE GLOBALE MASSIVE
// ============================================================
async function performGlobalSearch() {
  const input = document.getElementById('globalSearch');
  const query = input ? input.value.trim() : '';
  if (!query) return;

  const q = normalizeStr(query);

  const vehicles = await VEHICLES_DB.search(q);
  const dtcs = await DTC_DB.search(q);
  const allRecalls = await DB.getAll('recalls');
  const recalls = allRecalls.filter(r =>
    normalizeStr(r.brand).includes(q) || normalizeStr(r.model).includes(q) ||
    normalizeStr(r.title).includes(q) || normalizeStr(r.description).includes(q));

  showToast('🔎 ' + vehicles.length + ' véhicules • ' + dtcs.length + ' DTC • ' + recalls.length + ' rappels', 'info');

  if (dtcs.length > 0) {
    const tab = document.querySelector('.tab[data-tab="dtc"]');
    if (tab) tab.click();
    displayDTCResults(dtcs);
  } else if (recalls.length > 0) {
    const tab = document.querySelector('.tab[data-tab="recalls"]');
    if (tab) tab.click();
    displayRecallResults(recalls);
  } else if (vehicles.length > 0) {
    const tab = document.querySelector('.tab[data-tab="vehicles"]');
    if (tab) tab.click();
    showToast('Ouvrez: ' + vehicles[0].brand + ' → ' + vehicles[0].model, 'success');
  } else {
    const tab = document.querySelector('.tab[data-tab="ai"]');
    if (tab) tab.click();
    const aq = document.getElementById('aiQuery');
    if (aq) aq.value = query;
    showToast('Aucun résultat local → recherche IA prête', 'warning');
  }
}

// ============================================================
// RECHERCHE IA
// ============================================================
async function performAISearch() {
  const q = document.getElementById('aiQuery');
  const query = q ? q.value.trim() : '';
  if (!query) { showToast('Entrez une question', 'warning'); return; }

  const rc = document.getElementById('aiResponseContainer');
  const rt = document.getElementById('aiResponseText');
  const rs = document.getElementById('aiResponseSource');
  const lr = document.getElementById('aiLocalResults');

  if (rt) rt.textContent = '🔄 Recherche en cours...';
  if (rs) rs.textContent = '';
  if (rc) rc.classList.remove('hidden');
  if (lr) lr.innerHTML = '';

  if (typeof AI_SEARCH === 'undefined') {
    if (rt) rt.textContent = '❌ Module ai-search.js non chargé.';
    return;
  }

  const result = await AI_SEARCH.combinedSearch(query);

  if (result.type === 'local') {
    if (rt) rt.textContent = '📋 Résultats trouvés dans la base locale:';
    if (rs) rs.textContent = 'Source: Base de données interne';

    let html = '';
    if (result.results.dtcCodes.length > 0) {
      html += '<h3 style="margin:12px 0 8px">⚠️ Codes DTC associés</h3>';
      result.results.dtcCodes.slice(0, 5).forEach(dtc => {
        html += '<div class="result-card" style="cursor:pointer" data-code="' + dtc.code + '"><strong style="font-family:monospace;color:var(--accent)">' + dtc.code + '</strong> - ' + dtc.system + '</div>';
      });
    }
    if (result.results.recalls.length > 0) {
      html += '<h3 style="margin:12px 0 8px">📋 Rappels associés</h3>';
      result.results.recalls.slice(0, 3).forEach(r => {
        html += '<div class="result-card"><strong>' + r.brand + ' ' + r.model + '</strong> - ' + r.title +
          '<span class="severity-badge ' + sevClass(r.severity) + '" style="margin-left:8px">' + r.severity + '</span></div>';
      });
    }
    if (lr) {
      lr.innerHTML = html;
      lr.querySelectorAll('.result-card[data-code]').forEach(card => {
        card.addEventListener('click', async () => {
          const dtc = await DTC_DB.getByCode(card.dataset.code);
          if (dtc) showDTCModal(dtc);
        });
      });
    }
  } else if (result.type === 'gemini' || result.type === 'free_ai') {
    if (rt) rt.textContent = result.response;
    if (rs) rs.textContent = 'Source: ' + result.source + ' • ' + new Date().toLocaleTimeString('fr-FR');
  } else {
    if (rt) rt.textContent = result.message || 'Aucun résultat trouvé.';
    if (rs) rs.textContent = 'Essayez un code DTC ou une description plus précise';
  }
}
