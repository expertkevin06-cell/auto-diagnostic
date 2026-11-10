/* UPDATE2026.JS v1 — MAJ manuelle expert : pannes + marques + modèles 2026/2027 (mode ingénieur-chercheur) */
/* Format fiche panne : [brand, model, motor, TYPE, title, symptom, diagnosis, organes, dtc, source, years] */
const BATCH_2026_ISSUES = [
 ['renault','R4 E-Tech','Electrique 150','Batterie HV / électronique','BMS : déséquilibrage cellules LFP (2025-2027)','Perte autonomie progressive, charge plafonnée à 80%, delta cellules >60 mV','1) Lecture delta cellules au diag 2) Test résistance isolement 3) MAJ BMS dernière version 4) Équilibrage forcé charge lente 12h 5) Remplacement module si delta persistant','BMS, modules LFP, capteurs température','P0AA6, U0111','Campagne constructeur','2025-2027'],
 ['renault','Clio 6','E-Tech 140','Hybride / onduleur','Onduleur E-Tech : surchauffe module puissance','Perte puissance en montée prolongée, défaut système hybride, odeur chaud','1) Lire codes onduleur 2) Contrôler débit pompe LDR onduleur 3) Thermographie module 4) MAJ gestion thermique 5) Remplacement onduleur si dérives','Onduleur, pompe LDR, radiateur','P0A93, P0AA6','Campagne constructeur','2025-2027'],
 ['dacia','Bigster','Hybrid 155','Transmission','Boîte double embrayage hybride : à-coups basse vitesse','Broutages 1er/2e rapport, vibrations démarrage','1) Lire adaptations embrayage 2) Contrôle niveau huile boîte 3) Procédure apprentissage 4) MAJ TCU 5) Kit embrayage si confirmé','Embrayages, mécatronique, TCU','P0700','TSB','2025-2027'],
 ['volkswagen','ID.Every1','Electrique 95','Charge','OBC 11 kW : non-charge AC intermittente','Charge qui s\'arrête aléatoirement, erreur borne, P0D11','1) Test charge AC multi-bornes 2) Lire codes OBC 3) Contrôle connecteur/échauffement 4) MAJ OBC 5) Remplacement OBC','OBC, connecteur charge, capteur température','P0D11','Safety Gate','2027-2027'],
 ['tesla','Model Q','Propulsion 204','ADAS / conduite autonome','Caméra habitacle : perte détection mains (ACC)','Désengagements ACC, alertes direction injustifiées','1) Version logiciel 2) Nettoyage/calibration caméra habitacle 3) MAJ 4) Logs NHTSA si récidive','Caméra habitacle, calculateur ADAS','U0121','NHTSA','2026-2027'],
 ['byd','Seal U DM-i','DM-i 218','Moteur thermique','Pompe à huile DM-i : pression basse à chaud','Voyant pression huile, claquement à chaud','1) Mesure pression rail huile 2) Contrôle crépine 3) Remplacement pompe + vidange','Pompe à huile, crépine','P0087','Campagne constructeur','2026-2027'],
 ['hyundai','Ioniq 3','Electrique 170','Charge / 12V','ICCU gen2 : défaut DC-DC','Non-charge batterie 12V, démarrage impossible','1) Codes ICCU 2) Test sortie DC-DC 3) Remplacement ICCU + 12V sous campagne','ICCU, convertisseur DC-DC, batterie 12V','U0111, P0AA6','NHTSA','2026-2027'],
 ['kia','EV2','Electrique 136','Batterie HV','Batterie NCM : delta cellules module 4','Perte autonomie, limitation puissance ponctuelle','1) Delta cellules 2) Thermographie 3) MAJ BMS 4) Module si nécessaire','Modules NCM, BMS','P0AA6','Safety Gate','2026-2027'],
 ['skoda','Epiq','Electrique 170','Électronique / logiciel','BMS : estimation SOC erronée','Jauge qui saute, autonomie affichée incohérente','1) Cycles charge complète 2) MAJ BMS 3) Réapprentissage SOC','Logiciel BMS','U0111','Campagne constructeur','2026-2027'],
 ['peugeot','208 III','1.2 Hybrid 100','Distribution / courroie','Courroie humide PureTech gen3 : contrôle préventif','Bruit courroie, débris huile (campagne surveillance)','1) Gabarit usure courroie 2) Inspection carter 3) Kit courroie + pompe si hors cote','Kit courroie, pompe à huile','P0087, P0340','Rappel Conso','2026-2027'],
 ['mercedes','GLB EV','Electrique 272','Batterie HV / sécurité','Contacteurs HV : collage relais principal','Non-démarrage après charge rapide, défaut isolement','1) Test contacteurs 2) Mesure résistance 3) Remplacement pack relais','Contacteurs HV, relais principal','P0AA6','KBA','2026-2027'],
 ['bmw','i3 Neue Klasse','Electrique 272','Batterie HV / sécurité','Module BMS : défaut mesure isolement','Alerte isolement intempestive, limitation','1) Mesure isolement réelle 2) Capteurs BMS 3) MAJ 4) Module capteur','Capteurs isolement, BMS','P0AA6','KBA','2026-2027'],
 ['audi','A2 e-tron','Electrique 204','Charge','Charge DC limitée à 50 kW (bridage thermique)','Charge rapide anormalement lente','1) Historique thermique batterie 2) MAJ gestion charge 3) Contrôle boucle LDR','Boucle LDR, pompe, logiciel charge','P0C00','Campagne constructeur','2026-2027'],
 ['mg','MG2','Electrique 156','Charge / 12V','DC-DC : décharge 12V récurrente','Batterie 12V à plat après 48h','1) Courant de repos 2) Test DC-DC 3) MAJ 4) Remplacement DC-DC','Convertisseur DC-DC, 12V','P0562, U0111','Campagne constructeur','2026-2027'],
 ['ford','Puma Gen-E','Electrique 168','Charge / sécurité','Connecteur charge : échauffement broches','Odeur chaud, charge interrompue, traces broches','1) Inspection broches 2) Thermographie 3) Remplacement connecteur + câble','Connecteur charge, broches','P0D11','Safety Gate','2026-2027'],
 ['xpeng','G7','Electrique 276','Électronique / logiciel','OTA : brick partiel calculateur ADAS','Perte fonctions ADAS après mise à jour','1) Logs OTA 2) Re-flash calculateur 3) Calibration caméras','Calculateur ADAS','U0121','Campagne constructeur','2026-2027']
];
/* Modèles 2026/2027 : [brandId, name, years, motors, brandName, region] */
const BATCH_2026_MODELS = [
 ['volkswagen','ID.Every1','2027-2027',[['Electrique 95','electrique','95 ch'],['Electrique 115','electrique','115 ch']],'Volkswagen','europeennes'],
 ['volkswagen','ID.Polo','2026-2027',[['Electrique 170','electrique','170 ch'],['Electrique 204','electrique','204 ch'],['GTX 226','electrique','226 ch']],'Volkswagen','europeennes'],
 ['tesla','Model Q','2026-2027',[['Propulsion 204','electrique','204 ch'],['AWD 283','electrique','283 ch']],'Tesla','americaines'],
 ['renault','Estafette E-Tech','2026-2027',[['Electrique 120','electrique','120 ch'],['Electrique 204','electrique','204 ch']],'Renault','francaises'],
 ['peugeot','208 III','2026-2027',[['1.2 Hybrid 100','hybride','100 ch'],['1.2 Hybrid 136','hybride','136 ch'],['Electrique 156','electrique','156 ch']],'Peugeot','francaises'],
 ['citroen','C4 II','2026-2027',[['1.2 Hybrid 136','hybride','136 ch'],['Electrique 210','electrique','210 ch']],'Citroën','francaises'],
 ['hyundai','Ioniq 3','2026-2027',[['Electrique 170','electrique','170 ch'],['Electrique 228','electrique','228 ch']],'Hyundai','asiatiques'],
 ['kia','EV2','2026-2027',[['Electrique 136','electrique','136 ch'],['Electrique 204','electrique','204 ch']],'Kia','asiatiques'],
 ['skoda','Epiq','2026-2027',[['Electrique 170','electrique','170 ch'],['Electrique 204','electrique','204 ch']],'Skoda','europeennes'],
 ['dacia','Jogger II','2027-2027',[['1.2 TCe 130','essence','130 ch'],['Hybrid 155','hybride','155 ch']],'Dacia','europeennes'],
 ['mercedes','GLB EV','2026-2027',[['Electrique 272','electrique','272 ch'],['Electrique 354','electrique','354 ch']],'Mercedes','europeennes'],
 ['bmw','i3 Neue Klasse','2026-2027',[['Electrique 272','electrique','272 ch'],['Electrique 340','electrique','340 ch'],['Electrique 469','electrique','469 ch']],'BMW','europeennes'],
 ['audi','A2 e-tron','2026-2027',[['Electrique 204','electrique','204 ch'],['Electrique 286','electrique','286 ch'],['Electrique 380','electrique','380 ch']],'Audi','europeennes'],
 ['mg','MG2','2026-2027',[['Electrique 156','electrique','156 ch'],['Electrique 204','electrique','204 ch']],'MG','chinoises'],
 ['byd','Seal U DM-i','2026-2027',[['DM-i 218','hybride','218 ch'],['DM-i 320','hybride','320 ch']],'BYD','chinoises'],
 ['xpeng','G7','2026-2027',[['Electrique 276','electrique','276 ch'],['Electrique 473','electrique','473 ch']],'Xpeng','chinoises'],
 ['ford','Puma Gen-E II','2027-2027',[['Electrique 204','electrique','204 ch']],'Ford','americaines']
];
async function apply2026(kind) {
  try {
    if (kind === 'issues') {
      const ex = await dbGet('data/expert');
      const t = {}; Object.values(ex).forEach(x => t[String(x.title).toLowerCase()] = 1);
      let n = 0;
      for (const b of BATCH_2026_ISSUES) {
        if (t[b[4].toLowerCase()]) continue;
        await db.ref('data/expert/' + uid('b26')).set({ brandId: b[0], model: b[1], motor: b[2], type: b[3], title: b[4], symptom: b[5], diagnosis: b[6], parts: b[7], dtc: b[8], source: b[9], years: b[10] });
        n++;
      }
      if (n) notify('🔬 ' + n + ' fiches pannes 2026/2027 intégrées (type + organes + DTC)');
      return n;
    }
    const models = await dbGet('data/models');
    const set = {}; Object.values(models).forEach(m => set[m.brandId + '|' + String(m.name).toLowerCase()] = 1);
    let n = 0;
    for (const e of BATCH_2026_MODELS) {
      const bid = e[0];
      if (!(await db.ref('data/brands/' + bid).once('value')).exists()) await db.ref('data/brands/' + bid).set({ name: e[4] || bid, region: e[5] || 'europeennes' });
      if (set[bid + '|' + e[1].toLowerCase()]) continue;
      const id = 'y26_' + bid + '_' + Date.now() + '_' + n;
      await db.ref('data/models/' + id).set({ brandId: bid, name: e[1], years: e[2] });
      await db.ref('data/motors/' + id).set(e[3].map(m => ({ name: m[0], fuel: m[1], power: m[2] })));
      n++;
    }
    if (n) notify('🚗 ' + n + ' modèles 2026/2027 + motorisations intégrés');
    return n;
  } catch (e) { console.warn('apply2026', e); return 0; }
}
/* ===== BOUTON ADMIN : MAJ manuelle expert ===== */
async function manualUpdate() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') { notify('❌ Réservé admin', 'error'); return; }
  notify('🔄 MAJ manuelle expert : recherche pannes + modèles 2026/2027…');
  const a = await apply2026('issues');
  const b = await apply2026('catalog');
  await applyBatch('issues');
  await applyBatch('catalog');
  ensureDone = false; await ensureCatalog();
  localStorage.setItem('autodiag_sync_issues', String(Date.now()));
  localStorage.setItem('autodiag_sync_catalog', String(Date.now()));
  await selfTest(false);
  notify('✅ MAJ manuelle terminée : ' + (a + b) + ' nouveautés 2026/2027 + lots périodiques vérifiés');
}
/* ===== Affichage scientifique : badge type + organes ===== */
window.expertCard = function (e, prefix) {
  const bn = brandsData[e.brandId] ? brandsData[e.brandId].name : '';
  return '<div class="issue-card" style="border-left-color:#f59e0b"><strong>' + prefix + esc(e.title) + '</strong><span class="src">🧠 ' + esc(e.source || 'Expert') + '</span>' + (e.type ? '<span class="src">🔬 ' + esc(e.type) + '</span>' : '') + (bn ? '<span class="src">' + esc(bn) + '</span>' : '') + (e.model ? '<span class="src">' + esc(e.model) + '</span>' : '') + (e.motor ? '<span class="src">' + esc(e.motor) + '</span>' : '') +
    (e.symptom ? '<p><strong>⚠️ Symptômes :</strong> ' + esc(e.symptom) + '</p>' : '') +
    (e.diagnosis ? '<p><strong>🔬 Protocole ingénieur :</strong> ' + esc(e.diagnosis) + '</p>' : '') +
    (e.parts ? '<p><strong>🔩 Organes/pièces :</strong> ' + esc(e.parts) + '</p>' : '') +
    (e.dtc ? '<p style="color:#fbbf24;font-size:12px">🔗 DTC liés : ' + esc(e.dtc) + '</p>' : '') +
    (e.years ? '<p style="font-size:11px;color:#94a3b8">Années : ' + esc(e.years) + '</p>' : '') + srcLink(e.url) + '</div>';
};
/* ===== Recherche expert incluant le type de panne ===== */
window.doExpertSearch = async function () {
  const q = el('expert-search').value.trim().toLowerCase();
  const box = el('expert-results');
  if (q.length < 3) { box.innerHTML = ''; return; }
  const ex = await dbGet('data/expert');
  const iss = await dbGet('data/issues');
  let html = '';
  Object.values(ex).filter(e => ((e.title || '') + ' ' + (e.type || '') + ' ' + (e.symptom || '') + ' ' + (e.diagnosis || '') + ' ' + (e.parts || '') + ' ' + (e.dtc || '') + ' ' + (e.motor || '') + ' ' + (e.model || '')).toLowerCase().includes(q)).slice(0, 15).forEach(e => html += expertCard(e, '🧠 '));
  Object.values(iss).filter(i => ((i.title || '') + ' ' + (i.detail || '') + ' ' + (i.dtc || '') + ' ' + (i.model || '')).toLowerCase().includes(q)).slice(0, 10).forEach(i => html += issueCard(i, ''));
  BRAND_EXPERT.filter(e => (e[2] + ' ' + e[3] + ' ' + e[4] + ' ' + e[5] + ' ' + e[6]).toLowerCase().includes(q)).slice(0, 15).forEach(e => html += bexCard(e));
  UNIV.filter(u => (u[0] + ' ' + u[1]).toLowerCase().includes(q)).forEach(u => html += univCard(u));
  Object.entries(GENERIC).forEach(([f, g]) => g.issues.forEach(i => { if ((i[0] + ' ' + i[1]).toLowerCase().includes(q)) html += '<div class="issue-card"><strong>' + i[0] + '</strong><span class="src">Typique ' + FUELS[f] + '</span><p>' + i[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + i[2] + '</p></div>'; }));
  Object.entries(GENERIC_EXPERT).forEach(([f, list]) => list.forEach(g => { if ((g[0] + ' ' + g[1] + ' ' + g[2]).toLowerCase().includes(q)) html += genCard(g, f); }));
  html += sourceLinks(q);
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune fiche pour « ' + esc(q) + ' »</p>';
};
/* ===== Ajout fiche expert avec type ===== */
window.addExpert = async function () {
  const t = el('ex-title').value.trim(); if (!t) return notify('Titre requis', 'error');
  await db.ref('data/expert/ex_' + Date.now()).set({ brandId: val('ex-brand'), model: el('ex-model').value.trim(), motor: el('ex-motor').value.trim(), type: el('ex-type') ? el('ex-type').value.trim() : '', title: t, symptom: el('ex-symptom').value.trim(), diagnosis: el('ex-diag').value.trim(), parts: el('ex-parts').value.trim(), dtc: el('ex-dtc').value.trim(), years: el('ex-years').value.trim(), source: val('ex-source'), url: el('ex-url') ? el('ex-url').value.trim() : '' });
  el('ex-title').value = ''; el('ex-diag').value = ''; notify('🧠 Fiche expert scientifique ajoutée');
};
