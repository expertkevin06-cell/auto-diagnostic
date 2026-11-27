/* ═══════════════════════════════════════════════════════════════
   KEV FUSION 2026 — FIX-FILTERS v1
   Corrige le mode prédictif marque → modèle → motorisation.
   Charge APRÈS perf.js pour surcharger proprement.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (typeof window === "undefined") return;

  /* ── helpers ── */
  function el(i) { return document.getElementById(i); }
  function val(i) { var e = el(i); return e ? e.value : ""; }
  function esc(s) { var d = document.createElement("div"); d.textContent = String(s == null ? "" : s); return d.innerHTML; }
  function fmt(n) { return Number(n).toLocaleString("fr-FR"); }

  /* ── Lecture Firebase DIRECTE (sans cache stale) pour les listes de sélection ── */
  async function freshRead(path) {
    if (typeof db === "undefined") return {};
    try {
      const s = await Promise.race([
        db.ref(path).once("value"),
        new Promise((_, rj) => setTimeout(() => rj(new Error("timeout")), 6000))
      ]);
      const v = s.val();
      /* met à jour le miroir local pour le mode hors-ligne */
      try { localStorage.setItem("mir_" + path, JSON.stringify(v || {})); } catch (e) {}
      return v || {};
    } catch (e) {
      /* fallback : miroir local */
      try { return JSON.parse(localStorage.getItem("mir_" + path) || "{}"); } catch (x) { return {}; }
    }
  }

  /* ── LOAD MODELS (surcharge robuste) ── */
  window.loadModels = async function () {
    curBrand = val("sel-marque");
    curModelId = null;
    curModelName = null;
    motorsCache = [];
    massResult = null;

    const sm = el("sel-model");
    const so = el("sel-motor");
    if (sm) sm.innerHTML = '<option value="">-- Chargement…</option>';
    if (so) so.innerHTML = '<option value="">-- Motorisation --</option>';
    ["issues-box", "expert-box", "dtc-box", "maint-box", "tsb-box", "mass-box"].forEach(function (i) {
      var e = el(i); if (e) e.innerHTML = '<p class="muted">Sélectionnez un modèle…</p>';
    });

    if (!curBrand) {
      if (sm) sm.innerHTML = '<option value="">-- Modèle --</option>';
      return;
    }

    /* Lecture DIRECTE (pas de cache stale) */
    var models = await freshRead("data/models");
    var list = Object.entries(models)
      .filter(function (a) { return a[1] && a[1].brandId === curBrand; })
      .sort(function (a, b) { return (a[1].name || "").localeCompare(b[1].name || ""); });

    var html = '<option value="">-- Modèle --</option>';
    list.forEach(function (a) {
      html += '<option value="' + a[0] + '">' + esc(a[1].name) + " (" + esc(a[1].years || "") + ")</option>";
    });
    if (sm) sm.innerHTML = html;

    var c = el("model-count");
    if (c) c.textContent = list.length + " modèle(s) pour cette marque";

    /* Préchauffe le cache dbGet pour les lectures suivantes */
    if (typeof window.dbGet === "function") {
      try { window.dbGet("data/models"); } catch (e) {}
    }
  };

  /* ── LOAD MOTORS (surcharge robuste) ── */
  window.loadMotors = async function () {
    curModelId = val("sel-model");
    motorsCache = [];
    curModelName = null;
    massResult = null;

    const so = el("sel-motor");
    if (so) so.innerHTML = '<option value="">-- Chargement…</option>';

    if (!curModelId) {
      if (so) so.innerHTML = '<option value="">-- Motorisation --</option>';
      /* Déclenche correlate() pour vider les boîtes */
      if (typeof correlate === "function") correlate();
      return;
    }

    /* Lectures parallèles DIRECTES */
    var results = await Promise.all([
      freshRead("data/models/" + curModelId),
      freshRead("data/motors/" + curModelId)
    ]);
    var modelData = results[0];
    var motorsData = results[1];

    curModelName = (modelData && modelData.name) ? modelData.name : "";
    motorsCache = Array.isArray(motorsData) ? motorsData : [];

    var html = '<option value="">-- Motorisation --</option>';
    motorsCache.forEach(function (mo, i) {
      var fuelLabel = (typeof FUELS !== "undefined" && FUELS[mo.fuel]) ? FUELS[mo.fuel] : (mo.fuel || "");
      html += '<option value="' + i + '">' + esc(mo.name) + (fuelLabel ? " • " + fuelLabel : "") + (mo.power ? " • " + esc(mo.power) : "") + "</option>";
    });
    if (so) so.innerHTML = html;

    var c = el("motor-count");
    if (c) c.textContent = motorsCache.length + " motorisation(s) / puissance(s)";

    /* Lance la corrélation immédiatement */
    if (typeof correlate === "function") correlate();
  };

  /* ── CORRELATE (surcharge : lectures parallèles + rendu chunké) ── */
  if (typeof window.correlate === "function") {
    var rawCorrelate = window.correlate;
    window.correlate = async function () {
      const box = el("issues-box"), ebox = el("expert-box"), dbox = el("dtc-box"),
            mbox = el("maint-box"), tbox = el("tsb-box");

      if (!curBrand || !curModelName) {
        [box, ebox, dbox, mbox, tbox].forEach(function (b) { if (b) b.innerHTML = '<p class="muted">Sélectionnez un véhicule…</p>'; });
        return;
      }

      /* Affiche un état de chargement léger */
      [box, ebox, dbox, mbox, tbox].forEach(function (b) {
        if (b) b.innerHTML = '<p class="muted perf-spin">Corrélation en cours…</p>';
      });

      /* Lectures PARALLÈLES (au lieu de séquentielles) */
      var reads = await Promise.all([
        freshRead("data/issues"),
        freshRead("data/expert"),
        freshRead("data/dtc")
      ]);
      var allIssues = reads[0], allExpert = reads[1], allDtc = reads[2];

      const mi = val("sel-motor");
      const motor = mi !== "" ? motorsCache[mi] : null;
      const fuel = motor ? motor.fuel : null;
      const bn = (typeof brandsData !== "undefined" && brandsData[curBrand]) ? brandsData[curBrand].name : curBrand;

      /* ── 1. PANNES ── */
      var issuesArr = Object.values(allIssues || {}).filter(function (i) {
        return i && i.brandId === curBrand && (typeof fuzzy === "function" ? fuzzy(i.model, curModelName) : (!i.model || i.model === curModelName));
      });
      var spec = motor ? issuesArr.filter(function (i) { return i.motor && (typeof motorMatch === "function" ? motorMatch(i.motor, motor) : String(motor.name).toLowerCase().includes(String(i.motor).toLowerCase())); }) : [];
      var gen = issuesArr.filter(function (i) { return spec.indexOf(i) === -1; });
      var h = "", hidden = 0;
      spec.forEach(function (i) { h += (typeof issueCard === "function" ? issueCard(i, "🎯 ") : ""); });
      if (motor) {
        gen.forEach(function (i) {
          var f = (typeof fuelOf === "function") ? fuelOf([i.title, i.detail, i.motor].join(" ")) : null;
          if (!f || (typeof compat === "function" ? compat(f, fuel) : true)) h += (typeof issueCard === "function" ? issueCard(i) : "");
          else hidden++;
        });
      } else {
        gen.forEach(function (i) { h += (typeof issueCard === "function" ? issueCard(i) : ""); });
      }
      /* Campagnes statiques */
      if (typeof CAMPAIGNS !== "undefined") {
        CAMPAIGNS.filter(function (c) {
          return c[0] === curBrand && (typeof fuzzy === "function" ? fuzzy(c[1], curModelName) : (!c[1] || c[1] === curModelName)) && (!c[2] || (motor && (typeof motorMatch === "function" ? motorMatch(c[2], motor) : true)));
        }).forEach(function (c) {
          if (!issuesArr.some(function (a) { return a.title === c[3]; })) {
            h += (typeof issueCard === "function" ? issueCard({ title: c[3], detail: c[4], source: c[5], dtc: c[6], url: c[7], motor: c[2] }, "📢 ") : "");
          }
        });
      }
      if (hidden) h += '<p class="meta">🔎 ' + hidden + " fiche(s) d'autres motorisations masquée(s) — filtre : " + ((typeof FUELS !== "undefined" && FUELS[fuel]) || fuel) + " (" + esc(motor.name) + ")</p>";
      if (fuel && typeof GENERIC !== "undefined" && GENERIC[fuel]) {
        GENERIC[fuel].issues.forEach(function (g) {
          h += '<div class="issue-card"><strong>' + esc(g[0]) + '</strong><span class="src">Typique ' + ((typeof FUELS !== "undefined" && FUELS[fuel]) || fuel) + '</span><p>' + esc(g[1]) + '</p><p class="dtcline">DTC : ' + esc(g[2]) + "</p></div>";
        });
      }
      if (typeof UNIV !== "undefined") UNIV.forEach(function (u) { h += (typeof univCard === "function" ? univCard(u) : ""); });
      h += (typeof sourceLinks === "function" ? sourceLinks(bn + " " + curModelName + (motor ? " " + motor.name : "") + " rappel panne TSB") : "");
      if (box) box.innerHTML = h || '<p class="muted">Aucune panne en base — consultez les sources officielles.</p>';

      /* ── 2. TSB / Bulletins ── */
      if (tbox) {
        var bl = (typeof BULLETINS !== "undefined") ? BULLETINS.filter(function (b) { return b[1] === curBrand || (b[3] && curModelName && b[3].toLowerCase().includes(String(curModelName).split(" ")[0].toLowerCase())); }) : [];
        var thtml = bl.length ? bl.map(function (b) { return (typeof bulletinCard === "function" ? bulletinCard(b) : ""); }).join("") : '<p class="muted">Aucun bulletin spécifique en base — consultez la recherche TSB ci-dessous.</p>';
        thtml += '<div class="issue-card deep"><strong>📄 Veille bulletins techniques</strong><p class="linkwrap">' +
          (typeof slink === "function" ? slink("🔎 TSB " + esc(bn), "https://www.google.com/search?q=" + encodeURIComponent(bn + " " + curModelName) + "+TSB+technical+service+bulletin") : "") +
          (typeof slink === "function" ? slink("🔎 NHTSA", "https://www.nhtsa.gov/recalls") : "") +
          (typeof slink === "function" ? slink("🔎 Constructeur", "https://www.google.com/search?q=site:" + ((typeof BRAND_SITE !== "undefined" && BRAND_SITE[curBrand]) || "") + "+bulletin+technique") : "") +
          "</p></div>";
        tbox.innerHTML = thtml;
      }

      /* ── 3. EXPERT (rendu chunké pour réactivité) ── */
      var exAll = Object.values(allExpert || {});
      var exHits = exAll.filter(function (e) {
        return e && e.brandId === curBrand &&
          (typeof fuzzy === "function" ? fuzzy(e.model, curModelName) : (!e.model || e.model === curModelName)) &&
          (typeof motorMatch === "function" ? motorMatch(e.motor, motor) : (!e.motor || String(e.motor).toLowerCase().includes((motor && motor.name || "").toLowerCase()))) &&
          (typeof titleOk === "function" ? titleOk(e.title + " " + (e.symptom || ""), motor) : true);
      }).map(function (e) {
        var o = Object.assign({}, e);
        o.score = (typeof scoreFiche === "function") ? scoreFiche(e, curModelName, motor) : 0;
        return o;
      }).sort(function (a, b) { return b.score - a.score; });

      var bex = (typeof EXPERT !== "undefined") ? EXPERT.filter(function (e) { return e[0] === curBrand && (typeof kwMatch === "function" ? kwMatch(e[1], motor) : true) && (e[1] || (typeof titleOk === "function" ? titleOk(e[2] + " " + e[3] + " " + e[4], motor) : true)); }) : [];
      var exOff = exHits.filter(function (e) { return !e.derived; });
      var exDer = exHits.filter(function (e) { return e.derived; });

      var eh = "";
      exOff.slice(0, 30).forEach(function (e) { eh += (typeof expertCard === "function" ? expertCard(e, "🧠 ") : ""); });
      bex.forEach(function (e) { eh += (typeof expertCard === "function" ? expertCard(typeof arrToExpert === "function" ? arrToExpert(e) : e, "🧠 ") : ""); });
      if (fuel && typeof GENERIC_EXPERT !== "undefined" && GENERIC_EXPERT[fuel]) {
        GENERIC_EXPERT[fuel].forEach(function (g) {
          eh += '<div class="issue-card deep"><strong>🔬 ' + esc(g[0]) + '</strong><span class="src">Ingénieur ' + ((typeof FUELS !== "undefined" && FUELS[fuel]) || fuel) + '</span><p><b>Symptômes :</b> ' + esc(g[1]) + '</p><p><b>Protocole :</b> ' + esc(g[2]) + '</p><p><b>Organes :</b> ' + esc(g[3]) + '</p><p class="dtcline">DTC : ' + esc(g[4]) + "</p></div>";
        });
      }
      if (typeof fuelCards === "function") eh += fuelCards(fuel);

      /* Bloc analyse ingénieur auto */
      if (motor) {
        var corr = (typeof buildVehicleFiches === "function") ? buildVehicleFiches(curBrand, curModelName, motor, "") : { list: [], reasons: [] };
        if (corr.reasons && corr.reasons.length) eh += '<p class="warnline">★ ' + corr.reasons.map(esc).join(" · ") + "</p>";
        eh += '<hr class="sep"><h4 class="deepTitle">🔬 Protocoles corrélés à cette motorisation (' + corr.list.length + ')</h4>';
        corr.list.slice(0, 12).forEach(function (f) { eh += (typeof expertCard === "function" ? expertCard(f, "") : ""); });
        eh += '<p class="meta">➡️ Lancez la <b>recherche massive corrélée</b> pour les ' + corr.list.length + " axes + toutes les fiches base.</p>";
        var q = val("expert-search") || "";
        var tech = null;
        if (typeof TECH_MAP !== "undefined") {
          for (var t in TECH_MAP) {
            if (TECH_MAP[t].some(function (k) { return q.toLowerCase().includes(k); })) { tech = t; break; }
          }
        }
        if (!tech) tech = fuel === "electrique" ? "bms" : fuel === "hybride" ? "bms" : fuel === "diesel" ? "egr" : "injection";
        if (typeof TECH_PROTOCOL !== "undefined" && TECH_PROTOCOL[tech]) {
          eh += '<div class="issue-card deep"><strong>🤖 Analyse automatique — ' + tech.toUpperCase() + '</strong><div class="deepbox"><b>🧪 Protocole :</b><br>' + esc(TECH_PROTOCOL[tech]) + "<br><b>🔩 Organes clés :</b> " + esc((typeof TECH_ORGANS !== "undefined" ? TECH_ORGANS[tech] : "")) + '<br><b>🔗 DTC :</b> <span class="dtcinline">' + esc((typeof TECH_DTC !== "undefined" ? TECH_DTC[tech] : "")) + "</span></div></div>";
        }
      }
      if (exDer.length) eh += '<p class="meta">🧠 ' + exDer.length + " protocole(s) dérivé(s) en base — visibles dans la recherche massive.</p>";
      if (ebox) ebox.innerHTML = eh || '<p class="muted">Aucune fiche expert — utilisez la recherche par symptôme.</p>';

      /* ── 4. DTC ── */
      var codes = new Set();
      var addCode = function (s) { String(s || "").split(/[,\/\s]+/).forEach(function (c) { if (/^[A-Z0-9]{4,}$/i.test(c)) codes.add(c.toUpperCase()); }); };
      allIssuesArr: for (var ii = 0; ii < issuesArr.length; ii++) {
        var i = issuesArr[ii];
        var f = (typeof fuelOf === "function") ? fuelOf([i.title, i.detail].join(" ")) : null;
        if (motor && f && !(typeof compat === "function" ? compat(f, fuel) : true)) continue;
        addCode(i.dtc);
      }
      exHits.forEach(function (e) { addCode(e.dtc); });
      bex.forEach(function (e) { addCode(e[7]); });
      if (typeof UNIV !== "undefined") UNIV.forEach(function (u) { addCode(u[2]); });
      if (fuel && typeof GENERIC !== "undefined" && GENERIC[fuel]) GENERIC[fuel].dtc.forEach(function (c) { codes.add(c); });
      if (fuel && typeof GENERIC_EXPERT !== "undefined" && GENERIC_EXPERT[fuel]) GENERIC_EXPERT[fuel].forEach(function (g) { addCode(g[4]); });
      if (motor && typeof buildVehicleFiches === "function") buildVehicleFiches(curBrand, curModelName, motor, "").list.forEach(function (f) { addCode(f.dtc); });

      var dh = "";
      codes.forEach(function (c) {
        var d = allDtc[c] || allDtc[c.replace(/[^A-Z0-9]+/g, "_")];
        dh += d ? '<div class="dtc-card"><strong>' + esc(d.code) + "</strong><p>" + esc(d.description) + "</p>" + (d.cause ? "<p>🔍 " + esc(d.cause) + "</p>" : "") + (d.solution ? "<p>🔧 " + esc(d.solution) + "</p>" : "") + (typeof slink === "function" ? slink("🔎 OBD", "https://www.obd-codes.com/" + c.toLowerCase()) : "") + "</div>"
          : '<div class="dtc-card"><strong>' + esc(c) + '</strong><p>Code corrélé au véhicule.</p>' + (typeof slink === "function" ? slink("🔎 OBD", "https://www.obd-codes.com/" + c.toLowerCase()) : "") + "</div>";
      });
      if (dbox) dbox.innerHTML = dh || '<p class="muted">—</p>';

      /* ── 5. MAINTENANCE ── */
      if (mbox) {
        mbox.innerHTML = (typeof buildMaintenanceHTML === "function") ? buildMaintenanceHTML(curBrand, curModelName, motor) : '<p style="color:#ef4444">⚠️ Module maintenance non chargé.</p>';
        if (window.__maintToolsRefresh) window.__maintToolsRefresh();
      }

      /* ── 6. Historique ── */
      try {
        var hist = JSON.parse(localStorage.getItem("autodiag_hist") || "[]");
        var entry = { date: new Date().toISOString(), marque: bn, modele: curModelName, motorisation: motor ? motor.name : "" };
        var last = hist[0];
        if (!last || last.marque !== entry.marque || last.modele !== entry.modele || last.motorisation !== entry.motorisation) {
          hist.unshift(entry);
          localStorage.setItem("autodiag_hist", JSON.stringify(hist.slice(0, 60)));
        }
      } catch (e) {}

      /* ── 7. Veille multi-sources ── */
      if (typeof renderVeille === "function") renderVeille();
    };
  }

  /* ── BOOT : rebind des listeners sur les selects ── */
  function rebindSelects() {
    var sm = el("sel-marque"), sm2 = el("sel-model"), sm3 = el("sel-motor");
    if (sm) {
      sm.removeEventListener("change", window.__loadModelsHandler);
      window.__loadModelsHandler = function () { window.loadModels(); };
      sm.addEventListener("change", window.__loadModelsHandler, { passive: true });
    }
    if (sm2) {
      sm2.removeEventListener("change", window.__loadMotorsHandler);
      window.__loadMotorsHandler = function () { window.loadMotors(); };
      sm2.addEventListener("change", window.__loadMotorsHandler, { passive: true });
    }
    if (sm3) {
      sm3.removeEventListener("change", window.__correlateHandler);
      window.__correlateHandler = function () { if (typeof correlate === "function") correlate(); };
      sm3.addEventListener("change", window.__correlateHandler, { passive: true });
    }
  }

  /* Exécution au chargement + après chaque changement d'écran */
  function boot() {
    rebindSelects();
    console.log("✅ FIX-FILTERS : mode prédictif marque→modèle→motorisation corrigé");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* Rebind après chaque showScreen (car les selects peuvent être recréés) */
  var rawShowScreen = window.showScreen;
  if (typeof rawShowScreen === "function") {
    window.showScreen = function (id) {
      var r = rawShowScreen.apply(this, arguments);
      if (id === "screen-app") setTimeout(rebindSelects, 100);
      return r;
    };
  }
})();
