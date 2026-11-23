/* APP.JS v20 — Moteur unique robuste : catalogue, corrélation, maintenance native, audits, MAJ manuelle */
const ADMIN_PASSWORD = "Kevin83600";
const SESSION_KEY = "autodiag_session";
const DAY = 86400000, CYCLE = 30 * DAY;
let db, usersData = {}, brandsData = {}, motorsCache = [], deferredPrompt = null, listenersStarted = false, ensureDone = false, pwdTyped = false, pendCount = -1;
let curBrand = null, curModelId = null, curModelName = null;

window.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
  try { firebase.initializeApp(firebaseConfig); db = firebase.database(); } catch (e) { notify("❌ Firebase : config invalide", "error"); return; }
  setupInstall(); bindAdminTable(); bindPwd(); netMonitor(); seedBrands(); boot(); selfTest(true);
});
window.addEventListener("pageshow", () => clearPwd());

function el(id) { return document.getElementById(id); }
function val(id) { const e = el(id); return e ? e.value : ""; }
function esc(s) { const d = document.createElement("div"); d.textContent = String(s == null ? "" : s); return d.innerHTML; }
function notify(m, t) { const n = document.createElement("div"); n.className = "notification" + (t === "error" ? " error" : ""); n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 4000); }
function pushNotif(t, b) { if ("Notification" in window && Notification.permission === "granted") { try { new Notification(t, { body: b, icon: "./icon-192.png" }); } catch (e) {} } }
function showScreen(id) { document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")); const e = el(id); if (e) e.classList.add("active"); }
function active(id) { const e = el(id); return !!e && e.classList.contains("active"); }
function uid(p) { return p + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6); }
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function deviceId() { let i = localStorage.getItem("autodiag_device"); if (!i) { i = "DEV-" + Math.random().toString(36).substr(2, 8).toUpperCase(); localStorage.setItem("autodiag_device", i); } return i; }
function isAdmin() { return sessionStorage.getItem("autodiag_admin") === "1"; }

async function dbGet(path) {
  try {
    const s = await Promise.race([db.ref(path).once("value"), new Promise((_, rj) => setTimeout(() => rj(new Error("timeout")), 4000))]);
    const v = s.val() || {};
    try { localStorage.setItem("mir_" + path, JSON.stringify(v)); } catch (e) {}
    return v;
  } catch (e) { try { return JSON.parse(localStorage.getItem("mir_" + path) || "{}"); } catch (x) { return {}; } }
}
async function dbSet(path, v) { try { await db.ref(path).set(v); return true; } catch (e) { console.warn("set", path, e); return false; } }

/* ===== MOT DE PASSE ===== */
function clearPwd() { const p = el("admin-pwd"); if (p && !pwdTyped) { p.value = ""; try { p.setAttribute("value", ""); } catch (e) {} } }
function showAdminLogin() { pwdTyped = false; clearPwd(); showScreen("screen-admin-login"); [0, 80, 250, 600, 1200].forEach(t => setTimeout(clearPwd, t)); }
function bindPwd() { const p = el("admin-pwd"); if (!p) return; p.addEventListener("input", () => { pwdTyped = true; }); p.addEventListener("focus", () => { if (!pwdTyped) clearPwd(); }); p.addEventListener("keydown", e => { if (e.key === "Enter") loginAdmin(); }); }

/* ===== RÉSEAU ===== */
function netMonitor() {
  const set = on => { const s = el("net-status"); if (s) s.textContent = on ? "📶 en ligne" : "⚠️ hors-ligne (cache)"; };
  set(navigator.onLine);
  window.addEventListener("online", () => { set(true); notify("📶 Connexion rétablie"); });
  window.addEventListener("offline", () => { set(false); notify("⚠️ Hors-ligne : cache local actif", "error"); });
}

/* ===== CARBURANT / MATCHERS ===== */
function guessFuel(n) {
  n = String(n).toLowerCase();
  if (/electric|électrique|e-tron|ev\b|e-|ë-|folgore|propulsion|plaid|long range|grande autonomie|xpower|dual motor|single motor|twin motor|edrive|iq|z\.e|elettrica|recharge pure/.test(n)) return "electrique";
  if (/hybrid|hybride|phev|e:hev|e-tech|etech|mhev|48v|dm-i|dm-p|erev|e-power|e-boxer|recharge|4xe|gte|ehybrid|e-hybrid|shvs|strong hybrid|hybrid\+|em-i|q4|mild/.test(n)) return "hybride";
  if (/dci|tdi|bluehdi|hdi|diesel|crdi|multijet|ecoblue|jtd|d-4d|skyactiv-d|bluetec|cdi|ecodiesel|ecojet|ddis|di-d|cdti|d-tec|\bd[0-9]{2,3}\b|\b[0-9]\.[0-9] d\b/.test(n)) return "diesel";
  return "essence";
}
function guessPower(n) { const m = String(n).match(/(\d{2,4})\s*ch\b/i) || String(n).match(/(\d{2,4})\s*$/); return m ? m[1] + " ch" : ""; }
function famFuel(k) {
  k = String(k).toLowerCase();
  for (const [t, f] of Object.entries(EG_TOKEN_FUEL)) if (k.includes(t.toLowerCase())) return f;
  return null;
}
const FKW = {
 diesel: ["adblue","fap","egr","dci","tdi","bluehdi","diesel","multijet","crdi","ecoblue","skyactiv-d","préchauffage","jtd","d-4d","cdi","ecodiesel"],
 essence: ["puretech","tce","tsi","ecoboost","gdi","thp","vtec","essence","courroie","chaîne","chaine","allumage","bougies","catalyseur","gpf","calamine"],
 hybride: ["hybrid","hybride","phev","e:hev","e-tech","onduleur","48v","dm-i","e-power","recharge","bascule"],
 electrique: ["électrique","electrique","iccu","obc","bms","batterie hv","charge","isolement","dc-dc","soh","servofrein","réducteur","lfp"]
};
function fuelOf(t) { t = String(t).toLowerCase(); for (const f of ["diesel","essence","hybride","electrique"]) if (FKW[f].some(k => t.includes(k))) return f; return null; }
function compat(a, b) { if (!a || !b) return true; if (a === b) return true; return (a === "hybride" && b === "electrique") || (a === "electrique" && b === "hybride"); }
function fuzzy(a, b) { if (!a) return true; if (!b) return false; a = String(a).toLowerCase(); b = String(b).toLowerCase(); if (a === b || a.includes(b) || b.includes(a)) return true; return a.split("/").some(p => { p = p.trim(); return p && (b.includes(p) || p.includes(b)); }); }
function kwMatch(key, motor) {
  if (!key) return true; if (!motor) return true;
  const k = String(key).toLowerCase(), mn = String(motor.name).toLowerCase();
  if (mn.includes(k)) return true;
  if (curModelName) { const cm = String(curModelName).toLowerCase(); if (k.includes(cm) || cm.includes(k) || k.split("/").some(p => { p = p.trim(); return p && (cm.includes(p) || p.includes(cm)); })) return true; }
  const f = famFuel(k) || fuelOf(k); if (f) return compat(f, motor.fuel);
  return false;
}
function motorMatch(mk, motor) {
  if (!mk) return true; if (!motor) return true;
  const k = String(mk).toLowerCase(), mn = String(motor.name).toLowerCase();
  if (mn.includes(k) || k.includes(mn)) return true;
  const f = famFuel(k) || fuelOf(k); if (f) return compat(f, motor.fuel);
  if (curModelName && k.includes(String(curModelName).toLowerCase())) return true;
  return false;
}
function titleOk(text, motor) { if (!motor) return true; const f = fuelOf(text); return !f || compat(f, motor.fuel); }

