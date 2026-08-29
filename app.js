const APP = { currentUser: null, currentRegion: 'ALL', deferredPrompt: null, ADMIN_PASSWORD: "Kevin83600" };

function normalizeStr(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function showToast(m,t){t=t||'info';const c=document.getElementById('toastContainer');if(!c)return;const d=document.createElement('div');d.className='toast '+t;d.textContent=m;c.appendChild(d);setTimeout(()=>d.remove(),4000);}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));const e=document.getElementById(id);if(e)e.classList.add('active');}
function on(id,e,f){const el=document.getElementById(id);if(el)el.addEventListener(e,f);return el;}
function sevClass(s){return s==='Élevée'?'high':(s==='Moyenne'?'medium':'low');}
function srcName(s){const m={NHTSA:'NHTSA',SAFETY_GATE:'Safety Gate',RAPPEL_CONSO:'Rappel Conso',SPECIALISTES:'Spécialistes'};return m[s]||s;}
function srcClass(s){const m={NHTSA:'nhtsa',SAFETY_GATE:'safetygate',RAPPEL_CONSO:'rappelconso',SPECIALISTES:'specialistes'};return m[s]||'specialistes';}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}

document.addEventListener('DOMContentLoaded', async () => {
  try { await DB.init(); await VEHICLES_DB.init(); await DTC_DB.init(); await RECALLS_DB.init(); }
  catch (e) { showToast('Erreur init: ' + e.message, 'error'); }
  try { await checkAutoUpdates(); } catch (e) {}
  await checkUserStatus();
  await applyCustomBackground();
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); APP.deferredPrompt = e; const b = document.getElementById('btnInstallPWA'); if (b) b.classList.remove('hidden'); });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (ev) => { if (ev.data && ev.data.action === 'DB_UPDATE_REQUIRED') { try { await checkAutoUpdates(); } catch (e) {} } });
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  bindEvents();
  runSelfTest();
});

async function applyCustomBackground() {
  try {
    let saved = null;
    try { const m = await DB.get('meta', 'customBgImage'); saved = m ? m.value : null; } catch (e) {}
    if (!saved) saved = localStorage.getItem('customBgImage');
    if (saved) { document.body.style.setProperty('--custom-bg-image', 'url(' + saved + ')'); document.body.classList.add('custom-bg'); }
  } catch (e) {}
}

async function checkAutoUpdates() {
  const v = await VEHICLES_DB.checkAndUpdate();
  const r = await RECALLS_DB.checkAndUpdate();
  const el = document.getElementById('lastUpdateText');
  if (v || r) { localStorage.setItem('lastDbUpdate', Date.now().toString()); if (el) el.textContent = 'Dernière MAJ: ' + new Date().toLocaleDateString('fr-FR'); }
  else { const l = localStorage.getItem('lastDbUpdate'); if (l && el) el.textContent = 'Dernière MAJ: ' + new Date(parseInt(l)).toLocaleDateString('fr-FR'); }
}

