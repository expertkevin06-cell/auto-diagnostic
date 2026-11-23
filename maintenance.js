/* MAINTENANCE.JS v1 — Plan d'entretien ingénieur (extrême rigueur) + fond électrocardiogramme animé */

/* ===== NORMES HUILE PAR GROUPE ===== */
const MAINT_OIL = {
 psa: "Norme : ACEA C2 (essence) / C2-C3 (diesel) — TotalEnergies Quartz Ineo 0W-20/0W-30",
 renault: "Norme : RN17 (essence) / RN0720 (diesel FAP) — Elf Evolution 0W-20/5W-30, ACEA C3/C4",
 vag: "Norme : VW 508 00/509 00 (essence récents) / VW 507 00 (diesel FAP) — 0W-20/0W-30",
 bmw: "Norme : BMW Longlife-04 — 0W-30/5W-30",
 merc: "Norme : MB 229.51 / 229.52 — 0W-30/5W-30",
 ford: "Norme : Ford WSS-M2C950-A / 948-B — 0W-20/5W-30",
 toyota: "Norme : Toyota 0W-16/0W-20 GF-6",
 hyundai: "Norme : Hyundai/Kia 0W-20/5W-30 ACEA C2/C3",
 fiat: "Norme : Fiat 9.55535 (essence) / 9.55535-S3 (diesel) — 0W-20/5W-30",
 tesla: "Pas d'huile moteur — réducteur : fluide ATF homologué Tesla (contrôle niveau/fuite uniquement)",
 kr: "Norme : ACEA C2/C3 — 0W-20/5W-30",
 jp: "Norme : GF-6 / ACEA C2 — 0W-16/0W-20",
 cn: "Norme : ACEA C2/C3 ou spec constructeur — 0W-20",
 us: "Norme : dexos1 / spec constructeur — 0W-20/5W-30",
 prem: "Norme : C40/C20 spec constructeur — 0W-20/0W-40",
 other: "Norme : ACEA C2/C3 selon motorisation — 0W-20/5W-30"
};
function oilGroup(brandId) {
  const g = egGroup(brandId); return MAINT_OIL[g] || MAINT_OIL.other;
}

/* ===== NOTES SPÉCIFIQUES MARQUE ===== */
const MAINT_BRAND = {
 psa: ["PureTech : courroie humide — remplacement anticipé 6 ans/100 000 km en usage sévère (sinon 10 ans/160 000 km)", "BlueHDi : contrôle cristallisation injecteur AdBlue à 100 000 km", "Boîte EAT8 : vidange recommandée 100 000 km (non préconisée constructeur = usage sévère)"],
 renault: ["dCi : courroie distribution 6-10 ans / 120 000-160 000 km selon usage", "E-Tech : batterie 12V AGM — contrôle SOH annuel", "Boîte EDC : vidange 60 000-90 000 km recommandée en usage urbain"],
 vag: ["LongLife : 30 000 km/2 ans OU fixe 15 000 km/1 an (recommandé urbain)", "DSG DQ250 (humide) : vidange 60 000 km obligatoire ; DQ200 (sec) : contrôle 100 000 km", "TDI : contrôle capteurs NOx + pompe AdBlue à 100 000 km"],
 bmw: ["Huile : 25 000 km/2 ans maxi — recommandé 15 000 km/1 an en usage sévère", "Chaîne B47/N47 : contrôle acoustique + analyse huile à 100 000 km", "Boîte ZF8 : vidange 100 000-120 000 km recommandée"],
 merc: ["Assyst : suivre indicateur mais vidange ≤ 25 000 km/1 an", "48V : contrôle alterno-démarreur + batterie 48V à chaque entretien", "9G-Tronic : vidange 100 000 km recommandée"],
 toyota: ["Hybride : bougies iridium 100 000 km ; liquide onduleur 1ère fois 150 000 km puis 80 000 km", "Pas de courroie accessoire sur HSD (électrique)", "Contrôle SOH batterie hybride annuel (garantie 10 ans/1 000 000 km sous entretien)"],
 tesla: ["Filtre habitacle 2 ans (Model 3/Y) / 3 ans (S/X) ; HEPA 3 ans", "Liquide frein : test humidité tous les 4 ans (remplacement si >3%)", "Dessicant clim : 3-6 ans selon modèle ; rotation pneus 10 000-12 000 km"],
 hyundai: ["DCT7 : vidange 60 000-90 000 km recommandée", "ICCU : contrôle logiciel à chaque passage (campagnes)", "Kona EV : inspection batterie HV annuelle"],
 ford: ["PowerShift : contrôle adaptations + vidange TCM 60 000 km", "EcoBoost : bougies 40 000-60 000 km (calamine)", "Courroie humide : inspection visuelle à 60 000 km"],
 fiat: ["MultiJet : filtre à carburant 30 000-40 000 km (impératif)", "Uconnect : MAJ logicielle à chaque entretien"],
 volvo: ["48V : contrôle batterie 48V annuel", "EX30/EX40 : campagne BMS — vérification logicielle obligatoire"],
 porsche: ["PDK : vidange 60 000-90 000 km (usage sportif : 40 000 km)", "Taycan : contrôle isolement HV annuel"],
 landrover: ["Suspension pneumatique : test fuites annuel", "InControl : MAJ logicielle à chaque passage"],
 byd: ["LFP : charge lente complète mensuelle pour équilibrage", "BMS : contrôle delta cellules annuel"],
 mg: ["DC-DC : contrôle annuel (campagnes)", "12V : remplacement préventif 4 ans"]
};