/* ===== GARDE-MOTEURS ===== */
function egGroup(b) { for (const [g, l] of Object.entries(EG_GROUPS)) if (l.includes(b)) return g; return null; }
function egTokens(name) {
  const n = " " + String(name).toLowerCase() + " ", h = [];
  for (const [t, f] of Object.entries(EG_TOKEN_FUEL)) if (n.includes(t.toLowerCase())) h.push({ t: t, f: f });
  h.sort((a, b) => b.t.length - a.t.length); return h;
}
function egFix(brandId, m) {
  const g = egGroup(brandId); if (!g) return { changed: false, m: m };
  const nat = EG_NATIVE[g] || [], orig = String(m.name || ""); let name = orig, changed = false;
  for (const h of egTokens(orig)) {
    const tl = h.t.toLowerCase();
    if (nat.some(x => tl.includes(x) || x.includes(tl))) continue;
    const canon = (EG_CANON[g] || {})[h.f] || ""; if (!canon) continue;
    const re = new RegExp(tl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (re.test(name)) { name = name.replace(re, canon); changed = true; }
  }
  let fuel = m.fuel;
  const tk = egTokens(name);
  if (tk.length) fuel = tk[0].f; else if (!fuel) fuel = guessFuel(name);
  if (fuel !== m.fuel || name !== orig) changed = true;
  return { changed: changed, m: Object.assign({}, m, { name: name.replace(/\s+/g, " ").trim(), fuel: fuel }) };
}
async function engineAudit(verbose) {
  const models = await dbGet("data/models"), motors = await dbGet("data/motors");
  let fixed = 0, checked = 0;
  for (const [mid, mo] of Object.entries(models)) {
    const list = motors[mid]; if (!Array.isArray(list)) continue;
    let ch = false;
    const next = list.map(x => { checked++; const r = egFix(mo.brandId, x); if (r.changed) { ch = true; return r.m; } return x; });
    if (ch) { await dbSet("data/motors/" + mid, next); fixed++; }
  }
  window.engineReport = { fixed: fixed, checked: checked };
  const c = el("engine-box"); if (c) c.innerHTML = '<p style="font-size:12px;color:#94a3b8">🛡️ ' + checked + " motorisations vérifiées • " + fixed + " correction(s)</p>";
  if (verbose) notify(fixed ? "🛡️ " + fixed + " modèle(s) corrigé(s) sur " + checked + " motorisations" : "🛡️ Aucune incohérence (" + checked + " motorisations)");
  return fixed;
}

/* ===== AUDIT ATTRIBUTIONS ===== */
async function attributionAudit(verbose) {
  const models = await dbGet("data/models"), exp = await dbGet("data/expert");
  const byBrand = {}; Object.values(models).forEach(m => { (byBrand[m.brandId] = byBrand[m.brandId] || []).push(m.name); });
  let fixed = 0;
  for (const [id, e] of Object.entries(exp)) {
    let mk = String(e.motor || ""), mdl = String(e.model || ""), upd = false;
    if (mk) {
      const names = byBrand[e.brandId] || [];
      const hit = names.find(n => String(n).length > 2 && mk.toLowerCase().includes(String(n).toLowerCase()));
      if (hit) {
        const rest = mk.toLowerCase().split(String(hit).toLowerCase()).join(" ");
        let nm = "";
        if (/elec|électri|ev\b/.test(rest)) nm = "Electric"; else if (/hybrid|phev/.test(rest)) nm = "Hybrid";
        else if (/dci|tdi|diesel|crdi|hdi/.test(rest)) nm = "diesel"; else if (/tce|tsi|puretech|essence/.test(rest)) nm = "essence";
        e.model = mdl || hit; e.motor = nm; upd = true;
      } else if (/élec|electri/.test(mk) && !/electric/i.test(mk)) { e.motor = "Electric"; upd = true; }
    }
    if (upd) { await db.ref("data/expert/" + id).update({ model: e.model, motor: e.motor }); fixed++; }
  }
  window.attribReport = { fixed: fixed, n: Object.keys(exp).length, m: Object.keys(models).length };
  const c = el("attrib-box"); if (c) c.innerHTML = '<p style="font-size:12px;color:#94a3b8">🧬 ' + window.attribReport.n + " fiches • " + window.attribReport.m + " modèles • " + fixed + " correction(s)</p>";
  if (verbose) notify(fixed ? "🧬 " + fixed + " attribution(s) corrigée(s)" : "🧬 Attributions cohérentes (" + window.attribReport.n + " fiches)");
  return fixed;
}

/* ===== SEED / CATALOGUE ===== */
async function seedBrands() {
  try {
    const cur = await dbGet("data/brands");
    for (const [id, name, region] of BRANDS) if (!cur[id]) await dbSet("data/brands/" + id, { name: name, region: region });
  } catch (e) { console.warn(e); }
}
async function ensureCatalog(force) {
  if (ensureDone && !force) return { models: 0, expert: 0 };
  ensureDone = true;
  let added = 0, fixed = 0, exAdd = 0, cpAdd = 0;
  try {
    await seedBrands();
    const models = await dbGet("data/models");
    const map = {}; Object.entries(models).forEach(([id, m]) => map[m.brandId + "|" + String(m.name).toLowerCase()] = id);
    for (let i = 0; i < MODELS_ALL.length; i++) {
      const [b, name, years, motors] = MODELS_ALL[i], key = b + "|" + name.toLowerCase();
      if (map[key]) continue;
      const id = "m_" + b + "_" + i;
      await dbSet("data/models/" + id, { brandId: b, name: name, years: years });
      await dbSet("data/motors/" + id, motors.map(m => egFix(b, m).m));
      map[key] = id; added++;
    }
    for (const [b, name, , motors] of MODELS_ALL) {
      const id = map[b + "|" + name.toLowerCase()]; if (!id) continue;
      const cur = (await db.ref("data/motors/" + id).once("value")).val() || [];
      const have = {}; cur.forEach(x => have[String(x.name).toLowerCase()] = 1);
      let ch = false;
      motors.forEach(m => { if (!have[String(m.name).toLowerCase()]) { cur.push(egFix(b, m).m); ch = true; } });
      for (let i = 0; i < cur.length; i++) {
        if (!cur[i].fuel) { cur[i].fuel = guessFuel(cur[i].name); ch = true; }
        if (!cur[i].power) { const p = guessPower(cur[i].name); if (p) { cur[i].power = p; ch = true; } }
      }
      if (ch) { await dbSet("data/motors/" + id, cur); fixed++; }
    }
    const exp = await dbGet("data/expert"); const te = {}; Object.values(exp).forEach(x => te[String(x.title).toLowerCase()] = 1);
    for (const e of EXPERT) {
      if (te[e[3].toLowerCase()]) continue;
      await dbSet("data/expert/" + uid("ex"), { brandId: e[0], motor: e[1], type: e[2], title: e[3], symptom: e[4], diagnosis: e[5], parts: e[6], dtc: e[7], source: e[8], years: e[9], model: "" });
      te[e[3].toLowerCase()] = 1; exAdd++;
    }
    const iss = await dbGet("data/issues"); const ti = {}; Object.values(iss).forEach(x => ti[String(x.title).toLowerCase()] = 1);
    for (const c of CAMPAIGNS) {
      if (ti[c[3].toLowerCase()]) continue;
      await dbSet("data/issues/" + uid("cp"), { brandId: c[0], model: c[1], motor: c[2], title: c[3], detail: c[4], source: c[5], dtc: c[6], url: c[7] });
      ti[c[3].toLowerCase()] = 1; cpAdd++;
    }
    if (added) notify("🚗 " + added + " modèles importés");
    if (exAdd || cpAdd) notify("🧠 " + (exAdd + cpAdd) + " fiches expert / campagnes importées");
  } catch (e) { console.warn("ensure", e); }
  return { models: added, expert: exAdd + cpAdd, fixed: fixed };
}

/* ===== MAJ MANUELLE ===== */
async function manualUpdate() {
  if (!isAdmin()) return notify("❌ Réservé admin", "error");
  notify("🔄 MAJ manuelle 2017-2027 en cours…");
  const btns = document.querySelectorAll('[onclick="manualUpdate()"]'); btns.forEach(b => b.disabled = true);
  try {
    await seedBrands();
    const r = await ensureCatalog(true);
    const a = await attributionAudit(false);
    const g = await engineAudit(false);
    await dbSet("data/version", { version: Date.now(), lastUpdate: new Date().toISOString(), updateIntervalDays: 30 });
    localStorage.setItem("autodiag_sync", String(Date.now()));
    brandsData = await dbGet("data/brands");
    fillBrandSelects();
    if (active("screen-app")) await buildBrandSelect();
    await selfTest(false);
    notify("✅ MAJ terminée : +" + r.models + " modèles, +" + r.expert + " fiches, " + (a + g) + " corrections");
  } catch (e) { notify("❌ MAJ : " + e.message, "error"); }
  btns.forEach(b => b.disabled = false);
}
function syncScheduler() {
  const last = parseInt(localStorage.getItem("autodiag_sync") || "0", 10);
  if (Date.now() - last > CYCLE) { localStorage.setItem("autodiag_sync", String(Date.now())); ensureCatalog(true); }
}
async function updateBase(manual) {
  await dbSet("data/version", { version: Date.now(), lastUpdate: new Date().toISOString(), updateIntervalDays: 30 });
  if (manual) notify("✅ MAJ diffusée à toutes les APK");
}

/* ===== AUTO-TEST ===== */
async function selfTest(quiet) {
  const R = [], t = (n, ok) => R.push({ n: n, ok: !!ok });
  try { await db.ref("data/version").once("value"); t("Connexion Firebase", true); } catch (e) { t("Connexion Firebase", false); }
  t("Données catalogue chargées", typeof MODELS_ALL !== "undefined" && MODELS_ALL.length > 0);
  t("Moteur maintenance présent", typeof buildMaintenanceHTML === "function");
  try { const r = await fetch("./manifest.json", { cache: "no-store" }); t("Manifest accessible", r.ok); } catch (e) { t("Manifest accessible", false); }
  try { const r = await fetch("./icon-192.png", { cache: "no-store" }); t("Icônes accessibles", r.ok); } catch (e) { t("Icônes accessibles", false); }
  t("Service Worker", !!navigator.serviceWorker);
  t("Réseau actif", navigator.onLine);
  const b = await dbGet("data/brands"); t("Base marques (" + Object.keys(b).length + ")", Object.keys(b).length > 0);
  const m = await dbGet("data/models"); t("Base modèles (" + Object.keys(m).length + ")", Object.keys(m).length > 0);
  const e2 = await dbGet("data/expert"); t("Fiches expert (" + Object.keys(e2).length + ")", Object.keys(e2).length > 0);
  t("Écrans interface", !!el("screen-home") && !!el("screen-admin") && !!el("screen-app"));
  t("Case maintenance", !!el("maint-box"));
  window.lastSelfTest = R;
  const c = el("selftest-box"); if (c) c.innerHTML = R.map(r => '<p style="font-size:13px;margin:3px 0">' + (r.ok ? "✅" : "❌") + " " + esc(r.n) + "</p>").join("");
  const bad = R.filter(r => !r.ok).length;
  if (bad) notify("🩺 Auto-test : " + bad + " anomalie(s)", "error"); else if (!quiet) notify("🩺 Auto-test OK (" + R.length + "/" + R.length + ")");
  return R;
}

/* ===== ACCÈS ===== */
function boot() {
  if (!listenersStarted) {
    listenersStarted = true;
    db.ref("access/users").on("value", s => {
      usersData = s.val() || {};
      const pc = Object.values(usersData).filter(u => u.status === "pending").length;
      if (pendCount >= 0 && pc > pendCount && isAdmin()) { notify("📨 Nouvelle demande d'accès"); pushNotif("📨 Nouvelle demande", "Un tiers attend votre validation."); }
      pendCount = pc; routeUser(); if (active("screen-admin")) renderAdmin();
    });
    db.ref("data/brands").on("value", s => { brandsData = s.val() || {}; if (active("screen-admin")) fillBrandSelects(); });
    db.ref("data/version").on("value", s => { const v = s.val(); const t = v && v.lastUpdate ? new Date(v.lastUpdate).toLocaleDateString("fr-FR") : "--"; ["app-version","admin-version"].forEach(i => { const e = el(i); if (e) e.textContent = t; }); });
  }
  routeUser();
}
function routeUser() {
  const s = getSession(); if (!s || !s.prenom) { showScreen("screen-home"); return; }
  const k = Object.keys(usersData).find(x => usersData[x].prenom && usersData[x].prenom.toLowerCase() === s.prenom.toLowerCase());
  if (!k) { el("pending-name").textContent = s.prenom; showScreen("screen-pending"); return; }
  const st = usersData[k].status;
  if (s.lastStatus !== st) {
    s.lastStatus = st; saveSession(s);
    if (st === "accepted") { notify("✅ Accès autorisé — bienvenue " + s.prenom); pushNotif("✅ Accès autorisé", "Votre accès est actif."); }
    else if (st === "refused") { notify("❌ Demande refusée", "error"); pushNotif("❌ Accès refusé", "Demande refusée."); }
    else if (st === "revoked") { notify("🔒 Accès révoqué", "error"); pushNotif("🔒 Accès révoqué", "Accès révoqué."); }
  }
  s.status = st; saveSession(s);
  if (st === "accepted") { el("accepted-name").textContent = s.prenom; showScreen("screen-accepted"); }
  else if (st === "refused") showScreen("screen-refused");
  else if (st === "revoked") showScreen("screen-revoked");
  else { el("pending-name").textContent = s.prenom; showScreen("screen-pending"); }
}
async function requestAccess() {
  const p = el("input-prenom").value.trim(); if (p.length < 2) return notify("Prénom invalide", "error");
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  saveSession({ prenom: p, status: "pending", lastStatus: "pending", date: Date.now() });
  await dbSet("access/users/user_" + p.toLowerCase().replace(/[^a-z0-9]+/g, "_"), { prenom: p, status: "pending", device: deviceId(), date: Date.now() });
  el("pending-name").textContent = p; showScreen("screen-pending");
  notify("📨 Demande transmise"); pushNotif("📨 Demande envoyée", "Vous serez notifié à la validation.");
}
function checkStatus() { routeUser(); notify("🔄 Statut vérifié"); }
function resetSession() { localStorage.removeItem(SESSION_KEY); el("input-prenom").value = ""; showScreen("screen-home"); }
function loginAdmin() {
  if (val("admin-pwd") === ADMIN_PASSWORD) { sessionStorage.setItem("autodiag_admin", "1"); pwdTyped = false; el("admin-pwd").value = ""; showScreen("screen-admin"); renderAdmin(); fillBrandSelects(); }
  else notify("❌ Mot de passe incorrect", "error");
}
function logoutAdmin() { sessionStorage.removeItem("autodiag_admin"); pwdTyped = false; clearPwd(); showScreen("screen-home"); }
function adminTab(id) { el("tab-access").classList.toggle("hidden", id !== "tab-access"); el("tab-data").classList.toggle("hidden", id !== "tab-data"); if (id === "tab-data") fillBrandSelects(); }
function renderAdmin() {
  const c = el("users-table-container"), keys = Object.keys(usersData).sort((a, b) => (usersData[b].date || 0) - (usersData[a].date || 0));
  if (!keys.length) { c.innerHTML = '<p style="color:#94a3b8;text-align:center">Aucun tiers</p>'; return; }
  const L = { pending: "⏳ Attente", accepted: "✅ Accepté", refused: "❌ Refusé", revoked: "🔒 Révoqué" };
  let h = "<table><thead><tr><th>Prénom</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead><tbody>";
  keys.forEach(k => {
    const u = usersData[k], st = u.status || "pending"; let a = "";
    if (st === "pending") a += '<button class="btn btn-sm btn-success" data-a="accept" data-k="' + k + '">✓</button><button class="btn btn-sm btn-danger" data-a="refuse" data-k="' + k + '">✗</button>';
    else if (st === "accepted") a += '<button class="btn btn-sm btn-danger" data-a="revoke" data-k="' + k + '">Révoquer</button>';
    else a += '<button class="btn btn-sm btn-success" data-a="accept" data-k="' + k + '">Réautoriser</button>';
    a += '<button class="btn btn-sm btn-secondary" data-a="delete" data-k="' + k + '">🗑️</button>';
    h += "<tr><td>" + esc(u.prenom) + '</td><td><span class="badge badge-' + st + '">' + (L[st] || st) + '</span></td><td style="font-size:11px">' + (u.date ? new Date(u.date).toLocaleDateString("fr-FR") : "--") + "</td><td>" + a + "</td></tr>";
  });
  c.innerHTML = h + "</tbody></table>";
}
function bindAdminTable() {
  el("users-table-container").addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"); if (!b) return;
    const k = b.dataset.k, a = b.dataset.a;
    if (a === "delete") { if (confirm("Supprimer ce tiers ?")) db.ref("access/users/" + k).remove(); return; }
    db.ref("access/users/" + k).update({ status: a === "accept" ? "accepted" : a === "refuse" ? "refused" : "revoked" });
  });
}
async function addUser() {
  const p = el("new-prenom").value.trim(); if (p.length < 2) return notify("Prénom invalide", "error");
  await dbSet("access/users/user_" + p.toLowerCase().replace(/[^a-z0-9]+/g, "_"), { prenom: p, status: "accepted", device: "admin", date: Date.now() });
  el("new-prenom").value = ""; notify("✅ " + p + " autorisé");
}
function shareAPK() {
  if (!isAdmin()) return notify("❌ Réservé admin", "error");
  const u = new URL("./index.html", location.href).href;
  if (navigator.share) navigator.share({ title: "KEV FUSION 2026", text: "Installez l'application :", url: u }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => notify("🔗 Lien copié"));
  else prompt("Lien :", u);
}

