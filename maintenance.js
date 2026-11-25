/* ============================================================
   KEV FUSION 2026 — MAINTENANCE v21
   Plan d'entretien par véhicule + clé plate & burette animées
   ============================================================ */
function maintSpec(b){ return MAINT_SPEC[b] || MAINT_DEFAULT; }

function buildMaintenanceHTML(brandId, modelName, motor){
  if(!motor) return '<p class="muted">Sélectionnez une motorisation pour générer le plan d\'entretien précis du véhicule.</p>';
  const S = maintSpec(brandId), fuel = motor.fuel;
  const bn = (typeof brandsData!=="undefined" && brandsData[brandId]) ? brandsData[brandId].name : brandId;
  const isEV = fuel==="electrique", isHY = fuel==="hybride", isD = fuel==="diesel", isE = fuel==="essence";
  const rows=[]; const add=(c,i,v,n)=>rows.push([c,i,v,n]);
  const km = n => n.toLocaleString("fr-FR");

  if(isEV){
    add("🛢️","Huile de réducteur",S.gear,"Contrôle niveau + fuites à chaque passage. Fluide homologué constructeur uniquement, jamais d'ATF générique.");
    add("🛢️","Vidange moteur","Sans objet","Aucun moteur thermique : ni vidange moteur, ni filtre à huile, ni filtre à carburant, ni bougies.");
  }else{
    add("🛢️","Vidange huile + filtre à huile", S.oilKm ? (km(S.oilKm)+" km ou "+S.oilY+" an"+(S.oilY>1?"s":"")) : "Selon carnet constructeur",
      "Usage sévère (urbain, courts trajets, remorquage, froid, VTC/taxi, utilitaire chargé) : "+(S.sevKm?km(S.sevKm)+" km / "+S.sevY+" an":"intervalles réduits")+". Capacité indicative : "+S.cap+". Norme : "+S.oil);
    add("🛢️","Niveau d'huile","À chaque plein (ou 1 000 km)","Contrôle à chaud, véhicule à plat, 5 min après arrêt. Consommation > 0,5 L/1 000 km = alerte moteur (segments/PCV).");
    if(isD) add("🧰","Filtre à carburant + purge eau","30 000 – 60 000 km ou 2–3 ans","Purge du séparateur d'eau impérative. Gazole de qualité incertaine : intervalle réduit à 20 000 km. Risque direct sur pompe HP et injecteurs.");
    add("🧰","Filtre à air","40 000 – 60 000 km ou 3–4 ans","Soufflette interdite si encrassement huileux. Environnement poussiéreux/chantier : 20 000 km.");
  }
  add("🧰","Filtre d'habitacle","1 an ou 15 000 – 20 000 km","Charbon actif recommandé. Désinfection évaporateur + circuit climatisation annuelle (odeurs, allergènes).");

  if(isEV) add("⛓️","Distribution","Sans objet","Moteur électrique : aucune courroie ni chaîne de distribution.");
  else add("⛓️","Distribution",S.belt,"Courroie : kit complet (courroie + galets + tensionneur) + pompe à eau + joints spi systématiquement. Chaîne : contrôle acoustique à froid + analyse d'huile ; claquement = intervention immédiate.");
  if(!isEV) add("⛓️","Courroie d'accessoires","60 000 – 120 000 km ou 5–6 ans","Galets et tensionneur remplacés conjointement. Fissures, effilochage ou bruit = remplacement immédiat. Hybrides HSD / e-POWER : souvent absente.");
  if(isE||isHY) add("🧰","Bougies d'allumage",S.plugs,"Nickel 40–60 000 km ; iridium/platine 90–100 000 km. Écartement et couple de serrage constructeur impératifs (culasse aluminium).");
  add("⚙️","Boîte de vitesses",S.gear,"Manuelle : contrôle niveau/fuite. DCT/DSG humide : vidange obligatoire à l'intervalle indiqué. Convertisseur : vidange recommandée même si « à vie » constructeur.");
  if(isD) add("⚙️","Embrayage / volant bi-masse","Contrôle 120 000 km","Jeu du volant, broutage, point de patinage. Utilitaires chargés : usure accélérée.");

  add("🛑","Liquide de frein","2 ans (ou 40 000 km)","DOT4 / DOT4 LV selon spec. Testeur d'humidité : remplacement si > 3 %. Point d'ébullition mesuré > 180 °C (sec). Sécurité critique.");
  add("🛑","Plaquettes AV / AR","Contrôle tous les 20 000 – 30 000 km","Épaisseur garniture : mini légal 3 mm, remplacement conseillé à 4 mm. Témoin d'usure et capteur contrôlés. Remplacement par essieu complet.");
  add("🛑","Disques AV / AR","Contrôle 60 000 – 100 000 km","Épaisseur mini gravée sur le disque. Voile < 0,05 mm au comparateur. Bord externe > 1 mm = remplacement. Nettoyage du moyeu obligatoire.");
  if(isEV||isHY) add("🛑","Dégrippage freins (spécifique électrifié)","2 ans ou 40 000 km","La régénération sollicite peu les freins → corrosion et grippage des étriers AR. Démontage, nettoyage des coulisses, graissage pistons et colonnettes.");
  add("🛑","Frein de stationnement","Contrôle annuel","Électrique : test moteur d'étrier + recalibration. À câble : réglage et graissage.");
  add("🛑","Flexibles et durites de frein","Contrôle annuel","Fissures, suintement, corrosion des sertissages. Remplacement par paire si doute.");

  add("❄️","Liquide de refroidissement",S.cool,"Point de congélation ≤ −35 °C au réfractomètre. Spec constructeur exclusive, jamais de mélange de technologies (OAT / Si-OAT / hybride).");
  if(isEV||isHY) add("❄️","Boucle thermique batterie + onduleur","4–5 ans ou 100 000 – 150 000 km","Fluide à faible conductivité imposé par le constructeur. Un LDR classique provoque un défaut d'isolement HV.");
  if(!isEV) add("❄️","Pompe à eau / thermostat","Contrôle 100 000 – 150 000 km","Fuite au trou de purge, bruit de roulement, P0128 (thermostat bloqué ouvert) = remplacement.");
  if(!isEV) add("❄️","Radiateur / ventilateur / durites","Contrôle annuel","Encrassement externe, ailettes pliées, déclenchement ventilateur, durites gonflées ou craquelées.");

  add("🔋","Batterie 12V : SOH + tension","Test 2×/an — remplacement 4–5 ans","SOH < 70 % ou tension < 12,4 V à froid = remplacement. AGM/EFB obligatoire si start&stop. Codage BMS après remplacement.");
  if(isEV||isHY){
    add("🔋","Batterie haute tension : SOH certifié","1 an ou 20 000 km","Rapport SOH archivé (condition de garantie, seuil usuel 70 %). Delta cellules < 60 mV. Équilibrage par charge lente complète si écart.");
    add("🔋","Isolement HV","1 an","Mesure mégohmmètre : > 1 MΩ requis. Identification de la branche défaillante avant toute intervention. Habilitation électrique obligatoire.");
    add("🔋","Contacteurs / relais HV","Contrôle 1 an","Test de collage et résistance. Défaut après charge rapide répétée = remplacement du pack relais. Contrôle pyro-fusible.");
    add("🔋","OBC / ICCU / connecteur de charge","Thermographie annuelle","Échauffement des broches, verrouillage, câble mode 2, résistances CP/PP. MAJ logicielles de charge obligatoires (campagnes).");
    add("🔋","Ventilateur / filtre batterie (hybride)","Nettoyage annuel","Obstruction fréquente (poussières, poils). Surchauffe pack → limitation de puissance.");
  }
  if(!isEV) add("🔋","Alternateur / démarreur (ou alterno-démarreur 48V)","Contrôle annuel","Tension de charge 13,8–14,6 V. Réseau 48V : contrôle batterie dédiée et alterno-démarreur (campagnes connues). Courroie renforcée.");

  if(isD){
    add("🧠","FAP : différentiel de pression et cendres","Contrôle 60 000 km","Régénération forcée si colmatage partiel. Taux de cendres > seuil = nettoyage spécialisé ou remplacement.");
    add("🧠","Vanne EGR + refroidisseur","Inspection 80 000 – 120 000 km","Nettoyage si encrassement. Fuite LDR du refroidisseur = remplacement immédiat (risque de casse moteur / incendie).");
    add("🧠","Système AdBlue / SCR","Appoint 8 000 – 12 000 km · contrôle 100 000 km","Qualité ISO 22241. Cristallisation injecteur, pompe, capteurs NOx amont/aval. Réinitialisation des compteurs après réparation.");
    add("🧠","Injecteurs / pompe HP","Contrôle 100 000 – 150 000 km","Débits retour, pression rail, joints cuivre. Codage obligatoire après remplacement.");
  }
  if(isE||isHY){
    add("🧠","GPF / catalyseur","Contrôle 80 000 – 120 000 km","Contre-pression et sondes lambda. Courts trajets répétés = colmatage GPF.");
    add("🧠","Calamine admission (injection directe)","Endoscopie 80 000 – 120 000 km","Dépôts > 2 mm : décalaminage (hydrogène ou manuel). Ralenti instable et perte de puissance.");
  }
  if(!isEV) add("🧠","Turbo / suralimentation","Contrôle 100 000 – 150 000 km","Jeu axial/radial, fuite d'huile, durites et intercooler. Géométrie variable : course libre de l'actuateur.");
  add("🧠","Diagnostic calculateurs complet","À chaque entretien (1 an)","Lecture des défauts actifs ET mémorisés sur tous les calculateurs. Application des MAJ logicielles et campagnes constructeur (obligatoire pour la garantie).");
  add("🧠","ADAS : caméras / radar","Calibration après tout impact pare-brise","Calibration statique + dynamique. Pneus de dimensions homologuées, géométrie correcte, hauteur de caisse conforme.");
  add("🧠","Réseaux CAN / LIN / Ethernet","Contrôle annuel","Taux d'erreurs de trames, oxydation des connecteurs, masses et blindage. Défauts intermittents multiples = faisceau.");

  add("📅","Pneus : usure, pression, DOT","Contrôle 10 000 – 12 000 km","Sculpture légale 1,6 mm (recommandé 3 mm). Pression à froid mensuelle. Date DOT < 6 ans."+((isEV||isHY)?" EV : usure accélérée (couple + masse), permutation tous les 10 000 km, indice de charge renforcé (HL) obligatoire.":""));
  add("📅","Géométrie / liaisons au sol","1 an ou 20 000 km","Rotules, silentblocs, biellettes, amortisseurs (test de rebond). Géométrie si usure asymétrique, choc ou tirage.");
  add("📅","Amortisseurs / ressorts","Contrôle 80 000 – 120 000 km","Fuite d'huile, efficacité, corrosion des ressorts. Utilitaires chargés : contrôle renforcé des ressorts AR (campagnes de rupture connues).");
  add("📅","Éclairage / visibilité","Contrôle annuel","Réglage des optiques, balais, lave-glace, dégivrage. Caméra de recul : propreté et étanchéité.");
  add("📅","Climatisation","Entretien annuel","Recharge si perte > 10 %/an. Filtre déshydratant / dessicant : 3–6 ans (pompe à chaleur EV : efficacité chauffage hiver).");
  add("📅","Soubassement / corrosion","Contrôle annuel","Utilitaires et régions salées : protection, points de levage, échappement, durites de frein, berceau.");
  add("📅","Courroies / durites / fuites","Inspection visuelle annuelle","Toutes courroies accessoires, durites LDR/carburant, suintements moteur et boîte, silentblocs d'échappement.");

  const cats=[["🛢️","Moteur / lubrification"],["🧰","Filtres & consommables"],["⛓️","Distribution & transmission"],["🛑","Freinage"],["❄️","Refroidissement"],["🔋","Batteries & haute tension"],["🧠","Dépollution, calculateurs & ADAS"],["📅","Liaisons au sol, pneus & périodiques"]];
  let html='<div class="issue-card deep maint-card"><strong>🧰 PLAN D\'ENTRETIEN — '+esc(bn)+" "+esc(modelName)+" • "+esc(motor.name)+(motor.power?" ("+esc(motor.power)+")":"")+" • "+FUELS[fuel]+'</strong>'+
    '<p class="meta" style="margin-top:6px">🛢️ '+esc(S.oil)+'</p>'+
    '<p class="warnline">⚠️ Intervalles = maxima constructeur. Usage sévère (urbain, courts trajets, remorquage, froid, taxi/VTC, utilitaire chargé) : appliquer systématiquement les intervalles réduits.</p>';
  cats.forEach(([c,label])=>{
    const rs=rows.filter(r=>r[0]===c); if(!rs.length) return;
    html+='<h4 class="maintCat">'+c+" "+label+"</h4>";
    rs.forEach(r=>{html+='<p class="maintRow"><strong>'+esc(r[1])+'</strong> — <span class="maintInt">'+esc(r[2])+'</span><br><span class="maintNote">'+esc(r[3])+"</span></p>";});
  });
  const notes=[];
  MAINT_MOTOR_RULES.forEach(([k,ns])=>{ if(String(motor.name).toLowerCase().includes(k)) ns.forEach(n=>notes.push(n)); });
  if(notes.length){
    html+='<h4 class="maintCat" style="color:#f59e0b">📌 Spécificités de cette motorisation</h4>';
    notes.forEach(n=>html+='<p class="maintNote" style="margin:3px 0">• '+esc(n)+"</p>");
  }
  html+='<h4 class="maintCat" style="color:#38bdf8">✅ Contrôles obligatoires à CHAQUE passage</h4><p class="maintNote">1) Diagnostic valise complet + MAJ/campagnes · 2) SOH batterie 12V (et HV si électrifié) · 3) Liquide de frein : humidité + ébullition · 4) LDR : point de congélation + niveau · 5) Freins : épaisseurs, voile, coulisses · 6) Pneus : usure, pression, DOT · 7) ADAS : calibration si intervention · 8) Couples de serrage roues · 9) Essai routier validé · 10) Rapport archivé (traçabilité garantie).</p></div>';
  return html;
}

