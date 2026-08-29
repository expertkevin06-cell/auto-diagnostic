// ============================================================
// AUTO-DIAGNOSTIC PRO - CODES DÉFAUTS DTC (complet corrigé)
// Format compact [code, catégorie, système, sévérité]
// ============================================================

const DTC_DATA = [
  // ----- MOTEUR ESSENCE / COMMUNS -----
  ["P0001","Moteur","Circuit régulateur débit carburant A","Moyenne"],
  ["P0011","Moteur","Calage arbre à cames A - avance excessive","Moyenne"],
  ["P0016","Moteur","Corrélation vilebrequin/arbre à cames A","Élevée"],
  ["P0017","Moteur","Corrélation vilebrequin/arbre à cames B","Élevée"],
  ["P0030","Moteur","Circuit sonde lambda - chauffage","Moyenne"],
  ["P0036","Moteur","Circuit sonde lambda B - chauffage","Moyenne"],
  ["P0087","Moteur","Pression rail carburant trop basse","Élevée"],
  ["P0088","Moteur","Pression rail carburant trop élevée","Élevée"],
  ["P0093","Moteur","Fuite importante circuit carburant","Élevée"],
  ["P0101","Moteur","Débitmètre air massique (MAF)","Faible"],
  ["P0115","Moteur","Capteur température liquide refroidissement","Moyenne"],
  ["P0121","Moteur","Capteur position papillon","Élevée"],
  ["P0128","Moteur","Thermostat - température insuffisante","Faible"],
  ["P0130","Moteur","Circuit sonde lambda rangée 1","Moyenne"],
  ["P0171","Moteur","Mélange trop pauvre","Moyenne"],
  ["P0172","Moteur","Mélange trop riche","Moyenne"],
  ["P0201","Moteur","Circuit injecteur cylindre 1","Élevée"],
  ["P0202","Moteur","Circuit injecteur cylindre 2","Élevée"],
  ["P0203","Moteur","Circuit injecteur cylindre 3","Élevée"],
  ["P0204","Moteur","Circuit injecteur cylindre 4","Élevée"],
  ["P0219","Moteur","Régime moteur excessif","Élevée"],
  ["P0234","Moteur","Suralimentation turbo excessive","Élevée"],
  ["P0299","Moteur","Sous-pression turbo","Élevée"],
  ["P0300","Moteur","Ratés d'allumage aléatoires","Élevée"],
  ["P0301","Moteur","Ratés cylindre 1","Élevée"],
  ["P0302","Moteur","Ratés cylindre 2","Élevée"],
  ["P0303","Moteur","Ratés cylindre 3","Élevée"],
  ["P0304","Moteur","Ratés cylindre 4","Élevée"],
  ["P0325","Moteur","Capteur de cliquetis","Moyenne"],
  ["P0335","Moteur","Capteur position vilebrequin","Élevée"],
  ["P0340","Moteur","Capteur position arbre à cames","Élevée"],
  ["P0351","Moteur","Bobine allumage A","Élevée"],
  ["P0352","Moteur","Bobine allumage B","Élevée"],
  ["P0420","Moteur","Efficacité catalyseur sous seuil","Moyenne"],
  ["P0441","Moteur","Débit incorrect système EVAP","Faible"],
  ["P0455","Moteur","Fuite importante système EVAP","Faible"],
  ["P0480","Moteur","Circuit ventilateur refroidissement","Élevée"],
  ["P0500","Moteur","Capteur vitesse véhicule","Moyenne"],
  ["P0562","Moteur","Tension système basse","Moyenne"],
  ["P0606","Moteur","Processeur calculateur moteur","Élevée"],
  // ----- DIESEL / FAP / ADBLUE -----
  ["P0400","Moteur Diesel","Circuit vanne EGR","Moyenne"],
  ["P0401","Moteur Diesel","Débit EGR insuffisant","Moyenne"],
  ["P0402","Moteur Diesel","Débit EGR excessif","Moyenne"],
  ["P0403","Moteur Diesel","Circuit commande vanne EGR","Moyenne"],
  ["P0470","Moteur Diesel","Capteur pression échappement","Moyenne"],
  ["P0488","Moteur Diesel","Plage commande vanne EGR","Moyenne"],
  ["P1197","Moteur Diesel","Niveau additif FAP bas","Moyenne"],
  ["P1247","Moteur Diesel","Pression turbo faible","Élevée"],
  ["P2002","Moteur Diesel","Efficacité FAP inférieure seuil","Élevée"],
  ["P200E","Moteur Diesel","Température FAP trop élevée","Élevée"],
  ["P200F","Moteur Diesel","Température FAP élevée banque 2","Élevée"],
  ["P20EE","Moteur Diesel","Efficacité système NOx (AdBlue)","Élevée"],
  ["P2262","Moteur Diesel","Pression turbo non détectée","Élevée"],
  ["P2263","Moteur Diesel","Performances suralimentation","Élevée"],
  ["P242F","Moteur Diesel","Restriction FAP - régénération forcée","Élevée"],
  ["P2453","Moteur Diesel","Capteur pression différentielle FAP","Moyenne"],
  ["P2457","Moteur Diesel","Refroidissement EGR efficacité","Moyenne"],
  ["P2463","Moteur Diesel","FAP encrassement","Élevée"],
  ["P2563","Moteur Diesel","Circuit commande turbo","Élevée"],
  ["P2602","Moteur Diesel","Pompe liquide refroidissement","Élevée"],
  // ----- BOÎTE DE VITESSES -----
  ["P0700","Boîte","Circuit commande boîte de vitesses","Élevée"],
  ["P0705","Boîte","Capteur position sélecteur","Élevée"],
  ["P0715","Boîte","Capteur vitesse arbre primaire","Élevée"],
  ["P0720","Boîte","Capteur vitesse arbre secondaire","Élevée"],
  ["P0730","Boîte","Rapport incorrect","Élevée"],
  ["P0740","Boîte","Convertisseur de couple","Élevée"],
  ["P0750","Boîte","Électrovanne A","Élevée"],
  ["P0755","Boîte","Électrovanne B","Élevée"],
  ["P0760","Boîte","Électrovanne C","Élevée"],
  ["P0770","Boîte","Électrovanne E","Élevée"],
  ["P0780","Boîte","Problème passage rapport","Élevée"],
  ["P0841","Boîte","Capteur pression hydraulique A","Moyenne"],
  ["P0842","Boîte","Capteur pression hydraulique A bas","Moyenne"],
  ["P0868","Boîte","Pression fluide boîte basse","Élevée"],
  ["P0882","Boîte","Alimentation calculateur boîte basse","Élevée"],
  ["P0897","Boîte","Dégradation fluide boîte","Moyenne"],
  ["P0962","Boîte","Commande pression A basse","Élevée"],
  ["P0963","Boîte","Commande pression A haute","Élevée"],
  ["P0973","Boîte","Électrovanne A commande bas","Élevée"],
  ["P0974","Boîte","Électrovanne A commande haut","Élevée"],
  ["P0976","Boîte","Électrovanne B commande bas","Élevée"],
  ["P0977","Boîte","Électrovanne B commande haut","Élevée"],
  ["P1769","Boîte","Électrovanne modulation pression","Élevée"],
  ["P1811","Boîte","Adaptation pression ligne","Moyenne"],
  ["P1860","Boîte","Embrayage convertisseur couple","Élevée"],
  ["P2714","Boîte","Électrovanne D performance","Élevée"],
  ["P2763","Boîte","Pompe fluide boîte haute","Élevée"],
  ["P2764","Boîte","Pompe fluide boîte basse","Élevée"],
  ["P2769","Boîte","Commande couple basse","Élevée"],
  ["P2770","Boîte","Commande couple haute","Élevée"],
  // ----- FREINAGE / ABS -----
  ["C0035","Freinage/ABS","Capteur vitesse roue avant gauche","Élevée"],
  ["C0040","Freinage/ABS","Capteur vitesse roue avant droit","Élevée"],
  ["C0045","Freinage/ABS","Capteur vitesse roue arrière gauche","Élevée"],
  ["C0050","Freinage/ABS","Capteur vitesse roue arrière droit","Élevée"],
  ["C0110","Freinage/ABS","Circuit pompe ABS","Élevée"],
  ["C0121","Freinage/ABS","Circuit électrovanne ABS","Élevée"],
  ["C0128","Freinage/ABS","Niveau liquide frein bas","Élevée"],
  ["C0131","Freinage/ABS","Circuit capteur pression frein","Élevée"],
  ["C0196","Freinage/ABS","Capteur lacet / ESP","Moyenne"],
  ["C0265","Freinage/ABS","Relais pompe ABS","Élevée"],
  ["C0267","Freinage/ABS","Pompe ABS bloquée","Élevée"],
  ["C0550","Freinage/ABS","Calculateur ESP","Élevée"],
  ["C0561","Freinage/ABS","Système ABS désactivé","Élevée"],
  ["C0800","Freinage/ABS","Alimentation calculateur","Élevée"],
  ["C0896","Freinage/ABS","Tension calculateur basse","Élevée"],
  ["C1200","Freinage/ABS","Moteur roue avant gauche","Élevée"],
  ["C1205","Freinage/ABS","Moteur roue avant droit","Élevée"],
  ["C1210","Freinage/ABS","Moteur roue arrière gauche","Élevée"],
  ["C1215","Freinage/ABS","Moteur roue arrière droit","Élevée"],
  ["C1221","Freinage/ABS","Capteur roue avant gauche","Élevée"],
  ["C1225","Freinage/ABS","Capteur roue avant droit","Élevée"],
  ["C1228","Freinage/ABS","Capteur roue arrière gauche","Élevée"],
  ["C1231","Freinage/ABS","Capteur roue arrière droit","Élevée"],
  ["C1241","Freinage/ABS","Basse tension alimentation","Élevée"],
  ["C1283","Freinage/ABS","Maître-cylindre / pression","Élevée"],
  // ----- ADAS / CAMÉRAS -----
  ["C1001","ADAS/Caméra","Capteur radar avant","Élevée"],
  ["C1002","ADAS/Caméra","Capteur radar arrière","Élevée"],
  ["C1003","ADAS/Caméra","Caméra avant détection","Élevée"],
  ["C1100","ADAS/Caméra","Freinage automatique d'urgence","Élevée"],
  ["C1101","ADAS/Caméra","Aide maintien dans la voie","Élevée"],
  ["C1102","ADAS/Caméra","Régulateur adaptatif (ACC)","Élevée"],
  ["C1103","ADAS/Caméra","Détection angle mort","Moyenne"],
  ["C1104","ADAS/Caméra","Alerte franchissement ligne","Moyenne"],
  ["C1105","ADAS/Caméra","Reconnaissance panneaux","Faible"],
  ["C1106","ADAS/Caméra","Caméra 360°","Moyenne"],
  ["C1107","ADAS/Caméra","Aide stationnement","Moyenne"],
  ["C1108","ADAS/Caméra","Détection piétons","Élevée"],
  ["C1110","ADAS/Caméra","Caméra de recul","Moyenne"],
  ["C1112","ADAS/Caméra","Calibration caméra","Élevée"],
  ["C1113","ADAS/Caméra","Obstruction caméra","Moyenne"],
  // ----- ÉLECTRONIQUE / CEINTURES / AIRBAGS -----
  ["B0001","Électronique/Ceinture","Circuit airbag conducteur","Élevée"],
  ["B0002","Électronique/Ceinture","Circuit airbag passager","Élevée"],
  ["B0003","Électronique/Ceinture","Prétensionneur ceinture conducteur","Élevée"],
  ["B0004","Électronique/Ceinture","Prétensionneur ceinture passager","Élevée"],
  ["B0005","Électronique/Ceinture","Capteur choc avant","Élevée"],
  ["B0006","Électronique/Ceinture","Capteur choc latéral","Élevée"],
  ["B0007","Électronique/Ceinture","Airbag rideau","Élevée"],
  ["B0009","Électronique/Ceinture","Capteur occupation siège","Moyenne"],
  ["B0010","Électronique/Ceinture","Boucle ceinture conducteur","Moyenne"],
  ["B0011","Électronique/Ceinture","Boucle ceinture passager","Moyenne"],
  ["B0012","Électronique/Ceinture","Témoin airbag","Élevée"],
  ["B0013","Électronique/Ceinture","Calculateur airbag","Élevée"],
  // ----- ÉLECTRIQUE / HYBRIDE -----
  ["P0A00","Électrique/Hybride","Moteur/générateur électronique","Élevée"],
  ["P0A0A","Électrique/Hybride","Circuit haute tension batterie","Élevée"],
  ["P0A0B","Électrique/Hybride","Batterie hybride basse","Élevée"],
  ["P0A0C","Électrique/Hybride","Circuit générateur hybride","Élevée"],
  ["P0A0F","Électrique/Hybride","Démarrage moteur hybride","Élevée"],
  ["P0A08","Électrique/Hybride","Convertisseur DC-DC","Élevée"],
  ["P0A09","Électrique/Hybride","Tension DC-DC basse","Élevée"],
  ["P0A11","Électrique/Hybride","Pompe refroidissement inverter","Élevée"],
  ["P0A12","Électrique/Hybride","Refroidissement hybride","Élevée"],
  ["P0A1F","Électrique/Hybride","Calculateur batterie (BMS)","Élevée"],
  ["P0A1E","Électrique/Hybride","Générateur hybride","Élevée"],
  ["P0A19","Électrique/Hybride","Moteur hybride","Élevée"],
  // ----- SPORADIQUE / BUS CAN / MAJ CALCULATEURS -----
  ["U0001","Sporadique/MAJ","Bus CAN haute vitesse","Élevée"],
  ["U0002","Sporadique/MAJ","Bus CAN haute vitesse performance","Élevée"],
  ["U0100","Sporadique/MAJ","Perte communication calculateur moteur","Élevée"],
  ["U0101","Sporadique/MAJ","Perte communication calculateur boîte","Élevée"],
  ["U0121","Sporadique/MAJ","Perte communication calculateur ABS","Élevée"],
  ["U0140","Sporadique/MAJ","Perte communication calculateur carrosserie","Moyenne"],
  ["U0155","Sporadique/MAJ","Perte communication tableau de bord","Moyenne"],
  ["U0250","Sporadique/MAJ","Perte communication module divertissement","Faible"],
  ["U0300","Sporadique/MAJ","Incompatibilité logiciel interne (MAJ)","Élevée"],
  ["U0301","Sporadique/MAJ","Incompatibilité calculateur moteur","Élevée"],
  ["U0400","Sporadique/MAJ","Données invalides reçues","Élevée"],
  ["U0401","Sporadique/MAJ","Données invalides calculateur moteur","Élevée"],
  ["U0415","Sporadique/MAJ","Données invalides calculateur ABS","Élevée"]
];

