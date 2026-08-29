const APP = { currentUser: null, currentRegion: 'ALL', deferredPrompt: null, ADMIN_PASSWORD: "Kevin83600" };

function normalizeStr(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function showToast(m,t){t=t||'info';const c=document.getElementById('toastContainer');if(!c)return;const d=document.createElement('div');d.className='toast '+t;d.textContent=m;c.appendChild(d);setTimeout(()=>d.remove(),4000);}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));const e=document.getElementById(id);if(e)e.classList.add('active');}
function on(id,e,f){const el=document.getElementById(id);if(el)el.addEventListener(e,f);return el;}
function sevClass(s){return s==='Élevée'?'high':(s==='Moyenne'?'medium':'low');}
function srcName(s){const m={NHTSA:'NHTSA',SAFETY_GATE:'Safety Gate',RAPPEL_CONSO:'Rappel Conso',SPECIALISTES:'Spécialistes'};return m[s]||s;}
function srcClass(s){const m={NHTSA:'nhtsa',SAFETY_GATE:'safetygate',RAPPEL_CONSO:'rappelconso',SPECIALISTES:'specialistes'};return m[s]||'specialistes';}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}

// ===== CSS injecté : fiche visible + tiroirs sans coupe + fond lumineux =====
function injectUICSS(){ if(document.getElementById('uicss'))return;
  const st=document.createElement('style');st.id='uicss';
  st.textContent='.modal{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:3000;padding:16px;}.modal.hidden{display:none!important;}.modal-content{background:#273449;border-radius:12px;padding:20px;max-width:560px;width:100%;max-height:85vh;overflow-y:auto;position:relative;border:1px solid #334155;}.modal-close{position:absolute;top:10px;right:10px;background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;}.drawer.open .drawer-content{max-height:none!important;}body.custom-bg::before{background:rgba(15,23,42,.45)!important;}';
  document.head.appendChild(st);}

function ensureDOM(){
  injectUICSS();
  if(!document.getElementById('toastContainer')){const t=document.createElement('div');t.id='toastContainer';t.className='toast-container';document.body.appendChild(t);}
  if(!document.getElementById('detailModal')){
    const m=document.createElement('div');m.id='detailModal';m.className='modal hidden';
    m.innerHTML='<div class="modal-content"><button class="modal-close" id="modalClose">✕</button><div id="modalBody"></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click',(e)=>{if(e.target===m)m.classList.add('hidden');});
    m.querySelector('#modalClose').addEventListener('click',()=>m.classList.add('hidden'));
  } else { on('modalClose','click',()=>{document.getElementById('detailModal').classList.add('hidden');});
    const md=document.getElementById('detailModal'); if(md)md.addEventListener('click',(e)=>{if(e.target===md)md.classList.add('hidden');}); }
}

function injectBgCSS(){ if(document.getElementById('bgcss'))return;
  const st=document.createElement('style');st.id='bgcss';
  st.textContent='body.custom-bg{background-size:cover;background-position:center;background-attachment:scroll;}';
  document.head.appendChild(st);}
async function applyCustomBackground(){
  try{
    let saved=null;
    try{const m=await DB.get('meta','customBgImage');saved=m?m.value:null;}catch(e){}
    if(!saved)saved=localStorage.getItem('customBgImage');
    if(saved){ injectBgCSS();
      document.body.style.backgroundImage='url('+saved+')';
      document.body.style.backgroundSize='cover';
      document.body.style.backgroundPosition='center';
      document.body.style.backgroundAttachment='scroll';
      document.body.classList.add('custom-bg'); }
  }catch(e){}
}

