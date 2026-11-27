/* ═══════════════════════════════════════════════════════════════
   KEV FUSION 2026 — APP v25 (optimisée)
   Cache mémoire, lectures parallèles, rendu chunké,
   mémoïsation forte, passive listeners.
   ═══════════════════════════════════════════════════════════════ */
const ADMIN_PASSWORD="Kevin83600";
const SESSION_KEY="autodiag_session";
const DAY=86400000;
let CYCLE_DAYS=parseInt(localStorage.getItem("autodiag_cycle")||"30",10);
let ENRICH_QUOTA=parseInt(localStorage.getItem("autodiag_quota")||"10000",10);
let AXIS_FILTER=localStorage.getItem("autodiag_axis")||"all";
let MASS_LIMIT=parseInt(localStorage.getItem("autodiag_mass")||"10000",10);
let db,usersData={},brandsData={},motorsCache=[],deferredPrompt=null,started=false,ensured=false,pwdTyped=false,pendCount=-1,updating=false,tierSynced=false,releaseSeen=0,releaseWatch=false;
let curBrand=null,curModelId=null,curModelName=null,massResult=null;

/* Cache mémoire pour lectures fréquentes */
const MEM_CACHE=new Map();
const MEM_TTL=60000;

function memGet(key){
  const e=MEM_CACHE.get(key);
  if(e&&Date.now()-e.t<MEM_TTL)return e.v;
  return null;
}
function memSet(key,v){
  MEM_CACHE.set(key,{t:Date.now(),v});
  if(MEM_CACHE.size>100){
    const oldest=MEM_CACHE.keys().next().value;
    MEM_CACHE.delete(oldest);
  }
}

window.addEventListener("DOMContentLoaded",()=>{
  if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
  try{firebase.initializeApp(firebaseConfig);db=firebase.database();}
  catch(e){notify("❌ Firebase : configuration invalide","error");return;}
  setupInstall();bindAdminTable();bindPwd();netMonitor();bindUpdateUI();lockUI();
  seedBrands();boot();selfTest(true);autoUpdateWatch();
});
window.addEventListener("pageshow",()=>clearPwd());

function el(i){return document.getElementById(i);}
function val(i){const e=el(i);return e?e.value:"";}
function esc(s){const d=document.createElement("div");d.textContent=String(s==null?"":s);return d.innerHTML;}
function fmt(n){return Number(n).toLocaleString("fr-FR");}
function notify(m,t){const n=document.createElement("div");n.className="notification"+(t==="error"?" error":"");n.textContent=m;document.body.appendChild(n);setTimeout(()=>n.remove(),4500);}
function pushNotif(t,b){if("Notification" in window&&Notification.permission==="granted"){try{new Notification(t,{body:b,icon:"./icon-192.png"});}catch(e){}}}
function showScreen(i){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));const e=el(i);if(e)e.classList.add("active");}
function active(i){const e=el(i);return !!e&&e.classList.contains("active");}
function uid(p){return p+"_"+Date.now()+"_"+Math.random().toString(36).substr(2,6);}
function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY));}catch(e){return null;}}
function saveSession(s){localStorage.setItem(SESSION_KEY,JSON.stringify(s));}
function deviceId(){let i=localStorage.getItem("autodiag_device");if(!i){i="DEV-"+Math.random().toString(36).substr(2,8).toUpperCase();localStorage.setItem("autodiag_device",i);}return i;}
function isAdmin(){return sessionStorage.getItem("autodiag_admin")==="1";}
function guardAdmin(){if(isAdmin())return true;notify("🔒 Fonction réservée à l'administrateur","error");return false;}

async function dbGet(p){
  const cached=memGet(p);
  if(cached)return cached;
  try{
    const s=await Promise.race([db.ref(p).once("value"),new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),5000))]);
    const v=s.val()||{};
    try{localStorage.setItem("mir_"+p,JSON.stringify(v));}catch(e){}
    memSet(p,v);
    return v;
  }catch(e){try{return JSON.parse(localStorage.getItem("mir_"+p)||"{}");}catch(x){return{};}}
}
async function dbSet(p,v){try{await db.ref(p).set(v);MEM_CACHE.delete(p);return true;}catch(e){console.warn("set",p,e);return false;}}
async function dbUpd(p,v){try{await db.ref(p).update(v);MEM_CACHE.delete(p);return true;}catch(e){return false;}}

function clearPwd(){const p=el("admin-pwd");if(p&&!pwdTyped){p.value="";try{p.setAttribute("value","");}catch(e){}}}
function showAdminLogin(){pwdTyped=false;clearPwd();showScreen("screen-admin-login");[0,80,250,600,1200].forEach(t=>setTimeout(clearPwd,t));}
function bindPwd(){const p=el("admin-pwd");if(!p)return;p.addEventListener("input",()=>{pwdTyped=true;},{passive:true});p.addEventListener("focus",()=>{if(!pwdTyped)clearPwd();},{passive:true});p.addEventListener("keydown",e=>{if(e.key==="Enter")loginAdmin();},{passive:true});}

function netMonitor(){
  const set=on=>{const s=el("net-status");if(s){s.textContent=on?"📶 en ligne":"⚠️ hors-ligne (cache)";s.className=on?"net on":"net off";}};
  set(navigator.onLine);
  addEventListener("online",()=>{set(true);notify("📶 Connexion rétablie");},{passive:true});
  addEventListener("offline",()=>{set(false);notify("⚠️ Hors-ligne : cache local actif","error");},{passive:true});
}

function guessFuel(n){
  n=String(n).toLowerCase();
  if(/electric|électrique|e-tron|\bev\b|e-|ë-|folgore|propulsion|plaid|long range|grande autonomie|xpower|dual motor|single motor|twin motor|edrive|z\.e|elettrica|recharge pure|hydrogène/.test(n))return"electrique";
  if(/hybrid|hybride|phev|e:hev|e-tech|etech|mhev|48v|dm-i|dm-p|dmo|erev|e-power|e-boxer|recharge|4xe|gte|ehybrid|e-hybrid|shvs|hybrid\+|em-i|idd|e-tense|hev|etec|etsi|mild/.test(n))return"hybride";
  if(/dci|tdi|bluehdi|\bhdi\b|diesel|crdi|multijet|ecoblue|jtd|d-4d|skyactiv-d|bluetec|cdi|ecodiesel|ecojet|ddis|di-d|cdti|mhawk|revotorq|\bd[0-9]{2,3}\b|\b[0-9]\.[0-9] d\b/.test(n))return"diesel";
  return"essence";
}
function guessPower(n){const m=String(n).match(/(\d{2,4})\s*ch\b/i)||String(n).match(/(\d{2,4})\s*$/);return m?m[1]+" ch":"";}
function famFuel(k){k=String(k).toLowerCase();for(const[t,f]of Object.entries(EG_TOKEN_FUEL))if(k.includes(t.toLowerCase()))return f;return null;}
const FKW={
 diesel:["adblue","fap","egr","dci","tdi","bluehdi","diesel","multijet","crdi","ecoblue","skyactiv-d","préchauffage","jtd","d-4d","cdi","ecodiesel","scr"],
 essence:["puretech","tce","tsi","ecoboost","gdi","thp","vtec","essence","courroie","chaîne","chaine","allumage","bougies","catalyseur","gpf","calamine"],
 hybride:["hybrid","hybride","phev","e:hev","e-tech","onduleur","48v","dm-i","e-power","recharge","bascule","4xe","erev"],
 electrique:["électrique","electrique","iccu","obc","bms","batterie hv","charge","isolement","dc-dc","soh","servofrein","réducteur","lfp","blade"]
};
function fuelOf(t){t=String(t).toLowerCase();for(const f of["diesel","essence","hybride","electrique"])if(FKW[f].some(k=>t.includes(k)))return f;return null;}
function compat(a,b){if(!a||!b)return true;if(a===b)return true;return(a==="hybride"&&b==="electrique")||(a==="electrique"&&b==="hybride");}
function fuzzy(a,b){if(!a)return true;if(!b)return false;a=String(a).toLowerCase();b=String(b).toLowerCase();if(a===b||a.includes(b)||b.includes(a))return true;return a.split("/").some(p=>{p=p.trim();return p&&(b.includes(p)||p.includes(b));});}
function kwMatch(key,motor){
  if(!key)return true;if(!motor)return true;
  const k=String(key).toLowerCase(),mn=String(motor.name).toLowerCase();
  if(mn.includes(k))return true;
  if(curModelName){const cm=String(curModelName).toLowerCase();if(k.includes(cm)||cm.includes(k))return true;}
  const f=famFuel(k)||fuelOf(k);if(f)return compat(f,motor.fuel);
  return false;
}
function motorMatch(mk,motor){
  if(!mk)return true;if(!motor)return true;
  const k=String(mk).toLowerCase(),mn=String(motor.name).toLowerCase();
  if(mn.includes(k)||k.includes(mn))return true;
  const f=famFuel(k)||fuelOf(k);if(f)return compat(f,motor.fuel);
  if(curModelName&&k.includes(String(curModelName).toLowerCase()))return true;
  return false;
}
function titleOk(t,motor){if(!motor)return true;const f=fuelOf(t);return !f||compat(f,motor.fuel);}

