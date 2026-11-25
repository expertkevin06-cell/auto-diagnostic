/* ============================================================
   KEV FUSION 2026 — ENRICH v22
   Auto-enrichissement massif à chaque mise à jour MANUELLE admin
   + élargissement de la recherche (synonymes techniques)
   ------------------------------------------------------------
   Les fiches générées sont des PROTOCOLES DE DIAGNOSTIC DÉRIVÉS
   (analyse technique), jamais de fausses campagnes officielles.
   Les rappels officiels restent issus de CAMPAIGNS / saisie admin.
   ============================================================ */

const ENRICH_AXES = [
{k:"lubrication",t:"Lubrification / pression d'huile",f:["essence","diesel","hybride"],
 s:"Voyant pression d'huile, claquement à chaud, consommation anormale, émulsion",
 p:"1) Mesure pression d'huile à chaud (ralenti + 3000 tr/min) vs spec 2) Contrôle niveau et dilution carburant 3) Inspection crépine et carter (débris de courroie) 4) Test capteur de pression 5) Analyse d'huile (limailles, carburant, LDR)",
 o:"Pompe à huile, crépine, capteur de pression, joints de queue de soupape, PCV",d:"P0521, P0522, P0087",kw:["huile","pression","limaille","consommation"]},
{k:"cooling",t:"Refroidissement / fuite LDR",f:["essence","diesel","hybride"],
 s:"Baisse de niveau, surchauffe, odeur sucrée, traces blanches, chauffage habitacle faible",
 p:"1) Mise sous pression du circuit (1,2 bar) 2) Inspection trou de purge pompe à eau 3) Test thermostat (P0128) 4) Contrôle radiateur/ventilateur et déclenchement 5) Test CO2 dans le vase (joint de culasse) 6) Point de congélation au réfractomètre",
 o:"Pompe à eau, thermostat, radiateur, ventilateur, durites, vase d'expansion, joint de culasse",d:"P0217, P0128, P0116",kw:["ldr","surchauffe","thermostat","radiateur","culasse"]},
{k:"timing",t:"Distribution (chaîne / courroie)",f:["essence","diesel","hybride"],
 s:"Claquement à froid, décalage de calage, ratés, perte de puissance, bruit métallique",
 p:"1) Scope synchro vilebrequin / arbre à cames 2) Mesure du décalage vs tolérance constructeur 3) Contrôle tensionneur et guides 4) Courroie humide : gabarit d'usure + inspection carter 5) Kit complet + pompe à eau + joints spi",
 o:"Chaîne/courroie, tensionneur, guides, pignons, pompe à eau, joints spi",d:"P0016, P0017, P0335, P0340",kw:["distribution","chaîne","courroie","tendeur","calage"]},
{k:"boost",t:"Suralimentation / turbo",f:["essence","diesel","hybride"],
 s:"Perte puissance, sifflement anormal, fumée, mode dégradé, à-coups en charge",
 p:"1) Test étanchéité admission/échappement (fumigène) 2) Pression suralimentation mesurée vs cartographie 3) Jeu axial/radial de l'arbre 4) Course libre actuateur GAV / wastegate 5) Contrôle intercooler et durites",
 o:"Turbocompresseur, actuateur GAV, wastegate, durites, intercooler, capteur de pression",d:"P0299, P0234, P0236, P2563",kw:["turbo","suralimentation","gav","wastegate","intercooler"]},
{k:"ignition",t:"Allumage essence",f:["essence","hybride"],
 s:"Ratés, à-coups, voyant moteur clignotant, démarrage difficile, surconsommation",
 p:"1) Lecture compteurs de ratés par cylindre 2) Permutation bobines/bougies pour localiser 3) Écartement et couple bougies (culasse alu) 4) Test compressions 5) Contrôle alimentation et masse bobines",
 o:"Bobines, bougies, faisceau d'allumage, capteur PMH",d:"P0300, P0301, P0302, P0303, P0304",kw:["allumage","bougies","bobines","ratés"]},
{k:"di_injection",t:"Injection directe essence / calamine",f:["essence","hybride"],
 s:"Ralenti instable, cliquetis, perte de puissance progressive, dépôts admission",
 p:"1) Endoscopie soupapes d'admission 2) Mesure dépôts (> 2 mm = décalaminage) 3) Pression rail HP vs consigne 4) Test débits injecteurs 5) MAJ cartographie injection 6) Contrôle capteur cliquetis",
 o:"Injecteurs HP, pompe HP, rail, soupapes admission, capteur cliquetis",d:"P0087, P0172, P0325, P0300",kw:["calamine","injection directe","cliquetis","gdi"]},
{k:"diesel_injection",t:"Injection diesel / pompe HP",f:["diesel"],
 s:"Claquement, fumée noire/blanche, ratés, démarrage difficile, perte de puissance",
 p:"1) Test débits retour injecteurs à chaud 2) Pression rail ralenti/charge vs consigne 3) Banc injecteurs si hors tolérance 4) Codage des injecteurs neufs 5) Filtre carburant + purge eau 6) Contrôle came d'entraînement pompe HP",
 o:"Injecteurs, pompe HP, rail, régulateur, filtre carburant, joints cuivre",d:"P0087, P0088, P0201, P0263",kw:["injecteur","pompe hp","rail","gazole","débit retour"]},
{k:"egr",t:"EGR / refroidisseur EGR",f:["diesel","essence"],
 s:"Perte puissance, voyant moteur, ralenti instable, fumée, fuite LDR",
 p:"1) Test ouverture EGR consigne vs réel à la valise 2) Mesure ΔP et encrassement 3) Mise sous pression du refroidisseur (fuite = risque incendie) 4) Nettoyage ou remplacement 5) Adaptation après intervention",
 o:"Vanne EGR, refroidisseur EGR, collecteur, capteur de position",d:"P0401, P0402, P0490",kw:["egr","refroidisseur","encrassement"]},
{k:"dpf",t:"FAP / GPF : colmatage et régénération",f:["diesel","essence"],
 s:"Régénérations fréquentes, mode dégradé, perte de puissance, voyant filtre",
 p:"1) Lecture ΔP et taux de cendres 2) Historique des régénérations et des trajets 3) Régénération forcée à la valise 4) Endoscopie substrat 5) Remplacement si colmatage irréversible 6) Contrôle additif (Eolys) selon version",
 o:"FAP/GPF, capteur ΔP, sonde température, additif, catalyseur amont",d:"P2002, P2463, P242F, P2452",kw:["fap","gpf","particules","régénération","cendres"]},
{k:"scr",t:"SCR / AdBlue / capteurs NOx",f:["diesel"],
 s:"Countdown non-démarrage, voyant AdBlue, limitation de puissance",
 p:"1) Lecture P20EE / P204F / P2201 2) Test débit pompe à la valise 3) Inspection cristallisation injecteur et ligne chauffée 4) Qualité solution ISO 22241 (réfractomètre 32,5 %) 5) Comparaison NOx amont/aval 6) Réinitialisation des compteurs",
 o:"Pompe AdBlue, injecteur, réservoir, ligne chauffée, capteurs NOx amont/aval",d:"P20EE, P204F, P207F, P2201, P229F",kw:["adblue","scr","nox","countdown","cristallisation"]},
{k:"catalyst",t:"Catalyseur / sondes lambda",f:["essence","hybride"],
 s:"Voyant moteur, odeur soufre, contre-pression, surconsommation, échec contrôle technique",
 p:"1) Lecture P0420/P0430 2) Comparaison tension sonde amont (oscillation) / aval (stable) 3) Mesure contre-pression échappement 4) Contrôle étanchéité ligne (prise d'air parasite) 5) Remplacement si rendement hors seuil",
 o:"Catalyseur, sondes lambda amont/aval, ligne échappement",d:"P0420, P0430, P0135, P0141",kw:["catalyseur","lambda","sonde","échappement"]},
{k:"gearbox_auto",t:"Boîte automatique / DCT / CVT",f:["essence","diesel","hybride"],
 s:"À-coups, broutage, patinage, message boîte chaude, rapports non engagés",
 p:"1) Lecture adaptations embrayages K1/K2 ou convertisseur 2) Niveau, état et température huile 3) Application TSB + MAJ TCU 4) Test solénoïdes mécatronique 5) Apprentissage route cycle complet 6) Vidange si usage sévère",
 o:"Mécatronique, embrayages, convertisseur, huile, solénoïdes, TCU",d:"P0700, P17BF, P0730, P0218",kw:["boîte","dct","dsg","cvt","mécatronique","broutage"]},
{k:"clutch",t:"Embrayage / volant bi-masse",f:["essence","diesel"],
 s:"Vibrations au démarrage, patinage, point de patinage haut, bruit au débrayage",
 p:"1) Essai routier en charge (patinage) 2) Mesure jeu volant bi-masse 3) Contrôle butée et fourchette 4) Fuite d'huile sur disque (joint spi) 5) Kit embrayage + volant si hors tolérance",
 o:"Disque, mécanisme, butée, volant bi-masse, joint spi, récepteur",d:"",kw:["embrayage","volant","butée","patinage"]},
{k:"steering",t:"Direction assistée",f:["essence","diesel","hybride","electrique"],
 s:"À-coups volant, dureté intermittente, voyant direction, bruit de colonne",
 p:"1) Lecture codes EPS 2) Contrôle alimentation et masses (chute de tension) 3) Test capteur de couple et angle 4) MAJ logiciel EPS 5) Contrôle crémaillère/colonne et rotules",
 o:"Colonne EPS, moteur d'assistance, capteur couple/angle, crémaillère, rotules",d:"C1511, C1513, U0126",kw:["direction","eps","volant","crémaillère"]},
{k:"brake_hydraulic",t:"Freinage hydraulique",f:["essence","diesel","hybride","electrique"],
 s:"Pédale molle ou dure, vibrations, distance allongée, voyant frein, tirage",
 p:"1) Épaisseur garnitures (mini 3 mm) et disques (cote gravée) 2) Voile au comparateur (< 0,05 mm) 3) Test humidité liquide (> 3 % = remplacement) 4) Contrôle flexibles et étriers (grippage) 5) Purge et essai routier",
 o:"Plaquettes, disques, étriers, flexibles, maître-cylindre, liquide DOT4",d:"C1365, C0035",kw:["frein","plaquette","disque","étrier","liquide"]},
{k:"brake_regen",t:"Freinage régénératif / servofrein électrique",f:["hybride","electrique"],
 s:"À-coups en décélération, pédale dure, transition brutale, freins AR grippés",
 p:"1) MAJ logiciel de gestion régénérative 2) Calibration capteur de pédale 3) Test assistance servofrein électrique 4) Démontage/graissage étriers AR (sous-utilisation) 5) Contrôle corrosion disques",
 o:"Servofrein électrique, capteur pédale, logiciel, étriers AR, disques",d:"C1365, P0A7F",kw:["régénératif","servofrein","pédale","grippage"]},
{k:"suspension_air",t:"Suspension pneumatique / pilotée",f:["essence","diesel","hybride","electrique"],
 s:"Affaissement après stationnement, défaut hauteur, message suspension, claquements",
 p:"1) Test d'étanchéité coussins et durites (savon) 2) Débit et temps de montée compresseur 3) Lecture capteurs de hauteur 4) Bloc valves et dessiccateur 5) Remplacement coussins par essieu 6) Géométrie après intervention",
 o:"Coussins pneumatiques, compresseur, bloc valves, capteurs hauteur, dessiccateur",d:"C1511, C1525",kw:["suspension","pneumatique","coussin","compresseur","hauteur"]},
{k:"suspension_mech",t:"Amortisseurs / ressorts / liaisons",f:["essence","diesel","hybride","electrique"],
 s:"Claquements sur bosses, tenue de route dégradée, usure pneus asymétrique, véhicule penché",
 p:"1) Test de rebond et fuite d'huile amortisseur 2) Inspection ressorts (fissures, corrosion, diamètre de fil) 3) Jeu rotules, biellettes, silentblocs 4) Butées et coupelles 5) Géométrie et essai routier",
 o:"Amortisseurs, ressorts, coupelles, butées, rotules, biellettes, silentblocs",d:"",kw:["amortisseur","ressort","rotule","silentbloc","claquement"]},
{k:"tyres_tpms",t:"Pneumatiques / TPMS / géométrie",f:["essence","diesel","hybride","electrique"],
 s:"Usure irrégulière, voyant pression, tirage, vibrations à vitesse stabilisée",
 p:"1) Sculpture (légal 1,6 mm / conseillé 3 mm) et date DOT (< 6 ans) 2) Pression à froid selon étiquette 3) Équilibrage et faux-rond jante 4) Apprentissage capteurs TPMS 5) Géométrie si usure asymétrique",
 o:"Pneus, jantes, capteurs TPMS, géométrie, roulements",d:"C0700",kw:["pneu","tpms","pression","géométrie","équilibrage"]},
{k:"lighting",t:"Éclairage / signalisation",f:["essence","diesel","hybride","electrique"],
 s:"Voyant ampoule, portée insuffisante, condensation optique, clignotement rapide",
 p:"1) Contrôle alimentation et masse des feux 2) Réglage des optiques au régloscope 3) Étanchéité et condensation 4) Test modules LED / calculateurs d'éclairage 5) MAJ logiciel si feux matriciels",
 o:"Optiques, modules LED, calculateurs éclairage, faisceau, capteurs d'assiette",d:"B1000, U0140",kw:["éclairage","phare","led","optique","feu"]},
{k:"hvac_thermal",t:"Climatisation thermique",f:["essence","diesel","hybride"],
 s:"Froid insuffisant, odeurs, bruit compresseur, embuage persistant",
 p:"1) Pression HP/BP et température sortie grille 2) Recherche fuite (azote/UV) 3) Contrôle compresseur et embrayage 4) Filtre déshydratant / détendeur 5) Désinfection évaporateur 6) Recharge à la masse prescrite",
 o:"Compresseur, condenseur, détendeur, évaporateur, filtre déshydratant, ventilateur",d:"",kw:["clim","climatisation","compresseur","froid","evaporateur"]},
{k:"hvac_ev",t:"Pompe à chaleur / thermique EV",f:["electrique","hybride"],
 s:"Chauffage habitacle faible, autonomie hiver effondrée, bruit vanne, charge lente à froid",
 p:"1) Lecture codes thermiques 2) Test octovalve / vannes de commutation 3) Contrôle circuit frigo et gaz 4) Résistance de préchauffage HV 5) Boucle LDR batterie et pompe 6) MAJ logicielle gestion thermique",
 o:"Pompe à chaleur, octovalve, vannes, résistance HV, pompe LDR, échangeur",d:"P0C00, P0AA6",kw:["pompe à chaleur","octovalve","chauffage","hiver","préconditionnement"]},
{k:"battery12",t:"Batterie 12V / réseau de bord",f:["essence","diesel","hybride","electrique"],
 s:"Non-démarrage, reboots électroniques, voyants multiples, décharge après stationnement",
 p:"1) Test SOH et tension à froid (< 12,4 V = alerte) 2) Mesure courant de repos (< 30 mA) 3) Test alternateur ou DC-DC en charge 4) Codage BMS après remplacement 5) MAJ gestion de veille",
 o:"Batterie 12V AGM/EFB, alternateur, DC-DC, capteur IBS, calculateurs veille",d:"P0562, U0111, B1000",kw:["12v","batterie","décharge","alternateur","dc-dc","ibs"]},
{k:"battery48",t:"Réseau 48V / mild-hybrid",f:["hybride","diesel","essence"],
 s:"Stop & start inopérant, non-démarrage, à-coups au redémarrage, voyant 48V",
 p:"1) Lecture codes réseau 48V 2) SOH batterie lithium 48V 3) Test alterno-démarreur / BSG 4) Contrôle courroie renforcée et galets 5) Vérification convertisseur 48/12V 6) Application campagnes",
 o:"Batterie 48V, alterno-démarreur BSG, convertisseur 48/12V, courroie renforcée",d:"P0562, P0A7F",kw:["48v","mhev","bsg","alterno-démarreur","mild"]},
{k:"hv_soh",t:"Batterie HV : SOH et équilibrage",f:["hybride","electrique"],
 s:"Autonomie réduite, charge plafonnée, limitation de puissance, delta de cellules",
 p:"1) Lecture SOH pack et delta cellules (> 60 mV = alerte) 2) Thermographie modules 3) Charge lente complète pour équilibrage 4) MAJ BMS 5) Rapport SOH archivé (seuil garantie 70 %) 6) Remplacement module si écart persistant",
 o:"Modules HV, BMS, capteurs température, contacteurs, busbar",d:"P0AA6, U0111, P0A7F, P0A80",kw:["soh","batterie hv","delta","cellule","équilibrage","autonomie"]},
{k:"hv_isolation",t:"Isolement HV / sécurité électrique",f:["hybride","electrique"],
 s:"Alerte isolement, coupure de sécurité, refus de charge, non-démarrage",
 p:"1) Consignation HV (habilitation obligatoire) 2) Mégohmmètre : > 1 MΩ requis 3) Sectionnement par branche (compresseur, chauffage, onduleur, batterie) 4) Contrôle câblage orange et connecteurs 5) Remplacement du composant fautif",
 o:"Câblage HV, compresseur électrique, chauffage PTC, onduleur, pack batterie",d:"P0AA6, P0AB0",kw:["isolement","hv","mégohmmètre","sécurité","consignation"]},
{k:"charging",t:"Charge AC / DC : OBC, ICCU, connecteur",f:["electrique","hybride"],
 s:"Charge absente ou interrompue, charge lente, échauffement connecteur, verrou bloqué",
 p:"1) Test multi-bornes AC puis DC pour isoler le défaut 2) Lecture codes OBC / ICCU 3) Résistances CP/PP et câble mode 2 4) Thermographie broches connecteur 5) Test DC-DC et batterie 12V 6) MAJ logicielle de charge",
 o:"OBC, ICCU, DC-DC, connecteur Type2/CCS, verrou, câble mode 2",d:"P0D11, U0111, P0AA6",kw:["charge","obc","iccu","connecteur","ccs","type2","verrou"]},
{k:"emotor",t:"Moteur électrique / onduleur / réducteur",f:["electrique","hybride"],
 s:"Sifflement, vibration à l'accélération, perte de puissance, ronflement en décélération",
 p:"1) Analyse vibratoire et logs onduleur 2) Contrôle boucle LDR onduleur et pompe 3) Mesure isolement enroulements 4) Jeu et huile de réducteur 5) Contrôle roulements et capteur de position rotor",
 o:"Onduleur, moteur électrique, roulements, réducteur, capteur rotor, pompe LDR",d:"P0AA6, P0A93, P0C00",kw:["onduleur","moteur électrique","réducteur","roulement","sifflement"]},
{k:"adas",t:"ADAS : caméras, radar, calibration",f:["essence","diesel","hybride","electrique"],
 s:"Freinage fantôme, désengagement d'assistance, voyant ADAS, régulateur inopérant",
 p:"1) Lecture codes ADAS et logs de désengagement 2) Propreté optiques et support pare-brise 3) Calibration statique puis dynamique 4) Contrôle géométrie, hauteur de caisse et dimensions pneus 5) MAJ firmware vs dernier patch sécurité",
 o:"Caméra frontale, radar, calculateurs ADAS, ultrasons, pare-brise, support",d:"U0121, U0101, U0235",kw:["adas","radar","caméra","calibration","acc","freinage fantôme"]},
{k:"network",t:"Calculateurs / réseaux multiplexés",f:["essence","diesel","hybride","electrique"],
 s:"Défauts multiples intermittents, écrans figés, perte de communication, reboots",
 p:"1) Lecture défauts U-code sur tous les calculateurs 2) Taux d'erreurs de trames CAN/LIN 3) Contrôle masses, alimentations et terminaisons 120 Ω 4) Inspection connecteurs (oxydation, vibration) 5) MAJ logicielle gateway",
 o:"Gateway, faisceau CAN/LIN, connecteurs, masses, calculateurs, terminaisons",d:"U0101, U0121, U0140, U1000",kw:["can","réseau","gateway","u0101","multiplexé","écran"]},
{k:"harness",t:"Faisceau / connecteurs / corrosion",f:["essence","diesel","hybride","electrique"],
 s:"Défauts intermittents par temps humide, courts-circuits, voyants aléatoires",
 p:"1) Inspection zones de frottement et passages de cloison 2) Test continuity et chute de tension sous charge 3) Recherche d'oxydation (connecteurs bas de caisse, hayon, portes) 4) Graisse diélectrique et réfection des masses 5) Réparation par soudure + gaine thermorétractable",
 o:"Faisceau, connecteurs, masses, passe-cloisons, gaines, soudures",d:"U1000, B1000",kw:["faisceau","connecteur","corrosion","masse","court-circuit"]},
{k:"starting",t:"Démarrage / préchauffage",f:["essence","diesel"],
 s:"Démarrage long à froid, fumée blanche au lancement, calage après démarrage",
 p:"1) Test batterie et chute de tension au lancement 2) Diesel : bougies de préchauffage et relais (résistance individuellement) 3) Essence : bougies/bobines et pression carburant 4) Capteurs température LDR et air 5) Contrôle compression à froid",
 o:"Bougies préchauffage, relais, démarreur, batterie, capteurs température",d:"P0380, P0671, P0672, P0335",kw:["démarrage","préchauffage","froid","démarreur"]},
{k:"exhaust",t:"Échappement / corrosion / supports",f:["essence","diesel","hybride"],
 s:"Bruit anormal, odeur dans l'habitacle, cliquetis thermique, fuite au démarrage",
 p:"1) Inspection ligne complète (fuites, corrosion perforante) 2) Contrôle silentblocs et supports 3) Test étanchéité avant catalyseur (prise d'air fausse les sondes) 4) Sertissages et colliers 5) Remplacement par tronçon",
 o:"Ligne échappement, silentblocs, colliers, flexible, catalyseur, FAP",d:"P0420, P2002",kw:["échappement","corrosion","silentbloc","fuite","bruit"]},
{k:"body_utility",t:"Carrosserie / portes / utilitaires",f:["essence","diesel","hybride","electrique"],
 s:"Porte coulissante qui force, hayon électrique inopérant, serrure grippée, infiltrations",
 p:"1) Nettoyage et lubrification rail + galets 2) Réglage gâche et serrure 3) Test moteurs hayon et capteurs de position 4) Recherche d'infiltrations (joints, passe-cloisons, feux) 5) Contrôle fixations de carrosserie sur châssis",
 o:"Rail, galets, serrure, gâche, moteurs hayon, joints, fixations",d:"",kw:["porte","hayon","rail","serrure","infiltration","carrosserie"]},
{k:"upfit",t:"Équipements : benne, PdF, frigorifique",f:["diesel","essence","electrique"],
 s:"Benne qui ne monte pas, prise de force inopérante, groupe froid en défaut",
 p:"1) Niveau et pression hydraulique, test pompe 2) Vérins et flexibles (fuites, gonflement) 3) Embrayage de prise de force et boîte de transfert 4) Distributeur et commande 5) Groupe froid : compresseur, gaz, circuit 6) Contrôle alimentations auxiliaires",
 o:"Pompe hydraulique, vérins, flexibles, prise de force, distributeur, compresseur frigo",d:"",kw:["benne","pdf","prise de force","hydraulique","frigorifique","vérin"]},
{k:"passive_safety",t:"Sécurité passive : airbags / ceintures",f:["essence","diesel","hybride","electrique"],
 s:"Voyant airbag allumé, prétensionneur en défaut, ceinture bloquée",
 p:"1) Lecture codes calculateur airbag (ne jamais effacer avant diagnostic) 2) Contrôle résistance des circuits d'allumage (simulateur, jamais d'ohmmètre direct) 3) Vérification VIN dans les campagnes générateur/inflateur 4) Contrôle ancrages et prétensionneurs 5) Remplacement selon campagne, consignation batterie avant intervention",
 o:"Calculateur airbag, inflateurs, prétensionneurs, capteurs de choc, spiral cable",d:"B1000, B0100",kw:["airbag","ceinture","prétensionneur","inflateur","takata","sécurité"]},
{k:"software_ota",t:"Logiciel / OTA / calculateurs",f:["essence","diesel","hybride","electrique"],
 s:"Perte de fonctions après mise à jour, écran noir, lenteur, reboot en boucle",
 p:"1) Relevé versions logicielles de tous les calculateurs 2) Logs OTA et watchdog 3) Re-flash du calculateur concerné 4) Vérification alimentation stable pendant la MAJ (batterie sous chargeur) 5) Contrôle campagnes constructeur applicables au VIN",
 o:"Calculateurs, gateway, mémoire eMMC, alimentation, head unit",d:"U0101, U1000",kw:["ota","logiciel","maj","reboot","emmc","flash"]}
];