document.addEventListener('DOMContentLoaded', async () => {
  ensureDOM();
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

async function checkAutoUpdates() {
  const v = await VEHICLES_DB.checkAndUpdate(); const r = await RECALLS_DB.checkAndUpdate();
  const el = document.getElementById('lastUpdateText');
  if (v || r) { localStorage.setItem('lastDbUpdate', Date.now().toString()); if (el) el.textContent = 'Dernière MAJ: ' + new Date().toLocaleDateString('fr-FR'); }
  else { const l = localStorage.getItem('lastDbUpdate'); if (l && el) el.textContent = 'Dernière MAJ: ' + new Date(parseInt(l)).toLocaleDateString('fr-FR'); }
}

function FI(engine){const out=[];const code=((engine.engineCode||'')+' '+(engine.power||''));const t=engine.fuelType||'';
  const P=(title,sev,dtc,rep,src,desc)=>out.push({title,severity:sev,dtc,dtcRelated:dtc,repair:rep,repairAction:rep,source:src,description:desc,fam:true});
  if(/PureTech/i.test(code)){P("Courroie distribution immergée PureTech","Élevée",["P0016","P0340","P0335"],"Kit distribution + crépine","RAPPEL_CONSO","Usure courroie.");P("GPF encrassé","Élevée",["P2002","P242F","P2453","P2463","P200E"],"Nettoyage GPF + MAJ","SPECIALISTES","Voyant.");P("Turbo fuite huile","Moyenne",["P0299","P2262","P0234"],"Turbo + durites","SPECIALISTES","Perte puissance.");}
  if(/BlueHDi|HDi/i.test(code)){P("Chaîne 7 mm usée → chaîne 8 mm","Élevée",["P0016","P0340","P0335"],"Chaîne 8 mm renforcée + tendeur","RAPPEL_CONSO","Risque casse.");P("FAP / température (P200E)","Élevée",["P200E","P2002","P242F","P2463","P2453"],"Régénération + MAJ","SPECIALISTES","Fréquent.");P("AdBlue / NOx (P20EE)","Élevée",["P20EE","P200E","P0087","P0193"],"Capteur NOx + AdBlue","RAPPEL_CONSO","Démarrage interdit.");P("EGR encrassée","Moyenne",["P0400","P0401","P0402","P0403"],"Nettoyage EGR","SPECIALISTES","Ratés.");P("Injecteurs fuite","Élevée",["P0201","P0202","P0093","P0087"],"Injecteurs + joints","NHTSA","Odeur.");}
  else if(t==='Diesel'){P("Chaîne allongement","Élevée",["P0016","P0340","P0335"],"Chaîne + tendeur","SAFETY_GATE","Bruit.");P("FAP encrassé","Élevée",["P200E","P2002","P242F","P2463"],"Régénération + MAJ","SPECIALISTES","Perte.");P("EGR","Moyenne",["P0400","P0401","P0403"],"Nettoyage","SPECIALISTES","Voyant.");P("Injecteurs","Élevée",["P0201","P0202","P0093"],"Injecteurs","NHTSA","Claquement.");}
  if(t==='Essence'&&!/PureTech/i.test(code)){P("Chaîne allongement","Élevée",["P0016","P0340","P0335"],"Chaîne + tendeur","SAFETY_GATE","Bruit.");P("Calamine / turbo","Moyenne",["P0299","P0171","P0172"],"Décalaminage","SPECIALISTES","Ratés.");}
  if(t==='Electrique'){P("BMS / équilibrage","Élevée",["P0A0A","P0A0B","P0A1F"],"MAJ BMS","NHTSA","Autonomie.");P("Recharge AC/DC","Moyenne",["P0A08","P0A09"],"Chargeur + connecteur","SPECIALISTES","Coupures.");P("Freinage régénératif","Moyenne",["P0A13","P0A14","P0A0F"],"MAJ + capteurs","SPECIALISTES","Régénération.");P("Pompe refroidissement","Moyenne",["P0A11","P0A12"],"Pompe + liquide","SAFETY_GATE","Surchauffe.");}
  if(t==='Hybride'||/E-Tech|Hybrid|PHEV|HEV|e:HEV|GTE|e-POWER/i.test(code)){P("Pompe inverter","Élevée",["P0A11","P0A00","P0A0F"],"Pompe inverter","NHTSA","Connue.");P("12V / DC-DC","Moyenne",["P0A08","P0A09","P0562"],"12V + DC-DC","SPECIALISTES","Alertes.");P("Régénération hybride","Moyenne",["P0A13","P0A0F"],"MAJ + capteurs","SPECIALISTES","Irrégulière.");}
  if(t==='Flexfuel'||/ECO-G|E85/i.test(code))P("Capteur éthanol/GPL","Moyenne",["P0171","P0172","P0455"],"Capteur + durites","SPECIALISTES","Ratés.");
  return out;}
function CI(){const o=[];const P=(t,s,d,r)=>o.push({title:t,severity:s,dtc:d,dtcRelated:d,repair:r,repairAction:r,source:'SPECIALISTES',com:true});
  P("Boîte / réducteur","Élevée",["P0700","P0715","P0720","P0842","P0868"],"Vidange + MAJ");P("Freinage maître-cylindre","Élevée",["C0128","C1283","C0131"],"Purge");P("ABS roues","Élevée",["C0035","C0040","C0045","C0050","C0110"],"Capteurs ABS");P("Trains roulants","Moyenne",["C0710","C0750","C0840"],"Rotules, roulements");P("Direction","Élevée",["C0455","C0460","C0472"],"Moteur direction");P("Ceintures","Élevée",["B0003","B0004","B0010","B0011"],"Prétensionneurs");P("Airbags","Élevée",["B0001","B0002","B0007","B0012","B0013"],"Modules");P("Électrique 12V","Moyenne",["P0560","P0562","P0563"],"Batterie + charge");P("Électronique bus","Moyenne",["U0140","U0155","U0250","U0400"],"Diagnostic bus");P("ADAS calibration","Moyenne",["C1001","C1003","C1100","C1102","C1112"],"Calibration");return o;}
function dtcForEngine(engine){const t=engine.fuelType||'';const code=engine.engineCode||'';let l=[];
  if(/PureTech/i.test(code))l=l.concat(["P0016","P0340","P0335","P2002","P242F","P2453","P2463","P200E","P0299","P2262"]);
  if(/BlueHDi|HDi/i.test(code)||t==='Diesel')l=l.concat(["P200E","P2002","P242F","P2463","P2453","P20EE","P0400","P0401","P0403","P0201","P0087","P0193","P0016","P0340"]);
  if(t==='Essence'&&!/PureTech/i.test(code))l=l.concat(["P0016","P0340","P0335","P0299","P0171","P0172","P0300"]);
  if(t==='Electrique')l=l.concat(["P0A0A","P0A0B","P0A1F","P0A08","P0A09","P0A13","P0A14","P0A11"]);
  if(t==='Hybride')l=l.concat(["P0A11","P0A00","P0A0F","P0A08","P0562","P0A13"]);
  if(t==='Flexfuel')l=l.concat(["P0171","P0172","P0455"]);
  l=l.concat(["P0700","P0715","P0720","C0035","C0040","C0110","C0128","B0001","B0003","U0100","U0250","C1001","C1112"]);
  return [...new Set(l)];}
async function buildVehicleIssues(brand,model,year,engine){
  let specific=[];
  try{const all=await DB.getAll('recalls');const code=((engine.engineCode||'')+' '+(engine.power||''));
    specific=all.filter(r=>r.brand===brand&&r.model===model&&(!year||(r.years||[]).includes(year))&&(!r.ef||new RegExp(r.ef,'i').test(code)));}catch(e){}
  return {specific,fam:FI(engine),com:CI(),dtc:dtcForEngine(engine)};}

function openModal(html){ const m=document.getElementById('detailModal'),b=document.getElementById('modalBody'); if(!m||!b)return;
  b.innerHTML=html; b.scrollTop=0; m.classList.remove('hidden'); m.scrollTop=0; bindChips(b); }

async function showFaultDetail(i, ctx) {
  openModal('<div class="loading">Chargement...</div>');
  const dtcs=i.dtc||i.dtcRelated||[];
  let cat='',sys='';
  if(dtcs.length){const d=await DTC_DB.getByCode(dtcs[0]);if(d){cat=d.category;sys=d.system;}}
  let rel=[];
  for(const c of dtcs){const rs=await RECALLS_DB.getByDTC(c);rs.forEach(r=>{if(!rel.some(x=>x.id===r.id))rel.push(r);});}
  let h='<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px"><h2 style="font-size:17px">'+i.title+'</h2><span class="severity-badge '+sevClass(i.severity)+'">'+i.severity+'</span></div>'+
    '<span class="source-badge '+srcClass(i.source)+'">'+srcName(i.source)+'</span>'+
    '<p style="margin:10px 0;font-size:13px;color:var(--text-secondary)">'+(i.description||'')+'</p>'+
    '<p style="font-size:13px;margin-bottom:6px">🚗 <strong>Véhicule :</strong> '+ctx.brand+' '+ctx.model+' • '+ctx.en.year+' • '+ctx.en.fuelType+' • '+ctx.en.engineCode+'</p>'+
    (cat?'<p style="font-size:13px;margin-bottom:6px">📂 <strong>Catégorie :</strong> '+cat+' — '+sys+'</p>':'')+
    '<h3 style="margin:10px 0 6px">⚡ Codes défaut liés</h3><div class="dtc-list">'+dtcs.map(cd=>'<span class="dtc-chip" data-code="'+cd+'">'+cd+'</span>').join('')+'</div>'+
    '<p style="font-size:12px;color:var(--success);margin-top:10px">🔧 <strong>Réparation :</strong> '+(i.repair||i.repairAction||'')+'</p>';
  if(rel.length){h+='<h3 style="margin:12px 0 6px">📋 Rappels officiels liés ('+rel.length+')</h3>';
    rel.forEach(r=>{h+='<div class="result-card"><strong>'+r.brand+' '+r.model+'</strong> — '+r.title+' <span class="severity-badge '+sevClass(r.severity)+'">'+r.severity+'</span></div>';});}
  openModal(h);
}

async function showDTCModal(d){
  const rec=await RECALLS_DB.getByDTC(d.code);
  let h='<h2 style="font-family:monospace;color:var(--accent)">'+d.code+'</h2><p style="margin:8px 0"><span class="severity-badge '+sevClass(d.severity)+'">'+d.severity+'</span> 📂 '+d.category+'</p><p><strong>'+d.system+'</strong></p>'+
    '<p style="margin-top:8px;font-size:13px">🚗 Marques: '+d.brands.join(', ')+'</p>';
  if(rec.length){h+='<h3 style="margin:10px 0 6px">📋 Rappels liés</h3>';rec.forEach(r=>{h+='<div class="result-card"><strong>'+r.brand+' '+r.model+'</strong> — '+r.title+'</div>';});}
  openModal(h);}

function card(i,idx){const dtcs=i.dtc||i.dtcRelated||[];
  return '<div class="result-card" style="margin-bottom:8px;cursor:pointer" data-fi="'+idx+'"><div class="dtc-list" style="margin-bottom:6px">'+dtcs.map(cd=>'<span class="dtc-chip" data-code="'+cd+'">'+cd+'</span>').join('')+'</div><div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px"><h3 style="font-size:13px">'+i.title+'</h3><span class="severity-badge '+sevClass(i.severity)+'">'+i.severity+'</span></div><span class="source-badge '+srcClass(i.source)+'">'+srcName(i.source)+'</span>'+(i.description?'<p class="description" style="margin-top:4px">'+i.description+'</p>':'')+'<p style="font-size:11px;color:var(--success);margin-top:4px">🔧 '+(i.repair||i.repairAction||'')+'</p></div>';}
function bindChips(root){root.querySelectorAll('.dtc-chip').forEach(ch=>{ch.addEventListener('click',async(e)=>{e.stopPropagation();const d=await DTC_DB.getByCode(ch.dataset.code);if(d)showDTCModal(d);});});}
function bindFaultCards(root,all,ctx){root.querySelectorAll('[data-fi]').forEach(el=>{el.addEventListener('click',(e)=>{if(e.target.classList.contains('dtc-chip'))return;showFaultDetail(all[+el.dataset.fi],ctx);});});}
function renderSheet(en,r){const all=r.specific.concat(r.fam,r.com);
  return {html:'<div style="padding:10px;border-left:3px solid var(--accent);margin:6px 0 10px;background:var(--bg-primary);border-radius:8px">'+
   '<p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">'+en.year+' • '+en.fuelType+' • '+en.power+' • '+en.engineCode+' — cliquez sur une panne pour la fiche détaillée</p>'+
   '<div class="dtc-list" style="margin-bottom:8px">'+r.dtc.map(cd=>'<span class="dtc-chip" data-code="'+cd+'">'+cd+'</span>').join('')+'</div>'+
   '<h4 style="color:var(--danger);margin:8px 0 6px">🔴 Spécifique ('+r.specific.length+')</h4>'+(r.specific.length?r.specific.map((i,k)=>card(i,k)).join(''):'<p style="font-size:11px;color:var(--text-muted)">Aucun.</p>')+
   '<h4 style="color:var(--warning);margin:8px 0 6px">🟠 Famille moteur ('+r.fam.length+')</h4>'+r.fam.map((i,k)=>card(i,r.specific.length+k)).join('')+
   '<h4 style="color:var(--text-secondary);margin:8px 0 6px">🔵 Généraux ('+r.com.length+')</h4>'+r.com.map((i,k)=>card(i,r.specific.length+r.fam.length+k)).join('')+'</div>',all};}

async function runSelfTest(){const out=[];const ok=(c,m)=>out.push((c?'✅ ':'❌ ')+m);
  try{ok((await VEHICLES_DB.getBrands('FRANCE')).includes('Peugeot'),'1 France');
    const eu=await VEHICLES_DB.getBrands('EUROPE');ok(eu.includes('Dacia')&&eu.includes('Skoda'),'2 Europe');
    ok((await VEHICLES_DB.getBrands('AUTRES')).includes('Jaecoo'),'3 Jaecoo');
    const d={engineCode:'1.5 BlueHDi 130',fuelType:'Diesel',power:'130ch'};
    const r=await buildVehicleIssues('Peugeot','3008',2020,d);
    ok(r.fam.some(i=>/8 mm/.test(i.title)),'4 chaîne 8mm');ok(r.dtc.includes('P20EE'),'5 P20EE');
    ok(!!(await DTC_DB.getByCode('P20EE')),'6 base DTC');}catch(e){ok(false,'Err '+e.message);}
  const n=out.filter(l=>l.indexOf('✅')===0).length;console.log('─── AUTOCONTRÔLE ───');out.forEach(l=>console.log(l));
  showToast('🩺 Autocontrôle '+n+'/'+out.length+' OK',n===out.length?'success':'error');}

async function checkUserStatus(){const saved=localStorage.getItem('currentUser');
  if(saved){try{const u=JSON.parse(saved);const dbU=await DB.get('users',u.id);
    if(dbU&&dbU.status==='approved'){dbU.lastAccess=Date.now();await DB.update('users',dbU);APP.currentUser=dbU;enterMainApp();return;}
    if(dbU&&dbU.status==='pending'){showPending();return;}
    if(dbU){localStorage.removeItem('currentUser');showDenied(dbU.status);return;}}catch(e){}}
  showScreen('accessScreen');}
function showPending(){showScreen('accessScreen');const b=document.getElementById('accessStatus');if(b){b.classList.remove('hidden');b.className='status-box pending';b.innerHTML='⏳ Demande en attente.';}}
function showDenied(s){showScreen('accessScreen');const b=document.getElementById('accessStatus');if(b){b.classList.remove('hidden');b.className='status-box denied';b.innerHTML=s==='revoked'?'🚫 Révoqué.':'❌ Refusée.';}}
function enterMainApp(){showScreen('mainScreen');const w=document.getElementById('userWelcome');if(w&&APP.currentUser)w.textContent='👤 '+APP.currentUser.firstName;loadVehiclesTab();}

function bindEvents(){
  on('accessForm','submit',async(e)=>{e.preventDefault();const f=document.getElementById('firstName');const n=f?f.value.trim():'';if(n.length<2){showToast('Prénom trop court','error');return;}
    const ex=await DB.query('users',u=>u.firstName.toLowerCase()===n.toLowerCase());
    if(ex.length){const u=ex[0];if(u.status==='approved'){APP.currentUser=u;localStorage.setItem('currentUser',JSON.stringify(u));enterMainApp();}else if(u.status==='pending')showPending();else showDenied(u.status);return;}
    const id=await DB.add('users',{firstName:n,status:'pending',requestDate:Date.now(),lastAccess:null});
    try{await DB.add('accessRequests',{userId:id,firstName:n,requestDate:Date.now(),status:'pending'});}catch(e){}
    showPending();showToast('📨 Demande envoyée','success');});
  on('btnBackFromAdmin','click',()=>showScreen('accessScreen'));
  on('adminLoginForm','submit',(e)=>{e.preventDefault();const p=document.getElementById('adminPassword');const pass=p?p.value:'';const st=localStorage.getItem('ADMIN_PASSWORD')||APP.ADMIN_PASSWORD;
    if(pass===st){sessionStorage.setItem('adminLogged','true');window.location.href='admin.html';}else{const er=document.getElementById('adminLoginError');if(er){er.classList.remove('hidden');er.textContent='❌ Incorrect';}}});
  on('btnInstallPWA','click',async()=>{if(APP.deferredPrompt){APP.deferredPrompt.prompt();const c=await APP.deferredPrompt.userChoice;if(c.outcome==='accepted')showToast('✅ Installée','success');APP.deferredPrompt=null;}});
  on('btnLogout','click',()=>{localStorage.removeItem('currentUser');APP.currentUser=null;showScreen('accessScreen');});
  document.querySelectorAll('.tab').forEach(t=>{t.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));t.classList.add('active');const c=document.getElementById('tab'+capitalize(t.dataset.tab));if(c)c.classList.add('active');});});
  on('btnValidateSearch','click',()=>performGlobalSearch());
  on('globalSearch','keypress',(e)=>{if(e.key==='Enter')performGlobalSearch();});
  document.querySelectorAll('.region-btn[data-region]').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.region-btn[data-region]').forEach(x=>x.classList.remove('active'));b.classList.add('active');APP.currentRegion=b.dataset.region;loadVehiclesTab();});});
  on('btnDtcSearch','click',()=>searchDTC());on('dtcSearch','keypress',(e)=>{if(e.key==='Enter')searchDTC();});
  document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('#dtcCategoryFilters .region-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');filterDTC(b.dataset.category);});});
  on('btnRecallSearch','click',()=>searchRecalls());on('recallSearch','keypress',(e)=>{if(e.key==='Enter')searchRecalls();});
  document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('#recallSeverityFilters .region-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');filterRecalls(b.dataset.severity);});});
  on('btnAiSearch','click',()=>performAISearch());
  on('btnAiClear','click',()=>{const q=document.getElementById('aiQuery');if(q)q.value='';const r=document.getElementById('aiResponseContainer');if(r)r.classList.add('hidden');const l=document.getElementById('aiLocalResults');if(l)l.innerHTML='';});
}

