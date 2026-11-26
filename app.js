/* ═══ KEV FUSION 2026 — MOTEUR app.js v22 · renfort massif + diffusion tiers ═══ */
(function(){
"use strict";
var K=window.KF||{err:function(){},set:function(){},unlock:function(){},lock:function(){},role:null,errors:[]};
var D=window.KFD;
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function el(t,c,h){var n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n}
function safe(f,n){try{return f()}catch(e){K.err(n+" : "+((e&&e.message)||e));return null}}
if(!D||!D.cat||!D.faults||!D.dom||!D.rules||!D.revs||!D.dtc){
K.set([{ok:false,l:"data.js chargé (window.KFD)",d:"absent ou incomplet",f:true},{ok:true,l:"Noyau d'authentification",d:"mot de passe opérationnel"}]);return;}

var FUEL=D.fuel,SEV=D.sev,KIND=D.kind,DOM=D.dom,TQ=D.tq,DTC=D.dtc;
var DM={},CV={am:"amH",rd:"rd",gr:"gr",bl:"bl",vi:"vi",te:"te",mg:"mg",cy:"cy"};
DOM.forEach(function(d){DM[d[0]]={n:d[1],i:d[2],c:d[3]}});
var KCL={rappel:"kr",campagne:"kc",tsb:"kt",panne:"kp"},SCL={critique:"sc",eleve:"se",moyen:"sm",info:"si"};
var YMIN=2017,YMAX=2027;
var ENG=D.eng.map(function(r){return[new RegExp(r[0]),r[1],r[2],r[3],r[4],r[5]]});
var EVA=D.eva.map(function(r){return[new RegExp(r[0]),r[1],r[2],r[3]]});
function NFD(s){return String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function norm(s){return NFD(s).toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function slug(s){return NFD(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function Y(v){var n=parseInt(v,10);if(isNaN(n))return 2017;return n<100?2000+n:n}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function uniq(a){return a.filter(function(x,i){return a.indexOf(x)===i})}
function nf(n){return Number(n).toLocaleString("fr-FR")}
function kw(h){return Math.round(h/1.35962)}
function csv(s){return String(s||"").split(",").map(function(x){return x.trim()}).filter(Boolean)}
function moT(m){if(!m)return"—";var y=Math.floor(m/12),r=m%12;return(y?y+" ans":"")+(y&&r?" ":"")+(r?r+" mois":"")}
function dtT(t){return new Date(t).toLocaleString("fr-Fr",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}
function hl(t,q){t=String(t==null?"":t);if(!q)return esc(t);
var a=NFD(t).toLowerCase(),b=NFD(q).toLowerCase(),i=a.indexOf(b);
if(i<0||!b)return esc(t);
return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+b.length))+"</mark>"+esc(t.slice(i+b.length))}
function alias(n){var s=norm(n),x=[];
if(s.indexOf("skoda")>=0)x.push("skoda");if(s.indexOf("citroen")>=0)x.push("citroen");
if(s.indexOf("ds automobiles")>=0)x.push("ds");if(s.indexOf("mercedes")>=0)x.push("mercedes benz mb");
if(s.indexOf("land")>=0)x.push("landrover");if(s.indexOf("vauxhall")>=0)x.push("opel");return x.join(" ")}
function tqEst(e,s){if(s.ev||!e.hp)return null;
var d=s.disp||1600,f=e.fuel==="D"?1.9:(/turbo/i.test(s.feed)?1.35:0.95);
return Math.round(e.hp*1.36*f*(d/1600)*0.62/5)*5}
function spec(e){
var code=String(e.code||"").toUpperCase(),ev=e.fuel==="EV";
var b=(String(e.tech||"").match(/([\d]+[,.]?[\d]*)\s*kWh/i)||[])[1];
var kwh=b?parseFloat(String(b).replace(",",".")):null;
if(ev){var a=["Synchrone aimants permanents",400,"Plateforme EV"],i;
for(i=0;i<EVA.length;i++)if(EVA[i][0].test(code)){a=[EVA[i][1],EVA[i][2],EVA[i][3]];break}
var v=(String(e.tech||"").match(/(400|800)\s*V/i)||[])[1];
return{ev:1,kwh:kwh,arch:a[0],volt:v?+v:a[1],plat:a[2],disp:null,cyl:null,
lay:e.hp>350?"Double moteur AWD":"Moteur unique",feed:"Électrique · onduleur triphasé",
dist:"Réducteur rapport fixe",tq:null,tqE:0,exact:1}}
var s=null,j;for(j=0;j<ENG.length;j++)if(ENG[j][0].test(code)){s=ENG[j];break}
var fl=(String(e.fam||"").match(/(\d[.,]\d)/)||[])[1];
var nom=fl?Math.round(parseFloat(fl.replace(",","."))*1000):null;
var disp=s?s[1]:nom,cyl=s?s[2]:(disp?(disp<1300?3:disp<2600?4:disp<3400?6:8):null);
var k1=slug(String(e.code||"").split(/[^A-Za-z0-9-]/)[0])+"|"+e.hp,k2=slug(e.fam)+"|"+e.hp;
var t=TQ[k1]||TQ[k2]||null;
var o={ev:0,kwh:null,disp:disp,exact:!!s,cyl:cyl,lay:s?s[3]:(cyl?cyl+" en ligne":"—"),
feed:s?s[4]:(e.fuel==="D"?"Diesel common rail":"Essence injection"),
dist:s?s[5]:(/chaîne|chaine/i.test(e.tech||"")?"Chaîne":(/courroie/i.test(e.tech||"")?"Courroie":"—")),tq:t,tqE:0};
if(!t){o.tq=tqEst(e,o);o.tqE=1}
return o}
function famL(e){var s=spec(e);
if(s.ev)return s.kwh?"Électrique "+String(s.kwh).replace(".",",")+" kWh":"Électrique";
var L=s.disp?(s.disp/1000).toFixed(1).replace(".",",")+" ":"";
return(L+String(e.fam||"").replace(/^\d[.,]\d\s*/,"").replace(/\s*\d{2,4}\s*ch/i,"").trim()).trim()||e.fam}
function famM(e){var s=spec(e);
return s.ev?((s.kwh?s.kwh+" kWh · ":"")+s.volt+" V · "+s.plat):
((s.disp?s.disp+" cm³":"cyl. n.c.")+(s.cyl?" · "+s.cyl+" cyl.":"")+" · "+FUEL[e.fuel])}
var SEG={C:"Citadine",Y:"Micro-citadine",K:"Compacte",B:"Berline",T:"Break",S:"SUV",U:"SUV urbain",
E:"SUV compact",W:"SUV premium",M:"Monospace",L:"Ludospace",F:"Utilitaire",G:"Grand utilitaire",
V:"Van",P:"Pickup",R:"Roadster",X:"Coupé sport",Q:"Quadricycle",Z:"Berline premium",
H:"Berline électrique",J:"SUV électrique",N:"SUV coupé"};
function mkEng(b,m,fam,hps,code,fu,y0,y1,tech){
var out=[];String(hps).split(",").filter(Boolean).forEach(function(h,i){
var q=h.split(":"),hp=parseInt(q[0],10)||0,kwh=q[1];
var t=(tech||"")+(kwh?((tech?" · ":"")+kwh+" kWh"):"");
var o={key:b.id+"/"+m.id+"/"+slug(fam)+"/"+hp+"/"+i,fam:fam,famKey:slug(fam),hp:hp,code:code||"—",
fuel:FUEL[fu]?fu:"E",y0:y0,y1:y1,tech:t,brand:b.id,brandName:b.name,model:m.id,modelName:m.name,
seg:m.seg,my0:m.y0,my1:m.y1};
var sp=spec(o);o.gk=o.famKey+(sp.ev?"|"+(sp.kwh||""):"");o.disp=sp.ev?sp.kwh:sp.disp;out.push(o)});
return out}
function parseModel(b,m){
var y0=Y(m[2]),y1=Y(m[3]);if(y1<y0)y1=y0;
var mo={id:m[0],name:m[1],y0:y0,y1:y1,seg:SEG[m[4]]||m[4]||"Véhicule",brand:b.id,brandName:b.name,engines:[]};
String(m[5]||"").split(";").filter(Boolean).forEach(function(t){
var p=t.split("|");if(!p[0])return;
var yr=String(p[4]||"").split("-");
var a=yr[0]?Y(yr[0]):y0,z=yr[1]?Y(yr[1]):y1;
mo.engines=mo.engines.concat(mkEng(b,mo,p[0],p[1]||"0",p[2],p[3],Math.max(a,y0),Math.min(z,y1),p[5]||""))});
return mo}
function parseDSL(txt,b){return String(txt).split("\n").map(function(l){return l.trim()})
.filter(function(l){return l&&l.indexOf("~")>0}).map(function(l){var p=l.split("~");
if(p.length<6)return null;return parseModel(b,p)}).filter(Boolean)}
function build(raw){return raw.map(function(b){var bo={id:b[0],name:b[1],country:b[2]};
return{id:b[0],name:b[1],country:b[2],models:b[3].map(function(m){return parseModel(bo,m)})}})}
var ALLB=D.cat.map(function(b){return b[0]});
function expand(l){return l==="ALL"?ALLB.slice():csv(l)}
var FAULTS0=D.faults.map(function(x){return{id:x[0],scope:x[1],brands:expand(x[2]),target:x[3],
kind:x[4],sev:x[5],y0:x[6],y1:x[7],titre:x[8],sym:x[9],pro:String(x[10]).split("|"),org:x[11],
dtc:csv(x[12]),src:x[13],dom:csv(x[14])}});
var REVS0=D.revs.map(function(r){return{id:r[0],brands:expand(r[1]),match:r[2],organ:r[3],
oldKm:r[4],newKm:r[5],oldMo:r[6],newMo:r[7],src:r[8],note:r[9],y0:2017,y1:2027}});
function cond(c,e,s){switch(c){
case"ice":return!s.ev;case"ev":return!!s.ev;case"hv":return s.ev||e.fuel==="P"||e.fuel==="H";
case"plug":return s.ev||e.fuel==="P";case"diesel":return e.fuel==="D";case"petrol":return!s.ev&&e.fuel!=="D";
case"chain":return!s.ev&&/chaîne|chaine/i.test(s.dist);case"wet":return!s.ev&&/humide/i.test(s.dist);
case"dry":return!s.ev&&/courroie/i.test(s.dist)&&!/humide/i.test(s.dist);
case"turbo":return!s.ev&&/turbo/i.test(s.feed);
case"scr":return/scr|adblue/i.test((e.tech||"")+" "+s.feed);
case"dpf":return e.fuel==="D"||/gpf/i.test(e.tech||"");
case"egr":return e.fuel==="D"||/gpf|egr/i.test(e.tech||"");
case"mhev":return!s.ev&&/48|mhev|isg|mild/i.test((e.tech||"")+" "+s.feed);
case"dct":return!s.ev&&/dct|dsg|e-dcs6|edc|tct/i.test((e.tech||"")+" "+famL(e));
default:return true}}
function rules(e){return D.rules.filter(function(r){return!e||cond(r[9],e,spec(e))}).map(function(r){
return{id:r[0],scope:"rule",brands:[],target:"",kind:r[2],sev:r[3],y0:YMIN,y1:YMAX,titre:r[4],
sym:r[5],pro:String(r[6]).split("|"),org:r[7],dtc:csv(r[8]),src:"Protocole atelier transversal",dom:csv(r[1]),rule:1}})}

/* ═══ RENFORT MASSIF : gabarits par domaine × énergie, corrélés modèle + puissance ═══ */
var RFT=[
["TAB1","tablette","panne","moyen","all","{MOD} — tablette multimédia : écran noir, tactile fantôme, reboots",
"Écran figé ou noir, touches fantômes, perte CarPlay/Android Auto, redémarrages, bulles sous dalle.","Relever version et journaux multimédia|Contrôler nappe vidéo, alimentation et masse|Appliquer la mise à jour constructeur|Réinitialiser puis retester tactile|Remplacer la dalle si défaut persistant","Dalle tactile, nappe LVDS, calculateur multimédia","U0101,U0121,B1000"],
["TAB2","tablette","panne","moyen","all","{MOD} — combiné / tableau de bord : pixels, teinté, informations perdues",
"Combiné partiellement éteint, pixels morts, aiguilles figées, warnings injustifiés, perte d'infos conduite.","Lire les défauts du combiné et du CAN|Contrôler alimentation et masses du combiné|Vérifier la version logicielle et re-flasher|Contrôler le connecteur et les soudures|Remplacer le combiné si défaut matériel","Combiné, connecteur, CAN, alimentation","U0155,B1000,U0073"],
["SIE1","siege","panne","moyen","all","{MOD} — sièges : réglages électriques, rails et mémoire inopérants",
"Réglage longitudinal/hauteur bloqué, mémoire qui ne rappelle pas, bruit de moteur, jeu anormal des rails.","Lire les défauts du module de siège|Tester moteurs, relais et fins de course|Contrôler le jeu des rails et le serrage|Lubrifier et réapprendre les positions|Remplacer moteur ou module","Moteurs de siège, rails, module, relais","B1000"],
["SIE2","siege","panne","moyen","all","{MOD} — siège : chauffage/ventilation et nappe de présence passager",
"Chauffage de siège inopérant, voyant airbag passager erratique, détection d'occupant intermittente.","Mesurer la résistance de chauffage de siège|Contrôler la nappe occupancy sous siège|Lire les défauts SRS et module siège|Réparer connectique puis effacer|Recalibrer la détection","Résistance chauffage, nappe occupancy, connectique","B0072,B0081,B1000"],
["ECL1","eclairage","panne","info","all","{MOD} — projecteurs : LED/matrix, condensation et module de puissance",
"Phare embué, barre LED partiellement éteinte, clignotement, défaut éclairage adaptatif.","Inspecter étanchéité, évents et joints de projecteur|Contrôler le module LED et son refroidissement|Lire les défauts du calculateur d'éclairage|Sécher/remplacer selon corrosion|Recalibrer si matrix/adaptatif","Projecteur, module LED, évents, connectique","B1000,U0100"],
["ECL2","eclairage","panne","info","all","{MOD} — feux AR, stop, clignotants et commande BCM",
"Feu arrière inopérant, stop qui reste allumé, clignotant rapide, erreur d'ampoule malgré LED.","Contrôler ampoules/LED et porte-lampes|Lire les défauts BCM et sorties|Mesurer tension de commande et masses|Contrôler corrosion du faisceau coffre/hayon|Remplacer module ou faisceau","BCM, porte-lampes, faisceau hayon, masses","B1000,U0100"],
["POR1","portes","panne","moyen","all","{MOD} — serrures, actionneurs et hayon/porte coulissante",
"Porte qui ne verrouille pas, hayon électrique bloqué, anti-pincement en défaut, bruit d'actionneur.","Lire les défauts des modules de porte/hayon|Tester actionneurs et micro-contacts|Contrôler alimentation, masses et 12 V|Lubrifier rails et vérifier anti-pincement|Remplacer actionneur ou module","Serrures, actionneurs, modules de porte, rails","B1000,U0100"],
["POR2","portes","panne","info","all","{MOD} — ouvrants : poignées, joints et infiltration d'eau",
"Eau dans habitacle ou porte, poignée cassée/décollée, joint comprimé, corrosion de bas de porte.","Inspecter joints, évents et évacuations|Tester la poignée et son câblage|Contrôler corrosion et points de soudure|Remplacer joint/poignée|Sécher et traiter masses","Joints, poignées, évents, masses","B1000"],
["CLE1","cle","panne","eleve","all","{MOD} — clé/carte : non-détection, antidémarrage et démarrage refusé",
"Message clé non détectée, démarrage impossible, ouverture aléatoire, transpondeur non reconnu.","Contrôler pile de clé/carte et lecteur de secours|Mesurer la 12 V au repos et au démarrage|Tester antennes BF et calculateur antidémarrage|Écarter interférences (badge, téléphone)|Reprogrammer la clé selon procédure","Pile, antennes BF, transpondeur, calculateur","B1000,U0100,P0562,P1600"],
["E12","elec12","panne","eleve","all","{MOD} — batterie 12 V : décharge, courant de repos et masses",
"Non-démarrage après immobilisation, voyants multiples, écrans qui redémarrent, start-stop inopérant.","Mesurer le courant de repos après veille complète|Contrôler SOH, capacité et tension|Tester alternateur / DC-DC en charge|Identifier le consommateur parasite par fusibles|Nettoyer masses et remplacer si SOH bas","Batterie 12 V, alternateur, DC-DC, masses","P0562,U0111,U0101,B1318"],
["E48","elec48","campagne","eleve","mhev","{MOD} — réseau 48 V : batterie lithium, ISG et DC-DC",
"Stop&start inopérant, à-coups au redémarrage, voyant batterie, perte assistance ISG.","Lire les codes du réseau 48 V et du DC-DC|Contrôler tension, SOH et équilibrage de la 48 V|Tester l'ISG, sa courroie et son refroidissement|Vérifier masses et connecteurs HV 48 V|Appliquer la mise à jour et revalider","Batterie 48 V, ISG, DC-DC, courroie","P0A7F,P0562,U0111"],
["HV1","hv","panne","critique","hv","{MOD} — haute tension : isolement, contacteurs et coupure sécurité",
"Alerte isolement, véhicule immobilisé, limitation de puissance, refus de charge, odeur d'ozone.","Lire défaut et valeur d'isolement|Mesurer au mégohmmètre par branche (habilitation)|Isoler clim, chauffage, OBC, pack|Contrôler humidité des connecteurs HV|Remplacer le composant fautif et revalider","Câblage HV, contacteurs, compresseur, chauffage","P0AA6,P0AFA,P0A0A,P0A0D"],
["HV2","hv","panne","eleve","hv","{MOD} — batterie HV : SOH, delta cellules et équilibrage",
"Perte d'autonomie, charge plafonnée, jauge incohérente, limitation puissance à froid/chaud.","Lire SOH, delta de cellules et températures|Cycle de charge lente complet à 100 %|Contrôler l'historique de charges rapides|Appliquer la mise à jour BMS et réapprendre SOC|Remplacer module si delta persiste","Modules, BMS, sondes, contacteurs","P0AA6,P0AFA,P0BBD,P0AB9"],
["CHG1","charge","panne","eleve","plug","{MOD} — charge AC : OBC, câble mode 2 et connecteur",
"Charge AC impossible ou interrompue, puissance réduite, odeur de chaud sur la prise.","Lire les codes OBC et du verrou|Tester plusieurs bornes et un autre câble|Contrôler résistances CP/PP du câble|Thermographier broches et connecteur|Remplacer OBC ou connecteur","OBC, connecteur, câble mode 2, verrou","P0D11,P0C76,P0D8F"],
["CHG2","charge","panne","moyen","plug","{MOD} — charge DC : puissance bridée et préconditionnement",
"Charge rapide lente, arrêt prématuré, puissance plafonnée à froid, préconditionnement absent.","Lire l'historique thermique de charge|Contrôler boucle LDR et préconditionnement|Tester plusieurs bornes DC|Vérifier verrouillage et contacteurs|Appliquer la mise à jour gestion de charge","BMS, boucle LDR, contacteurs, connecteur DC","P0C00,P0AA6,P0D0A"],
["THE1","thermique","panne","eleve","ice","{MOD} — refroidissement moteur : thermostat, pompe à eau, ventilateur",
"Température instable, surchauffe en charge, chauffage habitacle faible, fuite de LDR.","Lire température LDR et consigne thermostat|Test de pression du circuit à froid|Contrôler pompe à eau, courroie et fuite|Tester ventilateur, résistance et commande|Purger et contrôler le vase d'expansion","Thermostat, pompe à eau, ventilateur, durites","P0128,P0217,P0480,P00B7"],
["THE2","thermique","panne","moyen","plug","{MOD} — thermique EV : pompe à chaleur, boucle pack et habitacle",
"Chauffage absent, autonomie hivernale effondrée, charge DC lente à froid, alerte thermique pack.","Lire les codes du circuit thermique|Contrôler charge de fluide et compresseur|Tester vannes, échangeur et pompe LDR|Vérifier sondes pack et préconditionnement|Appliquer la mise à jour thermique","Pompe à chaleur, vannes, échangeur, sondes","P0C00,P0C2F,P0A7A"],
["CLI1","thermique","panne","moyen","all","{MOD} — climatisation : compresseur, fuite et qualité d'air",
"Froid insuffisant, bruit de compresseur, odeur, buée persistante, consommation anormale.","Mesurer pressions HP/BP et charge de fluide|Recherche de fuite (UV, électronique)|Contrôler compresseur, embrayage et détendeur|Remplacer filtre habitacle et traiter évaporateur|Recharger selon norme et tester","Compresseur, détendeur, condenseur, filtre","P0530,P0532"],
["ADA1","adas","tsb","eleve","all","{MOD} — ADAS : radar, caméra et freinages intempestifs",
"Freinage fantôme, régulateur qui se désengage, alerte collision injustifiée, maintien de voie erratique.","Relever version et journaux ADAS|Contrôler propreté, fixation et alignement radar/caméra|Vérifier géométrie et hauteur de caisse|Calibration statique puis dynamique|Contrôler cohérence caméra/radar","Radar, caméra, support, calculateur ADAS","U0121,U0101,C1A00"],
["CAM1","camera","panne","moyen","all","{MOD} — caméras : recul/360°, buée et perte de signal",
"Image trouble ou absente, caméra de recul inopérante, lignes de guidage figées, buée interne.","Contrôler étanchéité et buée du boîtier|Vérifier alimentation, masse et liaison vidéo|Nettoyer optique et support|Calibrer après intervention|Remplacer la caméra si signal absent","Caméra, faisceau hayon, connecteur, calculateur","U0121,B1000"],
["TEL1","telematique","panne","moyen","all","{MOD} — télématique : eSIM, services connectés et géolocalisation",
"Application déconnectée, services à distance muets, géolocalisation perdue, SOS inopérant.","Contrôler module télématique (alimentation, antenne, eSIM)|Vérifier couverture et abonnement|Lire journaux et version du TCU|Relancer / re-flasher la mise à jour|Remplacer le TCU si défaut matériel","TCU, antenne, eSIM, alimentation","U0101,U0121,P0562"],
["OTA1","telematique","tsb","moyen","all","{MOD} — OTA : échec de mise à jour et fonctions perdues",
"Mise à jour interrompue, écran figé après OTA, fonctions désactivées, véhicule « briqué ».","Relever version et journaux OTA|Contrôler la 12 V pendant la mise à jour|Re-flasher selon procédure constructeur|Réinitialiser les calculateurs concernés|Valider par essai complet","TCU, head unit, calculateurs, 12 V","U0101,U0121,P0562"],
["FRN1","freinage","panne","eleve","all","{MOD} — freinage : disques, plaquettes et corrosion",
"Vibrations à la pédale, bruit de frottement, distance allongée, disques voilés ou corrodés.","Mesurer épaisseur et voile des disques|Contrôler état et montage des plaquettes|Vérifier mobilité colonnettes et pistons|Contrôler liquide (humidité, échéance)|Remplacer par essieu et roder","Disques, plaquettes, étriers, liquide DOT","C1365"],
["FRN2","freinage","panne","eleve","all","{MOD} — frein de parking électrique : actuateurs et câbles",
"EPB qui ne serre/libère pas, voyant rouge, bruit d'actionneur, serrage partiel.","Lire défauts EPB et courant des actuateurs|Contrôler câbles et étriers arrière|Tester commande et alimentation|Remplacer l'actuateur puis réinitialiser|Essai de maintien en pente","Actuateurs EPB, câbles, étriers","C1365,C0561,P0562"],
["ABS1","abs","panne","eleve","all","{MOD} — ABS/ESP : capteur de roue, couronne et bloc hydraulique",
"Voyant ABS/ESP, freinage bloquant une roue, régulateur inopérant, perte de contrôle traction.","Lire vitesses de roue en roulage (4 canaux)|Contrôler couronne/cible et entrefer|Vérifier faisceau (coupure, oxydation)|Contrôler bloc hydraulique et alimentation|Effacer puis essai de validation","Capteurs ABS, couronnes, faisceau, bloc","C1365,C0035,C0040,U0121"],
["AIR1","airbag","panne","critique","all","{MOD} — SRS : connectique sous siège, prétensionneurs et voyant",
"Voyant airbag allumé, détection d'occupant erratique, ceinture non verrouillée, défaut prétensionneur.","Lire défauts SRS et compteurs de déploiement|Contrôler connecteurs jaunes sous siège|Mesurer résistance des circuits (procédure)|Vérifier prétensionneurs et ancrages|Effacer après réparation, jamais de shunt","Connectique SRS, prétensionneurs, occupancy","B1000,B0072,B0081"],
["CEI1","ceinture","panne","moyen","all","{MOD} — ceintures : enrouleur, ancrage et limiteur d'effort",
"Ceinture qui ne se verrouille pas, enrouleur bloqué, jeu anormal, témoin de boucle erratique.","Contrôler verrouillage et enroulement|Inspecter ancrages et couples de serrage|Tester le témoin de boucle|Contrôler limiteur d'effort|Remplacer l'ensemble selon campagne","Enrouleur, ancrage, boucle, limiteur","B0072,B1000"],
["TRN1","train","panne","eleve","all","{MOD} — trains roulants : rotules, silentblocs, amortisseurs, roulements",
"Claquement sur bosses, tenue de route dégradée, bruit de roulement, usure pneus irrégulière.","Contrôler jeu rotules et biellettes à la pince|Inspecter silentblocs triangles et berceau|Tester amortisseurs (rebond, fuite)|Écouter roulements en appui/délestage|Remplacer par paire puis géométrie","Rotules, silentblocs, amortisseurs, roulements",""],
["GEO1","geometrie","panne","moyen","all","{MOD} — géométrie/direction : parallélisme, chasse, capteur d'angle",
"Usure anormale pneus, volant décentré, véhicule qui tire, ESP intempestif, direction dure.","Contrôler pressions et usure par plage|Mesurer parallélisme, carrossage et chasse|Vérifier hauteur de caisse et ressorts|Calibrer le capteur d'angle volant|Contrôler crémaillère/colonne","Pneus, ressorts, crémaillère, capteur angle","C1A00,U0121,C1B00"],
["CAR1","carrosserie","panne","info","all","{MOD} — carrosserie : infiltrations, corrosion et étanchéité",
"Humidité habitacle, buée persistante, corrosion de hayon/bas de caisse, connecteurs oxydés.","Localiser l'infiltration (arrosage, joints, évents)|Contrôler évacuations et toit ouvrant|Inspecter corrosion et soudures|Vérifier connecteurs en zone humide|Traiter, remplacer joints, sécuriser masses","Joints, évents, passe-câbles, connecteurs","B1000,U0101"],
["TRM1","transmission","tsb","eleve","dct","{MOD} — boîte double embrayage : à-coups, apprentissage et huile",
"À-coups au démarrage, hésitation 1-2, patinage à chaud, message boîte chaude, compteurs d'usure.","Lire codes TCU, adaptations et température|Contrôler niveau et état d'huile|Appliquer mise à jour TCU + apprentissage|Contrôler embrayages et mécatronique|Planifier remplacement si seuil atteint","Mécatronique, embrayages, huile DCT","P0700,P1750,P0218"],
["TRM2","transmission","tsb","eleve","ice","{MOD} — boîte automatique : convertisseur, ATF et adaptations",
"À-coups basse vitesse, patinage, passages brutaux, vibration du convertisseur, ATF dégradée.","Lire adaptations et température d'huile|Contrôler niveau ATF à température normée|Analyser huile (particules, odeur)|Appliquer mise à jour TCU puis apprentissage|Vidanger selon intervalle révisé","ATF, convertisseur, mécatronique, échangeur","P0700,P1750,P0741"],
["ACO1","acoups","panne","moyen","all","{MOD} — NVH : supports moteur/boîte, cardans et vibrations",
"Vibrations volant/siège, clonc au lâcher de pédale, bruit sourde à l'accélération, supports affaissés.","Qualifier la vibration (régime, vitesse, charge)|Contrôler supports moteur et boîte|Vérifier cardans, soufflets et jeux|Contrôler équilibrage et faux-rond|Remplacer support/cardan fautif","Supports, cardans, soufflets, équilibrage",""],
["MOT1","moteur","panne","eleve","ice","{MOD} {FAM} — consommation d'huile, segmentation et PCV",
"Baisse de niveau, fumée bleue, dépôt sur bougies, blow-by, cliquetis à chaud.","Quantifier la consommation sur 1 000 km|Contrôler séparateur d'huile et carter|Endoscopie cylindres (rayures, glaçage)|Mesurer compressions et blow-by|Contrôler joints de queues et turbo","Segments, PCV, joints de queues, turbo","P0300,P0521,P0171"],
["INJ1","injection","panne","critique","ice","{MOD} {FAM} — injection : pompe HP, rail et injecteurs",
"Démarrage difficile, mode dégradé, à-coups en charge, calage, odeur de carburant.","Lire pression rail consigne/réel|Contrôler alimentation BP et filtre|Test des débits de retour|Contrôler régulateur/vanne de dosage|Remplacer pompe HP et rincer si limailles","Pompe HP, rail, injecteurs, régulateur","P0087,P0088,P0191,P025A"],
["ALL1","allumage","panne","moyen","petrol","{MOD} {FAM} — allumage : bougies, bobines et ratés",
"À-coups, voyant clignotant, perte de puissance, surconsommation, ratés au ralenti.","Lire compteurs de ratés par cylindre|Permuter bobines et bougies|Contrôler écartement, aspect et couple|Mesurer compressions si persistant|Respecter l'intervalle bougies","Bougies, bobines, faisceau","P0300,P0301,P0302,P0303"],
["SUR1","suralim","panne","eleve","turbo","{MOD} {FAM} — suralimentation : turbo, GAV et fuites d'air",
"Sifflement anormal, perte de puissance, mode dégradé, fumée, pression insuffisante.","Lire pression de suralimentation consigne/réel|Tester actionneur GAV/wastegate|Recherche de fuite au générateur de fumée|Contrôler jeux et alimentation d'huile|Vérifier ΔP FAP en aval","Turbo, GAV, wastegate, durites","P0299,P0234,P2263,P00AF"],
["DEP1","depol","panne","eleve","dpf","{MOD} {FAM} — dépollution : EGR, FAP/GPF et régénérations",
"Perte de puissance bas régime, fumée, régénérations rapprochées, dilution d'huile, voyant dépollution.","Lire position EGR et charge de suie|Contrôler refroidisseur EGR et ΔP FAP|Vérifier niveau et odeur d'huile|Régénération forcée puis essai long|Nettoyer ou remplacer selon encrassement","Vanne EGR, FAP/GPF, capteur ΔP","P0401,P2002,P2463,P242F"],
["DIS1","distribution","tsb","eleve","chain","{MOD} {FAM} — distribution : chaîne, tendeur et calage",
"Claquement métallique à froid, défaut corrélation vilo/AAC, démarrage difficile, bruit côté boîte.","Contrôler synchro vilo/AAC à l'oscilloscope|Mesurer allongement et jeu de chaîne|Inspecter tendeur, patins et guides|Vérifier pression d'huile du tendeur|Remplacer le kit complet et recaler","Kit chaîne, tendeur, patins, guides","P0016,P0017,P0011,P0335"],
["DIS2","distribution","rappel","critique","wet","{MOD} {FAM} — courroie humide : dégradation et crépine",
"Bruit de courroie, débris dans l'huile, voyant pression huile, perte de puissance, risque casse.","Mesurer la largeur de courroie au gabarit|Déposer le carter et inspecter la crépine|Contrôler pression d'huile à chaud|Remplacer kit + pompe + crépine|Vidange huile strictement normée","Courroie humide, pompe à huile, crépine","P0016,P0521,P0087,P0341"],
["AUT1","autonomie","panne","moyen","all","{MOD} — autonomie/consommation : écart au réel et dérives",
"Autonomie réelle inférieure à l'annonce, consommation en hausse, WLTP non atteint, jauge optimiste.","Comparer consommation mesurée sur trajet témoin|Contrôler pressions, monte et usure pneus|Vérifier freins traînants et étriers|Contrôler pompe à chaleur/préconditionnement|Lire SOH et température moyenne","Pneus, étriers, pompe à chaleur, BMS","P0C00,P0AA6,C1365"]
];
var RFTV=2;
function virts(e){var s=spec(e),out=[];
RFT.forEach(function(t){if(!cond(t[4],e,s))return;
out.push({id:"RF-"+e.model+"-"+e.gk.replace("|","_")+"-"+e.hp+"-"+t[0],scope:"power",hpv:e.hp,
brands:[e.brand],target:e.famKey,kind:t[2],sev:t[3],y0:e.y0,y1:e.y1,
titre:t[5].replace("{MOD}",e.brandName+" "+e.modelName).replace("{FAM}",famL(e)),
sym:t[6],pro:t[7].split("|"),org:t[8],dtc:csv(t[9]),
src:"Renfort massif v"+RFTV+" · "+e.hp+" ch",dom:[t[0]==="CLI1"?"thermique":t[1]],virt:1});});
return out}
function virtCount(){var n=0;EIX.all.forEach(function(e){n+=virts(e).length});return n}

var LS={db:"kf.db.v16",aux:"kf.aux.v16",acc:"kf.acc.v16",nf:"kf.nf.v16",dev:"kf.dev.v16"};
var CAT=[],FAULTS=[],REVC=[],NOTES={},VIEWS=[],BK=[],TIERS=[],NOTIF=[],AUDIT=null,UPD=[];
var ENR={on:true,ts:0,rep:null};
var DIFF={v:0,ts:0,status:"none",gen:0,rep:null};
var ROLE=null,DEVICE="",admTimer=null,CO={},openC=null,seenPend={},lastSig="",waitMode=false;
var SEL={brand:"",model:"",year:"",fam:"",hp:""};
var FIL={q:"",sev:[],kind:"",sort:"sev",bs:true,rules:true,done:false,dom:[]};
var USE={km:15000,sev:"normal",clim:"tempere"};
var CUI={q:"",sort:"brand",dir:1,page:0,size:40,sel:[]};
var FSEL=[],revQ="",fLimit=250,enrSnap=null,enrBusy=false;
var EIX={all:[],byBrand:{},byFam:{},byModel:{}};
var FIX={brand:{},engine:{},model:{},power:{},all:[]};
function canW(){return ROLE==="admin"}
function engines(){return EIX.all}
function B(id){for(var i=0;i<CAT.length;i++)if(CAT[i].id===id)return CAT[i];return null}
function M(b,m){var x=B(b);if(!x)return null;for(var i=0;i<x.models.length;i++)if(x.models[i].id===m)return x.models[i];return null}
function ov(a,b,c,d){return a<=d&&c<=b}
function allRevs(){return REVS0.concat(REVC)}
function reindex(){
EIX={all:[],byBrand:{},byFam:{},byModel:{}};
CAT.forEach(function(b){b.models.forEach(function(m){m.engines.forEach(function(e){
EIX.all.push(e);
if(!EIX.byBrand[b.id])EIX.byBrand[b.id]=[];EIX.byBrand[b.id].push(e);
var kf=b.id+"|"+e.famKey;if(!EIX.byFam[kf])EIX.byFam[kf]=[];EIX.byFam[kf].push(e);
var km=b.id+"|"+m.id;if(!EIX.byModel[km])EIX.byModel[km]=[];EIX.byModel[km].push(e)})})});
FIX={brand:{},engine:{},model:{},power:{},all:[]};
FAULTS.forEach(function(f){FIX.all.push(f);
if(f.scope==="rule")return;
(f.brands||[]).forEach(function(b){
if(f.scope==="brand"){if(!FIX.brand[b])FIX.brand[b]=[];FIX.brand[b].push(f)}
else if(f.scope==="engine"){var k=b+"|"+slug(f.target);if(!FIX.engine[k])FIX.engine[k]=[];FIX.engine[k].push(f)}
else if(f.scope==="power"){var kp=b+"|"+slug(f.target)+"|"+f.hpv;if(!FIX.power[kp])FIX.power[kp]=[];FIX.power[kp].push(f)}
else if(f.scope==="model")csv(f.target).forEach(function(m){var k=b+"|"+m;if(!FIX.model[k])FIX.model[k]=[];FIX.model[k].push(f)})})})}
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function saveDB(){return lsSet(LS.db,{cat:CAT,faults:FAULTS,revs:REVC,upd:UPD,enr:ENR,diff:DIFF,v:16})}
function persist(){if(saveDB())return true;BK=[];saveAux();if(saveDB())return true;
toast("Stockage saturé — données conservées en mémoire","wa");return false}
function loadDB(){var d=lsGet(LS.db,null);
if(d&&d.v===16&&d.cat&&d.cat.length){CAT=d.cat;FAULTS=d.faults||[];REVC=d.revs||[];UPD=d.upd||[];
ENR=Object.assign({on:true,ts:0,rep:null},d.enr||{});
DIFF=Object.assign({v:0,ts:0,status:"none",gen:0,rep:null},d.diff||{});return true}return false}
function saveAux(){if(lsSet(LS.aux,{notes:NOTES,views:VIEWS,bk:BK}))return true;
while(BK.length){BK.pop();if(lsSet(LS.aux,{notes:NOTES,views:VIEWS,bk:BK}))return true}
return lsSet(LS.aux,{notes:NOTES,views:VIEWS,bk:[]})}
function loadAux(){var d=lsGet(LS.aux,{});NOTES=d.notes||{};VIEWS=d.views||[];BK=d.bk||[]}
function saveAcc(){lsSet(LS.acc,TIERS);ping()}
function loadAcc(){TIERS=lsGet(LS.acc,[])||[]}
function saveNf(){lsSet(LS.nf,NOTIF.slice(0,60));ping()}
function loadNf(){NOTIF=lsGet(LS.nf,[])||[]}
function resetSeed(){CAT=build(D.cat);FAULTS=FAULTS0.map(function(f){return Object.assign({},f)});REVC=[];UPD=[];reindex();saveDB()}
var BC=null;try{BC=new BroadcastChannel("kf26")}catch(e){}
function ping(){try{if(BC)BC.postMessage({t:"s"})}catch(e){}}
function toast(m,t,undo){var box=$("toasts");if(!box)return;t=t||"in";
var ic={ok:"i-check",ba:"i-warn",wa:"i-warn",in:"i-info",te:"i-user"}[t]||"i-info";
var n=el("div","to "+t,'<svg class="ic"><use href="#'+ic+'"/></svg><div style="flex:1;min-width:0">'+esc(m)+'</div>');
if(undo){var b=el("button","ud","Annuler");b.type="button";b.onclick=function(){undo();n.remove()};n.appendChild(b)}
box.appendChild(n);setTimeout(function(){n.classList.add("ou");setTimeout(function(){n.remove()},260)},undo?8000:4200)}
function notify(type,txt,meta){NOTIF.unshift({id:"N"+Date.now()+Math.random().toString(36).slice(2,5),
type:type,txt:txt,meta:meta||"",ts:Date.now(),read:false});saveNf();renderBell()}

function Combo(host,ph,cb){this.h=host;this.ph=ph;this.cb=cb;this.items=[];this.value="";this.dis=true;this.sig="";
host.innerHTML="";this.btn=el("button","cb");this.btn.type="button";
this.btn.setAttribute("role","combobox");this.btn.setAttribute("aria-expanded","false");
this.clr=el("span","ccl",'<svg class="ic"><use href="#i-x"/></svg>');
host.appendChild(this.btn);host.appendChild(this.clr);var s=this;
this.btn.onclick=function(){s.toggle()};
this.clr.onclick=function(e){e.stopPropagation();s.pick("")};
this.btn.onkeydown=function(e){if(e.key==="ArrowDown"||e.key==="Enter"||e.key===" "){e.preventDefault();s.open()}};
this.render()}
Combo.prototype.set=function(it,v,dis){var sig=JSON.stringify(it.map(function(i){return[i.v,i.t,i.m,i.b]}))+"|"+v+"|"+!!dis;
if(sig===this.sig)return;this.sig=sig;this.items=it;this.value=v||"";this.dis=!!dis;this.render();if(openC===this)this.fill()};
Combo.prototype.cur=function(){var v=this.value;return this.items.filter(function(i){return String(i.v)===String(v)})[0]};
Combo.prototype.render=function(){var c=this.cur();this.h.dataset.filled=this.value?"1":"0";this.btn.disabled=this.dis;
this.btn.innerHTML=(c?'<span class="cv">'+esc(c.t)+'</span>'+(c.m?'<span class="cm">'+esc(c.m)+'</span>':''):
'<span class="ph">'+esc(this.ph)+'</span>')+'<svg class="ic cv2"><use href="#i-chev"/></svg>'};
Combo.prototype.toggle=function(){openC===this?this.close():this.open()};
Combo.prototype.open=function(){if(this.dis)return;if(openC&&openC!==this)openC.close();openC=this;
this.h.dataset.open="1";this.btn.setAttribute("aria-expanded","true");
var L=$("cL");L.innerHTML="";this.pop=el("div","cp");
var sb=el("div","cps");this.inp=el("input");this.inp.type="search";this.inp.placeholder="Filtrer sans accent…";
this.inp.autocomplete="off";sb.appendChild(this.inp);
this.list=el("div","cpl");this.list.setAttribute("role","listbox");this.foot=el("div","cpf");
this.pop.appendChild(sb);this.pop.appendChild(this.list);this.pop.appendChild(this.foot);L.appendChild(this.pop);
this.pop.style.pointerEvents="auto";this.place();this.fill();var s=this;
this.inp.oninput=function(){s.fill()};this.inp.onkeydown=function(e){s.key(e)};
if(this.items.length<=7)sb.style.display="none";
setTimeout(function(){if(s.items.length>7&&s.inp)s.inp.focus()},30);
this._o=function(e){if(s.pop&&!s.pop.contains(e.target)&&!s.h.contains(e.target))s.close()};
setTimeout(function(){document.addEventListener("pointerdown",s._o)},0);
this._r=function(){s.place()};window.addEventListener("scroll",this._r,true);window.addEventListener("resize",this._r)};
Combo.prototype.place=function(){if(!this.pop)return;var r=this.btn.getBoundingClientRect();
var w=Math.min(Math.max(r.width,240),window.innerWidth-16);
var below=window.innerHeight-r.bottom-12,up=below<200&&r.top>below;
var h=Math.min(340,Math.max(160,up?r.top-12:below));
this.pop.style.width=w+"px";this.pop.style.left=clamp(r.left,8,window.innerWidth-w-8)+"px";this.pop.style.maxHeight=h+"px";
if(up){this.pop.style.top="auto";this.pop.style.bottom=(window.innerHeight-r.top+6)+"px"}
else{this.pop.style.bottom="auto";this.pop.style.top=(r.bottom+6)+"px"}};
Combo.prototype.fill=function(){var q=this.inp.value||"",nq=norm(q),s=this;
var a=this.items.map(function(i){var hay=norm(i.t+" "+(i.m||"")+" "+(i.b||"")+" "+(i.a||""));
if(!nq)return{i:i,s:0};var nt=norm(i.t+" "+(i.a||""));
return hay.indexOf(nq)>=0?{i:i,s:nt.indexOf(nq)===0?0:(nt.indexOf(nq)>=0?1:2)}:null}).filter(Boolean);
a.sort(function(x,y){return x.s-y.s});a=a.map(function(x){return x.i});
this.view=a;this.idx=Math.max(0,a.map(function(i){return String(i.v)}).indexOf(String(this.value)));
this.list.innerHTML=a.length?"":'<div class="cpe">Aucun résultat — essayez sans accent</div>';
a.forEach(function(i,n){var d=el("div","co"+(n===s.idx?" cu":""));
d.setAttribute("role","option");d.setAttribute("aria-selected",String(String(i.v)===String(s.value)));
d.innerHTML='<svg class="ic tk"><use href="#i-check"/></svg><div class="ol"><div class="ot">'+hl(i.t,q)+'</div>'+
(i.m?'<div class="om">'+hl(i.m,q)+'</div>':'')+'</div>'+(i.b?'<span class="ob">'+esc(i.b)+'</span>':'');
d.onmouseenter=function(){s.idx=n;s.hi()};d.onclick=function(){s.pick(i.v)};s.list.appendChild(d)});
this.foot.innerHTML='<span>'+a.length+' / '+this.items.length+'</span><span>↑↓ · Entrée · Échap</span>';
var c=this.list.children[this.idx];if(c&&c.scrollIntoView)c.scrollIntoView({block:"nearest"})};
Combo.prototype.hi=function(){var s=this;[].forEach.call(this.list.children,function(c,n){c.classList.toggle("cu",n===s.idx)})};
Combo.prototype.key=function(e){var c;
if(e.key==="Escape"){e.preventDefault();this.close();this.btn.focus()}
else if(e.key==="ArrowDown"){e.preventDefault();this.idx=Math.min(this.view.length-1,this.idx+1);this.hi();c=this.list.children[this.idx];if(c)c.scrollIntoView({block:"nearest"})}
else if(e.key==="ArrowUp"){e.preventDefault();this.idx=Math.max(0,this.idx-1);this.hi();c=this.list.children[this.idx];if(c)c.scrollIntoView({block:"nearest"})}
else if(e.key==="Enter"){e.preventDefault();var i=this.view[this.idx];if(i)this.pick(i.v)}};
Combo.prototype.pick=function(v){this.close();this.cb(String(v))};
Combo.prototype.close=function(){if(openC!==this)return;openC=null;this.h.dataset.open="0";
this.btn.setAttribute("aria-expanded","false");document.removeEventListener("pointerdown",this._o);
window.removeEventListener("scroll",this._r,true);window.removeEventListener("resize",this._r);
$("cL").innerHTML="";this.pop=null};

function modelsOf(b,y){var x=B(b);if(!x)return[];
return x.models.filter(function(m){return!y||m.engines.some(function(e){return e.y0<=+y&&e.y1>=+y})})
.sort(function(a,c){return norm(a.name).localeCompare(norm(c.name))})}
function yearsOf(b,m){var x=M(b,m);if(!x)return[];var s=[];
x.engines.forEach(function(e){for(var y=Math.max(e.y0,YMIN);y<=Math.min(e.y1,YMAX);y++)if(s.indexOf(y)<0)s.push(y)});
return s.sort(function(a,c){return c-a})}
function famsOf(b,m,y){var x=M(b,m);if(!x)return[];var map={},order=[];
x.engines.filter(function(e){return!y||(e.y0<=+y&&e.y1>=+y)}).forEach(function(e){
if(!map[e.gk]){map[e.gk]={k:e.gk,e:e,hp:[]};order.push(e.gk)}
if(map[e.gk].hp.indexOf(e.hp)<0)map[e.gk].hp.push(e.hp)});
return order.map(function(k){return map[k]}).sort(function(a,c){return norm(famL(a.e)).localeCompare(norm(famL(c.e)))})}
function hpsOf(b,m,y,g){var x=M(b,m);if(!x)return[];
return x.engines.filter(function(e){return(!y||(e.y0<=+y&&e.y1>=+y))&&(!g||e.gk===g)}).sort(function(a,c){return a.hp-c.hp})}
function resolved(){if(!SEL.brand)return[];
return (EIX.byBrand[SEL.brand]||[]).filter(function(e){
return(!SEL.model||e.model===SEL.model)&&(!SEL.year||(e.y0<=+SEL.year&&e.y1>=+SEL.year))&&
(!SEL.fam||e.gk===SEL.fam)&&(!SEL.hp||e.hp===+SEL.hp)})}
function ready(){return!!(SEL.brand&&SEL.model&&SEL.fam&&SEL.hp)}
function sync(){if(!CO.brand)return;
var bs=CAT.slice().sort(function(a,b){return norm(a.name).localeCompare(norm(b.name))}).map(function(b){
var n=b.models.reduce(function(a,m){return a+m.engines.length},0);
return{v:b.id,t:b.name,m:b.models.length+" modèles · "+n+" motorisations",b:b.country,a:alias(b.name)}});
CO.brand.set(bs,SEL.brand,false);
var ms=SEL.brand?modelsOf(SEL.brand,SEL.year).map(function(m){
return{v:m.id,t:m.name,m:m.y0+"–"+m.y1+" · "+m.seg+(m.y0>=2024?" · nouveau":"")+" · "+m.engines.length+" mot."}}):[];
if(SEL.model&&!ms.some(function(m){return m.v===SEL.model}))SEL.model="";
CO.model.set(ms,SEL.model,!SEL.brand);
var mm=SEL.model?M(SEL.brand,SEL.model):null;
var ys=SEL.model?yearsOf(SEL.brand,SEL.model).map(function(y){
return{v:String(y),t:String(y),m:mm.engines.filter(function(e){return e.y0<=y&&e.y1>=y}).length+" motorisation(s)"}}):[];
if(SEL.year&&!ys.some(function(y){return y.v===SEL.year}))SEL.year="";
CO.year.set(ys,SEL.year,!SEL.model);
var fs=SEL.model?famsOf(SEL.brand,SEL.model,SEL.year).map(function(f){
var h=f.hp.slice().sort(function(a,b){return a-b});
return{v:f.k,t:famL(f.e),m:famM(f.e),b:h.length>1?h[0]+"–"+h[h.length-1]+" ch":h[0]+" ch"}}):[];
if(SEL.fam&&!fs.some(function(f){return f.v===SEL.fam})){SEL.fam="";SEL.hp=""}
CO.fam.set(fs,SEL.fam,!SEL.model);
var hs=[],seen={};
(SEL.model?hpsOf(SEL.brand,SEL.model,SEL.year,SEL.fam):[]).forEach(function(e){var s=spec(e);
var o={v:String(e.hp),t:e.hp+" ch",m:kw(e.hp)+" kW"+(s.tq?" · "+(s.tqE?"≈":"")+s.tq+" N·m":"")+" · "+e.code,
b:s.ev?(s.kwh?s.kwh+" kWh":"EV"):FUEL[e.fuel]};
var k=o.v+o.m;if(!seen[k]){seen[k]=1;hs.push(o)}});
if(SEL.hp&&!hs.some(function(h){return h.v===SEL.hp}))SEL.hp="";
CO.hp.set(hs,SEL.hp,!SEL.model);
[["s1",SEL.brand],["s2",SEL.model],["s3",SEL.year],["s4",SEL.fam],["s5",SEL.hp]].forEach(function(p){
var n=$(p[0]);if(n)n.classList.toggle("dn",!!p[1])});
var n=resolved().length,st=$("beState");
if(!SEL.brand){st.className="ch";st.textContent="Aucune sélection"}
else{st.className="ch "+(n?"ok":"wa");
st.textContent=ready()?n+" motorisation corrélée":(n?n+" motorisation(s) — affinez":"Combinaison sans moteur")}
st.style.height="24px";st.style.fontSize="10.5px";
var b=B(SEL.brand),f=(SEL.fam&&mm)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
$("beHint").textContent=[b?b.name:null,mm?mm.name:null,SEL.year||null,f?famL(f.e):null,SEL.hp?SEL.hp+" ch":null]
.filter(Boolean).join(" › ")||"Recherche sans accent — tapez « skoda »";
var dl=$("brandList");if(dl)dl.innerHTML=CAT.map(function(x){return'<option value="'+esc(x.name)+'">'}).join("")}
function newSearch(){Object.keys(CO).forEach(function(k){CO[k].close()});
SEL={brand:"",model:"",year:"",fam:"",hp:""};FSEL=[];FIL.q="";$("q").value="";
FIL.sev=[];FIL.kind="";FIL.sort="sev";FIL.dom=[];fLimit=250;
$("selKind").value="";$("selSort").value="sev";
[].forEach.call($("sevSeg").querySelectorAll("button"),function(b){b.setAttribute("aria-pressed","false")});
sync();renderDom();renderAll();toast("Champs vidés — nouvelle recherche","ok");window.scrollTo({top:0,behavior:"smooth"})}

function hits(f,e){if(f.y1<e.y0||f.y0>e.y1)return false;
if(f.scope==="rule")return true;
if((f.brands||[]).indexOf(e.brand)<0)return false;
if(f.scope==="brand")return FIL.bs;
if(f.scope==="model")return csv(f.target).indexOf(e.model)>=0;
if(f.scope==="engine")return slug(f.target)===e.famKey;
if(f.scope==="power")return slug(f.target)===e.famKey&&f.hpv===e.hp;
return false}
function pool(strict){var eng=resolved();if(strict&&!ready())return[];
var out=[],seen={};
function add(f){if(!seen[f.id]){seen[f.id]=1;out.push(f)}}
if(eng.length){
eng.forEach(function(e){
if(FIL.bs)(FIX.brand[e.brand]||[]).forEach(function(f){if(ov(f.y0,f.y1,e.y0,e.y1))add(f)});
(FIX.engine[e.brand+"|"+e.famKey]||[]).forEach(function(f){if(ov(f.y0,f.y1,e.y0,e.y1))add(f)});
(FIX.power[e.brand+"|"+e.famKey+"|"+e.hp]||[]).forEach(function(f){if(ov(f.y0,f.y1,e.y0,e.y1))add(f)});
(FIX.model[e.brand+"|"+e.model]||[]).forEach(function(f){if(ov(f.y0,f.y1,e.y0,e.y1))add(f)});
if(DIFF.status==="diffuse"||DIFF.status==="valide")virts(e).forEach(add);});
if(FIL.rules){var rs={};eng.forEach(function(e){rules(e).forEach(function(x){if(!rs[x.id]){rs[x.id]=1;out.push(x)}})})}
return out}
if(SEL.brand){if(FIL.bs)(FIX.brand[SEL.brand]||[]).forEach(add);
Object.keys(FIX.engine).forEach(function(k){if(k.indexOf(SEL.brand+"|")===0)FIX.engine[k].forEach(add)});
Object.keys(FIX.power).forEach(function(k){if(k.indexOf(SEL.brand+"|")===0)FIX.power[k].forEach(add)});
Object.keys(FIX.model).forEach(function(k){if(k.indexOf(SEL.brand+"|")===0)FIX.model[k].forEach(add)});
if(FIL.rules)out=out.concat(rules(null));return out}
out=FIX.all.slice();if(FIL.rules)out=out.concat(rules(null));return out}
function applyF(list){var o=list.slice(),q=norm(FIL.q);
if(q.length>=2){var t=q.split(/\s+/);
o=o.filter(function(f){var h=norm([f.titre,f.sym,f.org,f.src,KIND[f.kind],(f.dtc||[]).join(" "),f.pro.join(" "),
(f.dom||[]).map(function(d){return DM[d]?DM[d].n+" "+d:""}).join(" ")].join(" "));
return t.every(function(x){return h.indexOf(x)>=0})})}
if(FIL.sev.length)o=o.filter(function(f){return FIL.sev.indexOf(f.sev)>=0});
if(FIL.kind)o=o.filter(function(f){return f.kind===FIL.kind});
if(FIL.dom.length)o=o.filter(function(f){return(f.dom||[]).some(function(d){return FIL.dom.indexOf(d)>=0})});
if(!FIL.done)o=o.filter(function(f){return!(NOTES[f.id]&&NOTES[f.id].done)});
var s=FIL.sort;
o.sort(function(a,b){if(s==="sev")return SEV[a.sev].r-SEV[b.sev].r||b.y1-a.y1;
if(s==="year")return b.y1-a.y1||SEV[a.sev].r-SEV[b.sev].r;
if(s==="alpha")return norm(a.titre).localeCompare(norm(b.titre));
if(s==="src")return norm(a.src).localeCompare(norm(b.src));return 0});
return o}
function current(){return applyF(pool(false))}
function strictCur(){return applyF(pool(true))}
function domPills(f){return(f.dom||[]).slice(0,5).map(function(d){var m=DM[d];if(!m)return"";
return'<span class="pl" style="border-color:var(--'+m.c+');color:var(--'+CV[m.c]+')"><svg class="ic"><use href="#'+m.i+'"/></svg>'+esc(m.n)+'</span>'}).join("")}
function fCard(f,chk){var dn=NOTES[f.id]&&NOTES[f.id].done;
var d=el("div","fc v-"+f.sev+(dn?" dn":""));d.tabIndex=0;d.setAttribute("role","button");
d.innerHTML='<div class="fh">'+(chk?'<span class="fk" role="checkbox" aria-checked="'+(FSEL.indexOf(f.id)>=0)+'" tabindex="0"><svg class="ic"><use href="#i-check"/></svg></span>':'')+
'<div class="ft">'+esc(f.titre)+'</div></div><div class="fm"><span class="pl '+KCL[f.kind]+'">'+KIND[f.kind]+
'</span><span class="pl '+SCL[f.sev]+'">'+SEV[f.sev].n+'</span><span class="pl">'+f.y0+'–'+f.y1+
'</span><span class="pl'+(f.scope==="engine"||f.scope==="power"?" mx":"")+'">'+
(f.scope==="power"?"Puissance exacte":f.scope==="engine"?"Moteur exact":f.scope==="model"?"Modèle":f.scope==="rule"?"Technologie":"Marque")+'</span>'+
(f.virt?'<span class="pl si">renfort</span>':'')+(/^GEN-/.test(f.id)?'<span class="pl si">auto</span>':'')+
(dn?'<span class="pl" style="color:var(--gr);border-color:rgba(74,222,128,.4)">Traitée</span>':'')+'</div>'+
'<div class="fm">'+domPills(f)+'</div><div class="fs">'+esc(f.sym)+'</div>'+
(f.dtc.length?'<div class="dr">'+f.dtc.map(function(c){return'<span class="dtc">'+esc(c)+'</span>'}).join("")+'</div>':'')+
'<div class="fsr"><svg class="ic"><use href="#i-link"/></svg>'+esc(f.src)+
((NOTES[f.id]&&NOTES[f.id].txt)?' · <span style="color:var(--cy)">note</span>':'')+'</div>';
d.onclick=function(e){if(e.target.closest&&e.target.closest(".fk"))return;openF(f)};
d.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openF(f)}};
if(chk){var c=d.querySelector(".fk");
var tg=function(e){e.stopPropagation();var i=FSEL.indexOf(f.id);if(i>=0)FSEL.splice(i,1);else FSEL.push(f.id);renderFaults()};
c.onclick=tg;c.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();tg(e)}}}
return d}
function ey(i,t,x){return'<div class="ey"><svg class="ic"><use href="#'+i+'"/></svg><h3 style="margin-bottom:6px">'+esc(t)+'</h3><p>'+x+'</p></div>'}
function vehCard(){if(!SEL.brand)return"";
var eng=resolved(),b=B(SEL.brand),m=SEL.model?M(SEL.brand,SEL.model):null,e=eng[0];
var all=strictCur(),crit=all.filter(function(f){return f.sev==="critique"}).length,s=e?spec(e):null;
var title=[b?b.name:"",m?m.name:""].filter(Boolean).join(" ");
var sub=e?famL(e)+" · "+e.hp+" ch ("+kw(e.hp)+" kW) · "+e.code:(m?m.engines.length+" motorisations":b.models.length+" modèles");
return'<div class="vc"><div class="vb">'+esc((b?b.name:"?").slice(0,3).toUpperCase())+
'<br><span style="font-size:9px;color:var(--m2)">'+esc(b?b.country:"")+'</span></div>'+
'<div style="min-width:0"><div class="vt">'+esc(title)+(SEL.year?' <span style="color:var(--cy);font-size:.7em">('+SEL.year+')</span>':'')+'</div>'+
'<div class="mo" style="font-size:13px;color:var(--cy);margin-top:4px">'+esc(sub)+'</div><div class="vm">'+
(e?'<span class="tg f'+e.fuel+'">'+FUEL[e.fuel]+'</span><span class="tg mo">'+esc(e.code)+'</span>':'')+
(s&&!s.ev&&s.disp?'<span class="tg mo">'+s.disp+' cm³</span>':'')+
(s&&!s.ev&&s.cyl?'<span class="tg">'+s.cyl+' cyl.</span>':'')+
(s&&s.ev&&s.kwh?'<span class="tg mo">'+s.kwh+' kWh</span>':'')+
(s&&s.ev?'<span class="tg mo">'+s.volt+' V</span>':'')+
(m?'<span class="tg">'+esc(m.seg)+'</span><span class="tg mo">'+m.y0+'–'+m.y1+'</span>':'')+
(m&&m.y0>=2024?'<span class="tg" style="color:var(--mg);border-color:rgba(244,114,182,.4)">millésime 2024+</span>':'')+
(e?'<span class="tg mo">moteur '+e.y0+'–'+e.y1+'</span>':'')+
(eng.length>1?'<span class="tg" style="color:var(--amH);border-color:rgba(245,158,11,.4)">'+eng.length+' variantes</span>':'')+
'</div></div><div class="vs"><div class="vst"><b style="color:'+(crit?"var(--rd)":"var(--gr)")+'">'+crit+
'</b><span>Critiques</span></div><div class="vst"><b style="color:var(--amH)">'+all.length+
'</b><span>Fiches</span></div><div class="vst"><b style="color:var(--cy)">'+eng.length+'</b><span>Moteurs</span></div></div></div>'}
function specPanel(){var eng=resolved();if(!SEL.brand||!eng.length)return"";
if(!SEL.fam||!SEL.hp){var rows=eng.slice().sort(function(a,b){return a.hp-b.hp});
return'<div class="pn pd rvl" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#i-piston"/></svg></div>'+
'<div><h2>Motorisations réelles du modèle</h2><div class="sb">'+rows.length+' variante(s) — sélectionnez une cylindrée puis une puissance</div></div></div>'+
'<div class="tw"><table style="min-width:660px"><thead><tr><th>Cylindrée · type</th><th>cm³ / kWh</th><th>Architecture</th><th>Puissance</th><th>Couple</th><th>Code</th><th>Années</th><th></th></tr></thead><tbody>'+
rows.slice(0,120).map(function(e){var s=spec(e);
return'<tr><td class="tn">'+esc(famL(e))+'<div class="mi">'+esc(FUEL[e.fuel])+' · '+esc(s.feed)+'</div></td>'+
'<td class="mo" style="color:var(--amH)">'+(s.ev?(s.kwh?s.kwh+" kWh":"—"):(s.disp||"—"))+'</td>'+
'<td class="mi">'+esc(s.ev?s.plat:s.lay)+'</td><td class="mo" style="color:var(--rd);font-weight:800">'+e.hp+
' ch<div class="mi">'+kw(e.hp)+' kW</div></td><td class="mo" style="color:var(--gr)">'+(s.tq?(s.tqE?"≈":"")+s.tq+" N·m":"—")+
'</td><td class="mo">'+esc(e.code)+'</td><td class="mo">'+e.y0+'–'+e.y1+
'</td><td><button class="bt sm" type="button" data-eng="'+esc(e.key)+'"><svg class="ic"><use href="#i-eye"/></svg></button></td></tr>'}).join("")+
'</tbody></table></div></div>'}
var e=eng[0],s=spec(e);
var it=s.ev?[["kb","Batterie utile",(s.kwh?s.kwh+" kWh":"n.c."),"Plateforme : "+s.plat],
["ka","Architecture HV",s.volt+" V",s.volt>=800?"Charge ultra-rapide DC":"Charge DC standard"],
["kp","Puissance",e.hp+" ch",kw(e.hp)+" kW"],["ka","Moteur électrique",s.arch,s.lay],
["","Transmission",s.dist,"Rapport fixe"],["kd","Code moteur",e.code,"Production "+e.y0+"–"+e.y1]]:
[["kd","Cylindrée",(s.disp?s.disp+" cm³":"n.c."),(s.disp?(s.disp/1000).toFixed(1).replace(".",",")+" L":"")+(s.exact?" · exact":" · nominal")],
["ka","Architecture",s.lay,s.cyl?s.cyl+" cylindres":""],["","Type moteur",famL(e),FUEL[e.fuel]],
["","Alimentation",s.feed,""],["kt","Couple maxi",s.tq?(s.tqE?"≈ "+s.tq+" N·m":s.tq+" N·m"):"n.c.",s.tqE?"estimation atelier":(s.tq?"valeur constructeur":"—")],
["kp","Puissance",e.hp+" ch",kw(e.hp)+" kW"],["","Distribution",s.dist,/humide/i.test(s.dist)?"⚠ courroie en bain d'huile":""],
["kd","Code moteur",e.code,"Production "+e.y0+"–"+e.y1]];
return'<div class="pn pd rvl" style="margin-bottom:16px"><div class="sh"><div class="si ic-te"><svg class="ic"><use href="#'+(s.ev?"i-batt":"i-piston")+'"/></svg></div>'+
'<div><h2>Fiche moteur — '+esc(famL(e))+' '+e.hp+' ch</h2><div class="sb">'+esc(e.brandName)+' '+esc(e.modelName)+
' · '+esc(e.code)+' · '+esc(e.tech||"—")+'</div></div></div><div class="spec">'+
it.map(function(p){return'<div class="spi '+p[0]+'"><div class="sk">'+esc(p[1])+'</div><div class="sv2">'+esc(p[2])+
'</div>'+(p[3]?'<div class="sd">'+esc(p[3])+'</div>':'')+'</div>'}).join("")+'</div>'+
(!s.ev&&/humide/i.test(s.dist)?'<div class="nt wa" style="margin-top:12px"><b>Distribution en bain d\'huile.</b> Contrôle de la largeur au gabarit et inspection de la crépine à chaque entretien.</div>':'')+
(s.ev?'<div class="nt in" style="margin-top:12px"><b>Véhicule électrique.</b> Aucun entretien moteur thermique : batterie HV, liquide pack, réducteur et freinage.</div>':'')+'</div>'}
function bindEng(r){if(!r)return;[].forEach.call(r.querySelectorAll("[data-eng]"),function(b){
b.onclick=function(){var e=EIX.all.filter(function(x){return x.key===b.dataset.eng})[0];if(e)loadEng(e)}})}

function revsFor(e){var s=spec(e),hay=norm(e.fam+" "+e.code+" "+(e.tech||"")+" "+s.feed);
return allRevs().filter(function(r){
if((r.brands||[]).indexOf(e.brand)<0)return false;
if(!ov(r.y0,r.y1,e.y0,e.y1))return false;
if(!r.match)return true;
var re;try{re=new RegExp(r.match,"i")}catch(_){return norm(r.match).split(/\s+/).every(function(t){return hay.indexOf(t)>=0})}
if(re.test(e.fam)||re.test(e.code)||re.test(e.tech||""))return true;
return norm(r.match).replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(function(t){return t.length>2}).some(function(t){return hay.indexOf(t)>=0})})}
function revCard(r,e){var dk=r.oldKm?Math.round((r.newKm-r.oldKm)/r.oldKm*100):null;
var dm=r.oldMo?Math.round((r.newMo-r.oldMo)/r.oldMo*100):null;
var yrs=(e&&r.newKm)?Math.round(r.newKm/USE.km*10)/10:null;
return'<div class="rc"><div class="rh"><div class="si ic-mg" style="width:30px;height:30px"><svg class="ic"><use href="#i-clock"/></svg></div>'+
'<div style="flex:1;min-width:0"><h3 style="font-size:14.5px">'+esc(r.organ)+'</h3><div class="mi">'+
esc((r.brands||[]).map(function(b){var x=B(b);return x?x.name:b}).join(" · "))+
(r.match?" · "+esc(r.match.replace(/\\\./g,".").replace(/\|/g," / ")):"")+'</div></div>'+
(dk!==null?'<span class="dl '+(dk>0?"up":"")+'">'+(dk>0?"+":"")+dk+' % km</span>':'')+
(dm!==null&&dm!==dk?'<span class="dl '+(dm>0?"up":"")+'">'+(dm>0?"+":"")+dm+' % temps</span>':'')+'</div>'+
'<div class="rns"><div class="rn ol"><div class="rl">Ancien</div><div class="rv2">'+(r.oldKm?nf(r.oldKm)+" km":"sans échéance")+
'</div><div class="mi">'+(r.oldMo?moT(r.oldMo):"—")+'</div></div><span class="arw">→</span>'+
'<div class="rn nw"><div class="rl">Révisé</div><div class="rv2">'+nf(r.newKm)+' km</div><div class="mi">'+(r.newMo?moT(r.newMo):"—")+'</div></div>'+
(yrs?'<div class="rn"><div class="rl">À '+nf(USE.km)+' km/an</div><div class="rv2" style="color:var(--cy)">'+
String(yrs).replace(".",",")+' ans</div><div class="mi">échéance km</div></div>':'')+'</div>'+
'<div class="nt mg" style="margin-top:11px;font-size:12px"><b>'+esc(r.src)+'.</b> '+esc(r.note)+' <b>Confirmer au VIN.</b></div></div>'}
function planFor(e){var s=spec(e),rv=revsFor(e),f=USE.sev==="severe"?0.6:(USE.sev==="mixte"?0.8:1);
var base=s.ev?[30000,60000,90000,120000,160000]:[15000,30000,60000,90000,120000,160000];
base=base.map(function(k){return Math.max(5000,Math.round(k*f/5000)*5000)});
var rk=rv.map(function(r){return r.newKm}).filter(function(k){return k>0&&k<=200000});
var steps=base.concat(rk).filter(function(k,i,a){return a.indexOf(k)===i}).sort(function(a,b){return a-b});
var wet=/humide/i.test(s.dist),chain=/chaîne|chaine/i.test(s.dist),ev=s.ev,hy=e.fuel==="H"||e.fuel==="P";
var scr=/scr|adblue/i.test((e.tech||"")+" "+s.feed),gpf=/gpf/i.test(e.tech||""),die=e.fuel==="D";
return steps.map(function(km,i){var ops=[];
function add(t,c,r){ops.push({t:t,c:!!c,r:!!r})}
rv.filter(function(r){return r.newKm===km}).forEach(function(r){
add(r.organ+" — intervalle révisé : "+nf(r.newKm)+" km"+(r.newMo?" / "+moT(r.newMo):"")+
(r.oldKm?" (au lieu de "+nf(r.oldKm)+" km)":""),1,1)});
if(ev){if(i===0)add("Contrôle visuel batterie HV, câblage orange et connecteurs");
add("Filtre d'habitacle (charbon actif)");add("Contrôle SOH batterie et delta de cellules");
if(km>=60000)add("Liquide de frein DOT 4 (tous les 2 ans)");
if(km>=90000)add("Contrôle circuit de refroidissement batterie (pompe LDR, échangeur)");
if(km>=120000){add("Liquide de refroidissement pack HV",1);add("Contrôle isolement HV au mégohmmètre",1)}
if(km>=160000)add("Contrôle complet pack HV, contacteurs et chargeur embarqué",1);
add("Contrôle disques / plaquettes (corrosion par faible sollicitation)");
if(USE.clim==="froid")add("Préconditionnement pack avant charge DC · pompe à chaleur");
if(USE.clim==="chaud")add("Contrôle température pack et débit de refroidissement en charge rapide")}
else{if(hy){if(i===0||km%30000===0)add("Vidange huile 0W16/0W20 normée + filtre à huile")}
else if(i===0||km%30000===0)add("Vidange huile normée constructeur + filtre à huile");
if(km%30000===0||km<=15000)add("Filtre d'habitacle");
if(km>=60000&&km%60000===0)add("Filtre à air");
if(die&&km>=60000&&km%60000===0)add("Filtre à gasoil",1);
if(!die&&km>=40000&&km%40000===0)add("Bougies d'allumage"+(hy?" (iridium selon préco)":""));
if(km>=60000&&km%60000===0)add("Liquide de frein DOT 4 (tous les 2 ans)");
if(scr&&km%30000===0)add("Contrôle SCR : injecteur AdBlue, pompe, cristallisation",1);
if(die&&km%30000===0)add("Contrôle FAP : charge de suie, ΔP, régénérations");
if(gpf&&km>=60000)add("Contrôle GPF / catalyseur (contre-pression)");
if(wet){if(km%30000===0)add("Contrôle largeur courroie humide au gabarit + débris carter",1)}
else if(chain){if(km>=120000)add("Contrôle tension / allongement chaîne, écoute à froid",1)}
else if(km>=120000)add("Kit distribution + galets + pompe à eau",1);
if(hy&&km%30000===0)add("Contrôle système hybride : onduleur, LDR, isolement HV");
if(km>=120000)add("Liquide de refroidissement moteur / onduleur");
if(km>=120000)add("Contrôle trains roulants, rotules et géométrie");
if(km>=160000)add("Contrôle turbo, injecteurs (débits retour) et compressions",1);
if(USE.sev==="severe"&&km%20000===0)add("Usage sévère : analyse d'huile, nettoyage EGR, contrôle turbo",1);
if(USE.clim==="froid"&&km%30000===0)add("Climat froid : 12 V, préchauffage, thermostat");
if(USE.clim==="chaud"&&km%30000===0)add("Climat chaud : clim, condenseur, circuit LDR")}
return{km:km,mo:Math.round(km/USE.km*12),ops:ops,first:i<4,rev:rv.some(function(x){return x.newKm===km})}})}

function renderGate(){var g=$("dGate");if(!g)return;if(ready()){g.innerHTML="";return}
var b=B(SEL.brand),m=SEL.brand&&SEL.model?M(SEL.brand,SEL.model):null;
var f=(SEL.fam&&m)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
var st=[["1","Marque",SEL.brand,b?b.name:"","brand"],["2","Modèle",SEL.model,m?m.name:"","model"],
["3","Cylindrée · type moteur",SEL.fam,f?famL(f.e):"","fam"],["4","Puissance réelle",SEL.hp,SEL.hp?SEL.hp+" ch":"","hp"]];
g.innerHTML='<div class="pn pd" style="margin-bottom:16px;border-color:rgba(251,191,36,.35)">'+
'<div class="sh"><div class="si ic-am"><svg class="ic"><use href="#i-lock"/></svg></div>'+
'<div><h2>Diagnostic expert — corrélation complète requise</h2><div class="sb">Seules les fiches liées à la marque, au modèle, à la motorisation <b>et</b> à la puissance sélectionnés sont affichées.</div></div>'+
'<span class="sp"></span><button class="bt sm" type="button" id="gRand"><svg class="ic"><use href="#i-dice"/></svg>Exemple complet</button></div>'+
'<div class="g4s">'+st.map(function(p){return'<button class="gs'+(p[2]?" dn":"")+'" type="button" data-go="'+p[4]+
'"><span class="gn">'+(p[2]?"✓":p[0])+'</span><span style="min-width:0"><span class="gt">'+esc(p[1])+
'</span><span class="gv">'+esc(p[3]||"à sélectionner")+'</span></span></button>'}).join("")+'</div>'+
'<div class="nt wa" style="margin-top:13px">Complétez les '+st.filter(function(p){return!p[2]}).length+
' champ(s) manquant(s) dans le banc de commande.</div></div>';
[].forEach.call(g.querySelectorAll("[data-go]"),function(x){x.onclick=function(){
var c=CO[x.dataset.go];if(c){c.btn.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(function(){c.open()},260)}}});
var gr=$("gRand");if(gr)gr.onclick=function(){var e=EIX.all;if(e.length)loadEng(e[Math.floor(Math.random()*e.length)])}}
function renderDiag(){renderGate();$("dVeh").innerHTML=ready()?vehCard():"";
$("dSpec").innerHTML=specPanel();bindEng($("dSpec"));
var box=$("dF"),tb=$("dT"),dd=$("dD");
if(!ready()){box.innerHTML=ey("i-lock","En attente de corrélation","Aucune fiche n'est affichée tant que la marque, le modèle, la motorisation et la puissance ne sont pas sélectionnés.");
tb.innerHTML=ey("i-book","En attente","Les TSB et bulletins apparaîtront pour la motorisation exacte.");
dd.innerHTML=ey("i-bolt","En attente","Les DTC corrélés apparaîtront après sélection complète.");
$("dFSub").textContent="Sélection incomplète";$("dTSub").textContent="Sélection incomplète";return}
var all=strictCur(),p=all.filter(function(f){return f.kind!=="tsb"}),t=all.filter(function(f){return f.kind==="tsb"});
var nv=all.filter(function(f){return f.virt}).length;
$("dFSub").textContent=p.length+" fiche(s) · corrélation stricte "+SEL.hp+" ch"+(nv?" · dont "+nv+" renfort":"");
$("dTSub").textContent=t.length+" bulletin(s) pour cette motorisation";
box.innerHTML="";
if(!p.length)box.innerHTML=ey("i-shieldok","Aucune fiche critique","Aucune panne, campagne ou rappel ne correspond à cette combinaison exacte et aux filtres actifs.");
else p.slice(0,80).forEach(function(f){box.appendChild(fCard(f,false))});
tb.innerHTML="";
if(!t.length)tb.innerHTML=ey("i-book","Aucun bulletin","Aucun TSB ne correspond à la corrélation et aux filtres actifs.");
else t.slice(0,30).forEach(function(f){tb.appendChild(fCard(f,false))});
var codes=uniq([].concat.apply([],all.map(function(f){return f.dtc}))).sort();
dd.innerHTML=codes.length?codes.slice(0,40).map(function(c){var d=DTC[c];
return'<div class="dsc" style="margin-bottom:8px"><div class="dsc-h"><span class="dtc">'+esc(c)+'</span>'+
(d?esc(d[0]):"Code corrélé")+'</div>'+(d?'<div class="dsc-b" style="padding:10px 13px;font-size:12.5px">'+
'<b style="color:var(--amH)">Causes :</b> '+esc(d[1])+'<br><b style="color:var(--cy)">Contrôle :</b> '+esc(d[2])+'</div>':'')+'</div>'}).join(""):
ey("i-bolt","Aucun DTC","Aucun code défaut rattaché aux fiches corrélées.")}
function renderFaults(){$("fVeh").innerHTML=vehCard();var all=current();
$("fSub").textContent=nf(all.length)+" fiche(s) · "+FSEL.length+" sélectionnée(s)";
var box=$("fList");box.innerHTML="";
if(!all.length)box.innerHTML=ey("i-shieldok","Rien à signaler","Aucune fiche ne correspond aux filtres actifs.");
else{all.slice(0,fLimit).forEach(function(f){box.appendChild(fCard(f,canW()))});
if(all.length>fLimit){var m=el("button","bt pr",'<svg class="ic"><use href="#i-down"/></svg>Afficher 250 de plus ('+nf(all.length-fLimit)+' restantes)');
m.type="button";m.style.marginTop="10px";m.onclick=function(){fLimit+=250;renderFaults()};box.appendChild(m)}}
$("bBulkDone").disabled=$("bBulkCopy").disabled=(FSEL.length===0||!canW());
$("bF").textContent=nf(all.length)}
function renderServ(){$("sVeh").innerHTML=ready()?vehCard():"";
$("sSpec").innerHTML=specPanel();bindEng($("sSpec"));
var box=$("sPlan"),rl=$("revList");
if(!ready()){rl.innerHTML=ey("i-clock","Motorisation non identifiée","Sélectionnez marque → modèle → cylindrée/type → puissance pour les révisions applicables.");
box.innerHTML=ey("i-wrench","Sélection incomplète","Le plan exact nécessite une motorisation et une puissance identifiées.");
$("rSub").textContent="En attente";$("sSub").textContent="En attente";$("bR").textContent="0";renderRevAll();return}
var e=resolved()[0],rv=revsFor(e),plan=planFor(e),s=spec(e);
$("bR").textContent=rv.length;
$("rSub").textContent=rv.length?rv.length+" révision(s) applicable(s) à "+famL(e)+" "+e.hp+" ch — km et échéance calendaire":"Aucune révision documentée pour cette motorisation";
rl.innerHTML=rv.length?rv.slice(0,40).map(function(r){return revCard(r,e)}).join(""):ey("i-shieldok","Aucune révision","Les intervalles d'origine s'appliquent.");
$("sSub").textContent=famL(e)+" · "+e.hp+" ch ("+kw(e.hp)+" kW) · "+e.code+" · "+nf(USE.km)+" km/an · "+USE.sev;
box.innerHTML="";
plan.forEach(function(st,i){var d=el("div","stp"+(st.rev?" rvv":(st.first?" f4":"")));
d.innerHTML='<div class="kmb'+((st.rev||st.km>=120000)?" al":"")+'"><b>'+nf(st.km)+'</b><span>km'+
(st.first?" · entretien "+(i+1):"")+'</span><span class="tm">≈ '+moT(st.mo)+'</span></div><div class="ops">'+
st.ops.map(function(o){return'<div class="op'+(o.r?" rv":(o.c?" cr":""))+'"><svg class="ic"><use href="#'+
(o.r?"i-clock":(o.c?"i-warn":"i-check"))+'"/></svg><span>'+esc(o.t)+
(o.r?'<span class="ot rv">intervalle révisé</span>':(o.c?'<span class="ot">point critique</span>':''))+'</span></div>'}).join("")+'</div>';
box.appendChild(d)});
var n=el("div","nt wa");
n.innerHTML='<b>Spécificité moteur.</b> '+esc(e.tech||"—")+(s.disp&&!s.ev?" · "+s.disp+" cm³, "+s.lay:"")+
(s.ev&&s.kwh?" · pack "+s.kwh+" kWh, "+s.volt+" V":"")+". Échéances temporelles calculées sur <b>"+
nf(USE.km)+" km/an</b> ; confirmer la préconisation exacte au VIN.";
box.appendChild(n);renderRevAll()}
function renderRevAll(){var box=$("revAllList");if(!box)return;
var rows=allRevs(),q=norm(revQ);
if(q)rows=rows.filter(function(r){return norm([r.organ,r.src,r.note,r.match,
(r.brands||[]).map(function(b){var x=B(b);return x?x.name:b}).join(" ")].join(" ")).indexOf(q)>=0});
$("revAllSub").textContent=nf(rows.length)+" révision(s) sur "+nf(allRevs().length)+" · km + mois";
box.innerHTML=rows.length?rows.slice(0,120).map(function(r){return revCard(r,null)}).join(""):ey("i-search","Aucune révision","Aucune entrée ne correspond au filtre.")}
function renderDom(){var p=pool(false),c={};
p.forEach(function(f){(f.dom||[]).forEach(function(d){c[d]=(c[d]||0)+1})});
var s=$("domStrip");s.innerHTML="";
DOM.forEach(function(dd){var b=el("button","dc"+(c[dd[0]]?"":" z"));b.type="button";
b.dataset.on=FIL.dom.indexOf(dd[0])>=0?"1":"0";b.title=dd[1];
b.innerHTML='<svg class="ic"><use href="#'+dd[2]+'"/></svg>'+esc(dd[1])+'<span class="n2">'+(c[dd[0]]||0)+'</span>';
b.onclick=function(){var i=FIL.dom.indexOf(dd[0]);if(i>=0)FIL.dom.splice(i,1);else FIL.dom.push(dd[0]);fLimit=250;renderDom();renderAll()};
s.appendChild(b)});
$("domSel").textContent=FIL.dom.length?FIL.dom.map(function(d){return DM[d]?DM[d].n:d}).join(", "):"tous"}
function renderCov(){var p=pool(false),c={},cr={};
p.forEach(function(f){(f.dom||[]).forEach(function(d){c[d]=(c[d]||0)+1;if(f.sev==="critique")cr[d]=(cr[d]||0)+1})});
$("covSub").textContent=nf(p.length)+" fiche(s) · "+Object.keys(c).length+"/"+DOM.length+" domaines documentés";
var g=$("covGrid");g.innerHTML="";
DOM.forEach(function(dd){var b=el("button","cvi "+(c[dd[0]]?"hs":"z"));b.type="button";
b.innerHTML='<span class="ci ic-'+dd[3]+'"><svg class="ic"><use href="#'+dd[2]+'"/></svg></span><span class="cn">'+
esc(dd[1])+(cr[dd[0]]?'<div class="mi" style="color:var(--rd)">'+cr[dd[0]]+' critique(s)</div>':'')+
'</span><span class="cq" style="color:var(--'+CV[dd[3]]+')">'+(c[dd[0]]||0)+'</span>';
b.onclick=function(){FIL.dom=[dd[0]];fLimit=250;renderDom();renderAll();showView("faults");toast("Domaine « "+dd[1]+" » isolé","in")};
g.appendChild(b)});
var list=applyF(p),box=$("domList");box.innerHTML="";
$("domTitle").textContent=FIL.dom.length?"Fiches des domaines sélectionnés":"Fiches du référentiel";
$("domSub").textContent=nf(list.length)+" fiche(s)";
if(!list.length)box.innerHTML=ey("i-search","Aucune fiche","Aucune fiche pour ces filtres.");
else list.slice(0,100).forEach(function(f){box.appendChild(fCard(f,false))})}
function renderCat(){var eng=EIX.all;
$("catStats").innerHTML=[["Marques",CAT.length,"i-db","cy"],
["Modèles",CAT.reduce(function(a,b){return a+b.models.length},0),"i-car","vi"],
["Motorisations",eng.length,"i-piston","amH"],["Fiches + protocoles",FAULTS.length+D.rules.length,"i-warn","rd"]]
.map(function(p){return'<div class="st"><svg class="ic si2" style="color:var(--'+p[3]+')"><use href="#'+p[2]+
'"/></svg><div class="sv3" style="color:var(--'+p[3]+')">'+nf(p[1])+'</div><div class="sl">'+p[0]+'</div></div>'}).join("");
$("bC").textContent=nf(eng.length);
var rows=eng.slice(),q=norm(CUI.q);
if(q)rows=rows.filter(function(e){return norm([e.brandName,alias(e.brandName),e.modelName,famL(e),e.code,
e.tech,FUEL[e.fuel],e.hp,spec(e).disp].join(" ")).indexOf(q)>=0});
var k=CUI.sort,d=CUI.dir;
rows.sort(function(a,b){var r=0;
if(k==="brand")r=norm(a.brandName).localeCompare(norm(b.brandName))||norm(a.modelName).localeCompare(norm(b.modelName));
else if(k==="model")r=norm(a.modelName).localeCompare(norm(b.modelName));
else if(k==="years")r=a.y0-b.y0;
else if(k==="fam")r=norm(famL(a)).localeCompare(norm(famL(b)));
else if(k==="disp")r=(spec(a).disp||0)-(spec(b).disp||0);
else if(k==="hp"||k==="kw")r=a.hp-b.hp;
else if(k==="code")r=a.code.localeCompare(b.code,"fr");
else if(k==="fuel")r=a.fuel.localeCompare(b.fuel);
return r*d||norm(a.brandName).localeCompare(norm(b.brandName))});
var pages=Math.max(1,Math.ceil(rows.length/CUI.size));CUI.page=clamp(CUI.page,0,pages-1);
var sl=rows.slice(CUI.page*CUI.size,(CUI.page+1)*CUI.size),tb=$("catB");tb.innerHTML="";
sl.forEach(function(e){var s=spec(e),tr=el("tr",CUI.sel.indexOf(e.key)>=0?"sl":"");
tr.innerHTML='<td><span class="ck" role="checkbox" aria-checked="'+(CUI.sel.indexOf(e.key)>=0)+
'" tabindex="0"><svg class="ic"><use href="#i-check"/></svg></span></td><td class="tn">'+esc(e.brandName)+
'</td><td class="tn">'+esc(e.modelName)+(e.my0>=2024?' <span class="tg" style="color:var(--mg);border-color:rgba(244,114,182,.4)">2024+</span>':'')+
'<div class="mi">'+esc(e.seg)+'</div></td><td class="mo">'+e.y0+'–'+e.y1+'</td><td class="tn">'+esc(famL(e))+
'<div class="mi">'+esc(s.ev?s.plat:s.lay)+'</div></td><td class="mo" style="color:var(--amH)">'+
(s.ev?(s.kwh?s.kwh+" kWh":"—"):(s.disp||"—"))+'</td><td class="mo" style="color:var(--rd);font-weight:800">'+e.hp+
'</td><td class="mo">'+kw(e.hp)+'</td><td class="mo">'+esc(e.code)+'</td><td><span class="tg f'+e.fuel+'">'+
FUEL[e.fuel]+'</span></td><td class="mi">'+esc(e.tech||"—")+'</td><td><button class="bt sm" type="button" data-l="1"><svg class="ic"><use href="#i-eye"/></svg></button></td>';
var c=tr.querySelector(".ck");
var tg=function(ev){ev.stopPropagation();var i=CUI.sel.indexOf(e.key);if(i>=0)CUI.sel.splice(i,1);else CUI.sel.push(e.key);renderCat()};
c.onclick=tg;c.onkeydown=function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();tg(ev)}};
tr.querySelector("[data-l]").onclick=function(ev){ev.stopPropagation();loadEng(e)};
tr.ondblclick=function(){loadEng(e)};tb.appendChild(tr)});
if(!sl.length)tb.innerHTML='<tr><td colspan="12">'+ey("i-search","Aucun résultat","Aucune motorisation ne correspond au filtre.")+'</td></tr>';
$("catSub").textContent=nf(rows.length)+" motorisation(s) · tri "+k+" "+(d>0?"↑":"↓")+" · sélection "+CUI.sel.length;
$("catPg").textContent="Page "+(CUI.page+1)+" / "+pages;
$("catP").disabled=CUI.page===0;$("catN").disabled=CUI.page>=pages-1;$("bCatLoad").disabled=CUI.sel.length===0;
[].forEach.call(document.querySelectorAll("#catT th.so"),function(th){th.classList.toggle("ac",th.dataset.k===k);
th.querySelector(".aw").textContent=th.dataset.k===k?(d>0?"▲":"▼"):"▲"});
renderViews()}
function loadEng(e){SEL={brand:e.brand,model:e.model,year:String(clamp(Math.max(e.y0,YMIN),YMIN,YMAX)),fam:e.gk,hp:String(e.hp)};
fLimit=250;sync();renderDom();renderAll();toast(e.brandName+" "+e.modelName+" · "+famL(e)+" "+e.hp+" ch","ok");
window.scrollTo({top:0,behavior:"smooth"})}
function renderViews(){var box=$("views");if(!box)return;
if(!VIEWS.length){box.innerHTML=ey("i-save","Aucune vue mémorisée","Configurez le banc puis « Mémoriser vue ». Réordonnable par glisser-déposer.");return}
box.innerHTML="";
VIEWS.forEach(function(v,i){var d=el("div","sv");d.draggable=canW();
d.innerHTML='<span class="gr2"><svg class="ic"><use href="#i-grip"/></svg></span><div style="flex:1;min-width:0">'+
'<div style="font-weight:750;font-size:13px">'+esc(v.name)+'</div><div class="mi">'+esc(v.label)+'</div></div>'+
'<button class="bt sm pr" type="button" data-a="ap">Appliquer</button><button class="bt sm rd" type="button" data-a="de"'+
(canW()?"":" disabled")+'><svg class="ic"><use href="#i-trash"/></svg></button>';
d.querySelector('[data-a="ap"]').onclick=function(){SEL=Object.assign({},v.sel);FIL.q=v.q||"";
$("q").value=FIL.q;FIL.dom=(v.dom||[]).slice();USE=Object.assign({},v.use||USE);fLimit=250;
$("kmY").value=USE.km;$("kmYL").textContent=nf(USE.km)+" km/an";$("selSev").value=USE.sev;$("selClim").value=USE.clim;
sync();renderDom();renderAll();toast("Vue « "+v.name+" » appliquée","ok")};
d.querySelector('[data-a="de"]').onclick=function(){if(!canW())return;
var rm=VIEWS.splice(i,1)[0];saveAux();renderViews();
toast("Vue supprimée","wa",function(){VIEWS.splice(i,0,rm);saveAux();renderViews()})};
d.addEventListener("dragstart",function(ev){if(!canW()){ev.preventDefault();return}
d.classList.add("dg");ev.dataTransfer.setData("text/plain",String(i))});
d.addEventListener("dragend",function(){d.classList.remove("dg")});
d.addEventListener("dragover",function(ev){if(canW()){ev.preventDefault();d.classList.add("o2")}});
d.addEventListener("dragleave",function(){d.classList.remove("o2")});
d.addEventListener("drop",function(ev){ev.preventDefault();d.classList.remove("o2");if(!canW())return;
var f=+ev.dataTransfer.getData("text/plain");if(f===i)return;
var it=VIEWS.splice(f,1)[0];VIEWS.splice(i,0,it);saveAux();renderViews();toast("Vues réordonnées","ok")});
box.appendChild(d)})}

