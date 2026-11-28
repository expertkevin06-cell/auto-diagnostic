/* ============================================================
   KEV FUSION 2026 — ENRICH v23
   52 axes techniques · paliers jusqu'à 20 000 fiches
   Corrélation réelle modèle + motorisation + puissance
   ============================================================ */
const ENRICH_AXES=[
{k:"lubrication",t:"Lubrification / pression d'huile",f:["essence","diesel","hybride"],s:"Voyant pression huile, claquement à chaud, consommation, émulsion",p:"1) Pression huile à chaud ralenti + 3000 tr/min vs spec 2) Niveau, dilution carburant, émulsion 3) Crépine et carter (débris courroie) 4) Test capteur pression 5) Analyse huile (limailles/LDR/carburant)",o:"Pompe à huile, crépine, capteur pression, joints queue de soupape, PCV",d:"P0521, P0522, P0087",w:["huile","pression","limaille","consommation","crépine"]},
{k:"cooling",t:"Refroidissement / fuite LDR",f:["essence","diesel","hybride"],s:"Baisse niveau, surchauffe, odeur sucrée, traces blanches, chauffage faible",p:"1) Mise sous pression 1,2 bar 2) Trou de purge pompe à eau 3) Thermostat P0128 4) Radiateur, ventilateur, déclenchement 5) Test CO2 vase (joint culasse) 6) Point congélation réfractomètre",o:"Pompe à eau, thermostat, radiateur, ventilateur, durites, vase, joint culasse",d:"P0217, P0128, P0116",w:["ldr","surchauffe","thermostat","radiateur","culasse","fuite"]},
{k:"timing",t:"Distribution chaîne / courroie",f:["essence","diesel","hybride"],s:"Claquement à froid, décalage calage, ratés, bruit métallique",p:"1) Scope synchro vilo/AAC 2) Décalage vs tolérance 3) Tensionneur et guides 4) Courroie humide : gabarit + carter 5) Kit complet + pompe à eau + joints spi",o:"Chaîne/courroie, tensionneur, guides, pignons, pompe à eau, joints spi",d:"P0016, P0017, P0335, P0340",w:["distribution","chaîne","courroie","tendeur","calage","gabarit"]},
{k:"accessory_belt",t:"Courroie accessoire / poulie damper",f:["essence","diesel","hybride"],s:"Sifflement à froid, couinement, vibration moteur, charge batterie faible",p:"1) Inspection fissures/effilochage 2) Tension et alignement galets 3) Jeu poulie damper (caoutchouc décollé) 4) Test roulement tensionneur 5) Kit courroie + galets + damper",o:"Courroie accessoire, galets, tensionneur, poulie damper, poulie alternateur",d:"",w:["courroie accessoire","damper","galet","sifflement","couinement"]},
{k:"boost",t:"Suralimentation / turbo",f:["essence","diesel","hybride"],s:"Perte puissance, sifflement, fumée, mode dégradé, à-coups en charge",p:"1) Étanchéité admission/échappement fumigène 2) Pression mesurée vs cartographie 3) Jeu axial/radial arbre 4) Course actuateur GAV/wastegate 5) Intercooler et durites",o:"Turbo, actuateur GAV, wastegate, durites, intercooler, capteur pression",d:"P0299, P0234, P0236, P2563",w:["turbo","suralimentation","gav","wastegate","intercooler"]},
{k:"ignition",t:"Allumage essence",f:["essence","hybride"],s:"Ratés, à-coups, voyant clignotant, démarrage difficile, surconsommation",p:"1) Compteurs ratés par cylindre 2) Permutation bobines/bougies 3) Écartement + couple (culasse alu) 4) Compressions 5) Alimentation et masses bobines",o:"Bobines, bougies, faisceau allumage, capteur PMH",d:"P0300, P0301, P0302, P0303, P0304",w:["allumage","bougies","bobines","ratés"]},
{k:"di_injection",t:"Injection directe essence / calamine",f:["essence","hybride"],s:"Ralenti instable, cliquetis, perte puissance progressive, dépôts admission",p:"1) Endoscopie soupapes admission 2) Dépôts > 2 mm = décalaminage 3) Pression rail HP vs consigne 4) Débits injecteurs 5) MAJ cartographie 6) Capteur cliquetis",o:"Injecteurs HP, pompe HP, rail, soupapes admission, capteur cliquetis",d:"P0087, P0172, P0325, P0300",w:["calamine","injection directe","cliquetis","gdi","endoscopie"]},
{k:"diesel_injection",t:"Injection diesel / pompe HP",f:["diesel"],s:"Claquement, fumée noire/blanche, ratés, démarrage difficile",p:"1) Débits retour à chaud 2) Pression rail ralenti/charge 3) Banc injecteurs 4) Codage injecteurs neufs 5) Filtre carburant + purge eau 6) Came pompe HP",o:"Injecteurs, pompe HP, rail, régulateur, filtre carburant, joints cuivre",d:"P0087, P0088, P0201, P0263",w:["injecteur","pompe hp","rail","gazole","débit retour"]},
{k:"egr",t:"EGR / refroidisseur EGR",f:["diesel","essence"],s:"Perte puissance, voyant, ralenti instable, fumée, fuite LDR",p:"1) Ouverture consigne vs réel valise 2) ΔP et encrassement 3) Mise sous pression refroidisseur (fuite = risque incendie) 4) Nettoyage/remplacement 5) Adaptation",o:"Vanne EGR, refroidisseur, collecteur, capteur position",d:"P0401, P0402, P0490",w:["egr","refroidisseur","encrassement"]},
{k:"dpf",t:"FAP / GPF colmatage",f:["diesel","essence"],s:"Régénérations fréquentes, mode dégradé, voyant filtre",p:"1) ΔP et taux cendres 2) Historique régénérations/trajets 3) Régénération forcée 4) Endoscopie substrat 5) Remplacement si irréversible 6) Additif Eolys",o:"FAP/GPF, capteur ΔP, sonde température, additif, catalyseur amont",d:"P2002, P2463, P242F, P2452",w:["fap","gpf","particules","régénération","cendres"]},
{k:"scr",t:"SCR / AdBlue / NOx",f:["diesel"],s:"Countdown non-démarrage, voyant AdBlue, limitation",p:"1) P20EE/P204F/P2201 2) Débit pompe valise 3) Cristallisation injecteur + ligne chauffée 4) Qualité ISO 22241 (32,5 %) 5) NOx amont/aval 6) Réinit compteurs",o:"Pompe AdBlue, injecteur, réservoir, ligne chauffée, capteurs NOx",d:"P20EE, P204F, P207F, P2201, P229F",w:["adblue","scr","nox","countdown","cristallisation"]},
{k:"catalyst",t:"Catalyseur / sondes lambda",f:["essence","hybride"],s:"Voyant, odeur soufre, contre-pression, surconsommation",p:"1) P0420/P0430 2) Tension sonde amont oscillante / aval stable 3) Contre-pression échappement 4) Étanchéité ligne 5) Remplacement si rendement hors seuil",o:"Catalyseur, sondes amont/aval, ligne échappement",d:"P0420, P0430, P0135, P0141",w:["catalyseur","lambda","sonde","échappement"]},
{k:"sensors",t:"Capteurs PMH / AAC / température",f:["essence","diesel","hybride"],s:"Calage, non-démarrage, mode dégradé, valeurs incohérentes",p:"1) Scope signal PMH/AAC (amplitude, dent manquante) 2) Résistance et entrefer capteur 3) Comparaison température LDR/air au démarrage à froid 4) Faisceau et blindage 5) Remplacement + réapprentissage",o:"Capteur PMH, capteur AAC, sonde LDR, capteur IAT, faisceau blindé",d:"P0335, P0340, P0116, P0113",w:["pmh","aac","capteur","sonde","température"]},
{k:"glow",t:"Préchauffage diesel",f:["diesel"],s:"Démarrage long à froid, fumée blanche, calage après lancement",p:"1) Résistance individuelle bougies (0,5–2 Ω) 2) Test relais/module et alimentation 3) Courant par bougie à la pince 4) Bougies déposées : aspect 5) Remplacement jeu complet",o:"Bougies préchauffage, relais/module, faisceau, capteur température",d:"P0380, P0671, P0672, P0673",w:["préchauffage","bougies","froid","relais"]},
{k:"gearbox_auto",t:"Boîte auto / DCT / CVT",f:["essence","diesel","hybride"],s:"À-coups, broutage, patinage, boîte chaude, rapports non engagés",p:"1) Adaptations K1/K2 ou convertisseur 2) Niveau/état/température huile 3) TSB + MAJ TCU 4) Solénoïdes mécatronique 5) Apprentissage route 6) Vidange usage sévère",o:"Mécatronique, embrayages, convertisseur, huile, solénoïdes, TCU",d:"P0700, P17BF, P0730, P0218",w:["boîte","dct","dsg","cvt","mécatronique","broutage"]},
{k:"gearbox_manual",t:"Boîte manuelle / tringlerie",f:["essence","diesel"],s:"Craquement, vitesse qui saute, dureté, fuite huile",p:"1) Niveau et fuite huile boîte 2) Jeu tringlerie/câbles et réglage 3) Synchros (craquement à froid) 4) Supports boîte 5) Butée et guide",o:"Synchros, tringlerie, câbles, supports, joints spi, huile boîte",d:"",w:["boîte manuelle","tringlerie","synchro","craquement"]},
{k:"clutch",t:"Embrayage / volant bi-masse",f:["essence","diesel"],s:"Vibrations démarrage, patinage, point haut, bruit débrayage",p:"1) Essai en charge (patinage) 2) Jeu volant bi-masse 3) Butée et fourchette 4) Fuite huile sur disque (joint spi) 5) Kit + volant si hors tolérance",o:"Disque, mécanisme, butée, volant bi-masse, joint spi, récepteur",d:"",w:["embrayage","volant","butée","patinage"]},
{k:"driveshaft",t:"Cardans / transmission / soufflets",f:["essence","diesel","hybride","electrique"],s:"Claquement en braquage, vibration accélération, graisse projetée",p:"1) Inspection soufflets (fissures, graisse) 2) Jeu tulipe et noix 3) Test en braquage accéléré 4) Arbre intermédiaire et palier 5) Remplacement cardan + soufflet",o:"Cardans, soufflets, tulipes, noix, palier intermédiaire, écrou moyeu",d:"",w:["cardan","soufflet","transmission","vibration","claquement"]},
{k:"wheel_bearing",t:"Roulements de roue / moyeux",f:["essence","diesel","hybride","electrique"],s:"Ronronnement croissant avec vitesse, bruit en appui virage",p:"1) Écoute au stéthoscope moyeu 2) Jeu à la main roue levée 3) Test en appui gauche/droite 4) Capteur ABS intégré (signal) 5) Remplacement moyeu + couple écrou",o:"Roulement, moyeu, écrou, capteur ABS intégré, bague magnétique",d:"C0035, C0040",w:["roulement","moyeu","ronronnement","roue"]},
{k:"steering",t:"Direction assistée",f:["essence","diesel","hybride","electrique"],s:"À-coups volant, dureté intermittente, voyant, bruit colonne",p:"1) Codes EPS 2) Alimentation/masses (chute tension) 3) Capteur couple et angle 4) MAJ logiciel EPS 5) Crémaillère/colonne + rotules",o:"Colonne EPS, moteur assistance, capteur couple/angle, crémaillère, rotules",d:"C1511, C1513, U0126",w:["direction","eps","volant","crémaillère"]},
{k:"brake_hydraulic",t:"Freinage hydraulique",f:["essence","diesel","hybride","electrique"],s:"Pédale molle/dure, vibrations, distance allongée, tirage",p:"1) Épaisseur garnitures (mini 3 mm) et disques (cote gravée) 2) Voile < 0,05 mm 3) Humidité liquide > 3 % = remplacement 4) Flexibles et grippage étriers 5) Purge + essai",o:"Plaquettes, disques, étriers, flexibles, maître-cylindre, DOT4",d:"C1365, C0035",w:["frein","plaquette","disque","étrier","liquide"]},
{k:"brake_regen",t:"Freinage régénératif / servofrein",f:["hybride","electrique"],s:"À-coups décélération, pédale dure, transition brutale, AR grippés",p:"1) MAJ logiciel régénératif 2) Calibration capteur pédale 3) Test assistance servofrein 4) Démontage/graissage étriers AR 5) Corrosion disques",o:"Servofrein électrique, capteur pédale, logiciel, étriers AR, disques",d:"C1365, P0A7F",w:["régénératif","servofrein","pédale","grippage"]},
{k:"abs_esp",t:"ABS / ESP / capteurs de roue",f:["essence","diesel","hybride","electrique"],s:"Voyant ABS/ESP, freinage dégradé, activation intempestive",p:"1) Codes calculateurs ABS 2) Signal et entrefer capteurs de roue 3) Bague magnétique/cible (corrosion) 4) Faisceau sous caisse 5) Test bloc hydraulique et alimentation",o:"Calculateur ABS, capteurs roue, bagues magnétiques, bloc hydraulique, faisceau",d:"C0035, C0040, C0045, U0121",w:["abs","esp","capteur roue","antipatinage"]},
{k:"parking_brake",t:"Frein de stationnement",f:["essence","diesel","hybride","electrique"],s:"Ne serre pas, ne desserre pas, voyant, bruit moteur étrier",p:"1) Codes EPB 2) Test moteurs d'étrier et alimentation 3) Mode maintenance pour plaquettes 4) Câbles : grippage/réglage 5) Recalibration après intervention",o:"Moteurs étrier EPB, calculateur, câbles, leviers, interrupteur",d:"C1000, C0561",w:["frein parking","epb","étrier","câble"]},
{k:"engine_mounts",t:"Supports moteur / silentblocs",f:["essence","diesel","hybride"],s:"Vibrations habitacle, claquement au démarrage/arrêt, à-coups",p:"1) Inspection supports (caoutchouc décollé, hydraulique vidé) 2) Test en charge freinée (mouvement moteur) 3) Biellette de reprise de couple 4) Alignement échappement 5) Remplacement + couples",o:"Supports moteur, support boîte, biellette couple, silentblocs hydrauliques",d:"",w:["support moteur","silentbloc","vibration","claquement"]},
{k:"suspension_air",t:"Suspension pneumatique / pilotée",f:["essence","diesel","hybride","electrique"],s:"Affaissement, défaut hauteur, message suspension",p:"1) Étanchéité coussins/durites (savon) 2) Débit et temps montée compresseur 3) Capteurs hauteur 4) Bloc valves et dessiccateur 5) Coussins par essieu 6) Géométrie",o:"Coussins, compresseur, bloc valves, capteurs hauteur, dessiccateur",d:"C1511, C1525",w:["suspension","pneumatique","coussin","compresseur","hauteur"]},
{k:"suspension_mech",t:"Amortisseurs / ressorts / liaisons",f:["essence","diesel","hybride","electrique"],s:"Claquements bosses, tenue dégradée, usure asymétrique, véhicule penché",p:"1) Rebond et fuite amortisseur 2) Ressorts : fissures, corrosion, diamètre fil 3) Rotules/biellettes/silentblocs 4) Butées et coupelles 5) Géométrie + essai",o:"Amortisseurs, ressorts, coupelles, butées, rotules, biellettes, silentblocs",d:"",w:["amortisseur","ressort","rotule","silentbloc","claquement"]},
{k:"tyres_tpms",t:"Pneus / TPMS / géométrie",f:["essence","diesel","hybride","electrique"],s:"Usure irrégulière, voyant pression, tirage, vibrations",p:"1) Sculpture 1,6 mm légal / 3 mm conseillé, DOT < 6 ans 2) Pression à froid étiquette 3) Équilibrage et faux-rond 4) Apprentissage TPMS 5) Géométrie",o:"Pneus, jantes, capteurs TPMS, géométrie, roulements",d:"C0700",w:["pneu","tpms","pression","géométrie","équilibrage"]},
{k:"alternator_starter",t:"Alternateur / démarreur",f:["essence","diesel","hybride"],s:"Voyant batterie, non-démarrage, cliquetis, bruit roulement",p:"1) Tension charge 13,8–14,6 V en charge 2) Test chute de tension câbles 3) Poulie roue libre alternateur 4) Consommation démarreur à la pince 5) Solénoïde et lanceur",o:"Alternateur, régulateur, poulie roue libre, démarreur, solénoïde, câbles",d:"P0562, P0620",w:["alternateur","démarreur","charge","batterie"]},
{k:"battery12",t:"Batterie 12V / réseau de bord",f:["essence","diesel","hybride","electrique"],s:"Non-démarrage, reboots, voyants multiples, décharge stationnement",p:"1) SOH et tension à froid < 12,4 V 2) Courant repos < 30 mA 3) Alternateur ou DC-DC en charge 4) Codage BMS 5) MAJ gestion veille",o:"Batterie AGM/EFB, alternateur, DC-DC, capteur IBS, calculateurs veille",d:"P0562, U0111, B1000",w:["12v","batterie","décharge","alternateur","dc-dc","ibs"]},
{k:"battery48",t:"Réseau 48V / mild-hybrid",f:["hybride","diesel","essence"],s:"Stop&start HS, non-démarrage, à-coups redémarrage",p:"1) Codes 48V 2) SOH batterie lithium 48V 3) Alterno-démarreur/BSG 4) Courroie renforcée et galets 5) Convertisseur 48/12V 6) Campagnes",o:"Batterie 48V, BSG, convertisseur 48/12V, courroie renforcée",d:"P0562, P0A7F",w:["48v","mhev","bsg","alterno-démarreur","mild"]},
{k:"hv_soh",t:"Batterie HV SOH / équilibrage",f:["hybride","electrique"],s:"Autonomie réduite, charge plafonnée, limitation puissance",p:"1) SOH pack + delta cellules > 60 mV 2) Thermographie modules 3) Charge lente complète équilibrage 4) MAJ BMS 5) Rapport archivé (seuil 70 %) 6) Module si persistant",o:"Modules HV, BMS, capteurs température, contacteurs, busbar",d:"P0AA6, U0111, P0A7F, P0A80",w:["soh","batterie hv","delta","cellule","équilibrage","autonomie"]},
{k:"hv_isolation",t:"Isolement HV / sécurité",f:["hybride","electrique"],s:"Alerte isolement, coupure sécurité, refus de charge",p:"1) Consignation HV (habilitation) 2) Mégohmmètre > 1 MΩ 3) Sectionnement par branche 4) Câblage orange et connecteurs 5) Remplacement composant fautif",o:"Câblage HV, compresseur électrique, chauffage PTC, onduleur, pack",d:"P0AA6, P0AB0",w:["isolement","hv","mégohmmètre","sécurité","consignation"]},
{k:"charging",t:"Charge AC/DC OBC ICCU",f:["electrique","hybride"],s:"Charge absente/interrompue, lente, connecteur chaud, verrou bloqué",p:"1) Multi-bornes AC puis DC 2) Codes OBC/ICCU 3) Résistances CP/PP + câble mode 2 4) Thermographie broches 5) DC-DC et 12V 6) MAJ charge",o:"OBC, ICCU, DC-DC, connecteur Type2/CCS, verrou, câble mode 2",d:"P0D11, U0111, P0AA6",w:["charge","obc","iccu","connecteur","ccs","type2","verrou"]},
{k:"emotor",t:"Moteur électrique / onduleur / réducteur",f:["electrique","hybride"],s:"Sifflement, vibration accélération, perte puissance, ronflement",p:"1) Analyse vibratoire + logs onduleur 2) Boucle LDR onduleur et pompe 3) Isolement enroulements 4) Jeu et huile réducteur 5) Roulements et capteur rotor",o:"Onduleur, moteur électrique, roulements, réducteur, capteur rotor, pompe LDR",d:"P0AA6, P0A93, P0C00",w:["onduleur","moteur électrique","réducteur","roulement","sifflement"]},
{k:"hybrid_bridge",t:"Hybridation : bascule / e-CVT",f:["hybride"],s:"À-coups transition thermique/élec, voyant hybride, patinage",p:"1) Codes hybridation 2) Embrayage de découplage 3) Train épicycloïdal / e-CVT huile 4) MAJ gestion bascule 5) Supports moteur et calibration",o:"Embrayage hybridation, e-CVT, onduleur, calculateur hybride, supports",d:"P0A7F, P0A93, P0700",w:["hybridation","bascule","e-cvt","épicycloïdal","transition"]},
{k:"hvac_thermal",t:"Climatisation thermique",f:["essence","diesel","hybride"],s:"Froid insuffisant, odeurs, bruit compresseur, embuage",p:"1) Pressions HP/BP + température grille 2) Fuite azote/UV 3) Compresseur et embrayage 4) Détendeur et déshydratant 5) Désinfection évaporateur 6) Recharge masse prescrite",o:"Compresseur, condenseur, détendeur, évaporateur, déshydratant, ventilateur",d:"",w:["clim","climatisation","compresseur","froid","évaporateur"]},
{k:"hvac_ev",t:"Pompe à chaleur / thermique EV",f:["electrique","hybride"],s:"Chauffage faible, autonomie hiver effondrée, charge lente à froid",p:"1) Codes thermiques 2) Octovalve/vannes commutation 3) Circuit frigo et gaz 4) Résistance préchauffage HV 5) Boucle LDR batterie + pompe 6) MAJ thermique",o:"Pompe à chaleur, octovalve, vannes, résistance HV, pompe LDR, échangeur",d:"P0C00, P0AA6",w:["pompe à chaleur","octovalve","chauffage","hiver","préconditionnement"]},
{k:"comfort",t:"Confort : sièges, ventilation, dégivrage",f:["essence","diesel","hybride","electrique"],s:"Siège chauffant HS, ventilation faible, dégivrage inefficace",p:"1) Résistance nappes chauffantes et alimentation 2) Moteurs volets mixage et pulseur 3) Résistance/ módulo pulseur 4) Filtre habitacle colmaté 5) Sondes habitacle et calibration",o:"Nappes chauffantes, pulseur, moteurs volets, résistance pulseur, filtre habitacle",d:"B1000",w:["siège chauffant","ventilation","pulseur","dégivrage","confort"]},
{k:"lighting",t:"Éclairage / signalisation",f:["essence","diesel","hybride","electrique"],s:"Voyant ampoule, portée faible, condensation, clignotement rapide",p:"1) Alimentation et masses feux 2) Réglage régloscope 3) Étanchéité/condensation 4) Modules LED et calculateurs 5) MAJ feux matriciels",o:"Optiques, modules LED, calculateurs éclairage, faisceau, capteurs assiette",d:"B1000, U0140",w:["éclairage","phare","led","optique","feu"]},
{k:"glazing_wipers",t:"Vitres / essuie-glace / ouvrants",f:["essence","diesel","hybride","electrique"],s:"Vitre qui force, essuie-glace lent, toit ouvrant bloqué, lave-glace HS",p:"1) Mécanisme lève-vitre et graissage coulisses 2) Moteur essuie-glace et tringlerie 3) Pompe lave-glace et gicleurs 4) Toit ouvrant : câbles, drains, initialisation 5) Anti-pincement",o:"Lève-vitre, moteur essuie-glace, tringlerie, pompe lave-glace, toit ouvrant, drains",d:"B1000",w:["vitre","essuie-glace","toit ouvrant","lave-glace","anti-pincement"]},
{k:"locks_access",t:"Fermeture / centralisation / alarme",f:["essence","diesel","hybride","electrique"],s:"Porte non verrouillée, alarme intempestive, clé non détectée",p:"1) Serrures et actionneurs (résistance) 2) Contacteurs de porte et hayon 3) Antenne keyless et pile télécommande 4) Sirène alarme et batterie tampon 5) Apprentissage clés",o:"Serrures, actionneurs, contacteurs, antenne keyless, sirène, télécommande",d:"B1000, U0140",w:["serrure","centralisation","alarme","keyless","clé"]},
{k:"body_utility",t:"Carrosserie / portes utilitaires",f:["essence","diesel","hybride","electrique"],s:"Porte coulissante qui force, hayon inopérant, infiltrations",p:"1) Rail + galets nettoyage/graissage 2) Gâche et serrure 3) Moteurs hayon et capteurs 4) Infiltrations joints/passe-cloisons 5) Fixations carrosserie châssis",o:"Rail, galets, serrure, gâche, moteurs hayon, joints, fixations",d:"",w:["porte","hayon","rail","serrure","infiltration","carrosserie"]},
{k:"water_ingress",t:"Infiltrations d'eau",f:["essence","diesel","hybride","electrique"],s:"Habitacle humide, odeur, buée persistante, électronique aléatoire",p:"1) Test arrosage ciblé (pare-brise, joints, feux, passe-cloisons) 2) Drains toit ouvrant et auvent 3) Membrane de porte 4) Coffre et passage de roue 5) Séchage + traitement connecteurs",o:"Joints, drains, membranes porte, passe-cloisons, feux, moquette",d:"",w:["infiltration","eau","humidité","buée","drain"]},
{k:"corrosion_structure",t:"Corrosion / soubassement",f:["essence","diesel","hybride","electrique"],s:"Corrosion perforante, berceau fragilisé, points de levage",p:"1) Inspection soubassement sur pont 2) Berceau, longerons, bas de caisse 3) Points de levage et fixations 4) Durites frein et échappement 5) Traitement anticorrosion + réparation structurelle",o:"Berceau, longerons, bas de caisse, points levage, durites, échappement",d:"",w:["corrosion","rouille","berceau","soubassement","perforante"]},
{k:"exhaust",t:"Échappement / supports",f:["essence","diesel","hybride"],s:"Bruit anormal, odeur habitacle, cliquetis thermique, fuite",p:"1) Ligne complète fuites/corrosion 2) Silentblocs et supports 3) Étanchéité avant catalyseur 4) Sertissages et colliers 5) Remplacement par tronçon",o:"Ligne échappement, silentblocs, colliers, flexible, catalyseur, FAP",d:"P0420, P2002",w:["échappement","corrosion","silentbloc","fuite","bruit"]},
{k:"infotainment",t:"Multimédia / connectivité",f:["essence","diesel","hybride","electrique"],s:"Écran noir, Bluetooth instable, navigation figée, USB HS",p:"1) Versions logicielles head unit 2) Logs reboot/watchdog 3) Alimentation stable et masses 4) Antennes GPS/GSM et connectique 5) MAJ ou remplacement unité",o:"Head unit, écran, antennes GPS/GSM, USB, Bluetooth, faisceau",d:"U0101, U0140",w:["multimédia","écran","bluetooth","navigation","usb","gps"]},
{k:"adas",t:"ADAS caméras / radar",f:["essence","diesel","hybride","electrique"],s:"Freinage fantôme, désengagement assistance, voyant ADAS",p:"1) Codes et logs désengagement 2) Propreté optiques/support pare-brise 3) Calibration statique puis dynamique 4) Géométrie, hauteur, dimensions pneus 5) Firmware vs patch sécurité",o:"Caméra frontale, radar, calculateurs ADAS, ultrasons, pare-brise, support",d:"U0121, U0101, U0235",w:["adas","radar","caméra","calibration","acc","freinage fantôme"]},
{k:"network",t:"Calculateurs / réseaux multiplexés",f:["essence","diesel","hybride","electrique"],s:"Défauts multiples intermittents, écrans figés, perte communication",p:"1) U-codes sur tous calculateurs 2) Taux erreurs trames CAN/LIN 3) Masses, alimentations, terminaisons 120 Ω 4) Connecteurs oxydation 5) MAJ gateway",o:"Gateway, faisceau CAN/LIN, connecteurs, masses, calculateurs, terminaisons",d:"U0101, U0121, U0140, U1000",w:["can","réseau","gateway","u0101","multiplexé","écran"]},
{k:"harness",t:"Faisceau / connecteurs / corrosion",f:["essence","diesel","hybride","electrique"],s:"Défauts intermittents par humidité, courts-circuits, voyants aléatoires",p:"1) Zones de frottement et passe-cloisons 2) Continuité et chute tension sous charge 3) Oxydation connecteurs bas de caisse/hayon 4) Graisse diélectrique + masses 5) Soudure + gaine thermo",o:"Faisceau, connecteurs, masses, passe-cloisons, gaines, soudures",d:"U1000, B1000",w:["faisceau","connecteur","corrosion","masse","court-circuit"]},
{k:"software_ota",t:"Logiciel / OTA",f:["essence","diesel","hybride","electrique"],s:"Perte fonctions après MAJ, écran noir, reboot en boucle",p:"1) Versions de tous calculateurs 2) Logs OTA/watchdog 3) Re-flash calculateur 4) Alimentation stable sous chargeur pendant MAJ 5) Campagnes applicables VIN",o:"Calculateurs, gateway, eMMC, alimentation, head unit",d:"U0101, U1000",w:["ota","logiciel","maj","reboot","emmc","flash"]},
{k:"passive_safety",t:"Airbags / ceintures",f:["essence","diesel","hybride","electrique"],s:"Voyant airbag, prétensionneur en défaut, ceinture bloquée",p:"1) Codes calculateur (ne pas effacer avant diagnostic) 2) Résistance circuits via simulateur (jamais ohmmètre direct) 3) VIN campagnes inflateur 4) Ancrages et prétensionneurs 5) Consignation batterie avant intervention",o:"Calculateur airbag, inflateurs, prétensionneurs, capteurs choc, spiral cable",d:"B1000, B0100",w:["airbag","ceinture","prétensionneur","inflateur","takata","sécurité"]},
{k:"upfit",t:"Benne / PdF / frigorifique",f:["diesel","essence","electrique"],s:"Benne ne monte pas, PdF inopérante, groupe froid en défaut",p:"1) Niveau et pression hydraulique, pompe 2) Vérins et flexibles 3) Embrayage PdF + boîte transfert 4) Distributeur et commande 5) Groupe froid compresseur/gaz 6) Alimentations auxiliaires",o:"Pompe hydraulique, vérins, flexibles, PdF, distributeur, compresseur frigo",d:"",w:["benne","pdf","prise de force","hydraulique","frigorifique","vérin"]},
{k:"towing",t:"Attelage / remorquage",f:["essence","diesel","hybride","electrique"],s:"Faisceau attelage HS, surchauffe en charge, usure accélérée",p:"1) Module attelage et faisceau 13 plots 2) Charge maxi et poids tractable 3) Refroidissement renforcé (huile boîte, LDR) 4) Freins et pneus charge 5) Intervalles sévères remorquage",o:"Attelage, module faisceau, refroidissement boîte/LDR, freins, pneus",d:"P0218, P0217",w:["attelage","remorquage","tractable","faisceau","charge"]}
];