/* ===== FORMULAIRES ===== */
function fillBrandSelects() {
  ["nm-brand","is-brand","ex-brand"].forEach(id => {
    const s = el(id); if (!s) return; const prev = s.value; s.innerHTML = "";
    Object.entries(brandsData).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, b]) => s.innerHTML += '<option value="' + k + '">' + esc(b.name) + "</option>");
    if (prev) s.value = prev;
  });
  fillModelSelect(); fillMotorSelectAdmin();
}
async function fillModelSelect() {
  const b = val("is-brand"), ms = await dbGet("data/models"), s = el("is-model"); if (!s) return;
  s.innerHTML = '<option value="">(tous modèles)</option>';
  Object.values(ms).filter(m => m.brandId === b).sort((a, c) => a.name.localeCompare(c.name)).forEach(m => s.innerHTML += '<option value="' + esc(m.name) + '">' + esc(m.name) + "</option>");
}
async function fillMotorSelectAdmin() {
  const ms = await dbGet("data/models"), s = el("mo-model"); if (!s) return;
  s.innerHTML = "";
  Object.entries(ms).sort((a, b) => (brandsData[a[1].brandId] ? brandsData[a[1].brandId].name : "").localeCompare(brandsData[b[1].brandId] ? brandsData[b[1].brandId].name : "")).forEach(([k, m]) => {
    const bn = brandsData[m.brandId] ? brandsData[m.brandId].name : m.brandId;
    s.innerHTML += '<option value="' + k + '">' + esc(bn + " " + m.name) + "</option>";
  });
}
async function addBrand() { const n = el("nb-name").value.trim(); if (!n) return notify("Nom requis", "error"); await dbSet("data/brands/" + n.toLowerCase().replace(/[^a-z0-9]+/g, "-"), { name: n, region: val("nb-region") }); el("nb-name").value = ""; notify("✅ Marque ajoutée"); }
async function addModel() { const b = val("nm-brand"), n = el("nm-name").value.trim(); if (!b || !n) return notify("Infos requises", "error"); await dbSet("data/models/" + b + "_" + Date.now(), { brandId: b, name: n, years: el("nm-years").value.trim() || "2017-2027" }); el("nm-name").value = ""; fillMotorSelectAdmin(); notify("✅ Modèle ajouté"); }
async function addMotor() {
  const mid = val("mo-model"), n = el("mo-name").value.trim(); if (!mid || !n) return notify("Infos requises", "error");
  const mo = (await db.ref("data/models/" + mid).once("value")).val();
  const cur = (await db.ref("data/motors/" + mid).once("value")).val() || [];
  cur.push(egFix(mo ? mo.brandId : null, { name: n, fuel: val("mo-fuel"), power: el("mo-power").value.trim() || guessPower(n) }).m);
  await dbSet("data/motors/" + mid, cur); el("mo-name").value = ""; notify("✅ Motorisation ajoutée (vérifiée)");
}
async function addIssue() {
  const t = el("is-title").value.trim(); if (!t) return notify("Titre requis", "error");
  await dbSet("data/issues/" + uid("is"), { brandId: val("is-brand"), model: val("is-model"), motor: "", title: t, detail: el("is-detail").value.trim(), source: val("is-source"), dtc: el("is-dtc").value.trim(), url: el("is-url").value.trim() });
  el("is-title").value = ""; el("is-detail").value = ""; notify("✅ Panne / campagne ajoutée");
}
async function addExpert() {
  const t = el("ex-title").value.trim(); if (!t) return notify("Titre requis", "error");
  await dbSet("data/expert/" + uid("ex"), { brandId: val("ex-brand"), model: el("ex-model").value.trim(), motor: el("ex-motor").value.trim(), type: el("ex-type").value.trim(), title: t, symptom: el("ex-symptom").value.trim(), diagnosis: el("ex-diag").value.trim(), parts: el("ex-parts").value.trim(), dtc: el("ex-dtc").value.trim(), years: el("ex-years").value.trim(), source: val("ex-source"), url: el("ex-url").value.trim() });
  el("ex-title").value = ""; el("ex-diag").value = ""; notify("🧠 Fiche expert ajoutée");
}
async function addDTC() {
  const c = el("dt-code").value.trim().toUpperCase(), d = el("dt-desc").value.trim(); if (!c || !d) return notify("Code + description requis", "error");
  await dbSet("data/dtc/" + c.replace(/[^A-Z0-9]+/g, "_"), { code: c, description: d, cause: el("dt-cause").value.trim(), solution: el("dt-sol").value.trim() });
  el("dt-code").value = ""; notify("✅ DTC ajouté");
}
async function importJSON() {
  const txt = el("import-json").value.trim(); if (!txt) return notify("Collez un JSON", "error");
  let arr; try { arr = JSON.parse(txt); } catch (e) { return notify("❌ JSON invalide", "error"); }
  if (!Array.isArray(arr)) arr = [arr];
  let n = 0;
  for (const it of arr) {
    if (it.type === "issue" && it.brand && it.title) { await dbSet("data/issues/" + uid("im"), { brandId: it.brand, model: it.model || "", motor: it.motor || "", title: it.title, detail: it.detail || "", source: it.source || "Import", dtc: it.dtc || "", url: it.url || "" }); n++; }
    else if (it.type === "expert" && it.brand && it.title) { await dbSet("data/expert/" + uid("im"), { brandId: it.brand, model: it.model || "", motor: it.motor || "", type: it.category || "", title: it.title, symptom: it.symptom || "", diagnosis: it.diagnosis || "", parts: it.parts || "", dtc: it.dtc || "", years: it.years || "", source: it.source || "Import", url: it.url || "" }); n++; }
    else if (it.type === "dtc" && it.code) { await dbSet("data/dtc/" + String(it.code).toUpperCase().replace(/[^A-Z0-9]+/g, "_"), { code: String(it.code).toUpperCase(), description: it.description || "", cause: it.cause || "", solution: it.solution || "" }); n++; }
  }
  el("import-json").value = ""; notify("✅ " + n + " fiches importées");
}