function audit(){var iss=[];
function add(s,c,m){iss.push({sev:s,code:c,msg:m})}
var eng=EIX.all,keys={},dup=0,orph=0,yf=0,hf=0;
CAT.forEach(function(b){if(!b.models.length)add("ba","BRAND","Marque « "+b.name+" » sans modèle");
b.models.forEach(function(m){if(!m.engines.length)add("ba","MODEL",b.name+" "+m.name+" : aucun moteur");
m.engines.forEach(function(e){var s=spec(e);
if(!(e.hp>0))add("ba","HP",b.name+" "+m.name+" : puissance invalide");
if(!e.code||e.code==="—")add("wa","CODE",b.name+" "+m.name+" "+e.fam+" : code manquant");
if(!FUEL[e.fuel])add("ba","FUEL",b.name+" "+m.name+" : énergie inconnue");
if(!s.ev&&!s.disp)add("wa","DISP",b.name+" "+m.name+" "+e.fam+" : cylindrée indéterminée");
if(s.ev&&!s.kwh)add("wa","KWH",b.name+" "+m.name+" "+e.hp+" ch : capacité batterie manquante");
if(e.y0<m.y0||e.y1>m.y1){yf++;add("wa","YEARS",b.name+" "+m.name+" "+e.fam+" : années hors production")}
var k=e.brand+"|"+e.model+"|"+e.gk+"|"+e.hp+"|"+e.code;
if(keys[k]){dup++;add("wa","DUP","Doublon : "+b.name+" "+m.name+" "+e.fam+" "+e.hp+" ch")}keys[k]=1;
var d=parseInt((String(e.fam).match(/(\d{2,4})\s*ch/i)||[])[1]||"0",10);
if(d&&Math.abs(d-e.hp)>2){hf++;add("wa","HPM",b.name+" "+m.name+" : libellé "+d+" ch vs "+e.hp+" ch")}})})});
var bids={};CAT.forEach(function(b){bids[b.id]=1});
var p=FAULTS.concat(rules(null));
p.forEach(function(f){if(!f.titre)add("ba","FT","Fiche "+f.id+" sans titre");
if(!f.src)add("wa","FS","Fiche "+f.id+" sans source");
if(!SEV[f.sev])add("ba","FV","Fiche "+f.id+" : sévérité inconnue");
if(!KIND[f.kind])add("ba","FK","Fiche "+f.id+" : nature inconnue");
if(!(f.dom||[]).length)add("wa","FD","Fiche "+f.id+" sans domaine");
(f.dom||[]).forEach(function(d){if(!DM[d])add("ba","FDU","Fiche "+f.id+" : domaine inconnu")});
if(f.scope!=="rule"){
if(!(f.brands||[]).some(function(b){return bids[b]}))add("wa","FB","Fiche "+f.id+" : marque inconnue");
var h=0;
if(f.scope==="engine"){var t=slug(f.target);(f.brands||[]).forEach(function(b){
(EIX.byFam[b+"|"+t]||[]).forEach(function(e){if(ov(f.y0,f.y1,e.y0,e.y1))h++})})}
else if(f.scope==="power"){var tp=slug(f.target);(f.brands||[]).forEach(function(b){
(EIX.byFam[b+"|"+tp]||[]).forEach(function(e){if(e.hp===f.hpv&&ov(f.y0,f.y1,e.y0,e.y1))h++})})}
else if(f.scope==="model")(f.brands||[]).forEach(function(b){csv(f.target).forEach(function(m){
(EIX.byModel[b+"|"+m]||[]).forEach(function(e){if(ov(f.y0,f.y1,e.y0,e.y1))h++})})});
else(f.brands||[]).forEach(function(b){h+=(EIX.byBrand[b]||[]).length});
if(!h){orph++;add("wa","FO","Fiche « "+String(f.titre).slice(0,44)+" » orpheline")}}
(f.dtc||[]).forEach(function(c){if(!DTC[c])add("in","DU","Code "+c+" ("+f.id+") absent du dictionnaire")})});
var cov={};p.forEach(function(f){(f.dom||[]).forEach(function(d){cov[d]=1})});
RFT.forEach(function(t){cov[t[1]]=1});
DOM.forEach(function(dd){if(!cov[dd[0]])add("wa","DG","Domaine « "+dd[1]+" » non couvert")});
var rv=allRevs();
rv.forEach(function(r){if(!(r.brands||[]).some(function(b){return bids[b]}))add("wa","RB","Révision "+r.id+" : marque inconnue");
if(r.newKm<=0)add("ba","RK","Révision "+r.id+" : km invalide");
if(!r.src)add("wa","RS","Révision "+r.id+" sans source")});
var n24=CAT.reduce(function(a,b){return a+b.models.filter(function(m){return m.y0>=2024}).length},0);
var vc=eng.length?virts(eng[0]).length:0;
var checks=[
["Marques → modèles",CAT.every(function(b){return b.models.length>0}),CAT.length+" marques, "+CAT.reduce(function(a,b){return a+b.models.length},0)+" modèles"],
["Modèles → motorisations",CAT.every(function(b){return b.models.every(function(m){return m.engines.length>0})}),nf(eng.length)+" motorisations"],
["Millésimes 2024+",n24>=40,n24+" modèles commercialisés dès 2024"],
["Renfort par puissance",vc>0,vc+" fiches renfort / motorisation sélectionnée"],
["Diffusion tiers",DIFF.status==="diffuse"||DIFF.status==="none",DIFF.status==="diffuse"?("v"+DIFF.v+" diffusée "+dtT(DIFF.ts)):DIFF.status],
["Auto-enrichissement",!!ENR.ts,ENR.ts?("dernier passage "+dtT(ENR.ts)):"en attente du mode admin"],
["Cylindrée / batterie",iss.filter(function(i){return i.code==="DISP"||i.code==="KWH"}).length===0,
nf(eng.filter(function(e){var s=spec(e);return s.ev?s.kwh:s.disp}).length)+"/"+nf(eng.length)+" documentées"],
["Années moteur ⊂ production",yf===0,yf?yf+" dépassement(s)":"Plages incluses"],
["Puissance ↔ libellé",hf===0,hf?hf+" écart(s)":"Cohérent"],
["Unicité des motorisations",dup===0,dup?dup+" doublon(s)":"Aucun doublon"],
["Fiches → moteur / modèle / marque",orph===0,orph?orph+" orpheline(s)":"Toutes corrélées"],
["Couverture des 29 domaines",Object.keys(cov).length===DOM.length,Object.keys(cov).length+"/"+DOM.length+" domaines"],
["Révisions d'intervalles",iss.filter(function(i){return i.code==="RK"||i.code==="RB"}).length===0,nf(rv.length)+" révisions km + mois"],
["Codes DTC documentés",iss.filter(function(i){return i.code==="DU"}).length===0,nf(Object.keys(DTC).length)+" définitions"],
["Recherche sans accent",norm("Škoda")==="skoda"&&norm("Citroën")==="citroen","Škoda → skoda"],
["Couverture 2017 → 2027",eng.some(function(e){return e.y0<=2017})&&eng.some(function(e){return e.y1>=2027}),"Plage complète"]];
var bad=iss.filter(function(i){return i.sev==="ba"}).length,warn=iss.filter(function(i){return i.sev==="wa"}).length;
var tot=Math.max(1,eng.length+p.length+rv.length);
AUDIT={issues:iss,checks:checks,score:clamp(Math.round(100-((bad*6+warn*1.1)/tot)*100),0,100),bad:bad,warn:warn,n:tot};
return AUDIT}
function renderAudit(){var a=AUDIT||audit();
$("gVal").style.strokeDashoffset=String(314-314*a.score/100);
$("gTxt").textContent=a.score+"%";$("nInt").textContent=a.score+"%";
$("chI").className="ch "+(a.bad?"ba":(a.warn?"wa":"ok"));
$("aStats").innerHTML=[["Contrôles réussis",a.checks.filter(function(x){return x[1]}).length+"/"+a.checks.length,"gr"],
["Anomalies bloquantes",a.bad,"rd"],["Avertissements",a.warn,"amH"],["Éléments audités",nf(a.n),"cy"]]
.map(function(p){return'<div class="st"><div class="sv3" style="color:var(--'+p[2]+')">'+p[1]+'</div><div class="sl">'+p[0]+'</div></div>'}).join("");
$("aChecks").innerHTML=a.checks.map(function(c){
return'<div class="dsc"><div class="dsc-b" style="display:flex;align-items:center;gap:11px;padding:11px 13px">'+
'<svg class="ic" style="width:18px;height:18px;color:'+(c[1]?"var(--gr)":"var(--amH)")+'"><use href="#'+(c[1]?"i-check":"i-warn")+
'"/></svg><div style="flex:1;min-width:0"><b style="font-size:13px">'+esc(c[0])+'</b><div class="mi">'+esc(c[2])+
'</div></div><span class="pl" style="color:'+(c[1]?"var(--gr)":"var(--amH)")+'">'+(c[1]?"CONFORME":"À CORRIGER")+'</span></div></div>'}).join("");
$("aIssues").innerHTML=!a.issues.length?'<div class="nt ok"><b>Base intègre.</b> Toutes les corrélations sont vérifiées.</div>':
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-list"/></svg>'+nf(a.issues.length)+' observation(s)</div>'+
'<div class="dsc-b" style="max-height:320px;overflow-y:auto;padding:0">'+a.issues.slice(0,250).map(function(i){
return'<div style="padding:8px 13px;border-bottom:1px solid var(--ln2);font-size:12.3px;display:flex;gap:9px">'+
'<span class="pl '+(i.sev==="ba"?"sc":(i.sev==="wa"?"se":"si"))+'" style="flex:none">'+i.code+
'</span><span style="color:var(--m1)">'+esc(i.msg)+'</span></div>'}).join("")+'</div></div>'}
function autoRepair(){if(!canW()){toast("Mode administrateur requis","ba");return}
var before=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC}),n=0;
CAT.forEach(function(b){b.models.forEach(function(m){m.engines.forEach(function(e){
if(e.y0<m.y0||e.y1>m.y1){e.y0=Math.max(e.y0,m.y0);e.y1=Math.min(e.y1,m.y1);n++}
var d=parseInt((String(e.fam).match(/(\d{2,4})\s*ch/i)||[])[1]||"0",10);
if(d&&Math.abs(d-e.hp)>2){e.fam=e.fam.replace(/\s*\d{2,4}\s*ch/i,"").trim();n++}
var s=spec(e);e.gk=e.famKey+(s.ev?"|"+(s.kwh||""):"");e.disp=s.ev?s.kwh:s.disp})})});
var seen={};
CAT.forEach(function(b){b.models.forEach(function(m){m.engines=m.engines.filter(function(e){
var k=e.brand+"|"+e.model+"|"+e.gk+"|"+e.hp+"|"+e.code;if(seen[k]){n++;return false}seen[k]=1;return true})})});
FAULTS.forEach(function(f){if(!(f.dom||[]).length){f.dom=["moteur"];n++}});
reindex();persist();audit();renderAudit();sync();renderDom();renderAll();
toast(n?n+" correction(s) appliquée(s)":"Aucune correction nécessaire",n?"ok":"in",n?function(){
var d=JSON.parse(before);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;reindex();persist();audit();renderAudit();sync();renderDom();renderAll()}:null)}