const SEARCH_SYNONYMS={
"courroie":["distribution","belt","humide","tendeur","gabarit","accessoire"],
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
"charge":["obc","iccu","connecteur","type2","ccs","verrou","dc-dc","alternateur"],
"frein":["freinage","plaquette","disque","étrier","servofrein","liquide","régénératif","abs"],
"servofrein":["assistance","pédale","freinage","électrique"],
"boîte":["transmission","dct","dsg","cvt","mécatronique","embrayage","à-coups","tringlerie"],
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
"écran":["reboot","head unit","gateway","u0101","logiciel","multimédia"],
"faisceau":["connecteur","corrosion","masse","court-circuit","oxydation"],
"airbag":["inflateur","takata","prétensionneur","ceinture","sécurité"],
"benne":["hydraulique","vérin","pompe","pdf","prise de force"],
"rappel":["campagne","recall","safety gate","nhtsa","vin"],
"tsb":["bulletin","technique","service","note technique","campagne"],
"pneu":["tpms","pression","usure","géométrie","dot"],
"clim":["climatisation","compresseur","évaporateur","froid","gaz"],
"démarrage":["préchauffage","bougies","démarreur","batterie","froid"],
"bruit":["claquement","ronronnement","sifflement","roulement","cardan","support"],
"vibration":["équilibrage","cardan","support moteur","roulement","embrayage"],
"abs":["esp","capteur roue","antipatinage","bloc hydraulique"],
"corrosion":["rouille","berceau","soubassement","perforante","infiltration"],
"attelage":["remorquage","tractable","faisceau","charge"]
};
function expandQuery(q){
  q=String(q).toLowerCase().trim();
  const set=new Set([q]);
  q.split(/\s+/).forEach(w=>{if(w.length>2){set.add(w);(SEARCH_SYNONYMS[w]||[]).forEach(s=>set.add(s));}});
  Object.keys(SEARCH_SYNONYMS).forEach(k=>{if(q.includes(k))(SEARCH_SYNONYMS[k]||[]).forEach(s=>set.add(s));});
  return Array.from(set).filter(Boolean);
}
function hayMatches(h,terms){h=String(h).toLowerCase();return terms.some(t=>h.includes(t));}