function egGroup(b){for(const[g,l]of Object.entries(EG_GROUPS))if(l.includes(b))return g;return null;}
function egTokens(name){const n=" "+String(name).toLowerCase()+" ",h=[];for(const[t,f]of Object.entries(EG_TOKEN_FUEL))if(n.includes(t.toLowerCase()))h.push({t,f});h.sort((a,b)=>b.t.length-a.t.length);return h;}
function egFix(brandId,m){
  const g=egGroup(brandId);if(!g)return{changed:false,m};
  const nat=EG_NATIVE[g]||[],orig=String(m.name||"");let name=orig,changed=false;
  for(const h of egTokens(orig)){
    const tl=h.t.toLowerCase();
    if(nat.some(x=>tl.includes(x)||x.includes(tl)))continue;
    const canon=(EG_CANON[g]||{})[h.f]||"";if(!canon)continue;
    const re=new RegExp(tl.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i");
    if(re.test(name)){name=name.replace(re,canon);changed=true;}
  }
  let fuel=m.fuel;const tk=egTokens(name);
  if(tk.length)fuel=tk[0].f;else if(!fuel)fuel=guessFuel(name);
  if(fuel!==m.fuel||name!==orig)changed=true;
  return{changed,m:Object.assign({},m,{name:name.replace(/\s+/g," ").trim(),fuel})};
}
async function engineAudit(verbose){
  if(!guardAdmin())return 0;
  const models=await dbGet("data/models"),motors=await dbGet("data/motors");
  let fixed=0,checked=0;
  for(const[mid,mo]of Object.entries(models)){
    const list=motors[mid];if(!Array.isArray(list))continue;
    let ch=false;
    const next=list.map(x=>{checked++;const r=egFix(mo.brandId,x);if(r.changed){ch=true;return r.m;}return x;});
    if(ch){await dbSet("data/motors/"+mid,next);fixed++;}
  }
  const c=el("engine-box");if(c)c.innerHTML='<p class="meta">🛡️ '+fmt(checked)+" motorisations vérifiées • "+fixed+" correction(s)</p>";
  if(verbose)notify(fixed?"🛡️ "+fixed+" modèle(s) corrigé(s)":"🛡️ Aucune incohérence ("+fmt(checked)+")");
  return fixed;
}
async function attributionAudit(verbose){
  if(!guardAdmin())return 0;
  const models=await dbGet("data/models"),exp=await dbGet("data/expert");
  const byBrand={};Object.values(models).forEach(m=>{(byBrand[m.brandId]=byBrand[m.brandId]||[]).push(m.name);});
  let fixed=0;
  for(const[id,e]of Object.entries(exp)){
    if(e.derived)continue;
    let mk=String(e.motor||""),mdl=String(e.model||""),upd=false;
    if(mk){
      const names=byBrand[e.brandId]||[];
      const hit=names.find(n=>String(n).length>2&&mk.toLowerCase().includes(String(n).toLowerCase()));
      if(hit){
        const rest=mk.toLowerCase().split(String(hit).toLowerCase()).join(" ");
        let nm="";
        if(/elec|électri|\bev\b/.test(rest))nm="Electric";
        else if(/hybrid|phev/.test(rest))nm="Hybrid";
        else if(/dci|tdi|diesel|crdi|hdi/.test(rest))nm="diesel";
        else if(/tce|tsi|puretech|essence/.test(rest))nm="essence";
        e.model=mdl||hit;e.motor=nm;upd=true;
      }else if(/élec|electri/.test(mk)&&!/electric/i.test(mk)){e.motor="Electric";upd=true;}
    }
    if(upd){await dbUpd("data/expert/"+id,{model:e.model,motor:e.motor});fixed++;}
  }
  const c=el("attrib-box");if(c)c.innerHTML='<p class="meta">🧬 '+fmt(Object.keys(exp).length)+" fiches • "+fixed+" correction(s)</p>";
  if(verbose)notify(fixed?"🧬 "+fixed+" attribution(s) corrigée(s)":"🧬 Attributions cohérentes");
  return fixed;
}

async function seedBrands(){
  try{const cur=await dbGet("data/brands");for(const[id,name,region]of BRANDS)if(!cur[id])await dbSet("data/brands/"+id,{name,region});}catch(e){}
}
async function ensureCatalog(force,log){
  if(ensured&&!force)return{models:0,expert:0,camp:0};
  ensured=true;
  let added=0,exAdd=0,cpAdd=0;const L=log||(()=>{});
  try{
    await seedBrands();
    const models=await dbGet("data/models");
    const map={};Object.entries(models).forEach(([id,m])=>map[m.brandId+"|"+String(m.name).toLowerCase()]=id);
    for(let i=0;i<MODELS_ALL.length;i++){
      const[b,name,years,motors]=MODELS_ALL[i],key=b+"|"+name.toLowerCase();
      if(map[key])continue;
      const id="m_"+b+"_"+i;
      await dbSet("data/models/"+id,{brandId:b,name,years});
      await dbSet("data/motors/"+id,motors.map(m=>egFix(b,m).m));
      map[key]=id;added++;
      if(added%40===0)L("Modèles : "+added+" / "+MODELS_ALL.length);
    }
    for(const[b,name,,motors]of MODELS_ALL){
      const id=map[b+"|"+name.toLowerCase()];if(!id)continue;
      const cur=(await db.ref("data/motors/"+id).once("value")).val()||[];
      const have={};cur.forEach(x=>have[String(x.name).toLowerCase()]=1);
      let ch=false;
      motors.forEach(m=>{if(!have[String(m.name).toLowerCase()]){cur.push(egFix(b,m).m);ch=true;}});
      for(let i=0;i<cur.length;i++){
        if(!cur[i].fuel){cur[i].fuel=guessFuel(cur[i].name);ch=true;}
        if(!cur[i].power){const p=guessPower(cur[i].name);if(p){cur[i].power=p;ch=true;}}
      }
      if(ch)await dbSet("data/motors/"+id,cur);
    }
    const exp=await dbGet("data/expert");const te={};Object.values(exp).forEach(x=>te[String(x.title).toLowerCase()]=1);
    for(const e of EXPERT){
      if(te[e[3].toLowerCase()])continue;
      await dbSet("data/expert/"+uid("ex"),{brandId:e[0],motor:e[1],type:e[2],title:e[3],symptom:e[4],diagnosis:e[5],parts:e[6],dtc:e[7],source:e[8],years:e[9],model:""});
      te[e[3].toLowerCase()]=1;exAdd++;
    }
    const iss=await dbGet("data/issues");const ti={};Object.values(iss).forEach(x=>ti[String(x.title).toLowerCase()]=1);
    for(const c of CAMPAIGNS){
      if(ti[c[3].toLowerCase()])continue;
      await dbSet("data/issues/"+uid("cp"),{brandId:c[0],model:c[1],motor:c[2],title:c[3],detail:c[4],source:c[5],dtc:c[6],url:c[7]});
      ti[c[3].toLowerCase()]=1;cpAdd++;
    }
    L("Fiches expert : +"+exAdd+" · campagnes : +"+cpAdd);
  }catch(e){L("⚠️ "+e.message);}
  return{models:added,expert:exAdd,camp:cpAdd};
}

async function tierAutoSync(silent){
  const st=el("tier-sync");
  if(st)st.textContent="🔄 Synchronisation de la base…";
  try{
    await ensureCatalog(false);
    brandsData=await dbGet("data/brands");
    tierSynced=true;
    localStorage.setItem("autodiag_tier_sync",String(Date.now()));
    if(st)st.textContent="✅ Base synchronisée · "+new Date().toLocaleTimeString("fr-FR");
    if(active("screen-app"))await buildBrandSelect();
    if(!silent)notify("✅ Base à jour");
  }catch(e){if(st)st.textContent="⚠️ Hors-ligne : base locale utilisée";}
}
function watchRelease(){
  if(releaseWatch||!db)return;releaseWatch=true;
  db.ref("data/release").on("value",async s=>{
    const r=s.val();if(!r||!r.version)return;
    releaseSeen=parseInt(localStorage.getItem("autodiag_release_seen")||"0",10);
    const box=el("release-info");
    if(box)box.innerHTML='<p class="meta">📡 Dernière diffusion admin : '+new Date(r.publishedAt||r.version).toLocaleString("fr-FR")+" · palier "+(r.level||0)+" · "+fmt(r.derived||0)+" fiches dérivées"+(r.note?" · "+esc(r.note):"")+"</p>";
    if(r.version>releaseSeen){
      localStorage.setItem("autodiag_release_seen",String(r.version));
      if(isAdmin())return;
      const sess=getSession();
      if(!sess||sess.status!=="accepted")return;
      notify("📡 Mise à jour diffusée par l'administrateur");
      pushNotif("📡 Base enrichie","Palier "+(r.level||0)+" — "+fmt(r.derived||0)+" fiches disponibles.");
      ensured=false;
      await tierAutoSync(true);
      if(active("screen-app")&&curModelName)correlate();
    }
  });
}
async function broadcastRelease(){
  if(!guardAdmin())return;
  const models=await dbGet("data/models"),exp=await dbGet("data/expert"),iss=await dbGet("data/issues");
  const derived=Object.values(exp).filter(e=>e.derived).length;
  const tierCount=Object.values(usersData).filter(u=>u.status==="accepted").length;
  const note=(el("broadcast-note")&&el("broadcast-note").value.trim())||"";
  const force=el("broadcast-force")?el("broadcast-force").checked:true;
  const payload={version:Date.now(),publishedAt:new Date().toISOString(),
    level:parseInt(localStorage.getItem("autodiag_enrich_level")||"0",10),
    models:Object.keys(models).length,expert:Object.keys(exp).length,campaigns:Object.keys(iss).length,
    derived,note,force,tiers:tierCount,by:deviceId()};
  const ok=await dbSet("data/release",payload);
  if(!ok)return notify("❌ Diffusion impossible","error");
  await dbSet("data/version",{version:payload.version,lastUpdate:payload.publishedAt,updateIntervalDays:CYCLE_DAYS,enrichLevel:payload.level});
  logLine("📡 DIFFUSION : palier "+payload.level+" · "+fmt(payload.models)+" modèles · "+fmt(payload.expert)+" fiches dont "+fmt(derived)+" dérivées · "+tierCount+" tiers");
  logLine("📡 Les tiers recevront la mise à jour à leur prochaine connexion"+(force?" (resynchronisation forcée).":"."));
  notify("📡 Diffusé à "+tierCount+" tiers");
  pushNotif("📡 Diffusion envoyée","Palier "+payload.level+" publié pour les tiers.");
  renderReleaseState();
}
async function renderReleaseState(){
  const r=await dbGet("data/release");
  const b=el("release-state");
  if(!b)return;
  if(!r||!r.version){b.innerHTML='<p class="meta">Aucune diffusion effectuée.</p>';return;}
  b.innerHTML='<p class="meta">📡 Palier '+r.level+" · "+new Date(r.publishedAt).toLocaleString("fr-FR")+" · "+fmt(r.models)+" modèles · "+fmt(r.expert)+" fiches ("+fmt(r.derived)+" dérivées) · "+r.tiers+" tiers</p>";
}

function logLine(t){
  const box=el("update-log");if(!box)return;
  const p=document.createElement("p");p.className="logline";
  p.innerHTML='<span class="logtime">'+new Date().toLocaleTimeString("fr-FR")+"</span> "+esc(t);
  box.appendChild(p);box.scrollTop=box.scrollHeight;
}
function setProgress(pct,label){
  const b=el("update-bar"),l=el("update-label");
  if(b)b.style.width=Math.max(0,Math.min(100,pct))+"%";
  if(l)l.textContent=label;
}
function bindUpdateUI(){
  const c=el("cycle-select");
  if(c){c.value=String(CYCLE_DAYS);c.addEventListener("change",()=>{if(!guardAdmin()){c.value=String(CYCLE_DAYS);return;}CYCLE_DAYS=parseInt(c.value,10);localStorage.setItem("autodiag_cycle",String(CYCLE_DAYS));renderUpdateState();},{passive:true});}
  const q=el("quota-select");
  if(q){q.value=String(ENRICH_QUOTA);q.addEventListener("change",()=>{if(!guardAdmin()){q.value=String(ENRICH_QUOTA);return;}ENRICH_QUOTA=parseInt(q.value,10);localStorage.setItem("autodiag_quota",String(ENRICH_QUOTA));notify("🧠 Palier : "+fmt(ENRICH_QUOTA)+" fiches");},{passive:true});}
  const a=el("axis-select");
  if(a){
    a.innerHTML='<option value="all">Balayage complet (52 axes)</option><option value="auto">Rotation automatique</option>';
    ENRICH_AXES.forEach(x=>a.innerHTML+='<option value="'+x.k+'">'+esc(x.t)+"</option>");
    a.value=AXIS_FILTER;
    a.addEventListener("change",()=>{if(!guardAdmin()){a.value=AXIS_FILTER;return;}AXIS_FILTER=a.value;localStorage.setItem("autodiag_axis",AXIS_FILTER);},{passive:true});
  }
  const m=el("mass-select");
  if(m){m.value=String(MASS_LIMIT);m.addEventListener("change",()=>{MASS_LIMIT=parseInt(m.value,10);localStorage.setItem("autodiag_mass",String(MASS_LIMIT));notify("🔎 Recherche massive : "+fmt(MASS_LIMIT)+" fiches max");},{passive:true});}
  renderUpdateState();renderEnrichStats();renderReleaseState();
}
function renderEnrichStats(){
  const b=el("enrich-stats");if(!b||typeof enrichStats!=="function")return;
  const s=enrichStats();
  b.innerHTML='<p class="meta">🧠 Palier : <b>'+s.level+'</b> · fiches dérivées cumulées : <b>'+fmt(s.total)+'</b> · axes : '+s.axes+' · familles moteur : '+s.families+' · synonymes : '+s.synonyms+"</p>";
}
function renderUpdateState(){
  const last=parseInt(localStorage.getItem("autodiag_last_update")||"0",10);
  const n=el("update-next");
  if(n)n.textContent=last?("Dernière MAJ admin : "+new Date(last).toLocaleString("fr-FR")+" · cycle "+CYCLE_DAYS+" j"):"Aucune mise à jour admin effectuée.";
  const b=el("update-badge");
  if(b){const due=!last||Date.now()-last>CYCLE_DAYS*DAY;b.textContent=due?"⚠️ MAJ admin requise":"✅ À jour";b.className="pill "+(due?"pill-warn":"pill-ok");}
}
async function runUpdate(){
  if(!guardAdmin())return;
  if(updating)return notify("⏳ Mise à jour déjà en cours","error");
  updating=true;
  document.querySelectorAll("[data-update-btn]").forEach(b=>b.disabled=true);
  const box=el("update-log");if(box)box.innerHTML="";
  setProgress(2,"Démarrage…");
  logLine("── MAJ MANUELLE MASSIVE · quota "+fmt(ENRICH_QUOTA)+" ──");
  logLine("Catalogue : "+fmt(BRANDS.length)+" marques · "+fmt(MODELS_ALL.length)+" modèles · "+fmt(MODELS_ALL.reduce((a,m)=>a+m[3].length,0))+" motorisations");
  try{
    setProgress(8,"Marques…");await seedBrands();
    setProgress(18,"Modèles & motorisations…");
    const r=await ensureCatalog(true,logLine);
    setProgress(35,"Auto-enrichissement massif…");
    let enriched=0;
    if(typeof autoEnrich==="function")enriched=await autoEnrich(ENRICH_QUOTA,logLine,AXIS_FILTER,p=>setProgress(35+p*40,"Enrichissement "+Math.round(p*100)+" %"));
    setProgress(78,"Attributions…");const a=await attributionAudit(false);logLine("Attributions : "+a);
    setProgress(87,"Garde-moteurs…");const g=await engineAudit(false);logLine("Garde-moteurs : "+g);
    setProgress(94,"Version…");
    await dbSet("data/version",{version:Date.now(),lastUpdate:new Date().toISOString(),updateIntervalDays:CYCLE_DAYS,enrichLevel:parseInt(localStorage.getItem("autodiag_enrich_level")||"0",10)});
    localStorage.setItem("autodiag_last_update",String(Date.now()));
    brandsData=await dbGet("data/brands");fillBrandSelects();
    if(active("screen-app"))await buildBrandSelect();
    await selfTest(true);
    setProgress(100,"Terminé");
    logLine("✅ +"+r.models+" modèles · +"+r.expert+" fiches · +"+r.camp+" campagnes · +"+fmt(enriched)+" dérivées");
    logLine("➡️ Cliquez sur DIFFUSER pour publier ce palier aux tiers.");
    renderEnrichStats();renderVeille();renderReleaseState();
    notify("✅ MAJ : +"+fmt(enriched+r.expert+r.camp)+" fiches");
  }catch(e){logLine("❌ "+e.message);notify("❌ "+e.message,"error");setProgress(0,"Erreur");}
  document.querySelectorAll("[data-update-btn]").forEach(b=>b.disabled=false);
  updating=false;renderUpdateState();
}
function manualUpdate(){runUpdate();}
function renderVeille(){
  const boxes=[el("veille-box"),el("veille-app")];
  const b=curBrand?(brandsData[curBrand]?brandsData[curBrand].name:curBrand):"";
  const q=encodeURIComponent((b+" "+(curModelName||"")).trim()||"automobile"),yr=new Date().getFullYear();
  const items=[["🏭 Constructeur","https://www.google.com/search?q=site:"+(BRAND_SITE[curBrand]||"")+"+rappel+TSB+"+q],
  ["🇫🇷 Rappel Conso","https://www.google.com/search?q=site:rappel.conso.gouv.fr+"+q],
  ["🇪🇺 Safety Gate","https://www.google.com/search?q=site:ec.europa.eu+safety+gate+"+q],
  ["🇺🇸 NHTSA","https://www.google.com/search?q=site:nhtsa.gov+"+q+"+recall"],
  ["🇩🇪 KBA","https://www.google.com/search?q=site:kba.de+"+q],
  ["🇬🇧 DVSA","https://www.google.com/search?q=site:gov.uk+vehicle+recall+"+q],
  ["🔧 TSB","https://www.google.com/search?q="+q+"+TSB+technical+service+bulletin+"+yr],
  ["📰 Presse","https://www.google.com/search?q="+q+"+panne+rappel+fiabilit%C3%A9+"+yr],
  ["💬 Propriétaires","https://www.google.com/search?q="+q+"+forum+probl%C3%A8me+avis"],
  ["🆕 Nouveautés "+yr,"https://www.google.com/search?q="+q+"+nouveau+mod%C3%A8le+motorisation+"+yr]];
  const h=items.map(([l,u])=>'<a class="srclink" target="_blank" rel="noopener" href="'+u+'">'+l+"</a>").join("");
  boxes.forEach(x=>{if(x)x.innerHTML=h;});
}

async function selfTest(quiet){
  const R=[],t=(n,ok)=>R.push({n,ok:!!ok});
  try{await db.ref("data/version").once("value");t("Connexion Firebase",true);}catch(e){t("Connexion Firebase",false);}
  t("Catalogue chargé",typeof MODELS_ALL!=="undefined"&&MODELS_ALL.length>0);
  t("Moteur maintenance",typeof buildMaintenanceHTML==="function");
  t("Moteur enrichissement",typeof autoEnrich==="function");
  t("Corrélation véhicule",typeof buildVehicleFiches==="function");
  t("Fond outils maintenance",!!el("maint-tools"));
  try{const r=await fetch("./manifest.json",{cache:"no-store"});t("Manifest",r.ok);}catch(e){t("Manifest",false);}
  t("Service Worker",!!navigator.serviceWorker);
  t("Réseau",navigator.onLine);
  const b=await dbGet("data/brands");t("Marques ("+fmt(Object.keys(b).length)+")",Object.keys(b).length>0);
  const m=await dbGet("data/models");t("Modèles ("+fmt(Object.keys(m).length)+")",Object.keys(m).length>0);
  const e2=await dbGet("data/expert");t("Fiches ("+fmt(Object.keys(e2).length)+")",Object.keys(e2).length>0);
  t("Verrouillage admin",!!document.querySelector("[data-admin-only]"));
  t("Canal diffusion",!!el("release-info")||!!el("release-state"));
  window.lastSelfTest=R;
  const c=el("selftest-box");if(c)c.innerHTML=R.map(r=>'<p class="testline">'+(r.ok?"✅":"❌")+" "+esc(r.n)+"</p>").join("");
  const bad=R.filter(r=>!r.ok).length;
  if(bad)notify("🩺 "+bad+" anomalie(s)","error");else if(!quiet)notify("🩺 Auto-test OK ("+R.length+")");
  return R;
}

function boot(){
  if(!started){
    started=true;
    db.ref("access/users").on("value",s=>{
      usersData=s.val()||{};
      const pc=Object.values(usersData).filter(u=>u.status==="pending").length;
      if(pendCount>=0&&pc>pendCount&&isAdmin()){notify("📨 Nouvelle demande");pushNotif("📨 Nouvelle demande","Un tiers attend validation.");}
      pendCount=pc;routeUser();if(active("screen-admin"))renderAdmin();
    },{passive:true});
    db.ref("data/brands").on("value",s=>{brandsData=s.val()||{};if(active("screen-admin"))fillBrandSelects();},{passive:true});
    db.ref("data/version").on("value",s=>{const v=s.val();const t=v&&v.lastUpdate?new Date(v.lastUpdate).toLocaleDateString("fr-FR"):"--";["app-version","admin-version"].forEach(i=>{const e=el(i);if(e)e.textContent=t;});},{passive:true});
  }
  routeUser();
}
function routeUser(){
  const s=getSession();if(!s||!s.prenom){showScreen("screen-home");lockUI();return;}
  const k=Object.keys(usersData).find(x=>usersData[x].prenom&&usersData[x].prenom.toLowerCase()===s.prenom.toLowerCase());
  if(!k){el("pending-name").textContent=s.prenom;showScreen("screen-pending");return;}
  const st=usersData[k].status;
  if(s.lastStatus!==st){
    s.lastStatus=st;saveSession(s);
    if(st==="accepted"){notify("✅ Accès autorisé — bienvenue "+s.prenom);pushNotif("✅ Accès autorisé","Votre accès est actif.");}
    else if(st==="refused"){notify("❌ Demande refusée","error");pushNotif("❌ Accès refusé","Demande refusée.");}
    else if(st==="revoked"){notify("🔒 Accès révoqué","error");pushNotif("🔒 Accès révoqué","Accès révoqué.");}
  }
  s.status=st;saveSession(s);
  if(st==="accepted"){el("accepted-name").textContent=s.prenom;showScreen("screen-accepted");if(!isAdmin())setTimeout(()=>tierAutoSync(true),400);}
  else if(st==="refused")showScreen("screen-refused");
  else if(st==="revoked")showScreen("screen-revoked");
  else{el("pending-name").textContent=s.prenom;showScreen("screen-pending");}
}
async function requestAccess(){
  const p=el("input-prenom").value.trim();if(p.length<2)return notify("Prénom invalide","error");
  if("Notification" in window&&Notification.permission==="default")Notification.requestPermission();
  saveSession({prenom:p,status:"pending",lastStatus:"pending",date:Date.now()});
  await dbSet("access/users/user_"+p.toLowerCase().replace(/[^a-z0-9]+/g,"_"),{prenom:p,status:"pending",device:deviceId(),date:Date.now()});
  el("pending-name").textContent=p;showScreen("screen-pending");
  notify("📨 Demande transmise");pushNotif("📨 Demande envoyée","Vous serez notifié à la validation.");
}
function checkStatus(){routeUser();notify("🔄 Statut vérifié");}
function resetSession(){localStorage.removeItem(SESSION_KEY);tierSynced=false;el("input-prenom").value="";showScreen("screen-home");lockUI();}
function loginAdmin(){
  if(val("admin-pwd")===ADMIN_PASSWORD){
    sessionStorage.setItem("autodiag_admin","1");pwdTyped=false;el("admin-pwd").value="";
    showScreen("screen-admin");renderAdmin();fillBrandSelects();renderUpdateState();renderEnrichStats();renderVeille();renderReleaseState();lockUI();
  }else notify("❌ Mot de passe incorrect","error");
}
function logoutAdmin(){sessionStorage.removeItem("autodiag_admin");pwdTyped=false;clearPwd();showScreen("screen-home");lockUI();}
function adminTab(id){
  if(!guardAdmin())return;
  ["tab-access","tab-data","tab-update"].forEach(t=>{const e=el(t);if(e)e.classList.toggle("hidden",t!==id);});
  document.querySelectorAll(".tabs .btn[data-tab]").forEach(b=>b.classList.toggle("tab-on",b.dataset.tab===id));
  if(id==="tab-data")fillBrandSelects();
  if(id==="tab-update"){renderUpdateState();renderEnrichStats();renderVeille();renderReleaseState();}
}
function renderAdmin(){
  const c=el("users-table-container"),keys=Object.keys(usersData).sort((a,b)=>(usersData[b].date||0)-(usersData[a].date||0));
  if(!keys.length){c.innerHTML='<p class="muted" style="text-align:center">Aucun tiers</p>';return;}
  const L={pending:"⏳ Attente",accepted:"✅ Accepté",refused:"❌ Refusé",revoked:"🔒 Révoqué"};
  let h="<table><thead><tr><th>Prénom</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead><tbody>";
  keys.forEach(k=>{
    const u=usersData[k],st=u.status||"pending";let a="";
    if(st==="pending")a+='<button class="btn btn-sm btn-success" data-a="accept" data-k="'+k+'">✓</button><button class="btn btn-sm btn-danger" data-a="refuse" data-k="'+k+'">✗</button>';
    else if(st==="accepted")a+='<button class="btn btn-sm btn-danger" data-a="revoke" data-k="'+k+'">Révoquer</button>';
    else a+='<button class="btn btn-sm btn-success" data-a="accept" data-k="'+k+'">Réautoriser</button>';
    a+='<button class="btn btn-sm btn-secondary" data-a="delete" data-k="'+k+'">🗑️</button>';
    h+="<tr><td>"+esc(u.prenom)+'</td><td><span class="badge badge-'+st+'">'+(L[st]||st)+'</span></td><td class="meta">'+(u.date?new Date(u.date).toLocaleDateString("fr-FR"):"--")+"</td><td>"+a+"</td></tr>";
  });
  c.innerHTML=h+"</tbody></table>";
}
function bindAdminTable(){
  el("users-table-container").addEventListener("click",e=>{
    if(!guardAdmin())return;
    const b=e.target.closest("button[data-a]");if(!b)return;
    const k=b.dataset.k,a=b.dataset.a;
    if(a==="delete"){if(confirm("Supprimer ce tiers ?"))db.ref("access/users/"+k).remove();return;}
    dbUpd("access/users/"+k,{status:a==="accept"?"accepted":a==="refuse"?"refused":"revoked"});
  },{passive:true});
}
async function addUser(){
  if(!guardAdmin())return;
  const p=el("new-prenom").value.trim();if(p.length<2)return notify("Prénom invalide","error");
  await dbSet("access/users/user_"+p.toLowerCase().replace(/[^a-z0-9]+/g,"_"),{prenom:p,status:"accepted",device:"admin",date:Date.now()});
  el("new-prenom").value="";notify("✅ "+p+" autorisé");
}
function shareAPK(){
  if(!guardAdmin())return;
  const u=new URL("./index.html",location.href).href;
  if(navigator.share)navigator.share({title:"KEV FUSION 2026",text:"Installez l'application :",url:u}).catch(()=>{});
  else if(navigator.clipboard)navigator.clipboard.writeText(u).then(()=>notify("🔗 Lien copié"));
  else prompt("Lien :",u);
}

function fillBrandSelects(){
  ["nm-brand","is-brand","ex-brand"].forEach(id=>{
    const s=el(id);if(!s)return;const prev=s.value;s.innerHTML="";
    Object.entries(brandsData).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([k,b])=>s.innerHTML+='<option value="'+k+'">'+esc(b.name)+"</option>");
    if(prev)s.value=prev;
  });
  fillModelSelect();fillMotorSelectAdmin();
}
async function fillModelSelect(){
  const b=val("is-brand"),ms=await dbGet("data/models"),s=el("is-model");if(!s)return;
  s.innerHTML='<option value="">(tous modèles)</option>';
  Object.values(ms).filter(m=>m.brandId===b).sort((a,c)=>a.name.localeCompare(c.name)).forEach(m=>s.innerHTML+='<option value="'+esc(m.name)+'">'+esc(m.name)+"</option>");
}
async function fillMotorSelectAdmin(){
  const ms=await dbGet("data/models"),s=el("mo-model");if(!s)return;s.innerHTML="";
  Object.entries(ms).sort((a,b)=>(brandsData[a[1].brandId]?brandsData[a[1].brandId].name:"").localeCompare(brandsData[b[1].brandId]?brandsData[b[1].brandId].name:"")).forEach(([k,m])=>{
    const bn=brandsData[m.brandId]?brandsData[m.brandId].name:m.brandId;
    s.innerHTML+='<option value="'+k+'">'+esc(bn+" "+m.name)+"</option>";
  });
}
async function addBrand(){if(!guardAdmin())return;const n=el("nb-name").value.trim();if(!n)return notify("Nom requis","error");await dbSet("data/brands/"+n.toLowerCase().replace(/[^a-z0-9]+/g,"-"),{name:n,region:val("nb-region")});el("nb-name").value="";notify("✅ Marque ajoutée");}
async function addModel(){if(!guardAdmin())return;const b=val("nm-brand"),n=el("nm-name").value.trim();if(!b||!n)return notify("Infos requises","error");await dbSet("data/models/"+b+"_"+Date.now(),{brandId:b,name:n,years:el("nm-years").value.trim()||"2017-2027"});el("nm-name").value="";fillMotorSelectAdmin();notify("✅ Modèle ajouté");}
async function addMotor(){
  if(!guardAdmin())return;
  const mid=val("mo-model"),n=el("mo-name").value.trim();if(!mid||!n)return notify("Infos requises","error");
  const mo=(await db.ref("data/models/"+mid).once("value")).val();
  const cur=(await db.ref("data/motors/"+mid).once("value")).val()||[];
  cur.push(egFix(mo?mo.brandId:null,{name:n,fuel:val("mo-fuel"),power:el("mo-power").value.trim()||guessPower(n)}).m);
  await dbSet("data/motors/"+mid,cur);el("mo-name").value="";notify("✅ Motorisation ajoutée");
}
async function addIssue(){
  if(!guardAdmin())return;
  const t=el("is-title").value.trim();if(!t)return notify("Titre requis","error");
  await dbSet("data/issues/"+uid("is"),{brandId:val("is-brand"),model:val("is-model"),motor:"",title:t,detail:el("is-detail").value.trim(),source:val("is-source"),dtc:el("is-dtc").value.trim(),url:el("is-url").value.trim()});
  el("is-title").value="";el("is-detail").value="";notify("✅ Ajoutée");
}
async function addExpert(){
  if(!guardAdmin())return;
  const t=el("ex-title").value.trim();if(!t)return notify("Titre requis","error");
  await dbSet("data/expert/"+uid("ex"),{brandId:val("ex-brand"),model:el("ex-model").value.trim(),motor:el("ex-motor").value.trim(),type:el("ex-type").value.trim(),title:t,symptom:el("ex-symptom").value.trim(),diagnosis:el("ex-diag").value.trim(),parts:el("ex-parts").value.trim(),dtc:el("ex-dtc").value.trim(),years:el("ex-years").value.trim(),source:val("ex-source"),url:el("ex-url").value.trim()});
  el("ex-title").value="";el("ex-diag").value="";notify("🧠 Fiche ajoutée");
}
async function addDTC(){
  if(!guardAdmin())return;
  const c=el("dt-code").value.trim().toUpperCase(),d=el("dt-desc").value.trim();if(!c||!d)return notify("Code + description requis","error");
  await dbSet("data/dtc/"+c.replace(/[^A-Z0-9]+/g,"_"),{code:c,description:d,cause:el("dt-cause").value.trim(),solution:el("dt-sol").value.trim()});
  el("dt-code").value="";notify("✅ DTC ajouté");
}
async function importJSON(){
  if(!guardAdmin())return;
  const txt=el("import-json").value.trim();if(!txt)return notify("Collez un JSON","error");
  let arr;try{arr=JSON.parse(txt);}catch(e){return notify("❌ JSON invalide","error");}
  if(!Array.isArray(arr))arr=[arr];
  let n=0;
  for(const it of arr){
    if(it.type==="issue"&&it.brand&&it.title){await dbSet("data/issues/"+uid("im"),{brandId:it.brand,model:it.model||"",motor:it.motor||"",title:it.title,detail:it.detail||"",source:it.source||"Import admin",dtc:it.dtc||"",url:it.url||""});n++;}
    else if(it.type==="expert"&&it.brand&&it.title){await dbSet("data/expert/"+uid("im"),{brandId:it.brand,model:it.model||"",motor:it.motor||"",type:it.category||"",title:it.title,symptom:it.symptom||"",diagnosis:it.diagnosis||"",parts:it.parts||"",dtc:it.dtc||"",years:it.years||"",source:it.source||"Import admin",url:it.url||""});n++;}
    else if(it.type==="dtc"&&it.code){await dbSet("data/dtc/"+String(it.code).toUpperCase().replace(/[^A-Z0-9]+/g,"_"),{code:String(it.code).toUpperCase(),description:it.description||"",cause:it.cause||"",solution:it.solution||""});n++;}
  }
  el("import-json").value="";notify("✅ "+n+" fiches importées");
}
async function buildExport(){
  const[marques,modeles,motorisations,pannes,expert,dtc,version,release]=await Promise.all(["data/brands","data/models","data/motors","data/issues","data/expert","data/dtc","data/version","data/release"].map(dbGet));
  return{app:"KEV FUSION 2026",exportVersion:6,exportedAt:new Date().toISOString(),
    counts:{marques:Object.keys(marques).length,modeles:Object.keys(modeles).length,motorisations:Object.keys(motorisations).length,pannes:Object.keys(pannes).length,expert:Object.keys(expert).length,dtc:Object.keys(dtc).length,bulletins:BULLETINS.length},
    marques,modeles,motorisations,pannes,expert,dtc,bulletins:BULLETINS,version,release};
}
async function exportJSON(){
  if(!guardAdmin())return;
  notify("📤 Export…");
  try{
    const p=await buildExport(),blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),d=new Date();
    const a=document.createElement("a");a.href=url;a.download="kev-fusion-export-"+d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")+".json";
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
    notify("✅ Export : "+fmt(p.counts.modeles)+" modèles, "+fmt(p.counts.expert)+" fiches");
  }catch(e){notify("❌ "+e.message,"error");}
}
async function copyJSON(){if(!guardAdmin())return;try{const t=JSON.stringify(await buildExport(),null,2);await navigator.clipboard.writeText(t);notify("📋 Copié ("+fmt(t.length)+" car.)");}catch(e){notify("❌ Copie impossible","error");}}
async function restoreJSON(){
  if(!guardAdmin())return;
  const f=el("restore-file");if(!f||!f.files[0])return notify("Choisissez un fichier","error");
  notify("📥 Restauration…");
  try{
    const d=JSON.parse(await f.files[0].text());let n=0;
    for(const[k,v]of Object.entries(d.marques||{})){if(!(await db.ref("data/brands/"+k).once("value")).exists()){await dbSet("data/brands/"+k,v);n++;}}
    const ex=await dbGet("data/models"),byName={};Object.values(ex).forEach(m=>byName[m.brandId+"|"+String(m.name).toLowerCase()]=1);
    const idMap={};
    for(const[k,m]of Object.entries(d.modeles||{})){
      const key=m.brandId+"|"+String(m.name).toLowerCase();
      if(byName[key]){idMap[k]=Object.keys(ex).find(i=>ex[i].brandId===m.brandId&&String(ex[i].name).toLowerCase()===String(m.name).toLowerCase());continue;}
      const nid="r_"+k;await dbSet("data/models/"+nid,m);byName[key]=1;idMap[k]=nid;n++;
    }
    for(const[k,list]of Object.entries(d.motorisations||{})){
      const nid=idMap[k];if(!nid||!Array.isArray(list))continue;
      const cur=(await db.ref("data/motors/"+nid).once("value")).val()||[],have={};cur.forEach(x=>have[String(x.name).toLowerCase()]=1);
      let ch=false;list.forEach(x=>{if(!have[String(x.name).toLowerCase()]){cur.push(x);ch=true;}});
      if(ch){await dbSet("data/motors/"+nid,cur);n++;}
    }
    for(const key of["pannes","expert"]){
      const path=key==="pannes"?"data/issues":"data/expert";
      const cur=await dbGet(path),t={};Object.values(cur).forEach(x=>t[String(x.title).toLowerCase()]=1);
      for(const v of Object.values(d[key]||{})){if(t[String(v.title).toLowerCase()])continue;await dbSet(path+"/"+uid("rs"),v);n++;}
    }
    for(const[k,v]of Object.entries(d.dtc||{})){if(!(await db.ref("data/dtc/"+k).once("value")).exists()){await dbSet("data/dtc/"+k,v);n++;}}
    notify("✅ "+n+" éléments restaurés");
  }catch(e){notify("❌ "+e.message,"error");}
}