function openDw(){$("scrim").classList.add("on");$("drawer").classList.add("on");$("drawer").setAttribute("aria-hidden","false");$("dwX").focus()}
function closeDw(){$("drawer").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");
if(!$("notifDw").classList.contains("on"))$("scrim").classList.remove("on")}
function openF(f){var eng=EIX.all.filter(function(e){return hits(f,e)}),note=NOTES[f.id]||{};
$("dwT").textContent=f.titre;
$("dwS").innerHTML='<span class="pl '+KCL[f.kind]+'">'+KIND[f.kind]+'</span> <span class="pl '+SCL[f.sev]+'">'+
SEV[f.sev].n+'</span> <span class="pl">'+f.y0+'–'+f.y1+'</span>';
$("dwI").className="si "+(f.sev==="critique"?"ic-rd":(f.sev==="eleve"?"ic-am":"ic-vi"));
var g={};eng.slice(0,400).forEach(function(e){var k=e.brandName+" "+e.modelName;if(!g[k])g[k]=[];g[k].push(famL(e)+" "+e.hp+" ch ("+e.code+")")});
$("dwB").innerHTML=
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-grid"/></svg>Domaines de défaillance</div><div class="dsc-b"><div class="fm" style="margin:0">'+(domPills(f)||"—")+'</div></div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-warn"/></svg>Symptômes constatés</div><div class="dsc-b">'+esc(f.sym||"—")+'</div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-brain"/></svg>Protocole de diagnostic</div><div class="dsc-b"><ol class="pt">'+
f.pro.map(function(p){return"<li>"+esc(p)+"</li>"}).join("")+'</ol></div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-wrench"/></svg>Organes / pièces</div><div class="dsc-b">'+esc(f.org||"—")+'</div></div>'+
(f.dtc.length?'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-bolt"/></svg>Codes DTC &amp; définitions</div><div class="dsc-b">'+
f.dtc.map(function(c){var d=DTC[c];return'<div style="margin-bottom:10px"><span class="dtc">'+esc(c)+'</span> <b>'+
(d?esc(d[0]):"Code corrélé")+'</b>'+(d?'<div class="mi" style="margin-top:4px">Causes : '+esc(d[1])+
'<br>Contrôle : '+esc(d[2])+'</div>':'')+'</div>'}).join("")+'</div></div>':'')+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-car"/></svg>Véhicules corrélés ('+nf(eng.length)+')</div><div class="dsc-b" style="max-height:210px;overflow-y:auto">'+
(f.scope==="rule"?'<span class="mi">Protocole transversal — actif selon l\'énergie et la technologie réelles du moteur sélectionné.</span>':
(f.scope==="power"?'<span class="mi">Fiche corrélée à la puissance exacte '+f.hpv+' ch.</span>':
(Object.keys(g).length?Object.keys(g).slice(0,120).map(function(k){return'<div style="margin-bottom:9px"><b style="font-size:12.5px">'+
esc(k)+'</b><div class="mi">'+esc(g[k].slice(0,8).join(" · "))+'</div></div>'}).join(""):
'<span class="mi">Portée marque — s\'applique à toute la gamme.</span>')))+' </div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-link"/></svg>Source &amp; vérification</div><div class="dsc-b"><b>'+esc(f.src)+'</b>'+
'<div class="nt wa" style="margin-top:10px;font-size:12px">Confirmez l\'éligibilité au <b>VIN</b> sur la source officielle avant intervention.</div></div></div>'+
'<div class="dsc"><div class="dsc-h"><svg class="ic"><use href="#i-edit"/></svg>Note d\'atelier '+(canW()?"":"— lecture seule")+
'</div><div class="dsc-b"><textarea class="ct" id="dwNote" rows="3"'+(canW()?"":" disabled")+
' placeholder="Observations, mesures, référence pièces…">'+esc(note.txt||"")+'</textarea></div></div>';
$("dwF").innerHTML="";
function mk(c,i,t,fn,dis){var b=el("button","bt "+c,'<svg class="ic"><use href="#'+i+'"/></svg>'+t);
b.type="button";b.onclick=fn;if(dis)b.disabled=true;$("dwF").appendChild(b)}
mk(note.done?"":"gr","i-check",note.done?"Marquer non traitée":"Marquer traitée",function(){
NOTES[f.id]=Object.assign({},NOTES[f.id],{done:!note.done});saveAux();renderAll();openF(f);
toast(note.done?"Fiche rouverte":"Fiche marquée traitée","ok")},!canW());
mk("","i-save","Enregistrer la note",function(){
NOTES[f.id]=Object.assign({},NOTES[f.id],{txt:$("dwNote").value});saveAux();renderAll();toast("Note enregistrée","ok")},!canW());
mk("","i-copy","Copier",function(){
var t=f.titre+"\n"+KIND[f.kind]+" · "+SEV[f.sev].n+" · "+f.y0+"-"+f.y1+"\nSource : "+f.src+"\nSymptômes : "+f.sym+
"\nProtocole :\n"+f.pro.map(function(p,i){return(i+1)+") "+p}).join("\n")+"\nOrganes : "+f.org+"\nDTC : "+f.dtc.join(", ");
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast("Fiche copiée","ok")},function(){toast("Copie indisponible","wa")});
else toast("Copie indisponible","wa")});
if(canW()&&!f.virt)mk("rd","i-trash","Supprimer",function(){
var i=-1;FAULTS.forEach(function(x,j){if(x.id===f.id)i=j});if(i<0)return;
var rm=FAULTS.splice(i,1)[0];reindex();persist();closeDw();audit();renderDom();renderAll();
toast("Fiche supprimée","wa",function(){FAULTS.splice(i,0,rm);reindex();persist();audit();renderDom();renderAll()})});
openDw()}
function pending(){return TIERS.filter(function(t){return t.status==="pending"})}
function renderBell(){var n=pending().length,un=NOTIF.filter(function(x){return!x.read}).length,tot=n+un,b=$("bellN");
if(tot>0){b.style.display="grid";b.textContent=tot>99?"99+":tot}else b.style.display="none";
$("bA").textContent=n;$("nfS").textContent=n+" demande(s) en attente · "+un+" non lue(s)"}
function renderNf(){var box=$("nfList"),items=[];
pending().forEach(function(t){items.push({type:"access",txt:"Demande d'accès de "+t.name,
meta:dtT(t.ts)+" · appareil "+t.device,ts:t.ts,read:false,go:true})});
NOTIF.forEach(function(n){items.push(n)});
items.sort(function(a,b){return b.ts-a.ts});
if(!items.length){box.innerHTML=ey("i-bell","Aucune notification","Les demandes d'accès des tiers et les événements système apparaîtront ici.");return}
box.innerHTML="";
items.slice(0,60).forEach(function(n){
var ic=n.type==="access"?["ic-am","i-user"]:n.type==="grant"?["ic-gr","i-unlock"]:n.type==="deny"?["ic-rd","i-ban"]:
n.type==="revoke"?["ic-mg","i-ban"]:n.type==="import"?["ic-vi","i-cloud"]:n.type==="diff"?["ic-te","i-send"]:["ic-cy","i-info"];
var d=el("div","ni"+(n.read?"":" un"));
d.innerHTML='<span class="nic '+ic[0]+'"><svg class="ic"><use href="#'+ic[1]+'"/></svg></span>'+
'<div class="nib"><div class="nit">'+esc(n.txt)+'</div><div class="nid">'+esc(n.meta||dtT(n.ts))+'</div></div>'+
(n.go?'<button class="bt sm te" type="button" style="flex:none">Ouvrir</button>':'');
var g=d.querySelector("button");
if(g)g.onclick=function(){closeNf();if(canW()){showView("adm");setTimeout(function(){$("tiersList").scrollIntoView({behavior:"smooth",block:"center"})},200)}else toast("Réservé à l'administrateur","ba")};
box.appendChild(d)})}
function openNf(){renderNf();$("scrim").classList.add("on");$("notifDw").classList.add("on");
$("notifDw").setAttribute("aria-hidden","false");$("nfX").focus()}
function closeNf(){$("notifDw").classList.remove("on");$("notifDw").setAttribute("aria-hidden","true");
if(!$("drawer").classList.contains("on"))$("scrim").classList.remove("on")}

