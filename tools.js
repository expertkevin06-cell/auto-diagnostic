/* TOOLS.JS v1 — Restauration export JSON + historique diagnostics + rapport PDF */
(function () {
  function inj() {
    const st = document.createElement('style');
    st.textContent = '@media print{body *{visibility:hidden}#print-report,#print-report *{visibility:visible}#print-report{position:absolute;left:0;top:0;width:100%;background:#fff;color:#000;padding:24px;font-family:Arial,sans-serif}#print-report h1{font-size:20px}#print-report h2{font-size:15px;margin:14px 0 6px}#print-report .issue-card,#print-report .dtc-card{background:#fff;color:#000;border:1px solid #bbb;border-left:4px solid #333;margin:6px 0;padding:8px}#print-report .issue-card p,#print-report .dtc-card p{color:#000}#print-report .src{background:#eee;color:#000}#print-report a{color:#000}}';
    document.head.appendChild(st);
    const td = document.getElementById('tab-data');
    if (td) {
      const d = document.createElement('div');
      d.innerHTML = '<h3>📥 RESTAURER / FUSIONNER UN EXPORT JSON</h3><p style="font-size:12px;color:#94a3b8">Réinjecte un fichier exporté (marques, modèles, motorisations, pannes, rappels, DTC) sans doublons.</p><input type="file" id="restore-file" accept=".json,application/json"><button class="btn btn-success" onclick="restoreJSON()">📥 Restaurer / fusionner</button>';
      td.appendChild(d);
    }
    const app = document.querySelector('#screen-app .card');
    if (app) {
      const d = document.createElement('div');
      d.innerHTML = '<h3>🧰 Outils professionnels</h3><button class="btn btn-secondary" onclick="toggleHistory()">🕘 Historique des diagnostics</button><div id="hist-box" class="hidden"></div><button class="btn btn-admin" onclick="printReport()">🖨️ Rapport PDF du diagnostic</button>';
      app.insertBefore(d, app.lastElementChild);
    }
    const pr = document.createElement('div');
    pr.id = 'print-report';
    document.body.appendChild(pr);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inj); else inj();
})();

/* ===== Historique local des diagnostics ===== */
function getHist() { try { return JSON.parse(localStorage.getItem('autodiag_hist') || '[]'); } catch (e) { return []; } }
function logHistory(e) {
  const h = getHist(); const last = h[0];
  if (last && last.marque === e.marque && last.modele === e.modele && last.motorisation === e.motorisation) return;
  h.unshift(e);
  localStorage.setItem('autodiag_hist', JSON.stringify(h.slice(0, 50)));
}
function toggleHistory() {
  const box = el('hist-box'); if (!box) return;
  box.classList.toggle('hidden');
  if (box.classList.contains('hidden')) return;
  const h = getHist();
  box.innerHTML = h.length
    ? '<h3>🕘 Derniers diagnostics (50 max)</h3>' + h.map(x => '<p style="font-size:12px">📅 ' + new Date(x.date).toLocaleString('fr-FR') + ' — <strong>' + esc(x.marque) + ' ' + esc(x.modele) + '</strong> ' + esc(x.motorisation || '') + '</p>').join('') + '<button class="btn btn-danger btn-sm" onclick="clearHistory()">🗑️ Effacer</button>'
    : '<p style="color:#94a3b8">Aucun historique.</p>';
}
function clearHistory() { localStorage.removeItem('autodiag_hist'); const box = el('hist-box'); if (box) box.innerHTML = '<p style="color:#94a3b8">Aucun historique.</p>'; }
/* Enregistrement automatique à chaque corrélation véhicule */
(function () {
  const oc = window.correlate;
  window.correlate = async function () {
    const r = await oc.apply(this, arguments);
    try {
      const b = brandsData[curBrand] ? brandsData[curBrand].name : (curBrand || '');
      const mi = val('sel-motor');
      const mo = (mi !== '' && motorsCache[mi]) ? motorsCache[mi].name : '';
      if (b || curModelName) logHistory({ date: new Date().toISOString(), marque: b, modele: curModelName || '', motorisation: mo });
    } catch (e) {}
    return r;
  };
})();