async function loadVehiclesTab(){const c=document.getElementById('brandsContainer');if(!c)return;c.innerHTML='<div class="loading">Chargement...</div>';
  try{const s=await VEHICLES_DB.getStats();const sb=document.getElementById('statsBar');
    if(sb)sb.innerHTML='<div class="stat-item"><div class="stat-value">'+s.FRANCE+'</div><div class="stat-label">🇫</div></div><div class="stat-item"><div class="stat-value">'+s.EUROPE+'</div><div class="stat-label">🇪</div></div><div class="stat-item"><div class="stat-value">'+s.AUTRES+'</div><div class="stat-label">🌍</div></div>';
    const brands=await VEHICLES_DB.getBrands(APP.currentRegion);
    if(!brands.length){c.innerHTML='<div class="loading">Aucun. Admin → Forcer MAJ.</div>';return;}
    c.innerHTML='';
    for(const b of brands){const meta=await VEHICLES_DB.getBrandMeta(APP.currentRegion,b);const models=await VEHICLES_DB.getModels(APP.currentRegion,b);
      const d=document.createElement('div');d.className='drawer';
      d.innerHTML='<div class="drawer-header"><div class="drawer-title"><span class="icon">'+(meta.flag||'🚗')+'</span><span>'+b+'</span><span style="font-size:11px;color:var(--text-muted)">('+meta.country+' • '+models.length+')</span></div><span class="drawer-arrow">▼</span></div><div class="drawer-content"><div class="drawer-inner"></div></div>';
      d.querySelector('.drawer-header').addEventListener('click',async()=>{d.classList.toggle('open');if(d.classList.contains('open')){const mc=d.querySelector('.drawer-inner');if(mc&&!mc.children.length)await loadModels(mc,b);}});
      c.appendChild(d);}}catch(e){c.innerHTML='<div class="loading">❌ '+e.message+'</div>';}}

