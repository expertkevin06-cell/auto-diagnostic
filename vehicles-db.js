// ============================================================
// AUTO-DIAGNOSTIC PRO - BASE VÉHICULES 2017-2026
// Régions : FRANCE / EUROPE / AUTRES — marques avec origine
// ============================================================

const VEHICLES_DB = {
  lastUpdated: null,

  data: {

    FRANCE: {
      label: "🇫🇷 France",
      brands: {
        "Peugeot": { country: "France", flag: "🇫🇷", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "208": { engines: [ { type: "Essence", power: "100ch", code: "1.2 PureTech 100" }, { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Electrique", power: "136ch", code: "e-208" } ] },
          "308": { engines: [ { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Hybride", power: "180ch", code: "1.6 PureTech 180 PHEV" } ] },
          "3008": { engines: [ { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Essence", power: "180ch", code: "1.6 PureTech 180" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Diesel", power: "180ch", code: "2.0 BlueHDi 180" }, { type: "Hybride", power: "225ch", code: "1.6 PureTech 225 PHEV" }, { type: "Electrique", power: "210ch", code: "e-3008" } ] },
          "5008": { engines: [ { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Essence", power: "180ch", code: "1.6 PureTech 180" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Diesel", power: "180ch", code: "2.0 BlueHDi 180" }, { type: "Hybride", power: "225ch", code: "1.6 PureTech 225 PHEV" } ] },
          "508": { engines: [ { type: "Essence", power: "180ch", code: "1.6 PureTech 180" }, { type: "Essence", power: "225ch", code: "1.6 PureTech 225" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Diesel", power: "180ch", code: "2.0 BlueHDi 180" }, { type: "Hybride", power: "225ch", code: "1.6 PureTech 225 PHEV" } ] },
          "2008": { engines: [ { type: "Essence", power: "100ch", code: "1.2 PureTech 100" }, { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Electrique", power: "136ch", code: "e-2008" } ] },
          "Rifter": { engines: [ { type: "Essence", power: "110ch", code: "1.2 PureTech 110" }, { type: "Diesel", power: "110ch", code: "1.5 BlueHDi 110" }, { type: "Electrique", power: "136ch", code: "e-Rifter" } ] }
        }},
        "Renault": { country: "France", flag: "🇫🇷", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Clio V": { engines: [ { type: "Essence", power: "65ch", code: "1.0 SCe 65" }, { type: "Essence", power: "90ch", code: "1.0 TCe 90" }, { type: "Essence", power: "100ch", code: "1.0 TCe 100" }, { type: "Hybride", power: "140ch", code: "E-Tech 140" } ] },
          "Megane IV": { engines: [ { type: "Essence", power: "115ch", code: "1.2 TCe 115" }, { type: "Essence", power: "140ch", code: "1.3 TCe 140" }, { type: "Diesel", power: "90ch", code: "1.5 dCi 90" }, { type: "Diesel", power: "115ch", code: "1.5 dCi 115" } ] },
          "Megane E-Tech": { engines: [ { type: "Electrique", power: "130ch", code: "EV40" }, { type: "Electrique", power: "220ch", code: "EV60" } ] },
          "Captur II": { engines: [ { type: "Essence", power: "100ch", code: "1.0 TCe 100" }, { type: "Essence", power: "130ch", code: "1.3 TCe 130" }, { type: "Diesel", power: "115ch", code: "1.5 Blue dCi 115" }, { type: "Hybride", power: "140ch", code: "E-Tech 140" }, { type: "Hybride", power: "160ch", code: "E-Tech 160 PHEV" } ] },
          "R5 E-Tech": { engines: [ { type: "Electrique", power: "120ch", code: "R5 40 kWh" }, { type: "Electrique", power: "150ch", code: "R5 52 kWh" } ] },
          "R4 E-Tech": { engines: [ { type: "Electrique", power: "120ch", code: "R4 40 kWh" }, { type: "Electrique", power: "150ch", code: "R4 52 kWh" } ] },
          "Austral": { engines: [ { type: "Essence", power: "140ch", code: "1.2 TCe 140" }, { type: "Hybride", power: "200ch", code: "E-Tech 200" } ] },
          "Arkana": { engines: [ { type: "Essence", power: "140ch", code: "1.3 TCe 140" }, { type: "Hybride", power: "145ch", code: "E-Tech 145" } ] },
          "Kadjar": { engines: [ { type: "Essence", power: "140ch", code: "1.3 TCe 140" }, { type: "Diesel", power: "115ch", code: "1.5 dCi 115" }, { type: "Diesel", power: "150ch", code: "1.7 Blue dCi 150" } ] },
          "Koleos": { engines: [ { type: "Diesel", power: "150ch", code: "1.7 Blue dCi 150" }, { type: "Diesel", power: "190ch", code: "2.0 dCi 190" } ] },
          "Talisman": { engines: [ { type: "Essence", power: "150ch", code: "1.3 TCe 150" }, { type: "Essence", power: "225ch", code: "1.8 TCe 225" }, { type: "Diesel", power: "120ch", code: "1.5 dCi 120" }, { type: "Diesel", power: "150ch", code: "1.7 Blue dCi 150" }, { type: "Diesel", power: "190ch", code: "2.0 dCi 190" } ] },
          "Scenic IV": { engines: [ { type: "Essence", power: "115ch", code: "1.2 TCe 115" }, { type: "Essence", power: "140ch", code: "1.3 TCe 140" }, { type: "Diesel", power: "110ch", code: "1.5 dCi 110" }, { type: "Diesel", power: "150ch", code: "1.7 Blue dCi 150" } ] },
          "Zoe": { engines: [ { type: "Electrique", power: "92ch", code: "R92" }, { type: "Electrique", power: "108ch", code: "R108" }, { type: "Electrique", power: "135ch", code: "R135" } ] }
        }},
        "Citroën": { country: "France", flag: "🇫🇷", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "C3": { engines: [ { type: "Essence", power: "83ch", code: "1.2 PureTech 83" }, { type: "Essence", power: "110ch", code: "1.2 PureTech 110" }, { type: "Essence", power: "130ch", code: "1.2 PureTech 130" } ] },
          "C3 Aircross": { engines: [ { type: "Essence", power: "110ch", code: "1.2 PureTech 110" }, { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Diesel", power: "100ch", code: "1.5 BlueHDi 100" } ] },
          "C4": { engines: [ { type: "Essence", power: "100ch", code: "1.2 PureTech 100" }, { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Electrique", power: "136ch", code: "ë-C4" } ] },
          "C5 Aircross": { engines: [ { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Essence", power: "180ch", code: "1.6 PureTech 180" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Diesel", power: "180ch", code: "2.0 BlueHDi 180" }, { type: "Hybride", power: "225ch", code: "1.6 PureTech 225 PHEV" } ] },
          "C5 X": { engines: [ { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Essence", power: "180ch", code: "1.6 PureTech 180" }, { type: "Hybride", power: "225ch", code: "1.6 PureTech 225 PHEV" } ] },
          "Berlingo": { engines: [ { type: "Essence", power: "110ch", code: "1.2 PureTech 110" }, { type: "Diesel", power: "100ch", code: "1.5 BlueHDi 100" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Electrique", power: "136ch", code: "ë-Berlingo" } ] },
          "Ami": { engines: [ { type: "Electrique", power: "8ch", code: "Quadricycle" } ] }
        }},
        "DS": { country: "France", flag: "🇫🇷", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "DS 3": { engines: [ { type: "Essence", power: "100ch", code: "1.2 PureTech 100" }, { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Essence", power: "155ch", code: "1.2 PureTech 155" }, { type: "Electrique", power: "136ch", code: "e-DS 3" } ] },
          "DS 4": { engines: [ { type: "Essence", power: "130ch", code: "1.2 PureTech 130" }, { type: "Essence", power: "180ch", code: "1.6 PureTech 180" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Hybride", power: "225ch", code: "1.6 PureTech 225 PHEV" } ] },
          "DS 7": { engines: [ { type: "Essence", power: "180ch", code: "1.6 PureTech 180" }, { type: "Essence", power: "225ch", code: "1.6 PureTech 225" }, { type: "Diesel", power: "130ch", code: "1.5 BlueHDi 130" }, { type: "Diesel", power: "180ch", code: "2.0 BlueHDi 180" }, { type: "Hybride", power: "225ch", code: "1.6 PureTech 225 PHEV" }, { type: "Hybride", power: "360ch", code: "E-Tense 4x4 360" } ] },
          "DS 9": { engines: [ { type: "Essence", power: "225ch", code: "1.6 PureTech 225" }, { type: "Hybride", power: "225ch", code: "E-Tense 225" }, { type: "Hybride", power: "360ch", code: "E-Tense 4x4 360" } ] }
        }}
      }
    },

    EUROPE: {
      label: "🇪🇺 Europe",
      brands: {
        "Volkswagen": { country: "Allemagne", flag: "🇩🇪", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Golf VII/VIII": { engines: [ { type: "Essence", power: "85ch", code: "1.0 TSI 85" }, { type: "Essence", power: "110ch", code: "1.0 TSI 110" }, { type: "Essence", power: "130ch", code: "1.5 TSI 130" }, { type: "Essence", power: "150ch", code: "1.5 TSI 150" }, { type: "Diesel", power: "90ch", code: "1.6 TDI 90" }, { type: "Diesel", power: "115ch", code: "2.0 TDI 115" }, { type: "Diesel", power: "150ch", code: "2.0 TDI 150" }, { type: "Hybride", power: "204ch", code: "1.4 eTSI 204" }, { type: "Hybride", power: "245ch", code: "1.4 GTE 245" } ] },
          "Polo VI": { engines: [ { type: "Essence", power: "80ch", code: "1.0 MPI 80" }, { type: "Essence", power: "95ch", code: "1.0 TSI 95" }, { type: "Essence", power: "110ch", code: "1.0 TSI 110" } ] },
          "Taigo": { engines: [ { type: "Essence", power: "95ch", code: "1.0 TSI 95" }, { type: "Essence", power: "110ch", code: "1.0 TSI 110" }, { type: "Essence", power: "150ch", code: "1.5 TSI 150" } ] },
          "Tiguan II": { engines: [ { type: "Essence", power: "130ch", code: "1.4 TSI 130" }, { type: "Essence", power: "150ch", code: "1.5 TSI 150" }, { type: "Essence", power: "190ch", code: "2.0 TSI 190" }, { type: "Diesel", power: "115ch", code: "2.0 TDI 115" }, { type: "Diesel", power: "150ch", code: "2.0 TDI 150" }, { type: "Diesel", power: "200ch", code: "2.0 TDI 200" }, { type: "Hybride", power: "245ch", code: "1.4 eHybrid 245" } ] },
          "Passat B8": { engines: [ { type: "Essence", power: "125ch", code: "1.4 TSI 125" }, { type: "Essence", power: "150ch", code: "1.5 TSI 150" }, { type: "Essence", power: "190ch", code: "2.0 TSI 190" }, { type: "Diesel", power: "120ch", code: "1.6 TDI 120" }, { type: "Diesel", power: "150ch", code: "2.0 TDI 150" }, { type: "Diesel", power: "190ch", code: "2.0 TDI 190" }, { type: "Diesel", power: "240ch", code: "2.0 TDI 240" }, { type: "Hybride", power: "218ch", code: "1.4 GTE 218" } ] },
          "T-Roc": { engines: [ { type: "Essence", power: "110ch", code: "1.0 TSI 110" }, { type: "Essence", power: "150ch", code: "1.5 TSI 150" }, { type: "Essence", power: "190ch", code: "2.0 TSI 190" }, { type: "Diesel", power: "115ch", code: "2.0 TDI 115" }, { type: "Diesel", power: "150ch", code: "2.0 TDI 150" } ] },
          "Touareg": { engines: [ { type: "Essence", power: "340ch", code: "3.0 TSI 340" }, { type: "Diesel", power: "231ch", code: "3.0 TDI 231" }, { type: "Diesel", power: "286ch", code: "3.0 TDI 286" }, { type: "Hybride", power: "462ch", code: "3.0 TSI eHybrid 462" } ] },
          "ID.3": { engines: [ { type: "Electrique", power: "145ch", code: "Pro 145" }, { type: "Electrique", power: "204ch", code: "Pro S 204" } ] },
          "ID.4": { engines: [ { type: "Electrique", power: "170ch", code: "Pro 170" }, { type: "Electrique", power: "204ch", code: "Pro S 204" }, { type: "Electrique", power: "265ch", code: "GTX 265" } ] },
          "ID.5": { engines: [ { type: "Electrique", power: "170ch", code: "Pro 170" }, { type: "Electrique", power: "204ch", code: "Pro S 204" }, { type: "Electrique", power: "265ch", code: "GTX 265" } ] },
          "Arteon": { engines: [ { type: "Essence", power: "190ch", code: "2.0 TSI 190" }, { type: "Essence", power: "280ch", code: "2.0 TSI 280" }, { type: "Diesel", power: "150ch", code: "2.0 TDI 150" }, { type: "Diesel", power: "200ch", code: "2.0 TDI 200" }, { type: "Hybride", power: "218ch", code: "1.4 eHybrid 218" } ] }
        }},
        "BMW": { country: "Allemagne", flag: "🇩🇪", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Série 1 (F40)": { engines: [ { type: "Essence", power: "109ch", code: "116i" }, { type: "Essence", power: "140ch", code: "118i" }, { type: "Essence", power: "178ch", code: "120i" }, { type: "Essence", power: "204ch", code: "128ti" }, { type: "Diesel", power: "116ch", code: "116d" }, { type: "Diesel", power: "150ch", code: "118d" }, { type: "Diesel", power: "190ch", code: "120d" } ] },
          "Série 3 (G20)": { engines: [ { type: "Essence", power: "156ch", code: "318i" }, { type: "Essence", power: "184ch", code: "320i" }, { type: "Essence", power: "258ch", code: "330i" }, { type: "Essence", power: "387ch", code: "M340i" }, { type: "Diesel", power: "150ch", code: "318d" }, { type: "Diesel", power: "190ch", code: "320d" }, { type: "Diesel", power: "265ch", code: "330d" }, { type: "Hybride", power: "292ch", code: "330e" } ] },
          "Série 5 (G30)": { engines: [ { type: "Essence", power: "184ch", code: "520i" }, { type: "Essence", power: "252ch", code: "530i" }, { type: "Essence", power: "340ch", code: "540i" }, { type: "Essence", power: "530ch", code: "M550i" }, { type: "Diesel", power: "190ch", code: "520d" }, { type: "Diesel", power: "265ch", code: "530d" }, { type: "Diesel", power: "320ch", code: "540d" }, { type: "Hybride", power: "252ch", code: "530e" } ] },
          "X1 (F48)": { engines: [ { type: "Essence", power: "140ch", code: "sDrive18i" }, { type: "Essence", power: "192ch", code: "xDrive20i" }, { type: "Essence", power: "231ch", code: "xDrive25i" }, { type: "Diesel", power: "150ch", code: "sDrive18d" }, { type: "Diesel", power: "190ch", code: "xDrive20d" }, { type: "Diesel", power: "231ch", code: "xDrive25d" } ] },
          "X3 (G01)": { engines: [ { type: "Essence", power: "184ch", code: "xDrive20i" }, { type: "Essence", power: "252ch", code: "xDrive30i" }, { type: "Essence", power: "360ch", code: "X3 M" }, { type: "Diesel", power: "190ch", code: "xDrive20d" }, { type: "Diesel", power: "265ch", code: "xDrive30d" }, { type: "Diesel", power: "320ch", code: "M40d" }, { type: "Hybride", power: "292ch", code: "xDrive30e" } ] },
          "X5 (G05)": { engines: [ { type: "Essence", power: "340ch", code: "xDrive40i" }, { type: "Essence", power: "530ch", code: "M50i" }, { type: "Diesel", power: "265ch", code: "xDrive30d" }, { type: "Diesel", power: "400ch", code: "M50d" }, { type: "Hybride", power: "394ch", code: "xDrive45e" } ] },
          "iX3": { engines: [ { type: "Electrique", power: "286ch", code: "iX3" } ] },
          "i4": { engines: [ { type: "Electrique", power: "340ch", code: "eDrive40" }, { type: "Electrique", power: "544ch", code: "M50" } ] },
          "iX": { engines: [ { type: "Electrique", power: "326ch", code: "xDrive40" }, { type: "Electrique", power: "523ch", code: "xDrive50" }, { type: "Electrique", power: "619ch", code: "M60" } ] }
        }},
        "Mercedes-Benz": { country: "Allemagne", flag: "🇩", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Classe A (W177)": { engines: [ { type: "Essence", power: "109ch", code: "A 160" }, { type: "Essence", power: "136ch", code: "A 180" }, { type: "Essence", power: "163ch", code: "A 200" }, { type: "Essence", power: "224ch", code: "A 250" }, { type: "Essence", power: "306ch", code: "A 35 AMG" }, { type: "Essence", power: "421ch", code: "A 45 S AMG" }, { type: "Diesel", power: "116ch", code: "A 180 d" }, { type: "Diesel", power: "150ch", code: "A 200 d" }, { type: "Diesel", power: "190ch", code: "A 220 d" } ] },
          "Classe C (W205)": { engines: [ { type: "Essence", power: "156ch", code: "C 180" }, { type: "Essence", power: "184ch", code: "C 200" }, { type: "Essence", power: "258ch", code: "C 300" }, { type: "Essence", power: "390ch", code: "C 43 AMG" }, { type: "Essence", power: "510ch", code: "C 63 S AMG" }, { type: "Diesel", power: "136ch", code: "C 180 d" }, { type: "Diesel", power: "170ch", code: "C 200 d" }, { type: "Diesel", power: "194ch", code: "C 220 d" }, { type: "Diesel", power: "265ch", code: "C 300 d" }, { type: "Hybride", power: "211ch", code: "C 300 e" } ] },
          "Classe E (W213)": { engines: [ { type: "Essence", power: "184ch", code: "E 200" }, { type: "Essence", power: "258ch", code: "E 300" }, { type: "Essence", power: "367ch", code: "E 450" }, { type: "Diesel", power: "150ch", code: "E 200 d" }, { type: "Diesel", power: "194ch", code: "E 220 d" }, { type: "Diesel", power: "265ch", code: "E 300 d" }, { type: "Diesel", power: "340ch", code: "E 400 d" }, { type: "Hybride", power: "320ch", code: "E 300 e" } ] },
          "GLA (H247)": { engines: [ { type: "Essence", power: "163ch", code: "GLA 200" }, { type: "Essence", power: "224ch", code: "GLA 250" }, { type: "Essence", power: "306ch", code: "GLA 35 AMG" }, { type: "Essence", power: "421ch", code: "GLA 45 S AMG" }, { type: "Diesel", power: "150ch", code: "GLA 200 d" }, { type: "Diesel", power: "190ch", code: "GLA 220 d" } ] },
          "GLC (X253)": { engines: [ { type: "Essence", power: "184ch", code: "GLC 200" }, { type: "Essence", power: "258ch", code: "GLC 300" }, { type: "Essence", power: "390ch", code: "GLC 43 AMG" }, { type: "Essence", power: "510ch", code: "GLC 63 S AMG" }, { type: "Diesel", power: "150ch", code: "GLC 200 d" }, { type: "Diesel", power: "194ch", code: "GLC 220 d" }, { type: "Diesel", power: "265ch", code: "GLC 300 d" }, { type: "Hybride", power: "320ch", code: "GLC 300 e" } ] },
          "GLE (V167)": { engines: [ { type: "Essence", power: "367ch", code: "GLE 450" }, { type: "Essence", power: "612ch", code: "GLE 63 S AMG" }, { type: "Diesel", power: "265ch", code: "GLE 300 d" }, { type: "Diesel", power: "330ch", code: "GLE 400 d" }, { type: "Hybride", power: "435ch", code: "GLE 350 de" } ] },
          "EQS": { engines: [ { type: "Electrique", power: "333ch", code: "EQS 350" }, { type: "Electrique", power: "523ch", code: "EQS 580" } ] },
          "EQE": { engines: [ { type: "Electrique", power: "292ch", code: "EQE 300" }, { type: "Electrique", power: "354ch", code: "EQE 350" }, { type: "Electrique", power: "687ch", code: "AMG EQE 53" } ] }
        }},
        "Audi": { country: "Allemagne", flag: "🇩", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "A3 (8Y)": { engines: [ { type: "Essence", power: "110ch", code: "30 TFSI" }, { type: "Essence", power: "150ch", code: "35 TFSI" }, { type: "Essence", power: "204ch", code: "40 TFSI" }, { type: "Essence", power: "310ch", code: "S3" }, { type: "Diesel", power: "116ch", code: "30 TDI" }, { type: "Diesel", power: "150ch", code: "35 TDI" }, { type: "Hybride", power: "204ch", code: "40 TFSI e" } ] },
          "A4 (B9)": { engines: [ { type: "Essence", power: "150ch", code: "35 TFSI" }, { type: "Essence", power: "204ch", code: "40 TFSI" }, { type: "Essence", power: "265ch", code: "45 TFSI" }, { type: "Essence", power: "367ch", code: "S4" }, { type: "Diesel", power: "122ch", code: "30 TDI" }, { type: "Diesel", power: "150ch", code: "35 TDI" }, { type: "Diesel", power: "204ch", code: "40 TDI" }, { type: "Diesel", power: "265ch", code: "50 TDI" }, { type: "Hybride", power: "204ch", code: "40 TFSI e" } ] },
          "A6 (C8)": { engines: [ { type: "Essence", power: "204ch", code: "40 TFSI" }, { type: "Essence", power: "265ch", code: "45 TFSI" }, { type: "Essence", power: "340ch", code: "55 TFSI" }, { type: "Diesel", power: "204ch", code: "40 TDI" }, { type: "Diesel", power: "265ch", code: "50 TDI" }, { type: "Hybride", power: "367ch", code: "55 TFSI e" } ] },
          "Q3 (F3)": { engines: [ { type: "Essence", power: "150ch", code: "35 TFSI" }, { type: "Essence", power: "230ch", code: "40 TFSI" }, { type: "Essence", power: "310ch", code: "RS Q3" }, { type: "Diesel", power: "150ch", code: "35 TDI" }, { type: "Diesel", power: "200ch", code: "40 TDI" } ] },
          "Q5 (FY)": { engines: [ { type: "Essence", power: "204ch", code: "40 TFSI" }, { type: "Essence", power: "265ch", code: "45 TFSI" }, { type: "Essence", power: "367ch", code: "SQ5" }, { type: "Diesel", power: "163ch", code: "35 TDI" }, { type: "Diesel", power: "204ch", code: "40 TDI" }, { type: "Diesel", power: "286ch", code: "50 TDI" }, { type: "Hybride", power: "299ch", code: "55 TFSI e" } ] },
          "Q7": { engines: [ { type: "Essence", power: "340ch", code: "55 TFSI" }, { type: "Diesel", power: "231ch", code: "45 TDI" }, { type: "Diesel", power: "286ch", code: "50 TDI" }, { type: "Diesel", power: "435ch", code: "60 TDI" }, { type: "Hybride", power: "456ch", code: "60 TFSI e" } ] },
          "e-tron": { engines: [ { type: "Electrique", power: "408ch", code: "55 quattro" }, { type: "Electrique", power: "503ch", code: "S e-tron" } ] },
          "Q4 e-tron": { engines: [ { type: "Electrique", power: "170ch", code: "35" }, { type: "Electrique", power: "204ch", code: "40" }, { type: "Electrique", power: "299ch", code: "50 quattro" } ] },
          "Q8 e-tron": { engines: [ { type: "Electrique", power: "408ch", code: "55 quattro" }, { type: "Electrique", power: "503ch", code: "S" } ] }
        }},
        "Opel": { country: "Allemagne", flag: "🇩🇪", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Corsa F": { engines: [ { type: "Essence", power: "75ch", code: "1.2 75" }, { type: "Essence", power: "100ch", code: "1.2 100" }, { type: "Essence", power: "130ch", code: "1.2 130" }, { type: "Electrique", power: "136ch", code: "e-Corsa" } ] },
          "Astra K/L": { engines: [ { type: "Essence", power: "90ch", code: "1.0 Turbo 90" }, { type: "Essence", power: "110ch", code: "1.2 Turbo 110" }, { type: "Essence", power: "130ch", code: "1.2 Turbo 130" }, { type: "Essence", power: "145ch", code: "1.4 Turbo 145" }, { type: "Diesel", power: "110ch", code: "1.5 Diesel 110" }, { type: "Diesel", power: "120ch", code: "1.5 Diesel 120" } ] },
          "Insignia B": { engines: [ { type: "Essence", power: "140ch", code: "1.5 Turbo 140" }, { type: "Essence", power: "200ch", code: "2.0 Turbo 200" }, { type: "Essence", power: "260ch", code: "2.0 Turbo 260" }, { type: "Diesel", power: "120ch", code: "1.5 Diesel 120" }, { type: "Diesel", power: "170ch", code: "2.0 Diesel 170" } ] },
          "Mokka B": { engines: [ { type: "Essence", power: "100ch", code: "1.2 Turbo 100" }, { type: "Essence", power: "130ch", code: "1.2 Turbo 130" }, { type: "Electrique", power: "136ch", code: "e-Mokka" } ] },
          "Grandland": { engines: [ { type: "Essence", power: "110ch", code: "1.2 Turbo 110" }, { type: "Essence", power: "130ch", code: "1.2 Turbo 130" }, { type: "Diesel", power: "110ch", code: "1.5 Diesel 110" }, { type: "Diesel", power: "130ch", code: "1.5 Diesel 130" }, { type: "Hybride", power: "225ch", code: "1.6 Hybrid 225" } ] }
        }},
        "Skoda": { country: "République tchèque", flag: "🇨🇿", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Fabia": { engines: [ { type: "Essence", power: "80ch", code: "1.0 MPI 80" }, { type: "Essence", power: "95ch", code: "1.0 TSI 95" }, { type: "Essence", power: "110ch", code: "1.0 TSI 110" } ] },
          "Octavia": { engines: [ { type: "Essence", power: "110ch", code: "1.0 TSI 110" }, { type: "Essence", power: "150ch", code: "1.5 TSI 150" }, { type: "Essence", power: "190ch", code: "2.0 TSI 190" }, { type: "Diesel", power: "115ch", code: "2.0 TDI 115" }, { type: "Diesel", power: "150ch", code: "2.0 TDI 150" }, { type: "Diesel", power: "200ch", code: "2.0 TDI 200" } ] },
          "Kodiaq": { engines: [ { type: "Essence", power: "150ch", code: "1.5 TSI 150" }, { type: "Essence", power: "190ch", code: "2.0 TSI 190" }, { type: "Diesel", power: "150ch", code: "2.0 TDI 150" }, { type: "Diesel", power: "190ch", code: "2.0 TDI 190" }, { type: "Diesel", power: "240ch", code: "2.0 TDI 240" } ] },
          "Enyaq": { engines: [ { type: "Electrique", power: "179ch", code: "iV 60" }, { type: "Electrique", power: "204ch", code: "iV 80" }, { type: "Electrique", power: "265ch", code: "iV 80x" }, { type: "Electrique", power: "299ch", code: "RS iV" } ] },
          "Elroq": { engines: [ { type: "Electrique", power: "170ch", code: "50" }, { type: "Electrique", power: "204ch", code: "85" }, { type: "Electrique", power: "286ch", code: "85x" } ] }
        }},
        "Dacia": { country: "Roumanie", flag: "🇷🇴", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Sandero": { engines: [ { type: "Essence", power: "65ch", code: "1.0 SCe 65" }, { type: "Essence", power: "90ch", code: "1.0 TCe 90" }, { type: "Essence", power: "100ch", code: "1.0 TCe 100" }, { type: "Flexfuel", power: "90ch", code: "1.0 ECO-G 90 (GPL)" } ] },
          "Logan": { engines: [ { type: "Essence", power: "90ch", code: "1.0 TCe 90" }, { type: "Essence", power: "100ch", code: "1.0 TCe 100" }, { type: "Flexfuel", power: "90ch", code: "1.0 ECO-G 90 (GPL)" }, { type: "Diesel", power: "95ch", code: "1.5 Blue dCi 95" } ] },
          "Duster": { engines: [ { type: "Essence", power: "100ch", code: "1.0 TCe 100" }, { type: "Essence", power: "130ch", code: "1.3 TCe 130" }, { type: "Essence", power: "150ch", code: "1.3 TCe 150" }, { type: "Diesel", power: "95ch", code: "1.5 Blue dCi 95" }, { type: "Diesel", power: "115ch", code: "1.5 Blue dCi 115" }, { type: "Flexfuel", power: "100ch", code: "1.0 ECO-G 100 (GPL)" }, { type: "Hybride", power: "140ch", code: "Hybrid 140" } ] },
          "Jogger": { engines: [ { type: "Essence", power: "100ch", code: "1.0 TCe 100" }, { type: "Flexfuel", power: "100ch", code: "1.0 ECO-G 100 (GPL)" }, { type: "Hybride", power: "140ch", code: "Hybrid 140" } ] },
          "Spring": { engines: [ { type: "Electrique", power: "65ch", code: "Electric 65" }, { type: "Electrique", power: "82ch", code: "Electric 82" } ] },
          "Bigster": { engines: [ { type: "Essence", power: "130ch", code: "1.2 TCe 130" }, { type: "Hybride", power: "140ch", code: "Hybrid 140" }, { type: "Hybride", power: "155ch", code: "Hybrid-G 155" } ] }
        }}
      }
    },

    AUTRES: {
      label: "🌍 Autres (Amérique, Asie)",
      brands: {
        "Ford": { country: "USA", flag: "🇺🇸", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Mustang": { engines: [ { type: "Essence", power: "309ch", code: "2.3 EcoBoost" }, { type: "Essence", power: "450ch", code: "5.0 V8 GT" }, { type: "Essence", power: "760ch", code: "5.2 V8 Shelby" }, { type: "Electrique", power: "487ch", code: "Mach-E" } ] },
          "F-150": { engines: [ { type: "Essence", power: "290ch", code: "3.3 V6" }, { type: "Essence", power: "325ch", code: "2.7 EcoBoost" }, { type: "Essence", power: "400ch", code: "3.5 EcoBoost" }, { type: "Essence", power: "450ch", code: "5.0 V8" }, { type: "Electrique", power: "580ch", code: "Lightning" } ] },
          "Explorer": { engines: [ { type: "Essence", power: "300ch", code: "2.3 EcoBoost" }, { type: "Essence", power: "400ch", code: "3.0 EcoBoost" }, { type: "Hybride", power: "318ch", code: "3.3 Hybrid" } ] },
          "Bronco": { engines: [ { type: "Essence", power: "300ch", code: "2.3 EcoBoost" }, { type: "Essence", power: "330ch", code: "2.7 EcoBoost" } ] }
        }},
        "Chevrolet": { country: "USA", flag: "🇺🇸", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Camaro": { engines: [ { type: "Essence", power: "279ch", code: "2.0 Turbo" }, { type: "Essence", power: "339ch", code: "3.6 V6" }, { type: "Essence", power: "461ch", code: "6.2 V8 SS" }, { type: "Essence", power: "659ch", code: "6.2 V8 ZL1" } ] },
          "Corvette": { engines: [ { type: "Essence", power: "495ch", code: "6.2 V8 Stingray" }, { type: "Essence", power: "676ch", code: "5.5 V8 Z06" } ] },
          "Silverado": { engines: [ { type: "Essence", power: "285ch", code: "4.3 V6" }, { type: "Essence", power: "355ch", code: "5.3 V8" }, { type: "Essence", power: "420ch", code: "6.2 V8" }, { type: "Diesel", power: "277ch", code: "3.0 Duramax" } ] },
          "Tahoe": { engines: [ { type: "Essence", power: "355ch", code: "5.3 V8" }, { type: "Essence", power: "420ch", code: "6.2 V8" }, { type: "Diesel", power: "277ch", code: "3.0 Duramax" } ] }
        }},
        "Tesla": { country: "USA", flag: "🇺", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Model 3": { engines: [ { type: "Electrique", power: "283ch", code: "Standard Range" }, { type: "Electrique", power: "346ch", code: "Long Range" }, { type: "Electrique", power: "513ch", code: "Performance" } ] },
          "Model Y": { engines: [ { type: "Electrique", power: "283ch", code: "Propulsion" }, { type: "Electrique", power: "346ch", code: "Long Range" }, { type: "Electrique", power: "513ch", code: "Performance" } ] },
          "Model S": { engines: [ { type: "Electrique", power: "670ch", code: "Long Range" }, { type: "Electrique", power: "1020ch", code: "Plaid" } ] },
          "Model X": { engines: [ { type: "Electrique", power: "670ch", code: "Long Range" }, { type: "Electrique", power: "1020ch", code: "Plaid" } ] },
          "Cybertruck": { engines: [ { type: "Electrique", power: "600ch", code: "AWD" }, { type: "Electrique", power: "845ch", code: "Cyberbeast" } ] }
        }},
        "Toyota": { country: "Japon", flag: "🇯🇵", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Yaris": { engines: [ { type: "Essence", power: "72ch", code: "1.0 VVT-i" }, { type: "Essence", power: "90ch", code: "1.5 VVT-i" }, { type: "Hybride", power: "116ch", code: "1.5 Hybrid" }, { type: "Hybride", power: "128ch", code: "1.5 GR Sport" } ] },
          "Corolla": { engines: [ { type: "Hybride", power: "122ch", code: "1.8 Hybrid" }, { type: "Hybride", power: "184ch", code: "2.0 Hybrid" }, { type: "Essence", power: "169ch", code: "1.8 Turbo" } ] },
          "C-HR": { engines: [ { type: "Hybride", power: "122ch", code: "1.8 Hybrid" }, { type: "Hybride", power: "184ch", code: "2.0 Hybrid" } ] },
          "RAV4": { engines: [ { type: "Hybride", power: "197ch", code: "2.5 Hybrid" }, { type: "Hybride", power: "222ch", code: "2.5 Plug-in" } ] },
          "Land Cruiser": { engines: [ { type: "Essence", power: "299ch", code: "3.5 V6" }, { type: "Diesel", power: "306ch", code: "3.3 D-4D" } ] },
          "Prius": { engines: [ { type: "Hybride", power: "122ch", code: "1.8 Hybrid" }, { type: "Hybride", power: "197ch", code: "2.0 Plug-in" } ] },
          "bZ4X": { engines: [ { type: "Electrique", power: "204ch", code: "AWD" } ] }
        }},
        "Honda": { country: "Japon", flag: "🇯", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Civic": { engines: [ { type: "Essence", power: "126ch", code: "1.0 VTEC" }, { type: "Essence", power: "182ch", code: "1.5 VTEC" }, { type: "Hybride", power: "184ch", code: "2.0 e:HEV" }, { type: "Essence", power: "320ch", code: "2.0 Type R" } ] },
          "CR-V": { engines: [ { type: "Essence", power: "190ch", code: "1.5 VTEC" }, { type: "Hybride", power: "184ch", code: "2.0 e:HEV" } ] },
          "HR-V": { engines: [ { type: "Essence", power: "131ch", code: "1.5 i-VTEC" }, { type: "Hybride", power: "131ch", code: "1.5 e:HEV" } ] },
          "e": { engines: [ { type: "Electrique", power: "154ch", code: "Honda e" } ] }
        }},
        "Nissan": { country: "Japon", flag: "🇯🇵", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Qashqai": { engines: [ { type: "Essence", power: "115ch", code: "1.2 DIG-T" }, { type: "Essence", power: "140ch", code: "1.3 DIG-T" }, { type: "Essence", power: "158ch", code: "1.3 DIG-T 158" }, { type: "Diesel", power: "115ch", code: "1.5 dCi" }, { type: "Diesel", power: "150ch", code: "1.7 dCi" } ] },
          "Juke": { engines: [ { type: "Essence", power: "117ch", code: "1.0 DIG-T" }, { type: "Essence", power: "140ch", code: "1.3 DIG-T" } ] },
          "X-Trail": { engines: [ { type: "Essence", power: "163ch", code: "1.3 DIG-T" }, { type: "Hybride", power: "190ch", code: "1.5 e-POWER" } ] },
          "Leaf": { engines: [ { type: "Electrique", power: "110ch", code: "40 kWh" }, { type: "Electrique", power: "150ch", code: "40 kWh+" }, { type: "Electrique", power: "217ch", code: "62 kWh e+" } ] },
          "Ariya": { engines: [ { type: "Electrique", power: "218ch", code: "63 kWh" }, { type: "Electrique", power: "306ch", code: "87 kWh AWD" } ] },
          "GT-R": { engines: [ { type: "Essence", power: "570ch", code: "3.8 V6 Twin-Turbo" } ] }
        }},
        "Mazda": { country: "Japon", flag: "🇯🇵", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Mazda2": { engines: [ { type: "Essence", power: "75ch", code: "1.5 Skyactiv-G" }, { type: "Essence", power: "90ch", code: "1.5 Skyactiv-G" } ] },
          "Mazda3": { engines: [ { type: "Essence", power: "122ch", code: "2.0 Skyactiv-G" }, { type: "Essence", power: "180ch", code: "2.5 Skyactiv-G" }, { type: "Essence", power: "186ch", code: "2.0 Skyactiv-X" }, { type: "Diesel", power: "115ch", code: "1.8 Skyactiv-D" } ] },
          "Mazda6": { engines: [ { type: "Essence", power: "145ch", code: "2.0 Skyactiv-G" }, { type: "Essence", power: "194ch", code: "2.5 Skyactiv-G" }, { type: "Diesel", power: "150ch", code: "2.2 Skyactiv-D" }, { type: "Diesel", power: "184ch", code: "2.2 Skyactiv-D" } ] },
          "CX-3": { engines: [ { type: "Essence", power: "121ch", code: "2.0 Skyactiv-G" }, { type: "Diesel", power: "105ch", code: "1.5 Skyactiv-D" } ] },
          "CX-5": { engines: [ { type: "Essence", power: "165ch", code: "2.0 Skyactiv-G" }, { type: "Essence", power: "194ch", code: "2.5 Skyactiv-G" }, { type: "Diesel", power: "150ch", code: "2.2 Skyactiv-D" }, { type: "Diesel", power: "184ch", code: "2.2 Skyactiv-D" } ] },
          "CX-30": { engines: [ { type: "Essence", power: "122ch", code: "2.0 Skyactiv-G" }, { type: "Essence", power: "180ch", code: "2.5 Skyactiv-G" }, { type: "Essence", power: "186ch", code: "2.0 Skyactiv-X" } ] },
          "CX-60": { engines: [ { type: "Essence", power: "286ch", code: "3.0 Skyactiv-G" }, { type: "Diesel", power: "327ch", code: "3.3 Skyactiv-D" }, { type: "Hybride", power: "327ch", code: "2.5 PHEV" } ] },
          "MX-5": { engines: [ { type: "Essence", power: "132ch", code: "1.5 Skyactiv-G" }, { type: "Essence", power: "184ch", code: "2.0 Skyactiv-G" } ] }
        }},
        "Hyundai": { country: "Corée du Sud", flag: "🇰🇷", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "i10": { engines: [ { type: "Essence", power: "67ch", code: "1.0 MPI" }, { type: "Essence", power: "100ch", code: "1.0 T-GDI" } ] },
          "i20": { engines: [ { type: "Essence", power: "84ch", code: "1.2 MPI" }, { type: "Essence", power: "100ch", code: "1.0 T-GDI" }, { type: "Essence", power: "120ch", code: "1.0 T-GDI" } ] },
          "i30": { engines: [ { type: "Essence", power: "120ch", code: "1.0 T-GDI" }, { type: "Essence", power: "140ch", code: "1.4 T-GDI" }, { type: "Essence", power: "280ch", code: "2.0 T-GDI N" }, { type: "Diesel", power: "136ch", code: "1.6 CRDi" } ] },
          "Tucson": { engines: [ { type: "Essence", power: "150ch", code: "1.6 T-GDI" }, { type: "Essence", power: "180ch", code: "1.6 T-GDI" }, { type: "Diesel", power: "136ch", code: "1.6 CRDi" }, { type: "Hybride", power: "230ch", code: "1.6 T-GDI HEV" }, { type: "Hybride", power: "265ch", code: "1.6 T-GDI PHEV" } ] },
          "Kona": { engines: [ { type: "Essence", power: "120ch", code: "1.0 T-GDI" }, { type: "Essence", power: "140ch", code: "1.6 T-GDI" }, { type: "Electrique", power: "136ch", code: "Electric 39 kWh" }, { type: "Electrique", power: "204ch", code: "Electric 64 kWh" } ] },
          "Santa Fe": { engines: [ { type: "Essence", power: "180ch", code: "1.6 T-GDI" }, { type: "Diesel", power: "186ch", code: "2.2 CRDi" }, { type: "Hybride", power: "230ch", code: "1.6 T-GDI HEV" }, { type: "Hybride", power: "265ch", code: "1.6 T-GDI PHEV" } ] },
          "Ioniq 5": { engines: [ { type: "Electrique", power: "170ch", code: "RWD 58 kWh" }, { type: "Electrique", power: "217ch", code: "RWD 77 kWh" }, { type: "Electrique", power: "305ch", code: "AWD 77 kWh" } ] },
          "Ioniq 6": { engines: [ { type: "Electrique", power: "228ch", code: "RWD" }, { type: "Electrique", power: "320ch", code: "AWD" } ] }
        }},
        "Kia": { country: "Corée du Sud", flag: "🇰", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Picanto": { engines: [ { type: "Essence", power: "67ch", code: "1.0 MPI" }, { type: "Essence", power: "100ch", code: "1.0 T-GDI" } ] },
          "Rio": { engines: [ { type: "Essence", power: "84ch", code: "1.2 MPI" }, { type: "Essence", power: "100ch", code: "1.0 T-GDI" } ] },
          "Ceed": { engines: [ { type: "Essence", power: "120ch", code: "1.0 T-GDI" }, { type: "Essence", power: "140ch", code: "1.4 T-GDI" }, { type: "Essence", power: "280ch", code: "2.0 T-GDI GT" }, { type: "Diesel", power: "136ch", code: "1.6 CRDi" } ] },
          "Sportage": { engines: [ { type: "Essence", power: "150ch", code: "1.6 T-GDI" }, { type: "Essence", power: "180ch", code: "1.6 T-GDI" }, { type: "Diesel", power: "136ch", code: "1.6 CRDi" }, { type: "Diesel", power: "186ch", code: "2.0 CRDi" }, { type: "Hybride", power: "230ch", code: "1.6 T-GDI HEV" }, { type: "Hybride", power: "265ch", code: "1.6 T-GDI PHEV" } ] },
          "Niro": { engines: [ { type: "Hybride", power: "141ch", code: "1.6 GDI HEV" }, { type: "Hybride", power: "183ch", code: "1.6 GDI PHEV" }, { type: "Electrique", power: "204ch", code: "EV 64 kWh" } ] },
          "Sorento": { engines: [ { type: "Essence", power: "180ch", code: "1.6 T-GDI" }, { type: "Diesel", power: "186ch", code: "2.2 CRDi" }, { type: "Hybride", power: "230ch", code: "1.6 T-GDI HEV" }, { type: "Hybride", power: "265ch", code: "1.6 T-GDI PHEV" } ] },
          "EV6": { engines: [ { type: "Electrique", power: "170ch", code: "RWD 58 kWh" }, { type: "Electrique", power: "228ch", code: "RWD 77 kWh" }, { type: "Electrique", power: "325ch", code: "AWD 77 kWh" }, { type: "Electrique", power: "585ch", code: "GT" } ] },
          "EV9": { engines: [ { type: "Electrique", power: "215ch", code: "RWD" }, { type: "Electrique", power: "385ch", code: "AWD" } ] },
          "Stinger": { engines: [ { type: "Essence", power: "255ch", code: "2.0 T-GDI" }, { type: "Essence", power: "370ch", code: "3.3 T-GDI V6" } ] }
        }},
        "BYD": { country: "Chine", flag: "🇨🇳", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "Atto 3": { engines: [ { type: "Electrique", power: "204ch", code: "Standard Range" }, { type: "Electrique", power: "204ch", code: "Extended Range" } ] },
          "Dolphin": { engines: [ { type: "Electrique", power: "95ch", code: "Active" }, { type: "Electrique", power: "204ch", code: "Design" } ] },
          "Seal": { engines: [ { type: "Electrique", power: "313ch", code: "RWD" }, { type: "Electrique", power: "530ch", code: "AWD" } ] },
          "Tang": { engines: [ { type: "Electrique", power: "509ch", code: "AWD" } ] },
          "Han": { engines: [ { type: "Electrique", power: "245ch", code: "RWD" }, { type: "Electrique", power: "517ch", code: "AWD" } ] }
        }},
        "MG": { country: "Chine", flag: "🇨🇳", years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026], models: {
          "MG4": { engines: [ { type: "Electrique", power: "170ch", code: "Standard" }, { type: "Electrique", power: "204ch", code: "Comfort" }, { type: "Electrique", power: "435ch", code: "XPOWER" } ] },
          "ZS": { engines: [ { type: "Essence", power: "111ch", code: "1.0 T-GDI" }, { type: "Essence", power: "143ch", code: "1.5 T-GDI" }, { type: "Electrique", power: "156ch", code: "EV" } ] },
          "Marvel R": { engines: [ { type: "Electrique", power: "288ch", code: "RWD" }, { type: "Electrique", power: "402ch", code: "AWD" } ] }
        }}
      }
    }
  },

  // ==========================================================
  // MÉTHODES
  // ==========================================================
  async init() {
    const meta = await DB.get('meta', 'lastVehicleUpdate');
    this.lastUpdated = meta ? meta.value : null;
    const vehicles = await DB.getAll('vehicles');
    // Migration : ancien format ou anciennes régions -> repeupler
    if (vehicles.length === 0 || !vehicles[0].engines || !vehicles[0].flag ||
        vehicles[0].region === 'AMERIQUE' || vehicles[0].region === 'ASIE') {
      await DB.clear('vehicles');
      await this.populate();
    }
  },

  buildRecords() {
    const records = [];
    for (const regionKey in this.data) {
      const region = this.data[regionKey];
      for (const brandName in region.brands) {
        const brand = region.brands[brandName];
        for (const modelName in brand.models) {
          records.push({
            region: regionKey,
            regionLabel: region.label,
            country: brand.country,
            flag: brand.flag,
            brand: brandName,
            model: modelName,
            years: brand.years,
            engines: brand.models[modelName].engines,
            addedAt: Date.now()
          });
        }
      }
    }
    return records;
  },

  async populate() {
    console.log("🔄 Peuplement base véhicules...");
    const records = this.buildRecords();
    await DB.bulkAdd('vehicles', records);
    this.lastUpdated = Date.now();
    await DB.update('meta', { key: 'lastVehicleUpdate', value: this.lastUpdated });
    console.log("✅ " + records.length + " modèles ajoutés");
  },

  async checkAndUpdate() {
    const now = Date.now();
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;
    const meta = await DB.get('meta', 'lastVehicleUpdate');
    const last = meta ? meta.value : 0;
    if (!last || (now - last) >= fifteenDays) {
      await DB.clear('vehicles');
      await this.populate();
      return true;
    }
    return false;
  },

  async getBrands(region) {
    const all = await DB.getAll('vehicles');
    const filtered = (region === 'ALL') ? all : all.filter(v => v.region === region);
    return [...new Set(filtered.map(v => v.brand))].sort();
  },

  async getBrandMeta(region, brand) {
    const all = await DB.getAll('vehicles');
    const rec = all.find(v => v.brand === brand && (region === 'ALL' || v.region === region));
    return rec ? { country: rec.country, flag: rec.flag } : { country: '', flag: '🚗' };
  },

  async getModels(region, brand) {
    const all = await DB.getAll('vehicles');
    const filtered = all.filter(v => v.brand === brand && (region === 'ALL' || v.region === region));
    return [...new Set(filtered.map(v => v.model))].sort();
  },

  async getEngines(region, brand, model) {
    const all = await DB.getAll('vehicles');
    const rec = all.find(v => v.brand === brand && v.model === model && (region === 'ALL' || v.region === region));
    if (!rec) return [];
    const list = [];
    for (const year of rec.years) {
      for (const e of rec.engines) {
        list.push({ year: year, fuelType: e.type, power: e.power, engineCode: e.code });
      }
    }
    return list;
  },

  async getStats() {
    const all = await DB.getAll('vehicles');
    const stats = { FRANCE: 0, EUROPE: 0, AUTRES: 0 };
    all.forEach(v => { if (stats[v.region] !== undefined) stats[v.region]++; });
    return { total: all.length, ...stats };
  },

  // RECHERCHE MASSIVE (insensible aux accents)
  async search(query) {
    const all = await DB.getAll('vehicles');
    const q = normalizeStr(query);
    if (!q) return [];
    return all.filter(v =>
      normalizeStr(v.brand).includes(q) ||
      normalizeStr(v.model).includes(q) ||
      normalizeStr(v.country).includes(q) ||
      (v.engines || []).some(e => normalizeStr(e.code).includes(q))
    );
  }
};

function normalizeStr(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
