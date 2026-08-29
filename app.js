// ============================================================
// AUTO-DIAGNOSTIC PRO - LOGIQUE APPLICATIVE
// ============================================================

const APP = {
  currentUser: null,
  currentRegion: 'ALL',
  currentTab: 'vehicles',
  deferredPrompt: null,
  ADMIN_PASSWORD: "Kevin83600"
};

// ============================================================
// UTILITAIRES
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function getSeverityClass(severity) {
  if (severity === 'Élevée') return 'high';
  if (severity === 'Moyenne') return 'medium';
  return 'low';
}

function getSourceClass(source) {
  const map = {
    'NHTSA': 'nhtsa',
    'SAFETY_GATE': 'safetygate',
    'RAPPEL_CONSO': 'rappelconso',
    'SPECIALISTES': 'specialistes'
  };
  return map[source] || 'specialistes';
}

function getSourceName(source) {
  const map = {
    'NHTSA': 'NHTSA',
    'SAFETY_GATE': 'Safety Gate',
    'RAPPEL_CONSO': 'Rappel Conso',
    'SPECIALISTES': 'Spécialistes'
  };
  return map[source] || source;
}

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await DB.init();
  await VEHICLES_DB.init();
  await DTC_DB.init();
  await RECALLS_DB.init();

  // Vérifier MAJ 15 jours
  await checkAutoUpdates();

  // Charger état utilisateur
  await checkUserStatus();

  // Écoute PWA install
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    APP.deferredPrompt = e;
    document.getElementById('btnInstallPWA').classList.remove('hidden');
  });

    // Service Worker messages (protégé : évite le crash en file:// ou sans HTTPS)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data && event.data.action === 'DB_UPDATE_REQUIRED') {
        showToast('🔄 Mise à jour base en cours...', 'info');
        await checkAutoUpdates();
        showToast('✅ Base mise à jour', 'success');
      }
    });

    // Enregistrement du Service Worker (indispensable PWA/APK)
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('⚠️ Service Worker non disponible:', err);
      });
    });
  }

  bindEvents();
});

async function checkAutoUpdates() {
  const vehiclesUpdated = await VEHICLES_DB.checkAndUpdate();
  const recallsUpdated = await RECALLS_DB.checkAndUpdate();

  if (vehiclesUpdated || recallsUpdated) {
    const now = new Date().toLocaleDateString('fr-FR');
    localStorage.setItem('lastDbUpdate', Date.now().toString());
    document.getElementById('lastUpdateText').textContent = `Dernière MAJ: ${now}`;
  } else {
    const lastUpdate = localStorage.getItem('lastDbUpdate');
    if (lastUpdate) {
      const date = new Date(parseInt(lastUpdate)).toLocaleDateString('fr-FR');
      document.getElementById('lastUpdateText').textContent = `Dernière MAJ: ${date}`;
    }
  }
}

// ============================================================
// GESTION ACCÈS UTILISATEUR
// ============================================================
async function checkUserStatus() {
  const savedUser = localStorage.getItem('currentUser');
  
  if (savedUser) {
    const user = JSON.parse(savedUser);
    const dbUser = await DB.get('users', user.id);
    
    if (dbUser && dbUser.status === 'approved') {
      APP.currentUser = dbUser;
      enterMainApp();
      return;
    } else if (dbUser && dbUser.status === 'pending') {
      showPendingStatus();
      return;
    } else if (dbUser && (dbUser.status === 'denied' || dbUser.status === 'revoked')) {
      localStorage.removeItem('currentUser');
      showDeniedStatus(dbUser.status);
      return;
    }
  }
  
  showScreen('accessScreen');
}

function showPendingStatus() {
  showScreen('accessScreen');
  const statusBox = document.getElementById('accessStatus');
  statusBox.classList.remove('hidden');
  statusBox.className = 'status-box pending';
  statusBox.innerHTML = '⏳ Votre demande est en attente de validation par l\'administrateur.';
}

function showDeniedStatus(status) {
  showScreen('accessScreen');
  const statusBox = document.getElementById('accessStatus');
  statusBox.classList.remove('hidden');
  statusBox.className = 'status-box denied';
  statusBox.innerHTML = status === 'revoked' 
    ? '🚫 Votre accès a été révoqué par l\'administrateur.'
    : '❌ Votre demande a été refusée. Contactez l\'administrateur.';
}