async function loadModels(c,brand){const models=await VEHICLES_DB.getModels(APP.currentRegion,brand);c.innerHTML='';
  for(const m of models){const s=document.createElement('div');s.className='sub-drawer';
    s.innerHTML='<div class="sub-drawer-header"><span>📌 '+m+'</span><span class="drawer-arrow">▼</span></div><div class="sub-drawer-content"><div class="sub-drawer-inner"></div></div>';
    s.querySelector('.sub-drawer-header').addEventListener('click',async()=>{s.classList.toggle('open');if(s.classList.contains('open')){const ec=s.querySelector('.sub-drawer-inner');if(ec&&!ec.children.length){const en=await VEHICLES_DB.getEngines(APP.currentRegion,brand,m);loadEngines(ec,brand,m,en);}}});
    c.appendChild(s);}}

function loadEngines(c,brand,model,engines){c.innerHTML='';
  const bm=document.createElement('div');bm.className='engine-item';bm.style.borderColor='var(--accent)';
  bm.innerHTML='<div>📋 <strong>Pannes du modèle (toutes motorisations)</strong></div><span class="engine-power">→</span>';
  bm.addEventListener('click',()=>showModelIssues(brand,model));c.appendChild(bm);
  const by={};engines.forEach(e=>{if(!by[e.year])by[e.year]=[];by[e.year].push(e);});
  Object.keys(by).sort().forEach(y=>{const l=document.createElement('div');l.style.cssText='font-size:12px;color:var(--text-muted);margin:8px 0 4px;font-weight:600';l.textContent='📅 '+y;c.appendChild(l);
    by[y].forEach(en=>{const it=document.createElement('div');it.className='engine-item';
      it.innerHTML='<div><span class="fuel-badge '+en.fuelType.toLowerCase().replace(/\s/g,'')+'">'+en.fuelType+'</span><span style="margin-left:8px">'+en.engineCode+'</span></div><span class="engine-power">'+en.power+'</span>';
      it.addEventListener('click',async()=>{
        const next=it.nextElementSibling;
        if(next&&next.classList.contains('fault-sheet')){next.remove();return;}
        document.querySelectorAll('.fault-sheet').forEach(s=>s.remove());
        const sh=document.createElement('div');sh.className='fault-sheet';sh.innerHTML='<div class="loading">Chargement...</div>';
        it.after(sh);
        const r=await buildVehicleIssues(brand,model,en.year,en);
        const ctx={brand,model,en};
        const o=renderSheet(en,r);
        sh.innerHTML=o.html;bindChips(sh);bindFaultCards(sh,o.all,ctx);
      });
      c.appendChild(it);});});}

