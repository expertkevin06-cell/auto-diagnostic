/* COHERENCE.JS v1 — Auto-vérification attributions + renforcement massif EV/thermique/hybride */
const IMP = {
 diesel: ['adblue', 'fap', 'egr', 'dci', 'tdi', 'bluehdi', 'diesel', 'multijet', 'crdi', 'ecoblue', 'skyactiv-d', 'préchauffage', 'prechauffage'],
 essence: ['puretech', 'tce', 'tsi', 'ecoboost', 'gdi', 'thp', 'vtec', 'essence', 'courroie', 'chaîne', 'chaine', 'bougies', 'bobines', 'catalyseur', 'gpf', 'allumage'],
 hybride: ['e-tech', 'hybride', 'hybrid', 'phev', 'e:hev', 'onduleur'],
 electrique: ['électrique', 'electrique', 'iccu', 'obc', 'bms', 'batterie hv', 'contacteur', 'isolement hv', ' ev', 'e-208', 'zoe', 'leaf', 'charge']
};
const FAMILY = { b47:'diesel', n47:'diesel', om654:'diesel', om651:'diesel', ea288:'diesel', ea888:'essence', n20:'essence', b48:'essence', b58:'essence', n55:'essence', m264:'essence', m254:'essence', si4:'essence', firefly:'essence', thetaii:'essence', 'theta ii':'essence', dci:'diesel', tdi:'diesel', bluehdi:'diesel', crdi:'diesel', multijet:'diesel', ecoblue:'diesel', 'skyactiv-d':'diesel', jtd:'diesel', 'd-4d':'diesel', puretech:'essence', tce:'essence', tsi:'essence', ecoboost:'essence', gdi:'essence', thp:'essence', vtec:'essence', 'e-tech':'hybride', hybrid:'hybride', phev:'hybride', '48v':'hybride', dm:'hybride', 'dm-i':'hybride', ev:'electrique', iccu:'electrique', obc:'electrique', bms:'electrique', e:'electrique' };
function compat(f, fuel) { if (!f || !fuel) return true; if (f === fuel) return true; if ((f === 'hybride' && fuel === 'electrique') || (f === 'electrique' && fuel === 'hybride')) return true; return false; }
function familyFuel(k) {
  k = String(k).toLowerCase();
  for (const [code, f] of Object.entries(FAMILY)) if (k.includes(code)) return f;
  if (IMP.diesel.some(x => k.includes(x))) return 'diesel';
  if (IMP.essence.some(x => k.includes(x))) return 'essence';
  if (IMP.hybride.some(x => k.includes(x))) return 'hybride';
  if (IMP.electrique.some(x => k.includes(x))) return 'electrique';
  return null;
}
function fuelImplication(t) {
  t = String(t).toLowerCase();
  if (IMP.diesel.some(x => t.includes(x))) return 'diesel';
  if (IMP.essence.some(x => t.includes(x))) return 'essence';
  if (IMP.hybride.some(x => t.includes(x))) return 'hybride';
  if (IMP.electrique.some(x => t.includes(x))) return 'electrique';
  return null;
}
function fuzzyModel(a, b) {
  if (!a || !b) return !a;
  a = String(a).toLowerCase(); b = String(b).toLowerCase();
  if (a === b || a.includes(b) || b.includes(a)) return true;
  return a.split('/').some(p => { p = p.trim(); return p && (b.includes(p) || p.includes(b)); });
}
/* ===== MATCHERS ROBUSTES (remplacent kwMatch / motorMatch) ===== */
window.kwMatch = function (key, motor) {
  if (!key) return true;
  if (!motor) return true;
  const k = String(key).toLowerCase();
  const mn = String(motor.name).toLowerCase();
  if (mn.includes(k)) return true;
  if (curModelName) { const cm = String(curModelName).toLowerCase(); if (k.includes(cm) || cm.includes(k) || k.split('/').some(p => { p = p.trim(); return p && (cm.includes(p) || p.includes(cm)); })) return true; }
  const f = familyFuel(k);
  if (f) return compat(f, motor.fuel);
  return false;
};
window.motorMatch = function (e, motor) {
  if (!e.motor) return true;
  if (!motor) return true;
  const mk = String(e.motor).toLowerCase();
  const mn = String(motor.name).toLowerCase();
  if (mn.includes(mk) || mk.includes(mn)) return true;
  const f = familyFuel(mk);
  if (f) return compat(f, motor.fuel);
  if (curModelName && mk.includes(String(curModelName).toLowerCase())) return true;
  return false;
};
/* ===== LISTES MASSIVES PAR ÉNERGIE : [tag, type, title, symptom, protocol, organes, dtc, source] ===== */
const EV_LIST = [
 ['E','Charge','Non-charge AC : OBC','Charge ne démarre pas en AC','1) Test multi-bornes 2) Codes OBC 3) Contrôle connecteur 4) Remplacement OBC','OBC, connecteur','P0D11','Campagne constructeur'],
 ['E','Charge','Charge DC lente / bridée','Puissance de charge inférieure au spec','1) Thermique batterie 2) MAJ BMS 3) Boucle LDR 4) Test borne','Boucle LDR, BMS','P0C00','TSB'],
 ['E','Charge','Connecteur Type2 : échauffement broches','Odeur chaud, charge interrompue','1) Thermographie 2) Inspection broches 3) Remplacement connecteur','Connecteur, broches','P0D11','Rappel Conso'],
 ['E','Charge','Câble mode 2 / CCPD : défaut communication','Charge domestique impossible','1) Test câble 2) Résistances CP/PP 3) Remplacement câble','Câble, CCPD','','Campagne constructeur'],
 ['E','Charge','Verrouillage trappe/connecteur bloqué','Impossible de débrancher','1) Actuateur 2) Déverrouillage secours 3) Remplacement','Actuateur verrou','','TSB'],
 ['E','Charge','Préconditionnement batterie absent','Charge DC lente à froid','1) MAJ 2) Capteurs température 3) Résistance chauffage HV','Résistance HV, capteurs','P0C00','Campagne constructeur'],
 ['E','Freinage','Servofrein électrique : perte assistance','Pédale dure, distance de freinage allongée','1) Test assistance 2) Codes 3) Remplacement servofrein','Servofrein, capteur pédale','C1365','Rappel Conso / Safety Gate'],
 ['E','Freinage','Freinage régénératif : à-coups / incohérence','À-coups en décélération, pédale dure','1) MAJ logiciel 2) Capteur pédale 3) Calibration régénératif','Logiciel, capteur pédale','C1365','Rappel Conso'],
 ['E','Thermique','Pompe chaleur : perte efficacité hiver','Autonomie hiver effondrée','1) Codes 2) Vannes/octovalve 3) Gaz 4) Remplacement','Pompe chaleur, vannes','P0C00','TSB'],
 ['E','12V','Batterie 12V : décharge rapide','Non-démarrage après immobilisation','1) SOH 12V 2) Courant de repos 3) MAJ gestion veille 4) Remplacement 12V','12V, DC-DC','P0562','Campagne constructeur'],
 ['E','Logiciel','OTA : brick partiel calculateur','Perte fonctions après mise à jour','1) Logs OTA 2) Re-flash 3) Remplacement calculateur','Calculateur','U0101','NHTSA'],
 ['E','Transmission','Réducteur : bruit / jeu','Ronflement, claquement en décélération','1) Jeu 2) Huile réducteur 3) Remplacement','Réducteur','','TSB'],
 ['EH','Batterie HV','SOH dégradé : perte autonomie','Autonomie réduite de plus de 20%','1) SOH au diag 2) Delta cellules 3) Équilibrage 4) Garantie si SOH <70%','Modules, BMS','U0111','Campagne constructeur'],
 ['EH','Batterie HV','Delta cellules / équilibrage','Perte autonomie, charge plafonnée','1) Delta >60 mV 2) Charge lente 12 h 3) MAJ BMS 4) Module si persistant','BMS, modules','P0AA6','TSB'],
 ['EH','Sécurité HV','Isolement HV : défaut','Alerte isolement, coupure sécurité','1) Mesure mégohmmètre 2) Identification branche 3) Remplacement composant','Câblage HV, batterie','P0AA6','NHTSA'],
 ['EH','Batterie HV','Thermique batterie : surchauffe modules','Limitation puissance, alerte température','1) Codes BMS 2) Pompe LDR 3) Radiateur 4) Module','Pompe LDR, radiateur','P0C00','Safety Gate'],
 ['EH','Batterie HV','BMS : estimation SOC erronée','Jauge incohérente, sauts d\'autonomie','1) Cycles complets 2) MAJ BMS 3) Réapprentissage SOC','BMS','U0111','Campagne constructeur'],
 ['EH','Onduleur','Onduleur/moteur : bruit anormal','Sifflement, vibration à l\'accélération','1) Analyse vibratoire 2) Logs onduleur 3) Remplacement','Onduleur, moteur','P0AA6','TSB']
];
const TH_LIST = [
 ['GD','Démarrage','Démarrage difficile à froid','Temps de démarrage anormal','1) Batterie 2) Préchauffage ou carburant 3) Capteurs température','Bougies, batterie, capteurs','','TSB'],
 ['G','Huile','Consommation huile anormale','Baisse niveau, fumée bleue','1) Conso sur 1000 km 2) Endoscopie 3) Segments / PCV','Segments, PCV','','TSB'],
 ['G','Allumage','Ratés allumage bobines/bougies','À-coups, voyant moteur','1) Lire P0300 2) Permutation bobines 3) Remplacement','Bobines, bougies','P0300-P0304','TSB'],
 ['G','Admission','Calamine admission (injection directe)','Perte puissance, ralenti instable','1) Endoscopie 2) Décalaminage 3) MAJ cartographie','Soupapes, admission','','TSB'],
 ['G','Échappement','Catalyseur/GPF : efficacité faible','Voyant, perte puissance','1) Lire P0420/P2463 2) Régénération 3) Remplacement','Catalyseur, GPF','P0420, P2463','TSB'],
 ['GD','Distribution','Chaîne/courroie : usure tendeur','Claquement à froid','1) Scope synchro 2) Tendeur 3) Kit distribution complet','Kit distribution','P0016','TSB'],
 ['GD','Refroidissement','Fuite LDR / pompe à eau','Baisse niveau, surchauffe','1) Mise sous pression 2) Pompe 3) Durites','Pompe à eau, durites','P0217','TSB'],
 ['GD','Refroidissement','Thermostat bloqué ouvert','Température basse, surconsommation','1) Lire P0128 2) Remplacer thermostat','Thermostat','P0128','TSB'],
 ['GD','Turbo','Turbo : fuite / géométrie grippée','Perte puissance, sifflement','1) Lire P0299/P0234 2) Durites 3) Turbo','Turbo, durites','P0299','TSB'],
 ['D','Dépollution','EGR : vanne grippée','Perte puissance, voyant','1) Lire P0401 2) Test ouverture 3) Nettoyage ou remplacement','Vanne EGR','P0401','TSB'],
 ['D','Dépollution','FAP : colmatage','Régénérations fréquentes, perte puissance','1) Mesure ΔP 2) Régénération forcée 3) Remplacement','FAP, capteur ΔP','P2002','TSB'],
 ['D','AdBlue','AdBlue : pompe / injecteur / capteurs','Countdown, voyant AdBlue','1) Lire P20EE 2) Test débit pompe 3) Remplacement','Pompe, injecteur AdBlue','P20EE','TSB'],
 ['D','Injection','Injecteurs / pompe HP : débits','Claquement, fumée, ratés','1) Débits retour 2) Pression rail 3) Remplacement','Injecteurs, pompe HP','P0087, P0201','TSB'],
 ['GD','Transmission','Embrayage / volant bi-masse : broutage','Vibrations, broutage démarrage','1) Test routier 2) Kit embrayage / volant','Embrayage, volant bi-masse','','TSB'],
 ['GD','Transmission','Boîte auto : à-coups / surchauffe','À-coups, message boîte chaude','1) Adaptations 2) Vidange 3) MAJ TCU','Mécatronique, huile','P0700','TSB'],
 ['GD','Direction','Direction assistée : à-coups / dureté','À-coups volant basse vitesse','1) Codes EPS 2) MAJ 3) Colonne direction','Colonne EPS','C1511','TSB'],
 ['GD','Freinage','Disques / plaquettes : voilage / usure','Vibrations au freinage','1) Mesure épaisseur/voile 2) Remplacement','Disques, plaquettes','','TSB'],
 ['GD','Suspension','Amortisseurs / rotules : claquements','Claquements, tenue de route dégradée','1) Jeu 2) Amortisseurs / rotules 3) Géométrie','Amortisseurs, rotules','','TSB'],
 ['GD','Électrique','Alternateur / batterie : défaut charge','Voyant batterie, non-démarrage','1) Tension charge 2) Alternateur 3) Batterie','Alternateur, batterie','P0562','TSB'],
 ['GD','Électronique','Connecteurs / faisceau : oxydation','Défauts multiples intermittents','1) Inspection connecteurs 2) Nettoyage 3) Faisceau','Connecteurs, faisceau','U0101','TSB']
];
const HY_LIST = [
 ['H','48V','Alterno-démarreur 48V : défaut','Non-démarrage, stop & start HS','1) Codes 2) Batterie 48V 3) Alterno-démarreur','Alterno-démarreur, batterie 48V','P0562','Safety Gate'],
 ['H','Hybride','Batterie traction : capacité réduite','Autonomie EV en baisse','1) SOH 2) Delta cellules 3) MAJ BMS 4) Module','Batterie HV','P0AA6','Campagne constructeur'],
 ['H','Hybride','Bascule thermique/élec : à-coups','À-coups à la transition','1) MAJ 2) Embrayage hybridation 3) Calibration','Embrayage hybridation','','TSB'],
 ['H','Hybride','Récupération : incohérence','Freinage régénératif irrégulier','1) MAJ 2) Capteur pédale 3) Calibration','Capteur pédale','C1365','TSB'],
 ['H','Hybride','Refroidissement batterie : pompe','Surchauffe batterie traction','1) Pompe LDR 2) Circuit 3) Remplacement','Pompe LDR batterie','P0C00','TSB'],
 ['H','Hybride','Démarreur thermique sur-sollicité','Usure prématurée démarreur','1) Logs cycles 2) Démarreur 3) MAJ gestion','Démarreur','','TSB']
];
function listCard(g) {
  return '<div class="issue-card" style="border-left-color:#38bdf8"><strong>🔬 ' + g[2] + '</strong><span class="src">' + g[1] + '</span><span class="src">Procédure systématique</span><p><strong>⚠️ Symptômes :</strong> ' + g[3] + '</p><p><strong>🧪 Protocole :</strong> ' + g[4] + '</p><p><strong>🔩 Organes :</strong> ' + g[5] + '</p>' + (g[6] ? '<p style="color:#fbbf24;font-size:12px">🔗 DTC : ' + g[6] + '</p>' : '') + '<p style="font-size:11px;color:#94a3b8">Source : ' + g[7] + '</p></div>';
}
function fuelCards(fuel) {
  let h = '';
  EV_LIST.forEach(g => { if ((g[0] === 'E' && fuel === 'electrique') || (g[0] === 'EH' && (fuel === 'electrique' || fuel === 'hybride'))) h += listCard(g); });
  TH_LIST.forEach(g => { if ((g[0] === 'GD' && (fuel === 'essence' || fuel === 'diesel')) || (g[0] === 'G' && fuel === 'essence') || (g[0] === 'D' && fuel === 'diesel')) h += listCard(g); });
  HY_LIST.forEach(g => { if (g[0] === 'H' && fuel === 'hybride') h += listCard(g); });
  return h;
}
function implOkTitle(text, motor) { if (!motor) return true; const impl = fuelImplication(text); if (!impl) return true; return compat(impl, motor.fuel); }