/* ══════════════════════════════════════════════════════════
   FOND ANIMÉ DU PAVÉ MAINTENANCE : clé plate + burette d'huile
   ══════════════════════════════════════════════════════════ */
(function(){
  let raf=null, ctx=null, cv=null, W=0, H=0, dpr=1, t=0, drops=[], visible=true, ro=null, io=null;

  function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

  /* Clé plate (spanner) dessinée en vectoriel */
  function drawWrench(c,size,angle,alpha){
    c.save(); c.rotate(angle); c.globalAlpha=alpha;
    const L=size, th=size*0.17, jaw=size*0.30, gap=size*0.155;
    const g=c.createLinearGradient(-L/2,-th,L/2,th);
    g.addColorStop(0,"#7f8c9b"); g.addColorStop(.35,"#d7dee6"); g.addColorStop(.55,"#9aa6b4"); g.addColorStop(1,"#5d6875");
    c.fillStyle=g; c.strokeStyle="rgba(15,23,42,.55)"; c.lineWidth=size*0.018;
    /* manche */
    roundRect(c,-L*0.30,-th/2,L*0.60,th,th*0.45); c.fill(); c.stroke();
    /* tête gauche : ouverte en U */
    [-1,1].forEach(s=>{
      c.save(); c.translate(s*L*0.34,0); if(s<0) c.rotate(Math.PI);
      c.beginPath();
      c.moveTo(-jaw*0.30,-jaw*0.52);
      c.lineTo(jaw*0.55,-jaw*0.52);
      c.lineTo(jaw*0.55,-gap/2);
      c.lineTo(jaw*0.05,-gap/2);
      c.lineTo(jaw*0.05,gap/2);
      c.lineTo(jaw*0.55,gap/2);
      c.lineTo(jaw*0.55,jaw*0.52);
      c.lineTo(-jaw*0.30,jaw*0.52);
      c.closePath(); c.fillStyle=g; c.fill(); c.stroke();
      c.restore();
    });
    /* reflet */
    c.globalAlpha=alpha*0.55; c.fillStyle="rgba(255,255,255,.55)";
    roundRect(c,-L*0.26,-th*0.30,L*0.52,th*0.16,th*0.08); c.fill();
    /* gravure */
    c.globalAlpha=alpha*0.8; c.fillStyle="#38414d";
    c.font="700 "+(size*0.075)+"px monospace"; c.textAlign="center"; c.textBaseline="middle";
    c.fillText("17",0,0);
    c.restore();
  }

  /* Burette d'huile (oil can) */
  function drawOilCan(c,size,angle,alpha,pour){
    c.save(); c.rotate(angle); c.globalAlpha=alpha;
    const w=size*0.62,h=size*0.46;
    const g=c.createLinearGradient(-w/2,-h,w/2,h);
    g.addColorStop(0,"#b45309"); g.addColorStop(.35,"#f59e0b"); g.addColorStop(.6,"#fbbf24"); g.addColorStop(1,"#92400e");
    /* corps */
    c.beginPath();
    c.moveTo(-w/2,h*0.42);
    c.quadraticCurveTo(-w*0.58,-h*0.10,-w*0.24,-h*0.34);
    c.lineTo(w*0.20,-h*0.34);
    c.quadraticCurveTo(w*0.54,-h*0.12,w/2,h*0.42);
    c.closePath();
    c.fillStyle=g; c.fill();
    c.strokeStyle="rgba(15,23,42,.6)"; c.lineWidth=size*0.02; c.stroke();
    /* base */
    c.fillStyle="#78350f"; roundRect(c,-w/2,h*0.36,w,h*0.14,size*0.03); c.fill();
    /* bec */
    c.strokeStyle=g; c.lineWidth=size*0.055; c.lineCap="round";
    c.beginPath(); c.moveTo(w*0.14,-h*0.30);
    c.quadraticCurveTo(w*0.62,-h*0.86,w*0.98,-h*0.62); c.stroke();
    /* anse */
    c.lineWidth=size*0.045; c.strokeStyle="#b45309";
    c.beginPath(); c.arc(-w*0.34,-h*0.16,size*0.15,Math.PI*0.35,Math.PI*1.55); c.stroke();
    /* bouchon */
    c.fillStyle="#fde68a"; roundRect(c,-w*0.10,-h*0.50,w*0.20,h*0.18,size*0.02); c.fill();
    /* étiquette */
    c.globalAlpha=alpha*0.9; c.fillStyle="rgba(15,23,42,.75)";
    roundRect(c,-w*0.26,-h*0.06,w*0.46,h*0.30,size*0.02); c.fill();
    c.fillStyle="#fbbf24"; c.font="700 "+(size*0.10)+"px monospace"; c.textAlign="center"; c.textBaseline="middle";
    c.fillText("5W30",-w*0.03,h*0.09);
    /* goutte au bec */
    if(pour>0){
      c.globalAlpha=alpha*pour;
      c.fillStyle="#fbbf24";
      c.beginPath(); c.ellipse(w*1.00,-h*0.56,size*0.035,size*0.05,0,0,Math.PI*2); c.fill();
    }
    c.restore();
  }

  function spawnDrop(x,y){
    if(drops.length>60) return;
    drops.push({x:x,y:y,vy:0.25+Math.random()*0.35,r:(1.6+Math.random()*2.2)*dpr,a:0.75,life:0});
  }

  function frame(){
    if(!ctx){ raf=null; return; }
    ctx.clearRect(0,0,W,H);
    t+=0.006;

    /* trame technique discrète */
    ctx.strokeStyle="rgba(74,222,128,.045)"; ctx.lineWidth=dpr;
    const g=34*dpr; ctx.beginPath();
    for(let x=(t*26*dpr)%g;x<W;x+=g){ctx.moveTo(x,0);ctx.lineTo(x,H);}
    for(let y=0;y<H;y+=g){ctx.moveTo(0,y);ctx.lineTo(W,y);}
    ctx.stroke();

    const base=Math.min(W,H);
    const unit=Math.max(58*dpr, base*0.20);

    /* ── CLÉ PLATE : orbite large, rotation propre ── */
    const wx = W*0.5 + Math.cos(t*0.85)*W*0.34;
    const wy = H*0.30 + Math.sin(t*1.35)*H*0.17;
    ctx.save(); ctx.translate(wx,wy);
    ctx.shadowColor="rgba(0,0,0,.55)"; ctx.shadowBlur=14*dpr; ctx.shadowOffsetY=6*dpr;
    drawWrench(ctx, unit*1.55, t*1.25, .34);
    ctx.restore();

    /* ── BURETTE : trajectoire opposée, bascule de versement ── */
    const ox = W*0.5 - Math.cos(t*0.72+1.1)*W*0.33;
    const oy = H*0.66 + Math.sin(t*1.05+0.6)*H*0.16;
    const tilt = Math.sin(t*1.6)*0.42 - 0.12;
    const pour = Math.max(0, Math.sin(t*1.6-0.4));
    ctx.save(); ctx.translate(ox,oy);
    ctx.shadowColor="rgba(0,0,0,.55)"; ctx.shadowBlur=14*dpr; ctx.shadowOffsetY=6*dpr;
    drawOilCan(ctx, unit*1.30, tilt, .34, pour);
    ctx.restore();

    if(pour>0.72 && Math.random()<0.30){
      const bx = ox + Math.cos(tilt)*unit*1.30*0.98;
      const by = oy + Math.sin(tilt)*unit*1.30*0.98 - unit*0.30;
      spawnDrop(bx,by);
    }

    /* gouttes d'huile */
    for(let i=drops.length-1;i>=0;i--){
      const d=drops[i];
      d.vy+=0.055*dpr; d.y+=d.vy; d.life++;
      d.a=Math.max(0,0.7-d.life/150);
      if(d.y>H+10*dpr || d.a<=0){ drops.splice(i,1); continue; }
      ctx.globalAlpha=d.a*0.55; ctx.fillStyle="#fbbf24";
      ctx.beginPath(); ctx.ellipse(d.x,d.y,d.r*0.75,d.r*1.25,0,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=d.a*0.30; ctx.fillStyle="#fde68a";
      ctx.beginPath(); ctx.ellipse(d.x-d.r*0.2,d.y-d.r*0.35,d.r*0.25,d.r*0.4,0,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;

    raf = (visible && !document.hidden) ? requestAnimationFrame(frame) : null;
  }

  function start(){ if(!raf && ctx && visible && !document.hidden) raf=requestAnimationFrame(frame); }
  function stop(){ if(raf){ cancelAnimationFrame(raf); raf=null; } }

  function resize(){
    const wrap=document.getElementById("maint-wrap"); if(!wrap||!cv) return;
    const r=wrap.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=cv.width=Math.max(1,Math.round(r.width*dpr));
    H=cv.height=Math.max(1,Math.round(r.height*dpr));
    cv.style.width=r.width+"px"; cv.style.height=r.height+"px";
  }

  function init(){
    const wrap=document.getElementById("maint-wrap"); if(!wrap) return;
    cv=document.getElementById("maint-tools");
    if(!cv){ cv=document.createElement("canvas"); cv.id="maint-tools"; wrap.insertBefore(cv,wrap.firstChild); }
    ctx=cv.getContext("2d"); if(!ctx) return;
    resize();
    if(window.ResizeObserver){ ro=new ResizeObserver(()=>{resize();start();}); ro.observe(wrap); }
    else window.addEventListener("resize",resize);
    if(window.IntersectionObserver){
      io=new IntersectionObserver(es=>{ visible=es[0].isIntersecting; if(visible) start(); else stop(); },{threshold:0});
      io.observe(wrap);
    }
    document.addEventListener("visibilitychange",()=>{ document.hidden?stop():start(); });
    start();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  window.__maintToolsRefresh = ()=>{ resize(); start(); };
})();

/* ══════════ FOND ECG GLOBAL ══════════ */
(function(){
  function init(){
    if(document.getElementById("ecg")) return;
    const c=document.createElement("canvas"); c.id="ecg"; document.body.appendChild(c);
    const st=document.createElement("style");
    st.textContent="#ecg{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.45}";
    document.head.appendChild(st);
    const x=c.getContext("2d"); let W=0,H=0,d=1,off=0,raf=null;
    function rs(){d=Math.min(window.devicePixelRatio||1,2);W=c.width=Math.max(1,innerWidth*d);H=c.height=Math.max(1,innerHeight*d);c.style.width=innerWidth+"px";c.style.height=innerHeight+"px";}
    rs(); addEventListener("resize",rs);
    function w(p){
      if(p<.12)return 0; if(p<.20)return .12*Math.sin((p-.12)/.08*Math.PI);
      if(p<.26)return 0; if(p<.28)return -.10*((p-.26)/.02);
      if(p<.31)return -.10+1.10*((p-.28)/.03); if(p<.34)return 1-1.30*((p-.31)/.03);
      if(p<.37)return -.30+.30*((p-.34)/.03); if(p<.45)return 0;
      if(p<.60)return .25*Math.sin((p-.45)/.15*Math.PI); return 0;
    }
    function fr(){
      x.clearRect(0,0,W,H);
      x.strokeStyle="rgba(74,222,128,.05)"; x.lineWidth=d;
      const g=24*d; x.beginPath();
      for(let i=0;i<W;i+=g){x.moveTo(i,0);x.lineTo(i,H);}
      for(let j=0;j<H;j+=g){x.moveTo(0,j);x.lineTo(W,j);}
      x.stroke();
      [.22,.52,.84].forEach((L,i)=>{
        const bY=H*L,amp=H*.055,wl=Math.max(80,W/(3+i));
        x.beginPath();
        for(let px=0;px<=W;px+=2*d){
          const p=(((px+off*(1+i*.35))%wl)+wl)%wl/wl;
          const py=bY-w(p)*amp;
          px===0?x.moveTo(px,py):x.lineTo(px,py);
        }
        x.strokeStyle=i===1?"rgba(74,222,128,.55)":"rgba(56,189,248,.28)";
        x.lineWidth=(i===1?2:1.2)*d;
        x.shadowColor="rgba(74,222,128,.8)"; x.shadowBlur=(i===1?10:0)*d;
        x.stroke(); x.shadowBlur=0;
      });
      off+=2.2*d;
      raf=document.hidden?null:requestAnimationFrame(fr);
    }
    fr();
    document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&!raf) fr(); });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