function slink(l,u){return '<a class="srclink" target="_blank" rel="noopener" href="'+u+'">'+l+"</a>";}
function sourceLinks(q){
  const e=encodeURIComponent(q),dom=BRAND_SITE[curBrand]||"",code=/^[pubc]\d{3,4}$/i.test(q.trim());
  let h='<div class="issue-card deep"><strong>🌐 Recherche multi-sources : « '+esc(q)+' »</strong><p class="linkwrap">';
  if(dom)h+=slink("🏭 Constructeur","https://www.google.com/search?q=site:"+dom+"+rappel+campagne+TSB+"+e);
  h+=slink("🇫🇷 Rappel Conso","https://www.google.com/search?q=site:rappel.conso.gouv.fr+"+e);
  h+=slink("🇫🇷 Site Rappel Conso","https://www.rappel.conso.gouv.fr/");
  h+=slink("🇪🇺 Safety Gate","https://ec.europa.eu/safety-gate-alerts/screen/webReport/searchAdvanced");
  h+=slink("🇪🇺 Recherche Safety Gate","https://www.google.com/search?q=site:ec.europa.eu+safety+gate+"+e);
  h+=slink("🇺🇸 NHTSA","https://www.nhtsa.gov/recalls");
  h+=slink("🇺🇸 Recherche NHTSA","https://www.google.com/search?q=site:nhtsa.gov+"+e);
  h+=slink("🇬🇧 GOV.UK","https://www.gov.uk/check-vehicle-recall");
  h+=slink("🇩🇪 KBA","https://www.kba.de/DE/Home/home_node.html");
  ["largus.fr","caradisiac.com","autoplus.fr","automoto.com","turbo.fr","motorlegend.com","que-choisir.org","60millions-mag.com","forum-auto.caradisiac.com","forums.futura-sciences.com"].forEach(d=>h+=slink("📰 "+d,"https://www.google.com/search?q=site:"+d+"+"+e));
  if(code){h+=slink("🔧 OBD-Codes","https://www.obd-codes.com/"+q.trim().toLowerCase());h+=slink("🔧 Signification","https://www.google.com/search?q="+e+"+code+defaut+signification");}
  h+=slink("🔎 Avis / pannes","https://www.google.com/search?q="+e+"+rappel+campagne+panne+probleme+avis");
  h+=slink("🔎 TSB","https://www.google.com/search?q="+e+"+TSB+bulletin+service+technique");
  return h+"</p></div>";
}
function srcLink(u){return u?'<p><a href="'+esc(u)+'" target="_blank" rel="noopener" class="srclink">🔗 Source officielle</a></p>':"";}
function univCard(u){return '<div class="issue-card camp"><strong>🌐 '+esc(u[0])+'</strong><span class="src">'+esc(u[3])+"</span><p>"+esc(u[1])+"</p>"+(u[2]?'<p class="dtcline">DTC : '+esc(u[2])+"</p>":"")+"</div>";}
function listCard(g){return '<div class="issue-card deep"><strong>🔬 '+esc(g[2])+'</strong><span class="src">'+esc(g[1])+'</span><span class="src">Systématique</span><p><b>⚠️ Symptômes :</b> '+esc(g[3])+"</p><p><b>🧪 Protocole :</b> "+esc(g[4])+"</p><p><b>🔩 Organes :</b> "+esc(g[5])+"</p>"+(g[6]?'<p class="dtcline">🔗 DTC : '+esc(g[6])+"</p>":"")+"</div>";}
function issueCard(i,p){return '<div class="issue-card"><strong>'+(p||"")+esc(i.title)+'</strong><span class="src">'+esc(i.source||"")+"</span>"+(i.motor?'<span class="src">'+esc(i.motor)+"</span>":"")+"<p>"+esc(i.detail||i.symptom||"")+"</p>"+(i.dtc?'<p class="dtcline">DTC : '+esc(i.dtc)+"</p>":"")+srcLink(i.url)+"</div>";}
function expertCard(e,p){
  const bn=brandsData[e.brandId]?brandsData[e.brandId].name:"";
  const sc=(e.score!=null)?'<span class="src src-score">◎ '+e.score+"</span>":"";
  const pr=e.priority?'<span class="src src-prio">★ priorité famille</span>':"";
  const der=e.derived?'<span class="src src-der">protocole dérivé</span>':"";
  return '<div class="issue-card '+(e.derived?"deep":"camp")+'"><strong>'+(p||"")+esc(e.title)+"</strong>"+sc+pr+der+'<span class="src">'+esc(e.source||"Expert")+"</span>"+(e.type?'<span class="src">🔬 '+esc(e.type)+"</span>":"")+(bn?'<span class="src">'+esc(bn)+"</span>":"")+(e.model?'<span class="src">'+esc(e.model)+"</span>":"")+(e.motor?'<span class="src">'+esc(e.motor)+"</span>":"")+
   (e.symptom?"<p><b>⚠️ Symptômes :</b> "+esc(e.symptom)+"</p>":"")+
   (e.diagnosis?"<p><b>🔬 Protocole :</b> "+esc(e.diagnosis)+"</p>":"")+
   (e.parts?"<p><b>🔩 Organes :</b> "+esc(e.parts)+"</p>":"")+
   (e.dtc?'<p class="dtcline">🔗 DTC : '+esc(e.dtc)+"</p>":"")+
   (e.years?'<p class="meta">Années : '+esc(e.years)+"</p>":"")+
   (e.derived?'<p class="meta">⚠️ Analyse dérivée — confirmer par source officielle.</p>':"")+srcLink(e.url)+"</div>";
}
function arrToExpert(e){return{brandId:e[0],motor:e[1],type:e[2],title:e[3],symptom:e[4],diagnosis:e[5],parts:e[6],dtc:e[7],source:e[8],years:e[9],model:""};}
function bulletinCard(b){
  const cls=b[5]==="CRITIQUE"?"badge-refused":b[5]==="ÉLEVÉE"?"badge-pending":"badge-accepted";
  return '<div class="issue-card deep"><strong>📄 '+esc(b[0])+" — "+esc(b[2])+'</strong><span class="badge '+cls+'">'+esc(b[5])+'</span><span class="src">'+esc(b[6])+'</span><p><b>Modèles :</b> '+esc(b[3])+"</p><p><b>Procédure :</b> "+esc(b[4])+"</p></div>";
}
function fuelCards(f){
  let h="";
  EV_LIST.forEach(g=>{if((g[0]==="E"&&f==="electrique")||(g[0]==="EH"&&(f==="electrique"||f==="hybride")))h+=listCard(g);});
  TH_LIST.forEach(g=>{if((g[0]==="GD"&&(f==="essence"||f==="diesel"))||(g[0]==="G"&&f==="essence")||(g[0]==="D"&&f==="diesel"))h+=listCard(g);});
  HY_LIST.forEach(g=>{if(g[0]==="H"&&f==="hybride")h+=listCard(g);});
  return h;
}

