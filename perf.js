/* ═══════════════════════════════════════════════════════════════
   KEV FUSION 2026 — PERF v25
   Optimisations runtime : cache Firebase, lectures groupées,
   rendu chunké, mémoïsation, debounce, mode économie.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(typeof window==="undefined")return;

  /* ── utilitaires ── */
  function el(i){return document.getElementById(i);}
  function val(i){var e=el(i);return e?e.value:"";}
  function scheduleIdle(fn,ms){
    if("requestIdleCallback" in window)requestIdleCallback(fn,{timeout:ms||1500});
    else setTimeout(fn,80);
  }
  function sched(step){
    if(document.body&&document.body.classList.contains("perf-low"))setTimeout(step,0);
    else requestAnimationFrame(step);
  }

  /* ── 1. CSS de performance injecté ── */
  var PERF_CSS=[
    ".issue-card,.dtc-card{content-visibility:auto;contain-intrinsic-size:auto 170px}",
    ".card{contain:layout style}",
    ".chip,.srclink,.src,.badge,.pill{contain:layout style}",
    "*{-webkit-tap-highlight-color:transparent}",
    "body{touch-action:manipulation}",
    "select,input,textarea{transition:border-color .12s ease,box-shadow .12s ease}",
    ".bg3d-car{background-image:url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=55')!important}",
    ".perf-low #ecg,.perf-low #maint-tools,.perf-low .aurora,.perf-low .scanline,.perf-low .grain,.perf-low .bg3d-obd{display:none!important}",
    ".perf-low .card,.perf-low .topbar,.perf-low .issue-card{backdrop-filter:none;-webkit-backdrop-filter:none}",
    ".perf-low .bg3d-car{filter:none;opacity:.38}",
    ".perf-low .topbar-line,.perf-low .progress-bar{animation:none}",
    ".perf-spin::after{content:'';display:inline-block;width:12px;height:12px;margin-left:8px;border:2px solid #334155;border-top-color:#4ade80;border-radius:50%;animation:perfspin .7s linear infinite;vertical-align:-2px}",
    "@keyframes perfspin{to{transform:rotate(360deg)}}",
    "@media (prefers-reduced-motion:reduce){.aurora,.scanline,.topbar-line{animation:none!important}}"
  ].join("");
  function injectCSS(){
    var s=document.createElement("style");
    s.id="perf-css";s.textContent=PERF_CSS;
    document.head.appendChild(s);
  }

  /* ── 2. Préconnexions + préchargement ── */
  function preconnect(host){
    var l=document.createElement("link");
    l.rel="preconnect";l.href=host;l.crossOrigin="";
    document.head.appendChild(l);
  }
  function dnsPrefetch(host){
    var l=document.createElement("link");
    l.rel="dns-prefetch";l.href=host;
    document.head.appendChild(l);
  }
  function setupNetworkHints(){
    preconnect("https://www.gstatic.com");
    preconnect("https://images.unsplash.com");
    dnsPrefetch("https://www.rappel.conso.gouv.fr");
    dnsPrefetch("https://ec.europa.eu");
    dnsPrefetch("https://www.nhtsa.gov");
    try{
      if(typeof firebaseConfig!=="undefined"&&firebaseConfig.databaseURL){
        var u=new URL(firebaseConfig.databaseURL);
        preconnect(u.origin);
        dnsPrefetch("https://"+u.hostname);
      }
      if(typeof firebaseConfig!=="undefined"&&firebaseConfig.authDomain)preconnect("https://"+firebaseConfig.authDomain);
    }catch(e){}
  }

  /* ── 3. Mode économie (saveData / réseau lent / CPU faible / batterie) ── */
  var perfLow=false;
  function applyPerfLow(){
    if(perfLow)return;
    perfLow=true;
    document.body.classList.add("perf-low");
    throttleRAF();
  }
  function detectPerfLow(){
    var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(c&&(c.saveData===true||/(^|-)2g$/.test(c.effectiveType||""))){applyPerfLow();return;}
    if((navigator.hardwareConcurrency||8)<=2){applyPerfLow();return;}
    if(navigator.deviceMemory&&navigator.deviceMemory<=2){applyPerfLow();return;}
    if(navigator.getBattery){
      navigator.getBattery().then(function(b){
        if(b.level<0.18&&!b.charging)applyPerfLow();
        b.addEventListener&&b.addEventListener("levelchange",function(){if(b.level<0.18&&!b.charging)applyPerfLow();});
      }).catch(function(){});
    }
  }
  var rafThrottled=false;
  function throttleRAF(){
    if(rafThrottled)return;
    rafThrottled=true;
    var raw=window.requestAnimationFrame,last=0;
    window.requestAnimationFrame=function(cb){
      return raw(function(t){
        if(t-last<50){window.requestAnimationFrame(cb);return;}
        last=t;cb(t);
      });
    };
  }

  /* ── 4. Cache de lecture Firebase (TTL + invalidation) ── */
  var PC=new Map();
  function ttlFor(path){
    if(path==="data/version")return 10000;
    if(path.indexOf("data/models")===0||path.indexOf("data/motors")===0||path.indexOf("data/brands")===0)return 60000;
    if(path.indexOf("data/issues")===0||path.indexOf("data/expert")===0||path.indexOf("data/dtc")===0)return 30000;
    return 20000;
  }
  function invalidate(path){
    PC.delete(path);
    var p=path;
    while(p.indexOf("/")!==-1){p=p.slice(0,p.lastIndexOf("/"));PC.delete(p);}
  }
  var rawDbGet=window.dbGet,rawDbSet=window.dbSet,rawDbUpd=window.dbUpd;

  if(typeof rawDbGet==="function"){
    window.dbGet=function(path){
      var now=performance.now();
      var e=PC.get(path);
      if(e){
        if(e.v!==undefined&&now-e.t<ttlFor(path))return Promise.resolve(e.v);
        if(e.p)return e.p;
      }
      var pr=rawDbGet(path).then(function(v){
        PC.set(path,{t:performance.now(),v:v});
        return v;
      },function(err){
        var o=PC.get(path);
        if(o&&o.v!==undefined)return o.v;
        throw err;
      });
      PC.set(path,{t:now,p:pr});
      return pr;
    };
  }
  if(typeof rawDbSet==="function"){
    window.dbSet=function(path,v){invalidate(path);return rawDbSet(path,v);};
  }
  if(typeof rawDbUpd==="function"){
    window.dbUpd=function(path,v){invalidate(path);return rawDbUpd(path,v);};
  }
  function warm(){
    if(typeof window.dbGet!=="function")return Promise.resolve();
    return Promise.all([
      window.dbGet("data/brands"),window.dbGet("data/models"),
      window.dbGet("data/issues"),window.dbGet("data/expert"),window.dbGet("data/dtc")
    ]).catch(function(){});
  }
  addEventListener("online",function(){PC.clear();scheduleIdle(warm,300);});
  document.addEventListener("visibilitychange",function(){if(!document.hidden)scheduleIdle(warm,600);});

  /* ── 5. Sélecteurs : lectures groupées + cache ── */
  if(typeof window.loadModels==="function"){
    window.loadModels=async function(){
      curBrand=val("sel-marque");curModelId=null;curModelName=null;motorsCache=[];
      var sm=el("sel-model"),so=el("sel-motor");
      if(sm)sm.innerHTML='<option value="">-- Modèle --</option>';
      if(so)so.innerHTML='<option value="">-- Motorisation --</option>';
      ["issues-box","expert-box","dtc-box","maint-box","tsb-box","mass-box"].forEach(function(i){
        var e=el(i);if(e)e.innerHTML='<p class="muted">Sélectionnez…</p>';
      });
      if(!curBrand)return;
      var ms=await window.dbGet("data/models");
      var html='<option value="">-- Modèle --</option>';
      Object.entries(ms).filter(function(a){return a[1].brandId===curBrand;})
        .sort(function(a,b){return a[1].name.localeCompare(b[1].name);})
        .forEach(function(a){html+='<option value="'+a[0]+'">'+esc(a[1].name)+" ("+esc(a[1].years)+")</option>";});
      if(sm)sm.innerHTML=html;
      var c=el("model-count");
      if(c)c.textContent=Object.keys(ms).filter(function(k){return ms[k].brandId===curBrand;}).length+" modèles";
    };
  }
  if(typeof window.loadMotors==="function"){
    window.loadMotors=async function(){
      curModelId=val("sel-model");motorsCache=[];curModelName=null;
      var so=el("sel-motor");
      if(so)so.innerHTML='<option value="">-- Motorisation --</option>';
      if(!curModelId){correlate();return;}
      var res=await Promise.all([window.dbGet("data/models/"+curModelId),window.dbGet("data/motors/"+curModelId)]);
      curModelName=res[0]?res[0].name:"";
      motorsCache=Array.isArray(res[1])?res[1]:[];
      var html='<option value="">-- Motorisation --</option>';
      motorsCache.forEach(function(mo,i){
        html+='<option value="'+i+'">'+esc(mo.name)+" • "+(FUELS[mo.fuel]||mo.fuel)+(mo.power?" • "+esc(mo.power):"")+"</option>";
      });
      if(so)so.innerHTML=html;
      var c=el("motor-count");if(c)c.textContent=motorsCache.length+" motorisations / puissances";
      correlate();
    };
  }

  /* ── 6. Mémoïsation familyAxes ── */
  if(typeof window.familyAxes==="function"){
    var famMemo=new Map(),rawFam=window.familyAxes;
    window.familyAxes=function(n){
      var k=String(n||"").toLowerCase();
      var v=famMemo.get(k);
      if(v===undefined){v=rawFam(n);if(famMemo.size>4000)famMemo.clear();famMemo.set(k,v);}
      return v;
    };
  }

  /* ── 7. Corrélation mémoïsée : rendu instantané puis refresh ── */
  var BOXES=["issues-box","tsb-box","expert-box","dtc-box","maint-box"];
  var corrMemo=new Map();
  function captureCorr(key){
    var o={};
    BOXES.forEach(function(b){var e=el(b);if(e)o[b]=e.innerHTML;});
    corrMemo.set(key,o);
    if(corrMemo.size>40)corrMemo.delete(corrMemo.keys().next().value);
  }
  function applyCorr(o){
    BOXES.forEach(function(b){var e=el(b);if(e&&o[b]!==undefined)e.innerHTML=o[b];});
    if(window.__maintToolsRefresh)window.__maintToolsRefresh();
  }
  if(typeof window.correlate==="function"){
    var rawCorr=window.correlate;
    window.correlate=async function(){
      var key=curBrand+"|"+curModelId+"|"+val("sel-motor");
      var hit=corrMemo.get(key);
      if(hit){
        applyCorr(hit);
        scheduleIdle(async function(){await rawCorr();captureCorr(key);},900);
        return;
      }
      await rawCorr();
      captureCorr(key);
    };
  }

  /* ── 8. Debounce + garde "un seul en vol" pour les recherches ── */
  if(typeof window.doExpertSearch==="function"&&typeof window.doSearchDTC==="function"){
    var rawDoExpert=window.doExpertSearch,rawDoDTC=window.doSearchDTC;
    var esT=null,dsT=null,esFly=false,esPend=false,dsFly=false,dsPend=false;
    function pumpExpert(){if(esFly)return;esFly=true;(async function(){while(esPend){esPend=false;await rawDoExpert();}esFly=false;})();}
    function pumpDtc(){if(dsFly)return;dsFly=true;(async function(){while(dsPend){dsPend=false;await rawDoDTC();}dsFly=false;})();}
    window.expertSearch=function(){clearTimeout(esT);esT=setTimeout(function(){esPend=true;pumpExpert();},150);};
    window.searchDTC=function(){clearTimeout(dsT);dsT=setTimeout(function(){dsPend=true;pumpDtc();},150);};
  }

  /* ── 9. Recherche massive : calcul synchrone + rendu chunké ── */
  if(typeof window.buildVehicleFiches==="function"&&typeof window.massSearch==="function"){
    window.massSearch=async function(){
      var box=el("mass-box");
      if(!curBrand||!curModelName){notify("Sélectionnez marque + modèle","error");return;}
      var mi=val("sel-motor");
      var motor=mi!==""?motorsCache[mi]:null;
      if(!motor){notify("Sélectionnez une motorisation pour la corrélation","error");return;}
      if(box)box.innerHTML='<p class="muted perf-spin">Balayage des 52 axes techniques…</p>';
      var t0=performance.now();
      var mo=await window.dbGet("data/models/"+curModelId);
      var corr=buildVehicleFiches(curBrand,curModelName,motor,mo?mo.years:"");
      var ex=Object.values(await window.dbGet("data/expert"));
      var base=ex.filter(function(e){return e.brandId===curBrand&&fuzzy(e.model,curModelName)&&motorMatch(e.motor,motor);})
        .map(function(e){var o=Object.assign({},e);o.score=scoreFiche(e,curModelName,motor);return o;})
        .sort(function(a,b){return b.score-a.score;});
      var merged=base.concat(corr.list).slice(0,MASS_LIMIT);
      massResult=merged;
      var calcMs=Math.round(performance.now()-t0);

      var counts={};
      merged.forEach(function(f){var k=f.type||"Autres";counts[k]=(counts[k]||0)+1;});
      var groups=Object.entries(counts).sort(function(a,b){return b[1]-a[1];});

      var head='<div class="issue-card deep"><strong>🔬 RECHERCHE MASSIVE CORRÉLÉE — '+esc(curModelName)+" "+esc(motor.name)+"</strong>"+
        '<p class="meta">⚡ '+fmt(merged.length)+" fiches · "+groups.length+" systèmes · calcul "+calcMs+" ms · énergie "+FUELS[motor.fuel]+"</p>";
      if(corr.reasons.length)head+='<p class="warnline">★ '+corr.reasons.map(esc).join(" · ")+"</p>";
      head+='<p class="linkwrap">'+groups.map(function(g){return '<span class="chip chip-stat">'+esc(g[0])+" <b>"+g[1]+"</b></span>";}).join("")+"</p></div>";
      if(box)box.innerHTML=head;else return;

      var holder=document.createElement("div");box.appendChild(holder);
      var bar=document.createElement("div");bar.className="progress";
      bar.innerHTML='<div class="progress-bar" style="width:0"></div>';box.appendChild(bar);
      var pbar=bar.firstElementChild;

      var i=0,CH=60;
      await new Promise(function(res){
        function step(){
          var slice=merged.slice(i,i+CH);i+=CH;
          var wrap=document.createElement("div");
          wrap.innerHTML=slice.map(function(f){return expertCard(f,"");}).join("");
          var frag=document.createDocumentFragment();
          while(wrap.firstChild)frag.appendChild(wrap.firstChild);
          holder.appendChild(frag);
          if(pbar)pbar.style.width=Math.round((i/Math.max(1,merged.length))*100)+"%";
          if(i<merged.length)sched(step);else res();
        }
        sched(step);
      });
      bar.remove();
      var bn=brandsData[curBrand]?brandsData[curBrand].name:curBrand;
      box.insertAdjacentHTML("beforeend",sourceLinks(bn+" "+curModelName+" "+motor.name+" panne rappel TSB"));
      notify("🔬 "+fmt(merged.length)+" fiches corrélées en "+calcMs+" ms");
    };
  }

  /* ── 10. Différer les tâches non critiques ── */
  if(typeof window.selfTest==="function"){
    var rawSelf=window.selfTest;
    window.selfTest=function(q){
      return new Promise(function(r){scheduleIdle(async function(){r(await rawSelf(q));},600);});
    };
  }
  if(typeof window.enterApp==="function"){
    var rawEnter=window.enterApp;
    window.enterApp=async function(){
      var r=await rawEnter.apply(this,arguments);
      scheduleIdle(warm,200);
      return r;
    };
  }

  /* ── 11. Boot ── */
  function boot(){
    injectCSS();
    setupNetworkHints();
    detectPerfLow();
    scheduleIdle(warm,400);
    setTimeout(function(){scheduleIdle(warm,800);},2500);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();
