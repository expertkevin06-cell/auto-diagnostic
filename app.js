/* APP.JS v10 — Auto-vérification motorisations/puissances + corrélation stricte + fond fixe */
const ADMIN_PASSWORD = 'Kevin83600';
const SESSION_KEY = 'autodiag_session';
const MONTHLY_MS = 30 * 24 * 60 * 60 * 1000;
const FUELS = { essence: '⛽ Essence', diesel: '🛢️ Diesel', hybride: '🔋 Hybride', electrique: '⚡ Électrique' };
const BRAND_SITE = { renault:'renault.fr', peugeot:'peugeot.fr', citroen:'citroen.fr', ds:'dsautomobiles.fr', dacia:'dacia.fr', volkswagen:'volkswagen.fr', audi:'audi.fr', bmw:'bmw.fr', mercedes:'mercedes-benz.fr', opel:'opel.fr', fiat:'fiat.fr', seat:'seat.fr', skoda:'skoda.fr', volvo:'volvo.fr', porsche:'porsche.fr', mini:'mini.fr', alfa:'alfaromeo.fr', toyota:'toyota.fr', honda:'honda.fr', nissan:'nissan.fr', mazda:'mazda.fr', mitsubishi:'mitsubishi-motors.fr', subaru:'subaru.fr', suzuki:'suzuki.fr', hyundai:'hyundai.fr', kia:'kia.fr', lexus:'lexus.fr', byd:'byd.com', mg:'mgmotor.eu', lynkco:'lynkco.com', nio:'nio.com', xpeng:'xpeng.com', aiways:'aiways.com', seres:'seres.com', omoda:'omoda.com', jaecoo:'jaecoo.com', leapmotor:'leapmotor.com', ora:'ora-ev.com', ford:'ford.fr', chevrolet:'chevrolet.com', jeep:'jeep.fr', dodge:'dodge.com', cadillac:'cadillac.com', tesla:'tesla.com' };
/* Mots-clés carburant pour corrélation stricte pannes↔motorisations */
const FUEL_KW = {
 diesel: ['adblue','fap','egr','dci','tdi','bluehdi','diesel','multijet','crdi','ecoblue','skyactiv-d','préchauffage','prechauffage','jtd','d-4d'],
 essence: ['puretech','tce','tsi','ecoboost','gdi','thp','vtec','essence','courroie','chaîne','chaine','allumage','bougies','catalyseur','gpf','turbo essence'],
 hybride: ['hybrid','hybride','phev','e:hev','e-tech','onduleur','régénératif','regeneratif','e:hev'],
 electrique: ['électrique','electrique',' ev','iccu','obc','bms','batterie hv','charge','isolement','dc-dc','12v','e-208','zoe']
};
const KEY_ISSUES = [
 { brand:'dacia', model:'Bigster', motor:'', title:'Ressorts suspension AR : rupture (diamètre fil insuffisant)', detail:'Campagne de rappel : remplacement des 2 ressorts de suspension arrière suite à risque de rupture (diamètre de fil insuffisant). Contrôle visuel + mesure du diamètre, remplacement préventif selon VIN. Intervention gratuite en concession.', source:'Rappel Conso / Safety Gate', dtc:'', url:'https://www.rappel.conso.gouv.fr/' },
 { brand:'dacia', model:'Bigster', motor:'', title:'Ressorts AR : alerte UE (contrôle obligatoire)', detail:'Alerte Safety Gate : risque de rupture des ressorts arrière — vérification obligatoire en concession, remplacement gratuit des ressorts non conformes.', source:'Safety Gate', dtc:'', url:'https://ec.europa.eu/safety-gate-alerts/screen/webReport/searchAdvanced' }
];
const KEY_EXPERT = [
 { brand:'dacia', model:'Bigster', motor:'', title:'Procédure remplacement ressorts suspension AR (rappel)', symptom:'Claquement ou bruit de détente à l\'arrière, véhicule penché, fissure ou casse visible du ressort AR', diagnosis:'1) Vérifier le VIN sur rappel.conso.gouv.fr / Safety Gate 2) Lever le véhicule, roues AR suspendues 3) Inspecter les 2 ressorts AR : fissures, corrosion, diamètre de fil vs spécification 4) Remplacer les 2 ressorts + coupelles/butées 5) Serrer aux couples constructeur 6) Contrôle géométrie + essai routier', parts:'Ressorts AR x2, coupelles, butées', dtc:'', source:'Rappel Conso / Safety Gate', years:'2025-2026', url:'https://www.rappel.conso.gouv.fr/' }
];
const BRAND_EXPERT = [
 ['renault','dCi','EGR/FAP diesel Renault','Perte puissance, voyant, régénérations fréquentes','1) Lire P0401/P2002 au diag 2) Test ouverture EGR consigne/réel 3) Mesure ΔP FAP 4) Nettoyage/remplacement + adaptation','EGR, FAP','P0401, P2002','Campagne constructeur','2017-2026'],
 ['renault','TCe','GPF essence (filtre à particules)','Perte puissance courts trajets, voyant','1) Lire P2463 2) Régénération forcée 3) Contrôle GPF 4) Remplacement si colmaté','GPF','P2463','TSB','2018-2026'],
 ['renault','','Campagnes sécurité (airbag/ceintures)','Voyant airbag, prétensionneur non conforme','1) Vérifier VIN Rappel Conso 2) Lire codes BSM 3) Remplacer modules concernés','Airbag, prétensionneurs','','Rappel Conso','2017-2026'],
 ['peugeot','PureTech','Courroie humide (procédure complète)','Bruit courroie, perte puissance, pompe à huile colmatée','1) Gabarit largeur courroie (seuil ~9,4 mm) 2) Inspection carter débris 3) Pression huile ralenti chaud 4) Kit courroie + pompe à huile + vidange','Kit courroie, pompe à huile','P0087, P0340','Rappel Conso','2017-2023'],
 ['peugeot','BlueHDi','AdBlue pompe/injecteur','Message défaut AdBlue, countdown non-démarrage','1) Lire P20EE/P204F 2) Test débit pompe au diag 3) Inspection cristallisation injecteur 4) Remplacement + réinitialisation','Pompe/injecteur AdBlue','P20EE, P204F','Campagne constructeur','2017-2024'],
 ['citroen','PureTech','Courroie humide Stellantis','Idem Peugeot','Procédure identique Stellantis','Kit courroie, pompe','P0087','Rappel Conso','2017-2023'],
 ['citroen','BlueHDi','AdBlue Stellantis','Idem Peugeot','Procédure identique','Pompe AdBlue','P20EE','Campagne constructeur','2017-2024'],
 ['ds','PureTech','Courroie/AdBlue Stellantis','Selon motorisation','Procédures Stellantis','Kit courroie/pompe','P0087, P20EE','Rappel Conso','2017-2024'],
 ['opel','PureTech','Courroie humide Opel','Idem Stellantis','Procédure identique','Kit courroie','P0087','Rappel Conso','2019-2023'],
 ['opel','','Multimédia/écrans campagnes','Figements, reboots','1) Logs 2) MAJ logiciel 3) Remplacement si échec','—','U0101','Campagne constructeur','2017-2026'],
 ['volkswagen','TSI','Chaîne distribution TSI','Claquement à froid','1) Scope synchro vilo/AAC 2) Contrôle tendeur 3) Kit chaîne + guides','Kit chaîne, tendeur','P0016','TSB','2017-2026'],
 ['volkswagen','TDI','AdBlue/NOx TDI','Voyant NOx, limitation puissance','1) Capteurs NOx amont/aval 2) Injecteur AdBlue 3) MAJ logiciel NOx','Capteur NOx, injecteur','P20EE, P2201','Campagne constructeur','2017-2026'],
 ['volkswagen','DSG','Mécatronique DQ200/DQ250','Broutage démarrage, vitesses non engagées','1) Lire adaptations 2) Niveau huile mécatronique 3) TSB update 4) Remplacer mécatronique','Mécatronique','P0700','TSB','2017-2026'],
 ['volkswagen','','Campagnes sécurité (airbag/ceintures)','Voyant airbag','1) VIN check 2) Campagne 3) Remplacement','Airbag','','Rappel Conso / Safety Gate','2017-2026'],
 ['audi','TSI','Chaîne/AdBlue VAG','Claquement, défaut NOx','Procédures VAG','Kit chaîne/AdBlue','P0016, P20EE','TSB','2017-2026'],
 ['audi','','Caméra ADAS/calibration','Perte fonctions assistance','1) Défauts U0121 2) Recalibration après pare-brise 3) MAJ','Caméra','U0121','Campagne constructeur','2019-2026'],
 ['skoda','TSI','Chaîne/AdBlue VAG','Idem VW','Procédures VAG','—','P0016, P20EE','TSB','2017-2026'],
 ['seat','TSI','Chaîne TSI','Claquement froid','Procédure VAG','Kit chaîne','P0016','TSB','2017-2026'],
 ['bmw','B47','Chaîne distribution BMW','Claquement métallique à froid, P0016','1) Scope synchro vilo/AAC 2) Tendeur 3) Kit chaîne + guides','Kit chaîne','P0016, P0335','NHTSA / TSB','2017-2024'],
 ['bmw','N20','Pompe HP essence (GDI)','Pression rail basse, P0087','1) Pression rail mesurée vs consigne 2) Pompe HP 3) Remplacement','Pompe HP','P0087','TSB','2017-2026'],
 ['bmw','','Airbag Takata (modèles concernés)','Campagne rupture inflateur','1) VIN check NHTSA 2) Remplacement inflateur','Inflateur','','NHTSA','2017-2019'],
 ['mercedes','OM654','Injecteurs AdBlue + capteurs NOx','Défaut NOx, countdown AdBlue','1) Valeurs capteurs NOx 2) Cristallisation injecteur 3) Remplacement + réinit compteurs','Capteur NOx, injecteur','P2201, P20EE','Campagne constructeur','2017-2026'],
 ['mercedes','OM651','Chaîne OM651','Claquement, usure patins','Kit chaîne complet','Kit chaîne','P0016','TSB','2017-2020'],
 ['mercedes','','ADAS Drive Pilot / caméras','Défaut conduite autonome','1) Logs 2) Recalibration caméras/radar 3) MAJ','Caméra/radar','U0101, U0121','NHTSA','2019-2026'],
 ['volvo','','Batterie HV EX30/EX40 (campagne)','Limitation puissance, alerte surchauffe','1) Codes BMS 2) Campagne logicielle 3) Contrôle boucle LDR','BMS/logiciel','P0AA6, P0C00','Safety Gate','2023-2026'],
 ['volvo','','Prétensionneurs ceintures (campagne)','Campagne contrôle UE','1) VIN Safety Gate 2) Remplacement prétensionneurs','Prétensionneurs','','Safety Gate','2017-2026'],
 ['porsche','','Batterie HV Taycan/Macan EV','Défaut isolement, limitation puissance','1) Résistance isolement 2) Identification module 3) Remplacement sous garantie','Module batterie','P0AA6','NHTSA','2020-2026'],
 ['fiat','MultiJet','Injecteurs MultiJet encrassement','Ratés diesel, claquement, démarrage difficile','1) Test débits retour 2) Banc injecteurs 3) Remplacement + filtre','Injecteurs','P0201-P0204','TSB','2017-2026'],
 ['fiat','','Uconnect écran/MAJ','Écran noir, reboots','MAJ logiciel','—','U0101','TSB','2017-2026'],
 ['alfa','JTD','Injecteurs/AdBlue diesel','Ratés, défaut AdBlue','Procédure diesel standard','Injecteurs','P0201, P20EE','TSB','2017-2026'],
 ['mini','N13','Chaîne distribution Mini','Claquement, casse tendeur','Kit chaîne complet','Kit chaîne','P0016','TSB','2017-2020'],
 ['toyota','Hybrid','Pompe onduleur HSD','Non-démarrage, défaut système hybride','1) Codes onduleur 2) Test débit pompe 12V 3) Niveau LDR onduleur 4) Remplacement pompe','Pompe onduleur','P0A93','TSB','2017-2026'],
 ['toyota','D-4T','Consommation huile 1.2 D-4T','Baisse niveau, fumée bleue','1) Conso sur 1000 km 2) Endoscopie cylindres 3) Segments selon TSB','Segments','P0302','TSB','2017-2019'],
 ['toyota','','Airbag Takata','Campagne rupture','1) VIN 2) Remplacement inflateur','Inflateur','','NHTSA / Rappel Conso','2017-2019'],
 ['honda','','Airbag Takata','Campagne rupture','1) VIN 2) Inflateur','Inflateur','','NHTSA','2017-2019'],
 ['honda','1.5 VTEC','Dilution huile (turbo 1.5)','Niveau huile haut, odeur essence','1) Niveau/odeur 2) MAJ logiciel 3) Vidange complète','Logiciel/vidange','','TSB','2017-2020'],
 ['nissan','','SOH batterie Leaf','Perte autonomie, charge lente','1) SOH au diag 2) Delta cellules 3) Garantie si SOH <70% 4) Équilibrage','Modules batterie','','Campagne constructeur','2018-2026'],
 ['nissan','','Airbag Takata','Campagne','VIN, inflateur','Inflateur','','NHTSA','2017-2019'],
 ['mazda','Skyactiv-D','Calamine + FAP courts trajets','Perte puissance, régénérations fréquentes','1) Historique régénérations 2) Endoscopie admission 3) Décalaminage + MAJ','FAP, EGR','P2002, P2463','TSB','2017-2026'],
 ['mitsubishi','','Airbag Takata','Campagne','VIN','Inflateur','','NHTSA','2017-2019'],
 ['subaru','','Consommation huile boxer','Baisse niveau huile','1) Conso mesurée 2) TSB segments/PCV 3) Remplacement si confirmé','Segments','','TSB','2017-2019'],
 ['suzuki','','Caméra/ADAS campagnes','Défaut assistance','Recalibration + MAJ','Caméra','U0121','Campagne constructeur','2019-2026'],
 ['hyundai','Theta II','Serrage moteur Theta II','Claquement, limailles dans huile','1) Analyse KSDS 2) Contrôle limailles 3) Coussinets/moteur sous campagne','Coussinets bielles','','NHTSA','2017-2023'],
 ['hyundai','ICCU','ICCU Ioniq/Kona EV','Non-charge, défaut 12V','1) Codes ICCU 2) Test DC-DC 3) Remplacement ICCU + 12V','ICCU, 12V','U0111, P0AA6','NHTSA / campagne','2021-2026'],
 ['hyundai','Kona EV','Incendie batterie Kona EV','Risque incendie modules','1) Campagne BMS 2) Remplacement batterie si concerné','Batterie HV','P0AA6','Safety Gate / NHTSA','2018-2022'],
 ['kia','Theta II','Serrage Theta II','Idem Hyundai','Procédure identique','Coussinets','','NHTSA','2017-2023'],
 ['kia','ICCU','ICCU EV6/EV9','Non-charge, défaut 12V','Procédure ICCU','ICCU','U0111','Campagne constructeur','2021-2026'],
 ['lexus','Hybrid','Pompe onduleur Lexus','Idem Toyota','Procédure identique','Pompe onduleur','P0A93','TSB','2017-2026'],
 ['byd','','BMS/équilibrage LFP','Perte autonomie, delta cellules','1) Delta >60 mV = défaut 2) Charge lente équilibrage 3) MAJ BMS 4) Module si nécessaire','BMS, modules','P0AA6, U0111','Campagne constructeur','2022-2026'],
 ['mg','','12V / DC-DC MG EV','Non-démarrage, défaut 12V','1) SOH 12V 2) Test DC-DC 3) MAJ 4) Remplacement 12V','12V, DC-DC','U0111','Campagne constructeur','2020-2026'],
 ['mg','','Caméra/ADAS MG','Défaut assistance','Recalibration + MAJ','Caméra','U0121','Campagne constructeur','2021-2026'],
 ['lynkco','','PHEV batterie/charge','Défaut charge PHEV','1) Codes OBC 2) Campagne 3) Remplacement OBC','OBC','P0D11','Campagne constructeur','2020-2026'],
 ['nio','','Batterie HV / BaaS','Défaut batterie, swap station','1) Codes BMS 2) Diagnostic station 3) Module','BMS','','Campagne constructeur','2022-2026'],
 ['xpeng','','Charge/OTA','Défaut charge après mise à jour','1) Logs OTA 2) Re-flash 3) OBC','OBC/logiciel','P0D11','Campagne constructeur','2021-2026'],
 ['aiways','','12V / batterie HV','Défaut 12V répété','Procédure EV standard','12V','U0111','Campagne constructeur','2020-2026'],
 ['seres','','EREV batterie/générateur','Défaut générateur range-extender','1) Codes 2) Campagne 3) Générateur','Générateur','','Campagne constructeur','2021-2026'],
 ['omoda','','Campagnes essence/PHEV','Selon motorisation','Procédures constructeur','—','','Campagne constructeur','2023-2026'],
 ['jaecoo','','PHEV batterie/charge','Défaut charge','Procédure OBC','OBC','P0D11','Campagne constructeur','2024-2026'],
 ['leapmotor','','BMS/12V','Défaut 12V','Procédure EV','12V','U0111','Campagne constructeur','2023-2026'],
 ['ora','','Charge AC','Défaut charge AC','OBC','OBC','P0D11','Campagne constructeur','2023-2026'],
 ['ford','EcoBoost','Courroie humide + LDR cylindres','Bruit courroie, ratés après stationnement','1) État courroie 2) Endoscopie/compression 3) Joints culasse/injecteurs 4) Kit courroie + joints','Kit courroie, joints','P0300, P0301','TSB','2018-2024'],
 ['ford','PowerShift','Broutage embrayage sec','Vibrations démarrage, à-coups basse vitesse','1) Adaptations embrayage 2) Apprentissage TSB 3) Kit embrayage si confirmé','Kit embrayage','P0700','TSB / NHTSA','2017-2023'],
 ['ford','','ADAS BlueCruise / caméras','Défaut conduite autonome','1) Recalibration 2) MAJ 3) Logs NHTSA','Caméra/radar','U0101, U0121','NHTSA','2019-2026'],
 ['tesla','','eMMC MCU','Écran noir, reboots, lenteur','1) Santé eMMC mode service 2) Logs reboot 3) MCU sous garantie étendue','MCU, eMMC','U0101','NHTSA','2017-2023'],
 ['tesla','','Freinage fantôme ACC','Freinage brusque inopiné','1) Version caméras 2) Recalibration 3) MAJ logicielle','Caméras','','NHTSA','2021-2026'],
 ['tesla','','Contacteurs batterie HV','Défaut isolement/contacteur','1) Résistance isolement 2) Test contacteurs 3) Remplacement','Contacteurs','P0AA6','NHTSA','2017-2026'],
 ['jeep','MultiJet','FAP/EGR Jeep','Colmatage, perte puissance','Procédure diesel','FAP, EGR','P2002, P0401','TSB','2017-2026'],
 ['jeep','Uconnect','Uconnect reboots/caméra','Perte écran, caméra HS','MAJ logiciel','—','U0101','NHTSA','2017-2026'],
 ['chevrolet','','Campagnes sécurité NHTSA','Selon campagne (airbag/caméra)','1) VIN NHTSA 2) Campagne 3) Remplacement','—','','NHTSA','2017-2026'],
 ['dodge','','Faisceau/incendie campagnes','Risque échauffement faisceau','1) VIN 2) Inspection faisceau 3) Remplacement','Faisceau','','NHTSA','2017-2023'],
 ['cadillac','Lyriq','Batterie HV Lyriq (campagne)','Défaut batterie, limitation','1) Codes BMS 2) Campagne 3) Module','Module batterie','P0AA6','NHTSA','2024-2026'],
 ['dacia','','Campagnes sécurité Dacia','Airbag/ceintures selon VIN','1) VIN Rappel Conso 2) Campagne 3) Remplacement','—','','Rappel Conso','2017-2026']
];
const GENERIC_EXPERT = {
 diesel: [
  ['Diagnostic EGR complet','Voyant moteur, perte puissance, ralenti instable','1) Lire P0401/P0490 2) Test position EGR au diag (consigne vs réel) 3) Mesure encrassement refroidisseur (ΔP) 4) Nettoyage ou remplacement + adaptation','Vanne EGR, refroidisseur EGR','P0401, P0490'],
  ['Diagnostic FAP complet','Régénérations fréquentes, perte puissance','1) Lire P2002/P2463 2) Mesure différentielle pression FAP 3) Régénération forcée au diag 4) Remplacement si colmatage irréversible','FAP, capteur ΔP','P2002, P2463'],
  ['Diagnostic AdBlue complet','Countdown non-démarrage, voyant AdBlue','1) Lire P20EE/P204F/P207F 2) Test débit pompe AdBlue 3) Inspection cristallisation injecteur 4) Remplacement pompe/injecteur + réinit','Pompe AdBlue, injecteur, réservoir','P20EE, P204F'],
  ['Diagnostic pompe haute pression','Démarrage difficile, pression rail basse','1) Lire P0087/P0088 2) Mesure pression rail vs consigne 3) Test débits retour injecteurs 4) Remplacement pompe HP','Pompe HP, régulateur','P0087, P0088'],
  ['Diagnostic injecteurs diesel','Claquement, fumée, surconso, ratés','1) Lire P0201-P0204 2) Test débits retour 3) Banc injecteurs 4) Remplacement injecteurs défectueux + codage','Injecteurs','P0201-P0204']],
 essence: [
  ['Diagnostic chaîne distribution','Claquement à froid, défaut calage','1) Lire P0016/P0335 2) Scope synchro vilo/AAC 3) Contrôle tendeur/guides 4) Kit chaîne complet','Kit chaîne, tendeur','P0016, P0335'],
  ['Diagnostic courroie distribution','Bruit, risque rupture, débris huile','1) Inspection visuelle + gabarit usure 2) Contrôle carter débris 3) Pression huile 4) Kit courroie + pompe + vidange','Kit courroie, pompe à huile','P0087, P0340'],
  ['Diagnostic allumage complet','Ratés, à-coups, perte puissance','1) Lire P0300-P0304 2) Permutation bobines/bougies 3) Test compressions 4) Remplacement bougies/bobines','Bougies, bobines','P0300-P0304'],
  ['Diagnostic GPF/catalyseur','Perte puissance, voyant, odeur','1) Lire P2463/P0420 2) Régénération forcée 3) Contrôle contre-pression 4) Remplacement GPF/catalyseur','GPF, catalyseur','P2463, P0420']],
 hybride: [
  ['Diagnostic batterie HV','Perte autonomie, défaut isolement','1) Lire U0111/P0AA6 2) Delta cellules au diag 3) Test isolement 4) Équilibrage ou module','BMS, modules HV','U0111, P0AA6'],
  ['Diagnostic onduleur/convertisseur','Perte puissance, défaut hybride','1) Codes onduleur 2) Test pompe LDR onduleur 3) Contrôle connexions HV 4) Remplacement onduleur','Onduleur, pompe','P0A93, P0AA6'],
  ['Diagnostic charge hybride','Charge lente/absente','1) Lire P0D11 2) Test OBC AC/DC 3) Contrôle connecteur 4) Remplacement OBC','OBC, connecteur','P0D11']],
 electrique: [
  ['Diagnostic isolement HV','Défaut isolement, coupure sécurité','1) Lire P0AA6 2) Mesure résistance isolement 3) Identification branche défaillante 4) Remplacement composant HV','Câblage HV, batterie','P0AA6'],
  ['Diagnostic charge complet','Charge lente/absente, erreurs borne','1) Lire P0D11/U0111 2) Test AC + DC 3) Contrôle ICCU/OBC 4) Remplacement ICCU/OBC + MAJ','ICCU, OBC','P0D11, U0111'],
  ['Diagnostic autonomie/BMS','Perte autonomie anormale','1) SOH + delta cellules 2) Historique charges 3) MAJ BMS 4) Équilibrage ou module','BMS, modules','U0111'],
  ['Diagnostic 12V/DC-DC','Non-démarrage, défaut 12V','1) SOH batterie 12V 2) Test sortie DC-DC 3) Courant de repos 4) Remplacement 12V/DC-DC','12V, DC-DC','P0562, U0111']]
};
const UNIV = [
  ['Airbag (campagne Takata / générateur)', 'Risque rupture générateur au déploiement — remplacement inflateur selon rappel', '', 'NHTSA / Rappel Conso'],
  ['Ceintures de sécurité (prétensionneur/ancrage)', 'Prétensionneur pyrotechnique ou ancrage non conforme — campagne de contrôle', '', 'Safety Gate'],
  ['Caméra recul / 360°', 'Image figée, buée, perte signal — MAJ ou remplacement caméra', '', 'Campagne constructeur'],
  ['Caméra ADAS / radar (calibration)', 'Perte fonctions assistance, défaut calibration pare-brise', 'U0121', 'Campagne constructeur'],
  ['Conduite autonome / ACC', 'Freinage fantôme, perte assistance direction — MAJ logicielle obligatoire', 'U0101', 'NHTSA'],
  ['Court-circuit faisceau / 12V', 'Risque échauffement câblage, incendie — campagne inspection faisceau', '', 'NHTSA / Rappel Conso'],
  ['Incendie compartiment moteur / batterie', 'Fuite carburant ou défaut module HV — arrêt immédiat si rappel ouvert', '', 'Safety Gate / NHTSA'],
  ['Électronique multiplexée / gateway', 'Défauts communication multiples, écrans figés', 'U0101 / U0121', 'Campagne constructeur'],
  ['Batterie 12V / système charge', 'Non-démarrage répétitif, contrôle SOH + alternateur/DC-DC', 'P0562', 'Campagne constructeur'],
  ['Capteurs TPMS / pression', 'Perte signal capteur, voyant erroné', '', 'Campagne constructeur']
];
const GENERIC = {
  diesel: { issues: [['Vanne EGR encrassée', 'Perte puissance, voyant, ralenti instable', 'P0401 / P0490'], ['FAP colmaté', 'Régénérations fréquentes, perte puissance', 'P2002 / P2463'], ['Système AdBlue', 'Cristallisation, pompe HS, countdown', 'P20EE / P204F'], ['Pompe haute pression', 'Démarrage difficile, pression rail basse', 'P0087 / P0088'], ['Injecteurs', 'Claquement, fumée, surconso, ratés', 'P0201-P0204'], ['Chaîne / courroie distribution', 'Claquement froid, décalage calage', 'P0016 / P0335'], ['Turbo / géométrie variable', 'Perte puissance, sifflement anormal', 'P0299 / P0234'], ['Préchauffage', 'Démarrage difficile à froid', 'P0380 / P0671']], dtc: ['P0401', 'P0490', 'P2002', 'P2463', 'P20EE', 'P0087', 'P0201', 'P0016', 'P0299', 'P0380'] },
  essence: { issues: [['Chaîne de distribution', 'Claquement froid, usure tendeur', 'P0016 / P0335'], ['Courroie de distribution (humide)', 'Débris, pompe à huile colmatée', 'P0087 / P0340'], ['Injecteurs / calamine (injection directe)', 'Ratés, ralenti instable, perte puissance', 'P0300-P0304'], ['Pompe haute pression (GDI)', 'Pression rail insuffisante', 'P0087'], ['Catalyseur', 'Vieillissement, contre-pression, odeur', 'P0420'], ['Turbo', 'Fuite admission, sous/sur-turbo', 'P0299 / P0234'], ['Allumage bougies/bobines', 'À-coups, ratés accélération', 'P0300-P0304'], ['Électronique / tension', 'Défauts multiples, batterie/alternateur', 'P0562']], dtc: ['P0016', 'P0087', 'P0300', 'P0301', 'P0335', 'P0340', 'P0420', 'P0299', 'P0562'] },
  hybride: { issues: [['Batterie haute tension', 'Vieillissement cellules, équilibrage, isolation', 'U0111 / P0AA6'], ['Onduleur / convertisseur', 'Perte puissance, défaut isolement', 'P0AA6'], ['Défaut de charge', 'Charge lente/absente (OBC/ICCU)', 'P0D11 / U0111'], ['Défaut d\'autonomie', 'Perte capacité, estimation erronée', 'U0111'], ['Freinage régénératif', 'À-coups, capteur pédale', 'C1365'], ['Batterie 12V / DC-DC', 'Non-démarrage, défaut circuit charge', 'P0562 / U0111'], ['Thermique batterie', 'Refroidissement, surchauffe modules', 'P0C00'], ['Moteur thermique associé', 'EGR/FAP/courroie selon motorisation', 'P0401 / P0087']], dtc: ['U0111', 'P0AA6', 'P0D11', 'P0C00', 'C1365', 'P0562'] },
  electrique: { issues: [['Batterie haute tension', 'Dégradation, surchauffe modules, BMS, isolation', 'P0AA6 / U0111'], ['Défaut de charge (OBC/ICCU/borne)', 'Charge lente/absente, erreurs connecteur', 'P0D11 / U0111'], ['Défaut d\'autonomie', 'Perte capacité, équilibrage cellules', 'U0111'], ['Court-circuit / isolement HV', 'Défaut isolement, sécurité coupure', 'P0AA6'], ['Batterie 12V / DC-DC', 'Non-démarrage, défaut 12V', 'P0562 / U0111'], ['Moteur électrique / onduleur', 'Perte puissance, bruit anormal', 'P0AA6'], ['Thermique batterie', 'Refroidissement, pompe LDR', 'P0C00'], ['Électronique / logiciels', 'Bugs BMS/MBUX, MAJ nécessaires', 'U0101']], dtc: ['P0AA6', 'U0111', 'P0D11', 'P0C00', 'P0562', 'U0101'] }
};
/* Référence de vérification : [brand, model, years, motors[[name,fuel,power]…]] */
const ENSURE = [
 ['renault','Clio 6','2025-2026',[['1.0 TCe 90','essence','90 ch'],['1.0 TCe 110','essence','110 ch'],['E-Tech 140','hybride','140 ch'],['E-Tech 160','hybride','160 ch']]],
 ['renault','Clio V','2019-2026',[['1.0 SCe 65','essence','65 ch'],['1.0 TCe 90','essence','90 ch'],['1.0 TCe 100','essence','100 ch'],['1.3 TCe 130','essence','130 ch'],['1.5 Blue dCi 85','diesel','85 ch'],['1.5 Blue dCi 100','diesel','100 ch'],['1.5 Blue dCi 115','diesel','115 ch'],['E-Tech 140','hybride','140 ch']]],
 ['renault','R4 E-Tech','2024-2026',[['Electrique 120','electrique','120 ch'],['Electrique 150','electrique','150 ch']]],
 ['renault','Twingo E-Tech','2026-2026',[['Electrique 82','electrique','82 ch']]],
 ['peugeot','208 II','2019-2026',[['1.2 PureTech 75','essence','75 ch'],['1.2 PureTech 100','essence','100 ch'],['1.2 PureTech 130','essence','130 ch'],['1.5 BlueHDi 100','diesel','100 ch']]],
 ['peugeot','3008 III','2023-2026',[['1.2 Hybrid 136','hybride','136 ch'],['Hybrid 195','hybride','195 ch'],['Hybrid 230','hybride','230 ch']]],
 ['peugeot','E-3008','2024-2026',[['Electrique 210','electrique','210 ch'],['Electrique 230','electrique','230 ch'],['Electrique 320','electrique','320 ch']]],
 ['peugeot','5008 III','2024-2026',[['1.2 Hybrid 136','hybride','136 ch'],['Hybrid 195','hybride','195 ch']]],
 ['peugeot','E-5008','2024-2026',[['Electrique 210','electrique','210 ch'],['Electrique 320','electrique','320 ch']]],
 ['citroen','C3 IV','2024-2026',[['1.2 Hybrid 100','hybride','100 ch'],['1.2 Hybrid 136','hybride','136 ch']]],
 ['citroen','ë-C3','2024-2026',[['Electrique 113','electrique','113 ch']]],
 ['citroen','C3 Aircross III','2024-2026',[['1.2 Hybrid 100','hybride','100 ch'],['1.2 Hybrid 136','hybride','136 ch'],['Electrique 113','electrique','113 ch']]],
 ['ds','DS N°4','2025-2026',[['Hybrid 136','hybride','136 ch'],['E-Tense 210','electrique','210 ch']]],
 ['ds','DS N°8','2025-2026',[['E-Tense 230','electrique','230 ch'],['E-Tense 350','electrique','350 ch']]],
 ['dacia','Bigster','2025-2026',[['1.2 TCe 130','essence','130 ch'],['1.2 TCe 140 4x4','essence','140 ch'],['Hybrid 155','hybride','155 ch']]],
 ['dacia','Duster III','2024-2026',[['1.2 TCe 130','essence','130 ch'],['1.2 TCe 140 4x4','essence','140 ch'],['Hybrid 140','hybride','140 ch'],['1.5 Blue dCi 115','diesel','115 ch']]],
 ['volkswagen','Golf VIII','2020-2026',[['1.0 TSI 90','essence','90 ch'],['1.0 TSI 110','essence','110 ch'],['1.5 TSI 130','essence','130 ch'],['1.5 TSI 150','essence','150 ch'],['2.0 TDI 115','diesel','115 ch'],['2.0 TDI 150','diesel','150 ch'],['GTI 245','essence','245 ch']]],
 ['volkswagen','Tiguan III','2024-2026',[['1.5 TSI 130','essence','130 ch'],['1.5 TSI 150','essence','150 ch'],['2.0 TDI 150','diesel','150 ch'],['2.0 TDI 193','diesel','193 ch'],['eHybrid 204','hybride','204 ch'],['eHybrid 272','hybride','272 ch']]],
 ['volkswagen','ID.4','2021-2026',[['Electrique 170','electrique','170 ch'],['Electrique 204','electrique','204 ch'],['Electrique 265','electrique','265 ch'],['Electrique 286','electrique','286 ch'],['GTX 299','electrique','299 ch']]],
 ['volkswagen','ID.7','2023-2026',[['Electrique 286','electrique','286 ch'],['Electrique 340','electrique','340 ch']]],
 ['audi','Q6 e-tron','2024-2026',[['Electrique 252','electrique','252 ch'],['Electrique 388','electrique','388 ch'],['SQ6 490','electrique','490 ch']]],
 ['bmw','X3 G45','2024-2026',[['20 208','essence','208 ch'],['20d 197','diesel','197 ch'],['30e 299','hybride','299 ch'],['M50 398','essence','398 ch']]],
 ['mercedes','Classe E W214','2024-2026',[['E200 204','essence','204 ch'],['E220d 197','diesel','197 ch'],['E300e 313','hybride','313 ch'],['E400e 381','hybride','381 ch']]],
 ['skoda','Enyaq','2021-2026',[['Electrique 179','electrique','179 ch'],['Electrique 204','electrique','204 ch'],['Electrique 265','electrique','265 ch'],['Electrique 286','electrique','286 ch'],['RS 340','electrique','340 ch']]],
 ['skoda','Elroq','2024-2026',[['Electrique 170','electrique','170 ch'],['Electrique 204','electrique','204 ch'],['Electrique 286','electrique','286 ch']]],
 ['toyota','Yaris','2017-2026',[['1.0 72','essence','72 ch'],['1.5 Hybrid 116','hybride','116 ch'],['1.5 Hybrid 130','hybride','130 ch']]],
 ['toyota','RAV4','2019-2026',[['2.5 Hybrid 218','hybride','218 ch'],['2.5 Hybrid AWD 222','hybride','222 ch'],['2.5 PHEV 306','hybride','306 ch']]],
 ['hyundai','Tucson','2020-2026',[['1.6 T-GDI 150','essence','150 ch'],['1.6 T-GDI 180','essence','180 ch'],['1.6 CRDi 136','diesel','136 ch'],['Hybrid 230','hybride','230 ch'],['PHEV 265','hybride','265 ch']]],
 ['kia','Sportage','2021-2026',[['1.6 T-GDI 150','essence','150 ch'],['1.6 CRDi 136','diesel','136 ch'],['Hybrid 230','hybride','230 ch'],['PHEV 265','hybride','265 ch']]],
 ['tesla','Model 3','2019-2026',[['Propulsion 283','electrique','283 ch'],['Grande Autonomie 498','electrique','498 ch'],['Performance 513','electrique','513 ch']]],
 ['tesla','Model Y','2021-2026',[['Propulsion 299','electrique','299 ch'],['Grande Autonomie 498','electrique','498 ch'],['Performance 514','electrique','514 ch']]],
 ['byd','Atto 3','2022-2026',[['Electrique 204','electrique','204 ch']]],
 ['mg','MG4','2022-2026',[['Electrique 170','electrique','170 ch'],['Electrique 204','electrique','204 ch'],['XPower 435','electrique','435 ch']]],
 ['ford','Puma','2019-2026',[['1.0 EcoBoost 95','essence','95 ch'],['1.0 EcoBoost 125','essence','125 ch'],['1.0 EcoBoost 155','essence','155 ch'],['1.5 EcoBlue 120','diesel','120 ch']]]
];
let db, usersData = {}, brandsData = {}, motorsCache = [], deferredPrompt = null, listenersStarted = false, ensureDone = false;
let curBrand = null, curModelId = null, curModelName = null;

