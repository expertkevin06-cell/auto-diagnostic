// ============================================================
// RAPPELS + PANNES MASSIVES CORRÉLÉES (dtc + dtcRelated partout)
// ============================================================
function I(title, severity, dtc, repair, source, description, ef) {
  const o = { title: title, severity: severity, dtc: dtc, dtcRelated: dtc, repair: repair, repairAction: repair, source: source, description: description };
  if (ef) o.ef = ef;
  return o;
}
function R(id, brand, model, years, issue) { issue.id = id; issue.brand = brand; issue.model = model; issue.years = years; return issue; }

const RECALLS_DB = {
  sources: { NHTSA: { name: "NHTSA" }, SAFETY_GATE: { name: "Safety Gate" }, RAPPEL_CONSO: { name: "Rappel Conso" }, SPECIALISTES: { name: "Spécialistes" } },

  recalls: [
    R(1,"Peugeot","3008",[2017,2018,2019],I("Incendie turbo 1.2 PureTech","Élevée",["P0299","P2262","P0234"],"Turbo + durites","RAPPEL_CONSO","Fuite huile turbo.","PureTech")),
    R(2,"Peugeot","3008",[2019,2020,2021],I("GPF encrassé 1.2 PureTech","Élevée",["P2002","P242F","P2453","P2463","P200E"],"Nettoyage GPF + MAJ","RAPPEL_CONSO","Voyant moteur.","PureTech")),
    R(3,"Peugeot","3008",[2018,2019,2020,2021],I("Chaîne 7 mm usée → corrigée chaîne 8 mm (1.5 BlueHDi)","Élevée",["P0016","P0340","P0335"],"Chaîne 8 mm renforcée + tendeur","RAPPEL_CONSO","Risque casse.","BlueHDi")),
    R(4,"Peugeot","3008",[2018,2019,2020,2021],I("AdBlue/NOx BlueHDi (P20EE)","Élevée",["P20EE","P200E","P0087","P0193"],"Capteur NOx + AdBlue + MAJ","RAPPEL_CONSO","Démarrage interdit.","BlueHDi")),
    R(5,"Peugeot","3008",[2020,2021],I("EAT8 à-coups à froid","Moyenne",["P0700","P0715","P0720"],"MAJ calculateur boîte","SAFETY_GATE","Bug logiciel.")),
    R(6,"Peugeot","5008",[2018,2019,2020,2021],I("Chaîne 7 mm → chaîne 8 mm (1.5 BlueHDi)","Élevée",["P0016","P0340","P0335"],"Chaîne 8 mm + tendeur","RAPPEL_CONSO","Usure chaîne 7 mm.","BlueHDi")),
    R(7,"Peugeot","5008",[2018,2019,2020,2021],I("AdBlue/NOx (P20EE)","Élevée",["P20EE","P200E"],"Capteur NOx + MAJ","RAPPEL_CONSO","Système NOx.","BlueHDi")),
    R(8,"Peugeot","5008",[2017,2018,2019],I("Fuite liquide frein","Élevée",["C1283","C0131"],"Maître-cylindre","RAPPEL_CONSO","Perte freinage.")),
    R(9,"Peugeot","208",[2019,2020],I("Courroie distribution 1.2 PureTech","Élevée",["P0016","P0340","P0335"],"Kit distribution + crépine","RAPPEL_CONSO","Courroie immergée.","PureTech")),
    R(10,"Peugeot","208",[2020,2021],I("e-208 batterie traction","Moyenne",["P0A0A","P0A0B","P0A1F"],"MAJ BMS","SPECIALISTES","Perte autonomie.","e-208")),
    R(11,"Peugeot","508",[2018,2019],I("Fuite carburant BlueHDi","Élevée",["P0087","P0093","P0193"],"Rampe + durites","SAFETY_GATE","Risque incendie.","BlueHDi")),
    R(12,"Peugeot","308",[2017,2018],I("Embrayage double embrayage","Élevée",["P0700","P0740","P0868"],"Kit embrayage + volant","RAPPEL_CONSO","Patinage.")),
    R(13,"Renault","Clio V",[2019,2020],I("Injecteurs 1.0 TCe","Élevée",["P0201","P0093"],"Injecteurs + joints","RAPPEL_CONSO","Risque incendie.","TCe")),
    R(14,"Renault","Captur II",[2020,2021],I("Freinage E-Tech","Élevée",["C1283","P0A0F"],"MAJ ABS/ESP","SAFETY_GATE","Pédale dure.","E-Tech")),
    R(15,"Renault","Zoe",[2019,2020,2021],I("Chargeur 52 kWh","Élevée",["P0A08","P0A09","P0A0B"],"MAJ BMS + chargeur","RAPPEL_CONSO","Anomalie charge.","R9|R10|R13")),
    R(16,"Renault","R5 E-Tech",[2024,2025,2026],I("Recharge DC instable","Moyenne",["P0A08","P0A09","P0A13"],"MAJ charge","SPECIALISTES","Coupures.","R5")),
    R(17,"Renault","R4 E-Tech",[2025,2026],I("Calibration BMS","Moyenne",["P0A0B","P0A1F"],"MAJ BMS","SPECIALISTES","SOC imprécis.","R4")),
    R(18,"Renault","Koleos",[2017,2018],I("CVT X-Tronic","Élevée",["P0740","P0700","P0868"],"Convertisseur + vidange","SAFETY_GATE","Surchauffe.")),
    R(19,"Citroën","C5 Aircross",[2019,2020],I("Courroie 1.2 PureTech","Élevée",["P0016","P0340"],"Kit distribution","RAPPEL_CONSO","Courroie huile.","PureTech")),
    R(20,"Citroën","ë-C4",[2021,2022],I("Charge AC lente","Moyenne",["P0A08"],"MAJ chargeur","SPECIALISTES","Bug charge.","ë-C4")),
    R(21,"DS","DS 7",[2019,2020],I("Connecteur E-Tense","Élevée",["P0A08"],"Câble + connecteur","RAPPEL_CONSO","Surchauffe.","E-Tense")),
    R(22,"Volkswagen","Golf VII",[2017,2018],I("Chaîne 1.4 TSI","Élevée",["P0016","P0340","P0335"],"Chaîne + tendeur","SAFETY_GATE","Casse EA211.","TSI")),
    R(23,"Volkswagen","Tiguan II",[2017,2018,2019],I("DSG mécatronique","Élevée",["P0700","P0715","P0720","P0842"],"Mécatronique","NHTSA","Perte propulsion.")),
    R(24,"Volkswagen","ID.4",[2020,2021],I("Arrêt propulsion","Élevée",["P0A1F","U0100"],"MAJ véhicule","RAPPEL_CONSO","Bug critique.")),
    R(25,"Volkswagen","ID.5",[2022,2023],I("Arrêt propulsion","Élevée",["P0A1F","U0100"],"MAJ véhicule","RAPPEL_CONSO","Campagne ID.")),
    R(26,"Volkswagen","Passat B8",[2017,2018],I("Injecteurs 2.0 TDI","Élevée",["P0201","P0202","P0203"],"Injecteurs","SAFETY_GATE","Incendie.","TDI")),
    R(27,"BMW","Série 3 (G20)",[2019,2020],I("Chaîne B48","Élevée",["P0016","P0340"],"Chaîne + guides","NHTSA","Guides fragiles.","20i|30i|B48")),
    R(28,"BMW","i4",[2022,2023],I("Batterie HT","Élevée",["P0A0A","P0A0B"],"Module batterie","RAPPEL_CONSO","Surchauffe.")),
    R(29,"Mercedes-Benz","GLC (X253)",[2017,2018],I("EGR incendie OM654","Élevée",["P0401","P0403","P2015"],"Vanne EGR","NHTSA","Fuite."," d|CDI")),
    R(30,"Audi","A4 (B9)",[2017,2018],I("Chaîne EA888","Élevée",["P0016","P0340"],"Chaîne + tendeur","SAFETY_GATE","Allongement.","TFSI")),
    R(31,"Opel","Grandland",[2018,2019],I("Courroie 1.2 Turbo","Élevée",["P0016","P0340"],"Kit distribution","RAPPEL_CONSO","Base PureTech.","1.2 Turbo")),
    R(32,"Opel","Grandland",[2018,2019,2020],I("Chaîne 7 mm → 8 mm (1.5 Diesel)","Élevée",["P0016","P0340","P0335"],"Chaîne 8 mm","RAPPEL_CONSO","Base BlueHDi.","1.5 Diesel")),
    R(33,"Opel","Insignia B",[2017,2018],I("EGR+FAP CDTI (P200E/P20EE)","Élevée",["P200E","P20EE","P242F","P0401"],"EGR + FAP + MAJ","SAFETY_GATE","Fréquent.","Diesel")),
    R(34,"Skoda","Enyaq",[2021,2022,2023],I("Connecteur charge","Moyenne",["P0A08"],"Connecteur + MAJ","SPECIALISTES","Surchauffe.")),
    R(35,"Skoda","Octavia",[2017,2018],I("Injecteurs 2.0 TDI","Élevée",["P0201","P0202"],"Injecteurs","SAFETY_GATE","Claquement.","TDI")),
    R(36,"Dacia","Sandero",[2021,2022,2023],I("MediaNav figé","Faible",["U0250"],"MAJ MediaNav","SPECIALISTES","Blocage.")),
    R(37,"Dacia","Duster",[2018,2019,2020],I("EGR 1.5 dCi","Moyenne",["P0400","P0401"],"Nettoyage EGR","SPECIALISTES","Encrassement.","dCi")),
    R(38,"Dacia","Spring",[2021,2022,2023],I("BMS limitation charge","Moyenne",["P0A0B","P0A08"],"MAJ BMS","SPECIALISTES","Bridage.")),
    R(39,"Toyota","RAV4",[2019,2020],I("Pompe inverter","Élevée",["P0A11","P0A00"],"Pompe inverter","NHTSA","Surchauffe.","Hybrid")),
    R(40,"Hyundai","Tucson",[2017,2018],I("Module ABS incendie","Élevée",["C0110","C0121"],"Module ABS","NHTSA","Feu.")),
    R(41,"Hyundai","Kona Electric",[2020,2021],I("Batterie LG","Élevée",["P0A0A","P0A0B"],"Pack batterie","SAFETY_GATE","Cellules.")),
    R(42,"Kia","EV6",[2022,2023],I("CCS surchauffe","Moyenne",["P0A08"],"Connecteur","SPECIALISTES","800V.")),
    R(43,"Nissan","Leaf",[2018,2019],I("Chargeur 6.6 kW","Moyenne",["P0A08","P0A09"],"Chargeur","NHTSA","Disjonction.")),
    R(44,"Ford","Mach-E",[2021,2022],I("Contacteur HT","Élevée",["P0A0A","P0A1F"],"Contacteur + MAJ","NHTSA","Ouverture.")),
    R(45,"Tesla","Model 3",[2019,2020,2021],I("Écran flash","Élevée",["U0250"],"Unité multimédia","NHTSA","Muet.")),
    R(46,"BYD","Atto 3",[2023,2024],I("Calibration ADAS","Moyenne",["C1001","C1003"],"MAJ + calibration","SAFETY_GATE","Caméra.")),
    R(47,"MG","MG4",[2023,2024],I("Multimédia","Faible",["U0250"],"MAJ firmware","SPECIALISTES","GPS."))
  ],

  async init() {
    const list = await DB.getAll('recalls');
    if (list.length === 0 || !list[0].dtcRelated) { await DB.clear('recalls'); await this.populate(); }
  },
  async populate() {
    await DB.bulkAdd('recalls', this.recalls);
    await DB.update('meta', { key: 'lastRecallUpdate', value: Date.now() });
  },
  async checkAndUpdate() {
    const now = Date.now(), fd = 15*24*60*60*1000;
    const meta = await DB.get('meta', 'lastRecallUpdate');
    const last = meta ? meta.value : 0;
    if (!last || (now - last) >= fd) { await DB.update('meta', { key: 'lastRecallUpdate', value: now }); return true; }
    return false;
  },
  async search(brand, model, year) {
    const all = await DB.getAll('recalls');
    return all.filter(r => (!brand || r.brand.toLowerCase() === String(brand).toLowerCase()) && (!model || r.model.toLowerCase().includes(String(model).toLowerCase())) && (!year || r.years.includes(year)));
  },
  async getBySeverity(s) { return (await DB.getAll('recalls')).filter(r => r.severity === s); },
  async getByDTC(c) { return (await DB.getAll('recalls')).filter(r => (r.dtc || r.dtcRelated || []).includes(c)); },

  getFamilyIssues(engine) {
    const issues = [];
    const code = ((engine.engineCode || '') + ' ' + (engine.power || ''));
    const t = engine.fuelType || '';
    if (/PureTech/i.test(code)) issues.push(
      I("Courroie distribution immergée PureTech","Élevée",["P0016","P0340","P0335"],"Kit distribution + crépine","RAPPEL_CONSO","Usure courroie."),
      I("GPF encrassé","Élevée",["P2002","P242F","P2453","P2463","P200E"],"Nettoyage GPF + MAJ","SPECIALISTES","Voyant."),
      I("Turbo fuite huile","Moyenne",["P0299","P2262","P0234"],"Turbo + durites","SPECIALISTES","Perte puissance."));
    if (/BlueHDi|HDi/i.test(code)) issues.push(
      I("Chaîne 7 mm usée → chaîne 8 mm","Élevée",["P0016","P0340","P0335"],"Chaîne 8 mm renforcée + tendeur","RAPPEL_CONSO","Risque casse."),
      I("FAP / température (P200E)","Élevée",["P200E","P2002","P242F","P2463","P2453"],"Régénération + MAJ","SPECIALISTES","Fréquent."),
      I("AdBlue / NOx (P20EE)","Élevée",["P20EE","P200E","P0087","P0193"],"Capteur NOx + AdBlue","RAPPEL_CONSO","Démarrage interdit."),
      I("EGR encrassée","Moyenne",["P0400","P0401","P0402","P0403"],"Nettoyage EGR","SPECIALISTES","Ratés."),
      I("Injecteurs fuite","Élevée",["P0201","P0202","P0093","P0087"],"Injecteurs + joints","NHTSA","Odeur."));
    if (t === 'Diesel' && !/BlueHDi|HDi/i.test(code)) issues.push(
      I("Chaîne allongement","Élevée",["P0016","P0340","P0335"],"Chaîne + tendeur","SAFETY_GATE","Bruit."),
      I("FAP encrassé","Élevée",["P200E","P2002","P242F","P2463"],"Régénération + MAJ","SPECIALISTES","Perte."),
      I("EGR","Moyenne",["P0400","P0401","P0403"],"Nettoyage","SPECIALISTES","Voyant."),
      I("Injecteurs","Élevée",["P0201","P0202","P0093"],"Injecteurs","NHTSA","Claquement."));
    if (t === 'Essence' && !/PureTech/i.test(code)) issues.push(
      I("Chaîne allongement","Élevée",["P0016","P0340","P0335"],"Chaîne + tendeur","SAFETY_GATE","Bruit."),
      I("Calamine / turbo","Moyenne",["P0299","P0171","P0172"],"Décalaminage","SPECIALISTES","Ratés."));
    if (t === 'Electrique') issues.push(
      I("BMS / équilibrage","Élevée",["P0A0A","P0A0B","P0A1F"],"MAJ BMS","NHTSA","Autonomie."),
      I("Recharge AC/DC","Moyenne",["P0A08","P0A09"],"Chargeur + connecteur","SPECIALISTES","Coupures."),
      I("Freinage régénératif","Moyenne",["P0A13","P0A14","P0A0F"],"MAJ + capteurs","SPECIALISTES","Régénération."),
      I("Pompe refroidissement","Moyenne",["P0A11","P0A12"],"Pompe + liquide","SAFETY_GATE","Surchauffe."));
    if (t === 'Hybride' || /E-Tech|Hybrid|PHEV|HEV|e:HEV|GTE|e-POWER/i.test(code)) issues.push(
      I("Pompe inverter","Élevée",["P0A11","P0A00","P0A0F"],"Pompe inverter","NHTSA","Connue."),
      I("12V / DC-DC","Moyenne",["P0A08","P0A09","P0562"],"12V + DC-DC","SPECIALISTES","Alertes."),
      I("Régénération hybride","Moyenne",["P0A13","P0A0F"],"MAJ + capteurs","SPECIALISTES","Irrégulière."));
    if (t === 'Flexfuel' || /ECO-G|E85/i.test(code)) issues.push(
      I("Capteur éthanol/GPL","Moyenne",["P0171","P0172","P0455"],"Capteur + durites","SPECIALISTES","Ratés."));
    issues.forEach(i => { i.fam = true; });
    return issues;
  },

  getCommonIssues() {
    const c = [
      I("Boîte / réducteur","Élevée",["P0700","P0715","P0720","P0842","P0868"],"Vidange + MAJ","SPECIALISTES","À-coups."),
      I("Freinage maître-cylindre","Élevée",["C0128","C1283","C0131"],"Purge + maître-cyl.","SAFETY_GATE","Pédale."),
      I("ABS roues","Élevée",["C0035","C0040","C0045","C0050","C0110"],"Capteurs ABS","SAFETY_GATE","Voyant."),
      I("Trains roulants","Moyenne",["C0710","C0750","C0840"],"Rotules, roulements","SPECIALISTES","Bruits."),
      I("Direction","Élevée",["C0455","C0460","C0472"],"Moteur direction","NHTSA","Dure."),
      I("Ceintures","Élevée",["B0003","B0004","B0010","B0011"],"Prétensionneurs","SAFETY_GATE","Voyant."),
      I("Airbags","Élevée",["B0001","B0002","B0007","B0012","B0013"],"Modules","NHTSA","Voyant."),
      I("Électrique 12V","Moyenne",["P0560","P0562","P0563"],"Batterie + charge","SPECIALISTES","Alertes."),
      I("Électronique bus","Moyenne",["U0140","U0155","U0250","U0400"],"Diagnostic bus","SPECIALISTES","Sporadique."),
      I("ADAS calibration","Moyenne",["C1001","C1003","C1100","C1102","C1112"],"Calibration","SPECIALISTES","Choc.")
    ];
    c.forEach(i => { i.com = true; });
    return c;
  },

  getIssuesForVehicle(brand, model, year, engine) {
    const code = ((engine.engineCode || '') + ' ' + (engine.power || ''));
    const specific = this.recalls.filter(r => r.brand === brand && r.model === model && (!year || r.years.includes(year)) && (!r.ef || new RegExp(r.ef, 'i').test(code)));
    return specific.concat(this.getFamilyIssues(engine), this.getCommonIssues());
  }
};
function normalizeStr(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