/* ===== EXPORT / RESTAURATION ===== */
async function buildExport() {
  const [marques, modeles, motorisations, pannes, expert, dtc, version] = await Promise.all(["data/brands","data/models","data/motors","data/issues","data/expert","data/dtc","data/version"].map(dbGet));
  return { app: "KEV FUSION 2026", exportVersion: 3, exportedAt: new Date().toISOString(), counts: { marques: Object.keys(marques).length, modeles: Object.keys(modeles).length, motorisations: Object.keys(motorisations).length, pannes: Object.keys(pannes).length, expert: Object.keys(expert).length, dtc: Object.keys(dtc).length }, marques, modeles, motorisations, pannes, expert, dtc, version };
}
async function exportJSON() {
  if (!isAdmin()) return notify("❌ Réservé admin", "error");
  notify("📤 Export en cours…");
  try {
    const p = await buildExport(), blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), d = new Date();
    const a = document.createElement("a"); a.href = url; a.download = "kev-fusion-export-" + d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + ".json";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    notify("✅ Export : " + p.counts.modeles + " modèles, " + (p.counts.pannes + p.counts.expert) + " fiches");
  } catch (e) { notify("❌ Export : " + e.message, "error"); }
}
async function copyJSON() {
  if (!isAdmin()) return notify("❌ Réservé admin", "error");
  try { const t = JSON.stringify(await buildExport(), null, 2); await navigator.clipboard.writeText(t); notify("📋 JSON copié (" + t.length + " car.)"); } catch (e) { notify("❌ Copie impossible", "error"); }
}
async function restoreJSON() {
  if (!isAdmin()) return notify("❌ Réservé admin", "error");
  const f = el("restore-file"); if (!f || !f.files[0]) return notify("Choisissez un fichier JSON", "error");
  notify("📥 Restauration…");
  try {
    const d = JSON.parse(await f.files[0].text()); let n = 0;
    for (const [k, v] of Object.entries(d.marques || {})) { if (!(await db.ref("data/brands/" + k).once("value")).exists()) { await dbSet("data/brands/" + k, v); n++; } }
    const ex = await dbGet("data/models"), byName = {}; Object.values(ex).forEach(m => byName[m.brandId + "|" + String(m.name).toLowerCase()] = 1);
    const idMap = {};
    for (const [k, m] of Object.entries(d.modeles || {})) {
      const key = m.brandId + "|" + String(m.name).toLowerCase();
      if (byName[key]) { idMap[k] = Object.keys(ex).find(i => ex[i].brandId === m.brandId && String(ex[i].name).toLowerCase() === String(m.name).toLowerCase()); continue; }
      const nid = "r_" + k; await dbSet("data/models/" + nid, m); byName[key] = 1; idMap[k] = nid; n++;
    }
    for (const [k, list] of Object.entries(d.motorisations || {})) {
      const nid = idMap[k]; if (!nid || !Array.isArray(list)) continue;
      const cur = (await db.ref("data/motors/" + nid).once("value")).val() || [], have = {}; cur.forEach(x => have[String(x.name).toLowerCase()] = 1);
      let ch = false; list.forEach(x => { if (!have[String(x.name).toLowerCase()]) { cur.push(x); ch = true; } });
      if (ch) { await dbSet("data/motors/" + nid, cur); n++; }
    }
    for (const key of ["pannes","expert"]) {
      const path = key === "pannes" ? "data/issues" : "data/expert";
      const cur = await dbGet(path), t = {}; Object.values(cur).forEach(x => t[String(x.title).toLowerCase()] = 1);
      for (const v of Object.values(d[key] || {})) { if (t[String(v.title).toLowerCase()]) continue; await dbSet(path + "/" + uid("rs"), v); n++; }
    }
    for (const [k, v] of Object.entries(d.dtc || {})) { if (!(await db.ref("data/dtc/" + k).once("value")).exists()) { await dbSet("data/dtc/" + k, v); n++; } }
    notify("✅ Restauration : " + n + " éléments ajoutés");
  } catch (e) { notify("❌ Fichier invalide : " + e.message, "error"); }
}