let eT=null;
function expertSearch(){clearTimeout(eT);eT=setTimeout(doExpertSearch,250);}
function qs(t){const i=el("expert-search");if(i)i.value=t;expertSearch();}
async function doExpertSearch(){
  const raw=val("expert-search").trim(),box=el("expert-results");
  if(raw.length<3){box.innerHTML="";return;}
  const terms=expandQuery(raw);
  const ex=await dbGet("data/expert"),iss=await dbGet("data/issues");
  const motor=curModelName&&val("sel-motor")!==""?motorsCache[val("sel-motor")]:null;
  const scored=Object.values(ex).filter(e=>hayMatches([e.title,e.type,e.symptom,e.diagnosis,e.parts,e.dtc,e.motor,e.model,e.keywords].join(" "),terms))
    .map(e=>Object.assign({},e,{score:scoreFiche(e,curModelName,motor)+(e.brandId===curBrand?30:0)}))
    .sort((a,b)=>b.score-a.score);
  const off=scored.filter(e=>!e.derived),der=scored.filter(e=>e.derived);
  let h='<p class="meta">🔎 '+terms.length+" termes · "+off.length+" fiche(s) expert · "+der.length+" protocole(s) dérivé(s) · tri par pertinence véhicule</p>";
  off.slice(0,25).forEach(e=>h+=expertCard(e,"🧠 "));
  Object.values(iss).filter(i=>hayMatches([i.title,i.detail,i.dtc,i.model].join(" "),terms)).slice(0,15).forEach(i=>h+=issueCard(i));
  EXPERT.filter(e=>hayMatches(e.slice(2,8).join(" "),terms)).slice(0,20).forEach(e=>h+=expertCard(arrToExpert(e),"🧠 "));
  BULLETINS.filter(b=>hayMatches(b.join(" "),terms)).forEach(b=>h+=bulletinCard(b));
  UNIV.filter(u=>hayMatches(u[0]+" "+u[1],terms)).forEach(u=>h+=univCard(u));
  EV_LIST.concat(TH_LIST,HY_LIST).filter(g=>hayMatches(g.slice(1,7).join(" "),terms)).forEach(g=>h+=listCard(g));
  der.slice(0,Math.min(40,MASS_LIMIT)).forEach(e=>h+=expertCard(e,""));
  h+=sourceLinks(raw);
  box.innerHTML=h;
}

