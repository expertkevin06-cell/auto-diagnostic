// ============================================================
// AUTO-DIAGNOSTIC PRO - RAPPELS + GÉNÉRATEUR MASSIF DE PANNES
// ============================================================

const RECALLS_DB = {

  sources: {
    NHTSA: { name: "NHTSA (USA)" },
    SAFETY_GATE: { name: "Safety Gate (UE)" },
    RAPPEL_CONSO: { name: "Rappel Conso (FR)" },
    SPECIALISTES: { name: "Sites spécialisés" }
  },

  recalls: [
    { id: 1, brand: "Peugeot", model: "3008", years: [2017,2018,2019], source: "RAPPEL_CONSO", severity: "Élevée", title: "Risque incendie turbo 1.2 PureTech", description: "Fuite d'huile turbo pouvant provoquer un incendie.", dtcRelated: ["P0299","P2262","P0234"], repairAction: "Remplacement turbo + durites", datePublished: "2023-05-15" },
    { id: 2, brand: "Peugeot", model: "3008", years: [2019,2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", title: "GPF encrassé (P2002 / P200E)", description: "Encrassement prématuré du filtre à particules essence.", dtcRelated: ["P2002","P242F","P2453","P2463","P200E"], repairAction: "Nettoyage GPF + MAJ ECU", datePublished: "2023-02-28" },
    { id: 3, brand: "Peugeot", model: "3008", years: [2020,2021], source: "SAFETY_GATE", severity: "Moyenne", title: "Boîte EAT8 à-coups à froid", description: "Bug logiciel boîte automatique.", dtcRelated: ["P0700","P0715","P0720"], repairAction: "MAJ calculateur boîte", datePublished: "2023-08-10" },
    { id: 4, brand: "Peugeot", model: "5008", years: [2017,2018,2019], source: "RAPPEL_CONSO", severity: "Élevée", title: "Fuite liquide frein maître-cylindre", description: "Perte d'efficacité freinage.", dtcRelated: ["C1283","C0131"], repairAction: "Remplacement maître-cylindre", datePublished: "2023-03-22" },
    { id: 5, brand: "Peugeot", model: "5008", years: [2020,2021,2022], source: "NHTSA", severity: "Moyenne", title: "Radar ADAS fausses alertes", description: "Freinage d'urgence intempestif.", dtcRelated: ["C1001","C1100","C1102"], repairAction: "Calibration radar", datePublished: "2023-07-14" },
    { id: 6, brand: "Peugeot", model: "208", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", title: "Courroie distribution 1.2 PureTech", description: "Courroie immergée dégradée, crépine bouchée.", dtcRelated: ["P0016","P0340","P0335"], repairAction: "Kit distribution + crépine", datePublished: "2023-09-01" },
    { id: 7, brand: "Peugeot", model: "208", years: [2020,2021], source: "SPECIALISTES", severity: "Moyenne", title: "e-208 batterie traction", description: "Perte autonomie + erreur HT.", dtcRelated: ["P0A0A","P0A0B","P0A1F"], repairAction: "MAJ BMS", datePublished: "2024-02-18" },
    { id: 8, brand: "Peugeot", model: "508", years: [2018,2019], source: "SAFETY_GATE", severity: "Élevée", title: "Fuite carburant 1.5 BlueHDi", description: "Risque incendie rampe injection.", dtcRelated: ["P0087","P0093","P0193"], repairAction: "Rampe + durites", datePublished: "2022-06-30" },
    { id: 9, brand: "Peugeot", model: "308", years: [2017,2018], source: "RAPPEL_CONSO", severity: "Élevée", title: "Embrayage boîte double embrayage", description: "À-coups, patinage.", dtcRelated: ["P0700","P0740","P0868"], repairAction: "Kit embrayage + volant", datePublished: "2022-10-11" },
    { id: 10, brand: "Renault", model: "Clio V", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", title: "Fuite injecteurs 1.0 TCe", description: "Risque incendie.", dtcRelated: ["P0201","P0093"], repairAction: "Injecteurs + joints", datePublished: "2023-01-10" },
    { id: 11, brand: "Renault", model: "Captur II", years: [2020,2021], source: "SAFETY_GATE", severity: "Élevée", title: "Freinage E-Tech pédale dure", description: "Perte assistance freinage mode électrique.", dtcRelated: ["C1283","P0A0F"], repairAction: "MAJ ABS/ESP", datePublished: "2023-05-30" },
    { id: 12, brand: "Renault", model: "Zoe", years: [2019,2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", title: "Chargeur batterie 52 kWh", description: "Anomalie chargeur.", dtcRelated: ["P0A08","P0A09","P0A0B"], repairAction: "MAJ BMS + chargeur", datePublished: "2022-09-15" },
    { id: 13, brand: "Renault", model: "R5 E-Tech", years: [2024,2025,2026], source: "SPECIALISTES", severity: "Moyenne", title: "Recharge DC instable", description: "Coupures en charge rapide.", dtcRelated: ["P0A08","P0A09"], repairAction: "MAJ logiciel charge", datePublished: "2025-03-10" },
    { id: 14, brand: "Renault", model: "R4 E-Tech", years: [2025,2026], source: "SPECIALISTES", severity: "Moyenne", title: "Calibration BMS", description: "Estimation SOC imprécise.", dtcRelated: ["P0A0B","P0A1F"], repairAction: "MAJ BMS", datePublished: "2025-06-20" },
    { id: 15, brand: "Renault", model: "Koleos", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", title: "Boîte CVT X-Tronic", description: "À-coups, surchauffe.", dtcRelated: ["P0740","P0700","P0868"], repairAction: "Convertisseur + vidange", datePublished: "2022-08-08" },
    { id: 16, brand: "Renault", model: "Talisman", years: [2017,2018], source: "SPECIALISTES", severity: "Moyenne", title: "Vanne EGR 1.7 Blue dCi", description: "Encrassement, perte puissance.", dtcRelated: ["P0400","P0401","P0402"], repairAction: "Nettoyage EGR", datePublished: "2023-06-20" },
    { id: 17, brand: "Renault", model: "Megane E-Tech", years: [2022,2023], source: "SPECIALISTES", severity: "Moyenne", title: "Bug multimédia + perte ADAS", description: "Redémarrages écran central.", dtcRelated: ["U0100","U0300"], repairAction: "MAJ multimédia", datePublished: "2024-03-05" },
    { id: 18, brand: "Citroën", model: "C5 Aircross", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", title: "Courroie distribution 1.2 PureTech", description: "Courroie dans l'huile.", dtcRelated: ["P0016","P0340"], repairAction: "Kit distribution", datePublished: "2023-09-12" },
    { id: 19, brand: "Citroën", model: "ë-C4", years: [2021,2022], source: "SPECIALISTES", severity: "Moyenne", title: "Charge AC lente", description: "Bug communication chargeur.", dtcRelated: ["P0A08"], repairAction: "MAJ chargeur", datePublished: "2024-01-30" },
    { id: 20, brand: "Citroën", model: "C3", years: [2017,2018], source: "SPECIALISTES", severity: "Faible", title: "Multimédia SMEG figé", description: "Écran tactile bloqué.", dtcRelated: ["U0250"], repairAction: "MAJ SMEG", datePublished: "2022-05-02" },
    { id: 21, brand: "DS", model: "DS 7", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", title: "Connecteur recharge E-Tense", description: "Surchauffe prise domestique.", dtcRelated: ["P0A08"], repairAction: "Câble + connecteur", datePublished: "2023-08-22" },
    { id: 22, brand: "Volkswagen", model: "Golf VII", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", title: "Chaîne distribution 1.4 TSI", description: "Risque casse moteur EA211.", dtcRelated: ["P0016","P0340","P0335"], repairAction: "Chaîne + tendeur", datePublished: "2022-05-20" },
    { id: 23, brand: "Volkswagen", model: "Tiguan II", years: [2017,2018,2019], source: "NHTSA", severity: "Élevée", title: "DSG mécatronique", description: "Perte propulsion.", dtcRelated: ["P0700","P0715","P0720","P0842"], repairAction: "Mécatronique", datePublished: "2022-11-10" },
    { id: 24, brand: "Volkswagen", model: "Taigo", years: [2021,2022], source: "SPECIALISTES", severity: "Faible", title: "Infotainment / ACC bugs", description: "Écran noir, régulateur inerte.", dtcRelated: ["U0250","C1102"], repairAction: "MAJ logiciel", datePublished: "2023-04-05" },
    { id: 25, brand: "Volkswagen", model: "ID.4", years: [2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", title: "Arrêt propulsion logiciel", description: "Bug logiciel critique.", dtcRelated: ["P0A1F","U0100"], repairAction: "MAJ véhicule", datePublished: "2022-07-25" },
    { id: 26, brand: "Volkswagen", model: "ID.5", years: [2022,2023], source: "RAPPEL_CONSO", severity: "Élevée", title: "Arrêt propulsion logiciel", description: "Même campagne que ID.3/ID.4.", dtcRelated: ["P0A1F","U0100"], repairAction: "MAJ véhicule", datePublished: "2022-07-25" },
    { id: 27, brand: "Volkswagen", model: "Passat B8", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", title: "Injecteurs 2.0 TDI", description: "Risque incendie.", dtcRelated: ["P0201","P0202","P0203"], repairAction: "Injecteurs", datePublished: "2022-04-15" },
    { id: 28, brand: "BMW", model: "Série 3 (G20)", years: [2019,2020], source: "NHTSA", severity: "Élevée", title: "Chaîne distribution B48", description: "Guides fragiles.", dtcRelated: ["P0016","P0340"], repairAction: "Chaîne + guides", datePublished: "2022-08-18" },
    { id: 29, brand: "BMW", model: "i4", years: [2022,2023], source: "RAPPEL_CONSO", severity: "Élevée", title: "Batterie HT surchauffe", description: "Cellule défectueuse.", dtcRelated: ["P0A0A","P0A0B"], repairAction: "Module batterie", datePublished: "2023-04-12" },
    { id: 30, brand: "Mercedes-Benz", model: "GLC (X253)", years: [2017,2018], source: "NHTSA", severity: "Élevée", title: "EGR incendie OM654", description: "Fuite liquide refroidissement.", dtcRelated: ["P0401","P0403","P2015"], repairAction: "Vanne EGR", datePublished: "2022-03-28" },
    { id: 31, brand: "Audi", model: "A4 (B9)", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", title: "Chaîne 2.0 TFSI EA888", description: "Bruit à froid, allongement chaîne.", dtcRelated: ["P0016","P0340"], repairAction: "Chaîne + tendeur", datePublished: "2022-02-14" },
    { id: 32, brand: "Opel", model: "Grandland", years: [2018,2019], source: "RAPPEL_CONSO", severity: "Élevée", title: "Courroie distribution 1.2 Turbo", description: "Même base PSA PureTech.", dtcRelated: ["P0016","P0340"], repairAction: "Kit distribution", datePublished: "2023-09-15" },
    { id: 33, brand: "Opel", model: "Insignia B", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", title: "2.0 CDTI - EGR + FAP", description: "P200E fréquent.", dtcRelated: ["P200E","P2002","P242F","P0401"], repairAction: "Nettoyage EGR + FAP + MAJ", datePublished: "2022-12-20" },
    { id: 34, brand: "Skoda", model: "Enyaq", years: [2021,2022,2023], source: "SPECIALISTES", severity: "Moyenne", title: "Connecteur charge surchauffe", description: "Charge DC instable.", dtcRelated: ["P0A08"], repairAction: "Connecteur + MAJ", datePublished: "2023-10-12" },
    { id: 35, brand: "Skoda", model: "Elroq", years: [2025,2026], source: "SPECIALISTES", severity: "Moyenne", title: "Calibration ADAS caméra", description: "Après remplacement pare-brise.", dtcRelated: ["C1003","C1112"], repairAction: "Calibration caméra", datePublished: "2025-05-08" },
    { id: 36, brand: "Skoda", model: "Octavia", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", title: "2.0 TDI injecteurs", description: "Claquement, fuite interne.", dtcRelated: ["P0201","P0202"], repairAction: "Injecteurs", datePublished: "2022-09-01" },
    { id: 37, brand: "Dacia", model: "Sandero", years: [2021,2022,2023], source: "SPECIALISTES", severity: "Faible", title: "MediaNav écran figé", description: "Multimédia bloqué au démarrage.", dtcRelated: ["U0250"], repairAction: "MAJ MediaNav", datePublished: "2023-02-14" },
    { id: 38, brand: "Dacia", model: "Duster", years: [2018,2019,2020], source: "SPECIALISTES", severity: "Moyenne", title: "1.5 Blue dCi - vanne EGR", description: "Encrassement, voyant moteur.", dtcRelated: ["P0400","P0401"], repairAction: "Nettoyage EGR", datePublished: "2022-06-10" },
    { id: 39, brand: "Dacia", model: "Spring", years: [2021,2022,2023], source: "SPECIALISTES", severity: "Moyenne", title: "BMS - limitation charge", description: "Charge bridée à froid.", dtcRelated: ["P0A0B","P0A08"], repairAction: "MAJ BMS", datePublished: "2023-11-20" },
    { id: 40, brand: "Dacia", model: "Jogger", years: [2022,2023], source: "SPECIALISTES", severity: "Faible", title: "ECO-G : réglage injection GPL", description: "Ratés au démarrage à froid.", dtcRelated: ["P0171","P0455"], repairAction: "Réglage GPL + capteur", datePublished: "2024-04-02" },
    { id: 41, brand: "Toyota", model: "RAV4", years: [2019,2020], source: "NHTSA", severity: "Élevée", title: "Pompe inverter hybride", description: "Surchauffe système hybride.", dtcRelated: ["P0A11","P0A00"], repairAction: "Pompe inverter", datePublished: "2022-09-08" },
    { id: 42, brand: "Toyota", model: "Prius", years: [2017,2018], source: "NHTSA", severity: "Élevée", title: "Faisceau HT incendie", description: "Risque incendie câblage hybride.", dtcRelated: ["P0A0A","P0A0C"], repairAction: "Faisceau HT", datePublished: "2022-05-15" },
    { id: 43, brand: "Hyundai", model: "Tucson", years: [2017,2018], source: "NHTSA", severity: "Élevée", title: "Module ABS incendie", description: "Feu module ABS à l'arrêt.", dtcRelated: ["C0110","C0121"], repairAction: "Module ABS + fusible", datePublished: "2022-01-20" },
    { id: 44, brand: "Hyundai", model: "Kona Electric", years: [2020,2021], source: "SAFETY_GATE", severity: "Élevée", title: "Batterie LG incendie", description: "Cellules défectueuses.", dtcRelated: ["P0A0A","P0A0B"], repairAction: "Pack batterie", datePublished: "2022-02-28" },
    { id: 45, brand: "Kia", model: "Sportage", years: [2018,2019], source: "NHTSA", severity: "Élevée", title: "Module ABS court-circuit", description: "Risque incendie.", dtcRelated: ["C0110","C0121"], repairAction: "Module ABS", datePublished: "2022-03-15" },
    { id: 46, brand: "Kia", model: "EV6", years: [2022,2023], source: "SPECIALISTES", severity: "Moyenne", title: "Connecteur CCS surchauffe", description: "Charge rapide 800V.", dtcRelated: ["P0A08"], repairAction: "Connecteur charge", datePublished: "2024-01-10" },
    { id: 47, brand: "Nissan", model: "Qashqai", years: [2018,2019], source: "SAFETY_GATE", severity: "Élevée", title: "Boîte CVT surchauffe", description: "Huile CVT dégradée.", dtcRelated: ["P0700","P0740"], repairAction: "Vidange + échangeur", datePublished: "2022-11-30" },
    { id: 48, brand: "Nissan", model: "Leaf", years: [2018,2019], source: "NHTSA", severity: "Moyenne", title: "Chargeur embarqué 6.6 kW", description: "Disjonction / surchauffe.", dtcRelated: ["P0A08","P0A09"], repairAction: "Chargeur embarqué", datePublished: "2023-03-08" },
    { id: 49, brand: "Mazda", model: "CX-5", years: [2017,2018], source: "SAFETY_GATE", severity: "Moyenne", title: "2.2 Skyactiv-D injecteurs", description: "Claquement diesel.", dtcRelated: ["P0201","P0202"], repairAction: "Injecteurs", datePublished: "2022-10-25" },
    { id: 50, brand: "Ford", model: "Mustang Mach-E", years: [2021,2022], source: "NHTSA", severity: "Élevée", title: "Contacteur batterie HT", description: "Ouverture intempestive en roulant.", dtcRelated: ["P0A0A","P0A1F"], repairAction: "Contacteur + MAJ", datePublished: "2023-06-15" },
    { id: 51, brand: "Tesla", model: "Model 3", years: [2019,2020,2021], source: "NHTSA", severity: "Élevée", title: "Écran tactile mémoire flash", description: "Écran muet.", dtcRelated: ["U0250"], repairAction: "Unité multimédia", datePublished: "2022-04-10" },
    { id: 52, brand: "Chevrolet", model: "Bolt EV", years: [2019,2020,2021], source: "NHTSA", severity: "Élevée", title: "Batterie LG incendie", description: "Rappel majeur pack batterie.", dtcRelated: ["P0A0A","P0A0B"], repairAction: "Pack batterie complet", datePublished: "2022-01-05" },
    { id: 53, brand: "BYD", model: "Atto 3", years: [2023,2024], source: "SAFETY_GATE", severity: "Moyenne", title: "Calibration ADAS", description: "Caméra + radar à recalibrer.", dtcRelated: ["C1001","C1003"], repairAction: "MAJ + calibration", datePublished: "2024-04-15" },
    { id: 54, brand: "MG", model: "MG4", years: [2023,2024], source: "SPECIALISTES", severity: "Faible", title: "Multimédia redémarrages", description: "Perte GPS.", dtcRelated: ["U0250"], repairAction: "MAJ firmware", datePublished: "2024-03-20" },
    { id: 55, brand: "Honda", model: "Civic", years: [2017,2018], source: "NHTSA", severity: "Élevée", title: "1.5 Turbo dilution huile", description: "Carburant dans huile.", dtcRelated: ["P0172","P0562"], repairAction: "MAJ ECU + vidange", datePublished: "2022-07-20" }
  ],

  // ==========================================================
  // MÉTHODES
  // ==========================================================
  async init() {
    const list = await DB.getAll('recalls');
    if (list.length === 0) await this.populate();
  },

  async populate() {
    console.log("🔄 Peuplement base rappels...");
    await DB.bulkAdd('recalls', this.recalls);
    await DB.update('meta', { key: 'lastRecallUpdate', value: Date.now() });
    console.log("✅ " + this.recalls.length + " rappels ajoutés");
  },

  async checkAndUpdate() {
    const now = Date.now();
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;
    const meta = await DB.get('meta', 'lastRecallUpdate');
    const last = meta ? meta.value : 0;
    if (!last || (now - last) >= fifteenDays) {
      await this.fetchExternalSources();
      await DB.update('meta', { key: 'lastRecallUpdate', value: now });
      return true;
    }
    return false;
  },

  async fetchExternalSources() {
    console.log("📡 Synchronisation sources externes...");
    try {
      const r = await fetch('https://api.nhtsa.gov/recalls/recallsByVehicle?make=peugeot&modelYear=2023');
      if (r.ok) { const d = await r.json(); console.log("✅ NHTSA:", (d.results ? d.results.length : 0)); }
    } catch (e) { console.warn("⚠️ NHTSA offline"); }
    try {
      const r2 = await fetch('https://data.economie.gouv.fr/api/records/1.0/search/?dataset=rappels-produits-v2&q=automobile&rows=20');
      if (r2.ok) { const d2 = await r2.json(); console.log("✅ Rappel Conso:", (d2.nhits || 0)); }
    } catch (e) { console.warn("⚠️ Rappel Conso offline"); }
  },

  async search(brand, model, year) {
    const all = await DB.getAll('recalls');
    return all.filter(r => {
      const b = !brand || r.brand.toLowerCase() === String(brand).toLowerCase();
      const m = !model || r.model.toLowerCase().includes(String(model).toLowerCase());
      const y = !year || (r.years && r.years.includes(year));
      return b && m && y;
    });
  },

  async getBySeverity(severity) {
    const all = await DB.getAll('recalls');
    return all.filter(r => r.severity === severity);
  },

  async getByDTC(code) {
    const all = await DB.getAll('recalls');
    return all.filter(r => r.dtcRelated && r.dtcRelated.includes(code));
  },

  // ==========================================================
  // GÉNÉRATEUR MASSIF : pannes par famille moteur + transverses
  // ==========================================================
  getGenericIssues(engine) {
    const issues = [];
    const code = ((engine.engineCode || '') + ' ' + (engine.power || ''));
    const t = engine.fuelType || '';

    if (/PureTech/i.test(code)) {
      issues.push(
        { title: "Courroie distribution immergée - usure prématurée", severity: "Élevée", dtc: ["P0016","P0340","P0335"], repair: "Kit distribution + crépine + vidange", source: "RAPPEL_CONSO", description: "Panne connue majeure moteurs PureTech." },
        { title: "Encrassement GPF - régénérations fréquentes", severity: "Élevée", dtc: ["P2002","P242F","P2453","P2463","P200E"], repair: "Nettoyage GPF + MAJ calculateur", source: "SPECIALISTES", description: "Voyant moteur + perte puissance." },
        { title: "Turbo - fuite huile / sifflement", severity: "Moyenne", dtc: ["P0299","P2262","P0234"], repair: "Turbo + durites", source: "SPECIALISTES", description: "Perte puissance sporadique." }
      );
    }
    if (t === 'Diesel' || /BlueHDi|dCi|TDI|CRDi|Skyactiv-D|Duramax|D-4D/i.test(code)) {
      issues.push(
        { title: "FAP encrassé / température excessive", severity: "Élevée", dtc: ["P200E","P2002","P242F","P2463","P2453"], repair: "Régénération forcée + MAJ ECU", source: "SPECIALISTES", description: "Panne très fréquente diesel." },
        { title: "Vanne EGR encrassée", severity: "Moyenne", dtc: ["P0400","P0401","P0402","P0403"], repair: "Nettoyage/remplacement EGR", source: "SPECIALISTES", description: "Ratés, fumées, voyant." },
        { title: "Système AdBlue / capteur NOx", severity: "Élevée", dtc: ["P20EE","P200E","P0087","P0193"], repair: "Capteur NOx + circuit AdBlue", source: "RAPPEL_CONSO", description: "Démarrage interdit après compte à rebours." },
        { title: "Injecteurs - fuite interne / claquement", severity: "Élevée", dtc: ["P0201","P0202","P0093","P0087"], repair: "Injecteurs + joints", source: "NHTSA", description: "Odeur gazole, démarrage difficile." }
      );
    }
    if (t === 'Essence' && !/PureTech/i.test(code)) {
      issues.push(
        { title: "Chaîne distribution - allongement", severity: "Élevée", dtc: ["P0016","P0340","P0335"], repair: "Chaîne + tendeur", source: "SAFETY_GATE", description: "Bruit à froid, risque casse." },
        { title: "Calamine admission / turbo", severity: "Moyenne", dtc: ["P0299","P0171","P0172"], repair: "Décalaminage + bougies", source: "SPECIALISTES", description: "Ratés et surconsommation." }
      );
    }
    if (t === 'Electrique') {
      issues.push(
        { title: "BMS / équilibrage batterie traction", severity: "Élevée", dtc: ["P0A0A","P0A0B","P0A1F"], repair: "MAJ BMS + équilibrage cellules", source: "NHTSA", description: "Perte autonomie, charge incomplète." },
        { title: "Chargeur embarqué / connecteur", severity: "Moyenne", dtc: ["P0A08","P0A09"], repair: "Chargeur + connecteur", source: "SPECIALISTES", description: "Coupures de charge." },
        { title: "Pompe refroidissement batterie", severity: "Moyenne", dtc: ["P0A11","P0A12"], repair: "Pompe + liquide", source: "SAFETY_GATE", description: "Surchauffe batterie." }
      );
    }
    if (t === 'Hybride' || /E-Tech|Hybrid|PHEV|HEV|e:HEV|GTE|e-POWER/i.test(code)) {
      issues.push(
        { title: "Pompe inverter / refroidissement hybride", severity: "Élevée", dtc: ["P0A11","P0A00","P0A0F"], repair: "Pompe inverter", source: "NHTSA", description: "Panne connue hybrides." },
        { title: "Batterie 12V / convertisseur DC-DC", severity: "Moyenne", dtc: ["P0A08","P0A09","P0562"], repair: "Batterie 12V + DC-DC", source: "SPECIALISTES", description: "Alertes multiples tableau de bord." }
      );
    }
    if (t === 'Flexfuel' || /ECO-G|E85/i.test(code)) {
      issues.push(
        { title: "Capteur éthanol/GPL - mélange", severity: "Moyenne", dtc: ["P0171","P0172","P0455"], repair: "Capteur + durites GPL", source: "SPECIALISTES", description: "Ratés au démarrage à froid." }
      );
    }

    // Pannes transverses (tous véhicules, toutes motorisations)
    issues.push(
      { title: "Boîte auto - mécatronique / à-coups", severity: "Élevée", dtc: ["P0700","P0715","P0720","P0842","P0868"], repair: "Vidange + MAJ / mécatronique", source: "SPECIALISTES", description: "À-coups, passages durs." },
      { title: "ABS / capteurs vitesse roues", severity: "Élevée", dtc: ["C0035","C0040","C0045","C0050","C0110"], repair: "Capteurs ABS + faisceau", source: "SAFETY_GATE", description: "Voyant ABS/ESP." },
      { title: "ADAS - caméra / radar calibration", severity: "Moyenne", dtc: ["C1001","C1003","C1100","C1102","C1112"], repair: "Calibration caméra/radar", source: "SPECIALISTES", description: "Après pare-brise ou choc." },
      { title: "Multimédia / bus CAN sporadique", severity: "Faible", dtc: ["U0100","U0250","U0300","U0400"], repair: "MAJ logiciel", source: "SPECIALISTES", description: "Pannes sporadiques électroniques." }
    );
    return issues;
  },

  // PANNES MASSIVES = rappels spécifiques + pannes famille moteur
  getIssuesForVehicle(brand, model, year, engine) {
    const specific = this.recalls.filter(r =>
      r.brand === brand && r.model === model && (!year || r.years.includes(year))
    );
    return specific.concat(this.getGenericIssues(engine));
  }
};

function normalizeStr(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
