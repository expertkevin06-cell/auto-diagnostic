// ============================================================
// AUTO-DIAGNOSTIC PRO - RAPPELS + PANNES MASSIVES + AUTOCONTRÔLE
// Chaque panne porte dtc ET dtcRelated (compatibilité totale)
// ============================================================

function I(title, severity, dtc, repair, source, description, ef) {
  const o = {
    title: title, severity: severity,
    dtc: dtc, dtcRelated: dtc,
    repair: repair, repairAction: repair,
    source: source, description: description
  };
  if (ef) o.ef = ef;
  return o;
}

function R(id, brand, model, years, issue) {
  issue.id = id; issue.brand = brand; issue.model = model; issue.years = years;
  return issue;
}

const RECALLS_DB = {

  sources: {
    NHTSA: { name: "NHTSA (USA)" }, SAFETY_GATE: { name: "Safety Gate (UE)" },
    RAPPEL_CONSO: { name: "Rappel Conso (FR)" }, SPECIALISTES: { name: "Sites spécialisés" }
  },

  recalls: [
    R(1, "Peugeot", "3008", [2017,2018,2019], I("Risque incendie turbo 1.2 PureTech", "Élevée", ["P0299","P2262","P0234"], "Turbo + durites", "RAPPEL_CONSO", "Fuite d'huile turbo.", "PureTech")),
    R(2, "Peugeot", "3008", [2019,2020,2021], I("GPF encrassé 1.2 PureTech", "Élevée", ["P2002","P242F","P2453","P2463","P200E"], "Nettoyage GPF + MAJ ECU", "RAPPEL_CONSO", "Encrassement prématuré GPF.", "PureTech")),
    R(3, "Peugeot", "3008", [2020,2021], I("Boîte EAT8 à-coups à froid", "Moyenne", ["P0700","P0715","P0720"], "MAJ calculateur boîte", "SAFETY_GATE", "Bug logiciel boîte.")),
    R(4, "Peugeot", "3008", [2018,2019,2020,2021], I("Chaîne distribution 7 mm usée - corrigée par chaîne 8 mm (1.5 BlueHDi)", "Élevée", ["P0016","P0340","P0335"], "Remplacement chaîne 7 mm par chaîne 8 mm renforcée + tendeur", "RAPPEL_CONSO", "Usure prématurée chaîne 7 mm, risque casse.", "BlueHDi")),
    R(5, "Peugeot", "3008", [2018,2019,2020,2021], I("AdBlue / NOx 1.5-2.0 BlueHDi (P20EE)", "Élevée", ["P20EE","P200E","P0087","P0193"], "Capteur NOx + circuit AdBlue + MAJ", "RAPPEL_CONSO", "Démarrage interdit après compte à rebours.", "BlueHDi")),
    R(6, "Peugeot", "5008", [2018,2019,2020,2021], I("Chaîne distribution 7 mm usée - corrigée par chaîne 8 mm (1.5 BlueHDi)", "Élevée", ["P0016","P0340","P0335"], "Remplacement chaîne 7 mm par chaîne 8 mm renforcée + tendeur", "RAPPEL_CONSO", "Usure prématurée chaîne 7 mm.", "BlueHDi")),
    R(7, "Peugeot", "5008", [2018,2019,2020,2021], I("AdBlue / NOx BlueHDi (P20EE)", "Élevée", ["P20EE","P200E","P0087","P0193"], "Capteur NOx + AdBlue + MAJ", "RAPPEL_CONSO", "Système NOx défaillant.", "BlueHDi")),
    R(8, "Peugeot", "5008", [2017,2018,2019], I("Fuite liquide frein maître-cylindre", "Élevée", ["C1283","C0131"], "Maître-cylindre", "RAPPEL_CONSO", "Perte efficacité freinage.")),
    R(9, "Peugeot", "5008", [2020,2021,2022], I("Radar ADAS fausses alertes", "Moyenne", ["C1001","C1100","C1102"], "Calibration radar", "NHTSA", "Freinage intempestif.")),
    R(10, "Peugeot", "208", [2019,2020], I("Courroie distribution 1.2 PureTech", "Élevée", ["P0016","P0340","P0335"], "Kit distribution + crépine", "RAPPEL_CONSO", "Courroie immergée dégradée.", "PureTech")),
    R(11, "Peugeot", "208", [2020,2021], I("e-208 batterie traction", "Moyenne", ["P0A0A","P0A0B","P0A1F"], "MAJ BMS", "SPECIALISTES", "Perte autonomie + erreur HT.", "e-208")),
    R(12, "Peugeot", "508", [2018,2019], I("Fuite carburant 1.5 BlueHDi", "Élevée", ["P0087","P0093","P0193"], "Rampe + durites", "SAFETY_GATE", "Risque incendie rampe.", "BlueHDi")),
    R(13, "Peugeot", "308", [2017,2018], I("Embrayage boîte double embrayage", "Élevée", ["P0700","P0740","P0868"], "Kit embrayage + volant", "RAPPEL_CONSO", "À-coups, patinage.")),
    R(14, "Renault", "Clio V", [2019,2020], I("Fuite injecteurs 1.0 TCe", "Élevée", ["P0201","P0093"], "Injecteurs + joints", "RAPPEL_CONSO", "Risque incendie.", "TCe")),
    R(15, "Renault", "Captur II", [2020,2021], I("Freinage E-Tech pédale dure", "Élevée", ["C1283","P0A0F"], "MAJ ABS/ESP", "SAFETY_GATE", "Perte assistance freinage.", "E-Tech")),
    R(16, "Renault", "Zoe", [2019,2020,2021], I("Chargeur batterie 52 kWh", "Élevée", ["P0A08","P0A09","P0A0B"], "MAJ BMS + chargeur", "RAPPEL_CONSO", "Anomalie chargeur.", "R9|R10|R13")),
    R(17, "Renault", "R5 E-Tech", [2024,2025,2026], I("Recharge DC instable", "Moyenne", ["P0A08","P0A09","P0A13"], "MAJ logiciel charge", "SPECIALISTES", "Coupures charge rapide.", "R5")),
    R(18, "Renault", "R4 E-Tech", [2025,2026], I("Calibration BMS", "Moyenne", ["P0A0B","P0A1F"], "MAJ BMS", "SPECIALISTES", "SOC imprécis.", "R4")),
    R(19, "Renault", "Koleos", [2017,2018], I("Boîte CVT X-Tronic", "Élevée", ["P0740","P0700","P0868"], "Convertisseur + vidange", "SAFETY_GATE", "À-coups, surchauffe.")),
    R(20, "Renault", "Talisman", [2017,2018], I("Vanne EGR 1.7 Blue dCi", "Moyenne", ["P0400","P0401","P0402"], "Nettoyage EGR", "SPECIALISTES", "Encrassement.", "dCi")),
    R(21, "Citroën", "C5 Aircross", [2019,2020], I("Courroie distribution 1.2 PureTech", "Élevée", ["P0016","P0340"], "Kit distribution", "RAPPEL_CONSO", "Courroie dans l'huile.", "PureTech")),
    R(22, "Citroën", "ë-C4", [2021,2022], I("Charge AC lente", "Moyenne", ["P0A08"], "MAJ chargeur", "SPECIALISTES", "Bug communication chargeur.", "ë-C4")),
    R(23, "DS", "DS 7", [2019,2020], I("Connecteur recharge E-Tense", "Élevée", ["P0A08"], "Câble + connecteur", "RAPPEL_CONSO", "Surchauffe prise.", "E-Tense")),
    R(24, "Volkswagen", "Golf VII", [2017,2018], I("Chaîne distribution 1.4 TSI", "Élevée", ["P0016","P0340","P0335"], "Chaîne + tendeur", "SAFETY_GATE", "Risque casse EA211.", "TSI")),
    R(25, "Volkswagen", "Tiguan II", [2017,2018,2019], I("DSG mécatronique", "Élevée", ["P0700","P0715","P0720","P0842"], "Mécatronique", "NHTSA", "Perte propulsion.")),
    R(26, "Volkswagen", "Taigo", [2021,2022], I("Infotainment / ACC bugs", "Faible", ["U0250","C1102"], "MAJ logiciel", "SPECIALISTES", "Écran noir.")),
    R(27, "Volkswagen", "ID.4", [2020,2021], I("Arrêt propulsion logiciel", "Élevée", ["P0A1F","U0100"], "MAJ véhicule", "RAPPEL_CONSO", "Bug critique.")),
    R(28, "Volkswagen", "ID.5", [2022,2023], I("Arrêt propulsion logiciel", "Élevée", ["P0A1F","U0100"], "MAJ véhicule", "RAPPEL_CONSO", "Campagne ID.3/ID.4/ID.5.")),
    R(29, "Volkswagen", "Passat B8", [2017,2018], I("Injecteurs 2.0 TDI", "Élevée", ["P0201","P0202","P0203"], "Injecteurs", "SAFETY_GATE", "Risque incendie.", "TDI")),
    R(30, "BMW", "Série 3 (G20)", [2019,2020], I("Chaîne distribution B48", "Élevée", ["P0016","P0340"], "Chaîne + guides", "NHTSA", "Guides fragiles.", "20i|30i|B48")),
    R(31, "BMW", "i4", [2022,2023], I("Batterie HT surchauffe", "Élevée", ["P0A0A","P0A0B"], "Module batterie", "RAPPEL_CONSO", "Cellule défectueuse.")),
    R(32, "Mercedes-Benz", "GLC (X253)", [2017,2018], I("EGR incendie OM654", "Élevée", ["P0401","P0403","P2015"], "Vanne EGR", "NHTSA", "Fuite liquide refroidissement.", " d|CDI")),
    R(33, "Audi", "A4 (B9)", [2017,2018], I("Chaîne 2.0 TFSI EA888", "Élevée", ["P0016","P0340"], "Chaîne + tendeur", "SAFETY_GATE", "Allongement chaîne.", "TFSI")),
    R(34, "Opel", "Grandland", [2018,2019], I("Courroie distribution 1.2 Turbo", "Élevée", ["P0016","P0340"], "Kit distribution", "RAPPEL_CONSO", "Base PSA PureTech.", "1.2 Turbo")),
    R(35, "Opel", "Grandland", [2018,2019,2020], I("Chaîne 7 mm usée - corrigée par chaîne 8 mm (1.5 Diesel)", "Élevée", ["P0016","P0340","P0335"], "Remplacement chaîne 7 mm par chaîne 8 mm renforcée", "RAPPEL_CONSO", "Base 1.5 BlueHDi.", "1.5 Diesel")),
    R(36, "Opel", "Insignia B", [2017,2018], I("2.0 CDTI - EGR + FAP (P200E/P20EE)", "Élevée", ["P200E","P20EE","P242F","P0401"], "EGR + FAP + MAJ", "SAFETY_GATE", "P200E/P20EE fréquents.", "Diesel")),
    R(37, "Skoda", "Enyaq", [2021,2022,2023], I("Connecteur charge surchauffe", "Moyenne", ["P0A08"], "Connecteur + MAJ", "SPECIALISTES", "Charge DC instable.")),
    R(38, "Skoda", "Elroq", [2025,2026], I("Calibration ADAS caméra", "Moyenne", ["C1003","C1112"], "Calibration", "SPECIALISTES", "Après pare-brise.")),
    R(39, "Skoda", "Octavia", [2017,2018], I("2.0 TDI injecteurs", "Élevée", ["P0201","P0202"], "Injecteurs", "SAFETY_GATE", "Claquement, fuite.", "TDI")),
    R(40, "Dacia", "Sandero", [2021,2022,2023], I("MediaNav écran figé", "Faible", ["U0250"], "MAJ MediaNav", "SPECIALISTES", "Blocage multimédia.")),
    R(41, "Dacia", "Duster", [2018,2019,2020], I("1.5 Blue dCi - vanne EGR", "Moyenne", ["P0400","P0401"], "Nettoyage EGR", "SPECIALISTES", "Encrassement.", "dCi")),
    R(42, "Dacia", "Spring", [2021,2022,2023], I("BMS - limitation charge", "Moyenne", ["P0A0B","P0A08"], "MAJ BMS", "SPECIALISTES", "Charge bridée à froid.")),
    R(43, "Dacia", "Jogger", [2022,2023], I("ECO-G : réglage injection GPL", "Faible", ["P0171","P0455"], "Réglage GPL", "SPECIALISTES", "Ratés à froid.", "ECO-G")),
    R(44, "Toyota", "RAV4", [2019,2020], I("Pompe inverter hybride", "Élevée", ["P0A11","P0A00"], "Pompe inverter", "NHTSA", "Surchauffe système.", "Hybrid")),
    R(45, "Toyota", "Prius", [2017,2018], I("Faisceau HT incendie", "Élevée", ["P0A0A","P0A0C"], "Faisceau HT", "NHTSA", "Risque incendie.")),
    R(46, "Hyundai", "Tucson", [2017,2018], I("Module ABS incendie", "Élevée", ["C0110","C0121"], "Module ABS", "NHTSA", "Feu module ABS.")),
    R(47, "Hyundai", "Kona Electric", [2020,2021], I("Batterie LG incendie", "Élevée", ["P0A0A","P0A0B"], "Pack batterie", "SAFETY_GATE", "Cellules défectueuses.")),
    R(48, "Kia", "Sportage", [2018,2019], I("Module ABS court-circuit", "Élevée", ["C0110","C0121"], "Module ABS", "NHTSA", "Risque incendie.")),
    R(49, "Kia", "EV6", [2022,2023], I("Connecteur CCS surchauffe", "Moyenne", ["P0A08"], "Connecteur", "SPECIALISTES", "Charge 800V.")),
    R(50, "Nissan", "Qashqai", [2018,2019], I("Boîte CVT surchauffe", "Élevée", ["P0700","P0740"], "Vidange + échangeur", "SAFETY_GATE", "Huile dégradée.")),
    R(51, "Nissan", "Leaf", [2018,2019], I("Chargeur embarqué 6.6 kW", "Moyenne", ["P0A08","P0A09"], "Chargeur", "NHTSA", "Disjonction.")),
    R(52, "Mazda", "CX-5", [2017,2018], I("2.2 Skyactiv-D injecteurs", "Moyenne", ["P0201","P0202"], "Injecteurs", "SAFETY_GATE", "Claquement diesel.", "Skyactiv-D")),
    R(53, "Ford", "Mustang Mach-E", [2021,2022], I("Contacteur batterie HT", "Élevée", ["P0A0A","P0A1F"], "Contacteur + MAJ", "NHTSA", "Ouverture en roulant.")),
    R(54, "Tesla", "Model 3", [2019,2020,2021], I("Écran tactile mémoire flash", "Élevée", ["U0250"], "Unité multimédia", "NHTSA", "Écran muet.")),
    R(55, "Chevrolet", "Bolt EV", [2019,2020,2021], I("Batterie LG incendie", "Élevée", ["P0A0A","P0A0B"], "Pack batterie", "NHTSA", "Rappel majeur.")),
    R(56, "BYD", "Atto 3", [2023,2024], I("Calibration ADAS", "Moyenne", ["C1001","C1003"], "MAJ + calibration", "SAFETY_GATE", "Caméra + radar.")),
    R(57, "MG", "MG4", [2023,2024], I("Multimédia redémarrages", "Faible", ["U0250"], "MAJ firmware", "SPECIALISTES", "Perte GPS.")),
    R(58, "Honda", "Civic", [2017,2018], I("1.5 Turbo dilution huile", "Élevée", ["P0172","P0562"], "MAJ ECU + vidange", "NHTSA", "Carburant dans huile.", "VTEC"))
  ],

  // ==========================================================
  async init() {
    const list = await DB.getAll('recalls');
    if (list.length === 0 || !list[0].dtcRelated) {
      await DB.clear('recalls');
      await this.populate();
    }
    try { await this.selfCheck(); } catch (e) { console.warn('selfCheck:', e); }
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
  async getByDTC(c) { const all = await DB.getAll('recalls'); return all.filter(r => (r.dtc || r.dtcRelated || []).includes(c)); },

  // ==========================================================
  // GÉNÉRATEUR STRICT PAR FAMILLE MOTEUR (dtc + dtcRelated)
  // ==========================================================
  getGenericIssues(engine) {
    const issues = [];
    const code = ((engine.engineCode || '') + ' ' + (engine.power || ''));
    const t = engine.fuelType || '';

    if (/PureTech/i.test(code)) {
      issues.push(
        I("Courroie distribution immergée 1.2 PureTech - usure prématurée", "Élevée", ["P0016","P0340","P0335"], "Kit distribution + crépine + vidange", "RAPPEL_CONSO", "Panne majeure PureTech."),
        I("Encrassement GPF", "Élevée", ["P2002","P242F","P2453","P2463","P200E"], "Nettoyage GPF + MAJ", "SPECIALISTES", "Voyant moteur."),
        I("Turbo - fuite huile", "Moyenne", ["P0299","P2262","P0234"], "Turbo + durites", "SPECIALISTES", "Perte puissance.")
      );
    }

    if (/BlueHDi|HDi/i.test(code)) {
      issues.push(
        I("Chaîne de distribution 7 mm usée - corrigée par chaîne 8 mm", "Élevée", ["P0016","P0340","P0335"], "Remplacement chaîne 7 mm par chaîne 8 mm renforcée + tendeur", "RAPPEL_CONSO", "Risque casse 1.5/1.6 BlueHDi."),
        I("FAP encrassé / température excessive", "Élevée", ["P200E","P2002","P242F","P2463","P2453"], "Régénération + MAJ ECU", "SPECIALISTES", "Panne fréquente."),
        I("Système AdBlue / capteur NOx (P20EE)", "Élevée", ["P20EE","P200E","P0087","P0193"], "Capteur NOx + AdBlue", "RAPPEL_CONSO", "Démarrage interdit."),
        I("Vanne EGR encrassée", "Moyenne", ["P0400","P0401","P0402","P0403"], "Nettoyage EGR", "SPECIALISTES", "Ratés, voyant."),
        I("Injecteurs - fuite interne", "Élevée", ["P0201","P0202","P0093","P0087"], "Injecteurs + joints", "NHTSA", "Odeur gazole.")
      );
    }

    if (t === 'Diesel' && !/BlueHDi|HDi/i.test(code)) {
      issues.push(
        I("Chaîne distribution - allongement", "Élevée", ["P0016","P0340","P0335"], "Chaîne + tendeur", "SAFETY_GATE", "Bruit à froid."),
        I("FAP encrassé", "Élevée", ["P200E","P2002","P242F","P2463"], "Régénération + MAJ", "SPECIALISTES", "Perte puissance."),
        I("Vanne EGR", "Moyenne", ["P0400","P0401","P0403"], "Nettoyage EGR", "SPECIALISTES", "Voyant moteur."),
        I("Injecteurs", "Élevée", ["P0201","P0202","P0093"], "Injecteurs", "NHTSA", "Claquement.")
      );
    }

    if (t === 'Essence' && !/PureTech/i.test(code)) {
      issues.push(
        I("Chaîne distribution - allongement", "Élevée", ["P0016","P0340","P0335"], "Chaîne + tendeur", "SAFETY_GATE", "Bruit à froid."),
        I("Calamine admission / turbo", "Moyenne", ["P0299","P0171","P0172"], "Décalaminage + bougies", "SPECIALISTES", "Ratés.")
      );
    }

    if (t === 'Electrique') {
      issues.push(
        I("BMS / équilibrage batterie traction", "Élevée", ["P0A0A","P0A0B","P0A1F"], "MAJ BMS", "NHTSA", "Perte autonomie."),
        I("Recharge AC/DC instable", "Moyenne", ["P0A08","P0A09"], "Chargeur + connecteur", "SPECIALISTES", "Coupures charge."),
        I("Freinage régénératif - récupération d'énergie", "Moyenne", ["P0A13","P0A14","P0A0F"], "MAJ logiciel + capteurs", "SPECIALISTES", "Régénération absente."),
        I("Pompe refroidissement batterie", "Moyenne", ["P0A11","P0A12"], "Pompe + liquide", "SAFETY_GATE", "Surchauffe.")
      );
    }

    if (t === 'Hybride' || /E-Tech|Hybrid|PHEV|HEV|e:HEV|GTE|e-POWER/i.test(code)) {
      issues.push(
        I("Pompe inverter", "Élevée", ["P0A11","P0A00","P0A0F"], "Pompe inverter", "NHTSA", "Panne connue."),
        I("Batterie 12V / DC-DC", "Moyenne", ["P0A08","P0A09","P0562"], "12V + DC-DC", "SPECIALISTES", "Alertes multiples."),
        I("Régénération freinage hybride", "Moyenne", ["P0A13","P0A0F"], "MAJ + capteurs", "SPECIALISTES", "Récupération irrégulière.")
      );
    }

    if (t === 'Flexfuel' || /ECO-G|E85/i.test(code)) {
      issues.push(
        I("Capteur éthanol/GPL - mélange", "Moyenne", ["P0171","P0172","P0455"], "Capteur + durites", "SPECIALISTES", "Ratés à froid.")
      );
    }

    issues.push(
      I("Boîte / réducteur - mécatronique, à-coups", "Élevée", ["P0700","P0715","P0720","P0842","P0868"], "Vidange + MAJ / mécatronique", "SPECIALISTES", "Passages durs."),
      I("Freinage - maître-cylindre / liquide", "Élevée", ["C0128","C1283","C0131"], "Maître-cylindre + purge", "SAFETY_GATE", "Pédale molle."),
      I("ABS / capteurs vitesse roues", "Élevée", ["C0035","C0040","C0045","C0050","C0110"], "Capteurs ABS", "SAFETY_GATE", "Voyant ABS/ESP."),
      I("Trains roulants - rotules, roulements, transmission", "Moyenne", ["C0710","C0750","C0840"], "Rotules, roulements, cardans", "SPECIALISTES", "Bruits, vibrations."),
      I("Direction assistée - circuit/moteur", "Élevée", ["C0455","C0460","C0472"], "Moteur direction + calibration", "NHTSA", "Durcissement."),
      I("Ceintures - prétensionneurs & boucles", "Élevée", ["B0003","B0004","B0010","B0011"], "Prétensionneurs + boucles", "SAFETY_GATE", "Voyant ceinture/airbag."),
      I("Airbags - capteurs & modules", "Élevée", ["B0001","B0002","B0007","B0012","B0013"], "Modules + faisceau", "NHTSA", "Voyant airbag."),
      I("Électrique - tension 12V / alternateur / DC-DC", "Moyenne", ["P0560","P0562","P0563"], "Batterie 12V + charge", "SPECIALISTES", "Redémarrages."),
      I("Électronique - multiplexage / BSI / COM2000", "Moyenne", ["U0140","U0155","U0250","U0400"], "Diagnostic bus + MAJ", "SPECIALISTES", "Pannes sporadiques."),
      I("ADAS - caméra / radar calibration", "Moyenne", ["C1001","C1003","C1100","C1102","C1112"], "Calibration", "SPECIALISTES", "Après choc/pare-brise.")
    );
    return issues;
  },

  getIssuesForVehicle(brand, model, year, engine) {
    const code = ((engine.engineCode || '') + ' ' + (engine.power || ''));
    const specific = this.recalls.filter(r =>
      r.brand === brand && r.model === model &&
      (!year || r.years.includes(year)) &&
      (!r.ef || new RegExp(r.ef, 'i').test(code))
    );
    return specific.concat(this.getGenericIssues(engine));
  },

  // ==========================================================
  // AUTOCONTRÔLE : vérifie les correctifs de la conversation
  // ==========================================================
  async selfCheck() {
    const out = [];
    const ok = (c, m) => out.push((c ? '✅ ' : '❌ ') + m);

    const diesel = { engineCode: '1.5 BlueHDi 130', fuelType: 'Diesel', power: '130ch' };
    const pure = { engineCode: '1.2 PureTech 130', fuelType: 'Essence', power: '130ch' };
    const ev = { engineCode: 'e-208', fuelType: 'Electrique', power: '136ch' };

    const iD = this.getIssuesForVehicle('Peugeot', '3008', 2020, diesel);
    ok(iD.some(i => /8 mm/i.test(i.title) || /8 mm/i.test(i.repair)), '3008 1.5 BlueHDi : chaîne 7→8 mm présente');
    ok(iD.some(i => (i.dtc || []).includes('P20EE')), '3008 1.5 BlueHDi : P20EE présent');
    ok(!iD.some(i => /PureTech/i.test(i.title)), '3008 1.5 BlueHDi : aucun défaut PureTech');

    const iP = this.getIssuesForVehicle('Peugeot', '3008', 2020, pure);
    ok(iP.some(i => /Courroie/i.test(i.title)), '3008 1.2 PureTech : courroie présente');
    ok(!iP.some(i => /7 mm|8 mm/i.test(i.title)), '3008 1.2 PureTech : pas de chaîne diesel');

    const iE = this.getIssuesForVehicle('Peugeot', '208', 2021, ev);
    ok(iE.some(i => /régénératif/i.test(i.title)), 'e-208 : régénération présente');
    ok(iE.some(i => /Recharge/i.test(i.title)), 'e-208 : recharge présente');

    ok(iD.every(i => (i.dtc || i.dtcRelated || []).length > 0), 'Toutes les pannes ont des codes DTC liés');

    const p20ee = await this.getByDTC('P20EE');
    ok(p20ee.length > 0, 'Recherche massive P20EE : ' + p20ee.length + ' résultat(s)');

    console.log('─── AUTOCONTRÔLE RECALLS_DB ───');
    out.forEach(l => console.log(l));
    window.RECALLS_SELFTEST = out;
    return out;
  }
};

function normalizeStr(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