function initDevice(){var d=null;try{d=localStorage.getItem(LS.dev)}catch(e){}
if(!d){d="D-"+Math.random().toString(36).slice(2,7).toUpperCase();try{localStorage.setItem(LS.dev,d)}catch(e){}}DEVICE=d}
function myReq(){return TIERS.filter(function(t){return t.device===DEVICE})[0]}
var STN={pending:"En attente",granted:"Autorisé",denied:"Refusé",revoked:"Révoqué"};
function requestAccess(name){var n=String(name||"").trim().replace(/\s+/g," ");
if(!/^[A-Za-zÀ-ÿ' -]{2,24}$/.test(n)){$("tiersErr").style.display="block";return}
$("tiersErr").style.display="none";
var r=myReq();
if(!r){r={id:"T"+Date.now().toString(36).toUpperCase(),name:n,device:DEVICE,ts:Date.now(),status:"pending",history:[]};TIERS.unshift(r)}
else{r.name=n;r.status="pending";r.ts=Date.now();r.decidedAt=null}
r.history.push({ts:Date.now(),a:"demande",by:n});
saveAcc();notify("access","Demande d'accès de "+n,"appareil "+DEVICE);
waitMode=true;renderLaunch();renderBell();toast("Demande envoyée à l'administrateur","te")}
function cancelRequest(){var r=myReq();if(!r)return;
TIERS=TIERS.filter(function(t){return t.id!==r.id});saveAcc();
notify("access","Demande annulée ("+r.name+")","");waitMode=false;renderLaunch();renderBell();toast("Demande annulée","in")}
function setTier(id,status){if(!canW()){toast("Réservé à l'administrateur","ba");return}
var t=TIERS.filter(function(x){return x.id===id})[0];if(!t)return;
var prev=t.status;t.status=status;t.decidedAt=Date.now();t.history.push({ts:Date.now(),a:status,by:"admin"});
saveAcc();
var lbl={granted:"Accès accordé à",denied:"Accès refusé à",revoked:"Accès révoqué à",pending:"Accès remis en attente pour"}[status];
notify(status==="granted"?"grant":status==="denied"?"deny":status==="revoked"?"revoke":"access",lbl+" "+t.name,STN[status]);
renderTiers();renderBell();
toast(lbl+" "+t.name+" — "+STN[status],status==="granted"?"ok":(status==="pending"?"in":"wa"),function(){
t.status=prev;saveAcc();renderTiers();renderBell()})}
function removeTier(id){if(!canW())return;var i=-1;TIERS.forEach(function(x,j){if(x.id===id)i=j});if(i<0)return;
var rm=TIERS.splice(i,1)[0];saveAcc();renderTiers();renderBell();
toast("Tiers supprimé","wa",function(){TIERS.splice(i,0,rm);saveAcc();renderTiers();renderBell()})}
function renderTiers(){if(!canW())return;
var q=norm($("tiersQ").value),fil=$("tiersFil").value;
var rows=TIERS.slice().sort(function(a,b){return b.ts-a.ts});
if(fil)rows=rows.filter(function(t){return t.status===fil});
if(q)rows=rows.filter(function(t){return norm(t.name+" "+t.device).indexOf(q)>=0});
var c={pending:0,granted:0,denied:0,revoked:0};
TIERS.forEach(function(t){c[t.status]=(c[t.status]||0)+1});
$("tiersStats").innerHTML=[["En attente",c.pending,"amH"],["Autorisés",c.granted,"gr"],["Refusés",c.denied,"rd"],["Révoqués",c.revoked,"mg"]]
.map(function(p){return'<div class="st"><div class="sv3" style="color:var(--'+p[2]+')">'+p[1]+'</div><div class="sl">'+p[0]+'</div></div>'}).join("");
$("tiersSub").textContent=TIERS.length+" tiers · "+c.pending+" en attente · actions accès / refus / révocation permanentes";
var box=$("tiersList");box.innerHTML="";
if(!rows.length){box.innerHTML=ey("i-users","Aucun tiers","Les demandes d'accès apparaissent ici en temps réel, avec le prénom du demandeur.");return}
rows.forEach(function(t){var d=el("div","tc s-"+t.status);
d.innerHTML='<div class="th"><span class="av">'+esc((t.name||"?").slice(0,2).toUpperCase())+'</span>'+
'<div style="flex:1;min-width:0"><h3 style="font-size:15px">'+esc(t.name)+'</h3><div class="mi">Appareil '+esc(t.device)+
' · demande '+dtT(t.ts)+(t.decidedAt?" · décision "+dtT(t.decidedAt):"")+'</div></div>'+
'<span class="pl '+(t.status==="granted"?"si":t.status==="pending"?"se":t.status==="denied"?"sc":"sm")+
'" style="height:24px;font-size:10.5px">'+STN[t.status]+'</span></div><div class="tac">'+
'<button class="bt sm gr" type="button" data-a="granted"'+(t.status==="granted"?" disabled":"")+'><svg class="ic"><use href="#i-check"/></svg>Accès</button>'+
'<button class="bt sm rd" type="button" data-a="denied"'+(t.status==="denied"?" disabled":"")+'><svg class="ic"><use href="#i-ban"/></svg>Refus</button>'+
'<button class="bt sm am" type="button" data-a="revoked"'+(t.status==="revoked"?" disabled":"")+'><svg class="ic"><use href="#i-lock"/></svg>Révocation</button>'+
'<button class="bt sm" type="button" data-a="pending"'+(t.status==="pending"?" disabled":"")+'><svg class="ic"><use href="#i-hour"/></svg>En attente</button>'+
'<span class="sp"></span><button class="bt sm rd" type="button" data-a="del"><svg class="ic"><use href="#i-trash"/></svg></button></div>'+
(t.history.length?'<div class="thi">'+t.history.slice(-4).map(function(h){
return"<div>"+dtT(h.ts)+" — "+esc(h.a)+(h.by?" par "+esc(h.by):"")+"</div>"}).join("")+'</div>':'');
[].forEach.call(d.querySelectorAll("[data-a]"),function(b){
b.onclick=function(){var a=b.dataset.a;if(a==="del")removeTier(t.id);else setTier(t.id,a)}});
box.appendChild(d)})}
function renderWait(){var r=myReq(),W=$("lWait"),C=$("lChoose");
if(!waitMode||!r){W.style.display="none";C.style.display="";return}
W.style.display="";C.style.display="none";
$("wRing").className="wrg s-"+r.status;
$("wIcon").innerHTML='<use href="#'+(r.status==="granted"?"i-unlock":r.status==="pending"?"i-hour":r.status==="denied"?"i-ban":"i-lock")+'"/>';
$("wTitle").textContent={pending:"Demande en attente de validation",granted:"Accès autorisé",denied:"Demande refusée",revoked:"Accès révoqué"}[r.status];
$("wMsg").textContent={pending:"L'administrateur a reçu votre demande. La réponse arrive en temps réel sur cet appareil.",
granted:"Votre accès tiers est actif : consultation complète en lecture seule, renfort inclus.",
denied:"L'administrateur a refusé cette demande. Vous pouvez renouveler ou contacter l'administrateur.",
revoked:"L'administrateur a révoqué votre accès. La session tiers est fermée."}[r.status];
$("wName").querySelector("b").textContent=r.name;
$("wId").querySelector("b").textContent=r.id;
$("wNote").innerHTML="<b>Statut :</b> "+STN[r.status]+" · <b>Appareil :</b> "+esc(r.device)+" · <b>Demande :</b> "+dtT(r.ts)+
(r.decidedAt?" · <b>Décision :</b> "+dtT(r.decidedAt):"")+".<br>Le tiers ne peut ni modifier le projet, ni importer, ni mettre à jour l'APK."+
(DIFF.status==="diffuse"?"<br><b>Renfort v"+DIFF.v+" diffusé par l'administrateur : actif en lecture seule.</b>":"");
var act=$("wAct");act.innerHTML="";
if(r.status==="granted"){var b=el("button","bt te",'<svg class="ic"><use href="#i-unlock"/></svg>Entrer en mode tiers');
b.type="button";b.onclick=function(){K.unlock("tiers")};act.appendChild(b)}
if(r.status==="pending"){var c=el("button","bt",'<svg class="ic"><use href="#i-x"/></svg>Annuler ma demande');
c.type="button";c.onclick=cancelRequest;act.appendChild(c)}
if(r.status==="denied"||r.status==="revoked"){var d=el("button","bt te",'<svg class="ic"><use href="#i-send"/></svg>Nouvelle demande');
d.type="button";d.onclick=function(){TIERS=TIERS.filter(function(t){return t.id!==r.id});saveAcc();waitMode=false;renderLaunch()};act.appendChild(d)}}
function renderLaunch(){var eng=EIX.all;
$("lStats").innerHTML=[["Motorisations",nf(eng.length)],["Marques",CAT.length],
["Modèles",CAT.reduce(function(a,b){return a+b.models.length},0)],["Fiches",nf(FAULTS.length+D.rules.length)],
["Domaines",DOM.length],["Révisions",nf(allRevs().length)]]
.map(function(p){return'<span class="ch in"><b>'+p[1]+'</b> '+p[0]+'</span>'}).join("")+
(DIFF.status==="diffuse"?'<span class="ch te"><b>v'+DIFF.v+'</b> Renfort diffusé</span>':'');
if(waitMode&&myReq()){$("lChoose").style.display="none";$("lWait").style.display="";renderWait()}
else{$("lChoose").style.display="";$("lWait").style.display="none"}}

function applyRole(){var chip=$("chR");
if(ROLE==="admin"){chip.className="ch ok";$("nRole").textContent="ADMIN";$("exitB").querySelector("span").textContent="Verrouiller"}
else if(ROLE==="tiers"){var r=myReq();chip.className="ch te";$("nRole").textContent="TIERS · "+(r?r.name:"");
$("exitB").querySelector("span").textContent="Quitter"}
else{chip.className="ch";$("nRole").textContent="—";$("exitB").querySelector("span").textContent="Quitter"}
$("tbAdm").classList.toggle("hd2",ROLE!=="admin");
$("roB").style.display=ROLE==="tiers"?"flex":"none";
var w=!canW();
["bSave","bUpd","bExp","bBk","bWipe","bClearN","bRepair","bRevAllT"].forEach(function(id){var b=$(id);if(b)b.disabled=w});
[].forEach.call(document.querySelectorAll("#addEng button[type=submit],#addF button[type=submit],#addRev button[type=submit]"),function(b){b.disabled=w});
if(ROLE==="tiers"&&$("v-adm").classList.contains("on"))showView("diag")}
function afterEnter(){applyRole();
if(ROLE==="admin"){var t=Date.now()+30*60*1000;$("admExp").textContent=new Date(t).toLocaleTimeString("fr-FR");
clearTimeout(admTimer);admTimer=setTimeout(function(){K.lock();toast("Session administrateur expirée","wa")},30*60*1000)}
else clearTimeout(admTimer);
safe(function(){sync();renderDom();renderAll();renderBell()},"rendu-après-ouverture");
toast(ROLE==="admin"?"Session administrateur ouverte (30 min)":"Mode tiers actif — lecture seule"+(DIFF.status==="diffuse"?" · renfort v"+DIFF.v:""),ROLE==="admin"?"ok":"te");
if(ROLE==="admin"&&ENR.on&&!enrBusy)setTimeout(function(){safe(function(){enrich(true)},"auto-enrichissement")},450)}
window.addEventListener("kf:unlock",function(e){ROLE=e.detail.role;waitMode=false;afterEnter()});
window.addEventListener("kf:lock",function(){ROLE=null;clearTimeout(admTimer);
var r=myReq();waitMode=!!(r&&r.status!=="granted");applyRole();safe(renderLaunch,"écran accueil")});
window.addEventListener("kf:tiers",function(e){safe(function(){requestAccess(e.detail.name)},"demande-tiers")});
function live(){loadAcc();loadNf();renderBell();
if(ROLE==="tiers"){var r=myReq();
if(!r||r.status!=="granted"){K.lock();
toast(r&&r.status==="revoked"?"Accès tiers révoqué par l'administrateur":r&&r.status==="denied"?"Accès tiers refusé":"Session tiers fermée","wa");return}}
if(!ROLE&&waitMode)safe(renderWait,"attente");
if(ROLE==="admin"){var sig=TIERS.map(function(t){return t.id+t.status}).join(",");
if(sig!==lastSig){TIERS.filter(function(t){return t.status==="pending"&&!seenPend[t.id]}).forEach(function(t){
seenPend[t.id]=1;toast("Nouvelle demande d'accès : "+t.name,"wa")});
lastSig=sig;safe(renderTiers,"tiers");renderBell()}}}

function renderAdm(){if(!canW())return;
$("admStats").innerHTML=[["Motorisations",nf(EIX.all.length),"cy"],["Fiches",nf(FAULTS.length),"amH"],
["Protocoles",D.rules.length,"vi"],["Révisions",nf(allRevs().length),"mg"]]
.map(function(p){return'<div class="st"><div class="sv3" style="color:var(--'+p[2]+')">'+p[1]+'</div><div class="sl">'+p[0]+'</div></div>'}).join("");
renderTiers();ensureEnrPanel();renderEnrPanel();ensureDiffPanel();renderDiffPanel();
var n24=CAT.reduce(function(a,b){return a+b.models.filter(function(m){return m.y0>=2024}).length},0);
$("updStats").innerHTML=[["Marques",CAT.length,"cy"],["Modèles 2024+",n24,"mg"],
["Intégrations",UPD.length,"gr"],["Dernière",UPD.length?dtT(UPD[0].ts):"—","vi"]]
.map(function(p){return'<div class="st"><div class="sv3" style="font-size:19px;color:var(--'+p[2]+')">'+esc(String(p[1]))+'</div><div class="sl">'+p[0]+'</div></div>'}).join("");
$("updLog").innerHTML=UPD.length?UPD.slice(0,6).map(function(u){
return'<div class="sv"><span class="gr2"><svg class="ic"><use href="#i-clock"/></svg></span><div style="flex:1;min-width:0">'+
'<div style="font-weight:750;font-size:13px">'+esc(u.src)+'</div><div class="mi">'+dtT(u.ts)+" · +"+u.m+" motorisations · +"+u.f+" fiches · +"+u.r+' révisions</div></div><span class="pl si">intégré</span></div>'}).join(""):
'<div class="nt">Aucune intégration externe. La base livrée est complète et hors ligne.</div>';
var box=$("bkList");
if(!BK.length)box.innerHTML='<div class="nt">Aucune sauvegarde locale lourde (base volumineuse). L\'annulation immédiate reste disponible après chaque opération.</div>';
else box.innerHTML=BK.map(function(b,i){
return'<div class="sv"><span class="gr2"><svg class="ic"><use href="#i-save"/></svg></span><div style="flex:1;min-width:0">'+
'<div style="font-weight:750;font-size:13px">'+new Date(b.t).toLocaleString("fr-FR")+'</div><div class="mi">'+esc(b.src)+
" · "+b.veh+" motorisations · "+b.f+" fiches · "+Math.round((b.size||0)/1024)+' Ko</div></div>'+
'<button class="bt sm gr" type="button" data-r="'+i+'">Restaurer</button><button class="bt sm rd" type="button" data-d="'+i+'"><svg class="ic"><use href="#i-trash"/></svg></button></div>'}).join("");
[].forEach.call(box.querySelectorAll("[data-r]"),function(b){b.onclick=function(){restoreBk(+b.dataset.r)}});
[].forEach.call(box.querySelectorAll("[data-d]"),function(b){b.onclick=function(){
var i=+b.dataset.d,rm=BK.splice(i,1)[0];saveAux();renderAdm();
toast("Sauvegarde supprimée","wa",function(){BK.splice(i,0,rm);saveAux();renderAdm()})}})}
function makeBk(src){var p=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
if(p.length>900000)return false;
BK.unshift({t:Date.now(),src:src,veh:EIX.all.length,f:FAULTS.length,size:p.length,data:p});
while(BK.length>2)BK.pop();saveAux();if(canW())renderAdm();return true}
function restoreBk(i){var b=BK[i];if(!b)return;
if(!confirm("Restaurer la sauvegarde du "+new Date(b.t).toLocaleString("fr-FR")+" ?"))return;
var before=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
try{var d=JSON.parse(b.data);CAT=d.cat;FAULTS=d.faults;REVC=d.revs||[];reindex();persist();
newSearch();audit();renderAudit();renderAdm();
toast("Sauvegarde restaurée","ok",function(){var p=JSON.parse(before);CAT=p.cat;FAULTS=p.faults;REVC=p.revs;
reindex();persist();sync();audit();renderDom();renderAll();renderAdm()})}catch(e){toast("Sauvegarde illisible","ba")}}
function ovlOn(on){$("ovl").classList.toggle("on",on);
if(on){$("ovLog").innerHTML="";$("ovRes").innerHTML="";$("ovX").style.display="none";$("ovBar").style.width="0%";$("ovPct").textContent="0 %"}}
function olog(m,c){var l=$("ovLog"),d=el("div","l"+(c||"i"),"["+new Date().toLocaleTimeString("fr-FR")+"] "+esc(m));
l.appendChild(d);l.scrollTop=l.scrollHeight}
function ostep(p,d){$("ovBar").style.width=clamp(p,0,100)+"%";$("ovPct").textContent=Math.round(clamp(p,0,100))+" %";
$("ovDet").textContent=d;$("ovStep").textContent="Étape "+clamp(Math.ceil(p/13),1,8)+"/8"}
function nBrand(n){var s=String(n||"").trim(),m={"citroën":"Citroën","citroen":"Citroën","škoda":"Škoda","skoda":"Škoda",
"vw":"Volkswagen","mercedes":"Mercedes-Benz","mercedes-benz":"Mercedes-Benz","ds":"DS Automobiles","mini":"MINI"};
return m[norm(s)]||m[s.toLowerCase()]||s}
function pYears(v){var s=String(v||""),m=s.match(/(20\d{2})\s*[-–/]\s*(20\d{2})/);
if(m)return[+m[1],+m[2]];var o=s.match(/(20\d{2})/);return o?[+o[1],+o[1]]:[2017,2027]}
function fGuess(f){var t=norm(f);
if(/electrique|ev\b|e tron/.test(t))return"EV";
if(/phev|e hybrid|e tense|recharge|dm i|4xe/.test(t))return"P";
if(/hybrid|hybride|mhev|e tech|e hev|e power|shvs|dualjet/.test(t))return"H";
if(/diesel|tdi|hdi|dci|crdi|multijet|jtd|ecoblue|cdi|d 4d|skyactiv d|di d/.test(t))return"D";
if(/eco g|lpg|gpl/.test(t))return"G";return"E"}
function fom(bn,mn,y0,y1){var bid=slug(bn),b=B(bid);
if(!b){b={id:bid,name:bn,country:"—",models:[]};CAT.push(b)}
var m=null;b.models.forEach(function(x){if(slug(x.name)===slug(mn))m=x});
if(!m){m={id:bid+"-"+slug(mn),name:mn,y0:y0||2017,y1:y1||2027,seg:"Importé",brand:bid,brandName:b.name,engines:[]};b.models.push(m)}
m.y0=Math.min(m.y0,y0||m.y0);m.y1=Math.max(m.y1,y1||m.y1);return{b:b,m:m}}
function addEngTo(m,b,fam,hp,code,fuel,y0,y1,tech,dispO){
var tmp={fam:fam,famKey:slug(fam),hp:hp,code:code||"—",fuel:FUEL[fuel]?fuel:"E",tech:tech||""};
var gk=tmp.famKey+(fuel==="EV"?"|"+(dispO||spec(tmp).kwh||""):"");
var ex=null;m.engines.forEach(function(e){if(e.gk===gk&&e.hp===hp)ex=e});
if(ex){var ch=false;
if(code&&ex.code!==code){ex.code=code;ch=true}
if(tech&&ex.tech.indexOf(tech)<0){ex.tech=(ex.tech?ex.tech+" · ":"")+tech;ch=true}
if(y0&&y0<ex.y0){ex.y0=y0;ch=true}
if(y1&&y1>ex.y1){ex.y1=y1;ch=true}
return ch?"merge":"none"}
var e={key:b.id+"/"+m.id+"/"+slug(fam)+"/"+hp+"/"+m.engines.length,fam:fam,famKey:slug(fam),hp:hp,
code:code||"—",fuel:FUEL[fuel]?fuel:"E",y0:y0||m.y0,y1:y1||m.y1,tech:tech||"",brand:b.id,brandName:b.name,
model:m.id,modelName:m.name,seg:m.seg,my0:m.y0,my1:m.y1};
if(dispO&&e.fuel==="EV"&&!/kWh/i.test(e.tech))e.tech=(e.tech?e.tech+" · ":"")+dispO+" kWh";
var s=spec(e);e.gk=e.famKey+(s.ev?"|"+(s.kwh||""):"");e.disp=s.ev?s.kwh:s.disp;
m.engines.push(e);return"add"}
function domGuess(txt){var t=norm(txt),out=[];
var map={moteur:/moteur|huile|segment|culasse/,distribution:/courroie|chaine|distribution|tendeur/,
injection:/inject|pompe hp|rail|carburant/,allumage:/bougie|allumage|prechauff|bobine/,
suralim:/turbo|suralim|wastegate/,depol:/egr|fap|adblue|scr|nox|gpf/,
transmission:/boite|embrayage|dsg|dct|cvt|eat|pdk/,acoups:/a coup|acoup|vibrat|broutage/,
freinage:/frein|disque|plaquette|servofrein/,abs:/abs|esp|capteur roue/,airbag:/airbag|takata|pretension/,
ceinture:/ceinture|ancrage/,siege:/siege|occupancy/,train:/suspension|rotule|amortisseur|roulement|ressort/,
geometrie:/geometrie|parallelisme|direction|cremaillere|pneu/,portes:/porte|serrure|hayon|ouvrant|poignee/,
cle:/cle|carte|antidemarrage|keyless/,elec12:/12v|12 v|batterie 12|alternateur/,elec48:/48v|48 v|isg|mhev/,
hv:/haute tension|batterie hv|isolement|cellule|pack/,charge:/charge|obc|iccu|borne|type 2/,
autonomie:/autonomie|consommation|soh/,thermique:/refroid|ldr|thermostat|pompe a eau|surchauffe|clim/,
adas:/adas|radar|calibration|acc|autopilot/,camera:/camera|recul|buee/,
telematique:/telemat|ota|esim|connectiv/,tablette:/ecran|tablette|tactile|multimedia|mbux|idrive|sync/,
eclairage:/phare|led|eclairage|feu/,carrosserie:/corrosion|infiltration|etancheite/};
DOM.forEach(function(d){if(t.indexOf(norm(d[1]).split(" ")[0])>=0||(map[d[0]]&&map[d[0]].test(t)))out.push(d[0])});
return out.length?out:["moteur"]}
function ingest(data){var add=0,merge=0,fa=0,rv=0;
if(data&&data.type==="renfort"){
if(data.status==="diffuse"&&(data.version||0)>DIFF.v){DIFF={v:data.version||1,ts:data.ts||Date.now(),status:"diffuse",gen:DIFF.gen,rep:DIFF.rep};
persist();reindex();renderAll();toast("Renfort v"+DIFF.v+" adopté (diffusé par l'administrateur)","te")}
return{add:0,merge:0,fadd:0,radd:0}}
function pv(v){var bn=v.marque||v.brand||v.brandName,mn=v.modele||v.model||v.modelName;
if(!bn||!mn)return;
var my=pYears(v.annee||v.years||v.year),o=fom(nBrand(bn),mn,my[0],my[1]);
var ey=v.engYears?pYears(v.engYears):my;
var hp=parseInt((String(v.puissance||v.hp||v.power||"").match(/\d+/)||[])[0]||"0",10);
var fam=v.motorisation||v.fam||v.motor||v.engine||"Motorisation";
var r=addEngTo(o.m,o.b,fam,hp,v.codeMoteur||v.code||"—",v.typeCarburant||v.fuel||fGuess(fam),
ey[0],ey[1],v.tech||v.notes||"",v.disp||v.battery);
if(r==="add")add++;else if(r==="merge")merge++;
if(Array.isArray(v.dtc)&&v.dtc.length){var id="IMP-"+slug(bn+"-"+mn+"-"+fam+"-"+hp);
if(!FAULTS.some(function(f){return f.id===id})){
FAULTS.push({id:id,scope:"engine",brands:[o.b.id],target:fam,kind:"panne",sev:"moyen",y0:ey[0],y1:ey[1],
titre:"Codes défaut répertoriés — "+fam+" "+hp+" ch",sym:"Codes issus de l'import : "+v.dtc.join(", "),
pro:["Lire les codes et le contexte gelé","Contrôler les organes liés aux codes","Appliquer le protocole constructeur"],
org:v.org||"Voir codes",dtc:v.dtc,src:v.src||"Import base",dom:domGuess(fam+" "+v.dtc.join(" "))});fa++}}}
function pf(f){if(!f||!(f.titre||f.title))return;
var id=f.id||"IMP-F-"+slug(f.titre||f.title).slice(0,40)+"-"+Math.random().toString(36).slice(2,6);
if(FAULTS.some(function(x){return x.id===id}))return;
var dom=(Array.isArray(f.dom)?f.dom:csv(f.dom)).filter(function(d){return DM[d]});
FAULTS.push({id:id,scope:["engine","model","brand","power"].indexOf(f.scope)>=0?f.scope:"brand",
hpv:f.hpv||0,brands:(f.brands||[slug(f.marque||f.brand||"")]).filter(Boolean),target:f.target||f.fam||f.modele||"",
kind:KIND[f.kind]?f.kind:"panne",sev:SEV[f.sev]?f.sev:"moyen",y0:f.y0||2017,y1:f.y1||2027,
titre:f.titre||f.title,sym:f.sym||f.symptome||"",
pro:Array.isArray(f.pro)?f.pro:String(f.pro||f.protocole||"Contrôle constructeur").split("|"),
org:f.org||f.organes||"",dtc:Array.isArray(f.dtc)?f.dtc:csv(f.dtc),src:f.src||f.source||"Import",
dom:dom.length?dom:domGuess((f.titre||"")+" "+(f.sym||""))});fa++}
function pr(r){if(!r||!r.organ||!r.newKm)return;
var id=r.id||"IMP-R-"+slug((r.brands||[]).join("-")+"-"+r.organ).slice(0,50);
if(allRevs().some(function(x){return x.id===id}))return;
REVC.push({id:id,brands:(r.brands||[]).map(slug).filter(Boolean),match:r.match||"",organ:r.organ,
oldKm:+r.oldKm||0,newKm:+r.newKm||0,oldMo:+r.oldMo||0,newMo:+r.newMo||0,src:r.src||"Import",
note:r.note||"",y0:r.y0||2017,y1:r.y1||2027});rv++}
if(Array.isArray(data))data.forEach(function(x){
if(x&&x.organ&&x.newKm)pr(x);else if(x&&(x.titre||x.title)&&!x.marque&&!x.modele)pf(x);else pv(x)});
else if(data&&typeof data==="object"){
if(Array.isArray(data.vehicles))data.vehicles.forEach(pv);
if(Array.isArray(data.experts))data.experts.forEach(pf);
if(Array.isArray(data.faults))data.faults.forEach(pf);
if(Array.isArray(data.revisions))data.revisions.forEach(pr);
if(Array.isArray(data.revsCustom))data.revsCustom.forEach(pr);
if(Array.isArray(data.tiers)&&canW())data.tiers.forEach(function(t){
if(t&&t.name&&!TIERS.some(function(x){return x.device===t.device}))TIERS.push(t)});
if(Array.isArray(data.cat)&&data.cat.length&&data.cat[0].models)data.cat.forEach(function(b){
b.models.forEach(function(m){m.engines.forEach(function(e){
var o=fom(b.name,m.name,m.y0,m.y1);
var r=addEngTo(o.m,o.b,e.fam,e.hp,e.code,e.fuel,e.y0,e.y1,e.tech);
if(r==="add")add++;else if(r==="merge")merge++})})});
["customs","modelsExtra","recalls","tsb"].forEach(function(k){
var arr=data[k];if(!Array.isArray(arr))return;
arr.forEach(function(x){
if(k==="recalls"||k==="tsb"){if(x&&(x.marque||x.brand)&&(x.titre||x.title)){
var bn=nBrand(x.marque||x.brand),mn=x.modele||x.model||"",id="AD-"+k+"-"+slug(bn+mn+(x.titre||x.title)).slice(0,50);
if(!FAULTS.some(function(f){return f.id===id})){var yr=pYears(x.annee||x.years);
FAULTS.push({id:id,scope:mn?"model":"brand",brands:[slug(bn)],target:mn?slug(bn)+"-"+slug(mn):"",
kind:k==="recalls"?"rappel":"tsb",sev:"eleve",y0:yr[0],y1:yr[1],titre:x.titre||x.title,
sym:x.sym||x.detail||"",pro:String(x.pro||"Vérifier éligibilité VIN|Appliquer la procédure constructeur").split("|"),
org:x.org||"",dtc:csv(x.dtc),src:x.src||x.source||"auto-diagnostic",
dom:csv(x.dom).filter(function(d){return DM[d]}).length?csv(x.dom).filter(function(d){return DM[d]}):domGuess((x.titre||"")+" "+(x.sym||""))});fa++}}}
else pv(x)})});
if(data.overrides&&typeof data.overrides==="object")Object.keys(data.overrides).forEach(function(k){
var v=data.overrides[k];if(v&&typeof v==="object")pv(v)})}
reindex();
return{add:add,merge:merge,fadd:fa,radd:rv}}
function importFile(file){if(!canW()){toast("Import réservé au mode administrateur","ba");return}
ovlOn(true);$("ovT").textContent="Import de fichier";$("ovS").textContent=file.name;
var before=EIX.all.length;
$("ovB").textContent=before;$("ovA").textContent="+0";$("ovM").textContent="+0";$("ovAf").textContent=before;
ostep(8,"Lecture du fichier");olog("Lecture : "+file.name,"t");
file.text().then(function(txt){olog(txt.length+" octets lus","s");ostep(24,"Validation JSON");
var data;try{data=JSON.parse(txt);olog("JSON valide","s")}catch(e){throw new Error("JSON invalide : "+e.message)}
ostep(42,"Analyse du format");
var fmt=data&&data.type==="renfort"?"paquet de renfort diffusé":(Array.isArray(data)?"tableau":(data.cat?"export KEV":(data.vehicles?"export véhicules":
(data.customs||data.overrides||data.recalls||data.tiers?"sauvegarde auto-diagnostic":"objet"))));
olog("Format détecté : "+fmt,"i");
var snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC,diff:DIFF});
ostep(60,"Fusion par identifiants");
var r=ingest(data);$("ovA").textContent="+"+r.add;$("ovM").textContent="+"+r.fadd;
olog(r.add+" motorisation(s), "+r.merge+" fusion(s), "+r.fadd+" fiche(s), "+r.radd+" révision(s)","s");
if(fmt==="paquet de renfort diffusé"){ostep(100,"Adoption du renfort");
$("ovRes").innerHTML='<div class="nt ok"><b>Paquet de renfort adopté.</b> Version v'+DIFF.v+" · statut "+DIFF.status+
". Les fiches renfort sont actives par modèle et par puissance.</div>";
$("ovAf").textContent=EIX.all.length;sync();renderDom();renderAll();renderAdm();
toast("Renfort v"+DIFF.v+" intégré","te");return}
if(!r.add&&!r.merge&&!r.fadd&&!r.radd){ostep(100,"Terminé");olog("Fichier valide mais aucune donnée exploitable","w");
$("ovRes").innerHTML='<div class="nt wa"><b>Fichier vide ou sans donnée compatible.</b> Format reconnu ('+esc(fmt)+
") mais tableaux vides. La base de <b>"+nf(before)+"</b> motorisations est <b>conservée intacte</b>.</div>";
$("ovAf").textContent=EIX.all.length;toast("Fichier vide — base conservée","wa");return}
ostep(78,"Sauvegarde");makeBk("import fichier : "+file.name);
UPD.unshift({ts:Date.now(),src:"fichier "+file.name,m:r.add,f:r.fadd,r:r.radd});
persist();ostep(100,"Audit");audit();olog("Intégrité : "+AUDIT.score+"%","s");
$("ovAf").textContent=EIX.all.length;
$("ovRes").innerHTML='<div class="nt ok"><b>Import intégré.</b><br>Motorisations : '+nf(before)+" → <b>"+
nf(EIX.all.length)+"</b> · Fiches : <b>"+nf(FAULTS.length)+"</b> · Révisions : <b>"+nf(allRevs().length)+
"</b><br>Intégrité : <b>"+AUDIT.score+"%</b>.</div>";
sync();renderDom();renderAll();renderAudit();renderAdm();
notify("import","Import fichier : +"+r.add+" motorisations, +"+r.fadd+" fiches","");
toast("Import réussi : +"+r.add+" motorisations","ok",function(){
var d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;DIFF=d.diff||DIFF;reindex();persist();sync();audit();renderDom();renderAll();renderAdm()})
}).catch(function(e){olog("Échec : "+e.message,"e");
$("ovRes").innerHTML='<div class="nt ba"><b>Import interrompu.</b> '+esc(e.message)+
"<br>La base existante n'a pas été modifiée.</div>";toast("Import échoué — base préservée","ba")
}).then(function(){$("ovX").style.display="block"})}
var PACK_URL="https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/pack2024.json";
var RENF_URL="https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/renfort.json";
function updateOnline(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
if(!navigator.onLine){toast("Connexion requise","ba");return}
ovlOn(true);$("ovT").textContent="Mise à jour en ligne";$("ovS").textContent="Renfort diffusé + pack distant + enrichissement local";
var before=EIX.all.length;
$("ovB").textContent=before;$("ovA").textContent="+0";$("ovM").textContent="+0";$("ovAf").textContent=before;
ostep(10,"Renfort diffusé (renfort.json)");
fetch(RENF_URL,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})
.then(function(d){if(d&&d.type==="renfort"&&d.status==="diffuse"&&(d.version||0)>DIFF.v){
DIFF={v:d.version||1,ts:d.ts||Date.now(),status:"diffuse",gen:DIFF.gen,rep:DIFF.rep};persist();reindex();
olog("Renfort v"+DIFF.v+" adopté depuis le dépôt","s")}else olog("Renfort distant identique ou absent","i")})
.catch(function(e){olog("Renfort distant indisponible : "+e.message,"w")})
.then(function(){ostep(30,"Pack distant (pack2024.json)");
var ctl=null,to=null;try{ctl=new AbortController();to=setTimeout(function(){ctl.abort()},12000)}catch(e){}
return fetch(PACK_URL,ctl?{cache:"no-store",signal:ctl.signal}:{cache:"no-store"}).then(function(r){
if(to)clearTimeout(to);if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(function(data){
olog("Pack distant trouvé","s");ostep(50,"Fusion du pack distant");
var res=ingest(data);$("ovA").textContent="+"+res.add;$("ovM").textContent="+"+res.fadd;
if(res.add||res.fadd||res.radd){UPD.unshift({ts:Date.now(),src:"pack distant",m:res.add,f:res.fadd,r:res.radd});makeBk("mise à jour en ligne")}
persist()}).catch(function(e){if(to)clearTimeout(to);olog("Pack distant indisponible : "+e.message,"w")})})
.then(function(){ostep(70,"Enrichissement local massif");
setTimeout(function(){ovlOn(false);enrich(false)},400)});
}
function exportDB(){if(!canW()){toast("Export réservé au mode administrateur","ba");return}
var p={app:"KEV FUSION 2026",version:22,exported:new Date().toISOString(),updates:UPD,enrichment:ENR,diffusion:DIFF,
integrity:AUDIT?{score:AUDIT.score,bad:AUDIT.bad,warn:AUDIT.warn}:null,
domains:DOM.map(function(d){return{id:d[0],name:d[1]}}),cat:CAT,faults:FAULTS,protocols:rules(null),
revisions:REVS0,revisionsCustom:REVC,tiers:TIERS,notes:NOTES,views:VIEWS,dtc:DTC};
var b=new Blob([JSON.stringify(p)],{type:"application/json"}),a=el("a");
a.href=URL.createObjectURL(b);a.download="kev-fusion-2026-"+new Date().toISOString().slice(0,10)+".json";
document.body.appendChild(a);a.click();
setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},400);toast("Export complet téléchargé","ok")}