async function showModelIssues(brand,model){
  openModal('<div class="loading">Chargement...</div>');
  let all=[];try{all=await DB.getAll('recalls');}catch(e){}
  const spec=all.filter(r=>r.brand===brand&&r.model===model);
  openModal('<h2>'+brand+' '+model+' — toutes motorisations</h2>'+(spec.length?spec.map((i,k)=>card(i,k)).join(''):'<p style="color:var(--text-muted)">Ouvrez une motorisation pour la corrélation complète.</p>'));
  bindFaultCards(document.getElementById('modalBody'),spec,{brand,model,en:{year:'-',fuelType:'-',engineCode:'-'}});}

async function searchDTC(){const i=document.getElementById('dtcSearch'),q=i?i.value.trim():'',c=document.getElementById('dtcResults');if(!c)return;
  if(!q){c.innerHTML='<div class="loading">Code ?</div>';return;}
  const ex=await DTC_DB.getByCode(q.toUpperCase());if(ex){showDTCModal(ex);return;}
  displayDTC(await DTC_DB.search(q));}
async function filterDTC(cat){const c=document.getElementById('dtcResults');if(!c)return;
  displayDTC(cat==='ALL'?(await DB.getAll('dtcCodes')).slice(0,20):await DB.query('dtcCodes',d=>(d.category||'').includes(cat)));}