/* ===== SOURCES ===== */
function slink(l, u) { return '<a class="srclink" target="_blank" rel="noopener" href="' + u + '">' + l + "</a>"; }
function sourceLinks(q) {
  const e = encodeURIComponent(q), dom = BRAND_SITE[curBrand] || "", code = /^[pubc]\d{3,4}$/i.test(q.trim());
  let h = '<div class="issue-card deep"><strong>🌐 Recherche approfondie multi-sources : « ' + esc(q) + ' »</strong><p style="margin:8px 0 4px">';
  if (dom) h += slink("🏭 Constructeur", "https://www.google.com/search?q=site:" + dom + "+rappel+campagne+TSB+" + e);
  h += slink("🇫🇷 Rappel Conso", "https://www.google.com/search?q=site:rappel.conso.gouv.fr+" + e);
  h += slink("🇫🇷 Rappel Conso (site)", "https://www.rappel.conso.gouv.fr/");
  h += slink("🇪🇺 Safety Gate", "https://ec.europa.eu/safety-gate-alerts/screen/webReport/searchAdvanced");
  h += slink("🇪🇺 Safety Gate (recherche)", "https://www.google.com/search?q=site:ec.europa.eu+safety+gate+" + e);
  h += slink("🇺🇸 NHTSA", "https://www.nhtsa.gov/recalls");
  h += slink("🇺🇸 NHTSA (recherche)", "https://www.google.com/search?q=site:nhtsa.gov+" + e);
  h += slink("🇬🇧 GOV.UK", "https://www.gov.uk/check-vehicle-recall");
  h += slink("🇩🇪 KBA", "https://www.kba.de/DE/Home/home_node.html");
  h += slink("📰 L'Argus", "https://www.google.com/search?q=site:largus.fr+" + e);
  h += slink("📰 Caradisiac", "https://www.google.com/search?q=site:caradisiac.com+" + e);
  h += slink("📰 Auto Plus", "https://www.google.com/search?q=site:autoplus.fr+" + e);
  h += slink("📰 Auto Moto", "https://www.google.com/search?q=site:automoto.com+" + e);
  h += slink("📰 Turbo", "https://www.google.com/search?q=site:turbo.fr+" + e);
  h += slink("📰 Motorlegend", "https://www.google.com/search?q=site:motorlegend.com+" + e);
  h += slink("⚖️ Que Choisir", "https://www.google.com/search?q=site:que-choisir.org+" + e);
  h += slink("⚖️ 60 Millions", "https://www.google.com/search?q=site:60millions-mag.com+" + e);
  h += slink("💬 Forum Auto", "https://www.google.com/search?q=site:forum-auto.caradisiac.com+" + e);
  h += slink("💬 Futura Auto", "https://www.google.com/search?q=site:forums.futura-sciences.com+auto+" + e);
  if (code) { h += slink("🔧 OBD-Codes", "https://www.obd-codes.com/" + q.trim().toLowerCase()); h += slink("🔧 Signification DTC", "https://www.google.com/search?q=" + e + "+code+defaut+signification"); }
  h += slink("🔎 Internet (avis/pannes)", "https://www.google.com/search?q=" + e + "+rappel+campagne+panne+probleme+avis");
  h += slink("🔎 TSB / bulletins", "https://www.google.com/search?q=" + e + "+TSB+bulletin+service+technique");
  return h + "</p></div>";
}

