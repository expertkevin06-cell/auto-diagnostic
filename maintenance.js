/* MAINTENANCE.JS v20 — Plan d'entretien précis par véhicule + fond ECG animé */
function maintSpec(brandId) { return MAINT_SPEC[brandId] || MAINT_DEFAULT; }

function buildMaintenanceHTML(brandId, modelName, motor) {
  if (!motor) return '<p style="color:#94a3b8">Sélectionnez une motorisation pour générer le plan d\'entretien précis.</p>';
  const S = maintSpec(brandId), fuel = motor.fuel;
  const bn = (typeof brandsData !== "undefined" && brandsData[brandId]) ? brandsData[brandId].name : brandId;
  const isEV = fuel === "electrique", isHY = fuel === "hybride", isD = fuel === "diesel", isE = fuel === "essence";
  const rows = [];
  const add = (cat, item, interval, note) => rows.push([cat, item, interval, note]);

  /* --- LUBRIFICATION --- */
  if (isEV) {
    add("🛢️", "Huile de réducteur", S.gear, "Contrôle niveau + fuites à chaque passage. Fluide homologué constructeur uniquement.");
    add("🛢️", "Vidange moteur", "Sans objet", "Aucun moteur thermique — aucune vidange moteur, aucun filtre à huile, aucun filtre à carburant.");
  } else {
    add("🛢️", "Vidange huile + filtre à huile", S.oilKm ? (S.oilKm.toLocaleString("fr-FR") + " km ou " + S.oilY + " an" + (S.oilY > 1 ? "s" : "")) : "Selon carnet constructeur",
      "Usage sévère (urbain, courts trajets, remorquage, froid, VTC/taxi) : " + (S.sevKm ? S.sevKm.toLocaleString("fr-FR") + " km / " + S.sevY + " an" : "intervalles réduits") + ". Capacité indicative : " + S.cap + ". " + S.oil);
    add("🛢️", "Niveau d'huile", "À chaque plein (ou 1 000 km)", "Contrôle à chaud, véhicule à plat, 5 min après arrêt. Consommation > 0,5 L/1 000 km = alerte moteur.");
    if (isD) add("🧰", "Filtre à carburant + purge eau", "30 000 – 60 000 km ou 2–3 ans", "Purge du séparateur d'eau impérative. Carburant de qualité incertaine : intervalle réduit à 20 000 km.");
    add("🧰", "Filtre à air", "40 000 – 60 000 km ou 3–4 ans", "Soufflette interdite si encrassement huileux. Environnement poussiéreux : 20 000 km.");
  }
  add("🧰", "Filtre d'habitacle", "1 an ou 15 000 – 20 000 km", "Charbon actif recommandé. Désinfection évaporateur + circuit clim annuelle.");

  /* --- DISTRIBUTION --- */
  if (isEV) add("⛓️", "Distribution", "Sans objet", "Moteur électrique : aucune courroie ni chaîne de distribution.");
  else add("⛓️", "Distribution", S.belt, "Courroie : kit complet (courroie + galets + tensionneur) + pompe à eau + joints spi systématiquement. Chaîne : contrôle acoustique à froid + analyse huile ; claquement = intervention immédiate.");
  if (!isEV) add("⛓️", "Courroie d'accessoires", "60 000 – 120 000 km ou 5–6 ans", "Galets et tensionneur remplacés conjointement. Fissures, effilochage ou bruit = remplacement immédiat. Hybrides HSD/e-POWER : souvent absente.");
  if (isE || isHY) add("🧰", "Bougies d'allumage", S.plugs, "Nickel 40–60 000 km ; iridium/platine 90–100 000 km. Écartement et couple de serrage constructeur impératifs (culasse alu).");
  add("⚙️", "Boîte de vitesses", S.gear, "Boîte manuelle : contrôle niveau/fuite. DCT/DSG humide : vidange obligatoire à l'intervalle indiqué. Convertisseur : vidange recommandée même si « à vie » constructeur.");

  /* --- FREINAGE --- */
  add("🛑", "Liquide de frein", "2 ans (ou 40 000 km)", "DOT4 / DOT4 LV selon spec. Testeur d'humidité : remplacement si > 3 %. Point d'ébullition mesuré > 180 °C (sec).");
  add("🛑", "Plaquettes AV / AR", "Contrôle tous les 20 000 – 30 000 km", "Épaisseur garniture : mini légal 3 mm, remplacement conseillé à 4 mm. Témoin d'usure et capteur contrôlés.");
  add("🛑", "Disques AV / AR", "Contrôle 60 000 – 100 000 km", "Épaisseur mini gravée sur le disque. Voile < 0,05 mm au comparateur. Bord externe > 1 mm = remplacement.");
  if (isEV || isHY) add("🛑", "Dégrippage freins (spécifique électrifié)", "2 ans ou 40 000 km", "Régénération = freins peu sollicités → corrosion et grippage des étriers AR. Démontage, nettoyage coulisses, graissage pistons et colonnettes.");
  add("🛑", "Frein de stationnement", "Contrôle annuel", "Électrique : test moteur d'étrier + recalibration. Câble : réglage et graissage.");

  /* --- REFROIDISSEMENT --- */
  add("❄️", "Liquide de refroidissement", S.cool, "Point de congélation ≤ −35 °C au réfractomètre. Spec constructeur exclusive, jamais de mélange de technologies (OAT / Si-OAT / hybride).");
  if (isEV || isHY) add("❄️", "Boucle thermique batterie + onduleur", "4–5 ans ou 100 000 – 150 000 km", "Fluide à faible conductivité imposé par le constructeur. Un LDR classique provoque un défaut d'isolement HV.");
  if (!isEV) add("❄️", "Pompe à eau / thermostat", "Contrôle 100 000 – 150 000 km", "Fuite au trou de purge, bruit de roulement, P0128 (thermostat bloqué ouvert) = remplacement.");

  /* --- BATTERIES --- */
  add("🔋", "Batterie 12V : SOH + tension", "Test 2×/an — remplacement 4–5 ans", "SOH < 70 % ou tension < 12,4 V à froid = remplacement. AGM/EFB obligatoire si start&stop. Codage BMS après remplacement.");
  if (isEV || isHY) {
    add("🔋", "Batterie haute tension : SOH certifié", "1 an ou 20 000 km", "Rapport SOH archivé (condition de garantie, seuil usuel 70 %). Delta cellules < 60 mV. Équilibrage par charge lente complète si écart.");
    add("🔋", "Isolement HV", "1 an", "Mesure mégohmmètre : > 1 MΩ requis. Identification de la branche défaillante avant toute intervention.");
    add("🔋", "Contacteurs / relais HV", "Contrôle 1 an", "Test de collage et résistance. Défaut après charge rapide répétée = remplacement du pack relais.");
    add("🔋", "OBC / ICCU / connecteur de charge", "Thermographie annuelle", "Échauffement des broches, verrouillage, câble mode 2. MAJ logicielles de charge obligatoires (campagnes).");
  }
  if (!isEV) add("🔋", "Alternateur / démarreur (ou alterno-démarreur 48V)", "Contrôle annuel", "Tension de charge 13,8–14,6 V. Réseau 48V : contrôle batterie dédiée et alterno-démarreur (campagnes connues).");

  /* --- DÉPOLLUTION --- */
  if (isD) {
    add("🧠", "FAP : différentiel de pression", "Contrôle 60 000 km", "Régénération forcée si colmatage partiel. Taux de cendres > seuil = nettoyage spécialisé ou remplacement.");
    add("🧠", "Vanne EGR + refroidisseur", "Inspection 80 000 – 120 000 km", "Nettoyage si encrassement. Fuite LDR du refroidisseur = remplacement immédiat (risque de casse moteur / incendie).");
    add("🧠", "Système AdBlue / SCR", "Appoint 8 000 – 12 000 km · contrôle 100 000 km", "Qualité ISO 22241. Cristallisation injecteur, pompe, capteurs NOx amont/aval. Réinitialisation des compteurs après réparation.");
  }
  if (isE || isHY) {
    add("🧠", "GPF / catalyseur", "Contrôle 80 000 – 120 000 km", "Contre-pression et sondes lambda. Courts trajets répétés = colmatage GPF.");
    add("🧠", "Calamine admission (injection directe)", "Endoscopie 80 000 – 120 000 km", "Dépôts > 2 mm : décalaminage (hydrogène ou manuel). Ralenti instable et perte de puissance.");
  }
  if (!isEV) add("🧠", "Turbo / suralimentation", "Contrôle 100 000 – 150 000 km", "Jeu axial/radial, fuite d'huile, durites et intercooler. Géométrie variable : course libre de l'actuateur.");

  /* --- ÉLECTRONIQUE --- */
  add("🧠", "Diagnostic calculateurs complet", "À chaque entretien (1 an)", "Lecture défauts actifs ET mémorisés sur tous les calculateurs. Application des MAJ logicielles et campagnes constructeur (obligatoire pour la garantie).");
  add("🧠", "ADAS : caméras / radar", "Calibration après tout impact pare-brise", "Calibration statique + dynamique. Pneus de dimensions homologuées, géométrie correcte, hauteur de caisse conforme.");
  add("🧠", "Réseaux CAN / LIN / Ethernet", "Contrôle annuel", "Taux d'erreurs de trames, oxydation des connecteurs, masse et blindage. Défauts intermittents multiples = faisceau.");

  /* --- LIAISONS / PNEUS --- */
  add("📅", "Pneus : usure, pression, DOT", "Contrôle 10 000 – 12 000 km", "Sculpture légale 1,6 mm (recommandé 3 mm). Pression à froid mensuelle. Date DOT < 6 ans." + ((isEV || isHY) ? " EV : usure accélérée (couple + masse), permutation tous les 10 000 km, indice de charge renforcé (HL) obligatoire." : ""));
  add("📅", "Géométrie / liaisons au sol", "1 an ou 20 000 km", "Rotules, silentblocs, biellettes, amortisseurs (test de rebond). Géométrie si usure asymétrique, choc ou tirage.");
  add("📅", "Amortisseurs / ressorts", "Contrôle 80 000 – 120 000 km", "Fuite d'huile, efficacité, corrosion des ressorts. Utilitaires chargés : contrôle renforcé des ressorts AR.");
  add("📅", "Éclairage / visibilité", "Contrôle annuel", "Réglage des optiques, balais, lave-glace, dégivrage. Caméra de recul : propreté et étanchéité.");
  add("📅", "Climatisation", "Entretien annuel", "Recharge si perte > 10 %/an. Filtre déshydratant / dessicant : 3–6 ans (pompe à chaleur EV : efficacité chauffage hiver).");
  add("📅", "Soubassement / corrosion", "Contrôle annuel", "Utilitaires et régions salées : protection, points de levage, échappement, durites de frein.");

  const cats = [["🛢️","Moteur / lubrification"],["🧰","Filtres & consommables"],["⛓️","Distribution & transmission"],["🛑","Freinage"],["❄️","Refroidissement"],["🔋","Batteries & haute tension"],["🧠","Dépollution, calculateurs & ADAS"],["📅","Liaisons au sol, pneus & périodiques"]];
  let html = '<div class="issue-card deep"><strong>🧰 PLAN D\'ENTRETIEN — ' + esc(bn) + " " + esc(modelName) + " • " + esc(motor.name) + (motor.power ? " (" + esc(motor.power) + ")" : "") + " • " + FUELS[fuel] + '</strong>' +
    '<p style="font-size:12px;color:#94a3b8;margin-top:6px">🛢️ ' + esc(S.oil) + '</p>' +
    '<p style="font-size:12px;color:#fbbf24">⚠️ Intervalles = maxima constructeur. Usage sévère (urbain, courts trajets, remorquage, froid, taxi/VTC, utilitaire chargé) : appliquer systématiquement les intervalles réduits.</p>';
  cats.forEach(([c, label]) => {
    const rs = rows.filter(r => r[0] === c);
    if (!rs.length) return;
    html += '<h4 style="color:#4ade80;margin:12px 0 4px">' + c + " " + label + "</h4>";
    rs.forEach(r => { html += '<p style="font-size:13px;margin:5px 0"><strong>' + esc(r[1]) + '</strong> — <span style="color:#4ade80">' + esc(r[2]) + '</span><br><span style="font-size:12px;color:#cbd5e1">' + esc(r[3]) + "</span></p>"; });
  });
  const motorNotes = [];
  MAINT_MOTOR_RULES.forEach(([k, notes]) => { if (String(motor.name).toLowerCase().includes(k)) notes.forEach(n => motorNotes.push(n)); });
  if (motorNotes.length) {
    html += '<h4 style="color:#f59e0b;margin:12px 0 4px">📌 Spécificités de cette motorisation</h4>';
    motorNotes.forEach(n => html += '<p style="font-size:12px;margin:3px 0">• ' + esc(n) + "</p>");
  }
  html += '<h4 style="color:#38bdf8;margin:12px 0 4px">✅ Contrôles obligatoires à CHAQUE passage</h4><p style="font-size:12px">1) Diagnostic valise complet + MAJ/campagnes · 2) SOH batterie 12V (et HV si électrifié) · 3) Liquide de frein : humidité + ébullition · 4) LDR : point de congélation + niveau · 5) Freins : épaisseurs, voile, coulisses · 6) Pneus : usure, pression, DOT · 7) ADAS : calibration si intervention · 8) Couples de serrage roues · 9) Essai routier validé · 10) Rapport archivé (traçabilité garantie).</p></div>';
  return html;
}