function displayDTC(r){const c=document.getElementById('dtcResults');if(!c)return;
  if(!r.length){c.innerHTML='<div class="loading">Aucun</div>';return;}
  c.innerHTML=r.map(d=>'<div class="result-card" style="cursor:pointer" data-code="'+d.code+'"><div style="display:flex;justify-content:space-between"><h3 style="font-family:monospace;color:var(--accent)">'+d.code+'</h3><span class="severity-badge '+sevClass(d.severity)+'">'+d.severity+'</span></div><p style="font-size:12px;color:var(--text-muted)">📂 '+d.category+' • '+d.system+'</p></div>').join('');
  c.querySelectorAll('.result-card').forEach(cd=>{cd.addEventListener('click',async()=>{const d=await DTC_DB.getByCode(cd.dataset.code);if(d)showDTCModal(d);});});}

async function searchRecalls(){const i=document.getElementById('recallSearch'),q=i?normalizeStr(i.value):'',c=document.getElementById('recallResults');if(!c)return;
  const all=await DB.getAll('recalls');
  displayRecalls(q?all.filter(r=>normalizeStr(r.brand).includes(q)||normalizeStr(r.model).includes(q)||normalizeStr(r.title).includes(q)):all.slice(0,20));}
async function filterRecalls(s){const c=document.getElementById('recallResults');if(!c)return;
  displayRecalls(s==='ALL'?await DB.getAll('recalls'):await RECALLS_DB.getBySeverity(s));}