/* Priorités par famille moteur : corrélation réelle */
const FAMILY_PRIORITY=[
{m:["puretech","eb2"],a:["timing","lubrication","di_injection","cooling"],r:"Courroie humide EB2 : usure + colmatage crépine/pompe à huile"},
{m:["thp","ep6"],a:["timing","di_injection","lubrication"],r:"EP6 THP : tensionneur de chaîne et calamine admission"},
{m:["h5ft","1.2 tce"],a:["lubrication","timing","cooling"],r:"H5Ft : consommation d'huile et chaîne"},
{m:["hr13","1.3 tce"],a:["di_injection","timing","boost"],r:"HR13DDT : calamine et cliquetis"},
{m:["tsi","tfsi","ea888","ea211"],a:["timing","lubrication","di_injection","boost"],r:"EA888/EA211 : tensionneur chaîne, conso huile, calamine"},
{m:["tdi","ea288","ea189"],a:["scr","egr","dpf","diesel_injection","boost"],r:"EA288 : SCR/NOx, refroidisseur EGR, FAP"},
{m:["dci","k9k","blue dci"],a:["egr","dpf","diesel_injection","timing"],r:"K9K dCi : EGR, FAP urbain, courroie"},
{m:["bluehdi","dv5","dv6"],a:["scr","dpf","egr","diesel_injection"],r:"DV5/DV6 BlueHDi : cristallisation AdBlue, FAP additivé"},
{m:["multijet","jtd"],a:["diesel_injection","dpf","egr"],r:"MultiJet : injecteurs et filtre carburant critiques"},
{m:["crdi","theta"],a:["lubrication","diesel_injection","dpf"],r:"Theta/CRDi : coussinets bielles (KSDS) et injection"},
{m:["skyactiv-d"],a:["dpf","egr","lubrication"],r:"Skyactiv-D : dilution huile par post-injection, calamine"},
{m:["skyactiv-x"],a:["ignition","di_injection"],r:"Skyactiv-X SPCCI : capteur pression cylindre"},
{m:["ecoboost"],a:["timing","cooling","di_injection"],r:"EcoBoost 1.0 : courroie humide pompe à huile + intrusion LDR"},
{m:["e-tech","etech","h4m","e-cvt"],a:["hybrid_bridge","hv_soh","battery12","brake_regen"],r:"E-Tech : boîte à crabots, 12V AGM, bascule"},
{m:["hybrid","hev","e:hev","i-mmd","hsd"],a:["hv_soh","hybrid_bridge","emotor","brake_regen"],r:"Hybride : SOH pack, ventilateur batterie, onduleur"},
{m:["phev","gte","e-hybrid","4xe","recharge"],a:["hv_soh","charging","hv_isolation","hybrid_bridge"],r:"PHEV : double entretien thermique + HV"},
{m:["dm-i","dm-p","dmo","erev","e-power"],a:["lubrication","hv_soh","emotor","charging"],r:"DM-i/EREV : vidange annuelle malgré usage électrique"},
{m:["electric","electrique","ev","e-tron","id.","folgore","blade"],a:["hv_soh","hv_isolation","charging","emotor","hvac_ev","battery12"],r:"EV : SOH, isolement, charge, thermique batterie"},
{m:["iccu","obc"],a:["charging","battery12","hv_isolation"],r:"ICCU/OBC : non-charge et décharge 12V"},
{m:["dsg","dct","s tronic","powershift","eat8","edc"],a:["gearbox_auto","clutch"],r:"Double embrayage : adaptations, huile, mécatronique"},
{m:["cvt","xtronic","lineartronic"],a:["gearbox_auto"],r:"CVT : vidange 60 000 km impérative"},
{m:["zf8","9g","tiptronic","geartronic"],a:["gearbox_auto"],r:"Convertisseur : vidange 100 000 km recommandée"},
{m:["airmatic","pasm","hydractive","air suspension"],a:["suspension_air"],r:"Suspension pneumatique : compresseur et coussins"},
{m:["48v","mhev","bsg","mild"],a:["battery48","battery12","accessory_belt"],r:"48V : alterno-démarreur et courroie renforcée"},
{m:["w16","v12","v8"],a:["cooling","lubrication","ignition"],r:"Grosse cylindrée : refroidissement et lubrification critiques"}
];
function familyAxes(motorName){
  const n=String(motorName||"").toLowerCase();
  const keys=new Set(),reasons=[];
  FAMILY_PRIORITY.forEach(f=>{if(f.m.some(t=>n.includes(t))){f.a.forEach(a=>keys.add(a));reasons.push(f.r);}});
  return{keys:Array.from(keys),reasons};
}
function axisByKey(k){return ENRICH_AXES.find(a=>a.k===k);}