/* ===== NOTES SPÉCIFIQUES MOTORISATION ===== */
const MAINT_MOTOR = [
 ["PureTech", ["Courroie distribution humide : 6 ans/100 000 km (sévère) ou 10 ans/160 000 km ; inspection visuelle carter à chaque vidange"]],
 ["BlueHDi", ["AdBlue : contrôle qualité/level à chaque entretien ; injecteur AdBlue inspection 100 000 km"]],
 ["dCi", ["EGR + refroidisseur : inspection 80 000-120 000 km ; FAP ΔP contrôle 60 000 km"]],
 ["TDI", ["FAP/AdBlue : contrôle capteurs NOx 100 000 km ; vanne EGR 120 000 km"]],
 ["E-Tech", ["Batterie 12V AGM : SOH annuel ; onduleur : contrôle LDR annuel"]],
 ["Hybrid", ["Batterie traction : SOH annuel (garantie) ; liquide onduleur 5 ans/100 000 km"]],
 ["PHEV", ["Double entretien : thermique (huile) + HV (SOH annuel) ; câble charge inspection visuelle"]],
 ["Electrique", ["SOH batterie annuel (certificat garantie, seuil 70%) ; liquide batterie+onduleur 5 ans/100 000-150 000 km ; freins nettoyage/graissage 2 ans/40 000 km (peu sollicités = grippage)"]],
 ["e-", ["SOH annuel ; OBC/connecteur inspection thermique annuelle"]],
 ["MultiJet", ["Filtre carburant 30 000-40 000 km impératif ; injecteurs débits retour 100 000 km"]]
];