/* Synonymes techniques : élargit massivement la recherche sans créer de fiches */
const SEARCH_SYNONYMS = {
 "courroie":["distribution","belt","humide","tendeur","gabarit"],
 "chaîne":["chaine","distribution","tensionneur","guides","p0016"],
 "distribution":["courroie","chaîne","calage","synchro"],
 "egr":["vanne","refroidisseur","encrassement","p0401"],
 "fap":["dpf","particules","colmatage","régénération","p2002","cendres"],
 "gpf":["fap","particules","essence","p2463"],
 "adblue":["scr","nox","countdown","cristallisation","p20ee","urée"],
 "injecteur":["injection","débit retour","rail","pompe hp","codage","claquement"],
 "turbo":["suralimentation","gav","wastegate","p0299","sifflement","intercooler"],
 "batterie":["soh","hv","12v","delta","cellules","équilibrage","autonomie"],
 "soh":["batterie","autonomie","dégradation","capacité","garantie"],
 "charge":["obc","iccu","connecteur","type2","ccs","verrou","dc-dc"],
 "frein":["freinage","plaquette","disque","étrier","servofrein","liquide","régénératif"],
 "servofrein":["assistance","pédale","freinage","électrique"],
 "boîte":["transmission","dct","dsg","cvt","mécatronique","embrayage","à-coups"],
 "embrayage":["broutage","volant","butée","patinage","k1","k2"],
 "suspension":["amortisseur","ressort","coussin","compresseur","hauteur","pneumatique"],
 "ressort":["suspension","rupture","diamètre","coupelle","affaissement"],
 "adas":["caméra","radar","calibration","acc","autopilot","freinage fantôme"],
 "caméra":["adas","radar","calibration","recul","pare-brise"],
 "surchauffe":["ldr","refroidissement","thermostat","pompe à eau","radiateur","culasse"],
 "thermostat":["p0128","température","refroidissement","calorstat"],
 "huile":["lubrification","pression","consommation","segments","pcv","crépine"],
 "allumage":["bougies","bobines","ratés","p0300"],
 "calamine":["admission","soupapes","injection directe","décalaminage","endoscopie"],
 "catalyseur":["lambda","sonde","p0420","échappement"],
 "12v":["batterie","dc-dc","décharge","alternateur","ibs"],
 "48v":["mhev","bsg","alterno-démarreur","mild"],
 "isolement":["hv","mégohmmètre","sécurité","consignation","p0aa6"],
 "onduleur":["inverter","moteur électrique","p0a93","ldr"],
 "pompe à chaleur":["octovalve","chauffage","hiver","autonomie","préconditionnement"],
 "écran":["reboot","head unit","gateway","u0101","logiciel"],
 "faisceau":["connecteur","corrosion","masse","court-circuit","oxydation"],
 "airbag":["inflateur","takata","prétensionneur","ceinture","sécurité"],
 "benne":["hydraulique","vérin","pompe","pdf","prise de force"],
 "rappel":["campagne","recall","safety gate","nhtsa","vin"],
 "tsb":["bulletin","technique","service","note technique","campagne"],
 "pneu":["tpms","pression","usure","géométrie","dot"],
 "clim":["climatisation","compresseur","évaporateur","froid","gaz"],
 "démarrage":["préchauffage","bougies","démarreur","batterie","froid"]
};
function expandQuery(q){
  q=String(q).toLowerCase().trim();
  const set=new Set([q]);
  q.split(/\s+/).forEach(w=>{ if(w.length>2){ set.add(w); (SEARCH_SYNONYMS[w]||[]).forEach(s=>set.add(s)); }});
  Object.keys(SEARCH_SYNONYMS).forEach(k=>{ if(q.includes(k)) (SEARCH_SYNONYMS[k]||[]).forEach(s=>set.add(s)); });
  return Array.from(set).filter(Boolean);
}
function hayMatches(hay,terms){ hay=String(hay).toLowerCase(); return terms.some(t=>hay.includes(t)); }

