/* EXPORT.JS v1 — Export JSON complet : marques, modèles, motorisations, pannes, rappels, expert, DTC */
async function buildExport() {
  const brands = await dbGet('data/brands');
  const models = await dbGet('data/models');
  const motors = await dbGet('data/motors');
  const issues = await dbGet('data/issues');
  const expert = await dbGet('data/expert');
  const dtc = await dbGet('data/dtc');
  const version = await dbGet('data/version');
  return {
    app: 'Auto Diagnostic Pro',
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      marques: Object.keys(brands).length,
      modeles: Object.keys(models).length,
      motorisations: Object.keys(motors).length,
      pannes: Object.keys(issues).length,
      fichesExpert: Object.keys(expert).length,
      dtc: Object.keys(dtc).length
    },
    marques: brands,
    modeles: models,
    motorisations: motors,
    pannes: issues,
    campagnesRappels: expert,
    dtc: dtc,
    versionBase: version
  };
}
async function exportJSON() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') { notify('❌ Réservé admin', 'error'); return; }
  notify('📤 Export en cours…');
  try {
    const payload = await buildExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const d = new Date();
    const name = 'autodiagnostic-export-' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '.json';
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    notify('✅ ' + name + ' téléchargé (' + payload.counts.modeles + ' modèles, ' + (payload.counts.pannes + payload.counts.fichesExpert) + ' pannes/rappels)');
  } catch (e) { notify('❌ Échec export : ' + e.message, 'error'); }
}
async function copyJSON() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') { notify('❌ Réservé admin', 'error'); return; }
  try {
    const payload = await buildExport();
    const txt = JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(txt);
    notify('📋 JSON copié (' + txt.length + ' caractères)');
  } catch (e) { notify('❌ Échec copie', 'error'); }
}