/* ===== GÉNÉRATEUR PLAN PAR ÉNERGIE ===== */
function maintLines(fuel) {
  const L = [];
  const p = (cat, item, km, note) => L.push([cat, item, km, note]);
  /* COMMUN À TOUS */
  p("🛑", "Liquide de frein", "2 ans (ou 40 000 km)", "DOT4/DOT4 LV ; testeur humidité : remplacement si >3% ; point ébullition mesuré >180°C");
  p("🛑", "Plaquettes AV/AR", "Contrôle 20 000-30 000 km", "Épaisseur mini légale 3 mm (reco 4 mm) ; disques : limite gravée, voile <0,05 mm");
  p("🛑", "Disques AV/AR", "Contrôle 60 000-100 000 km", "Remplacement si épaisseur < mini gravé ou fissures/bords >1 mm");
  p("❄️", "Liquide de refroidissement", "4-5 ans ou 100 000-150 000 km", "Point congélation ≤ -35°C (réfractomètre) ; couleur/spec constructeur uniquement, jamais mélanger");
  p("🧰", "Filtre habitacle", "1 an ou 15 000-20 000 km", "Charbon actif recommandé ; désinfection évaporateur clim annuelle");
  p("🧠", "Calculateurs / diagnostic", "Chaque entretien (1 an)", "Valise : lecture défauts mémorisés + MAJ logicielles constructeur obligatoires (campagnes)");
  p("🧠", "Batterie 12V", "Test 2x/an (SOH + tension)", "Remplacement si SOH <70% ou tension <12,4 V à froid ; courroie/alternateur ou DC-DC contrôlés");
  p("📅", "Pneus", "Contrôle 10 000-12 000 km", "Sculpture légale 1,6 mm (reco 3 mm) ; pression à froid mensuelle ; permutation croisée ; date DOT <6 ans");
  p("📅", "Géométrie / liaisons au sol", "Contrôle 1 an ou 20 000 km", "Rotules, silentblocs, amortisseurs (test rebond) ; géométrie si usure asymétrique ou choc");
  if (fuel === "diesel") {
    p("🛢️", "Vidange huile + filtre", "15 000-30 000 km ou 1-2 ans", "Sévère (urbain/court trajets) : 10 000-15 000 km / 1 an ; niveau contrôlé à chaque plein (surconsommation = alerte)");
    p("🧰", "Filtre à air", "40 000-60 000 km ou 3-4 ans", "Soufflette interdite si encrassement huileux ; remplacement impératif si colmaté");
    p("🧰", "Filtre à carburant", "30 000-60 000 km ou 2-3 ans", "Purge eau obligatoire ; séparateur contrôlé (risque injecteurs HP)");
    p("⛓️", "Distribution", "Courroie : 100 000-240 000 km ou 5-10 ans / Chaîne : acoustique + huile", "Courroie : kit complet + pompe à eau ; chaîne : contrôle tensionneur 100 000 km, huile dégradée = risque");
    p("⛓️", "Courroie accessoire", "60 000-120 000 km ou 5-6 ans", "Galets + tensionneur remplacés avec ; fissures/effilochage = immédiat");
    p("🧠", "FAP (filtre particules)", "Contrôle ΔP 60 000 km", "Régénération forcée si colmatage partiel ; cendres > seuil = nettoyage spécialisé");
    p("🧠", "Vanne EGR + refroidisseur", "Inspection 80 000-120 000 km", "Nettoyage si encrassement ; fuite LDR refroidisseur = remplacement (risque casse moteur)");
    p("🧠", "AdBlue (pompe/injecteur)", "Contrôle 100 000 km", "Qualité ISO 22241 ; cristallisation injecteur = nettoyage/remplacement");
    p("🧠", "Turbo", "Contrôle 100 000-150 000 km", "Jeu axial/radial, fuite huile ; durites suralimentation étanchéité");
  } else if (fuel === "essence") {
    p("🛢️", "Vidange huile + filtre", "10 000-20 000 km ou 1 an", "Sévère : 10 000 km/1 an ; injection directe = huile dégradée plus vite (calamine)");
    p("🧰", "Filtre à air", "40 000-60 000 km ou 3-4 ans", "Remplacement impératif si colmaté (mélange appauvri = calamine)");
    p("🧰", "Bougies d'allumage", "40 000-100 000 km selon type", "Nickel 40-60 000 ; iridium/platine 90-100 000 ; écartement + couple serrage constructeur");
    p("⛓️", "Distribution", "Courroie : 100 000-160 000 km ou 5-10 ans / Chaîne : acoustique", "Courroie humide (PureTech/FireFly/EcoBoost) : 6 ans/100 000 km sévère ; kit + pompe");
    p("⛓️", "Courroie accessoire", "60 000-120 000 km ou 5-6 ans", "Galets + tensionneur avec ; inspection fissures annuelle");
    p("🧠", "GPF/catalyseur", "Contrôle 80 000-120 000 km", "Contre-pression + sonde lambda ; courts trajets = colmatage GPF");
    p("🧠", "Calamine admission (DI)", "Inspection 80 000-120 000 km", "Endoscopie ; décalaminage si dépôts >2 mm (ralenti/performance)");
  } else if (fuel === "hybride") {
    p("🛢️", "Vidange huile + filtre (thermique)", "15 000-20 000 km ou 1 an", "Moteur thermique moins sollicité mais démarrages fréquents = condensation huile");
    p("🧰", "Bougies", "60 000-100 000 km", "Iridium selon constructeur ; cycles démarrages multiples = usure électrodes");
    p("⛓️", "Distribution", "Chaîne : acoustique / Courroie : 100 000-160 000 km", "Selon motorisation thermique associée");
    p("🔋", "Batterie traction : SOH", "1 an ou 20 000 km", "Delta cellules <60 mV ; capacité ≥70% (garantie) ; rapport SOH archivé");
    p("🔋", "Liquide onduleur/batterie", "5 ans ou 100 000 km", "Spec isolant constructeur uniquement (jamais LDR classique)");
    p("🔋", "Batterie 12V", "4-5 ans (AGM/Li selon modèle)", "SOH annuel ; DC-DC test sortie");
    p("🛑", "Freins régénératifs", "Nettoyage/graissage 2 ans ou 40 000 km", "Peu sollicités = grippage étriers AR ; coulisses + pistons lubrifiés");
    p("🧠", "Embrayage hybridation / bascule", "Contrôle logiciel 1 an", "MAJ gestion bascule thermique/élec (à-coups)");
  } else { /* electrique */
    p("🛢️", "Huile réducteur", "5 ans ou 100 000 km (selon constructeur)", "Contrôle niveau/fuite à chaque entretien ; ATF homologué uniquement");
    p("🔋", "Batterie HV : SOH + isolement", "1 an ou 20 000 km", "SOH ≥70% (garantie) ; isolement >1 MΩ ; delta cellules <60 mV ; rapport archivé");
    p("🔋", "Liquide batterie + onduleur", "5 ans ou 100 000-150 000 km", "Spec isolant constructeur ; point congélation ≤ -35°C");
    p("🔋", "Batterie 12V", "4 ans (AGM/Li)", "SOH annuel ; DC-DC test ; décharge profonde = panne immobilisante");
    p("🧰", "Filtre habitacle", "1 an ou 20 000 km", "Charbon actif ; évaporateur désinfection");
    p("🛑", "Freins (nettoyage/graissage)", "2 ans ou 40 000 km", "Régénération = plaquettes/disques peu usés mais grippage : coulisses, pistons, AR surtout");
    p("🧠", "OBC / ICCU / connecteur", "Inspection thermique 1 an", "Thermographie broches ; MAJ logicielles charge ; câble mode 2 test");
    p("🧠", "BMS / VCM / ADAS : MAJ", "Chaque entretien", "Mises à jour constructeur obligatoires (campagnes OTA/rappel)");
    p("📅", "Pneus (usure EV)", "Rotation 10 000-12 000 km", "Couple + poids EV = usure accélérée ; indice charge/HL obligatoire");
    p("📅", "Clim : dessicant", "3-6 ans selon modèle", "Filtre déshydratant pompe chaleur ; efficacité chauffage hiver");
  }
  return L;
}