/* ── Générateur de fiches dérivées ── */
function enrichKeyFor(bid,mi,moi,axis){ return "der_"+bid+"_"+mi+"_"+moi+"_"+axis; }

function familyHint(motorName){
  const n=String(motorName).toLowerCase();
  const hits=[];
  for(const [tok,fuel] of Object.entries(EG_TOKEN_FUEL)) if(n.includes(tok.toLowerCase())) hits.push(tok.toUpperCase());
  return hits.slice(0,2).join(" / ");
}

function buildDerivedBatch(level,models,motors,brands,existingKeys,quota){
  const out={};
  const modelEntries=Object.entries(models);
  const axisCount=ENRICH_AXES.length;
  /* palier : rotation des axes + décalage modèles => nouveautés à chaque MAJ */
  const axisOffset=(level*7)%axisCount;
  const modelOffset=(level*13)%Math.max(1,modelEntries.length);
  let produced=0;
  for(let s=0;s<modelEntries.length && produced<quota;s++){
    const [mid,m]=modelEntries[(s+modelOffset)%modelEntries.length];
    const list=motors[mid];
    if(!Array.isArray(list)||!list.length) continue;
    const bName=(brands[m.brandId]&&brands[m.brandId].name)||m.brandId;
    for(let moi=0;moi<list.length && produced<quota;moi++){
      const mo=list[moi];
      const fuel=mo.fuel||guessFuel(mo.name);
      for(let a=0;a<axisCount && produced<quota;a++){
        const axis=ENRICH_AXES[(a+axisOffset)%axisCount];
        if(axis.f.indexOf(fuel)===-1) continue;
        const key=enrichKeyFor(m.brandId,mid,moi,axis.k);
        if(existingKeys[key]) continue;
        const fam=familyHint(mo.name);
        out[key]={
          brandId:m.brandId,
          model:m.name,
          motor:mo.name,
          type:axis.t,
          title:axis.t+" — "+bName+" "+m.name+" "+mo.name+(mo.power?" ("+mo.power+")":""),
          symptom:axis.s,
          diagnosis:axis.p+(fam?"  ▸ Motorisation identifiée : "+fam+".":"")+"  ▸ Énergie : "+(FUELS[fuel]||fuel)+". Adapter les cotes et couples au carnet constructeur du VIN.",
          parts:axis.o,
          dtc:axis.d,
          source:"Protocole dérivé KEV FUSION — à confirmer par source officielle",
          years:m.years||"2017-2027",
          derived:true, axis:axis.k, level:level,
          keywords:(axis.kw||[]).join(", ")
        };
        existingKeys[key]=1;
        produced++;
      }
    }
  }
  return out;
}