/* ═══ AUTO-ENRICHISSEMENT ═══ */
var MISS={
vauxhall:["Vauxhall","GB",`
corsa~Corsa F~19~27~C~1.2 Turbo|100,130|EB2|E|19-25;1.2 Hybrid|100,136|EB2LTEDH|H|23-27;Électrique|136:50,156:51|ZKX|EV|20-27
astra~Astra L~21~27~K~1.2 Turbo|110,130|EB2|E|21-25;1.6 PHEV|180,225|EP6|P|21-27;Électrique|156:54|EM0|EV|23-27
mokka~Mokka B~20~27~U~1.2 Turbo|100,130|EB2|E|20-25;Électrique|136:50,156:54|ZKX|EV|20-27`],
ldv:["LDV","GB",`
deliver9~eDeliver 9~21~27~G~Électrique|204:88.5|EV-MXD9|EV|21-27
t60~T60~18~27~P~2.0 Turbo Diesel|163|GW4D20|D|18-27`],
wuling:["Wuling","CN",`
hongguang~Hongguang Mini EV~22~27~Y~Électrique|27:9.3,41:13.9|EV-WUL|EV|22-27
bingo~Bingo~24~27~C~Électrique|68:31.9,102:37.9|EV-WUL|EV|24-27`],
roewe:["Roewe","CN",`
i5~i5~23~27~B~Électrique|184:61.1|EV-RW|EV|23-27
rx5~RX5~23~27~E~1.5 Turbo|181|15E4E|E|23-27`],
geometry:["Geometry","CN",`
a~A~23~27~B~Électrique|204:53,204:70|EV-GEO|EV|23-27
panda~Panda Mini~24~27~Y~Électrique|41:17|EV-GEO|EV|24-27`],
luxeed:["Luxeed","CN",`
s7~S7~24~27~Z~Électrique|496:100|EV-LX|EV|24-27
r7~R7~25~27~N~Électrique|496:100|EV-LX|EV|25-27`],
fangchengbao:["Fangchengbao","CN",`
bao5~Bao 5~24~27~W~1.5 DMO PHEV|505|BYD-DMI|P|24-27
bao8~Bao 8~25~27~W~2.0 DMO PHEV|697|BYD-DMI|P|25-27`],
aiways:["Aiways","NL",`
u5~U5~20~25~E~Électrique|204:63|EV-AIW|EV|20-25
u6~U6~22~25~N~Électrique|218:72|EV-AIW|EV|22-25`],
im:["IM Motors","CN",`
l6~L6~24~27~Z~Électrique|475:100|EV-IM|EV|24-27
ls6~LS6~24~27~W~Électrique|578:100|EV-IM|EV|24-27`],
proton:["Proton","MY",`
x50~X50~22~27~U~1.5 Turbo|150,177|JLH-3G15|E|22-27
x70~X70~22~27~E~1.8 Turbo|184|JLE-4G18|E|22-27`],
lada:["Lada","RU",`
vesta~Vesta~17~27~B~1.6|106,113|21129|E|17-27
niva~Niva Travel~17~27~U~1.7|83|21214|E|17-27`],
lincoln:["Lincoln","US",`
corsair~Corsair~20~27~E~2.0 Turbo|250|EcoBoost|E|20-27;2.5 PHEV|266|BGCA|P|20-24
aviator~Aviator~20~27~W~3.0 V6|400|EcoBoost|E|20-27`],
buick:["Buick","US",`
encore~Encore GX~20~26~U~1.3 Turbo|155|L3Z|E|20-26
electra~Electra E5~24~27~J~Électrique|245:68|EV-ULT|EV|24-27`],
hummer:["Hummer","US",`
evpickup~EV Pickup~23~27~P~Électrique|635:212,1000:212|EV-ULT|EV|23-27
evsuv~EV SUV~24~27~W~Électrique|570:200,830:200|EV-ULT|EV|24-27`]
};
var LADDER={
EB2:[75,82,100,110,130,155],EB2LTEDH:[100,136,145,156],DV5:[100,110,120,130],
DW10:[120,130,145,150,160,163,177,180],EP6:[150,156,163,165,175,180,200,205,208,225,250,270],
DKL:[95,110,115],DPCA:[130,150],DUV:[130,150],DSU:[115,150,200],DTU:[150,193],DFG:[120,150,190,200,240],
CZP:[190,220,230,245,265,280,300,310],DNNA:[245,265,300],DNF:[310,320,333],
B38:[102,136,140,156],B48:[156,178,184,192,204,245,252,258,306],B58:[340,374,381,387],
B47:[116,150,190,211],B57:[265,286,298,300,320,340],S58:[460,480,510,530],
M282:[136,163],M254:[170,190,204,258],M256:[367,381,408,435],
OM654:[150,163,190,194,197,200,220,265,269],OM651:[136,163,170,204],OM656:[330,340,350],
M15A:[116,125,130],M20A:[170,184,196,197,199],A25A:[218,222,236,240,243,244,306,309,320,342],
G3LC:[90,100,110,120],G4FT:[150,180,198],G4LE:[141,183,215,230],G4KH:[204,247,250,275,280],
D4FE:[115,136],B3CA:[100,125,140,200],B7JA:[125,155],BKF:[105,130,170,185],
BGCA:[190,225,243],LEB:[109,131],LFA:[184],K20C:[320,329],
K9K:[75,85,90,95,110,115],M9R:[110,130,150,170],M9T:[130,150,165,180],H4M:[140,145,155],
HR13:[140,150,158,160],KR15:[190,204,213],PT204:[200,249,250,300],GME:[200,268,280],
"552":[95,120,130,150,180,190,210],GSE:[70,100,130,150,180],SQR:[147,156,185,186]};
var REVK={
EB2:["Courroie distribution humide",180000,100000,120,72],EB2LTEDH:["Courroie accessoires + galets",0,90000,0,72],
DV5:["Chaîne AAC 7 vers 8 mm",0,120000,0,96],DW10:["Kit distribution + pompe eau",200000,160000,120,96],
EP6:["Contrôle chaîne + tendeur",0,120000,0,96],DKL:["Contrôle chaîne + tendeur",0,150000,0,120],
DPCA:["Courroie distribution + galets",210000,180000,120,96],DSU:["Kit distribution + pompe eau",210000,180000,120,96],
CZP:["Contrôle chaîne + tendeur",0,120000,0,96],B47:["Contrôle chaîne côté boîte",0,150000,0,120],
B48:["Bougies allumage",60000,40000,0,48],B58:["Bougies allumage",60000,40000,0,48],
M282:["Vidange huile + filtre",30000,20000,24,12],M254:["Contrôle 48 V + DC-DC",0,60000,0,48],
OM654:["Filtre / injecteur AdBlue",120000,80000,0,60],OM651:["Contrôle chaîne + patins",0,180000,0,120],
G4FJ:["Vidange huile anti-LSPI",15000,7500,12,6],G4FT:["Vidange huile + filtre",15000,10000,12,12],
D4FE:["Nettoyage / contrôle FAP",120000,90000,0,72],B3CA:["Courroie distribution humide",240000,150000,120,72],
BKF:["Chaîne distribution",240000,160000,120,96],K9K:["Kit distribution + pompe eau",160000,120000,72,60],
H5F:["Vidange huile + filtre",30000,15000,24,12],H5H:["Vidange huile + filtre",30000,20000,24,12],
M9T:["Contrôle chaîne + injecteurs",0,150000,0,96],PT204:["Contrôle chaîne distribution",0,150000,0,96],
B4204:["Kit distribution + pompe eau",240000,160000,120,96]};
var DTCX={
P0010:["Circuit commande AAC A","Électrovanne VVT, faisceau","Résistance et commande"],
P0013:["Circuit commande AAC B","Électrovanne VVT, faisceau","Résistance et commande"],
P0031:["Sonde O2 amont chauffage bas","Résistance, relais, masse","Mesure résistance chauffage"],
P0036:["Sonde O2 aval chauffage","Résistance, relais, faisceau","Résistance chauffage aval"],
P0068:["Corrélation MAP / TPS","Fuite admission, papillon","Comparaison charge / papillon"],
P0100:["Débitmètre MAF circuit","MAF, alimentation, faisceau","Signal MAF, alimentation"],
P0102:["MAF signal bas","MAF encrassé, fuite admission","Nettoyage MAF, test fumée"],
P0117:["Température LDR signal bas","Sonde LDR, faisceau","Résistance vs température"],
P0118:["Température LDR signal haut","Sonde LDR, circuit ouvert","Résistance vs température"],
P0130:["Sonde O2 amont circuit","Sonde, faisceau, échappement","Signal sonde, fuite"],
P0133:["Sonde O2 amont réponse lente","Sonde vieillie","Temps de réponse"],
P0170:["Correction carburant hors plage","Prise air, injecteurs, MAF","Corrections court/long terme"],
P0174:["Mélange pauvre rangée 2","Prise air, injecteurs","Test fumée, sonde O2"],
P0236:["Capteur pression suralimentation","Capteur, fuite durite","Comparaison consigne/réel"],
P0243:["Électrovanne wastegate circuit","Électrovanne, faisceau","Résistance et commande"],
P0403:["Commande EGR circuit","Moteur EGR, faisceau","Résistance et commande"],
P0441:["Canister purge débit incorrect","Électrovanne purge, durite","Test commande purge"],
P0455:["Fuite évaporative importante","Bouchon réservoir, durite","Test fumée EVAP"],
P0507:["Ralenti trop haut","Prise air, papillon","Test fumée, réapprentissage"],
P0508:["Ralenti trop bas","Papillon encrassé","Nettoyage, apprentissage"],
P0601:["Mémoire calculateur checksum","Calculateur, alimentation","Reprogrammation"],
P0641:["Tension référence capteurs A","Court-circuit, capteur","Mesure 5 V référence"],
P0685:["Relais alimentation moteur","Relais, masses","Test relais et masses"],
P0705:["Capteur position levier boîte","Capteur, faisceau","Signal PRNDL"],
P0711:["Capteur température ATF plage","Capteur, faisceau","Résistance vs température"],
P0720:["Capteur régime sortie boîte","Capteur, faisceau","Signal capteur"],
P0A0A:["Isolement HV circuit","Câblage HV, capteur","Mégohmmètre par branche"],
P0A0D:["Contacteur HV circuit","Contacteur, commande","Test commande contacteurs"],
P0A1F:["Batterie énergie performance","Modules, BMS","SOH, delta cellules"],
P0A78:["Onduleur performance","Onduleur, refroidissement","Températures, codes internes"],
P0A94:["Convertisseur DC-DC performance","DC-DC, 12 V","Tension sortie et charge"],
P0C2F:["Refroidissement batterie débit","Pompe LDR, échangeur","Débit et températures"],
P0C76:["Chargeur embarqué circuit","OBC, alimentation","Test AC et codes OBC"],
P0D0A:["Charge DC verrouillage","Verrou, capteur","Test verrouillage"],
P0D8F:["Charge AC signal pilote","CP, câble, borne","Mesure CP / PP"],
P1600:["Antidémarrage communication","Transpondeur, antenne","Lecture clé et antenne"],
P2100:["Papillon motorisé circuit","Moteur papillon, faisceau","Résistance et commande"],
P2135:["Corrélation TPS A / B","Papillon, faisceau","Comparaison pistes"],
P2261:["Turbo bypass performance","Vanne bypass, actionneur","Commande et course"],
U0073:["Bus CAN coupure","Faisceau, terminaison","Oscilloscope CAN"],
U0126:["Perte communication angle volant","Capteur, CAN","CAN et alimentation"],
U0151:["Perte communication SRS","Faisceau, calculateur SRS","CAN et alimentations"],
U1000:["CAN défaut réseau","Faisceau, masses","Oscilloscope CAN"],
C1000:["Direction assistée interne","EPS, alimentation","Codes EPS détaillés"],
C1234:["Capteur angle volant","Capteur, calibration","Calibration capteur"]};
function ensureEnrPanel(){if($("enrPanel"))return;
var host=$("v-adm"),last=host.querySelector(".pn:last-of-type");
var p=el("div","pn pd");p.id="enrPanel";p.style.marginBottom="16px";p.style.borderColor="rgba(74,222,128,.35)";
p.innerHTML='<div class="sh"><div class="si ic-gr"><svg class="ic"><use href="#i-brain"/></svg></div>'+
'<div><h2>Auto-enrichissement massif</h2><div class="sb">Exécuté automatiquement à chaque ouverture administrateur</div></div><span class="sp"></span>'+
'<button class="sw" id="enrAuto" type="button" aria-pressed="true"><span class="t2"></span>Automatique</button>'+
'<button class="bt gr" id="enrRun" type="button"><svg class="ic"><use href="#i-brain"/></svg>Enrichir maintenant</button>'+
'<button class="bt rd" id="enrUndo" type="button" disabled><svg class="ic"><use href="#i-refresh"/></svg>Annuler</button></div>'+
'<div class="g4" id="enrStats" style="margin-bottom:14px"></div>'+
'<div id="enrLog" style="display:flex;flex-direction:column;gap:8px"></div>'+
'<div class="nt ok" style="margin-top:13px">Complète marques/modèles manquants, puissances réelles par famille, plages d\'années, '+
'fiches par marque et domaine, extension des fiches moteur, fiches modèles électriques, intervalles révisés et DTC.</div>';
host.insertBefore(p,last);
$("enrAuto").onclick=function(){ENR.on=!ENR.on;this.setAttribute("aria-pressed",String(ENR.on));persist();renderEnrPanel();
toast(ENR.on?"Auto-enrichissement activé à chaque lancement":"Auto-enrichissement désactivé",ENR.on?"ok":"wa")};
$("enrRun").onclick=function(){safe(function(){enrich(false)},"enrichissement manuel")};
$("enrUndo").onclick=function(){if(!enrSnap){toast("Rien à annuler","in");return}
var d=JSON.parse(enrSnap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;enrSnap=null;reindex();persist();
audit();renderAudit();sync();renderDom();renderAll();renderAdm();toast("Dernier enrichissement annulé","wa")}}
function renderEnrPanel(){if(!canW()||!$("enrPanel"))return;
var r=ENR.rep||{};
$("enrAuto").setAttribute("aria-pressed",String(!!ENR.on));
$("enrUndo").disabled=!enrSnap;
$("enrStats").innerHTML=[["Dernier passage",ENR.ts?dtT(ENR.ts):"jamais","cy"],
["Fiches générées",nf(FAULTS.filter(function(f){return /^GEN-/.test(f.id)}).length),"amH"],
["Motorisations",nf(EIX.all.length),"gr"],["DTC",nf(Object.keys(DTC).length),"mg"]]
.map(function(p){return'<div class="st"><div class="sv3" style="font-size:18px;color:var(--'+p[2]+')">'+esc(String(p[1]))+'</div><div class="sl">'+p[0]+'</div></div>'}).join("");
$("enrLog").innerHTML=ENR.rep?[["Marques / modèles ajoutés",r.cat],["Puissances complétées",r.pow],
["Plages d'années alignées",r.yr],["Fiches marque × domaine",r.br],["Fiches moteur étendues",r.fam],
["Fiches modèles électriques",r.ev],["Intervalles révisés",r.rev],["Codes DTC ajoutés",r.dtc]]
.map(function(p){return'<div class="sv"><span class="gr2"><svg class="ic"><use href="#i-check"/></svg></span>'+
'<div style="flex:1;min-width:0"><div style="font-weight:750;font-size:12.5px">'+esc(p[0])+'</div></div>'+
'<b class="mo" style="color:var(--gr)">+'+nf(p[1]||0)+'</b></div>'}).join(""):
'<div class="nt">Aucun enrichissement exécuté pour l\'instant.</div>'}
function enrich(auto){
if(enrBusy)return;if(!canW()){if(!auto)toast("Réservé à l'administrateur","ba");return}
enrBusy=true;
enrSnap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC});
var res={cat:0,pow:0,yr:0,br:0,fam:0,ev:0,rev:0,dtc:0};
var fids={};FAULTS.forEach(function(f){fids[f.id]=1});
var rids={};allRevs().forEach(function(r){rids[r.id]=1});
ovlOn(true);$("ovT").textContent=auto?"Auto-enrichissement au lancement":"Enrichissement massif";
$("ovS").textContent="Marques · modèles · puissances · pannes · campagnes · TSB · intervalles · DTC";
var b0=EIX.all.length,f0=FAULTS.length,r0=allRevs().length,d0=Object.keys(DTC).length;
$("ovB").textContent=nf(b0);$("ovA").textContent="+0";$("ovM").textContent="+0";$("ovAf").textContent=nf(b0);
ostep(4,"Initialisation");olog("Base avant : "+nf(b0)+" motorisations, "+nf(f0)+" fiches, "+nf(r0)+" révisions","t");
var tasks=[
["Marques et modèles manquants",function(){
Object.keys(MISS).forEach(function(bid){var m=MISS[bid],b=B(bid);
if(!b){b={id:bid,name:m[0],country:m[1],models:[]};CAT.push(b)}
parseDSL(m[2],b).forEach(function(nm){var ex=null;b.models.forEach(function(x){if(x.id===nm.id)ex=x});
if(!ex){b.models.push(nm);res.cat+=nm.engines.length;return}
nm.engines.forEach(function(e){if(addEngTo(ex,b,e.fam,e.hp,e.code,e.fuel,e.y0,e.y1,e.tech)==="add")res.cat++})})});
reindex()}],
["Puissances réelles par famille",function(){
CAT.forEach(function(b){b.models.forEach(function(m){
var have={};m.engines.forEach(function(e){var c=String(e.code||"").toUpperCase();
Object.keys(LADDER).forEach(function(k){if(c.indexOf(k)===0){if(!have[k])have[k]=[];have[k].push(e)}})});
Object.keys(have).forEach(function(k){var ref=have[k][0],hps=have[k].map(function(e){return e.hp});
LADDER[k].forEach(function(hp){if(hps.indexOf(hp)>=0)return;
if(addEngTo(m,b,ref.fam,hp,ref.code,ref.fuel,ref.y0,ref.y1,ref.tech)==="add")res.pow++})})})});
reindex()}],
["Plages d'années moteur",function(){
CAT.forEach(function(b){b.models.forEach(function(m){m.engines.forEach(function(e){
if(e.y0>m.y0){e.y0=m.y0;res.yr++}
if(e.y1<m.y1&&m.y1<=YMAX){e.y1=m.y1;res.yr++}})})});reindex()}],
["Fiches marque × domaine",function(){
var covered={};FAULTS.forEach(function(f){if(f.scope==="brand")(f.brands||[]).forEach(function(b){
(f.dom||[]).forEach(function(d){covered[b+"|"+d]=1})})});
CAT.forEach(function(b){var eng=EIX.byBrand[b.id]||[];if(!eng.length)return;
var ok={};eng.forEach(function(e){rules(e).forEach(function(r){ok[r.id]=r})});
Object.keys(ok).forEach(function(rid){var r=ok[rid],dd=(r.dom||[])[0];
if(!dd||covered[b.id+"|"+dd])return;
var id="GEN-B-"+b.id+"-"+rid;if(fids[id])return;fids[id]=1;
FAULTS.push({id:id,scope:"brand",brands:[b.id],target:"",kind:r.kind,sev:r.sev,y0:YMIN,y1:YMAX,
titre:b.name+" — "+r.titre,sym:r.sym+" Gamme "+b.name+", toutes motorisations concernées.",
pro:r.pro.slice(),org:r.org,dtc:r.dtc.slice(),src:"Auto-enrichissement · protocole "+b.name,dom:r.dom.slice()});
res.br++;covered[b.id+"|"+dd]=1})});reindex()}],
["Extension des fiches moteur",function(){
FAULTS.filter(function(f){return f.scope==="engine"&&!/^GEN-/.test(f.id)}).forEach(function(f){
var t=slug(f.target);
Object.keys(EIX.byFam).forEach(function(k){var p=k.split("|");
if(p[1]!==t)return;var bid=p[0];if((f.brands||[]).indexOf(bid)>=0)return;
var id="GEN-E-"+f.id+"-"+bid;if(fids[id])return;
var eng=EIX.byFam[k],y0=2027,y1=2017;
eng.forEach(function(e){y0=Math.min(y0,e.y0);y1=Math.max(y1,e.y1)});
if(y1<y0)return;fids[id]=1;
FAULTS.push({id:id,scope:"engine",brands:[bid],target:f.target,kind:f.kind,sev:f.sev,
y0:Math.max(f.y0,y0),y1:Math.min(f.y1,y1),titre:f.titre,sym:f.sym,pro:f.pro.slice(),org:f.org,
dtc:f.dtc.slice(),src:f.src+" · extension "+(B(bid)?B(bid).name:bid),dom:f.dom.slice()});res.fam++})});
reindex()}],
["Fiches modèles électriques",function(){
var T=[["charge","Charge AC / DC et verrou de trappe","Charge interrompue, trappe non verrouillée, puissance bridée, OBC CCS.","Lire codes OBC et verrou|Tester plusieurs bornes AC et DC|Contrôler câble CP PP et broches|Contrôler contacteurs et précharge|Revalider courbe de charge","OBC, contacteurs, verrou, connecteur","P0D11,P0C76,P0D0A,P0D8F","eleve"],
["hv","Isolement et équilibrage pack haute tension","Alerte isolement, limitation puissance, delta cellules, SOH en baisse.","Lire isolement et delta cellules|Cycle lent complet d'équilibrage|Mégohmmètre par branche habilitée|Contrôler humidité connecteurs HV|Mise à jour BMS et revalidation","Pack HV, BMS, contacteurs, câblage","P0AA6,P0AFA,P0A0A,P0BBD","critique"],
["thermique","Pompe à chaleur et boucle de refroidissement pack","Chauffage faible, autonomie hivernale réduite, charge DC lente à froid.","Lire codes circuit thermique|Contrôler charge fluide et compresseur|Tester vannes et échangeur|Vérifier préconditionnement|Mise à jour gestion thermique","Pompe à chaleur, vannes, échangeur, sondes","P0C00,P0C2F,P0A7A","moyen"],
["telematique","OTA, télématique et décharge 12 V","OTA en échec, écran figé, 12 V à plat après immobilisation, services perdus.","Relever version et journaux OTA|Mesurer courant de repos après veille|Contrôler SOH 12 V et DC-DC|Re-flasher selon procédure|Revalider services et écran","TCU, head unit, 12 V, DC-DC","U0101,U0121,P0562,U0111","moyen"],
["freinage","Freinage régénératif et corrosion des disques","Bruit au freinage, freinage arrière faible, à-coups en décélération, disques corrodés.","Mesurer épaisseur et voile des disques|Contrôler mobilité étriers et colonnettes|Calibrer le régénératif|Nettoyer et graisser|Remplacer par essieu puis roder","Disques, plaquettes, étriers, logiciel freinage","C1365,U0121","moyen"]];
CAT.forEach(function(b){b.models.forEach(function(m){
var ev=m.engines.filter(function(e){return e.fuel==="EV"});if(!ev.length)return;
var y0=2027,y1=2017;ev.forEach(function(e){y0=Math.min(y0,e.y0);y1=Math.max(y1,e.y1)});
T.forEach(function(t){var id="GEN-V-"+b.id+"-"+m.id+"-"+t[0];if(fids[id])return;fids[id]=1;
FAULTS.push({id:id,scope:"model",brands:[b.id],target:m.id,kind:"tsb",sev:t[6],y0:y0,y1:y1,
titre:b.name+" "+m.name+" — "+t[1],sym:t[2],pro:t[3].split("|"),org:t[4],dtc:csv(t[5]),
src:"Auto-enrichissement · plateforme EV",dom:[t[0]]});res.ev++})})});reindex()}],
["Intervalles d'entretien révisés",function(){
CAT.forEach(function(b){
[["Liquide de frein DOT 4",60000,60000,24,24],["Filtre d'habitacle charbon actif",30000,15000,24,12],
["Liquide de refroidissement",120000,100000,120,60],["Courroie d'accessoires + galets",120000,90000,120,72]]
.forEach(function(u){var id="GEN-R-"+b.id+"-"+slug(u[0]);if(rids[id])return;rids[id]=1;
REVC.push({id:id,brands:[b.id],match:"",organ:u[0],oldKm:u[1],newKm:u[2],oldMo:u[3],newMo:u[4],
src:"Auto-enrichissement · protocole atelier",note:"Double échéance km et calendaire, à confirmer au VIN.",y0:2017,y1:2027});res.rev++});
var fams={};(EIX.byBrand[b.id]||[]).forEach(function(e){var c=String(e.code||"").toUpperCase();
Object.keys(REVK).forEach(function(k){if(c.indexOf(k)===0)fams[k]=1})});
Object.keys(fams).forEach(function(k){var v=REVK[k],id="GEN-R-"+b.id+"-"+k;if(rids[id])return;rids[id]=1;
REVC.push({id:id,brands:[b.id],match:k,organ:v[0],oldKm:v[1],newKm:v[2],oldMo:v[3],newMo:v[4],
src:"Auto-enrichissement · TSB famille "+k,note:"Intervalle révisé appliqué à la famille "+k+" sur la gamme "+b.name+".",y0:2017,y1:2027});res.rev++})})}],
["Dictionnaire DTC",function(){Object.keys(DTCX).forEach(function(k){if(DTC[k])return;DTC[k]=DTCX[k];res.dtc++})}]
];
var i=0;
function step(){
if(i>=tasks.length){
reindex();ENR.ts=Date.now();ENR.rep=res;
UPD.unshift({ts:ENR.ts,src:auto?"auto-enrichissement (lancement admin)":"enrichissement manuel",
m:res.cat+res.pow,f:res.br+res.fam+res.ev,r:res.rev});
while(UPD.length>12)UPD.pop();
var ok=persist();
ostep(100,"Audit d'intégrité");audit();
$("ovAf").textContent=nf(EIX.all.length);
var tot=res.cat+res.pow+res.br+res.fam+res.ev+res.rev+res.dtc;
olog("Ajouts : "+nf(res.cat)+" catalogue, "+nf(res.pow)+" puissances, "+nf(res.br+res.fam+res.ev)+" fiches, "+nf(res.rev)+" intervalles, "+nf(res.dtc)+" DTC",tot?"s":"w");
olog("Intégrité : "+AUDIT.score+"% · base "+nf(EIX.all.length)+" motorisations / "+nf(FAULTS.length)+" fiches","s");
$("ovA").textContent="+"+nf(res.cat+res.pow);$("ovM").textContent="+"+nf(res.br+res.fam+res.ev);
$("ovRes").innerHTML='<div class="nt '+(tot?"ok":"in")+'"><b>'+(tot?"Enrichissement massif terminé.":"Base déjà complète — aucun ajout nécessaire.")+
'</b><br>Motorisations : '+nf(b0)+" → <b>"+nf(EIX.all.length)+"</b> · Fiches : "+nf(f0)+" → <b>"+nf(FAULTS.length)+
"</b> · Révisions : "+nf(r0)+" → <b>"+nf(allRevs().length)+"</b> · DTC : "+nf(d0)+" → <b>"+nf(Object.keys(DTC).length)+
"</b><br>Intégrité : <b>"+AUDIT.score+"%</b>"+(ok?"":" · <b>stockage saturé, données en mémoire</b>")+"</div>";
sync();renderDom();renderAll();renderAudit();renderAdm();renderEnrPanel();
safe(function(){K.set(selfCheck())},"auto-vérification");
enrBusy=false;$("ovX").style.display="block";
if(tot){notify("import","Auto-enrichissement : +"+nf(res.cat+res.pow)+" motorisations, +"+nf(res.br+res.fam+res.ev)+" fiches","");
toast("Enrichissement : +"+nf(res.cat+res.pow)+" motorisations, +"+nf(res.br+res.fam+res.ev)+" fiches","ok",
function(){if(!enrSnap)return;var d=JSON.parse(enrSnap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;enrSnap=null;
reindex();persist();audit();renderAudit();sync();renderDom();renderAll();renderAdm();toast("Enrichissement annulé","in")})}
if(auto)setTimeout(function(){if($("ovX").style.display!=="none")ovlOn(false)},1600);
return}
var t=tasks[i++];ostep(4+i*12,t[0]);safe(t[1],t[0]);olog(t[0]+" — terminé","s");setTimeout(step,16)}
setTimeout(step,60)}
window.KF_ENRICH=function(){enrich(false)};