/* ===== RENDU ===== */
function renderMaintenance(brandId, modelName, motor) {
  const box = el("maint-box"); if (!box) return;
  const fuel = motor ? motor.fuel : null;
  if (!fuel) { box.innerHTML = '<p style="color:#94a3b8">Sélectionnez une motorisation pour générer le plan d\'entretien.</p>'; return; }
  const bn = brandsData[brandId] ? brandsData[brandId].name : brandId;
  const lines = maintLines(fuel);
  const cats = ["🛢️", "🧰", "⛓️", "🛑", "❄️", "🔋", "🧠", "📅"];
  let html = '<div class="issue-card deep"><strong>🧰 PLAN D\'ENTRETIEN — ' + esc(bn) + " " + esc(modelName) + " • " + esc(motor.name) + " (" + FUELS[fuel] + ")</strong>" +
    '<p style="font-size:12px;color:#94a3b8">' + esc(oilGroup(brandId)) + '</p>' +
    '<p style="font-size:12px;color:#fbbf24">⚠️ USAGE SÉVÈRE (urbain, courts trajets, remorquage, froid, taxi/VTC) : appliquer les intervalles réduits indiqués. Intervalles = maximaux constructeur.</p>';
  cats.forEach(cat => {
    const rows = lines.filter(l => l[0] === cat);
    if (!rows.length) return;
    html += '<h4 style="color:#4ade80;margin:10px 0 4px">' + cat + " " + ({ "🛢️": "Moteur / lubrification", "🧰": "Filtres", "⛓️": "Distribution / transmission", "🛑": "Freinage", "❄️": "Refroidissement", "🔋": "Batteries / HV", "🧠": "Contrôles systèmes / calculateurs", "📅": "Périodiques / sécurité" }[cat]) + "</h4>";
    rows.forEach(r => { html += '<p style="font-size:13px;margin:4px 0"><strong>' + esc(r[1]) + "</strong> — <span style=\"color:#4ade80\">" + esc(r[2]) + "</span><br><span style=\"font-size:12px;color:#cbd5e1\">" + esc(r[3]) + "</span></p>"; });
  });
  const bn2 = MAINT_BRAND[brandId] || [];
  const mn2 = [];
  MAINT_MOTOR.forEach(m => { if (String(motor.name).toLowerCase().includes(m[0].toLowerCase())) mn2.push.apply(mn2, m[1]); });
  if (bn2.length || mn2.length) {
    html += '<h4 style="color:#f59e0b;margin:10px 0 4px">📌 Spécificités constructeur / motorisation</h4>';
    bn2.concat(mn2).forEach(n => { html += '<p style="font-size:12px;margin:3px 0">• ' + esc(n) + "</p>"; });
  }
  html += '<h4 style="color:#38bdf8;margin:10px 0 4px">✅ Contrôles obligatoires à CHAQUE passage (rigueur extrême)</h4>' +
    '<p style="font-size:12px">1) Diagnostic valise complet (défauts mémorisés + MAJ logicielles) 2) Test SOH batterie 12V (et HV si électrifié) 3) Liquide frein : humidité + ébullition 4) LDR : point congélation + niveau 5) Freins : épaisseurs + coulisses 6) Pneus : usure/pression/DOT 7) Éclairage/ADAS : calibration si impact pare-brise 8) Serrages couples roues 9) Essai routier validé 10) Rapport SOH/entretien archivé (traçabilité garantie).</p>';
  html += "</div>";
  box.innerHTML = html;
}