// ===== AUTOCONTRÔLE 12 POINTS =====
async function runSelfTest() {
  const out = [];
  const ok = (c, m) => out.push((c ? '✅ ' : '❌ ') + m);
  try {
    ok((await VEHICLES_DB.getBrands('FRANCE')).includes('Peugeot'), '1 France: Peugeot');
    const eu = await VEHICLES_DB.getBrands('EUROPE');
    ok(eu.includes('Dacia') && eu.includes('Skoda'), '2 Europe: Dacia+Skoda');
    ok((await VEHICLES_DB.getBrands('AUTRES')).includes('Jaecoo'), '3 Autres: Jaecoo');
    const j7 = await VEHICLES_DB.getEngines('AUTRES', 'Jaecoo', 'J7');
    ok(j7.length > 0 && j7.every(e => e.fuelType === 'Hybride' || e.fuelType === 'Electrique'), '4 Jaecoo 100% électrifié');
    const d = { engineCode: '1.5 BlueHDi 130', fuelType: 'Diesel', power: '130ch' };
    const rd = RECALLS_DB.getIssuesForVehicle('Peugeot', '3008', 2020, d);
    ok(rd.some(i => /8 mm/.test(i.title)), '5 3008 BlueHDi: chaîne 8 mm');
    ok(rd.some(i => (i.dtc || []).includes('P20EE')), '6 3008 BlueHDi: P20EE');
    ok(!rd.some(i => /PureTech/.test(i.title)), '7 3008 BlueHDi: sans PureTech');
    const p = { engineCode: '1.2 PureTech 130', fuelType: 'Essence', power: '130ch' };
    ok(RECALLS_DB.getIssuesForVehicle('Peugeot', '3008', 2020, p).some(i => /Courroie/.test(i.title)), '8 3008 PureTech: courroie');
    const ev = { engineCode: 'e-208', fuelType: 'Electrique', power: '136ch' };
    ok(RECALLS_DB.getIssuesForVehicle('Peugeot', '208', 2021, ev).some(i => /régénératif/.test(i.title)), '9 e-208: régénération');
    ok(rd.every(i => (i.dtc || i.dtcRelated || []).length > 0), '10 DTC liés partout');
    ok(!!(await DTC_DB.getByCode('P20EE')), '11 Base DTC: P20EE');
    ok(!!(await DTC_DB.getByCode('P200E')), '12 Base DTC: P200E');
  } catch (e) { ok(false, 'Erreur test: ' + e.message); }
  const n = out.filter(l => l.indexOf('✅') === 0).length;
  console.log('─── AUTOCONTRÔLE ───'); out.forEach(l => console.log(l));
  window.APP_SELFTEST = out;
  showToast('🩺 Autocontrôle ' + n + '/' + out.length + ' OK', n === out.length ? 'success' : 'error');
}

async function checkUserStatus() {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      const u = JSON.parse(saved);
      const dbU = await DB.get('users', u.id);
      if (dbU && dbU.status === 'approved') { dbU.lastAccess = Date.now(); await DB.update('users', dbU); APP.currentUser = dbU; enterMainApp(); return; }
      if (dbU && dbU.status === 'pending') { showPending(); return; }
      if (dbU) { localStorage.removeItem('currentUser'); showDenied(dbU.status); return; }
    } catch (e) {}
  }
  showScreen('accessScreen');
}
function showPending(){showScreen('accessScreen');const b=document.getElementById('accessStatus');if(b){b.classList.remove('hidden');b.className='status-box pending';b.innerHTML='⏳ Demande en attente de validation.';}}
function showDenied(s){showScreen('accessScreen');const b=document.getElementById('accessStatus');if(b){b.classList.remove('hidden');b.className='status-box denied';b.innerHTML=s==='revoked'?'🚫 Accès révoqué.':'❌ Demande refusée.';}}
function enterMainApp(){showScreen('mainScreen');const w=document.getElementById('userWelcome');if(w&&APP.currentUser)w.textContent='👤 '+APP.currentUser.firstName;loadVehiclesTab();}