/* ===== Rapport PDF (impression) ===== */
function printReport() {
  const b = brandsData[curBrand] ? brandsData[curBrand].name : (curBrand || '');
  const mi = val('sel-motor');
  const motor = (mi !== '' && motorsCache[mi]) ? motorsCache[mi] : null;
  const pr = el('print-report');
  pr.innerHTML =
    '<h1>🚗 Auto Diagnostic Pro — Rapport de diagnostic</h1>' +
    '<p>Date : ' + new Date().toLocaleString('fr-FR') + ' • Appareil : ' + esc(deviceId()) + '</p>' +
    '<p>Véhicule : <strong>' + esc(b) + ' ' + esc(curModelName || '') + '</strong></p>' +
    '<p>Motorisation : <strong>' + esc(motor ? motor.name + ' • ' + (FUELS[motor.fuel] || motor.fuel) + ' • ' + (motor.power || '') : 'non sélectionnée') + '</strong></p>' +
    '<h2>⚠️ Pannes connues & campagnes de rappel</h2>' + (el('issues-box') ? el('issues-box').innerHTML : '') +
    '<h2>🧠 Fiches expert ingénieur</h2>' + (el('expert-box') ? el('expert-box').innerHTML : '') +
    '<h2>🔧 Codes défaut DTC corrélés</h2>' + (el('dtc-box') ? el('dtc-box').innerHTML : '') +
    '<p style="margin-top:16px;font-size:11px">Rapport généré par Auto Diagnostic Pro — sources : Rappel Conso, Safety Gate, NHTSA, constructeurs, presse spécialisée.</p>';
  window.print();
}

/* ===== Restauration / fusion d'un export JSON (admin) ===== */
async function restoreJSON() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') { notify('❌ Réservé admin', 'error'); return; }
  const f = el('restore-file');
  if (!f || !f.files || !f.files[0]) return notify('Choisissez un fichier JSON', 'error');
  notify('📥 Restauration en cours…');
  try {
    const data = JSON.parse(await f.files[0].text());
    let n = 0;
    const brands = data.marques || data.brands || {};
    for (const [k, v] of Object.entries(brands)) { if (!(await db.ref('data/brands/' + k).once('value')).exists()) { await db.ref('data/brands/' + k).set(v); n++; } }
    const models = data.modeles || data.models || {};
    const existing = await dbGet('data/models');
    const byName = {}; Object.values(existing).forEach(m => byName[m.brandId + '|' + String(m.name).toLowerCase()] = 1);
    const idMap = {};
    for (const [k, m] of Object.entries(models)) {
      const key = m.brandId + '|' + String(m.name).toLowerCase();
      if (byName[key]) { idMap[k] = Object.keys(existing).find(id => existing[id].brandId === m.brandId && String(existing[id].name).toLowerCase() === String(m.name).toLowerCase()); continue; }
      const nid = 'r_' + k;
      await db.ref('data/models/' + nid).set(m);
      byName[key] = 1; idMap[k] = nid; n++;
    }
    const motors = data.motorisations || data.motors || {};
    for (const [k, list] of Object.entries(motors)) {
      const nid = idMap[k]; if (!nid || !Array.isArray(list)) continue;
      const ref = db.ref('data/motors/' + nid);
      const cur = (await ref.once('value')).val() || [];
      const names = {}; cur.forEach(x => names[String(x.name).toLowerCase()] = 1);
      let ch = false;
      list.forEach(x => { if (!names[String(x.name).toLowerCase()]) { cur.push(x); ch = true; } });
      if (ch) { await ref.set(cur); n++; }
    }
    const iss = data.pannes || data.issues || {};
    const curI = await dbGet('data/issues'); const tI = {}; Object.values(curI).forEach(x => tI[String(x.title).toLowerCase()] = 1);
    for (const [k, v] of Object.entries(iss)) { if (tI[String(v.title).toLowerCase()]) continue; await db.ref('data/issues/' + uid('rst')).set(v); n++; }
    const exp = data.campagnesRappels || data.expert || {};
    const curE = await dbGet('data/expert'); const tE = {}; Object.values(curE).forEach(x => tE[String(x.title).toLowerCase()] = 1);
    for (const [k, v] of Object.entries(exp)) { if (tE[String(v.title).toLowerCase()]) continue; await db.ref('data/expert/' + uid('rst')).set(v); n++; }
    const dtc = data.dtc || {};
    for (const [k, v] of Object.entries(dtc)) { if (!(await db.ref('data/dtc/' + k).once('value')).exists()) { await db.ref('data/dtc/' + k).set(v); n++; } }
    notify('✅ Restauration/fusion terminée : ' + n + ' éléments ajoutés');
  } catch (e) { notify('❌ Fichier invalide : ' + e.message, 'error'); }
}