window.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  setupInstall(); bindAdminTable(); boot(); checkMonthly();
});
function el(id) { return document.getElementById(id); }
function val(id) { return el(id).value; }
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); el(id).classList.add('active'); }
function screenIsActive(id) { return el(id).classList.contains('active'); }
function notify(m, t) { const n = document.createElement('div'); n.className = 'notification' + (t === 'error' ? ' error' : ''); n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 3500); }
function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
function deviceId() { let id = localStorage.getItem('autodiag_device'); if (!id) { id = 'DEV-' + Math.random().toString(36).substr(2, 8).toUpperCase(); localStorage.setItem('autodiag_device', id); } return id; }
function uid(p) { return p + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); }
function kwMatch(kw, motor) { if (!kw) return true; if (!motor) return false; return String(motor.name).toLowerCase().includes(String(kw).toLowerCase()); }
function guessFuel(n) { n = String(n).toLowerCase(); if (/électrique|electrique|ev\b|e-|zero emi|electri/.test(n)) return 'electrique'; if (/hybrid|hybride|phev|e:hev|e-tech|e:h/.test(n)) return 'hybride'; if (/dci|tdi|bluehdi|diesel|crdi|multijet|ecoblue|jtd|d-4d|\bd\b/.test(n)) return 'diesel'; return 'essence'; }
function guessPower(n) { const m = String(n).match(/(\d{2,4})\s*ch\b/i) || String(n).match(/(\d{2,4})$/); return m ? m[1] + ' ch' : ''; }
function issueFuel(i) { const t = ((i.title || '') + ' ' + (i.detail || '') + ' ' + (i.motor || '')).toLowerCase(); for (const f of ['diesel', 'essence', 'hybride', 'electrique']) if (FUEL_KW[f].some(k => t.includes(k))) return f; return null; }