function bindEvents() {
  on('accessForm','submit',async(e)=>{e.preventDefault();const f=document.getElementById('firstName');const n=f?f.value.trim():'';if(n.length<2){showToast('Prénom trop court','error');return;}
    const ex=await DB.query('users',u=>u.firstName.toLowerCase()===n.toLowerCase());
    if(ex.length){const u=ex[0];if(u.status==='approved'){APP.currentUser=u;localStorage.setItem('currentUser',JSON.stringify(u));enterMainApp();}else if(u.status==='pending')showPending();else showDenied(u.status);return;}
    const id=await DB.add('users',{firstName:n,status:'pending',requestDate:Date.now(),lastAccess:null});
    try{await DB.add('accessRequests',{userId:id,firstName:n,requestDate:Date.now(),status:'pending'});}catch(e){}
    showPending();showToast('📨 Demande envoyée','success');});
  on('btnBackFromAdmin','click',()=>showScreen('accessScreen'));
  on('adminLoginForm','submit',(e)=>{e.preventDefault();const p=document.getElementById('adminPassword');const pass=p?p.value:'';const st=localStorage.getItem('ADMIN_PASSWORD')||APP.ADMIN_PASSWORD;
    if(pass===st){sessionStorage.setItem('adminLogged','true');window.location.href='admin.html';}else{const er=document.getElementById('adminLoginError');if(er){er.classList.remove('hidden');er.textContent='❌ Mot de passe incorrect';}}});
  on('btnInstallPWA','click',async()=>{if(APP.deferredPrompt){APP.deferredPrompt.prompt();const c=await APP.deferredPrompt.userChoice;if(c.outcome==='accepted')showToast('✅ Installée','success');APP.deferredPrompt=null;}});
  on('btnLogout','click',()=>{localStorage.removeItem('currentUser');APP.currentUser=null;showScreen('accessScreen');});
  document.querySelectorAll('.tab').forEach(t=>{t.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));t.classList.add('active');const c=document.getElementById('tab'+capitalize(t.dataset.tab));if(c)c.classList.add('active');});});
  on('btnValidateSearch','click',()=>performGlobalSearch());
  on('globalSearch','keypress',(e)=>{if(e.key==='Enter')performGlobalSearch();});
  document.querySelectorAll('.region-btn[data-region]').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.region-btn[data-region]').forEach(x=>x.classList.remove('active'));b.classList.add('active');APP.currentRegion=b.dataset.region;loadVehiclesTab();});});
  on('btnDtcSearch','click',()=>searchDTC()); on('dtcSearch','keypress',(e)=>{if(e.key==='Enter')searchDTC();});
  document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');filterDTC(b.dataset.category);});});
  on('btnRecallSearch','click',()=>searchRecalls()); on('recallSearch','keypress',(e)=>{if(e.key==='Enter')searchRecalls();});
  document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');filterRecalls(b.dataset.severity);});});
  on('btnAiSearch','click',()=>performAISearch());
  on('btnAiClear','click',()=>{const q=document.getElementById('aiQuery');if(q)q.value='';const r=document.getElementById('aiResponseContainer');if(r)r.classList.add('hidden');const l=document.getElementById('aiLocalResults');if(l)l.innerHTML='';});
  on('modalClose','click',()=>{const m=document.getElementById('detailModal');if(m)m.classList.add('hidden');});
  const md=document.getElementById('detailModal');if(md)md.addEventListener('click',(e)=>{if(e.target===md)md.classList.add('hidden');});
}

async function loadVehiclesTab() {
  const c = document.getElementById('brandsContainer'); if (!c) return;
  c.innerHTML = '<div class="loading">Chargement...</div>';
  try {
    const s = await VEHICLES_DB.getStats();
    const sb = document.getElementById('statsBar');
    if (sb) sb.innerHTML = '<div class="stat-item"><div class="stat-value">'+s.FRANCE+'</div><div class="stat-label">🇫</div></div><div class="stat-item"><div class="stat-value">'+s.EUROPE+'</div><div class="stat-label">🇪🇺</div></div><div class="stat-item"><div class="stat-value">'+s.AUTRES+'</div><div class="stat-label">🌍</div></div>';
    const brands = await VEHICLES_DB.getBrands(APP.currentRegion);
    if (!brands.length) { c.innerHTML = '<div class="loading">Aucun véhicule. Admin → Forcer MAJ.</div>'; return; }
    c.innerHTML = '';
    for (const b of brands) {
      const meta = await VEHICLES_DB.getBrandMeta(APP.currentRegion, b);
      const models = await VEHICLES_DB.getModels(APP.currentRegion, b);
      const d = document.createElement('div'); d.className = 'drawer';
      d.innerHTML = '<div class="drawer-header"><div class="drawer-title"><span class="icon">'+(meta.flag||'🚗')+'</span><span>'+b+'</span><span style="font-size:11px;color:var(--text-muted)">('+meta.country+' • '+models.length+')</span></div><span class="drawer-arrow">▼</span></div><div class="drawer-content"><div class="drawer-inner"></div></div>';
      d.querySelector('.drawer-header').addEventListener('click', async () => { d.classList.toggle('open'); if (d.classList.contains('open')) { const mc = d.querySelector('.drawer-inner'); if (mc && !mc.children.length) await loadModels(mc, b); } });
      c.appendChild(d);
    }
  } catch (e) { c.innerHTML = '<div class="loading">❌ ' + e.message + '</div>'; }
}