async function buildBrandSelect(){
  brandsData=await dbGet("data/brands");
  const sel=el("sel-marque");if(!sel)return;
  const prev=sel.value;
  sel.innerHTML='<option value="">-- Choisir une marque --</option>';
  Object.entries(REGIONS).forEach(([r,label])=>{
    const items=Object.entries(brandsData).filter(([,b])=>b.region===r).sort((a,b)=>a[1].name.localeCompare(b[1].name));
    if(!items.length)return;
    sel.innerHTML+='<optgroup label="'+label+'">'+items.map(([k,b])=>'<option value="'+k+'">'+esc(b.name)+"</option>").join("")+"</optgroup>";
  });
  if(prev)sel.value=prev;
  const c=el("brand-count");if(c)c.textContent=fmt(Object.keys(brandsData).length)+" marques · "+fmt(Object.keys(await dbGet("data/models")).length)+" modèles";
}
async function enterApp(){
  const s=getSession();
  if(!isAdmin()&&(!s||s.status!=="accepted"))return notify("Accès non autorisé","error");
  showScreen("screen-app");lockUI();
  el("app-user").textContent=isAdmin()?"👑 Admin":s.prenom;
  if(isAdmin())await ensureCatalog(false);else await tierAutoSync(true);
  await buildBrandSelect();renderVeille();
}
function logoutApp(){showScreen(isAdmin()?"screen-admin":"screen-accepted");lockUI();}
async function loadModels(){
  curBrand=val("sel-marque");curModelId=null;curModelName=null;motorsCache=[];massResult=null;
  el("sel-model").innerHTML='<option value="">-- Modèle --</option>';
  el("sel-motor").innerHTML='<option value="">-- Motorisation --</option>';
  ["issues-box","expert-box","dtc-box","maint-box","tsb-box","mass-box"].forEach(i=>{const e=el(i);if(e)e.innerHTML='<p class="muted">Sélectionnez…</p>';});
  if(!curBrand)return;
  const ms=await dbGet("data/models");
  const list=Object.entries(ms).filter(([,m])=>m.brandId===curBrand).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  list.forEach(([k,m])=>{el("sel-model").innerHTML+='<option value="'+k+'">'+esc(m.name)+" ("+esc(m.years)+")</option>";});
  const c=el("model-count");if(c)c.textContent=list.length+" modèles";
}
async function loadMotors(){
  curModelId=val("sel-model");motorsCache=[];curModelName=null;massResult=null;
  el("sel-motor").innerHTML='<option value="">-- Motorisation --</option>';
  if(!curModelId){correlate();return;}
  const m=(await db.ref("data/models/"+curModelId).once("value")).val();
  curModelName=m?m.name:"";
  motorsCache=(await db.ref("data/motors/"+curModelId).once("value")).val()||[];
  motorsCache.forEach((mo,i)=>{el("sel-motor").innerHTML+='<option value="'+i+'">'+esc(mo.name)+" • "+(FUELS[mo.fuel]||mo.fuel)+(mo.power?" • "+esc(mo.power):"")+"</option>";});
  const c=el("motor-count");if(c)c.textContent=motorsCache.length+" motorisations / puissances";
  correlate();
}