/* ── Corrélation réelle : toutes les fiches applicables au véhicule ── */
function buildVehicleFiches(brandId,modelName,motor,years){
  if(!motor)return{list:[],reasons:[],groups:[]};
  const fuel=motor.fuel||guessFuel(motor.name);
  const fam=familyAxes(motor.name);
  const bn=(typeof brandsData!=="undefined"&&brandsData[brandId]&&brandsData[brandId].name)||brandId;
  const mn=String(motor.name).toLowerCase();
  const list=[];
  ENRICH_AXES.forEach(ax=>{
    if(ax.f.indexOf(fuel)===-1)return;
    let score=20;
    const prio=fam.keys.indexOf(ax.k)>=0;
    if(prio)score+=45;
    if(ax.f.length===1)score+=10;
    const kwHit=(ax.w||[]).filter(w=>mn.includes(w)).length;
    score+=kwHit*6;
    list.push({
      brandId,model:modelName,motor:motor.name,type:ax.t,axis:ax.k,
      title:ax.t+" — "+bn+" "+modelName+" "+motor.name+(motor.power?" ("+motor.power+")":""),
      symptom:ax.s,diagnosis:ax.p+"  ▸ Énergie : "+(FUELS[fuel]||fuel)+(prio?"  ▸ Priorité famille motorisation.":"")+"  ▸ Adapter cotes et couples au carnet du VIN.",
      parts:ax.o,dtc:ax.d,years:years||"2017-2027",
      source:"Protocole corrélé KEV FUSION — à confirmer par source officielle",
      derived:true,score,priority:prio,keywords:(ax.w||[]).join(", ")
    });
  });
  list.sort((a,b)=>b.score-a.score);
  const groups={};
  list.forEach(f=>{(groups[f.type]=groups[f.type]||[]).push(f);});
  return{list,reasons:fam.reasons,groups:Object.entries(groups)};
}