/* ═══ RENFORT MASSIF + DIFFUSION AUX TIERS ═══ */
function diffReport(){var perDom={},variants=0,models={};
EIX.all.forEach(function(e){variants++;models[e.brand+"|"+e.model]=1;
virts(e).forEach(function(f){var d=f.dom[0];perDom[d]=(perDom[d]||0)+1})});
return{variants:variants,models:Object.keys(models).length,perDom:perDom,total:virtCount()}}
function ensureDiffPanel(){if($("diffPanel"))return;
var host=$("v-adm"),ref=$("enrPanel")||host.querySelector(".pn:last-of-type");
var p=el("div","pn pd");p.id="diffPanel";p.style.marginBottom="16px";p.style.borderColor="rgba(45,212,191,.4)";
p.innerHTML='<div class="sh"><div class="si ic-te"><svg class="ic"><use href="#i-send"/></svg></div>'+
'<div><h2>Renfort massif &amp; diffusion aux tiers</h2><div class="sb">Pannes de tout ordre, corrélées par modèle ET par motorisation/puissance</div></div><span class="sp"></span>'+
'<button class="bt vi" id="dfGen" type="button"><svg class="ic"><use href="#i-brain"/></svg>Générer le renfort</button>'+
'<button class="bt gr" id="dfVal" type="button" disabled><svg class="ic"><use href="#i-check"/></svg>Valider &amp; intégrer</button>'+
'<button class="bt te" id="dfDiff" type="button" disabled><svg class="ic"><use href="#i-send"/></svg>Diffuser aux tiers</button>'+
'<button class="bt rd" id="dfRev" type="button" disabled><svg class="ic"><use href="#i-ban"/></svg>Révoquer</button></div>'+
'<div class="g4" id="dfStats" style="margin-bottom:14px"></div>'+
'<div id="dfDom" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>'+
'<div id="dfLog" style="display:flex;flex-direction:column;gap:8px"></div>'+
'<div class="nt in" style="margin-top:13px"><b>Fonctionnement :</b> « Générer » calcule le renfort extrême (tablettes, combiné, sièges, éclairage, portes, clé, 12 V/48 V, HV, charge, thermique/clim, ADAS, caméras, télématique/OTA, freinage, ABS, airbag, ceintures, trains, géométrie, carrosserie, transmission, NVH, moteur, injection, allumage, turbo, dépollution, distribution, autonomie) pour <b>chaque motorisation et chaque puissance</b>. '+
'« Valider &amp; intégrer » active le renfort dans la base et matérialise le véhicule sélectionné. '+
'« Diffuser aux tiers » publie le paquet versionné : notification à tous les tiers, export automatique du fichier <span class="mo">renfort</span>, adoption à distance et à l\'import. Les tiers reçoivent le renfort <b>en lecture seule</b>. « Révoquer » coupe la diffusion.</div>';
host.insertBefore(p,ref.nextSibling);
$("dfGen").onclick=function(){safe(genDiff,"génération renfort")};
$("dfVal").onclick=function(){safe(valDiff,"validation renfort")};
$("dfDiff").onclick=function(){safe(diffuse,"diffusion tiers")};
$("dfRev").onclick=function(){if(!canW())return;
DIFF.status="revoked";persist();reindex();renderAll();renderDiffPanel();
notify("revoke","Renfort v"+DIFF.v+" révoqué par l'administrateur","");
toast("Diffusion révoquée — renfort désactivé chez les tiers","wa")}}
function renderDiffPanel(){if(!canW()||!$("diffPanel"))return;
var st={none:"Aucun renfort",gen:"Généré — en attente de validation",valide:"Validé — intégré",diffuse:"Diffusé aux tiers",revoked:"Révoqué"}[DIFF.status]||DIFF.status;
$("dfVal").disabled=!(DIFF.status==="gen"||DIFF.status==="revoked");
$("dfDiff").disabled=DIFF.status!=="valide";
$("dfRev").disabled=DIFF.status!=="diffuse";
$("dfStats").innerHTML=[["Statut",st,DIFF.status==="diffuse"?"te":DIFF.status==="valide"?"gr":DIFF.status==="gen"?"amH":"cy"],
["Version",DIFF.v||"—","vi"],["Fiches renfort / motorisation",DIFF.rep&&DIFF.rep.perDom?nf(Object.keys(DIFF.rep.perDom).reduce(function(a,k){return a+DIFF.rep.perDom[k]},0)/Math.max(1,DIFF.rep.variants)):"—","mg"],
["Couverture",DIFF.rep?nf(DIFF.rep.variants)+" motorisations · "+nf(DIFF.rep.models)+" modèles":"—","cy"]]
.map(function(p){return'<div class="st"><div class="sv3" style="font-size:17px;color:var(--'+p[2]+')">'+esc(String(p[1]))+'</div><div class="sl">'+p[0]+'</div></div>'}).join("");
var box=$("dfDom");box.innerHTML="";
if(DIFF.rep&&DIFF.rep.perDom){DOM.forEach(function(dd){var n=DIFF.rep.perDom[dd[0]];if(!n)return;
var b=el("span","pl");b.style.borderColor="var(--"+dd[3]+")";b.style.color="var(--"+CV[dd[3]]+")";
b.innerHTML='<svg class="ic"><use href="#'+dd[2]+'"/></svg>'+esc(dd[1])+' <b class="mo">'+nf(n)+'</b>';box.appendChild(b)})}
$("dfLog").innerHTML=DIFF.ts?'<div class="sv"><span class="gr2"><svg class="ic"><use href="#i-clock"/></svg></span><div style="flex:1;min-width:0">'+
'<div style="font-weight:750;font-size:13px">Renfort v'+DIFF.v+' — '+st+'</div><div class="mi">'+dtT(DIFF.ts)+
' · '+nf(DIFF.rep?DIFF.rep.total:0)+' fiches virtuelles corrélées par puissance</div></div><span class="pl '+(DIFF.status==="diffuse"?"si":"se")+'">'+DIFF.status+'</span></div>':
'<div class="nt">Aucun renfort généré. Cliquez sur « Générer le renfort ».</div>'}
function genDiff(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
ovlOn(true);$("ovT").textContent="Génération du renfort massif";
$("ovS").textContent="Analyse de chaque motorisation et chaque puissance, tous domaines";
$("ovB").textContent=nf(EIX.all.length);$("ovA").textContent="+0";$("ovM").textContent="+0";$("ovAf").textContent=nf(EIX.all.length);
var rep=null,i=0,doms=DOM.map(function(d){return d[0]});
function step(){
if(i>=doms.length){DIFF.rep=rep;DIFF.gen=Date.now();
if(DIFF.status==="none"||DIFF.status==="revoked")DIFF.status="gen";
persist();reindex();
ostep(100,"Rapport de couverture");
$("ovA").textContent="+"+nf(rep.total);$("ovM").textContent=nf(rep.models)+" modèles";
$("ovAf").textContent=nf(EIX.all.length);
$("ovRes").innerHTML='<div class="nt ok"><b>Renfort généré : '+nf(rep.total)+' fiches virtuelles</b> corrélées par modèle et par puissance sur '+
nf(rep.variants)+' motorisations ('+nf(rep.models)+' modèles).<br>Statut : <b>'+DIFF.status+
'</b>. Validez puis diffusez aux tiers.</div>';
renderDiffPanel();renderAll();enrBusy=false;$("ovX").style.display="block";
toast("Renfort généré : "+nf(rep.total)+" fiches par puissance","ok");return}
var d=doms[i];ostep(4+i*(92/doms.length),"Domaine : "+(DM[d]?DM[d].n:d));
if(!rep){rep={variants:0,models:0,perDom:{},total:0};var rr=diffReport();rep=rr;
i=doms.length;setTimeout(step,30);return}
setTimeout(step,10)}
setTimeout(step,40)}
function valDiff(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
if(DIFF.status!=="gen"&&DIFF.status!=="revoked"){toast("Générez d'abord le renfort","wa");return}
DIFF.status="valide";DIFF.v=(DIFF.v||0)+1;DIFF.ts=Date.now();
var mat=0;
if(ready()){var eng=resolved();eng.forEach(function(e){virts(e).forEach(function(v){
if(FAULTS.some(function(f){return f.id===v.id}))return;
FAULTS.push(Object.assign({},v,{virt:0,src:v.src+" · matérialisée"}));mat++})})}
reindex();persist();audit();renderAudit();sync();renderDom();renderAll();renderDiffPanel();
notify("diff","Renfort v"+DIFF.v+" validé et intégré"+(mat?" ("+mat+" fiches matérialisées pour la sélection)":""),"");
toast("Renfort v"+DIFF.v+" validé"+(mat?" · "+mat+" fiches matérialisées pour le véhicule sélectionné":"")+". Prêt à diffuser.","ok")}
function diffuse(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
if(DIFF.status!=="valide"){toast("Validez d'abord le renfort","wa");return}
DIFF.status="diffuse";DIFF.ts=Date.now();persist();reindex();
var pkg={app:"KEV FUSION 2026",type:"renfort",version:DIFF.v,ts:DIFF.ts,status:"diffuse",
templates:RFTV,domains:DOM.map(function(d){return d[0]}),coverage:DIFF.rep,by:"administrateur"};
var b=new Blob([JSON.stringify(pkg)],{type:"application/json"}),a=el("a");
a.href=URL.createObjectURL(b);a.download="kev-renfort-diffuse-v"+DIFF.v+".json";
document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},400);
notify("diff","Renfort v"+DIFF.v+" diffusé aux tiers ("+nf(TIERS.filter(function(t){return t.status==="granted"}).length)+" tiers autorisés)","");
renderDiffPanel();renderAll();safe(function(){K.set(selfCheck())},"auto-vérification");
toast("Renfort v"+DIFF.v+" diffusé aux tiers · paquet exporté · lecture seule côté tiers","te")}
window.KF_DIFFUSE=diffuse;