async function massSearch(){
  const box=el("mass-box");
  if(!curBrand||!curModelName){notify("Sélectionnez marque + modèle","error");return;}
  const mi=val("sel-motor"),motor=mi!==""?motorsCache[mi]:null;
  if(!motor){notify("Sélectionnez une motorisation pour la corrélation","error");return;}
  if(box)box.innerHTML='<p class="muted perf-spin">Balayage des 52 axes techniques…</p>';
  const mo=(await db.ref("data/models/"+curModelId).once("value")).val();
  const corr=buildVehicleFiches(curBrand,curModelName,motor,mo?mo.years:"");
  const ex=Object.values(await dbGet("data/expert"));
  const base=ex.filter(e=>e.brandId===curBrand&&fuzzy(e.model,curModelName)&&motorMatch(e.motor,motor))
    .map(e=>Object.assign({},e,{score:scoreFiche(e,curModelName,motor)})).sort((a,b)=>b.score-a.score);
  const merged=base.concat(corr.list).slice(0,MASS_LIMIT);
  massResult=merged;
  const counts={};
  merged.forEach(f=>{const k=f.type||"Autres";counts[k]=(counts[k]||0)+1;});
  const groups=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  let h='<div class="issue-card deep"><strong>🔬 RECHERCHE MASSIVE CORRÉLÉE — '+esc(curModelName)+" "+esc(motor.name)+'</strong><p class="meta">'+fmt(merged.length)+" fiches · "+groups.length+" systèmes · énergie "+FUELS[motor.fuel]+"</p>";
  if(corr.reasons.length)h+='<p class="warnline">★ '+corr.reasons.map(esc).join(" · ")+"</p>";
  h+='<p class="linkwrap">'+groups.map(([k,v])=>'<span class="chip chip-stat">'+esc(k)+" <b>"+v+"</b></span>").join("")+"</p></div>";
  if(box)box.innerHTML=h;
  notify("🔬 "+fmt(merged.length)+" fiches corrélées");
}