async function loadModels(c, brand) {
  const models = await VEHICLES_DB.getModels(APP.currentRegion, brand);
  c.innerHTML = '';
  for (const m of models) {
    const s = document.createElement('div'); s.className = 'sub-drawer';
    s.innerHTML = '<div class="sub-drawer-header"><span>📌 '+m+'</span><span class="drawer-arrow">▼</span></div><div class="sub-drawer-content"><div class="sub-drawer-inner"></div></div>';
    s.querySelector('.sub-drawer-header').addEventListener('click', async () => { s.classList.toggle('open'); if (s.classList.contains('open')) { const ec = s.querySelector('.sub-drawer-inner'); if (ec && !ec.children.length) { const en = await VEHICLES_DB.getEngines(APP.currentRegion, brand, m); loadEngines(ec, brand, m, en); } } });
    c.appendChild(s);
  }
}

function loadEngines(c, brand, model, engines) {
  c.innerHTML = '';
  const by = {}; engines.forEach(e => { if (!by[e.year]) by[e.year] = []; by[e.year].push(e); });
  Object.keys(by).sort().forEach(y => {
    const l = document.createElement('div'); l.style.cssText = 'font-size:12px;color:var(--text-muted);margin:8px 0 4px;font-weight:600'; l.textContent = '📅 ' + y; c.appendChild(l);
    by[y].forEach(en => {
      const it = document.createElement('div'); it.className = 'engine-item';
      it.innerHTML = '<div><span class="fuel-badge '+en.fuelType.toLowerCase().replace(/\s/g,'')+'">'+en.fuelType+'</span><span style="margin-left:8px">'+en.engineCode+'</span></div><span class="engine-power">'+en.power+'</span>';
      it.addEventListener('click', () => showVehicleDetails(brand, model, en));
      c.appendChild(it);
    });
  });
}

// ===== FICHE CORRÉLÉE : spécifique modèle / famille moteur / général =====
async function showVehicleDetails(brand, model, engine) {
  const modal = document.getElementById('detailModal'), body = document.getElementById('modalBody');
  if (!modal || !body) return;
  body.innerHTML = '<div class="loading">Chargement...</div>'; modal.classList.remove('hidden');

  const all = RECALLS_DB.getIssuesForVehicle(brand, model, engine.year, engine);
  const spec = all.filter(i => i.id), fam = all.filter(i => i.fam), com = all.filter(i => i.com);

  const card = (i) => {
    const dtcs = i.dtc || i.dtcRelated || [];
    return '<div class="result-card" style="margin-bottom:10px">' +
      '<div class="dtc-list" style="margin-bottom:6px">' + dtcs.map(cd => '<span class="dtc-chip" data-code="'+cd+'">'+cd+'</span>').join('') + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px"><h3 style="font-size:14px">'+i.title+'</h3><span class="severity-badge '+sevClass(i.severity)+'">'+i.severity+'</span></div>' +
      '<span class="source-badge '+srcClass(i.source)+'">'+srcName(i.source)+'</span>' +
      (i.description ? '<p class="description" style="margin-top:6px">'+i.description+'</p>' : '') +
      '<p style="font-size:12px;color:var(--success);margin-top:6px">🔧 '+i.repair+'</p></div>';
  };

  let html = '<h2 style="margin-bottom:4px">'+brand+' '+model+'</h2>' +
    '<p style="color:var(--text-secondary);font-size:13px;margin-bottom:12px">'+engine.year+' • '+engine.fuelType+' • '+engine.power+' • '+engine.engineCode+'</p>';

  html += '<h3 style="color:var(--danger);margin:10px 0 8px">🔴 Spécifique '+brand+' '+model+' ('+spec.length+')</h3>';
  html += spec.length ? spec.map(card).join('') : '<p style="font-size:12px;color:var(--text-muted)">Aucun rappel spécifique.</p>';
  html += '<h3 style="color:var(--warning);margin:10px 0 8px">🟠 Famille moteur '+engine.engineCode+' ('+fam.length+')</h3>' + fam.map(card).join('');
  html += '<h3 style="color:var(--accent);margin:10px 0 8px">🔵 Contrôles généraux ('+com.length+')</h3>' + com.map(card).join('');

  body.innerHTML = html;
  body.querySelectorAll('.dtc-chip').forEach(ch => { ch.addEventListener('click', async () => { const d = await DTC_DB.getByCode(ch.dataset.code); if (d) showDTCModal(d); }); });
}