function displayRecalls(r){const c=document.getElementById('recallResults');if(!c)return;
  if(!r.length){c.innerHTML='<div class="loading">Aucun</div>';return;}
  c.innerHTML=r.map(x=>'<div class="result-card"><div style="display:flex;justify-content:space-between"><h3>'+x.brand+' '+x.model+'</h3><span class="severity-badge '+sevClass(x.severity)+'">'+x.severity+'</span></div><p style="font-weight:600;margin:6px 0">'+x.title+'</p><div class="dtc-list">'+(x.dtc||x.dtcRelated||[]).map(cd=>'<span class="dtc-chip" data-code="'+cd+'">'+cd+'</span>').join('')+'</div></div>').join('');
  bindChips(c);}

async function performGlobalSearch(){const i=document.getElementById('globalSearch'),q=i?i.value.trim():'';if(!q)return;
  const n=normalizeStr(q);
  const v=await VEHICLES_DB.search(n),d=await DTC_DB.search(n);
  const rc=(await DB.getAll('recalls')).filter(r=>normalizeStr(r.brand).includes(n)||normalizeStr(r.model).includes(n)||normalizeStr(r.title).includes(n));
  showToast('🔎 '+v.length+' véh. • '+d.length+' DTC • '+rc.length+' rappels','info');
  if(d.length){const t=document.querySelector('.tab[data-tab="dtc"]');if(t)t.click();displayDTC(d);}
  else if(rc.length){const t=document.querySelector('.tab[data-tab="recalls"]');if(t)t.click();displayRecalls(rc);}
  else if(v.length){const t=document.querySelector('.tab[data-tab="vehicles"]');if(t)t.click();showToast('Ouvrez '+v[0].brand+' → '+v[0].model,'success');}
  else{const t=document.querySelector('.tab[data-tab="ai"]');if(t)t.click();const a=document.getElementById('aiQuery');if(a)a.value=q;}}

async function performAISearch(){const q=document.getElementById('aiQuery');const query=q?q.value.trim():'';if(!query){showToast('Question ?','warning');return;}
  const rt=document.getElementById('aiResponseText'),rs=document.getElementById('aiResponseSource'),rc=document.getElementById('aiResponseContainer');
  if(rt)rt.textContent='🔄 Recherche...';if(rc)rc.classList.remove('hidden');
  if(typeof AI_SEARCH==='undefined'){if(rt)rt.textContent='❌ ai-search.js non chargé.';return;}
  const res=await AI_SEARCH.combinedSearch(query);
  if(res.type==='gemini'||res.type==='free_ai'){if(rt)rt.textContent=res.response;if(rs)rs.textContent='Source: '+res.source;}
  else if(res.type==='local'){if(rt)rt.textContent='📋 '+res.results.dtcCodes.length+' DTC, '+res.results.recalls.length+' rappels.';}
  else{if(rt)rt.textContent=res.message||'Aucun résultat.';}}