async function correlate(){
  const box=el("issues-box"),ebox=el("expert-box"),dbox=el("dtc-box"),mbox=el("maint-box"),tbox=el("tsb-box");
  if(!curBrand||!curModelName){[box,ebox,dbox,mbox,tbox].forEach(b=>{if(b)b.innerHTML='<p class="muted">Sélectionnez un véhicule…</p>';});return;}
  const mi=val("sel-motor"),motor=mi!==""?motorsCache[mi]:null,fuel=motor?motor.fuel:null;
  const bn=brandsData[curBrand]?brandsData[curBrand].name:curBrand;

  const all=Object.values(await dbGet("data/issues")).filter(i=>i.brandId===curBrand&&fuzzy(i.model,curModelName));
  const spec=motor?all.filter(i=>i.motor&&motorMatch(i.motor,motor)):[];
  const gen=all.filter(i=>!spec.includes(i));
  let h="",hidden=0;
  spec.forEach(i=>h+=issueCard(i,"🎯 "));
  if(motor){gen.forEach(i=>{const f=fuelOf([i.title,i.detail,i.motor].join(" "));if(!f||compat(f,fuel))h+=issueCard(i);else hidden++;});}
  else gen.forEach(i=>h+=issueCard(i));
  CAMPAIGNS.filter(c=>c[0]===curBrand&&fuzzy(c[1],curModelName)&&(!c[2]||motorMatch(c[2],motor))).forEach(c=>{
    if(!all.some(a=>a.title===c[3]))h+=issueCard({title:c[3],detail:c[4],source:c[5],dtc:c[6],url:c[7],motor:c[2]},"📢 ");
  });
  if(hidden)h+='<p class="meta">🔎 '+hidden+" fiche(s) autres motorisations masquée(s) — filtre "+FUELS[fuel]+"</p>";
  if(fuel&&GENERIC[fuel])GENERIC[fuel].issues.forEach(g=>h+='<div class="issue-card"><strong>'+esc(g[0])+'</strong><span class="src">Typique '+FUELS[fuel]+"</span><p>"+esc(g[1])+'</p><p class="dtcline">DTC : '+esc(g[2])+"</p></div>");
  UNIV.forEach(u=>h+=univCard(u));
  h+=sourceLinks(bn+" "+curModelName+(motor?" "+motor.name:"")+" rappel panne TSB");
  box.innerHTML=h;

  const bl=BULLETINS.filter(b=>b[1]===curBrand||(b[3]&&curModelName&&b[3].toLowerCase().includes(String(curModelName).split(" ")[0].toLowerCase())));
  tbox.innerHTML=(bl.length?bl.map(bulletinCard).join(""):'<p class="muted">Aucun bulletin spécifique — voir recherche TSB.</p>')+
    '<div class="issue-card deep"><strong>📄 Veille bulletins</strong><p class="linkwrap">'+
    slink("🔎 TSB "+esc(bn),"https://www.google.com/search?q="+encodeURIComponent(bn+" "+curModelName)+"+TSB+technical+service+bulletin")+
    slink("🔎 NHTSA","https://www.nhtsa.gov/recalls")+
    slink("🔎 Constructeur","https://www.google.com/search?q=site:"+(BRAND_SITE[curBrand]||"")+"+bulletin+technique")+"</p></div>";

  const exAll=Object.values(await dbGet("data/expert"));
  const exHits=exAll.filter(e=>e.brandId===curBrand&&fuzzy(e.model,curModelName)&&motorMatch(e.motor,motor)&&(e.motor||titleOk(e.title+" "+(e.symptom||""),motor)))
    .map(e=>Object.assign({},e,{score:scoreFiche(e,curModelName,motor)})).sort((a,b)=>b.score-a.score);
  const exOff=exHits.filter(e=>!e.derived),exDer=exHits.filter(e=>e.derived);
  const bex=EXPERT.filter(e=>e[0]===curBrand&&kwMatch(e[1],motor)&&(e[1]||titleOk(e[2]+" "+e[3]+" "+e[4],motor)));
  let eh="";
  exOff.slice(0,30).forEach(e=>eh+=expertCard(e,"🧠 "));
  bex.forEach(e=>eh+=expertCard(arrToExpert(e),"🧠 "));
  if(fuel&&GENERIC_EXPERT[fuel])GENERIC_EXPERT[fuel].forEach(g=>eh+='<div class="issue-card deep"><strong>🔬 '+esc(g[0])+'</strong><span class="src">Ingénieur '+FUELS[fuel]+"</span><p><b>Symptômes :</b> "+esc(g[1])+"</p><p><b>Protocole :</b> "+esc(g[2])+"</p><p><b>Organes :</b> "+esc(g[3])+'</p><p class="dtcline">DTC : '+esc(g[4])+"</p></div>");
  eh+=fuelCards(fuel);
  if(motor){
    const corr=buildVehicleFiches(curBrand,curModelName,motor,"");
    if(corr.reasons.length)eh+='<p class="warnline">★ '+corr.reasons.map(esc).join(" · ")+"</p>";
    eh+='<hr class="sep"><h4 class="deepTitle">🔬 Protocoles corrélés à cette motorisation ('+corr.list.length+')</h4>';
    corr.list.slice(0,12).forEach(f=>eh+=expertCard(f,""));
    eh+='<p class="meta">➡️ Lancez la <b>recherche massive corrélée</b> pour les '+corr.list.length+" axes + toutes les fiches base.</p>";
    const q=val("expert-search")||"";
    let tech=null;
    for(const[t,kws]of Object.entries(TECH_MAP))if(kws.some(k=>q.toLowerCase().includes(k))){tech=t;break;}
    if(!tech)tech=fuel==="electrique"?"bms":fuel==="hybride"?"bms":fuel==="diesel"?"egr":"injection";
    if(TECH_PROTOCOL[tech]){
      eh+='<div class="issue-card deep"><strong>🤖 Analyse automatique — '+tech.toUpperCase()+'</strong><div class="deepbox"><b>🧪 Protocole :</b><br>'+esc(TECH_PROTOCOL[tech])+"<br><b>🔩 Organes clés :</b> "+esc(TECH_ORGANS[tech])+'<br><b>🔗 DTC :</b> <span class="dtcinline">'+esc(TECH_DTC[tech])+"</span></div></div>";
    }
  }
  if(exDer.length)eh+='<p class="meta">🧠 '+exDer.length+" protocole(s) dérivé(s) en base — visibles dans la recherche massive.</p>";
  ebox.innerHTML=eh;

  const codes=new Set(),add=s=>String(s||"").split(/[,\/\s]+/).forEach(c=>{if(/^[A-Z0-9]{4,}$/i.test(c))codes.add(c.toUpperCase());});
  all.forEach(i=>{const f=fuelOf([i.title,i.detail].join(" "));if(motor&&f&&!compat(f,fuel))return;add(i.dtc);});
  exHits.forEach(e=>add(e.dtc));bex.forEach(e=>add(e[7]));UNIV.forEach(u=>add(u[2]));
  if(fuel&&GENERIC[fuel])GENERIC[fuel].dtc.forEach(c=>codes.add(c));
  if(fuel&&GENERIC_EXPERT[fuel])GENERIC_EXPERT[fuel].forEach(g=>add(g[4]));
  EV_LIST.concat(TH_LIST,HY_LIST).forEach(g=>{if((g[0]==="E"&&fuel==="electrique")||(g[0]==="EH"&&(fuel==="electrique"||fuel==="hybride"))||(g[0]==="GD"&&(fuel==="essence"||fuel==="diesel"))||(g[0]==="G"&&fuel==="essence")||(g[0]==="D"&&fuel==="diesel")||(g[0]==="H"&&fuel==="hybride"))add(g[6]);});
  const D=await dbGet("data/dtc");let dh="";
  codes.forEach(c=>{
    const d=D[c]||D[c.replace(/[^A-Z0-9]+/g,"_")];
    dh+=d?'<div class="dtc-card"><strong>'+esc(d.code)+"</strong><p>"+esc(d.description)+"</p>"+(d.cause?"<p>🔍 "+esc(d.cause)+"</p>":"")+(d.solution?"<p>🔧 "+esc(d.solution)+"</p>":"")+slink("🔎 OBD","https://www.obd-codes.com/"+c.toLowerCase())+"</div>"
        :'<div class="dtc-card"><strong>'+esc(c)+'</strong><p>Code corrélé au véhicule.</p>'+slink("🔎 OBD","https://www.obd-codes.com/"+c.toLowerCase())+"</div>";
  });
  dbox.innerHTML=dh||'<p class="muted">—</p>';

  if(mbox){
    mbox.innerHTML=(typeof buildMaintenanceHTML==="function")?buildMaintenanceHTML(curBrand,curModelName,motor):'<p style="color:#ef4444">⚠️ Module maintenance absent.</p>';
    if(window.__maintToolsRefresh)window.__maintToolsRefresh();
  }
  try{
    const hist=JSON.parse(localStorage.getItem("autodiag_hist")||"[]");
    const e={date:new Date().toISOString(),marque:bn,modele:curModelName,motorisation:motor?motor.name:""};
    const l=hist[0];
    if(!l||l.marque!==e.marque||l.modele!==e.modele||l.motorisation!==e.motorisation){hist.unshift(e);localStorage.setItem("autodiag_hist",JSON.stringify(hist.slice(0,60)));}
  }catch(e){}
  renderVeille();
}
let dT=null;
function searchDTC(){clearTimeout(dT);dT=setTimeout(doSearchDTC,250);}
async function doSearchDTC(){
  const q=val("dtc-search").toUpperCase().trim(),c=el("dtc-results");
  if(q.length<2){c.innerHTML="";return;}
  const m=Object.values(await dbGet("data/dtc")).filter(d=>(d.code||"").toUpperCase().includes(q)||(d.description||"").toLowerCase().includes(q.toLowerCase()));
  let h=m.length?m.slice(0,15).map(d=>'<div class="dtc-card"><strong>'+esc(d.code)+"</strong><p>"+esc(d.description)+"</p>"+(d.cause?"<p>🔍 "+esc(d.cause)+"</p>":"")+(d.solution?"<p>🔧 "+esc(d.solution)+"</p>":"")+slink("🔎 OBD","https://www.obd-codes.com/"+String(d.code).toLowerCase())+"</div>").join(""):'<p class="muted">Aucun DTC en base.</p>';
  c.innerHTML=h+sourceLinks(q);
}

