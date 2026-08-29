// ============================================================
// EXTENSION MARQUES CHINOISES (injecté dans VEHICLES_DB)
// À charger APRÈS vehicles-db.js et AVANT app.js
// ============================================================
(function () {
  if (typeof VEHICLES_DB === 'undefined') return;
  const Y = [2022, 2023, 2024, 2025, 2026];
  const B = VEHICLES_DB.data.AUTRES.brands;

  B["Geely"] = { country: "Chine", flag: "🇨🇳", years: Y, models: {
    "Coolray": { engines: [ { type: "Essence", power: "177ch", code: "1.5 TD 177" } ] },
    "Monjaro": { engines: [ { type: "Essence", power: "238ch", code: "2.0 TD 238" }, { type: "Hybride", power: "243ch", code: "1.5 TD HEV 243" } ] },
    "Geometry C": { engines: [ { type: "Electrique", power: "204ch", code: "EV 204" } ] },
    "EX5": { engines: [ { type: "Electrique", power: "218ch", code: "EV 218" } ] }
  }};

  B["Jaecoo"] = { country: "Chine", flag: "🇨🇳", years: [2024, 2025, 2026], models: {
    "J7": { engines: [ { type: "Essence", power: "186ch", code: "1.6 TGDI 186" }, { type: "Hybride", power: "347ch", code: "J7 PHEV 347" } ] },
    "J8": { engines: [ { type: "Essence", power: "249ch", code: "2.0 TGDI 249" }, { type: "Hybride", power: "420ch", code: "J8 PHEV 420" } ] }
  }};

  B["Zeekr"] = { country: "Chine", flag: "🇨🇳", years: [2023, 2024, 2025, 2026], models: {
    "001": { engines: [ { type: "Electrique", power: "428ch", code: "EV 428" } ] },
    "009": { engines: [ { type: "Electrique", power: "544ch", code: "EV 544" } ] },
    "X": { engines: [ { type: "Electrique", power: "428ch", code: "EV 428 AWD" } ] }
  }};

  B["Leapmotor"] = { country: "Chine", flag: "🇨🇳", years: [2024, 2025, 2026], models: {
    "C10": { engines: [ { type: "Electrique", power: "218ch", code: "EV 218" }, { type: "Hybride", power: "218ch", code: "REEV 218" } ] },
    "T03": { engines: [ { type: "Electrique", power: "109ch", code: "EV 109" } ] }
  }};

  B["Lynk & Co"] = { country: "Chine", flag: "🇨", years: Y, models: {
    "01": { engines: [ { type: "Hybride", power: "245ch", code: "1.5 T PHEV 245" } ] },
    "08 EM-P": { engines: [ { type: "Hybride", power: "530ch", code: "EM-P 530" } ] }
  }};

  B["Omoda"] = { country: "Chine", flag: "🇨", years: [2023, 2024, 2025, 2026], models: {
    "5": { engines: [ { type: "Essence", power: "147ch", code: "1.5 T 147" }, { type: "Electrique", power: "204ch", code: "E5 EV 204" } ] },
    "7": { engines: [ { type: "Hybride", power: "279ch", code: "PHEV 279" } ] }
  }};

  console.log("✅ Marques chinoises étendues:", Object.keys(B).join(', '));
})();
