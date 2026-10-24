/* APP.JS v7 — Rappel Bigster ressorts AR auto + sources officielles cliquables + expert + mensuel */
const ADMIN_PASSWORD = 'Kevin83600';
const SESSION_KEY = 'autodiag_session';
const MONTHLY_MS = 30 * 24 * 60 * 60 * 1000;
const FUELS = { essence: '⛽ Essence', diesel: '🛢️ Diesel', hybride: '🔋 Hybride', electrique: '⚡ Électrique' };
/* ===== FICHES CLÉS AUTO-AJOUTÉES (rappels officiels) ===== */
const KEY_ISSUES = [
 { brand:'dacia', model:'Bigster', motor:'', title:'Ressorts suspension AR : rupture (diamètre fil insuffisant)', detail:'Campagne de rappel : remplacement des 2 ressorts de suspension arrière suite à risque de rupture (diamètre de fil insuffisant). Contrôle visuel + mesure du diamètre, remplacement préventif selon VIN. Intervention gratuite en concession.', source:'Rappel Conso / Safety Gate', dtc:'', url:'https://www.rappel.conso.gouv.fr/' },
 { brand:'dacia', model:'Bigster', motor:'', title:'Ressorts AR : alerte UE (contrôle obligatoire)', detail:'Alerte Safety Gate : risque de rupture des ressorts arrière — vérification obligatoire en concession, remplacement gratuit des ressorts non conformes.', source:'Safety Gate', dtc:'', url:'https://ec.europa.eu/safety-gate-alerts/screen/webReport/searchAdvanced' },
 { brand:'dacia', model:'Bigster', motor:'', title:'Ressorts AR : suivi presse spécialisée', detail:'Articles et retours d\'utilisateurs sur la campagne ressorts arrière du Bigster (symptômes, délais de prise en charge).', source:'L\'Argus / Caradisiac', dtc:'', url:'https://www.largus.fr/' }
];
const KEY_EXPERT = [
 { brand:'dacia', model:'Bigster', motor:'', title:'Procédure remplacement ressorts suspension AR (rappel)', symptom:'Claquement ou bruit de détente à l\'arrière, véhicule penché d\'un côté, fissure ou casse visible du ressort AR', diagnosis:'1) Vérifier le VIN sur rappel.conso.gouv.fr / Safety Gate 2) Lever le véhicule, roues AR suspendues 3) Inspecter les 2 ressorts AR : fissures, corrosion, diamètre de fil vs spécification constructeur 4) Remplacer les 2 ressorts + coupelles/butées 5) Serrer aux couples constructeur 6) Contrôle géométrie + essai routier', parts:'Ressorts AR x2, coupelles, butées', dtc:'', source:'Rappel Conso / Safety Gate', years:'2025-2026', url:'https://www.rappel.conso.gouv.fr/' }
];
/* ===== Modèles récents GARANTIS ===== */
const ENSURE = [
 ['renault','R4 E-Tech','2024-2026',[['Electrique 120','electrique','120 ch'],['Electrique 150','electrique','150 ch']]],
 ['renault','Twingo E-Tech','2026-2026',[['Electrique 82','electrique','82 ch']]],
 ['peugeot','3008 III','2023-2026',[['1.2 Hybrid 136','hybride','136 ch'],['Hybrid 195','hybride','195 ch'],['Hybrid 230','hybride','230 ch']]],
 ['peugeot','E-3008','2024-2026',[['Electrique 210','electrique','210 ch'],['Electrique 230','electrique','230 ch'],['Electrique 320','electrique','320 ch']]],
 ['peugeot','5008 III','2024-2026',[['1.2 Hybrid 136','hybride','136 ch'],['Hybrid 195','hybride','195 ch']]],
 ['peugeot','E-5008','2024-2026',[['Electrique 210','electrique','210 ch'],['Electrique 320','electrique','320 ch']]],
 ['citroen','C3 IV','2024-2026',[['1.2 Hybrid 100','hybride','100 ch'],['1.2 Hybrid 136','hybride','136 ch']]],
 ['citroen','ë-C3','2024-2026',[['Electrique 113','electrique','113 ch']]],
 ['citroen','C3 Aircross III','2024-2026',[['1.2 Hybrid 100','hybride','100 ch'],['1.2 Hybrid 136','hybride','136 ch'],['Electrique 113','electrique','113 ch']]],
 ['ds','DS N°4','2025-2026',[['Hybrid 136','hybride','136 ch'],['E-Tense 210','electrique','210 ch']]],
 ['ds','DS N°8','2025-2026',[['E-Tense 230','electrique','230 ch'],['E-Tense 350','electrique','350 ch']]],
 ['dacia','Bigster','2025-2026',[['1.2 TCe 130','essence','130 ch'],['1.2 TCe 140 4x4','essence','140 ch'],['Hybrid 155','hybride','155 ch']]],
 ['volkswagen','Tiguan III','2024-2026',[['1.5 TSI 130','essence','130 ch'],['1.5 TSI 150','essence','150 ch'],['2.0 TDI 150','diesel','150 ch'],['2.0 TDI 193','diesel','193 ch'],['eHybrid 204','hybride','204 ch'],['eHybrid 272','hybride','272 ch']]],
 ['volkswagen','Passat B9','2024-2026',[['1.5 TSI 150','essence','150 ch'],['2.0 TDI 122','diesel','122 ch'],['2.0 TDI 150','diesel','150 ch'],['2.0 TDI 193','diesel','193 ch'],['eHybrid 204','hybride','204 ch']]],
 ['volkswagen','ID.7','2023-2026',[['Electrique 286','electrique','286 ch'],['Electrique 340','electrique','340 ch']]],
 ['audi','Q6 e-tron','2024-2026',[['Electrique 252','electrique','252 ch'],['Electrique 388','electrique','388 ch'],['SQ6 490','electrique','490 ch']]],
 ['audi','A5 B10','2024-2026',[['2.0 TSI 150','essence','150 ch'],['2.0 TSI 204','essence','204 ch'],['2.0 TDI 204','diesel','204 ch']]],
 ['bmw','X3 G45','2024-2026',[['20 208','essence','208 ch'],['20d 197','diesel','197 ch'],['30e 299','hybride','299 ch'],['M50 398','essence','398 ch']]],
 ['bmw','i5','2023-2026',[['eDrive40 340','electrique','340 ch'],['M60 601','electrique','601 ch']]],
 ['mercedes','Classe E W214','2024-2026',[['E200 204','essence','204 ch'],['E220d 197','diesel','197 ch'],['E300e 313','hybride','313 ch'],['E400e 381','hybride','381 ch']]],
 ['mercedes','CLA C174','2025-2026',[['Electrique 272','electrique','272 ch'],['Electrique 354','electrique','354 ch']]],
 ['opel','Grandland II','2024-2026',[['1.2 Hybrid 136','hybride','136 ch'],['1.2 Hybrid 145','hybride','145 ch'],['Electrique 210','electrique','210 ch'],['Electrique 230','electrique','230 ch']]],
 ['fiat','Grande Panda','2024-2026',[['1.2 Hybrid 100','hybride','100 ch'],['1.2 100','essence','100 ch'],['Electrique 113','electrique','113 ch']]],
 ['fiat','600','2023-2026',[['1.2 Hybrid 100','hybride','100 ch'],['Electrique 156','electrique','156 ch']]],
 ['fiat','Topolino','2023-2026',[['Electrique 42','electrique','42 ch']]],
 ['skoda','Kodiaq II','2024-2026',[['1.5 TSI 150','essence','150 ch'],['2.0 TDI 150','diesel','150 ch'],['2.0 TDI 193','diesel','193 ch']]],
 ['skoda','Superb IV','2024-2026',[['1.5 TSI 150','essence','150 ch'],['2.0 TDI 150','diesel','150 ch'],['2.0 TSI 204','essence','204 ch'],['iV 204','hybride','204 ch']]],
 ['volvo','EX90','2024-2026',[['Electrique 449','electrique','449 ch'],['Electrique 517','electrique','517 ch']]],
 ['volvo','ES90','2025-2026',[['Electrique 333','electrique','333 ch'],['Electrique 680','electrique','680 ch']]],
 ['porsche','Macan EV','2024-2026',[['Electrique 360','electrique','360 ch'],['Electrique 639','electrique','639 ch']]],
 ['porsche','Taycan II','2024-2026',[['Electrique 408','electrique','408 ch'],['Electrique 544','electrique','544 ch'],['Turbo GT 1108','electrique','1108 ch']]],
 ['toyota','C-HR II','2023-2026',[['1.8 Hybrid 140','hybride','140 ch'],['2.0 Hybrid 200','hybride','200 ch'],['2.0 PHEV 223','hybride','223 ch']]],
 ['toyota','Land Cruiser 250','2024-2026',[['2.8 D-4D 204','diesel','204 ch'],['2.8 Mild Hybrid 204','hybride','204 ch']]],
 ['hyundai','Inster','2024-2026',[['Electrique 97','electrique','97 ch'],['Electrique 115','electrique','115 ch']]],
 ['hyundai','Santa Fe MX5','2024-2026',[['1.6 T-GDI Hybrid 215','hybride','215 ch'],['1.6 T-GDI PHEV 253','hybride','253 ch']]],
 ['hyundai','Ioniq 9','2025-2026',[['Electrique 218','electrique','218 ch'],['Electrique 435','electrique','435 ch']]],
 ['kia','EV3','2024-2026',[['Electrique 204','electrique','204 ch']]],
 ['kia','EV4','2025-2026',[['Electrique 204','electrique','204 ch']]],
 ['kia','EV5','2025-2026',[['Electrique 218','electrique','218 ch'],['Electrique 313','electrique','313 ch']]],
 ['byd','Dolphin Surf','2025-2026',[['Electrique 88','electrique','88 ch'],['Electrique 156','electrique','156 ch']]],
 ['byd','Seal 6','2025-2026',[['DM-i 218','hybride','218 ch']]],
 ['mg','S5 EV','2024-2026',[['Electrique 170','electrique','170 ch'],['Electrique 204','electrique','204 ch']]],
 ['omoda','7','2025-2026',[['1.6 156','essence','156 ch'],['PHEV 347','hybride','347 ch']]],
 ['jaecoo','5','2025-2026',[['1.6 147','essence','147 ch'],['Electrique 204','electrique','204 ch']]],
 ['jaecoo','8','2025-2026',[['PHEV 530','hybride','530 ch']]],
 ['leapmotor','B10','2025-2026',[['Electrique 218','electrique','218 ch']]],
 ['ford','Puma Gen-E','2025-2026',[['Electrique 168','electrique','168 ch']]],
 ['mini','Countryman U25','2024-2026',[['1.5 156','essence','156 ch'],['2.0 204','essence','204 ch'],['SE 313','electrique','313 ch']]],
 ['mini','Aceman','2024-2026',[['E 184','electrique','184 ch'],['SE 258','electrique','258 ch']]],
 ['tesla','Model 3 Highland','2023-2026',[['Propulsion 264','electrique','264 ch'],['Grande Autonomie 498','electrique','498 ch']]],
 ['tesla','Cybertruck','2024-2026',[['Electrique 600','electrique','600 ch'],['Electrique 845','electrique','845 ch']]]
];
const GENERIC = {
  diesel: { issues: [['Vanne EGR encrassée', 'Perte puissance, voyant, ralenti instable', 'P0401 / P0490'], ['FAP colmaté', 'Régénérations fréquentes, perte puissance', 'P2002 / P2463'], ['Système AdBlue', 'Cristallisation, pompe HS, countdown', 'P20EE / P204F'], ['Pompe haute pression', 'Démarrage difficile, pression rail basse', 'P0087 / P0088'], ['Injecteurs', 'Claquement, fumée, surconso, ratés', 'P0201-P0204'], ['Chaîne / courroie distribution', 'Claquement froid, décalage calage', 'P0016 / P0335'], ['Turbo / géométrie variable', 'Perte puissance, sifflement anormal', 'P0299 / P0234'], ['Préchauffage', 'Démarrage difficile à froid', 'P0380 / P0671']], dtc: ['P0401', 'P0490', 'P2002', 'P2463', 'P20EE', 'P0087', 'P0201', 'P0016', 'P0299', 'P0380'] },
  essence: { issues: [['Chaîne de distribution', 'Claquement froid, usure tendeur', 'P0016 / P0335'], ['Courroie de distribution (humide)', 'Débris, pompe à huile colmatée', 'P0087 / P0340'], ['Injecteurs / calamine (injection directe)', 'Ratés, ralenti instable, perte puissance', 'P0300-P0304'], ['Pompe haute pression (GDI)', 'Pression rail insuffisante', 'P0087'], ['Catalyseur', 'Vieillissement, contre-pression, odeur', 'P0420'], ['Turbo', 'Fuite admission, sous/sur-turbo', 'P0299 / P0234'], ['Allumage bougies/bobines', 'À-coups, ratés accélération', 'P0300-P0304'], ['Électronique / tension', 'Défauts multiples, batterie/alternateur', 'P0562']], dtc: ['P0016', 'P0087', 'P0300', 'P0301', 'P0335', 'P0340', 'P0420', 'P0299', 'P0562'] },
  hybride: { issues: [['Batterie haute tension', 'Vieillissement cellules, équilibrage, isolation', 'U0111 / P0AA6'], ['Onduleur / convertisseur', 'Perte puissance, défaut isolement', 'P0AA6'], ['Défaut de charge', 'Charge lente/absente (OBC/ICCU)', 'P0D11 / U0111'], ['Défaut d\'autonomie', 'Perte capacité, estimation erronée', 'U0111'], ['Freinage régénératif', 'À-coups, capteur pédale', 'C1365'], ['Batterie 12V / DC-DC', 'Non-démarrage, défaut circuit charge', 'P0562 / U0111'], ['Thermique batterie', 'Refroidissement, surchauffe modules', 'P0C00'], ['Moteur thermique associé', 'EGR/FAP/courroie selon motorisation', 'P0401 / P0087']], dtc: ['U0111', 'P0AA6', 'P0D11', 'P0C00', 'C1365', 'P0562'] },
  electrique: { issues: [['Batterie haute tension', 'Dégradation, surchauffe modules, BMS, isolation', 'P0AA6 / U0111'], ['Défaut de charge (OBC/ICCU/borne)', 'Charge lente/absente, erreurs connecteur', 'P0D11 / U0111'], ['Défaut d\'autonomie', 'Perte capacité, équilibrage cellules', 'U0111'], ['Court-circuit / isolement HV', 'Défaut isolement, sécurité coupure', 'P0AA6'], ['Batterie 12V / DC-DC', 'Non-démarrage, défaut 12V', 'P0562 / U0111'], ['Moteur électrique / onduleur', 'Perte puissance, bruit anormal', 'P0AA6'], ['Thermique batterie', 'Refroidissement, pompe LDR', 'P0C00'], ['Électronique / logiciels', 'Bugs BMS/MBUX, MAJ nécessaires', 'U0101']], dtc: ['P0AA6', 'U0111', 'P0D11', 'P0C00', 'P0562', 'U0101'] }
};
const UNIV = [
  ['Airbag (campagne Takata / générateur)', 'Risque rupture générateur au déploiement — remplacement inflateur selon rappel', '', 'NHTSA / Rappel Conso'],
  ['Ceintures de sécurité (prétensionneur/ancrage)', 'Prétensionneur pyrotechnique ou ancrage non conforme — campagne de contrôle', '', 'Safety Gate'],
  ['Caméra recul / 360°', 'Image figée, buée, perte signal — MAJ ou remplacement caméra', '', 'Campagne constructeur'],
  ['Caméra ADAS / radar (calibration)', 'Perte fonctions assistance, défaut calibration pare-brise', 'U0121', 'Campagne constructeur'],
  ['Conduite autonome / ACC', 'Freinage fantôme, perte assistance direction — MAJ logicielle obligatoire', 'U0101', 'NHTSA'],
  ['Court-circuit faisceau / 12V', 'Risque échauffement câblage, incendie — campagne inspection faisceau', '', 'NHTSA / Rappel Conso'],
  ['Incendie compartiment moteur / batterie', 'Fuite carburant ou défaut module HV — arrêt immédiat si rappel ouvert', '', 'Safety Gate / NHTSA'],
  ['Électronique multiplexée / gateway', 'Défauts communication multiples, écrans figés', 'U0101 / U0121', 'Campagne constructeur'],
  ['Batterie 12V / système charge', 'Non-démarrage répétitif, contrôle SOH + alternateur/DC-DC', 'P0562', 'Campagne constructeur'],
  ['Capteurs TPMS / pression', 'Perte signal capteur, voyant erroné', '', 'Campagne constructeur']
];
let db, usersData = {}, brandsData = {}, motorsCache = [], deferredPrompt = null, listenersStarted = false, ensureDone = false;
let curBrand = null, curModelId = null, curModelName = null;