function renderAll(){$("nBase").textContent=nf(EIX.all.length);
$("nFault").textContent=nf(FAULTS.length+(FIL.rules?D.rules.length:0));
safe(renderDiag,"rendu diagnostic");safe(renderFaults,"rendu pannes");safe(renderServ,"rendu entretien");
safe(renderCov,"rendu domaines");safe(renderCat,"rendu catalogue");
if(canW())safe(renderAdm,"rendu admin");reveal()}
function showView(v){[].forEach.call(document.querySelectorAll(".vw"),function(s){s.classList.toggle("on",s.id==="v-"+v)});
[].forEach.call(document.querySelectorAll(".tb"),function(t){t.setAttribute("aria-selected",String(t.dataset.v===v))});
if(v==="int")safe(renderAudit,"audit");if(v==="cat")safe(renderCat,"catalogue");
if(v==="dom")safe(renderCov,"domaines");if(v==="serv")safe(renderServ,"entretien");
window.scrollTo({top:0,behavior:"smooth"});reveal()}
var io=null;
function reveal(){var els=document.querySelectorAll(".vw.on .rvl:not(.in)");
if(!("IntersectionObserver"in window)){[].forEach.call(els,function(e){e.classList.add("in")});return}
if(!io)io=new IntersectionObserver(function(en){en.forEach(function(x){
if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.05});
[].forEach.call(els,function(e){io.observe(e)})}

function selfCheck(){var L=[];
function add(ok,l,d,f){L.push({ok:!!ok,l:l,d:d==null?"":String(d),f:!!f})}
var lsOk=(function(){try{localStorage.setItem("kf.t","1");localStorage.removeItem("kf.t");return true}catch(e){return false}})();
var n24=CAT.reduce(function(a,b){return a+b.models.filter(function(m){return m.y0>=2024}).length},0);
var vc=EIX.all.length?virts(EIX.all[0]).length:0;
add(true,"data.js chargé (window.KFD)","catalogue + fiches + domaines");
add(CAT.length>0,"Catalogue construit",CAT.length+" marques",!CAT.length);
add(EIX.all.length>100,"Motorisations chargées",nf(EIX.all.length),EIX.all.length===0);
add(FAULTS.length>10,"Fiches pannes / rappels / TSB",nf(FAULTS.length),!FAULTS.length);
add(D.rules.length>20,"Protocoles par domaine",D.rules.length);
add(allRevs().length>10,"Révisions d'intervalles",nf(allRevs().length));
add(n24>=40,"Modèles millésimes 2024+",n24);
add(vc>0,"Renfort par puissance actif",vc+" fiches / motorisation");
add(DIFF.status==="diffuse"||DIFF.status==="none"||DIFF.status==="valide","Diffusion tiers cohérente",DIFF.status+" v"+(DIFF.v||0));
add(!!CO.brand&&!!CO.hp,"Banc de commande initialisé","5 listes corrélées",!CO.brand);
add(typeof K.unlock==="function"&&!!$("admForm"),"Authentification administrateur prête","code requis");
add(lsOk,"Stockage local accessible",lsOk?"oui":"saturé",!lsOk);
add(!!ENR.ts,"Auto-enrichissement massif",ENR.ts?dtT(ENR.ts):"en attente du mode admin");
add(!!AUDIT,"Audit d'intégrité calculé",AUDIT?AUDIT.score+"% · "+AUDIT.bad+" bloquante(s)":"");
add(!!$("launch")&&!!$("v-diag"),"Interface complète","écran d'accueil + 7 sections",!$("v-diag"));
add((K.errors||[]).length===0,"Aucune erreur JS capturée",(K.errors||[]).length?(K.errors||[]).slice(-3).join(" | "):"ok",(K.errors||[]).length>0);
return L}
window.KF_RECHECK=function(){safe(function(){audit();renderAudit();K.set(selfCheck());toast("Auto-vérification relancée","in")},"recheck")};

function bind(){
CO.brand=new Combo($("cBrand"),"Toutes les marques",function(v){SEL={brand:v,model:"",year:"",fam:"",hp:""};FSEL=[];fLimit=250;sync();renderDom();renderAll()});
CO.model=new Combo($("cModel"),"Choisir d'abord une marque",function(v){SEL.model=v;SEL.year="";SEL.fam="";SEL.hp="";FSEL=[];fLimit=250;sync();renderDom();renderAll()});
CO.year=new Combo($("cYear"),"Toutes les années",function(v){SEL.year=v;sync();renderDom();renderAll()});
CO.fam=new Combo($("cFam"),"Toutes cylindrées / types",function(v){SEL.fam=v;SEL.hp="";sync();renderDom();renderAll()});
CO.hp=new Combo($("cHp"),"Toutes puissances",function(v){SEL.hp=v;sync();renderDom();renderAll()});
[].forEach.call(document.querySelectorAll(".tb"),function(t){t.onclick=function(){
if(t.dataset.v==="adm"&&!canW()){toast("Réservé à l'administrateur","ba");return}showView(t.dataset.v)}});
$("bellB").onclick=openNf;$("nfX").onclick=closeNf;
$("nfRead").onclick=function(){NOTIF.forEach(function(n){n.read=true});saveNf();renderBell();renderNf();toast("Notifications marquées lues","ok")};
$("nfClear").onclick=function(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
var s=NOTIF.slice();NOTIF=[];saveNf();renderBell();renderNf();
toast("Notifications vidées","wa",function(){NOTIF=s;saveNf();renderBell();renderNf()})};
$("nfGo").onclick=function(){closeNf();if(canW())showView("adm");else toast("Réservé à l'administrateur","ba")};
$("bNew").onclick=newSearch;
var qt=null;$("q").oninput=function(){FIL.q=$("q").value;fLimit=250;clearTimeout(qt);
qt=setTimeout(function(){safe(renderDiag,"q-diag");safe(renderFaults,"q-pannes");safe(renderCov,"q-dom")},170)};
[].forEach.call($("sevSeg").querySelectorAll("button"),function(b){b.onclick=function(){
var s=b.dataset.s,i=FIL.sev.indexOf(s);if(i>=0)FIL.sev.splice(i,1);else FIL.sev.push(s);
b.setAttribute("aria-pressed",String(i<0));fLimit=250;renderAll()}});
$("selKind").onchange=function(){FIL.kind=$("selKind").value;fLimit=250;renderAll()};
$("selSort").onchange=function(){FIL.sort=$("selSort").value;renderAll()};
$("kmY").oninput=function(){USE.km=+$("kmY").value;$("kmYL").textContent=nf(USE.km)+" km/an";safe(renderServ,"km/an")};
$("selSev").onchange=function(){USE.sev=$("selSev").value;safe(renderServ,"sollicitation");toast("Sollicitation : "+$("selSev").selectedOptions[0].text,"in")};
$("selClim").onchange=function(){USE.clim=$("selClim").value;safe(renderServ,"climat");toast("Climat : "+$("selClim").selectedOptions[0].text,"in")};
$("tgB").onclick=function(){FIL.bs=!FIL.bs;$("tgB").setAttribute("aria-pressed",String(FIL.bs));fLimit=250;renderDom();renderAll()};
$("tgR").onclick=function(){FIL.rules=!FIL.rules;$("tgR").setAttribute("aria-pressed",String(FIL.rules));fLimit=250;renderDom();renderAll()};
$("tgD").onclick=function(){FIL.done=!FIL.done;$("tgD").setAttribute("aria-pressed",String(FIL.done));fLimit=250;renderDom();renderAll()};
$("bDomAll").onclick=function(){FIL.dom=[];fLimit=250;renderDom();renderAll();toast("Tous les domaines affichés","in")};
$("bCovClear").onclick=function(){FIL.dom=[];fLimit=250;renderDom();renderAll();toast("Filtres domaines réinitialisés","in")};
$("bRand").onclick=function(){var e=EIX.all;if(e.length)loadEng(e[Math.floor(Math.random()*e.length)])};
$("bSave").onclick=function(){if(!canW()){toast("Réservé à l'administrateur","ba");return}
if(!SEL.brand){toast("Sélectionnez au moins une marque","wa");return}
var b=B(SEL.brand),m=SEL.model?M(SEL.brand,SEL.model):null;
var f=(SEL.fam&&m)?famsOf(SEL.brand,SEL.model,SEL.year).filter(function(x){return x.k===SEL.fam})[0]:null;
var label=[b.name,m?m.name:null,SEL.year||null,f?famL(f.e):null,SEL.hp?SEL.hp+" ch":null].filter(Boolean).join(" › ");
var name=prompt("Nom de la vue mémorisée :",label);if(!name)return;
VIEWS.unshift({name:name.slice(0,60),label:label,sel:Object.assign({},SEL),q:FIL.q,dom:FIL.dom.slice(),use:Object.assign({},USE)});
saveAux();renderViews();toast("Vue mémorisée","ok")};
$("bDtc").onclick=function(){var c=($("dtcIn").value||"").trim().toUpperCase(),out=$("dtcOut");
if(!c){out.innerHTML="";return}
var d=DTC[c],rel=pool(false).filter(function(f){return f.dtc.indexOf(c)>=0});
out.innerHTML=(d?'<div class="nt in"><b>'+esc(c)+" — "+esc(d[0])+"</b><br>Causes probables : "+esc(d[1])+
"<br>Contrôle : "+esc(d[2])+'</div>':'<div class="nt wa"><b>'+esc(c)+
"</b> absent du dictionnaire local. Consultez OBD-Codes ou la documentation constructeur.</div>")+
((ready()&&rel.length)?'<div class="mi" style="margin-top:8px">'+rel.length+" fiche(s) associée(s) :</div>"+
rel.slice(0,6).map(function(f){return'<div class="fc v-'+f.sev+'" style="margin-top:7px;cursor:default">'+
'<div class="ft" style="font-size:13px">'+esc(f.titre)+'</div><div class="fm"><span class="pl '+KCL[f.kind]+'">'+
KIND[f.kind]+'</span><span class="pl">'+f.y0+"–"+f.y1+'</span></div></div>'}).join(""):"")};
$("dtcIn").onkeydown=function(e){if(e.key==="Enter")$("bDtc").click()};
$("bSelAll").onclick=function(){var a=current();
if(FSEL.length===a.length)FSEL=[];else FSEL=a.slice(0,2000).map(function(f){return f.id});renderFaults()};
$("bBulkDone").onclick=function(){if(!canW())return;
var ids=FSEL.slice(),prev=ids.map(function(i){return[i,NOTES[i]?Object.assign({},NOTES[i]):null]});
ids.forEach(function(i){NOTES[i]=Object.assign({},NOTES[i],{done:true})});
saveAux();FSEL=[];renderAll();toast(ids.length+" fiche(s) traitée(s)","ok",function(){
prev.forEach(function(p){if(p[1])NOTES[p[0]]=p[1];else delete NOTES[p[0]]});saveAux();renderAll()})};
$("bBulkCopy").onclick=function(){var a=current().filter(function(f){return FSEL.indexOf(f.id)>=0});
var t=a.slice(0,300).map(function(f){return f.titre+" ["+KIND[f.kind]+" · "+SEV[f.sev].n+" · "+f.y0+"-"+f.y1+"]\n"+f.sym+"\n"+
f.pro.map(function(p,i){return(i+1)+") "+p}).join("\n")+"\nOrganes : "+f.org+"\nDTC : "+f.dtc.join(", ")+"\nSource : "+f.src}).join("\n\n---\n\n");
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast(a.length+" fiche(s) copiée(s)","ok")},function(){toast("Copie indisponible","wa")});
else toast("Copie indisponible","wa")};
$("bPrint").onclick=function(){window.print()};
$("bCopyPlan").onclick=function(){if(!ready()){toast("Sélectionnez une motorisation complète","wa");return}
var e=resolved()[0],s=spec(e),rv=revsFor(e);
var t="PLAN D'ENTRETIEN — "+e.brandName+" "+e.modelName+" "+famL(e)+" "+e.hp+" ch ("+kw(e.hp)+" kW)\nCode moteur "+
e.code+" · "+(s.ev?s.kwh+" kWh / "+s.volt+" V":s.disp+" cm³ / "+s.lay)+" · "+e.y0+"-"+e.y1+"\nUsage : "+
nf(USE.km)+" km/an · "+USE.sev+" · "+USE.clim+"\n"+
(rv.length?"\nINTERVALLES RÉVISÉS :\n"+rv.map(function(r){return" • "+r.organ+" : "+
(r.oldKm?nf(r.oldKm)+" km":"sans échéance")+" → "+nf(r.newKm)+" km"+(r.newMo?" / "+moT(r.newMo):"")+" ("+r.src+")"}).join("\n"):"")+
planFor(e).map(function(x){return"\n"+nf(x.km)+" km (≈ "+moT(x.mo)+")\n"+
x.ops.map(function(o){return" • "+o.t+(o.r?" [RÉVISÉ]":(o.c?" [CRITIQUE]":""))}).join("\n")}).join("\n");
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast("Plan copié","ok")},function(){toast("Copie indisponible","wa")});
else toast("Copie indisponible","wa")};
$("bRevAll").onclick=function(){var b=$("revAllBox");
b.style.display=b.style.display==="none"?"block":"none";
if(b.style.display==="block"){renderRevAll();b.scrollIntoView({behavior:"smooth",block:"start"})}};
var rqt=null;$("revQ").oninput=function(){revQ=$("revQ").value;clearTimeout(rqt);rqt=setTimeout(renderRevAll,160)};
var ct=null;$("catQ").oninput=function(){CUI.q=$("catQ").value;CUI.page=0;clearTimeout(ct);ct=setTimeout(renderCat,160)};
[].forEach.call(document.querySelectorAll("#catT th.so"),function(th){th.onclick=function(){
var k=th.dataset.k;if(CUI.sort===k)CUI.dir*=-1;else{CUI.sort=k;CUI.dir=1}renderCat()}});
$("catP").onclick=function(){CUI.page--;renderCat()};
$("catN").onclick=function(){CUI.page++;renderCat()};
$("bCatAll").onclick=function(){if(CUI.sel.length)CUI.sel=[];else CUI.sel=EIX.all.slice(0,200).map(function(e){return e.key});renderCat()};
$("bCatLoad").onclick=function(){var k=CUI.sel[0],e=EIX.all.filter(function(x){return x.key===k})[0];if(e)loadEng(e)};
$("bAudit").onclick=function(){audit();renderAudit();K.set(selfCheck());toast("Audit terminé — intégrité "+AUDIT.score+"%","ok")};
$("bRepair").onclick=autoRepair;
$("bLock").onclick=function(){K.lock();toast("Session administrateur verrouillée","in")};
$("tiersQ").oninput=function(){safe(renderTiers,"filtre tiers")};
$("tiersFil").onchange=function(){safe(renderTiers,"filtre tiers")};
$("bRevAllT").onclick=function(){if(!canW())return;
var g=TIERS.filter(function(t){return t.status==="granted"});
if(!g.length){toast("Aucun tiers autorisé","in");return}
if(!confirm("Révoquer tous les accès autorisés ("+g.length+") ?"))return;
var prev=g.map(function(t){return t.status});
g.forEach(function(t){t.status="revoked";t.decidedAt=Date.now();t.history.push({ts:Date.now(),a:"revoked",by:"admin"})});
saveAcc();renderTiers();renderBell();notify("revoke",g.length+" accès révoqués","");
toast(g.length+" accès révoqués","wa",function(){g.forEach(function(t,i){t.status=prev[i]});saveAcc();renderTiers();renderBell()})};
$("fileImp").onchange=function(e){var f=e.target.files[0];if(f)safe(function(){importFile(f)},"import");e.target.value=""};
$("bUpd").onclick=function(){safe(updateOnline,"mise à jour")};
$("bExp").onclick=exportDB;
$("bBk").onclick=function(){if(!canW()){toast("Mode administrateur requis","ba");return}
var ok=makeBk("manuelle");
toast(ok?"Sauvegarde locale créée":"Base trop volumineuse pour une sauvegarde locale — utilisez l'export JSON",ok?"ok":"wa")};
$("bWipe").onclick=function(){if(!canW()){toast("Mode administrateur requis","ba");return}
if(!confirm("Réinitialiser sur la base livrée ? Les ajouts, imports, enrichissements et le renfort seront perdus (annulable)."))return;
var snap=JSON.stringify({cat:CAT,faults:FAULTS,revs:REVC,diff:DIFF});
DIFF={v:0,ts:0,status:"none",gen:0,rep:null};
resetSeed();newSearch();audit();renderAudit();renderAdm();K.set(selfCheck());
toast("Base réinitialisée","wa",function(){var d=JSON.parse(snap);CAT=d.cat;FAULTS=d.faults;REVC=d.revs;DIFF=d.diff||DIFF;
reindex();persist();sync();audit();renderDom();renderAll();renderAdm()})};
$("bClearN").onclick=function(){if(!canW()){toast("Mode administrateur requis","ba");return}
var snap=JSON.stringify(NOTES);NOTES={};saveAux();renderAll();
toast("Notes et statuts effacés","wa",function(){NOTES=JSON.parse(snap);saveAux();renderAll()})};
$("ovX").onclick=function(){ovlOn(false)};
$("dwX").onclick=closeDw;
$("scrim").onclick=function(){closeDw();closeNf()};
document.addEventListener("keydown",function(e){
if(e.key==="Escape"){if(openC)openC.close();
else if($("drawer").classList.contains("on"))closeDw();
else if($("notifDw").classList.contains("on"))closeNf();
else if($("ovl").classList.contains("on")&&$("ovX").style.display!=="none")ovlOn(false)}
if(e.altKey&&(e.key==="r"||e.key==="R")){e.preventDefault();newSearch()}
if(e.altKey&&(e.key==="e"||e.key==="E")){e.preventDefault();if(canW())enrich(false)}
if(e.altKey&&(e.key==="d"||e.key==="D")){e.preventDefault();if(canW())diffuse()}
if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();$("q").focus()}});
var af=$("afDom");
if(af&&!af.children.length)DOM.forEach(function(dd){var b=el("button","dc");b.type="button";
b.dataset.on="0";b.dataset.d=dd[0];b.innerHTML='<svg class="ic"><use href="#'+dd[2]+'"/></svg>'+esc(dd[1]);
b.onclick=function(){b.dataset.on=b.dataset.on==="1"?"0":"1"};af.appendChild(b)});
$("addEng").onsubmit=function(e){e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
var f=e.target,my=pYears(f.aeY.value),o=fom(nBrand(f.aeB.value),f.aeM.value.trim(),my[0],my[1]);
var r=addEngTo(o.m,o.b,f.aeF.value.trim(),parseInt(f.aeH.value,10)||0,f.aeC.value.trim(),f.aeU.value,
my[0],my[1],f.aeT.value.trim(),f.aeD.value.trim());
if(r==="none"){toast("Cette motorisation existe déjà","wa");return}
reindex();persist();sync();audit();renderDom();renderAll();renderAdm();f.reset();
toast(r==="add"?"Motorisation ajoutée":"Motorisation enrichie","ok")};
$("addF").onsubmit=function(e){e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
var brands=csv($("afB").value).map(slug).filter(Boolean);
if(!brands.length){toast("Au moins une marque valide","wa");return}
var dom=[].map.call($("afDom").querySelectorAll('[data-on="1"]'),function(b){return b.dataset.d});
if(!dom.length){toast("Sélectionnez au moins un domaine","wa");return}
FAULTS.push({id:"USR-"+Date.now().toString(36),scope:$("afSc").value,brands:brands,target:$("afG").value.trim(),
kind:$("afK").value,sev:$("afS").value,y0:+$("afY0").value||2017,y1:+$("afY1").value||2027,
titre:$("afT").value.trim(),sym:$("afSy").value.trim(),
pro:$("afP").value.split("\n").map(function(s){return s.trim()}).filter(Boolean),org:$("afO").value.trim(),
dtc:csv($("afD").value).map(function(s){return s.toUpperCase()}),src:$("afSr").value.trim(),dom:dom});
reindex();persist();audit();renderDom();renderAll();renderAdm();e.target.reset();
$("afY0").value=2017;$("afY1").value=2027;
[].forEach.call($("afDom").querySelectorAll("[data-on]"),function(b){b.dataset.on="0"});
toast("Fiche enregistrée","ok")};
$("addRev").onsubmit=function(e){e.preventDefault();if(!canW()){toast("Mode administrateur requis","ba");return}
var brands=csv($("arB").value).map(slug).filter(Boolean);
if(!brands.length){toast("Au moins une marque valide","wa");return}
REVC.push({id:"USR-R-"+Date.now().toString(36),brands:brands,match:$("arM").value.trim(),organ:$("arO").value.trim(),
oldKm:+$("arOK").value||0,newKm:+$("arNK").value||0,oldMo:+$("arOM").value||0,newMo:+$("arNM").value||0,
src:$("arS").value.trim(),note:$("arN").value.trim(),y0:2017,y1:2027});
persist();audit();renderAll();renderAdm();e.target.reset();
$("arOK").value=240000;$("arNK").value=160000;$("arOM").value=120;$("arNM").value=96;
toast("Révision enregistrée","ok")};
function net(){var c=$("chN"),t=$("nNet");
if(navigator.onLine){var s="En ligne";try{var k=navigator.connection;if(k&&k.effectiveType)s=k.effectiveType.toUpperCase()}catch(e){}
c.className="ch ok";t.textContent=s}else{c.className="ch ba";t.textContent="Hors ligne"}}
net();window.addEventListener("online",function(){net();toast("Connexion rétablie","ok")});
window.addEventListener("offline",function(){net();toast("Mode hors ligne — base locale active","wa")});
setInterval(net,15000);
try{if(BC)BC.onmessage=function(){loadAcc();loadNf();live();if(canW())safe(renderAll,"sync-bc")}}catch(e){}
window.addEventListener("storage",function(e){
if([LS.acc,LS.nf,LS.db].indexOf(e.key)>=0){loadAcc();loadNf();if(e.key===LS.db){loadDB();reindex()}live();if(canW())safe(renderAll,"sync-storage")}});
setInterval(function(){safe(live,"temps réel")},1500)}