/* ===== CARTES ===== */
function srcLink(u) { return u ? '<p><a href="' + esc(u) + '" target="_blank" rel="noopener" style="color:#4ade80;font-size:12px;font-weight:600">🔗 Source officielle / spécialisée</a></p>' : ""; }
function univCard(u) { return '<div class="issue-card camp"><strong>🌐 ' + esc(u[0]) + '</strong><span class="src">' + esc(u[3]) + "</span><p>" + esc(u[1]) + "</p>" + (u[2] ? '<p class="dtcline">DTC : ' + esc(u[2]) + "</p>" : "") + "</div>"; }
function listCard(g) { return '<div class="issue-card deep"><strong>🔬 ' + esc(g[2]) + '</strong><span class="src">' + esc(g[1]) + '</span><span class="src">Procédure systématique</span><p><b>⚠️ Symptômes :</b> ' + esc(g[3]) + "</p><p><b>🧪 Protocole :</b> " + esc(g[4]) + "</p><p><b>🔩 Organes :</b> " + esc(g[5]) + "</p>" + (g[6] ? '<p class="dtcline">🔗 DTC : ' + esc(g[6]) + "</p>" : "") + '<p class="meta">Source : ' + esc(g[7]) + "</p></div>"; }
function issueCard(i, p) { return '<div class="issue-card"><strong>' + (p || "") + esc(i.title) + '</strong><span class="src">' + esc(i.source || "") + "</span>" + (i.motor ? '<span class="src">' + esc(i.motor) + "</span>" : "") + "<p>" + esc(i.detail || i.symptom || "") + "</p>" + (i.dtc ? '<p class="dtcline">DTC : ' + esc(i.dtc) + "</p>" : "") + srcLink(i.url) + "</div>"; }
function expertCard(e, p) {
  const bn = brandsData[e.brandId] ? brandsData[e.brandId].name : "";
  return '<div class="issue-card camp"><strong>' + (p || "") + esc(e.title) + '</strong><span class="src">🧠 ' + esc(e.source || "Expert") + "</span>" + (e.type ? '<span class="src">🔬 ' + esc(e.type) + "</span>" : "") + (bn ? '<span class="src">' + esc(bn) + "</span>" : "") + (e.model ? '<span class="src">' + esc(e.model) + "</span>" : "") + (e.motor ? '<span class="src">' + esc(e.motor) + "</span>" : "") +
    (e.symptom ? "<p><b>⚠️ Symptômes :</b> " + esc(e.symptom) + "</p>" : "") +
    (e.diagnosis ? "<p><b>🔬 Protocole ingénieur :</b> " + esc(e.diagnosis) + "</p>" : "") +
    (e.parts ? "<p><b>🔩 Organes :</b> " + esc(e.parts) + "</p>" : "") +
    (e.dtc ? '<p class="dtcline">🔗 DTC : ' + esc(e.dtc) + "</p>" : "") +
    (e.years ? '<p class="meta">Années : ' + esc(e.years) + "</p>" : "") + srcLink(e.url) + "</div>";
}
function arrToExpert(e) { return { brandId: e[0], motor: e[1], type: e[2], title: e[3], symptom: e[4], diagnosis: e[5], parts: e[6], dtc: e[7], source: e[8], years: e[9], model: "" }; }
function fuelCards(f) {
  let h = "";
  EV_LIST.forEach(g => { if ((g[0] === "E" && f === "electrique") || (g[0] === "EH" && (f === "electrique" || f === "hybride"))) h += listCard(g); });
  TH_LIST.forEach(g => { if ((g[0] === "GD" && (f === "essence" || f === "diesel")) || (g[0] === "G" && f === "essence") || (g[0] === "D" && f === "diesel")) h += listCard(g); });
  HY_LIST.forEach(g => { if (g[0] === "H" && f === "hybride") h += listCard(g); });
  return h;
}

/* ===== RECHERCHE ===== */
let eT = null;
function expertSearch() { clearTimeout(eT); eT = setTimeout(doExpertSearch, 250); }
function qs(t) { const i = el("expert-search"); if (i) i.value = t; expertSearch(); }
async function doExpertSearch() {
  const q = val("expert-search").trim().toLowerCase(), box = el("expert-results");
  if (q.length < 3) { box.innerHTML = ""; return; }
  const ex = await dbGet("data/expert"), iss = await dbGet("data/issues");
  let h = "";
  Object.values(ex).filter(e => [e.title,e.type,e.symptom,e.diagnosis,e.parts,e.dtc,e.motor,e.model].join(" ").toLowerCase().includes(q)).slice(0, 20).forEach(e => h += expertCard(e, "🧠 "));
  Object.values(iss).filter(i => [i.title,i.detail,i.dtc,i.model].join(" ").toLowerCase().includes(q)).slice(0, 15).forEach(i => h += issueCard(i));
  EXPERT.filter(e => e.slice(2, 8).join(" ").toLowerCase().includes(q)).slice(0, 20).forEach(e => h += expertCard(arrToExpert(e), "🧠 "));
  UNIV.filter(u => (u[0] + " " + u[1]).toLowerCase().includes(q)).forEach(u => h += univCard(u));
  EV_LIST.concat(TH_LIST, HY_LIST).filter(g => g.slice(1, 7).join(" ").toLowerCase().includes(q)).forEach(g => h += listCard(g));
  Object.entries(GENERIC).forEach(([f, g]) => g.issues.forEach(i => { if ((i[0] + " " + i[1]).toLowerCase().includes(q)) h += '<div class="issue-card"><strong>' + esc(i[0]) + '</strong><span class="src">Typique ' + FUELS[f] + "</span><p>" + esc(i[1]) + '</p><p class="dtcline">DTC : ' + esc(i[2]) + "</p></div>"; }));
  Object.entries(GENERIC_EXPERT).forEach(([f, l]) => l.forEach(g => { if ((g[0] + " " + g[1] + " " + g[2]).toLowerCase().includes(q)) h += '<div class="issue-card deep"><strong>🔬 ' + esc(g[0]) + '</strong><span class="src">Ingénieur ' + FUELS[f] + "</span><p><b>Symptômes :</b> " + esc(g[1]) + "</p><p><b>Protocole :</b> " + esc(g[2]) + "</p><p><b>Organes :</b> " + esc(g[3]) + '</p><p class="dtcline">DTC : ' + esc(g[4]) + "</p></div>"; }));
  h += sourceLinks(q);
  box.innerHTML = h;
}