window.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  setupInstall(); bindAdminTable(); boot(); checkMonthly();
});

function el(id) { return document.getElementById(id); }
function val(id) { return el(id).value; }
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); el(id).classList.add('active'); }
function screenIsActive(id) { return el(id).classList.contains('active'); }
function notify(m, t) { const n = document.createElement('div'); n.className = 'notification' + (t === 'error' ? ' error' : ''); n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 3500); }
function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
function deviceId() { let id = localStorage.getItem('autodiag_device'); if (!id) { id = 'DEV-' + Math.random().toString(36).substr(2, 8).toUpperCase(); localStorage.setItem('autodiag_device', id); } return id; }
function uid(p) { return p + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); }

/* ===== AUTO-RÉPARATION : modèles + fiches rappels clés ===== */
async function ensureCatalog() {
  if (ensureDone) return;
  ensureDone = true;
  try {
    const existing = (await db.ref('data/models').once('value')).val() || {};
    const set = {}; Object.values(existing).forEach(m => set[m.brandId + '|' + String(m.name).toLowerCase()] = 1);
    let added = 0;
    for (let i = 0; i < ENSURE.length; i++) {
      const e = ENSURE[i];
      if (set[e[0] + '|' + e[1].toLowerCase()]) continue;
      const id = 'e_' + e[0] + '_' + i;
      await db.ref('data/models/' + id).set({ brandId: e[0], name: e[1], years: e[2] });
      await db.ref('data/motors/' + id).set(e[3].map(m => ({ name: m[0], fuel: m[1], power: m[2] })));
      added++;
    }
    if (added) notify('🚗 ' + added + ' modèles récents ajoutés automatiquement');
    const iss = (await db.ref('data/issues').once('value')).val() || {};
    const tI = {}; Object.values(iss).forEach(x => tI[String(x.title).toLowerCase()] = 1);
    let aI = 0;
    for (const k of KEY_ISSUES) if (!tI[k.title.toLowerCase()]) { await db.ref('data/issues/' + uid('key')).set(k); aI++; }
    const ex = (await db.ref('data/expert').once('value')).val() || {};
    const tE = {}; Object.values(ex).forEach(x => tE[String(x.title).toLowerCase()] = 1);
    for (const k of KEY_EXPERT) if (!tE[k.title.toLowerCase()]) { await db.ref('data/expert/' + uid('key')).set(k); aI++; }
    if (aI) notify('🔩 Rappels officiels ajoutés (Bigster ressorts AR + procédure)');
  } catch (e) { console.warn('ensure', e); }
}

