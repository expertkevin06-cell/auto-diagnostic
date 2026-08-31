// ===== Enregistrement du Service Worker =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW enregistré', reg))
    .catch(err => console.error('SW échec', err));
}

// ===== État global =====
const ADMIN_PASSWORD = 'Kevin83600';
let isAdmin = false;
let currentUser = null;
let deferredPrompt = null;

// ===== Gestion des utilisateurs (localStorage - à remplacer par backend réel) =====
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// ===== Navigation entre écrans =====
function hideAll() {
  document.querySelectorAll('[id^="screen-"]').forEach(el => el.classList.add('hidden'));
}
function showScreen(id) {
  hideAll();
  document.getElementById(id).classList.remove('hidden');
}
function showHome() { showScreen('screen-home'); }
function showAdminLogin() { showScreen('screen-admin-login'); }

// ===== Demande d'accès tiers =====
function requestAccess() {
  const prenom = document.getElementById('input-prenom').value.trim();
  if (!prenom) return alert('Veuillez entrer votre prénom');

  const users = getUsers();
  const existing = users.find(u => u.prenom === prenom);

  if (existing && existing.status === 'accepted') {
    currentUser = prenom;
    document.getElementById('user-name').textContent = prenom;
    showScreen('screen-granted');
    return;
  }

  if (existing && existing.status === 'pending') {
    showScreen('screen-pending');
    return;
  }

  // Nouvelle demande
  const newUser = {
    prenom,
    status: 'pending',
    date: new Date().toISOString(),
    deviceId: Math.random().toString(36).substr(2, 9)
  };
  users.push(newUser);
  saveUsers(users);

  // Notification à l'admin via Service Worker
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'ACCESS_REQUEST',
      prenom,
      date: newUser.date
    });
  }

  showScreen('screen-pending');
}

// ===== Login admin =====
function loginAdmin() {
  const pwd = document.getElementById('input-admin-pwd').value;
  if (pwd === ADMIN_PASSWORD) {
    isAdmin = true;
    renderAdminTable();
    showScreen('screen-admin');
  } else {
    alert('Mot de passe incorrect');
  }
}

function logoutAdmin() {
  isAdmin = false;
  document.getElementById('input-admin-pwd').value = '';
  showHome();
}

// ===== Tableau admin =====
function renderAdminTable() {
  const tbody = document.getElementById('users-body');
  const users = getUsers();
  tbody.innerHTML = '';

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Aucune demande</td></tr>';
    return;
  }

  users.forEach((u, i) => {
    const tr = document.createElement('tr');
    const date = new Date(u.date).toLocaleDateString('fr-FR');
    const statusLabel = {
      pending: 'En attente',
      accepted: 'Accepté',
      refused: 'Refusé',
      revoked: 'Révoqué'
    }[u.status];

    tr.innerHTML = `
      <td>${u.prenom}</td>
      <td><span class="status ${u.status}">${statusLabel}</span></td>
      <td>${date}</td>
      <td>
        ${u.status === 'pending' ? `
          <button class="success" style="padding:4px 8px;font-size:12px" onclick="updateStatus(${i},'accepted')">✓</button>
          <button class="danger" style="padding:4px 8px;font-size:12px" onclick="updateStatus(${i},'refused')">✗</button>
        ` : ''}
        ${u.status === 'accepted' ? `
          <button class="danger" style="padding:4px 8px;font-size:12px" onclick="updateStatus(${i},'revoked')">Révoquer</button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStatus(index, newStatus) {
  const users = getUsers();
  users[index].status = newStatus;
  saveUsers(users);
  renderAdminTable();
}

// ===== Partage APK (admin uniquement) =====
function shareAPK() {
  if (!isAdmin) return alert('Accès refusé');
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: 'Application Sécurisée',
      text: 'Invitation à installer l\'application',
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('Lien copié dans le presse-papier');
  }
}

// ===== Installation PWA (mode "Installer sur APK") =====
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-btn').classList.remove('hidden');
});

async function installPWA() {
  if (!deferredPrompt) return alert('Installation non disponible');
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('install-btn').classList.add('hidden');
  }
  deferredPrompt = null;
}

// ===== Vérification initiale =====
window.addEventListener('load', () => {
  const params = new URLSearchParams(location.search);
  if (params.get('mode') === 'admin') showAdminLogin();
});