function boot(){
safe(function(){initDevice();loadAux();loadAcc();loadNf()},"init-stockage");
safe(function(){if(!loadDB())resetSeed();if(!CAT.length||!EIX.all.length)resetSeed();
if(!FAULTS.length)FAULTS=FAULTS0.map(function(f){return Object.assign({},f)})},"chargement-base");
safe(reindex,"index");
safe(bind,"liaison-interface");
safe(sync,"cascade");
safe(function(){audit();renderDom();renderAll();renderBell()},"premier-rendu");
safe(function(){var a=AUDIT||audit();$("nInt").textContent=a.score+"%"},"score");
K.ready=true;
safe(function(){K.set(selfCheck())},"auto-vérification");
var ses=null;try{ses=localStorage.getItem("kf.ses")}catch(e){}
var r=myReq();
if(K.role){ROLE=K.role;safe(afterEnter,"session-active")}
else if(ses==="tiers"&&r&&r.status==="granted"){K.unlock("tiers")}
else{waitMode=!!r;$("launch").classList.remove("off");document.body.classList.add("lk");
safe(renderLaunch,"écran d'accueil");safe(function(){K.set(selfCheck())},"auto-vérification-2")}
setTimeout(function(){var p=$("admPwd");if(p)p.value="";
var t=$("nNet");if(t&&t.textContent==="…"){$("chN").className="ch "+(navigator.onLine?"ok":"ba");
t.textContent=navigator.onLine?"En ligne":"Hors ligne"}},900);
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(function(){})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