async function writeBatched(path,obj,size,log){
  const keys=Object.keys(obj);
  let done=0;
  for(let i=0;i<keys.length;i+=size){
    const chunk={};
    keys.slice(i,i+size).forEach(k=>chunk[k]=obj[k]);
    try{ await db.ref(path).update(chunk); }catch(e){ if(log)log("⚠️ lot "+i+" : "+e.message); }
    done+=Object.keys(chunk).length;
    if(log)log("Fiches dérivées écrites : "+done+" / "+keys.length);
  }
  return done;
}

/* ── Auto-enrichissement (ADMIN, MAJ manuelle uniquement) ── */
async function autoEnrich(quota,log){
  const L=log||(()=>{});
  const level=parseInt(localStorage.getItem("autodiag_enrich_level")||"0",10)+1;
  L("── Auto-enrichissement · palier "+level+" ──");
  const brands=await dbGet("data/brands");
  const models=await dbGet("data/models");
  const motors=await dbGet("data/motors");
  const expert=await dbGet("data/expert");
  const existingKeys={};
  Object.keys(expert).forEach(k=>existingKeys[k]=1);
  const motorTotal=Object.values(motors).reduce((a,l)=>a+(Array.isArray(l)?l.length:0),0);
  L("Base lue : "+Object.keys(models).length+" modèles · "+motorTotal+" motorisations · "+Object.keys(expert).length+" fiches");
  const batch=buildDerivedBatch(level,models,motors,brands,existingKeys,quota);
  const n=Object.keys(batch).length;
  if(!n){ L("Aucune nouvelle fiche sur ce palier — augmentez le quota ou relancez."); return 0; }
  L("Génération : "+n+" fiches dérivées (axes techniques × motorisations)");
  const written=await writeBatched("data/expert",batch,150,L);
  localStorage.setItem("autodiag_enrich_level",String(level));
  localStorage.setItem("autodiag_enrich_total",String(parseInt(localStorage.getItem("autodiag_enrich_total")||"0",10)+written));
  L("✅ Palier "+level+" terminé : "+written+" fiches ajoutées · total dérivé cumulé : "+localStorage.getItem("autodiag_enrich_total"));
  L("⚠️ Fiches dérivées = protocoles d'analyse technique. Les campagnes officielles restent issues de Rappel Conso / Safety Gate / NHTSA / constructeur.");
  return written;
}

function enrichStats(){
  return {
    level:parseInt(localStorage.getItem("autodiag_enrich_level")||"0",10),
    total:parseInt(localStorage.getItem("autodiag_enrich_total")||"0",10),
    axes:ENRICH_AXES.length,
    synonyms:Object.keys(SEARCH_SYNONYMS).length
  };
}