/* ── Score d'une fiche existante pour le véhicule ── */
function scoreFiche(e,modelName,motor){
  let sc=0;
  const em=String(e.motor||"").toLowerCase(),mo=motor?String(motor.name).toLowerCase():"";
  const md=String(e.model||"").toLowerCase(),cm=String(modelName||"").toLowerCase();
  if(em&&mo){ if(em===mo)sc+=60; else if(mo.includes(em)||em.includes(mo))sc+=45; else{const f=famFuel(em);if(f&&motor&&f===motor.fuel)sc+=22;} }
  if(md&&cm){ if(md===cm)sc+=35; else if(cm.includes(md)||md.includes(cm))sc+=22; }
  if(!em)sc+=8;
  if(!md)sc+=5;
  if(e.derived)sc-=4;else sc+=12;
  if(motor&&e.axis&&familyAxes(motor.name).keys.indexOf(e.axis)>=0)sc+=25;
  return sc;
}

/* ── Génération par palier ── */
function enrichKeyFor(bid,mi,moi,axis){return "der_"+bid+"_"+mi+"_"+moi+"_"+axis;}
function familyHint(n){
  n=String(n).toLowerCase();const h=[];
  for(const[t]of Object.entries(EG_TOKEN_FUEL))if(n.includes(t.toLowerCase()))h.push(t.toUpperCase());
  return h.slice(0,2).join(" / ");
}
function buildDerivedBatch(level,models,motors,brands,existing,quota,axisFilter){
  const out={},entries=Object.entries(models),n=ENRICH_AXES.length;
  const full=(axisFilter==="all");
  const aOff=full?0:(level*7)%n;
  const mOff=(level*13)%Math.max(1,entries.length);
  let made=0;
  for(let s=0;s<entries.length&&made<quota;s++){
    const[mid,m]=entries[(s+mOff)%entries.length];
    const list=motors[mid];
    if(!Array.isArray(list)||!list.length)continue;
    const bn=(brands[m.brandId]&&brands[m.brandId].name)||m.brandId;
    for(let moi=0;moi<list.length&&made<quota;moi++){
      const mo=list[moi],fuel=mo.fuel||guessFuel(mo.name);
      const fam=familyAxes(mo.name);
      for(let a=0;a<n&&made<quota;a++){
        const ax=ENRICH_AXES[full?a:(a+aOff)%n];
        if(ax.f.indexOf(fuel)===-1)continue;
        if(!full&&axisFilter&&axisFilter!=="auto"&&ax.k!==axisFilter)continue;
        const key=enrichKeyFor(m.brandId,mid,moi,ax.k);
        if(existing[key])continue;
        const famHint=familyHint(mo.name);
        const prio=fam.keys.indexOf(ax.k)>=0;
        out[key]={brandId:m.brandId,model:m.name,motor:mo.name,type:ax.t,axis:ax.k,
          title:ax.t+" — "+bn+" "+m.name+" "+mo.name+(mo.power?" ("+mo.power+")":""),
          symptom:ax.s,
          diagnosis:ax.p+(famHint?"  ▸ Motorisation : "+famHint+".":"")+"  ▸ Énergie : "+(FUELS[fuel]||fuel)+"."+(prio?"  ▸ Priorité famille.":"")+"  ▸ Adapter cotes/couples au carnet du VIN.",
          parts:ax.o,dtc:ax.d,source:"Protocole dérivé KEV FUSION — à confirmer par source officielle",
          years:m.years||"2017-2027",derived:true,level,priority:prio,keywords:(ax.w||[]).join(", ")};
        existing[key]=1;made++;
      }
    }
  }
  return out;
}
async function writeBatched(path,obj,size,log,prog){
  const keys=Object.keys(obj);let done=0;
  for(let i=0;i<keys.length;i+=size){
    const chunk={};keys.slice(i,i+size).forEach(k=>chunk[k]=obj[k]);
    try{await db.ref(path).update(chunk);}catch(e){if(log)log("⚠️ lot "+i+" : "+e.message);}
    done+=Object.keys(chunk).length;
    if(log)log("Fiches écrites : "+fmt(done)+" / "+fmt(keys.length));
    if(prog)prog(done/keys.length);
  }
  return done;
}
async function autoEnrich(quota,log,axisFilter,prog){
  const L=log||(()=>{});
  const level=parseInt(localStorage.getItem("autodiag_enrich_level")||"0",10)+1;
  L("── Auto-enrichissement · palier "+level+" · quota "+fmt(quota)+" ──");
  const brands=await dbGet("data/brands"),models=await dbGet("data/models"),motors=await dbGet("data/motors"),expert=await dbGet("data/expert");
  const existing={};Object.keys(expert).forEach(k=>existing[k]=1);
  const mt=Object.values(motors).reduce((a,l)=>a+(Array.isArray(l)?l.length:0),0);
  L("Base : "+fmt(Object.keys(models).length)+" modèles · "+fmt(mt)+" motorisations · "+fmt(Object.keys(expert).length)+" fiches");
  L("Filtre axes : "+(axisFilter==="all"?"BALAYAGE COMPLET (52 axes)":axisFilter&&axisFilter!=="auto"?axisFilter:"rotation automatique"));
  const batch=buildDerivedBatch(level,models,motors,brands,existing,quota,axisFilter);
  const n=Object.keys(batch).length;
  if(!n){L("Aucune nouvelle fiche sur ce palier/filtre — changez le filtre ou augmentez le quota.");return 0;}
  L("Génération : "+fmt(n)+" fiches corrélées");
  const written=await writeBatched("data/expert",batch,200,L,prog);
  localStorage.setItem("autodiag_enrich_level",String(level));
  localStorage.setItem("autodiag_enrich_total",String(parseInt(localStorage.getItem("autodiag_enrich_total")||"0",10)+written));
  L("✅ Palier "+level+" : "+fmt(written)+" fiches · cumul dérivé : "+fmt(localStorage.getItem("autodiag_enrich_total")));
  L("⚠️ Protocoles d'analyse technique. Les campagnes officielles restent issues de Rappel Conso / Safety Gate / NHTSA / constructeur.");
  return written;
}
function enrichStats(){
  return{level:parseInt(localStorage.getItem("autodiag_enrich_level")||"0",10),
    total:parseInt(localStorage.getItem("autodiag_enrich_total")||"0",10),
    axes:ENRICH_AXES.length,synonyms:Object.keys(SEARCH_SYNONYMS).length,
    families:FAMILY_PRIORITY.length};
}