/* ===== FOND ÉLECTROCARDIOGRAMME ANIMÉ ===== */
(function () {
  function init() {
    if (document.getElementById("ecg")) return;
    const c = document.createElement("canvas"); c.id = "ecg"; document.body.appendChild(c);
    const st = document.createElement("style");
    st.textContent = "#ecg{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.5}";
    document.head.appendChild(st);
    const ctx = c.getContext("2d"); let W = 0, H = 0, dpr = 1, off = 0, raf = null;
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = c.width = Math.max(1, innerWidth * dpr); H = c.height = Math.max(1, innerHeight * dpr); c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px"; }
    resize(); window.addEventListener("resize", resize);
    function wave(p) {
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
    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(74,222,128,0.06)"; ctx.lineWidth = dpr;
      const g = 24 * dpr; ctx.beginPath();
      for (let x = 0; x < W; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y < H; y += g) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      [0.22, 0.52, 0.84].forEach((L, i) => {
        const baseY = H * L, amp = H * 0.055, wl = Math.max(80, W / (3 + i));
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2 * dpr) {
          const p = (((x + off * (1 + i * 0.35)) % wl) + wl) % wl / wl;
          const y = baseY - wave(p) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = i === 1 ? "rgba(74,222,128,0.6)" : "rgba(56,189,248,0.32)";
        ctx.lineWidth = (i === 1 ? 2 : 1.2) * dpr;
        ctx.shadowColor = "rgba(74,222,128,0.8)"; ctx.shadowBlur = (i === 1 ? 10 : 0) * dpr;
        ctx.stroke(); ctx.shadowBlur = 0;
      });
      off += 2.2 * dpr;
      raf = requestAnimationFrame(frame);
    }
    frame();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
      else if (!raf) frame();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