/* ===== APP ===== */
async function buildBrandSelect() {
  brandsData = await dbGet("data/brands");
  const sel = el("sel-marque"); if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">-- Choisir une marque --</option>';
  Object.entries(REGIONS).forEach(([r, label]) => {
    const items = Object.entries(brandsData).filter(([, b]) => b.region === r).sort((a, b) => a[1].name.localeCompare(b[1].name));
    if (!items.length) return;
    sel.innerHTML += '<optgroup label="' + label + '">' + items.map(([k, b]) => '<option value="' + k + '">' + esc(b.name) + "</option>").join("") + "</optgroup>";
  });
  if (prev) sel.value = prev;
}
async function enterApp() {
  const s = getSession();
  if (!isAdmin() && (!s || s.status !== "accepted")) return notify("Accès non autorisé", "error");
  showScreen("screen-app");
  el("app-user").textContent = isAdmin() ? "👑 Admin" : s.prenom;
  await ensureCatalog(false);
  syncScheduler();
  await buildBrandSelect();
}
function logoutApp() { showScreen(isAdmin() ? "screen-admin" : "screen-accepted"); }
async function loadModels() {
  curBrand = val("sel-marque"); curModelId = null; curModelName = null; motorsCache = [];
  el("sel-model").innerHTML = '<option value="">-- Modèle --</option>';
  el("sel-motor").innerHTML = '<option value="">-- Motorisation --</option>';
  ["issues-box","expert-box","dtc-box","maint-box"].forEach(i => { const e = el(i); if (e) e.innerHTML = '<p style="color:#94a3b8">Sélectionnez…</p>'; });
  if (!curBrand) return;
  const ms = await dbGet("data/models");
  Object.entries(ms).filter(([, m]) => m.brandId === curBrand).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([k, m]) => {
    el("sel-model").innerHTML += '<option value="' + k + '">' + esc(m.name) + " (" + esc(m.years) + ")</option>";
  });
}
async function loadMotors() {
  curModelId = val("sel-model"); motorsCache = []; curModelName = null;
  el("sel-motor").innerHTML = '<option value="">-- Motorisation --</option>';
  if (!curModelId) { correlate(); return; }
  const m = (await db.ref("data/models/" + curModelId).once("value")).val();
  curModelName = m ? m.name : "";
  motorsCache = (await db.ref("data/motors/" + curModelId).once("value")).val() || [];
  motorsCache.forEach((mo, i) => {
    el("sel-motor").innerHTML += '<option value="' + i + '">' + esc(mo.name) + " • " + (FUELS[mo.fuel] || mo.fuel) + (mo.power ? " • " + esc(mo.power) : "") + "</option>";
  });
  correlate();
}

