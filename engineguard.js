/* ENGINEGUARD.JS v1 — Garde-moteurs par marque : corrige les jetons étrangers (ex: TDI sur Peugeot -> BlueHDi) */
const EG_GROUPS = {
  psa: ['peugeot','citroen','ds','opel'],
  renault: ['renault','dacia','alpine'],
  vag: ['volkswagen','audi','skoda','seat','cupra','man'],
  bmw: ['bmw','mini'],
  merc: ['mercedes'],
  ford: ['ford'],
  fiat: ['fiat','jeep','alfa'],
  jp: ['toyota','lexus','honda','nissan','mazda','mitsubishi','subaru','suzuki'],
  kr: ['hyundai','kia'],
  cn: ['byd','mg','omoda','jaecoo','leapmotor','ora','xpeng','aiways','seres','nio','lynkco'],
  us: ['tesla','chevrolet','dodge','cadillac','gmc'],
  uk: ['landrover','jaguar'],
  it: ['ferrari','maserati','lancia'],
  prem: ['porsche','bugatti'],
  se: ['volvo','polestar']
};
/* Jetons connus -> carburant */
const EG_TOKEN_FUEL = {
  'bluehdi':'diesel','hdi':'diesel','cdti':'diesel','tdi':'diesel','etdi':'diesel','dci':'diesel','blue dci':'diesel','multijet':'diesel','jtd':'diesel','ecoblue':'diesel','crdi':'diesel','d-4d':'diesel','skyactiv-d':'diesel','ingenium d':'diesel','bluetec':'diesel',
  'puretech':'essence','hni':'essence','thp':'essence','tce':'essence','sce':'essence','tsi':'essence','tfsi':'essence','etsi':'essence','ecoboost':'essence','gdi':'essence','vtec':'essence','skyactiv-g':'essence','ingenium p':'essence','t-gdi':'essence','tgdi':'essence',
  'e-tech hybrid':'hybride','ehybrid':'hybride','gte':'hybride','iv':'hybride','phev':'hybride','hybrid':'hybride','tgi':'hybride','dm-i':'hybride','erev':'hybride',
  'e-tron':'electrique','id.':'electrique','ev':'electrique','electrique':'electrique','e-':'electrique','ë-':'electrique','eq':'electrique','ix':'electrique','i3':'electrique','i4':'electrique','i5':'electrique','i7':'electrique','i8':'electrique',' Folgore':'electrique','e-208':'electrique','zoe':'electrique','leaf':'electrique','kona':'electrique','ioniq':'electrique','taycan':'electrique','macan':'electrique'
};
/* Jetons natifs autorisés par groupe */
const EG_NATIVE = {
  psa: ['puretech','hni','thp','bluehdi','hdi','cdti','hybrid','phev','e-','ë-','electrique'],
  renault: ['tce','sce','dci','blue dci','e-tech','hybrid','electrique'],
  vag: ['tsi','tfsi','etsi','tdi','etdi','ehybrid','gte','iv','phev','tgi','e-tron','id.','electrique','vz','rs'],
  bmw: ['tsi','tfsi','d','e','i','m','electrique','ix','i3','i4','i5','i7','i8'],
  merc: ['d','e','eq','bluetec','electrique','mbux'],
  ford: ['ecoboost','ecoblue','hybrid','phev','electrique','gen-e'],
  fiat: ['multijet','jtd','t-jet','hybrid','electrique'],
  jp: ['hybrid','phev','d-4d','skyactiv','vtec','electrique','e-power'],
  kr: ['t-gdi','tgdi','crdi','hybrid','phev','ev','electrique','ioniq','kona'],
  cn: ['dm-i','phev','ev','electrique','erev'],
  us: ['electrique','ev'],
  uk: ['ingenium','phev','hybrid','electrique'],
  it: ['v6','v8','v12','gdi','hybrid','electrique','folgore'],
  prem: ['v8','v12','w16','hybrid','electrique'],
  se: ['hybrid','phev','electrique','bms']
};
/* Jeton canonique de remplacement par groupe et carburant */
const EG_CANON = {
  psa: { diesel:'BlueHDi', essence:'PureTech', hybride:'Hybrid', electrique:'e-' },
  renault: { diesel:'Blue dCi', essence:'TCe', hybride:'E-Tech', electrique:'E-Tech' },
  vag: { diesel:'TDI', essence:'TSI', hybride:'eHybrid', electrique:'e-tron' },
  bmw: { diesel:'d', essence:'', hybride:'e', electrique:'i' },
  merc: { diesel:' d', essence:'', hybride:'e', electrique:'EQ' },
  ford: { diesel:'EcoBlue', essence:'EcoBoost', hybride:'Hybrid', electrique:'Electrique' },
  fiat: { diesel:'MultiJet', essence:'T-Jet', hybride:'Hybrid', electrique:'Electrique' },
  jp: { diesel:'D-4D', essence:'', hybride:'Hybrid', electrique:'Electrique' },
  kr: { diesel:'CRDi', essence:'T-GDI', hybride:'Hybrid', electrique:'EV' },
  cn: { diesel:'', essence:'', hybride:'DM-i', electrique:'Electrique' },
  us: { diesel:'', essence:'', hybride:'', electrique:'Electrique' },
  uk: { diesel:'Ingenium D', essence:'Ingenium P', hybride:'PHEV', electrique:'Electrique' },
  it: { diesel:'', essence:'', hybride:'Hybrid', electrique:'Folgore' },
  prem: { diesel:'', essence:'', hybride:'Hybrid', electrique:'Electrique' },
  se: { diesel:'', essence:'', hybride:'Hybrid', electrique:'Electrique' }
};
function egGroup(brandId) {
  for (const [g, list] of Object.entries(EG_GROUPS)) if (list.includes(brandId)) return g;
  return null;
}
function egFindTokens(name) {
  const n = ' ' + String(name).toLowerCase() + ' ';
  const hits = [];
  for (const [tok, fuel] of Object.entries(EG_TOKEN_FUEL)) {
    const t = ' ' + tok + ' ';
    if (n.includes(t) || n.includes(tok)) hits.push({ tok: tok.trim(), fuel: fuel });
  }
  /* tri par longueur décroissante pour remplacer d'abord les plus spécifiques */
  hits.sort((a, b) => b.tok.length - a.tok.length);
  return hits;
}
function egCorrectMotor(brandId, motor) {
  const g = egGroup(brandId);
  if (!g) return { changed: false, motor: motor };
  const native = EG_NATIVE[g] || [];
  const name0 = String(motor.name || '');
  let name = name0, changed = false;
  const tokens = egFindTokens(name0);
  for (const h of tokens) {
    const isNative = native.some(nt => h.tok.toLowerCase().includes(nt) || nt.includes(h.tok.toLowerCase()));
    if (isNative) continue;
    const canon = (EG_CANON[g] && EG_CANON[g][h.fuel]) || '';
    if (!canon) continue;
    /* remplace le jeton étranger par le canonique (insensible à la casse, 1re occurrence) */
    const re = new RegExp(h.tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (re.test(name)) { name = name.replace(re, canon); changed = true; }
  }
  /* recalcul du carburant depuis le nom corrigé */
  let fuel = motor.fuel;
  const tk = egFindTokens(name);
  if (tk.length) fuel = tk[0].fuel;
  else if (!fuel || !['essence','diesel','hybride','electrique'].includes(fuel)) fuel = (typeof guessFuel === 'function') ? guessFuel(name) : fuel;
  if (fuel !== motor.fuel) changed = true;
  if (name !== name0) changed = true;
  return { changed: changed, motor: Object.assign({}, motor, { name: name, fuel: fuel }) };
}
async function engineAudit(verbose) {
  const models = await dbGet('data/models');
  const motors = await dbGet('data/motors');
  let fixed = 0, checked = 0;
  for (const [mid, m] of Object.entries(models)) {
    const list = motors[mid];
    if (!Array.isArray(list)) continue;
    let ch = false;
    const next = list.map(mo => {
      checked++;
      const r = egCorrectMotor(m.brandId, mo);
      if (r.changed) { ch = true; return r.motor; }
      return mo;
    });
    if (ch) { await db.ref('data/motors/' + mid).set(next); fixed++; }
  }
  window.engineReport = { fixed: fixed, checked: checked };
  renderEngineReport();
  if (verbose) notify(fixed ? '🛡️ Garde-moteurs : ' + fixed + ' modèle(s) corrigé(s) (' + checked + ' motorisations vérifiées)' : '🛡️ Garde-moteurs : aucune incohérence (' + checked + ' vérifiées)');
  return fixed;
}
function renderEngineReport() {
  const c = el('engine-box'); if (!c || !window.engineReport) return;
  c.innerHTML = '<p style="font-size:12px;color:#94a3b8">🛡️ Motorisations vérifiées : ' + window.engineReport.checked + ' • Corrections : ' + window.engineReport.fixed + '</p>';
}
/* Injection bouton admin */
window.addEventListener('DOMContentLoaded', () => {
  const ta = el('tab-access');
  if (ta && el('selftest-box')) {
    const d = document.createElement('div');
    d.innerHTML = '<button class="btn btn-admin" onclick="engineAudit(true)">🛡️ Audit & correction motorisations</button><div id="engine-box"></div>';
    ta.insertBefore(d, el('selftest-box'));
  }
});
/* Enchaînement : ensureCatalog -> attributionAudit -> engineAudit */
(function () {
  const _ec = window.ensureCatalog;
  window.ensureCatalog = async function () {
    const r = await _ec.apply(this, arguments);
    try { await attributionAudit(false); } catch (e) {}
    try { await engineAudit(false); } catch (e) {}
    return r;
  };
  /* MAJ manuelle : ajoute l'audit moteur */
  const _mu = window.manualUpdate;
  if (_mu) window.manualUpdate = async function () {
    const r = await _mu.apply(this, arguments);
    try { await engineAudit(true); } catch (e) {}
    return r;
  };
})();