async function searchDTC() {
  const i = document.getElementById('dtcSearch'), q = i ? i.value.trim() : '', c = document.getElementById('dtcResults'); if (!c) return;
  if (!q) { c.innerHTML = '<div class="loading">Code DTC ?</div>'; return; }
  const ex = await DTC_DB.getByCode(q.toUpperCase()); if (ex) { showDTCModal(ex); return; }
  displayDTC(await DTC_DB.search(q));
}
async function filterDTC(cat) {
  const c = document.getElementById('dtcResults'); if (!c) return;
  displayDTC(cat === 'ALL' ? (await DB.getAll('dtcCodes')).slice(0, 20) : await DB.query('dtcCodes', d => (d.category || '').includes(cat)));
}
function displayDTC(r) {
  const c = document.getElementById('dtcResults'); if (!c) return;
  if (!r.length) { c.innerHTML = '<div class="loading">Aucun</div>'; return; }
  c.innerHTML = r.map(d => '<div class="result-card" style="cursor:pointer" data-code="'+d.code+'"><div style="display:flex;justify-content:space-between"><h3 style="font-family:monospace;color:var(--accent)">'+d.code+'</h3><span class="severity-badge '+sevClass(d.severity)+'">'+d.severity+'</span></div><p style="font-size:12px;color:var(--text-muted)">📂 '+d.category+' • '+d.system+'</p></div>').join('');
  c.querySelectorAll('.result-card').forEach(cd => { cd.addEventListener('click', async () => { const d = await DTC_DB.getByCode(cd.dataset.code); if (d) showDTCModal(d); }); });
}
async function showDTCModal(d) {
  const m = document.getElementById('detailModal'), b = document.getElementById('modalBody'); if (!m || !b) return;
  const rec = await RECALLS_DB.getByDTC(d.code);
  let h = '<h2 style="font-family:monospace;color:var(--accent)">'+d.code+'</h2><p style="margin:8px 0"><span class="severity-badge '+sevClass(d.severity)+'">'+d.severity+'</span> 📂 '+d.category+'</p><p><strong>'+d.system+'</strong></p><p style="margin-top:8px;font-size:13px">Marques: '+d.brands.join(', ')+'</p>';
  if (rec.length) { h += '<h3 style="margin:10px 0 6px">📋 Rappels liés</h3>'; rec.forEach(r => { h += '<div class="result-card"><strong>'+r.brand+' '+r.model+'</strong> — '+r.title+'</div>'; }); }
  b.innerHTML = h; m.classList.remove('hidden');
}