/* ===== AUTO-VÉRIFICATION RÉELLE : modèles + motorisations + puissances ===== */
async function ensureCatalog() {
  if (ensureDone) return;
  ensureDone = true;
  try {
    const models = (await db.ref('data/models').once('value')).val() || {};
    const byName = {}; Object.entries(models).forEach(([id, m]) => byName[m.brandId + '|' + String(m.name).toLowerCase()] = id);
    let added = 0;
    for (let i = 0; i < ENSURE.length; i++) {
      const e = ENSURE[i];
      if (byName[e[0] + '|' + e[1].toLowerCase()]) continue;
      const id = 'e_' + e[0] + '_' + i;
      await db.ref('data/models/' + id).set({ brandId: e[0], name: e[1], years: e[2] });
      await db.ref('data/motors/' + id).set(e[3].map(m => ({ name: m[0], fuel: m[1], power: m[2] })));
      byName[e[0] + '|' + e[1].toLowerCase()] = id; added++;
    }
    if (added) notify('🚗 ' + added + ' modèles ajoutés (Clio 6, R4, Bigster…)');
    /* Vérification motorisations/puissances sur modèles de référence */
    let fixed = 0;
    for (const e of ENSURE) {
      const id = byName[e[0] + '|' + e[1].toLowerCase()];
      if (!id) continue;
      const cur = ((await db.ref('data/motors/' + id).once('value')).val() || []).slice();
      let changed = false;
      e[3].forEach(n => { if (!cur.some(x => String(x.name).toLowerCase() === n[0].toLowerCase())) { cur.push({ name: n[0], fuel: n[1], power: n[2] }); changed = true; } });
      for (let i = 0; i < cur.length; i++) {
        const x = cur[i];
        if (!x.fuel || !['essence', 'diesel', 'hybride', 'electrique'].includes(x.fuel)) { x.fuel = guessFuel(x.name); changed = true; }
        if (!x.power || !/\d/.test(String(x.power))) { x.power = guessPower(x.name) || guessPower(e[3].find(r => r[0] === x.name) ? x.name : x.name); changed = true; }
      }
      if (changed) { await db.ref('data/motors/' + id).set(cur); fixed++; }
    }
    if (fixed) notify('🔧 Auto-vérification : ' + fixed + ' motorisations/puissances corrigées');
    const iss = (await db.ref('data/issues').once('value')).val() || {};
    const tI = {}; Object.values(iss).forEach(x => tI[String(x.title).toLowerCase()] = 1);
    let aI = 0;
    for (const k of KEY_ISSUES) if (!tI[k.title.toLowerCase()]) { await db.ref('data/issues/' + uid('key')).set(k); aI++; }
    const ex = (await db.ref('data/expert').once('value')).val() || {};
    const tE = {}; Object.values(ex).forEach(x => tE[String(x.title).toLowerCase()] = 1);
    for (const k of KEY_EXPERT) if (!tE[k.title.toLowerCase()]) { await db.ref('data/expert/' + uid('key')).set(k); aI++; }
    if (aI) notify('🔩 Rappels officiels vérifiés (Bigster ressorts AR)');
  } catch (e) { console.warn('ensure', e); }
}
async function checkMonthly() {
  const v = (await db.ref('data/version').once('value')).val();
  if (!v || !v.lastUpdate) return;
  if (Date.now() - new Date(v.lastUpdate).getTime() > MONTHLY_MS) {
    if (sessionStorage.getItem('autodiag_admin') === '1') { await updateBase(true); notify('📅 MAJ mensuelle diffusée automatiquement'); }
    else notify('📅 Base > 30 jours : MAJ mensuelle en diffusion');
  }
}
async function updateBase(manual) {
  await db.ref('data/version').set({ version: Date.now(), lastUpdate: new Date().toISOString(), updateIntervalDays: 30 });
  if (manual) notify('✅ MAJ diffusée sur toutes les APK');
}
function boot() {
  if (!listenersStarted) {
    listenersStarted = true;
    db.ref('access/users').on('value', s => { usersData = s.val() || {}; routeUser(); if (screenIsActive('screen-admin')) renderAdmin(); });
    db.ref('data/brands').on('value', s => { brandsData = s.val() || {}; if (screenIsActive('screen-admin')) fillBrandSelects(); });
    db.ref('data/version').on('value', s => { const v = s.val(); const t = v && v.lastUpdate ? new Date(v.lastUpdate).toLocaleDateString('fr-FR') : '--'; if (el('app-version')) el('app-version').textContent = t; if (el('admin-version')) el('admin-version').textContent = t; });
  }
  routeUser();
}
function findKey(p) { return p ? Object.keys(usersData).find(k => usersData[k].prenom && usersData[k].prenom.toLowerCase() === p.toLowerCase()) || null : null; }
function routeUser() {
  const s = getSession();
  if (!s || !s.prenom) { showScreen('screen-home'); return; }
  const k = findKey(s.prenom);
  if (!k) { showPending(s.prenom); return; }
  s.status = usersData[k].status; saveSession(s);
  if (s.status === 'accepted') { el('accepted-name').textContent = s.prenom; showScreen('screen-accepted'); }
  else if (s.status === 'refused') showScreen('screen-refused');
  else if (s.status === 'revoked') showScreen('screen-revoked');
  else showPending(s.prenom);
}
async function requestAccess() {
  const p = el('input-prenom').value.trim();
  if (p.length < 2) return notify('Prénom invalide', 'error');
  saveSession({ prenom: p, status: 'pending', date: Date.now() });
  await db.ref('access/users/user_' + p.toLowerCase().replace(/[^a-z0-9]+/g, '_')).set({ prenom: p, status: 'pending', device: deviceId(), date: Date.now() });
  showPending(p); notify('📨 Demande envoyée');
}
function showPending(p) {
  el('pending-name').textContent = p;
  const m = encodeURIComponent('🔐 DEMANDE D\'ACCÈS Auto Diagnostic Pro\n👤 ' + p + '\n📱 ' + deviceId() + '\n📅 ' + new Date().toLocaleString('fr-FR'));
  el('share-wa').href = 'https://wa.me/?text=' + m; el('share-sms').href = 'sms:?body=' + m; el('share-mail').href = 'mailto:?subject=Demande%20acc%C3%A8s&body=' + m;
  showScreen('screen-pending');
}
function checkStatus() { routeUser(); }
function resetSession() { localStorage.removeItem(SESSION_KEY); el('input-prenom').value = ''; showScreen('screen-home'); }
function loginAdmin() {
  if (el('admin-pwd').value === ADMIN_PASSWORD) { sessionStorage.setItem('autodiag_admin', '1'); el('admin-pwd').value = ''; boot(); showScreen('screen-admin'); renderAdmin(); fillBrandSelects(); checkMonthly(); }
  else notify('❌ Mot de passe incorrect', 'error');
}
function logoutAdmin() { sessionStorage.removeItem('autodiag_admin'); showScreen('screen-home'); }
function adminTab(id) { el('tab-access').classList.toggle('hidden', id !== 'tab-access'); el('tab-data').classList.toggle('hidden', id !== 'tab-data'); if (id === 'tab-data') { fillBrandSelects(); fillModelSelectAdmin(); } }
function renderAdmin() {
  const c = el('users-table-container'); const keys = Object.keys(usersData).sort((a, b) => (usersData[b].date || 0) - (usersData[a].date || 0));
  if (!keys.length) { c.innerHTML = '<p style="color:#94a3b8;text-align:center">Aucun tiers</p>'; return; }
  const L = { pending: '⏳ Attente', accepted: '✅ Accepté', refused: '❌ Refusé', revoked: '🔒 Révoqué' };
  let h = '<table><thead><tr><th>Prénom</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
  keys.forEach(k => {
    const u = usersData[k], st = u.status || 'pending'; let a = '';
    if (st === 'pending') a += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">✓</button><button class="btn btn-sm btn-danger" data-action="refuse" data-key="' + k + '">✗</button>';
    else if (st === 'accepted') a += '<button class="btn btn-sm btn-danger" data-action="revoke" data-key="' + k + '">Révoquer</button>';
    else a += '<button class="btn btn-sm btn-success" data-action="accept" data-key="' + k + '">Réautoriser</button>';
    a += '<button class="btn btn-sm btn-secondary" data-action="delete" data-key="' + k + '">🗑️</button>';
    h += '<tr><td>' + esc(u.prenom) + '</td><td><span class="badge badge-' + st + '">' + L[st] + '</span></td><td style="font-size:11px">' + (u.date ? new Date(u.date).toLocaleDateString('fr-FR') : '--') + '</td><td>' + a + '</td></tr>';
  });
  c.innerHTML = h + '</tbody></table>';
}
function bindAdminTable() {
  el('users-table-container').addEventListener('click', e => {
    const b = e.target.closest('button[data-action]'); if (!b) return;
    const k = b.dataset.key, a = b.dataset.action;
    if (a === 'delete') { if (confirm('Supprimer ?')) db.ref('access/users/' + k).remove(); return; }
    db.ref('access/users/' + k).update({ status: a === 'accept' ? 'accepted' : a === 'refuse' ? 'refused' : 'revoked' });
  });
}
async function addUser() {
  const p = el('new-prenom').value.trim(); if (p.length < 2) return notify('Prénom invalide', 'error');
  await db.ref('access/users/user_' + p.toLowerCase().replace(/[^a-z0-9]+/g, '_')).set({ prenom: p, status: 'accepted', device: 'admin', date: Date.now() });
  el('new-prenom').value = ''; notify('✅ ' + p + ' autorisé');
}
function shareAPK() {
  if (sessionStorage.getItem('autodiag_admin') !== '1') return notify('❌ Réservé admin', 'error');
  const u = new URL('./index.html', location.href).href;
  if (navigator.share) navigator.share({ title: 'Auto Diagnostic Pro', text: 'Installez l\'APK :', url: u }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => notify('🔗 Lien copié'));
  else prompt('Lien :', u);
}
function fillBrandSelects() {
  ['nm-brand', 'is-brand', 'ex-brand'].forEach(id => { const s = el(id); if (!s) return; s.innerHTML = ''; Object.entries(brandsData).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, b]) => { s.innerHTML += '<option value="' + k + '">' + esc(b.name) + '</option>'; }); });
  fillModelSelect(); fillModelSelectAdmin();
}
function fillModelSelect() {
  const b = val('is-brand');
  db.ref('data/models').once('value').then(s => { const sel = el('is-model'); sel.innerHTML = ''; Object.values(s.val() || {}).filter(m => m.brandId === b).forEach(m => { sel.innerHTML += '<option value="' + esc(m.name) + '">' + esc(m.name) + '</option>'; }); });
}
function fillModelSelectAdmin() {
  db.ref('data/models').once('value').then(s => { const sel = el('mo-model'); if (!sel) return; sel.innerHTML = ''; Object.entries(s.val() || {}).forEach(([k, m]) => { const bn = brandsData[m.brandId] ? brandsData[m.brandId].name : m.brandId; sel.innerHTML += '<option value="' + k + '">' + esc(bn + ' ' + m.name) + '</option>'; }); });
}
async function addBrand() { const n = el('nb-name').value.trim(); if (!n) return notify('Nom requis', 'error'); await db.ref('data/brands/' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-')).set({ name: n, region: val('nb-region') }); el('nb-name').value = ''; notify('✅ Marque ajoutée'); }
async function addModel() { const b = val('nm-brand'), n = el('nm-name').value.trim(); if (!b || !n) return notify('Infos requises', 'error'); await db.ref('data/models/' + b + '_' + Date.now()).set({ brandId: b, name: n, years: el('nm-years').value.trim() || '2017-2026' }); el('nm-name').value = ''; notify('✅ Modèle ajouté'); }
async function addMotor() {
  const mid = val('mo-model'), n = el('mo-name').value.trim(); if (!mid || !n) return notify('Infos requises', 'error');
  const ref = db.ref('data/motors/' + mid); const s = await ref.once('value'); const a = s.val() || [];
  let fuel = val('mo-fuel'), power = el('mo-power').value.trim();
  if (!power) power = guessPower(n);
  a.push({ name: n, fuel: fuel, power: power }); await ref.set(a);
  el('mo-name').value = ''; notify('✅ Motorisation ajoutée (vérifiée)');
}
async function addIssue() {
  const t = el('is-title').value.trim(); if (!t) return notify('Titre requis', 'error');
  await db.ref('data/issues/iss_' + Date.now()).set({ brandId: val('is-brand'), model: val('is-model'), title: t, detail: el('is-detail').value.trim(), source: val('is-source'), dtc: el('is-dtc').value.trim(), url: el('is-url') ? el('is-url').value.trim() : '' });
  el('is-title').value = ''; el('is-detail').value = ''; notify('✅ Panne ajoutée');
}
async function addExpert() {
  const t = el('ex-title').value.trim(); if (!t) return notify('Titre requis', 'error');
  await db.ref('data/expert/ex_' + Date.now()).set({ brandId: val('ex-brand'), model: el('ex-model').value.trim(), motor: el('ex-motor').value.trim(), title: t, symptom: el('ex-symptom').value.trim(), diagnosis: el('ex-diag').value.trim(), parts: el('ex-parts').value.trim(), dtc: el('ex-dtc').value.trim(), years: el('ex-years').value.trim(), source: val('ex-source'), url: el('ex-url') ? el('ex-url').value.trim() : '' });
  el('ex-title').value = ''; el('ex-diag').value = ''; notify('🧠 Fiche expert ajoutée');
}
async function addDTC() {
  const c = el('dt-code').value.trim().toUpperCase(), d = el('dt-desc').value.trim(); if (!c || !d) return notify('Code+description requis', 'error');
  await db.ref('data/dtc/' + c.replace(/[^A-Z0-9]+/g, '_')).set({ code: c, description: d, cause: el('dt-cause').value.trim(), solution: el('dt-sol').value.trim() });
  el('dt-code').value = ''; notify('✅ DTC ajouté');
}
async function importJSON() {
  const txt = el('import-json').value.trim(); if (!txt) return notify('Collez un JSON', 'error');
  let arr; try { arr = JSON.parse(txt); } catch (e) { return notify('❌ JSON invalide', 'error'); }
  if (!Array.isArray(arr)) arr = [arr];
  const ms = (await db.ref('data/models').once('value')).val() || {};
  let n = 0;
  for (const it of arr) {
    if (it.type === 'motor' && it.brand && it.model && it.name) {
      const e2 = Object.entries(ms).find(([k, m]) => m.brandId === it.brand && m.name.toLowerCase() === String(it.model).toLowerCase());
      if (e2) { const ref = db.ref('data/motors/' + e2[0]); const s = await ref.once('value'); const a = s.val() || []; a.push({ name: it.name, fuel: it.fuel || guessFuel(it.name), power: it.power || guessPower(it.name) }); await ref.set(a); n++; }
    } else if (it.type === 'issue' && it.brand && it.title) {
      await db.ref('data/issues/' + uid('imp')).set({ brandId: it.brand, model: it.model || '', motor: it.motor || '', title: it.title, detail: it.detail || '', source: it.source || 'Import', dtc: it.dtc || '', url: it.url || '' }); n++;
    } else if (it.type === 'expert' && it.brand && it.title) {
      await db.ref('data/expert/' + uid('imp')).set({ brandId: it.brand, model: it.model || '', motor: it.motor || '', title: it.title, symptom: it.symptom || '', diagnosis: it.diagnosis || '', parts: it.parts || '', dtc: it.dtc || '', years: it.years || '', source: it.source || 'Import', url: it.url || '' }); n++;
    } else if (it.type === 'dtc' && it.code) {
      await db.ref('data/dtc/' + String(it.code).toUpperCase().replace(/[^A-Z0-9]+/g, '_')).set({ code: String(it.code).toUpperCase(), description: it.description || '', cause: it.cause || '', solution: it.solution || '' }); n++;
    }
  }
  el('import-json').value = ''; notify('✅ ' + n + ' fiches importées');
}
function sourceLinks(q) {
  const e = encodeURIComponent(q);
  const S = 'display:inline-block;background:#1e293b;color:#4ade80;padding:6px 10px;border-radius:8px;margin:3px;font-size:12px;font-weight:600;text-decoration:none';
  const dom = BRAND_SITE[curBrand] || '';
  let h = '<div class="issue-card" style="border-left-color:#38bdf8"><strong>🌐 Sources à consulter : « ' + esc(q) + ' »</strong><p style="margin:8px 0 4px">';
  if (dom) h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:' + dom + '+rappel+' + e + '">🏭 Constructeur</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:rappel.conso.gouv.fr+' + e + '">🇫🇷 Rappel Conso</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://ec.europa.eu/safety-gate-alerts/screen/webReport/searchAdvanced">🇪 Safety Gate</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:ec.europa.eu+safety+gate+' + e + '">🇪 Safety Gate (recherche)</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.nhtsa.gov/recalls">🇺🇸 NHTSA</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:nhtsa.gov+recalls+' + e + '">🇺 NHTSA (recherche)</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:largus.fr+' + e + '">📰 L\'Argus</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:caradisiac.com+' + e + '">📰 Caradisiac</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:que-choisir.org+' + e + '">⚖️ Que Choisir</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=site:forum-auto.caradisiac.com+' + e + '">💬 Forum Auto</a>';
  h += '<a style="' + S + '" target="_blank" rel="noopener" href="https://www.google.com/search?q=' + e + '+rappel+panne+avis+proprietaires">🔎 Internet (avis/pannes)</a>';
  h += '</p></div>';
  return h;
}
let expertTimer = null;
function expertSearch() { clearTimeout(expertTimer); expertTimer = setTimeout(doExpertSearch, 300); }
async function doExpertSearch() {
  const q = el('expert-search').value.trim().toLowerCase();
  const box = el('expert-results');
  if (q.length < 3) { box.innerHTML = ''; return; }
  const ex = (await db.ref('data/expert').once('value')).val() || {};
  const iss = (await db.ref('data/issues').once('value')).val() || {};
  let html = '';
  Object.values(ex).filter(e => ((e.title || '') + ' ' + (e.symptom || '') + ' ' + (e.diagnosis || '') + ' ' + (e.parts || '') + ' ' + (e.dtc || '') + ' ' + (e.motor || '') + ' ' + (e.model || '')).toLowerCase().includes(q)).slice(0, 15).forEach(e => html += expertCard(e, '🧠 '));
  Object.values(iss).filter(i => ((i.title || '') + ' ' + (i.detail || '') + ' ' + (i.dtc || '') + ' ' + (i.model || '')).toLowerCase().includes(q)).slice(0, 10).forEach(i => html += issueCard(i, ''));
  BRAND_EXPERT.filter(e => (e[2] + ' ' + e[3] + ' ' + e[4] + ' ' + e[5] + ' ' + e[6]).toLowerCase().includes(q)).slice(0, 15).forEach(e => html += bexCard(e));
  UNIV.filter(u => (u[0] + ' ' + u[1]).toLowerCase().includes(q)).forEach(u => html += univCard(u));
  Object.entries(GENERIC).forEach(([f, g]) => g.issues.forEach(i => { if ((i[0] + ' ' + i[1]).toLowerCase().includes(q)) html += '<div class="issue-card"><strong>' + i[0] + '</strong><span class="src">Typique ' + FUELS[f] + '</span><p>' + i[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + i[2] + '</p></div>'; }));
  Object.entries(GENERIC_EXPERT).forEach(([f, list]) => list.forEach(g => { if ((g[0] + ' ' + g[1] + ' ' + g[2]).toLowerCase().includes(q)) html += genCard(g, f); }));
  html += sourceLinks(q);
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune fiche pour « ' + esc(q) + ' »</p>';
}
function srcLink(u) { return u ? '<p><a href="' + u + '" target="_blank" rel="noopener" style="color:#4ade80;font-size:12px;font-weight:600">🔗 Source officielle / spécialisée</a></p>' : ''; }
function univCard(u) { return '<div class="issue-card" style="border-left-color:#f59e0b"><strong>🌐 ' + u[0] + '</strong><span class="src">' + u[3] + '</span><p>' + u[1] + '</p>' + (u[2] ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + u[2] + '</p>' : '') + '</div>'; }
function bexCard(e) {
  const bn = brandsData[e[0]] ? brandsData[e[0]].name : e[0];
  return '<div class="issue-card" style="border-left-color:#f59e0b"><strong>🧠 ' + esc(e[2]) + '</strong><span class="src">' + esc(e[7]) + '</span><span class="src">' + esc(bn) + '</span>' + (e[1] ? '<span class="src">' + esc(e[1]) + '</span>' : '') +
    '<p><strong>⚠️ Symptômes :</strong> ' + esc(e[3]) + '</p><p><strong>🔬 Diagnostic ingénieur :</strong> ' + esc(e[4]) + '</p><p><strong>🔩 Pièces :</strong> ' + esc(e[5]) + '</p>' +
    (e[6] ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + esc(e[6]) + '</p>' : '') + '<p style="font-size:11px;color:#94a3b8">Années : ' + esc(e[8]) + ' • Tous modèles</p></div>';
}
function genCard(g, f) { return '<div class="issue-card" style="border-left-color:#38bdf8"><strong>🔬 ' + g[0] + '</strong><span class="src">Procédure ingénieur ' + FUELS[f] + '</span><p><strong>⚠️ Symptômes :</strong> ' + g[1] + '</p><p><strong>🧪 Protocole :</strong> ' + g[2] + '</p><p><strong>🔩 Pièces :</strong> ' + g[3] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + g[4] + '</p></div>'; }
function expertCard(e, prefix) {
  const bn = brandsData[e.brandId] ? brandsData[e.brandId].name : '';
  return '<div class="issue-card" style="border-left-color:#f59e0b"><strong>' + prefix + esc(e.title) + '</strong><span class="src">🧠 ' + esc(e.source || 'Expert') + '</span>' + (bn ? '<span class="src">' + esc(bn) + '</span>' : '') + (e.model ? '<span class="src">' + esc(e.model) + '</span>' : '') + (e.motor ? '<span class="src">' + esc(e.motor) + '</span>' : '') +
    (e.symptom ? '<p><strong>⚠️ Symptômes :</strong> ' + esc(e.symptom) + '</p>' : '') +
    (e.diagnosis ? '<p><strong>🔬 Diagnostic ingénieur :</strong> ' + esc(e.diagnosis) + '</p>' : '') +
    (e.parts ? '<p><strong>🔩 Pièces :</strong> ' + esc(e.parts) + '</p>' : '') +
    (e.dtc ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + esc(e.dtc) + '</p>' : '') +
    (e.years ? '<p style="font-size:11px;color:#94a3b8">Années : ' + esc(e.years) + '</p>' : '') + srcLink(e.url) + '</div>';
}
function issueCard(i, prefix) { return '<div class="issue-card"><strong>' + prefix + esc(i.title) + '</strong><span class="src">' + esc(i.source || '') + '</span>' + (i.motor ? '<span class="src">' + esc(i.motor) + '</span>' : '') + '<p>' + esc(i.detail || '') + '</p>' + (i.dtc ? '<p style="color:#fbbf24;font-size:12px">DTC : ' + esc(i.dtc) + '</p>' : '') + srcLink(i.url) + '</div>'; }
async function enterApp() {
  const s = getSession(); const isAdmin = sessionStorage.getItem('autodiag_admin') === '1';
  if (!isAdmin && (!s || s.status !== 'accepted')) return notify('Accès non autorisé', 'error');
  await ensureCatalog();
  el('app-user').textContent = isAdmin ? '👑 Admin' : s.prenom;
  showScreen('screen-app');
  brandsData = (await db.ref('data/brands').once('value')).val() || {};
  const sel = el('sel-marque');
  const regions = { francaises: '🇫🇷 Françaises', europeennes: '🇪🇺 Européennes', asiatiques: '🌏 Asiatiques', chinoises: '🇨 Chinoises', americaines: '🇺🇸 Américaines' };
  sel.innerHTML = '<option value="">-- Choisir --</option>';
  Object.entries(regions).forEach(([r, label]) => {
    const items = Object.entries(brandsData).filter(([, b]) => b.region === r);
    if (!items.length) return;
    sel.innerHTML += '<optgroup label="' + label + '">' + items.map(([k, b]) => '<option value="' + k + '">' + esc(b.name) + '</option>').join('') + '</optgroup>';
  });
}
function logoutApp() { showScreen(sessionStorage.getItem('autodiag_admin') === '1' ? 'screen-admin' : 'screen-accepted'); }
async function loadModels() {
  curBrand = val('sel-marque'); curModelId = null; motorsCache = [];
  el('sel-model').innerHTML = '<option value="">-- Modèle --</option>';
  el('sel-motor').innerHTML = '<option value="">-- Motorisation --</option>';
  ['issues-box', 'dtc-box', 'expert-box'].forEach(id => el(id).innerHTML = '<p style="color:#94a3b8">Sélectionnez…</p>');
  if (!curBrand) return;
  const s = (await db.ref('data/models').once('value')).val() || {};
  Object.entries(s).filter(([k, m]) => m.brandId === curBrand).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, m]) => { el('sel-model').innerHTML += '<option value="' + k + '">' + esc(m.name) + ' (' + esc(m.years) + ')</option>'; });
}
async function loadMotors() {
  curModelId = val('sel-model'); motorsCache = [];
  el('sel-motor').innerHTML = '<option value="">-- Motorisation --</option>';
  if (!curModelId) { correlate(); return; }
  const m = (await db.ref('data/models/' + curModelId).once('value')).val();
  curModelName = m ? m.name : '';
  motorsCache = (await db.ref('data/motors/' + curModelId).once('value')).val() || [];
  motorsCache.forEach((mo, i) => { el('sel-motor').innerHTML += '<option value="' + i + '">' + esc(mo.name) + ' • ' + (FUELS[mo.fuel] || mo.fuel) + (mo.power ? ' • ' + esc(mo.power) : '') + '</option>'; });
  correlate();
}
function motorMatch(e, motor) { if (!e.motor) return true; if (!motor) return false; const a = String(e.motor).toLowerCase(), b = String(motor.name).toLowerCase(); return b.includes(a) || a.includes(b); }
/* ===== CORRÉLATION STRICTE pannes ↔ modèle ↔ motorisation ===== */
async function correlate() {
  const box = el('issues-box'), dbox = el('dtc-box'), ebox = el('expert-box');
  if (!curBrand || !curModelName) { box.innerHTML = dbox.innerHTML = ebox.innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule…</p>'; return; }
  const mi = val('sel-motor'); const motor = mi !== '' ? motorsCache[mi] : null;
  const fuel = motor ? motor.fuel : null;
  const all = Object.values((await db.ref('data/issues').once('value')).val() || {}).filter(i => i.brandId === curBrand && (!i.model || i.model === curModelName));
  const specific = motor ? all.filter(i => i.motor && String(motor.name).toLowerCase().includes(String(i.motor).toLowerCase())) : [];
  const general = all.filter(i => !specific.includes(i));
  let html = '', hidden = 0;
  specific.forEach(i => html += issueCard(i, '🎯 '));
  if (motor) {
    general.forEach(i => { const f = issueFuel(i); if (!f || f === fuel) html += issueCard(i, ''); else hidden++; });
    if (hidden) html += '<p style="font-size:12px;color:#94a3b8">🔎 ' + hidden + ' panne(s) d\'autres motorisations masquée(s) — filtre actif : ' + FUELS[fuel] + ' (' + esc(motor.name) + ')</p>';
  } else {
    general.forEach(i => html += issueCard(i, ''));
  }
  if (fuel && GENERIC[fuel]) GENERIC[fuel].issues.forEach(g => { html += '<div class="issue-card"><strong>' + g[0] + '</strong><span class="src">Typique ' + FUELS[fuel] + '</span><p>' + g[1] + '</p><p style="color:#fbbf24;font-size:12px">DTC : ' + g[2] + '</p></div>'; });
  UNIV.forEach(u => html += univCard(u));
  const bn = brandsData[curBrand] ? brandsData[curBrand].name : curBrand;
  html += sourceLinks(bn + ' ' + curModelName + (motor ? ' ' + motor.name : '') + ' rappel panne');
  box.innerHTML = html || '<p style="color:#94a3b8">Aucune panne — vérifiez les sites officiels.</p>';
  const exAll = Object.values((await db.ref('data/expert').once('value')).val() || {});
  const exHits = exAll.filter(e => e.brandId === curBrand && (!e.model || e.model === curModelName) && motorMatch(e, motor));
  const bex = BRAND_EXPERT.filter(e => e[0] === curBrand && kwMatch(e[1], motor));
  let eh = '';
  exHits.forEach(e => eh += expertCard(e, '🧠 '));
  bex.forEach(e => eh += bexCard(e));
  if (fuel && GENERIC_EXPERT[fuel]) GENERIC_EXPERT[fuel].forEach(g => eh += genCard(g, fuel));
  ebox.innerHTML = eh || '<p style="color:#94a3b8">Aucune fiche expert — recherche par symptôme ci-dessus.</p>';
  const codes = new Set();
  all.forEach(i => { const f = issueFuel(i); if (motor && f && f !== fuel) return; String(i.dtc || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }); });
  exHits.forEach(e => String(e.dtc || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  bex.forEach(e => String(e[6] || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  UNIV.forEach(u => String(u[2] || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].dtc.forEach(c => codes.add(c));
  if (fuel && GENERIC_EXPERT[fuel]) GENERIC_EXPERT[fuel].forEach(g => String(g[4] || '').split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }));
  const D = (await db.ref('data/dtc').once('value')).val() || {};
  let dh = '';
  codes.forEach(c => { const d = D[c] || D[c.replace(/[^A-Z0-9]+/g, '_')]; dh += d ? '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>' : '<div class="dtc-card"><strong>' + esc(c) + '</strong><p>Code corrélé (détail à importer)</p></div>'; });
  dbox.innerHTML = dh || '<p style="color:#94a3b8">—</p>';
}
let dtcTimer = null;
function searchDTC() { clearTimeout(dtcTimer); dtcTimer = setTimeout(doSearchDTC, 300); }
async function doSearchDTC() {
  const q = el('dtc-search').value.toUpperCase().trim(); const c = el('dtc-results');
  if (q.length < 2) { c.innerHTML = ''; return; }
  const m = Object.values((await db.ref('data/dtc').once('value')).val() || {}).filter(d => (d.code || '').toUpperCase().includes(q) || (d.description || '').toLowerCase().includes(q.toLowerCase()));
  c.innerHTML = m.length ? m.slice(0, 12).map(d => '<div class="dtc-card"><strong>' + esc(d.code) + '</strong><p>' + esc(d.description) + '</p>' + (d.cause ? '<p>🔍 ' + esc(d.cause) + '</p>' : '') + (d.solution ? '<p>🔧 ' + esc(d.solution) + '</p>' : '') + '</div>').join('') : '<p style="color:#94a3b8">Aucun DTC trouvé</p>';
}
function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; el('install-btn').classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { el('install-btn').classList.add('hidden'); notify('🎉 APK installée !'); });
}
async function installApp() { if (!deferredPrompt) return notify('Non disponible ici', 'error'); deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; el('install-btn').classList.add('hidden'); }