/* ===== CORRÉLATION RENFORCÉE + COHÉRENTE ===== */
window.correlate = async function () {
  const box = el('issues-box'), dbox = el('dtc-box'), ebox = el('expert-box');
  if (!curBrand || !curModelName) { box.innerHTML = dbox.innerHTML = ebox.innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule…</p>'; return; }
  const mi = val('sel-motor'); const motor = mi !== '' ? motorsCache[mi] : null;
  const fuel = motor ? motor.fuel : null;
  const all = Object.values(await dbGet('data/issues')).filter(i => i.brandId === curBrand && fuzzyModel(i.model, curModelName));
  const specific = motor ? all.filter(i => i.motor && (String(motor.name).toLowerCase().includes(String(i.motor).toLowerCase()) || familyFuel(i.motor) === motor.fuel)) : [];
  const general = all.filter(i => !specific.includes(i));
  let html = '', hidden = 0;
  specific.forEach(i => html += issueCard(i, '🎯 '));
  if (motor) {
    general.forEach(i => { const f = issueFuel(i); if (!f || compat(f, fuel)) html += issueCard(i, ''); else hidden++; });
    if (hidden) html += '<p style="font-size:12px;color:#94a3b8">🔎 ' + hidden + ' panne(s) d\'autres motorisations masquée(s) — filtre actif : ' + FUELS[fuel] + ' (' + esc(motor.name) + ')</p>';
  } else general.forEach(i => html += issueCard(i, ''));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].issues.forEach(g => { html += '<div class="issue-card"><strong>' + g[0] + '</strong><span class="src">Typique ' + FUELS[fuel] + '</span><p>' + g[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + g[2] + '</p></div>'; });
  UNIV.forEach(u => html += univCard(u));
  const bn = brandsData[curBrand] ? brandsData[curBrand].name : curBrand;
  html += sourceLinks(bn + ' ' + curModelName + (motor ? ' ' + motor.name : '') + ' rappel panne 2017-2027');
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune panne — vérifiez les sites officiels.</p>';
  const exAll = Object.values(await dbGet('data/expert'));
  const exHits = exAll.filter(e => e.brandId === curBrand && fuzzyModel(e.model, curModelName) && motorMatch(e, motor) && (e.motor || implOkTitle(e.title + ' ' + (e.symptom || ''), motor)));
  const bex = BRAND_EXPERT.filter(e => e[0] === curBrand && kwMatch(e[1], motor) && (e[1] || implOkTitle(e[2] + ' ' + e[3], motor)));
  let eh = '';
  exHits.forEach(e => eh += expertCard(e, '🧠 '));
  bex.forEach(e => eh += bexCard(e));
  if (fuel && GENERIC_EXPERT[fuel]) GENERIC_EXPERT[fuel].forEach(g => eh += genCard(g, fuel));
  eh += fuelCards(fuel);
  ebox.innerHTML = eh || '<p style="color:#94a3b8">Aucune fiche expert — recherche par symptôme ci-dessus.</p>';
  const codes = new Set();
  const addCodes = s => String(s || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); });
  all.forEach(i => { const f = issueFuel(i); if (motor && f && !compat(f, fuel)) return; addCodes(i.dtc); });
  exHits.forEach(e => addCodes(e.dtc));
  bex.forEach(e => addCodes(e[6]));
  UNIV.forEach(u => addCodes(u[2]));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].dtc.forEach(c => codes.add(c));
  if (fuel && GENERIC_EXPERT[fuel]) GENERIC_EXPERT[fuel].forEach(g => addCodes(g[4]));
  EV_LIST.concat(TH_LIST, HY_LIST).forEach(g => { if ((g[0] === 'E' && fuel === 'electrique') || (g[0] === 'EH' && (fuel === 'electrique' || fuel === 'hybride')) || (g[0] === 'GD' && (fuel === 'essence' || fuel === 'diesel')) || (g[0] === 'G' && fuel === 'essence') || (g[0] === 'D' && fuel === 'diesel') || (g[0] === 'H' && fuel === 'hybride')) addCodes(g[6]); });
  const D = await dbGet('data/dtc');
  let dh = '';
  codes.forEach(c => { const d = D[c] || D[c.replace(/[^A-Z0-9]+/g, '_')]; dh += d ? '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>' : '<div class="dtc-card"><strong>' + esc(c) + '</strong><p>Code corrélé (détail à importer)</p></div>'; });
  dbox.innerHTML = dh || '<p style="color:#94a3b8">—</p>';
};

