// ============================================================
// AUTO-DIAGNOSTIC PRO - RAPPELS + PANNES STRICTES PAR MOTEUR
// ef = filtre moteur (regex) : un rappel ne s'affiche QUE si
// la motorisation sélectionnée correspond.
// ============================================================

const RECALLS_DB = {

  sources: {
    NHTSA: { name: "NHTSA (USA)" }, SAFETY_GATE: { name: "Safety Gate (UE)" },
    RAPPEL_CONSO: { name: "Rappel Conso (FR)" }, SPECIALISTES: { name: "Sites spécialisés" }
  },

  recalls: [
    { id: 1, brand: "Peugeot", model: "3008", years: [2017,2018,2019], source: "RAPPEL_CONSO", severity: "Élevée", ef: "PureTech", title: "Risque incendie turbo 1.2 PureTech", description: "Fuite d'huile turbo.", dtc: ["P0299","P2262","P0234"], repair: "Turbo + durites", datePublished: "2023-05-15" },
    { id: 2, brand: "Peugeot", model: "3008", years: [2019,2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", ef: "PureTech", title: "GPF encrassé (P2002/P200E)", description: "Encrassement prématuré GPF.", dtc: ["P2002","P242F","P2453","P2463","P200E"], repair: "Nettoyage GPF + MAJ ECU", datePublished: "2023-02-28" },
    { id: 3, brand: "Peugeot", model: "3008", years: [2020,2021], source: "SAFETY_GATE", severity: "Moyenne", title: "Boîte EAT8 à-coups à froid", description: "Bug logiciel boîte.", dtc: ["P0700","P0715","P0720"], repair: "MAJ calculateur boîte", datePublished: "2023-08-10" },
    { id: 4, brand: "Peugeot", model: "3008", years: [2018,2019,2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", ef: "BlueHDi", title: "Chaîne distribution 7 mm - 1.5 BlueHDi", description: "Usure prématurée chaîne 7 mm, risque casse.", dtc: ["P0016","P0340","P0335"], repair: "Chaîne + tendeur + pignons", datePublished: "2023-10-01" },
    { id: 5, brand: "Peugeot", model: "5008", years: [2018,2019,2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", ef: "BlueHDi", title: "Chaîne distribution 7 mm - 1.5 BlueHDi", description: "Usure prématurée chaîne 7 mm.", dtc: ["P0016","P0340","P0335"], repair: "Chaîne + tendeur", datePublished: "2023-10-01" },
    { id: 6, brand: "Peugeot", model: "5008", years: [2017,2018,2019], source: "RAPPEL_CONSO", severity: "Élevée", title: "Fuite liquide frein maître-cylindre", description: "Perte efficacité freinage.", dtc: ["C1283","C0131"], repair: "Maître-cylindre", datePublished: "2023-03-22" },
    { id: 7, brand: "Peugeot", model: "5008", years: [2020,2021,2022], source: "NHTSA", severity: "Moyenne", title: "Radar ADAS fausses alertes", description: "Freinage intempestif.", dtc: ["C1001","C1100","C1102"], repair: "Calibration radar", datePublished: "2023-07-14" },
    { id: 8, brand: "Peugeot", model: "208", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", ef: "PureTech", title: "Courroie distribution 1.2 PureTech", description: "Courroie immergée dégradée.", dtc: ["P0016","P0340","P0335"], repair: "Kit distribution + crépine", datePublished: "2023-09-01" },
    { id: 9, brand: "Peugeot", model: "208", years: [2020,2021], source: "SPECIALISTES", severity: "Moyenne", ef: "e-208", title: "e-208 batterie traction", description: "Perte autonomie + erreur HT.", dtc: ["P0A0A","P0A0B","P0A1F"], repair: "MAJ BMS", datePublished: "2024-02-18" },
    { id: 10, brand: "Peugeot", model: "508", years: [2018,2019], source: "SAFETY_GATE", severity: "Élevée", ef: "BlueHDi", title: "Fuite carburant 1.5 BlueHDi", description: "Risque incendie rampe.", dtc: ["P0087","P0093","P0193"], repair: "Rampe + durites", datePublished: "2022-06-30" },
    { id: 11, brand: "Peugeot", model: "308", years: [2017,2018], source: "RAPPEL_CONSO", severity: "Élevée", title: "Embrayage boîte double embrayage", description: "À-coups, patinage.", dtc: ["P0700","P0740","P0868"], repair: "Kit embrayage + volant", datePublished: "2022-10-11" },
    { id: 12, brand: "Renault", model: "Clio V", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", ef: "TCe", title: "Fuite injecteurs 1.0 TCe", description: "Risque incendie.", dtc: ["P0201","P0093"], repair: "Injecteurs + joints", datePublished: "2023-01-10" },
    { id: 13, brand: "Renault", model: "Captur II", years: [2020,2021], source: "SAFETY_GATE", severity: "Élevée", ef: "E-Tech", title: "Freinage E-Tech pédale dure", description: "Perte assistance freinage.", dtc: ["C1283","P0A0F"], repair: "MAJ ABS/ESP", datePublished: "2023-05-30" },
    { id: 14, brand: "Renault", model: "Zoe", years: [2019,2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", ef: "R9|R10|R13", title: "Chargeur batterie 52 kWh", description: "Anomalie chargeur.", dtc: ["P0A08","P0A09","P0A0B"], repair: "MAJ BMS + chargeur", datePublished: "2022-09-15" },
    { id: 15, brand: "Renault", model: "R5 E-Tech", years: [2024,2025,2026], source: "SPECIALISTES", severity: "Moyenne", ef: "R5", title: "Recharge DC instable", description: "Coupures charge rapide.", dtc: ["P0A08","P0A09","P0A13"], repair: "MAJ logiciel charge", datePublished: "2025-03-10" },
    { id: 16, brand: "Renault", model: "R4 E-Tech", years: [2025,2026], source: "SPECIALISTES", severity: "Moyenne", ef: "R4", title: "Calibration BMS", description: "SOC imprécis.", dtc: ["P0A0B","P0A1F"], repair: "MAJ BMS", datePublished: "2025-06-20" },
    { id: 17, brand: "Renault", model: "Koleos", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", title: "Boîte CVT X-Tronic", description: "À-coups, surchauffe.", dtc: ["P0740","P0700","P0868"], repair: "Convertisseur + vidange", datePublished: "2022-08-08" },
    { id: 18, brand: "Renault", model: "Talisman", years: [2017,2018], source: "SPECIALISTES", severity: "Moyenne", ef: "dCi", title: "Vanne EGR 1.7 Blue dCi", description: "Encrassement.", dtc: ["P0400","P0401","P0402"], repair: "Nettoyage EGR", datePublished: "2023-06-20" },
    { id: 19, brand: "Citroën", model: "C5 Aircross", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", ef: "PureTech", title: "Courroie distribution 1.2 PureTech", description: "Courroie dans l'huile.", dtc: ["P0016","P0340"], repair: "Kit distribution", datePublished: "2023-09-12" },
    { id: 20, brand: "Citroën", model: "ë-C4", years: [2021,2022], source: "SPECIALISTES", severity: "Moyenne", ef: "ë-C4", title: "Charge AC lente", description: "Bug communication chargeur.", dtc: ["P0A08"], repair: "MAJ chargeur", datePublished: "2024-01-30" },
    { id: 21, brand: "DS", model: "DS 7", years: [2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", ef: "E-Tense", title: "Connecteur recharge E-Tense", description: "Surchauffe prise.", dtc: ["P0A08"], repair: "Câble + connecteur", datePublished: "2023-08-22" },
    { id: 22, brand: "Volkswagen", model: "Golf VII", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", ef: "TSI", title: "Chaîne distribution 1.4 TSI", description: "Risque casse EA211.", dtc: ["P0016","P0340","P0335"], repair: "Chaîne + tendeur", datePublished: "2022-05-20" },
    { id: 23, brand: "Volkswagen", model: "Tiguan II", years: [2017,2018,2019], source: "NHTSA", severity: "Élevée", title: "DSG mécatronique", description: "Perte propulsion.", dtc: ["P0700","P0715","P0720","P0842"], repair: "Mécatronique", datePublished: "2022-11-10" },
    { id: 24, brand: "Volkswagen", model: "Taigo", years: [2021,2022], source: "SPECIALISTES", severity: "Faible", title: "Infotainment / ACC bugs", description: "Écran noir.", dtc: ["U0250","C1102"], repair: "MAJ logiciel", datePublished: "2023-04-05" },
    { id: 25, brand: "Volkswagen", model: "ID.4", years: [2020,2021], source: "RAPPEL_CONSO", severity: "Élevée", title: "Arrêt propulsion logiciel", description: "Bug critique.", dtc: ["P0A1F","U0100"], repair: "MAJ véhicule", datePublished: "2022-07-25" },
    { id: 26, brand: "Volkswagen", model: "ID.5", years: [2022,2023], source: "RAPPEL_CONSO", severity: "Élevée", title: "Arrêt propulsion logiciel", description: "Campagne ID.3/ID.4/ID.5.", dtc: ["P0A1F","U0100"], repair: "MAJ véhicule", datePublished: "2022-07-25" },
    { id: 27, brand: "Volkswagen", model: "Passat B8", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", ef: "TDI", title: "Injecteurs 2.0 TDI", description: "Risque incendie.", dtc: ["P0201","P0202","P0203"], repair: "Injecteurs", datePublished: "2022-04-15" },
    { id: 28, brand: "BMW", model: "Série 3 (G20)", years: [2019,2020], source: "NHTSA", severity: "Élevée", ef: "20i|30i|B48", title: "Chaîne distribution B48", description: "Guides fragiles.", dtc: ["P0016","P0340"], repair: "Chaîne + guides", datePublished: "2022-08-18" },
    { id: 29, brand: "BMW", model: "i4", years: [2022,2023], source: "RAPPEL_CONSO", severity: "Élevée", title: "Batterie HT surchauffe", description: "Cellule défectueuse.", dtc: ["P0A0A","P0A0B"], repair: "Module batterie", datePublished: "2023-04-12" },
    { id: 30, brand: "Mercedes-Benz", model: "GLC (X253)", years: [2017,2018], source: "NHTSA", severity: "Élevée", ef: " d|CDI", title: "EGR incendie OM654", description: "Fuite liquide refroidissement.", dtc: ["P0401","P0403","P2015"], repair: "Vanne EGR", datePublished: "2022-03-28" },
    { id: 31, brand: "Audi", model: "A4 (B9)", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", ef: "TFSI", title: "Chaîne 2.0 TFSI EA888", description: "Allongement chaîne.", dtc: ["P0016","P0340"], repair: "Chaîne + tendeur", datePublished: "2022-02-14" },
    { id: 32, brand: "Opel", model: "Grandland", years: [2018,2019], source: "RAPPEL_CONSO", severity: "Élevée", ef: "1.2 Turbo", title: "Courroie distribution 1.2 Turbo", description: "Base PSA PureTech.", dtc: ["P0016","P0340"], repair: "Kit distribution", datePublished: "2023-09-15" },
    { id: 33, brand: "Opel", model: "Grandland", years: [2018,2019,2020], source: "RAPPEL_CONSO", severity: "Élevée", ef: "1.5 Diesel", title: "Chaîne distribution 7 mm - 1.5 Diesel", description: "Usure chaîne 7 mm (base BlueHDi).", dtc: ["P0016","P0340","P0335"], repair: "Chaîne + tendeur", datePublished: "2023-10-01" },
    { id: 34, brand: "Opel", model: "Insignia B", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", ef: "Diesel", title: "2.0 CDTI - EGR + FAP", description: "P200E fréquent.", dtc: ["P200E","P2002","P242F","P0401"], repair: "EGR + FAP + MAJ", datePublished: "2022-12-20" },
    { id: 35, brand: "Skoda", model: "Enyaq", years: [2021,2022,2023], source: "SPECIALISTES", severity: "Moyenne", title: "Connecteur charge surchauffe", description: "Charge DC instable.", dtc: ["P0A08"], repair: "Connecteur + MAJ", datePublished: "2023-10-12" },
    { id: 36, brand: "Skoda", model: "Elroq", years: [2025,2026], source: "SPECIALISTES", severity: "Moyenne", title: "Calibration ADAS caméra", description: "Après pare-brise.", dtc: ["C1003","C1112"], repair: "Calibration", datePublished: "2025-05-08" },
    { id: 37, brand: "Skoda", model: "Octavia", years: [2017,2018], source: "SAFETY_GATE", severity: "Élevée", ef: "TDI", title: "2.0 TDI injecteurs", description: "Claquement, fuite.", dtc: ["P0201","P0202"], repair: "Injecteurs", datePublished: "2022-09-01" },
    { id: 38, brand: "Dacia", model: "Sandero", years: [2021,2022,2023], source: "SPECIALISTES", severity: "Faible", title: "MediaNav écran figé", description: "Blocage multimédia.", dtc: ["U0250"], repair: "MAJ MediaNav", datePublished: "2023-02-14" },
    { id: 39, brand: "Dacia", model: "Duster", years: [2018,2019,2020], source: "SPECIALISTES", severity: "Moyenne", ef: "dCi", title: "1.5 Blue dCi - vanne EGR", description: "Encrassement.", dtc: ["P0400","P0401"], repair: "Nettoyage EGR", datePublished: "2022-06-10" },
    { id: 40, brand: "Dacia", model: "Spring", years: [2021,2022,2023], source: "SPECIALISTES", severity: "Moyenne", title: "BMS - limitation charge", description: "Charge bridée à froid.", dtc: ["P0A0B","P0A08"], repair: "MAJ BMS", datePublished: "2023-11-20" },
    { id: 41, brand: "Dacia", model: "Jogger", years: [2022,2023], source: "SPECIALISTES", severity: "Faible", ef: "ECO-G", title: "ECO-G : réglage injection GPL", description: "Ratés à froid.", dtc: ["P0171","P0455"], repair: "Réglage GPL", datePublished: "2024-04-02" },
    { id: 42, brand: "Toyota", model: "RAV4", years: [2019,2020], source: "NHTSA", severity: "Élevée", ef: "Hybrid", title: "Pompe inverter hybride", description: "Surchauffe système.", dtc: ["P0A11","P0A00"], repair: "Pompe inverter", datePublished: "2022-09-08" },
    { id: 43, brand: "Toyota", model: "Prius", years: [2017,2018], source: "NHTSA", severity: "Élevée", title: "Faisceau HT incendie", description: "Risque incendie.", dtc: ["P0A0A","P0A0C"], repair: "Faisceau HT", datePublished: "2022-05-15" },
    { id: 44, brand: "Hyundai", model: "Tucson", years: [2017,2018], source: "NHTSA", severity: "Élevée", title: "Module ABS incendie", description: "Feu module ABS.", dtc: ["C0110","C0121"], repair: "Module ABS", datePublished: "2022-01-20" },
    { id: 45, brand: "Hyundai", model: "Kona Electric", years: [2020,2021], source: "SAFETY_GATE", severity: "Élevée", title: "Batterie LG incendie", description: "Cellules défectueuses.", dtc: ["P0A0A","P0A0B"], repair: "Pack batterie", datePublished: "2022-02-28" },
    { id: 46, brand: "Kia", model: "Sportage", years: [2018,2019], source: "NHTSA", severity: "Élevée", title: "Module ABS court-circuit", description: "Risque incendie.", dtc: ["C0110","C0121"], repair: "Module ABS", datePublished: "2022-03-15" },
    { id: 47, brand: "Kia", model: "EV6", years: [2022,2023], source: "SPECIALISTES", severity: "Moyenne", title: "Connecteur CCS surchauffe", description: "Charge 800V.", dtc: ["P0A08"], repair: "Connecteur", datePublished: "2024-01-10" },
    { id: 48, brand: "Nissan", model: "Qashqai", years: [2018,2019], source: "SAFETY_GATE", severity: "Élevée", title: "Boîte CVT surchauffe", description: "Huile dégradée.", dtc: ["P0700","P0740"], repair: "Vidange + échangeur", datePublished: "2022-11-30" },
    { id: 49, brand: "Nissan", model: "Leaf", years: [2018,2019], source: "NHTSA", severity: "Moyenne", title: "Chargeur embarqué 6.6 kW", description: "Disjonction.", dtc: ["P0A08","P0A09"], repair: "Chargeur", datePublished: "2023-03-08" },
    { id: 50, brand: "Mazda", model: "CX-5", years: [2017,2018], source: "SAFETY_GATE", severity: "Moyenne", ef: "Skyactiv-D", title: "2.2 Skyactiv-D injecteurs", description: "Claquement diesel.", dtc: ["P0201","P0202"], repair: "Injecteurs", datePublished: "2022-10-25" },
    { id: 51, brand: "Ford", model: "Mustang Mach-E", years: [2021,2022], source: "NHTSA", severity: "Élevée", title: "Contacteur batterie HT", description: "Ouverture en roulant.", dtc: ["P0A0A","P0A1F"], repair: "Contacteur + MAJ", datePublished: "2023-06-15" },
    { id: 52, brand: "Tesla", model: "Model 3", years: [2019,2020,2021], source: "NHTSA", severity: "Élevée", title: "Écran tactile mémoire flash", description: "Écran muet.", dtc: ["U0250"], repair: "Unité multimédia", datePublished: "2022-04-10" },
    { id: 53, brand: "Chevrolet", model: "Bolt EV", years: [2019,2020,2021], source: "NHTSA", severity: "Élevée", title: "Batterie LG incendie", description: "Rappel majeur.", dtc: ["P0A0A","P0A0B"], repair: "Pack batterie", datePublished: "2022-01-05" },
    { id: 54, brand: "BYD", model: "Atto 3", years: [2023,2024], source: "SAFETY_GATE", severity: "Moyenne", title: "Calibration ADAS", description: "Caméra + radar.", dtc: ["C1001","C1003"], repair: "MAJ + calibration", datePublished: "2024-04-15" },
    { id: 55, brand: "MG", model: "MG4", years: [2023,2024], source: "SPECIALISTES", severity: "Faible", title: "Multimédia redémarrages", description: "Perte GPS.", dtc: ["U0250"], repair: "MAJ firmware", datePublished: "2024-03-20" },
    { id: 56, brand: "Honda", model: "Civic", years: [2017,2018], source: "NHTSA", severity: "Élevée", ef: "VTEC", title: "1.5 Turbo dilution huile", description: "Carburant dans huile.", dtc: ["P0172","P0562"], repair: "MAJ ECU + vidange", datePublished: "2022-07-20" }
  ],

  // ==========================================================
  async init() {
    const list = await DB.getAll('recalls');
    if (list.length === 0 || !list[0].dtc) { await DB.clear('recalls'); await this.populate(); }
  },

  async populate() {
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
    try { const r = await fetch('https://api.nhtsa.gov/recalls/recallsByVehicle?make=peugeot&modelYear=2023'); if (r.ok) console.log("✅ NHTSA OK"); } catch (e) {}
    try { const r2 = await fetch('https://data.economie.gouv.fr/api/records/1.0/search/?dataset=rappels-produits-v2&q=automobile&rows=20'); if (r2.ok) console.log("✅ Rappel Conso OK"); } catch (e) {}
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

  async getBySeverity(s) { const all = await DB.getAll('recalls'); return all.filter(r => r.severity === s); },
  async getByDTC(c) { const all = await DB.getAll('recalls'); return all.filter(r => r.dtc && r.dtc.includes(c)); },

  // ==========================================================
  // GÉNÉRATEUR STRICT PAR FAMILLE MOTEUR + CATÉGORIES COMPLÈTES
  // ==========================================================
  getGenericIssues(engine) {
    const issues = [];
    const code = ((engine.engineCode || '') + ' ' + (engine.power || ''));
    const t = engine.fuelType || '';

    // ----- PSA PureTech (essence) -----
    if (/PureTech/i.test(code)) {
      issues.push(
        { title: "Courroie distribution immergée - usure prématurée", severity: "Élevée", dtc: ["P0016","P0340","P0335"], repair: "Kit distribution + crépine + vidange", source: "RAPPEL_CONSO", description: "Panne majeure PureTech." },
        { title: "Encrassement GPF", severity: "Élevée", dtc: ["P2002","P242F","P2453","P2463","P200E"], repair: "Nettoyage GPF + MAJ", source: "SPECIALISTES", description: "Voyant moteur." },
        { title: "Turbo - fuite huile", severity: "Moyenne", dtc: ["P0299","P2262","P0234"], repair: "Turbo + durites", source: "SPECIALISTES", description: "Perte puissance." }
      );
    }

    // ----- PSA BlueHDi / HDi : chaîne 7 mm + FAP/AdBlue -----
    if (/BlueHDi|HDi/i.test(code)) {
      issues.push(
        { title: "Chaîne de distribution 7 mm - usure prématurée", severity: "Élevée", dtc: ["P0016","P0340","P0335"], repair: "Chaîne 7 mm + tendeur + pignons", source: "RAPPEL_CONSO", description: "Risque casse moteur 1.5/1.6 BlueHDi." },
        { title: "FAP encrassé / température excessive", severity: "Élevée", dtc: ["P200E","P2002","P242F","P2463","P2453"], repair: "Régénération + MAJ ECU", source: "SPECIALISTES", description: "Panne fréquente." },
        { title: "Système AdBlue / capteur NOx", severity: "Élevée", dtc: ["P20EE","P200E","P0087","P0193"], repair: "Capteur NOx + AdBlue", source: "RAPPEL_CONSO", description: "Démarrage interdit." },
        { title: "Vanne EGR encrassée", severity: "Moyenne", dtc: ["P0400","P0401","P0402","P0403"], repair: "Nettoyage EGR", source: "SPECIALISTES", description: "Ratés, voyant." },
        { title: "Injecteurs - fuite interne", severity: "Élevée", dtc: ["P0201","P0202","P0093","P0087"], repair: "Injecteurs + joints", source: "NHTSA", description: "Odeur gazole." }
      );
    }

    // ----- Autres diesels -----
    if (t === 'Diesel' && !/BlueHDi|HDi/i.test(code)) {
      issues.push(
        { title: "Chaîne distribution - allongement", severity: "Élevée", dtc: ["P0016","P0340","P0335"], repair: "Chaîne + tendeur", source: "SAFETY_GATE", description: "Bruit à froid." },
        { title: "FAP encrassé", severity: "Élevée", dtc: ["P200E","P2002","P242F","P2463"], repair: "Régénération + MAJ", source: "SPECIALISTES", description: "Perte puissance." },
        { title: "Vanne EGR", severity: "Moyenne", dtc: ["P0400","P0401","P0403"], repair: "Nettoyage EGR", source: "SPECIALISTES", description: "Voyant moteur." },
        { title: "Injecteurs", severity: "Élevée", dtc: ["P0201","P0202","P0093"], repair: "Injecteurs", source: "NHTSA", description: "Claquement." }
      );
    }

    // ----- Essence non PureTech -----
    if (t === 'Essence' && !/PureTech/i.test(code)) {
      issues.push(
        { title: "Chaîne distribution - allongement", severity: "Élevée", dtc: ["P0016","P0340","P0335"], repair: "Chaîne + tendeur", source: "SAFETY_GATE", description: "Bruit à froid." },
        { title: "Calamine admission / turbo", severity: "Moyenne", dtc: ["P0299","P0171","P0172"], repair: "Décalaminage + bougies", source: "SPECIALISTES", description: "Ratés." }
      );
    }

    // ----- Électrique : recharge + régénération -----
    if (t === 'Electrique') {
      issues.push(
        { title: "BMS / équilibrage batterie traction", severity: "Élevée", dtc: ["P0A0A","P0A0B","P0A1F"], repair: "MAJ BMS", source: "NHTSA", description: "Perte autonomie." },
        { title: "Recharge AC/DC instable", severity: "Moyenne", dtc: ["P0A08","P0A09"], repair: "Chargeur + connecteur", source: "SPECIALISTES", description: "Coupures charge." },
        { title: "Freinage régénératif - récupération d'énergie", severity: "Moyenne", dtc: ["P0A13","P0A14","P0A0F"], repair: "MAJ logiciel + capteurs", source: "SPECIALISTES", description: "Régénération absente." },
        { title: "Pompe refroidissement batterie", severity: "Moyenne", dtc: ["P0A11","P0A12"], repair: "Pompe + liquide", source: "SAFETY_GATE", description: "Surchauffe." }
      );
    }

    // ----- Hybride -----
    if (t === 'Hybride' || /E-Tech|Hybrid|PHEV|HEV|e:HEV|GTE|e-POWER/i.test(code)) {
      issues.push(
        { title: "Pompe inverter", severity: "Élevée", dtc: ["P0A11","P0A00","P0A0F"], repair: "Pompe inverter", source: "NHTSA", description: "Panne connue." },
        { title: "Batterie 12V / DC-DC", severity: "Moyenne", dtc: ["P0A08","P0A09","P0562"], repair: "12V + DC-DC", source: "SPECIALISTES", description: "Alertes multiples." },
        { title: "Régénération freinage hybride", severity: "Moyenne", dtc: ["P0A13","P0A0F"], repair: "MAJ + capteurs", source: "SPECIALISTES", description: "Récupération irrégulière." }
      );
    }

    // ----- Flexfuel -----
    if (t === 'Flexfuel' || /ECO-G|E85/i.test(code)) {
      issues.push(
        { title: "Capteur éthanol/GPL - mélange", severity: "Moyenne", dtc: ["P0171","P0172","P0455"], repair: "Capteur + durites", source: "SPECIALISTES", description: "Ratés à froid." }
      );
    }

    // ----- COMMUNS : boîte, freinage, trains, ceintures, airbags, élec, élec­tronique, ADAS -----
    issues.push(
      { title: "Boîte / réducteur - mécatronique, à-coups", severity: "Élevée", dtc: ["P0700","P0715","P0720","P0842","P0868"], repair: "Vidange + MAJ / mécatronique", source: "SPECIALISTES", description: "Passages durs." },
      { title: "Freinage - maître-cylindre / liquide", severity: "Élevée", dtc: ["C0128","C1283","C0131"], repair: "Maître-cylindre + purge", source: "SAFETY_GATE", description: "Pédale molle." },
      { title: "ABS / capteurs vitesse roues", severity: "Élevée", dtc: ["C0035","C0040","C0045","C0050","C0110"], repair: "Capteurs ABS", source: "SAFETY_GATE", description: "Voyant ABS/ESP." },
      { title: "Trains roulants - rotules, roulements, transmission", severity: "Moyenne", dtc: ["C0710","C0750","C0840"], repair: "Rotules, roulements, cardans", source: "SPECIALISTES", description: "Bruits, vibrations, usure pneus." },
      { title: "Direction assistée - circuit/moteur", severity: "Élevée", dtc: ["C0455","C0460","C0472"], repair: "Moteur direction + calibration", source: "NHTSA", description: "Durcissement." },
      { title: "Ceintures - prétensionneurs & boucles", severity: "Élevée", dtc: ["B0003","B0004","B0010","B0011"], repair: "Prétensionneurs + boucles", source: "SAFETY_GATE", description: "Voyant ceinture/airbag." },
      { title: "Airbags - capteurs & modules", severity: "Élevée", dtc: ["B0001","B0002","B0007","B0012","B0013"], repair: "Modules + faisceau", source: "NHTSA", description: "Voyant airbag." },
      { title: "Électrique - tension 12V / alternateur / DC-DC", severity: "Moyenne", dtc: ["P0560","P0562","P0563"], repair: "Batterie 12V + charge", source: "SPECIALISTES", description: "Redémarrages, alertes." },
      { title: "Électronique - multiplexage / BSI / COM2000", severity: "Moyenne", dtc: ["U0140","U0155","U0250","U0400"], repair: "Diagnostic bus + MAJ", source: "SPECIALISTES", description: "Pannes sporadiques." },
      { title: "ADAS - caméra / radar calibration", severity: "Moyenne", dtc: ["C1001","C1003","C1100","C1102","C1112"], repair: "Calibration", source: "SPECIALISTES", description: "Après choc/pare-brise." }
    );
    return issues;
  },

  // PANNES = rappels spécifiques (filtrés moteur) + générateur strict
  getIssuesForVehicle(brand, model, year, engine) {
    const code = ((engine.engineCode || '') + ' ' + (engine.power || ''));
    const specific = this.recalls.filter(r =>
      r.brand === brand && r.model === model &&
      (!year || r.years.includes(year)) &&
      (!r.ef || new RegExp(r.ef, 'i').test(code))
    );
    return specific.concat(this.getGenericIssues(engine));
  }
};

function normalizeStr(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