async function checkMonthly() {
  const v = (await db.ref('data/version').once('value')).val();
  if (!v || !v.lastUpdate) return;
  if (Date.now() - new Date(v.lastUpdate).getTime() > MONTHLY_MS) {
    if (sessionStorage.getItem('autodiag_admin') === '1') { await updateBase(true); notify('📅 MAJ mensuelle diffusée automatiquement'); }
    else notify('📅 Base > 30 jours : MAJ mensuelle en diffusion');
  }
}
async function updateBase(manual) {
  await db.ref('data/version').set({ version: Date.now(), lastUpdate: new Date().toISOString(), updateIntervalDays: 30 });
  if (manual) notify('✅ MAJ diffusée sur toutes les APK');
}

function boot() {
  if (!listenersStarted) {
    listenersStarted = true;
    db.ref('access/users').on('value', s => { usersData = s.val() || {}; routeUser(); if (screenIsActive('screen-admin')) renderAdmin(); });
    db.ref('data/brands').on('value', s => { brandsData = s.val() || {}; if (screenIsActive('screen-admin')) fillBrandSelects(); });
    db.ref('data/version').on('value', s => { const v = s.val(); const t = v && v.lastUpdate ? new Date(v.lastUpdate).toLocaleDateString('fr-FR') : '--'; if (el('app-version')) el('app-version').textContent = t; if (el('admin-version')) el('admin-version').textContent = t; });
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

function loginAdmin() {
  if (el('admin-pwd').value === ADMIN_PASSWORD) { sessionStorage.setItem('autodiag_admin', '1'); el('admin-pwd').value = ''; boot(); showScreen('screen-admin'); renderAdmin(); fillBrandSelects(); checkMonthly(); }
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

function fillBrandSelects() {
  ['nm-brand', 'is-brand', 'ex-brand'].forEach(id => { const s = el(id); if (!s) return; s.innerHTML = ''; Object.entries(brandsData).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, b]) => { s.innerHTML += '<option value="' + k + '">' + esc(b.name) + '</option>'; }); });
  fillModelSelect(); fillModelSelectAdmin();
}
function fillModelSelect() {
  const b = val('is-brand');
  db.ref('data/models').once('value').then(s => { const sel = el('is-model'); sel.innerHTML = ''; Object.values(s.val() || {}).filter(m => m.brandId === b).forEach(m => { sel.innerHTML += '<option value="' + esc(m.name) + '">' + esc(m.name) + '</option>'; }); });
}
function fillModelSelectAdmin() {
  db.ref('data/models').once('value').then(s => { const sel = el('mo-model'); if (!sel) return; sel.innerHTML = ''; Object.entries(s.val() || {}).forEach(([k, m]) => { const bn = brandsData[m.brandId] ? brandsData[m.brandId].name : m.brandId; sel.innerHTML += '<option value="' + k + '">' + esc(bn + ' ' + m.name) + '</option>'; }); });
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
  await db.ref('data/issues/iss_' + Date.now()).set({ brandId: val('is-brand'), model: val('is-model'), title: t, detail: el('is-detail').value.trim(), source: val('is-source'), dtc: el('is-dtc').value.trim(), url: el('is-url') ? el('is-url').value.trim() : '' });
  el('is-title').value = ''; el('is-detail').value = ''; notify('✅ Panne ajoutée');
}
async function addExpert() {
  const t = el('ex-title').value.trim(); if (!t) return notify('Titre requis', 'error');
  await db.ref('data/expert/ex_' + Date.now()).set({ brandId: val('ex-brand'), model: el('ex-model').value.trim(), motor: el('ex-motor').value.trim(), title: t, symptom: el('ex-symptom').value.trim(), diagnosis: el('ex-diag').value.trim(), parts: el('ex-parts').value.trim(), dtc: el('ex-dtc').value.trim(), years: el('ex-years').value.trim(), source: val('ex-source'), url: el('ex-url') ? el('ex-url').value.trim() : '' });
  el('ex-title').value = ''; el('ex-diag').value = ''; notify('🧠 Fiche expert ajoutée');
}
async function addDTC() {
  const c = el('dt-code').value.trim().toUpperCase(), d = el('dt-desc').value.trim(); if (!c || !d) return notify('Code+description requis', 'error');
  await db.ref('data/dtc/' + c.replace(/[^A-Z0-9]+/g, '_')).set({ code: c, description: d, cause: el('dt-cause').value.trim(), solution: el('dt-sol').value.trim() });
  el('dt-code').value = ''; notify('✅ DTC ajouté');
}
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
      await db.ref('data/issues/' + uid('imp')).set({ brandId: it.brand, model: it.model || '', motor: it.motor || '', title: it.title, detail: it.detail || '', source: it.source || 'Import', dtc: it.dtc || '', url: it.url || '' }); n++;
    } else if (it.type === 'expert' && it.brand && it.title) {
      await db.ref('data/expert/' + uid('imp')).set({ brandId: it.brand, model: it.model || '', motor: it.motor || '', title: it.title, symptom: it.symptom || '', diagnosis: it.diagnosis || '', parts: it.parts || '', dtc: it.dtc || '', years: it.years || '', source: it.source || 'Import', url: it.url || '' }); n++;
    } else if (it.type === 'dtc' && it.code) {
      await db.ref('data/dtc/' + String(it.code).toUpperCase().replace(/[^A-Z0-9]+/g, '_')).set({ code: String(it.code).toUpperCase(), description: it.description || '', cause: it.cause || '', solution: it.solution || '' }); n++;
    }
  }
  el('import-json').value = ''; notify('✅ ' + n + ' fiches importées');
}