/* ===== RECHERCHE EXPERT INCLUANT LISTES ÉNERGIE ===== */
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
  EV_LIST.concat(TH_LIST, HY_LIST).filter(g => (g[1] + ' ' + g[2] + ' ' + g[3] + ' ' + g[4] + ' ' + g[5] + ' ' + g[6]).toLowerCase().includes(q)).forEach(g => html += listCard(g));
  Object.entries(GENERIC).forEach(([f, g]) => g.issues.forEach(i => { if ((i[0] + ' ' + i[1]).toLowerCase().includes(q)) html += '<div class="issue-card"><strong>' + i[0] + '</strong><span class="src">Typique ' + FUELS[f] + '</span><p>' + i[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + i[2] + '</p></div>'; }));
  Object.entries(GENERIC_EXPERT).forEach(([f, list]) => list.forEach(g => { if ((g[0] + ' ' + g[1] + ' ' + g[2]).toLowerCase().includes(q)) html += genCard(g, f); }));
  html += sourceLinks(q);
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune fiche pour « ' + esc(q) + ' »</p>';
};

/* ===== AUTO-VÉRIFICATION & RÉPARATION DES ATTRIBUTIONS ===== */
async function attributionAudit(verbose) {
  const models = await dbGet('data/models');
  const expert = await dbGet('data/expert');
  const byBrand = {}; Object.values(models).forEach(m => { (byBrand[m.brandId] = byBrand[m.brandId] || []).push(m.name); });
  let fixed = 0;
  for (const [id, e] of Object.entries(expert)) {
    let motor = String(e.motor || ''), model = String(e.model || ''), upd = false;
    if (motor) {
      const names = byBrand[e.brandId] || [];
      const hit = names.find(n => String(n).length > 2 && motor.toLowerCase().includes(String(n).toLowerCase()));
      if (hit) {
        const rest = motor.toLowerCase().split(String(hit).toLowerCase()).join(' ').replace(/[/|]/g, ' ').trim();
        let nm = '';
        if (/élec|electric|\bev\b/.test(rest)) nm = 'Electrique';
        else if (/hybrid|phev/.test(rest)) nm = 'Hybrid';
        else if (/dci|tdi|diesel|crdi/.test(rest)) nm = 'diesel';
        else if (/tce|tsi|puretech|essence|ecoboost/.test(rest)) nm = 'essence';
        e.model = model || hit; e.motor = nm; upd = true;
      } else if (/élec|electric/.test(motor) && !/electrique/i.test(motor)) { e.motor = 'Electrique'; upd = true; }
    }
    if (upd) { await db.ref('data/expert/' + id).update({ model: e.model, motor: e.motor }); fixed++; }
  }
  window.attribReport = { fixed: fixed, experts: Object.keys(expert).length, models: Object.keys(models).length };
  renderAttribReport();
  if (verbose) notify(fixed ? '🧬 ' + fixed + ' attribution(s) corrigée(s) automatiquement' : '🧬 Attributions cohérentes : ' + Object.keys(expert).length + ' fiches vérifiées');
  return fixed;
}
function renderAttribReport() {
  const c = el('attrib-box'); if (!c || !window.attribReport) return;
  c.innerHTML = '<p style="font-size:12px;color:#94a3b8">🧬 Fiches expert vérifiées : ' + window.attribReport.experts + ' • Modèles : ' + window.attribReport.models + ' • Attributions corrigées : ' + window.attribReport.fixed + '</p>';
}
window.addEventListener('DOMContentLoaded', () => {
  const ta = el('tab-access');
  if (ta && el('selftest-box')) {
    const d = document.createElement('div');
    d.innerHTML = '<button class="btn btn-secondary" onclick="attributionAudit(true)">🧬 Auto-vérification attributions pannes/modèles</button><div id="attrib-box"></div>';
    ta.insertBefore(d, el('selftest-box'));
  }
});
(function () {
  const _ea = window.enterApp;
  window.enterApp = async function () { const r = await _ea.apply(this, arguments); try { await attributionAudit(false); } catch (e) {} return r; };
})();