async function searchRecalls() {
  const i = document.getElementById('recallSearch'), q = i ? normalizeStr(i.value) : '', c = document.getElementById('recallResults'); if (!c) return;
  const all = await DB.getAll('recalls');
  displayRecalls(q ? all.filter(r => normalizeStr(r.brand).includes(q) || normalizeStr(r.model).includes(q) || normalizeStr(r.title).includes(q)) : all.slice(0, 20));
}
async function filterRecalls(s) {
  const c = document.getElementById('recallResults'); if (!c) return;
  displayRecalls(s === 'ALL' ? await DB.getAll('recalls') : await RECALLS_DB.getBySeverity(s));
}
function displayRecalls(r) {
  const c = document.getElementById('recallResults'); if (!c) return;
  if (!r.length) { c.innerHTML = '<div class="loading">Aucun</div>'; return; }
  c.innerHTML = r.map(x => '<div class="result-card"><div style="display:flex;justify-content:space-between"><h3>'+x.brand+' '+x.model+'</h3><span class="severity-badge '+sevClass(x.severity)+'">'+x.severity+'</span></div><p style="font-weight:600;margin:6px 0">'+x.title+'</p><div class="dtc-list">'+(x.dtc||x.dtcRelated||[]).map(cd=>'<span class="dtc-chip" data-code="'+cd+'">'+cd+'</span>').join('')+'</div></div>').join('');
  c.querySelectorAll('.dtc-chip').forEach(ch => { ch.addEventListener('click', async (e) => { e.stopPropagation(); const d = await DTC_DB.getByCode(ch.dataset.code); if (d) showDTCModal(d); }); });
}

async function performGlobalSearch() {
  const i = document.getElementById('globalSearch'), q = i ? i.value.trim() : ''; if (!q) return;
  const n = normalizeStr(q);
  const v = await VEHICLES_DB.search(n), d = await DTC_DB.search(n);
  const rc = (await DB.getAll('recalls')).filter(r => normalizeStr(r.brand).includes(n) || normalizeStr(r.model).includes(n) || normalizeStr(r.title).includes(n));
  showToast('🔎 ' + v.length + ' véh. • ' + d.length + ' DTC • ' + rc.length + ' rappels', 'info');
  if (d.length) { const t = document.querySelector('.tab[data-tab="dtc"]'); if (t) t.click(); displayDTC(d); }
  else if (rc.length) { const t = document.querySelector('.tab[data-tab="recalls"]'); if (t) t.click(); displayRecalls(rc); }
  else if (v.length) { const t = document.querySelector('.tab[data-tab="vehicles"]'); if (t) t.click(); showToast('Ouvrez ' + v[0].brand + ' → ' + v[0].model, 'success'); }
  else { const t = document.querySelector('.tab[data-tab="ai"]'); if (t) t.click(); const a = document.getElementById('aiQuery'); if (a) a.value = q; }
}

async function performAISearch() {
  const q = document.getElementById('aiQuery'); const query = q ? q.value.trim() : ''; if (!query) { showToast('Question ?','warning'); return; }
  const rt = document.getElementById('aiResponseText'), rs = document.getElementById('aiResponseSource'), rc = document.getElementById('aiResponseContainer');
  if (rt) rt.textContent = '🔄 Recherche...'; if (rc) rc.classList.remove('hidden');
  if (typeof AI_SEARCH === 'undefined') { if (rt) rt.textContent = '❌ ai-search.js non chargé.'; return; }
  const res = await AI_SEARCH.combinedSearch(query);
  if (res.type === 'gemini' || res.type === 'free_ai') { if (rt) rt.textContent = res.response; if (rs) rs.textContent = 'Source: ' + res.source; }
  else if (res.type === 'local') { if (rt) rt.textContent = '📋 Résultats locaux: ' + res.results.dtcCodes.length + ' DTC, ' + res.results.recalls.length + ' rappels.'; }
  else { if (rt) rt.textContent = res.message || 'Aucun résultat.'; }
}