function toggleHistory(){
  const b=el("hist-box");if(!b)return;
  b.classList.toggle("hidden");if(b.classList.contains("hidden"))return;
  let h=[];try{h=JSON.parse(localStorage.getItem("autodiag_hist")||"[]");}catch(e){}
  b.innerHTML=h.length?h.map(x=>'<p class="meta">📅 '+new Date(x.date).toLocaleString("fr-FR")+" — <b>"+esc(x.marque)+" "+esc(x.modele)+"</b> "+esc(x.motorisation||"")+"</p>").join("")+'<button class="btn btn-danger btn-sm" onclick="clearHistory()">🗑️ Effacer</button>':'<p class="muted">Aucun historique.</p>';
}
function clearHistory(){localStorage.removeItem("autodiag_hist");const b=el("hist-box");if(b)b.innerHTML='<p class="muted">Aucun historique.</p>';}
function printReport(){
  const bn=brandsData[curBrand]?brandsData[curBrand].name:(curBrand||""),mi=val("sel-motor"),motor=mi!==""?motorsCache[mi]:null;
  const pr=el("print-report");
  pr.innerHTML="<h1>🚗 KEV FUSION 2026 — Rapport</h1><p>"+new Date().toLocaleString("fr-FR")+" • "+esc(deviceId())+"</p><p>Véhicule : <b>"+esc(bn)+" "+esc(curModelName||"")+"</b></p><p>Motorisation : <b>"+esc(motor?motor.name+" • "+(FUELS[motor.fuel]||"")+" • "+(motor.power||""):"—")+"</b></p><h2>⚠️ Pannes & campagnes</h2>"+(el("issues-box")?el("issues-box").innerHTML:"")+"<h2>📄 TSB</h2>"+(el("tsb-box")?el("tsb-box").innerHTML:"")+"<h2>🧠 Expert</h2>"+(el("expert-box")?el("expert-box").innerHTML:"")+(massResult?"<h2>🔬 Recherche massive ("+massResult.length+")</h2>"+(el("mass-box")?el("mass-box").innerHTML:""):"")+"<h2>🔧 DTC</h2>"+(el("dtc-box")?el("dtc-box").innerHTML:"")+"<h2>🧰 Entretien</h2>"+(el("maint-box")?el("maint-box").innerHTML:"");
  window.print();
}

function setupInstall(){
  addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;const b=el("install-btn");if(b)b.classList.remove("hidden");},{passive:true});
  addEventListener("appinstalled",()=>{const b=el("install-btn");if(b)b.classList.add("hidden");notify("🎉 Installée");},{passive:true});
}
async function installApp(){if(!deferredPrompt)return notify("Non disponible ici","error");deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;const b=el("install-btn");if(b)b.classList.add("hidden");}