let expertTimer = null;
function expertSearch() { clearTimeout(expertTimer); expertTimer = setTimeout(doExpertSearch, 300); }
async function doExpertSearch() {
  const q = el('expert-search').value.trim().toLowerCase();
  const box = el('expert-results');
  if (q.length < 3) { box.innerHTML = ''; return; }
  const ex = (await db.ref('data/expert').once('value')).val() || {};
  const iss = (await db.ref('data/issues').once('value')).val() || {};
  let html = '';
  Object.values(ex).filter(e => ((e.title || '') + ' ' + (e.symptom || '') + ' ' + (e.diagnosis || '') + ' ' + (e.parts || '') + ' ' + (e.dtc || '') + ' ' + (e.motor || '') + ' ' + (e.model || '')).toLowerCase().includes(q)).slice(0, 15).forEach(e => html += expertCard(e, '🧠 '));
  Object.values(iss).filter(i => ((i.title || '') + ' ' + (i.detail || '') + ' ' + (i.dtc || '') + ' ' + (i.model || '')).toLowerCase().includes(q)).slice(0, 10).forEach(i => html += issueCard(i, ''));
  UNIV.filter(u => (u[0] + ' ' + u[1]).toLowerCase().includes(q)).forEach(u => html += univCard(u));
  Object.entries(GENERIC).forEach(([f, g]) => g.issues.forEach(i => { if ((i[0] + ' ' + i[1]).toLowerCase().includes(q)) html += '<div class="issue-card"><strong>' + i[0] + '</strong><span class="src">Typique ' + FUELS[f] + '</span><p>' + i[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + i[2] + '</p></div>'; }));
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune fiche pour « ' + esc(q) + ' » — essayez : ressort, suspension, airbag, ceinture, caméra, ADAS, incendie, court-circuit, charge, autonomie, courroie, chaîne, FAP, EGR, injecteurs…</p>';
}
function srcLink(u) { return u ? '<p><a href="' + u + '" target="_blank" rel="noopener" style="color:#4ade80;font-size:12px;font-weight:600">🔗 Source officielle / spécialisée</a></p>' : ''; }
function univCard(u) { return '<div class="issue-card" style="border-left-color:#f59e0b"><strong>🌐 ' + u[0] + '</strong><span class="src">' + u[3] + '</span><p>' + u[1] + '</p>' + (u[2] ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + u[2] + '</p>' : '') + '</div>'; }
function expertCard(e, prefix) {
  const bn = brandsData[e.brandId] ? brandsData[e.brandId].name : '';
  return '<div class="issue-card" style="border-left-color:#f59e0b"><strong>' + prefix + esc(e.title) + '</strong><span class="src">🧠 ' + esc(e.source || 'Expert') + '</span>' + (bn ? '<span class="src">' + esc(bn) + '</span>' : '') + (e.model ? '<span class="src">' + esc(e.model) + '</span>' : '') + (e.motor ? '<span class="src">' + esc(e.motor) + '</span>' : '') +
    (e.symptom ? '<p><strong>⚠️ Symptômes :</strong> ' + esc(e.symptom) + '</p>' : '') +
    (e.diagnosis ? '<p><strong>🔬 Diagnostic ingénieur :</strong> ' + esc(e.diagnosis) + '</p>' : '') +
    (e.parts ? '<p><strong>🔩 Pièces :</strong> ' + esc(e.parts) + '</p>' : '') +
    (e.dtc ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + esc(e.dtc) + '</p>' : '') +
    (e.years ? '<p style="font-size:11px;color:#94a3b8">Années : ' + esc(e.years) + '</p>' : '') + srcLink(e.url) + '</div>';
}
function issueCard(i, prefix) { return '<div class="issue-card"><strong>' + prefix + esc(i.title) + '</strong><span class="src">' + esc(i.source || '') + '</span>' + (i.motor ? '<span class="src">' + esc(i.motor) + '</span>' : '') + '<p>' + esc(i.detail || '') + '</p>' + (i.dtc ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + esc(i.dtc) + '</p>' : '') + srcLink(i.url) + '</div>'; }

async function enterApp() {
  const s = getSession(); const isAdmin = sessionStorage.getItem('autodiag_admin') === '1';
  if (!isAdmin && (!s || s.status !== 'accepted')) return notify('Accès non autorisé', 'error');
  await ensureCatalog();
  el('app-user').textContent = isAdmin ? '👑 Admin' : s.prenom;
  showScreen('screen-app');
  brandsData = (await db.ref('data/brands').once('value')).val() || {};
  const sel = el('sel-marque');
  const regions = { francaises: '🇫 Françaises', europeennes: '🇪 Européennes', asiatiques: '🌏 Asiatiques', chinoises: '🇨🇳 Chinoises', americaines: '🇺 Américaines' };
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
  ['issues-box', 'dtc-box', 'expert-box'].forEach(id => el(id).innerHTML = '<p style="color:#94a3b8">Sélectionnez…</p>');
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
function motorMatch(e, motor) { if (!e.motor) return true; if (!motor) return false; const a = String(e.motor).toLowerCase(), b = String(motor.name).toLowerCase(); return b.includes(a) || a.includes(b); }
async function correlate() {
  const box = el('issues-box'), dbox = el('dtc-box'), ebox = el('expert-box');
  if (!curBrand || !curModelName) { box.innerHTML = dbox.innerHTML = ebox.innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule…</p>'; return; }
  const mi = val('sel-motor'); const motor = mi !== '' ? motorsCache[mi] : null;
  const fuel = motor ? motor.fuel : null;
  const all = Object.values((await db.ref('data/issues').once('value')).val() || {}).filter(i => i.brandId === curBrand && (!i.model || i.model === curModelName));
  const specific = motor ? all.filter(i => i.motor && String(motor.name).toLowerCase().includes(String(i.motor).toLowerCase())) : [];
  const general = all.filter(i => !specific.includes(i));
  let html = '';
  specific.forEach(i => html += issueCard(i, '🎯 '));
  general.forEach(i => html += issueCard(i, ''));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].issues.forEach(g => { html += '<div class="issue-card"><strong>' + g[0] + '</strong><span class="src">Typique ' + FUELS[fuel] + '</span><p>' + g[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + g[2] + '</p></div>'; });
  UNIV.forEach(u => html += univCard(u));
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune panne — vérifiez les sites officiels.</p>';
  const exAll = Object.values((await db.ref('data/expert').once('value')).val() || {});
  const exHits = exAll.filter(e => e.brandId === curBrand && (!e.model || e.model === curModelName) && motorMatch(e, motor));
  ebox.innerHTML = exHits.length ? exHits.map(e => expertCard(e, '🧠 ')).join('') : '<p style="color:#94a3b8">Aucune fiche expert spécifique — recherche par symptôme ci-dessus.</p>';
  const codes = new Set();
  all.forEach(i => String(i.dtc || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  exHits.forEach(e => String(e.dtc || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  UNIV.forEach(u => String(u[2] || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].dtc.forEach(c => codes.add(c));
  const D = (await db.ref('data/dtc').once('value')).val() || {};
  let dh = '';
  codes.forEach(c => { const d = D[c] || D[c.replace(/[^A-Z0-9]+/g, '_')]; dh += d ? '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>' : '<div class="dtc-card"><strong>' + esc(c) + '</strong><p>Code corrélé (détail à importer)</p></div>'; });
  dbox.innerHTML = dh || '<p style="color:#94a3b8">—</p>';
}
let dtcTimer = null;
function searchDTC() { clearTimeout(dtcTimer); dtcTimer = setTimeout(doSearchDTC, 300); }
async function doSearchDTC() {
  const q = el('dtc-search').value.toUpperCase().trim(); const c = el('dtc-results');
  if (q.length < 2) { c.innerHTML = ''; return; }
  const m = Object.values((await db.ref('data/dtc').once('value')).val() || {}).filter(d => (d.code || '').toUpperCase().includes(q) || (d.description || '').toLowerCase().includes(q.toLowerCase()));
  c.innerHTML = m.length ? m.slice(0, 12).map(d => '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>').join('') : '<p style="color:#94a3b8">Aucun DTC trouvé</p>';
}

function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; el('install-btn').classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { el('install-btn').classList.add('hidden'); notify('🎉 APK installée !'); });
}
async function installApp() { if (!deferredPrompt) return notify('Non disponible ici', 'error'); deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; el('install-btn').classList.add('hidden'); }