// ============================================================
const DTC_DB = {

  ALL_BRANDS: ["Peugeot","Renault","Citroën","DS","Opel","Volkswagen","BMW","Mercedes-Benz","Audi","Skoda","Dacia","Toyota","Nissan","Mazda","Honda","Hyundai","Kia","Ford","Chevrolet","Tesla","BYD","MG"],

  async init() {
    const list = await DB.getAll('dtcCodes');
    // Vide ou ancien format sans sévérité -> repeupler
    if (list.length === 0 || !list[0].severity) {
      await DB.clear('dtcCodes');
      await this.populate();
    }
  },

  async populate() {
    console.log("🔄 Peuplement base DTC...");
    const items = DTC_DATA.map(d => ({
      code: d[0],
      category: d[1],
      system: d[2],
      severity: d[3],
      brands: this.ALL_BRANDS,
      addedAt: Date.now()
    }));
    await DB.bulkAdd('dtcCodes', items);
    console.log("✅ " + items.length + " codes DTC ajoutés");
  },

  async getByCode(code) {
    return await DB.get('dtcCodes', (code || '').toUpperCase());
  },

  async search(query) {
    const all = await DB.getAll('dtcCodes');
    const q = dtcNorm(query);
    if (!q) return [];
    return all.filter(d =>
      d.code.toLowerCase().includes(q) ||
      dtcNorm(d.system).includes(q) ||
      dtcNorm(d.category).includes(q)
    );
  },

  async getByCategory(category) {
    return await DB.query('dtcCodes', d => (d.category || '').includes(category));
  },

  async getBySeverity(severity) {
    return await DB.getByIndex('dtcCodes', 'severity', severity);
  },

  async getByBrand(brand) {
    return await DB.query('dtcCodes', d => (d.brands || []).includes(brand));
  }
};

function dtcNorm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