function enterMainApp() {
  showScreen('mainScreen');
  document.getElementById('userWelcome').textContent = `👤 ${APP.currentUser.firstName}`;
  loadVehiclesTab();
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================
function bindEvents() {
  // Formulaire demande d'accès
  document.getElementById('accessForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    
    if (firstName.length < 2) {
      showToast('Prénom trop court', 'error');
      return;
    }

    // Vérifier si déjà enregistré
    const existing = await DB.query('users', u => u.firstName.toLowerCase() === firstName.toLowerCase());
    
    if (existing.length > 0) {
      const user = existing[0];
      if (user.status === 'approved') {
        APP.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        enterMainApp();
      } else if (user.status === 'pending') {
        showPendingStatus();
      } else {
        showDeniedStatus(user.status);
      }
      return;
    }

    // Créer nouvel utilisateur avec statut pending
    const userId = await DB.add('users', {
      firstName: firstName,
      status: 'pending',
      requestDate: Date.now(),
      lastAccess: null
    });

    // Créer demande d'accès
    await DB.add('accessRequests', {
      userId: userId,
      firstName: firstName,
      requestDate: Date.now(),
      status: 'pending'
    });

    // Notification admin (via Service Worker)
    if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification('🔔 Nouvelle demande d\'accès', {
          body: `${firstName} demande l'accès à Auto Diagnostic Pro`,
          icon: 'icons/icon-192.png',
          badge: 'icons/icon-192.png',
          tag: 'access-request',
          actions: [
            { action: 'approve', title: '✅ Autoriser' },
            { action: 'deny', title: '❌ Refuser' }
          ]
        });
      });
    }

    showPendingStatus();
    showToast('📨 Demande envoyée à l\'administrateur', 'success');
  });

  // Accès admin
  document.getElementById('btnAdminAccess').addEventListener('click', () => {
    showScreen('adminLoginScreen');
  });

  document.getElementById('btnBackFromAdmin').addEventListener('click', () => {
    showScreen('accessScreen');
  });

  // Login admin
  document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === APP.ADMIN_PASSWORD) {
      sessionStorage.setItem('adminLogged', 'true');
      window.location.href = 'admin.html';
    } else {
      const errBox = document.getElementById('adminLoginError');
      errBox.classList.remove('hidden');
      errBox.textContent = '❌ Mot de passe incorrect';
      showToast('Mot de passe incorrect', 'error');
    }
  });

  // Installation PWA
  document.getElementById('btnInstallPWA').addEventListener('click', async () => {
    if (APP.deferredPrompt) {
      APP.deferredPrompt.prompt();
      const choice = await APP.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('✅ Application installée', 'success');
      }
      APP.deferredPrompt = null;
      document.getElementById('btnInstallPWA').classList.add('hidden');
    }
  });

  // Logout
  document.getElementById('btnLogout').addEventListener('click', () => {
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
      document.getElementById(`tab${capitalize(tab.dataset.tab)}`).classList.add('active');
      APP.currentTab = tab.dataset.tab;
    });
  });

  // Recherche globale
  document.getElementById('btnValidateSearch').addEventListener('click', () => {
    performGlobalSearch();
  });

  document.getElementById('globalSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performGlobalSearch();
  });

  // Filtres région
  document.querySelectorAll('.region-btn[data-region]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.region-btn[data-region]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      APP.currentRegion = btn.dataset.region;
      loadVehiclesTab();
    });
  });

  // Recherche DTC
  document.getElementById('btnDtcSearch').addEventListener('click', () => searchDTC());
  document.getElementById('dtcSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchDTC();
  });

  // Filtres catégorie DTC
  document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterDTCByCategory(btn.dataset.category);
    });
  });

  // Recherche rappels
  document.getElementById('btnRecallSearch').addEventListener('click', () => searchRecalls());
  document.getElementById('recallSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecalls();
  });

  // Filtres sévérité rappels
  document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterRecallsBySeverity(btn.dataset.severity);
    });
  });

  // Recherche IA
  document.getElementById('btnAiSearch').addEventListener('click', () => performAISearch());
  document.getElementById('btnAiClear').addEventListener('click', () => {
    document.getElementById('aiQuery').value = '';
    document.getElementById('aiResponseContainer').classList.add('hidden');
    document.getElementById('aiLocalResults').innerHTML = '';
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('detailModal').classList.add('hidden');
  });

  document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) {
      document.getElementById('detailModal').classList.add('hidden');
    }
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// ONGLET VÉHICULES - TIROIRS
// ============================================================
async function loadVehiclesTab() {
  const container = document.getElementById('brandsContainer');
  container.innerHTML = '<div class="loading">Chargement<span class="loading-dots"></span></div>';

  // Stats
  const stats = await VEHICLES_DB.getStats();
  document.getElementById('statsBar').innerHTML = `
    <div class="stat-item"><div class="stat-value">${stats.FRANCE}</div><div class="stat-label">🇫🇷 France</div></div>
    <div class="stat-item"><div class="stat-value">${stats.EUROPE}</div><div class="stat-label">🇪🇺 Europe</div></div>
    <div class="stat-item"><div class="stat-value">${stats.AMERIQUE}</div><div class="stat-label">🌎 Amérique</div></div>
    <div class="stat-item"><div class="stat-value">${stats.ASIE}</div><div class="stat-label">🌏 Asie</div></div>
  `;

  // Marques par région
  const brands = await VEHICLES_DB.getBrands(APP.currentRegion);
  
  if (brands.length === 0) {
    container.innerHTML = '<div class="loading">Aucun véhicule trouvé</div>';
    return;
  }

  container.innerHTML = '';

  for (const brand of brands) {
    const drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.dataset.brand = brand;

    const models = await VEHICLES_DB.getModels(APP.currentRegion, brand);

    drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-title">
          <span class="icon">🚗</span>
          <span>${brand}</span>
          <span style="font-size:12px;color:var(--text-muted)">(${models.length} modèles)</span>
        </div>
        <span class="drawer-arrow">▼</span>
      </div>
      <div class="drawer-content">
        <div class="drawer-inner" id="models-${brand.replace(/\s/g, '-')}"></div>
      </div>
    `;

    // Écoute ouverture tiroir marque
    drawer.querySelector('.drawer-header').addEventListener('click', async () => {
      drawer.classList.toggle('open');
      
      if (drawer.classList.contains('open')) {
        const modelsContainer = drawer.querySelector('.drawer-inner');
        if (modelsContainer.children.length === 0) {
          await loadModelsDrawer(modelsContainer, brand);
        }
      }
    });

    container.appendChild(drawer);
  }
}

async function loadModelsDrawer(container, brand) {
  const models = await VEHICLES_DB.getModels(APP.currentRegion, brand);
  container.innerHTML = '';

  for (const model of models) {
    const subDrawer = document.createElement('div');
    subDrawer.className = 'sub-drawer';

    const engines = await VEHICLES_DB.getEngines(APP.currentRegion, brand, model);
    const uniqueEngines = engines.filter((e, i, arr) => 
      arr.findIndex(x => x.engineCode === e.engineCode) === i
    );

    subDrawer.innerHTML = `
      <div class="sub-drawer-header">
        <span>📌 ${model}</span>
        <span class="drawer-arrow">▼</span>
      </div>
      <div class="sub-drawer-content">
        <div class="sub-drawer-inner" id="engines-${brand.replace(/\s/g, '-')}-${model.replace(/\s/g, '-')}"></div>
      </div>
    `;

    subDrawer.querySelector('.sub-drawer-header').addEventListener('click', async () => {
      subDrawer.classList.toggle('open');
      
      if (subDrawer.classList.contains('open')) {
        const enginesContainer = subDrawer.querySelector('.sub-drawer-inner');
        if (enginesContainer.children.length === 0) {
          loadEnginesList(enginesContainer, brand, model, uniqueEngines);
        }
      }
    });

    container.appendChild(subDrawer);
  }
}

function loadEnginesList(container, brand, model, engines) {
  container.innerHTML = '';

  // Regrouper par année
  const byYear = {};
  engines.forEach(e => {
    if (!byYear[e.year]) byYear[e.year] = [];
    byYear[e.year].push(e);
  });

  for (const year in byYear) {
    const yearLabel = document.createElement('div');
    yearLabel.style.cssText = 'font-size:12px;color:var(--text-muted);margin:8px 0 4px;font-weight:600';
    yearLabel.textContent = `📅 ${year}`;
    container.appendChild(yearLabel);

    byYear[year].forEach(engine => {
      const item = document.createElement('div');
      item.className = 'engine-item';
      
      const fuelClass = engine.fuelType.toLowerCase().replace(/\s/g, '');
      
      item.innerHTML = `
        <div>
          <span class="fuel-badge ${fuelClass}">${engine.fuelType}</span>
          <span style="margin-left:8px">${engine.engineCode}</span>
        </div>
        <span class="engine-power">${engine.power}</span>
      `;

      // Clic motorisation -> afficher DTC et rappels associés
      item.addEventListener('click', () => {
        showVehicleDetails(brand, model, engine);
      });

      container.appendChild(item);
    });
  }
}

// ============================================================
// DÉTAILS VÉHICULE (Modal)
// ============================================================
async function showVehicleDetails(brand, model, engine) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('modalBody');

  body.innerHTML = '<div class="loading">Chargement<span class="loading-dots"></span></div>';
  modal.classList.remove('hidden');

  // Rechercher rappels associés
  const recalls = await RECALLS_DB.search(brand, model, engine.year);
  
  // Rechercher DTC associés
  const allDTC = await DB.getAll('dtcCodes');
  const relatedDTC = allDTC.filter(dtc => dtc.brands.includes(brand)).slice(0, 10);

  let html = `
    <h2 style="margin-bottom:4px">${brand} ${model}</h2>
    <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">
      ${engine.year} • ${engine.fuelType} • ${engine.power} • ${engine.engineCode}
    </p>
  `;

  // Rappels
  if (recalls.length > 0) {
    html += '<h3 style="margin-bottom:8px;color:var(--danger)">📋 Rappels & Pannes connues</h3>';
    recalls.forEach(r => {
      html += `
        <div class="result-card" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
            <h3 style="font-size:14px">${r.title}</h3>
            <span class="severity-badge ${getSeverityClass(r.severity)}">${r.severity}</span>
          </div>
          <span class="source-badge ${getSourceClass(r.source)}">${getSourceName(r.source)}</span>
          <p class="description" style="margin-top:8px">${r.description}</p>
          ${r.dtcRelated ? `
            <div class="dtc-list">
              ${r.dtcRelated.map(code => `<span class="dtc-chip" data-code="${code}">${code}</span>`).join('')}
            </div>
          ` : ''}
          <p style="font-size:12px;color:var(--success);margin-top:8px">🔧 ${r.repairAction}</p>
        </div>
      `;
    });
  } else {
    html += '<p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">✅ Aucun rappel connu pour cette configuration.</p>';
  }

  // DTC fréquents
  if (relatedDTC.length > 0) {
    html += '<h3 style="margin:16px 0 8px;color:var(--warning)">⚠️ Codes DTC fréquents pour cette marque</h3>';
    html += '<div class="dtc-list">';
    relatedDTC.forEach(dtc => {
      html += `<span class="dtc-chip" data-code="${dtc.code}">${dtc.code}</span>`;
    });
    html += '</div>';
  }

  body.innerHTML = html;

  // Clics sur codes DTC
  body.querySelectorAll('.dtc-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const code = chip.dataset.code;
      const dtc = await DTC_DB.getByCode(code);
      if (dtc) {
        showDTCModal(dtc);
      }
    });
  });
}

// ============================================================
// DTC
// ============================================================
async function searchDTC() {
  const query = document.getElementById('dtcSearch').value.trim();
  const container = document.getElementById('dtcResults');

  if (!query) {
    container.innerHTML = '<div class="loading">Entrez un code DTC<span class="loading-dots"></span></div>';
    return;
  }

  container.innerHTML = '<div class="loading">Recherche<span class="loading-dots"></span></div>';

  // Recherche exacte d'abord
  let dtc = await DTC_DB.getByCode(query.toUpperCase());
  
  if (dtc) {
    showDTCModal(dtc);
    return;
  }

  // Recherche floue
  const results = await DTC_DB.search(query);
  
  if (results.length === 0) {
    container.innerHTML = '<div class="loading">Aucun code DTC trouvé pour "' + query + '"</div>';
    return;
  }

  displayDTCResults(results);
}

async function filterDTCByCategory(category) {
  const container = document.getElementById('dtcResults');
  container.innerHTML = '<div class="loading">Chargement<span class="loading-dots"></span></div>';

  let results;
  if (category === 'ALL') {
    results = await DB.getAll('dtcCodes');
    results = results.slice(0, 20); // Limiter affichage
  } else {
    results = await DB.query('dtcCodes', d => d.category.includes(category));
  }

  displayDTCResults(results);
}

function displayDTCResults(results) {
  const container = document.getElementById('dtcResults');
  
  if (results.length === 0) {
    container.innerHTML = '<div class="loading">Aucun résultat</div>';
    return;
  }

  container.innerHTML = results.map(dtc => `
    <div class="result-card" style="cursor:pointer" data-code="${dtc.code}">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
        <h3 style="font-family:monospace;font-size:18px;color:var(--accent)">${dtc.code}</h3>
        <span class="severity-badge ${getSeverityClass(dtc.severity)}">${dtc.severity}</span>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:4px">📂 ${dtc.category} • 🔩 ${dtc.system}</p>
      ${dtc.description ? `<p class="description">${dtc.description}</p>` : ''}
      <p style="font-size:11px;color:var(--text-muted);margin-top:6px">
        Marques: ${dtc.brands.slice(0, 5).join(', ')}${dtc.brands.length > 5 ? '...' : ''}
      </p>
    </div>
  `).join('');

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

  // Rechercher rappels liés à ce code
  const recalls = await RECALLS_DB.getByDTC(dtc.code);

  let html = `
    <h2 style="font-family:monospace;font-size:24px;color:var(--accent);margin-bottom:8px">${dtc.code}</h2>
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <span class="severity-badge ${getSeverityClass(dtc.severity)}">⚠️ ${dtc.severity}</span>
      <span style="padding:4px 10px;border-radius:12px;font-size:11px;background:var(--bg-secondary);border:1px solid var(--border)">📂 ${dtc.category}</span>
    </div>
    <p style="font-size:15px;margin-bottom:16px"><strong>Système:</strong> ${dtc.system}</p>
  `;

  if (dtc.description) {
    html += `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;padding:12px;background:var(--bg-secondary);border-radius:8px;border-left:3px solid var(--accent)">${dtc.description}</p>`;
  }

  html += `<p style="font-size:13px;margin-bottom:16px"><strong>Marques concernées:</strong> ${dtc.brands.join(', ')}</p>`;

  if (recalls.length > 0) {
    html += '<h3 style="margin-bottom:8px;color:var(--danger)">📋 Rappels liés à ce code</h3>';
    recalls.forEach(r => {
      html += `
        <div class="result-card" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <strong style="font-size:13px">${r.brand} ${r.model}</strong>
            <span class="severity-badge ${getSeverityClass(r.severity)}">${r.severity}</span>
          </div>
          <p style="font-size:12px;color:var(--text-secondary)">${r.title}</p>
          <p style="font-size:11px;color:var(--text-muted);margin-top:4px">🔧 ${r.repairAction}</p>
        </div>
      `;
    });
  }

  body.innerHTML = html;
  modal.classList.remove('hidden');
}