/* ===== HOOK : injection case + rendu après corrélation ===== */
(function () {
  function injectBox() {
    const dbox = el("dtc-box"); if (!dbox || el("maint-box")) return;
    const h = document.createElement("h3"); h.textContent = "🧰 Maintenance / préconisations entretien";
    const d = document.createElement("div"); d.id = "maint-box"; d.innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule…</p>';
    dbox.parentNode.insertBefore(h, dbox.nextSibling);
    dbox.parentNode.insertBefore(d, h.nextSibling);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectBox); else injectBox();
  const _c = window.correlate;
  window.correlate = async function () {
    const r = await _c.apply(this, arguments);
    try {
      const mi = val("sel-motor"); const motor = (mi !== "" && motorsCache[mi]) ? motorsCache[mi] : null;
      renderMaintenance(curBrand, curModelName, motor);
    } catch (e) { console.warn("maint", e); }
    return r;
  };
})();

/* ===== FOND ÉLECTROCARDIOGRAMME ANIMÉ RÉEL ===== */
(function () {
  function ecgInit() {
    const c = document.createElement("canvas"); c.id = "ecg"; document.body.appendChild(c);
    const st = document.createElement("style");
    st.textContent = "#ecg{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.55}";
    document.head.appendChild(st);
    const ctx = c.getContext("2d"); let W, H, dpr;
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px"; }
    resize(); addEventListener("resize", resize);
    function ecgY(p) {
      if (p < 0.12) return 0;
      if (p < 0.20) return 0.12 * Math.sin((p - 0.12) / 0.08 * Math.PI);
      if (p < 0.26) return 0;
      if (p < 0.28) return -0.10 * ((p - 0.26) / 0.02);
      if (p < 0.31) return -0.10 + 1.10 * ((p - 0.28) / 0.03);
      if (p < 0.34) return 1.00 - 1.30 * ((p - 0.31) / 0.03);
      if (p < 0.37) return -0.30 + 0.30 * ((p - 0.34) / 0.03);
      if (p < 0.45) return 0;
      if (p < 0.60) return 0.25 * Math.sin((p - 0.45) / 0.15 * Math.PI);
      return 0;
    }
    let off = 0;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      /* grille médicale */
      ctx.strokeStyle = "rgba(74,222,128,0.06)"; ctx.lineWidth = 1 * dpr;
      const g = 24 * dpr; ctx.beginPath();
      for (let x = 0; x < W; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y < H; y += g) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      /* 3 voies ECG défilantes */
      const lanes = [0.22, 0.52, 0.84];
      lanes.forEach((L, i) => {
        const baseY = H * L, amp = H * 0.055, wl = W / (3 + i);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2 * dpr) {
          const p = (((x + off * (1 + i * 0.35)) % wl) + wl) % wl / wl;
          const y = baseY - ecgY(p) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = i === 1 ? "rgba(74,222,128,0.60)" : "rgba(56,189,248,0.35)";
        ctx.lineWidth = (i === 1 ? 2 : 1.2) * dpr;
        ctx.shadowColor = "rgba(74,222,128,0.8)"; ctx.shadowBlur = (i === 1 ? 10 : 0) * dpr;
        ctx.stroke(); ctx.shadowBlur = 0;
      });
      off += 2.2 * dpr;
      requestAnimationFrame(frame);
    }
    frame();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ecgInit); else ecgInit();
})();