/* ===== CORRÉLATION : pannes → expert → DTC → MAINTENANCE ===== */
async function correlate() {
  const box = el("issues-box"), ebox = el("expert-box"), dbox = el("dtc-box"), mbox = el("maint-box");
  if (!curBrand || !curModelName) { [box,ebox,dbox,mbox].forEach(b => { if (b) b.innerHTML = '<p style="color:#94a3b8">Sélectionnez un véhicule…</p>'; }); return; }
  const mi = val("sel-motor"), motor = mi !== "" ? motorsCache[mi] : null, fuel = motor ? motor.fuel : null;
  const bn = brandsData[curBrand] ? brandsData[curBrand].name : curBrand;

  /* 1. PANNES & CAMPAGNES */
  const all = Object.values(await dbGet("data/issues")).filter(i => i.brandId === curBrand && fuzzy(i.model, curModelName));
  const spec = motor ? all.filter(i => i.motor && motorMatch(i.motor, motor)) : [];
  const gen = all.filter(i => !spec.includes(i));
  let h = "", hidden = 0;
  spec.forEach(i => h += issueCard(i, "🎯 "));
  if (motor) { gen.forEach(i => { const f = fuelOf([i.title,i.detail,i.motor].join(" ")); if (!f || compat(f, fuel)) h += issueCard(i); else hidden++; }); }
  else gen.forEach(i => h += issueCard(i));
  CAMPAIGNS.filter(c => c[0] === curBrand && fuzzy(c[1], curModelName) && (!c[2] || motorMatch(c[2], motor))).forEach(c => {
    if (!all.some(a => a.title === c[3])) h += issueCard({ title: c[3], detail: c[4], source: c[5], dtc: c[6], url: c[7], motor: c[2] }, "📢 ");
  });
  if (hidden) h += '<p class="meta">🔎 ' + hidden + " fiche(s) d'autres motorisations masquée(s) — filtre : " + FUELS[fuel] + " (" + esc(motor.name) + ")</p>";
  if (fuel && GENERIC[fuel]) GENERIC[fuel].issues.forEach(g => h += '<div class="issue-card"><strong>' + esc(g[0]) + '</strong><span class="src">Typique ' + FUELS[fuel] + "</span><p>" + esc(g[1]) + '</p><p class="dtcline">DTC : ' + esc(g[2]) + "</p></div>");
  UNIV.forEach(u => h += univCard(u));
  h += sourceLinks(bn + " " + curModelName + (motor ? " " + motor.name : "") + " rappel panne TSB");
  box.innerHTML = h;

  /* 2. FICHES EXPERT */
  const exAll = Object.values(await dbGet("data/expert"));
  const exHits = exAll.filter(e => e.brandId === curBrand && fuzzy(e.model, curModelName) && motorMatch(e.motor, motor) && (e.motor || titleOk(e.title + " " + (e.symptom || ""), motor)));
  const bex = EXPERT.filter(e => e[0] === curBrand && kwMatch(e[1], motor) && (e[1] || titleOk(e[2] + " " + e[3] + " " + e[4], motor)));
  let eh = "";
  exHits.forEach(e => eh += expertCard(e, "🧠 "));
  bex.forEach(e => eh += expertCard(arrToExpert(e), "🧠 "));
  if (fuel && GENERIC_EXPERT[fuel]) GENERIC_EXPERT[fuel].forEach(g => eh += '<div class="issue-card deep"><strong>🔬 ' + esc(g[0]) + '</strong><span class="src">Ingénieur ' + FUELS[fuel] + "</span><p><b>Symptômes :</b> " + esc(g[1]) + "</p><p><b>Protocole :</b> " + esc(g[2]) + "</p><p><b>Organes :</b> " + esc(g[3]) + '</p><p class="dtcline">DTC : ' + esc(g[4]) + "</p></div>");
  eh += fuelCards(fuel);
  if (motor) {
    const q = val("expert-search") || "";
    let tech = null;
    for (const [t, kws] of Object.entries(TECH_MAP)) if (kws.some(k => q.toLowerCase().includes(k))) { tech = t; break; }
    if (!tech) tech = fuel === "electrique" ? "bms" : fuel === "hybride" ? "bms" : fuel === "diesel" ? "egr" : "injection";
    const yr = (String(curModelName).match(/20\d{2}/) || ["2020"])[0];
    const norm = parseInt(yr) >= 2024 ? "Euro 6E / Euro 7" : (fuel === "electrique" || fuel === "hybride" ? "WLTP / ISO 26262" : "Euro 6D / RDE");
    eh += '<hr class="sep"><h4 class="deepTitle">🤖 Analyse ingénieur automatique</h4>';
    eh += '<div class="issue-card deep"><strong>🔬 Diagnostic ' + tech.toUpperCase() + " — " + esc(bn) + " " + esc(curModelName) + '</strong><span class="src">Ingénieur sapiteur</span><div class="deepbox"><b>🧪 Protocole :</b><br>' + esc(TECH_PROTOCOL[tech]) + "<br><b>🔩 Organes clés :</b> " + esc(TECH_ORGANS[tech]) + '<br><b>🔗 DTC :</b> <span class="dtcinline">' + esc(TECH_DTC[tech]) + "</span></div></div>";
    eh += '<div class="issue-card deep"><strong>⚖️ Conformité ' + norm + ' & veille rappels</strong><div class="regbox">Vérifiez le VIN sur Rappel Conso, Safety Gate, NHTSA, KBA et le portail constructeur. Toute campagne ouverte lie la garantie et la sécurité — contrôle obligatoire avant restitution.</div></div>';
  }
  ebox.innerHTML = eh;

  /* 3. DTC */
  const codes = new Set(), add = s => String(s || "").split(/[,\/\s]+/).forEach(c => { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); });
  all.forEach(i => { const f = fuelOf([i.title,i.detail].join(" ")); if (motor && f && !compat(f, fuel)) return; add(i.dtc); });
  exHits.forEach(e => add(e.dtc)); bex.forEach(e => add(e[7])); UNIV.forEach(u => add(u[2]));
  if (fuel && GENERIC[fuel]) GENERIC[fuel].dtc.forEach(c => codes.add(c));
  if (fuel && GENERIC_EXPERT[fuel]) GENERIC_EXPERT[fuel].forEach(g => add(g[4]));
  EV_LIST.concat(TH_LIST, HY_LIST).forEach(g => { if ((g[0] === "E" && fuel === "electrique") || (g[0] === "EH" && (fuel === "electrique" || fuel === "hybride")) || (g[0] === "GD" && (fuel === "essence" || fuel === "diesel")) || (g[0] === "G" && fuel === "essence") || (g[0] === "D" && fuel === "diesel") || (g[0] === "H" && fuel === "hybride")) add(g[6]); });
  const D = await dbGet("data/dtc"); let dh = "";
  codes.forEach(c => {
    const d = D[c] || D[c.replace(/[^A-Z0-9]+/g, "_")];
    dh += d ? '<div class="dtc-card"><strong>' + esc(d.code) + "</strong><p>" + esc(d.description) + "</p>" + (d.cause ? "<p>🔍 " + esc(d.cause) + "</p>" : "") + (d.solution ? "<p>🔧 " + esc(d.solution) + "</p>" : "") + slink("🔎 Fiche OBD", "https://www.obd-codes.com/" + c.toLowerCase()) + "</div>"
            : '<div class="dtc-card"><strong>' + esc(c) + '</strong><p>Code corrélé au véhicule.</p>' + slink("🔎 Fiche OBD", "https://www.obd-codes.com/" + c.toLowerCase()) + "</div>";
  });
  dbox.innerHTML = dh || '<p style="color:#94a3b8">—</p>';

  /* 4. MAINTENANCE — appel natif, garanti */
  if (mbox) {
    if (typeof buildMaintenanceHTML === "function") mbox.innerHTML = buildMaintenanceHTML(curBrand, curModelName, motor);
    else mbox.innerHTML = '<p style="color:#ef4444">⚠️ Module maintenance non chargé (maintenance.js).</p>';
  }

  /* Historique */
  try {
    const hist = JSON.parse(localStorage.getItem("autodiag_hist") || "[]");
    const entry = { date: new Date().toISOString(), marque: bn, modele: curModelName, motorisation: motor ? motor.name : "" };
    const last = hist[0];
    if (!last || last.marque !== entry.marque || last.modele !== entry.modele || last.motorisation !== entry.motorisation) {
      hist.unshift(entry); localStorage.setItem("autodiag_hist", JSON.stringify(hist.slice(0, 60)));
    }
  } catch (e) {}
}
let dT = null;
function searchDTC() { clearTimeout(dT); dT = setTimeout(doSearchDTC, 250); }
async function doSearchDTC() {
  const q = val("dtc-search").toUpperCase().trim(), c = el("dtc-results");
  if (q.length < 2) { c.innerHTML = ""; return; }
  const m = Object.values(await dbGet("data/dtc")).filter(d => (d.code || "").toUpperCase().includes(q) || (d.description || "").toLowerCase().includes(q.toLowerCase()));
  let h = m.length ? m.slice(0, 15).map(d => '<div class="dtc-card"><strong>' + esc(d.code) + "</strong><p>" + esc(d.description) + "</p>" + (d.cause ? "<p>🔍 " + esc(d.cause) + "</p>" : "") + (d.solution ? "<p>🔧 " + esc(d.solution) + "</p>" : "") + slink("🔎 Fiche OBD", "https://www.obd-codes.com/" + String(d.code).toLowerCase()) + "</div>").join("") : '<p style="color:#94a3b8">Aucun DTC en base — consultez les sources ci-dessous.</p>';
  c.innerHTML = h + sourceLinks(q);
}

/* ===== HISTORIQUE / RAPPORT ===== */
function toggleHistory() {
  const b = el("hist-box"); if (!b) return;
  b.classList.toggle("hidden"); if (b.classList.contains("hidden")) return;
  let h = []; try { h = JSON.parse(localStorage.getItem("autodiag_hist") || "[]"); } catch (e) {}
  b.innerHTML = h.length ? h.map(x => '<p class="meta">📅 ' + new Date(x.date).toLocaleString("fr-FR") + " — <b>" + esc(x.marque) + " " + esc(x.modele) + "</b> " + esc(x.motorisation || "") + "</p>").join("") + '<button class="btn btn-danger btn-sm" onclick="clearHistory()">🗑️ Effacer</button>' : '<p style="color:#94a3b8">Aucun historique.</p>';
}
function clearHistory() { localStorage.removeItem("autodiag_hist"); const b = el("hist-box"); if (b) b.innerHTML = '<p style="color:#94a3b8">Aucun historique.</p>'; }
function printReport() {
  const bn = brandsData[curBrand] ? brandsData[curBrand].name : (curBrand || ""), mi = val("sel-motor"), motor = mi !== "" ? motorsCache[mi] : null;
  const pr = el("print-report");
  pr.innerHTML = "<h1>🚗 KEV FUSION 2026 — Rapport de diagnostic & entretien</h1><p>Date : " + new Date().toLocaleString("fr-FR") + " • Appareil : " + esc(deviceId()) + "</p><p>Véhicule : <b>" + esc(bn) + " " + esc(curModelName || "") + "</b></p><p>Motorisation : <b>" + esc(motor ? motor.name + " • " + (FUELS[motor.fuel] || "") + " • " + (motor.power || "") : "non sélectionnée") + "</b></p><h2>⚠️ Pannes & campagnes</h2>" + (el("issues-box") ? el("issues-box").innerHTML : "") + "<h2>🧠 Fiches expert</h2>" + (el("expert-box") ? el("expert-box").innerHTML : "") + "<h2>🔧 DTC</h2>" + (el("dtc-box") ? el("dtc-box").innerHTML : "") + "<h2>🧰 Plan d'entretien</h2>" + (el("maint-box") ? el("maint-box").innerHTML : "");
  window.print();
}

/* ===== INSTALL ===== */
function setupInstall() {
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; const b = el("install-btn"); if (b) b.classList.remove("hidden"); });
  window.addEventListener("appinstalled", () => { const b = el("install-btn"); if (b) b.classList.add("hidden"); notify("🎉 Application installée"); });
}
async function installApp() { if (!deferredPrompt) return notify("Installation non disponible ici", "error"); deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; const b = el("install-btn"); if (b) b.classList.add("hidden"); }