// ============================================================
// RAPPELS
// ============================================================
async function searchRecalls() {
  const query = document.getElementById('recallSearch').value.trim();
  const container = document.getElementById('recallResults');

  container.innerHTML = '<div class="loading">Recherche<span class="loading-dots"></span></div>';

  const all = await DB.getAll('recalls');
  const q = query.toLowerCase();

  const results = q 
    ? all.filter(r =>
        r.brand.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
    : all.slice(0, 20);

  displayRecallResults(results);
}

async function filterRecallsBySeverity(severity) {
  const container = document.getElementById('recallResults');
  container.innerHTML = '<div class="loading">Chargement<span class="loading-dots"></span></div>';

  let results;
  if (severity === 'ALL') {
    results = await DB.getAll('recalls');
  } else {
    results = await RECALLS_DB.getBySeverity(severity);
  }

  displayRecallResults(results);
}

function displayRecallResults(results) {
  const container = document.getElementById('recallResults');

  if (results.length === 0) {
    container.innerHTML = '<div class="loading">Aucun rappel trouvé</div>';
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="result-card">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
        <h3 style="font-size:14px">${r.brand} ${r.model}</h3>
        <span class="severity-badge ${getSeverityClass(r.severity)}">${r.severity}</span>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:6px">
        📅 ${r.years.join(', ')} • 
        <span class="source-badge ${getSourceClass(r.source)}">${getSourceName(r.source)}</span>
      </p>
      <p style="font-size:14px;font-weight:600;margin-bottom:6px">${r.title}</p>
      <p class="description">${r.description}</p>
      ${r.dtcRelated ? `
        <div class="dtc-list">
          ${r.dtcRelated.map(code => `<span class="dtc-chip" data-code="${code}">${code}</span>`).join('')}
        </div>
      ` : ''}
      <p style="font-size:12px;color:var(--success);margin-top:8px">🔧 <strong>Action:</strong> ${r.repairAction}</p>
      <p style="font-size:10px;color:var(--text-muted);margin-top:6px">Publié: ${r.datePublished}</p>
    </div>
  `).join('');

  // Clics DTC
  container.querySelectorAll('.dtc-chip').forEach(chip => {
    chip.addEventListener('click', async (e) => {
      e.stopPropagation();
      const dtc = await DTC_DB.getByCode(chip.dataset.code);
      if (dtc) showDTCModal(dtc);
    });
  });
}

// ============================================================
// RECHERCHE GLOBALE
// ============================================================
async function performGlobalSearch() {
  const query = document.getElementById('globalSearch').value.trim();
  if (!query) return;

  const results = await AI_SEARCH.localSearch(query);

  // Afficher résultats selon type
  if (results.dtcCodes.length > 0) {
    // Activer onglet DTC
    document.querySelector('.tab[data-tab="dtc"]').click();
    displayDTCResults(results.dtcCodes);
  } else if (results.recalls.length > 0) {
    document.querySelector('.tab[data-tab="recalls"]').click();
    displayRecallResults(results.recalls);
  } else if (results.vehicles.length > 0) {
    document.querySelector('.tab[data-tab="vehicles"]').click();
    showToast(`${results.vehicles.length} véhicules trouvés`, 'info');
  } else {
    // Basculer sur IA
    document.querySelector('.tab[data-tab="ai"]').click();
    document.getElementById('aiQuery').value = query;
    showToast('Aucun résultat local. Utilisez la recherche IA.', 'warning');
  }
}

// ============================================================
// RECHERCHE IA
// ============================================================
async function performAISearch() {
  const query = document.getElementById('aiQuery').value.trim();
  if (!query) {
    showToast('Entrez une question', 'warning');
    return;
  }

  const responseContainer = document.getElementById('aiResponseContainer');
  const responseText = document.getElementById('aiResponseText');
  const responseSource = document.getElementById('aiResponseSource');
  const localResults = document.getElementById('aiLocalResults');

  responseText.textContent = '🔄 Recherche en cours...';
  responseSource.textContent = '';
  responseContainer.classList.remove('hidden');
  localResults.innerHTML = '';

  const result = await AI_SEARCH.combinedSearch(query);

  if (result.type === 'local') {
    // Résultats locaux trouvés
    responseText.textContent = '📋 Résultats trouvés dans la base locale:';
    responseSource.textContent = 'Source: Base de données interne';

    let html = '';
    
    if (result.results.dtcCodes.length > 0) {
      html += '<h3 style="margin:12px 0 8px">⚠️ Codes DTC associés</h3>';
      html += result.results.dtcCodes.slice(0, 5).map(dtc => `
        <div class="result-card" style="cursor:pointer" onclick="showDTCModal(${JSON.stringify(dtc).replace(/"/g, '&quot;')})">
          <strong style="font-family:monospace;color:var(--accent)">${dtc.code}</strong> - ${dtc.system}
        </div>
      `).join('');
    }

    if (result.results.recalls.length > 0) {
      html += '<h3 style="margin:12px 0 8px">📋 Rappels associés</h3>';
      html += result.results.recalls.slice(0, 3).map(r => `
        <div class="result-card">
          <strong>${r.brand} ${r.model}</strong> - ${r.title}
          <span class="severity-badge ${getSeverityClass(r.severity)}" style="margin-left:8px">${r.severity}</span>
        </div>
      `).join('');
    }

    localResults.innerHTML = html;

  } else if (result.type === 'gemini' || result.type === 'free_ai') {
    responseText.textContent = result.response;
    responseSource.textContent = `Source: ${result.source} • ${new Date().toLocaleTimeString('fr-FR')}`;
  } else {
    responseText.textContent = result.message || 'Aucun résultat trouvé.';
    responseSource.textContent = 'Essayez avec un code DTC ou une description plus précise';
  }
}
