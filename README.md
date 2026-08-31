# Application Sécurisée - Guide de déploiement

## 📦 Contenu du projet

- `index.html` - Page principale
- `manifest.json` - Configuration PWA
- `sw.js` - Service Worker (cache + notifications)
- `app.js` - Logique applicative
- `style.css` - Styles
- `icon-192.png` - Icône 192x192 (à fournir)
- `icon-512.png` - Icône 512x512 (à fournir)

## 🚀 Déploiement (Netlify - le plus simple)

1. Créez un compte sur https://app.netlify.com/
2. Allez sur https://app.netlify.com/drop
3. Glissez-déposez le dossier complet du projet
4. Vous obtenez une URL HTTPS du type `https://xxx.netlify.app`

## ✅ Vérification avant PWABuilder

1. Ouvrez votre URL dans Chrome
2. F12 → onglet Application
3. Vérifiez :
   - ✅ Manifest : toutes les cases vertes
   - ✅ Service Workers : activé
   - ✅ Aucune erreur 404

## 📱 Génération APK sur PWABuilder

1. Allez sur https://www.pwabuilder.com/
2. Collez votre URL HTTPS
3. Cliquez sur Start
4. Score PWA doit être ≥ 80
5. Package for stores → Android
6. Téléchargez l'APK signé

## 🔐 Identifiants

- **Admin** : mot de passe `Kevin83600`
- **Tiers** : saisie du prénom pour demander l'accès

## 🔄 Mise à jour

Pour forcer une mise à jour de l'application :
1. Modifiez `CACHE_NAME` dans `sw.js` (ex: `app-sec-v3`)
2. Redéployez les fichiers
3. Les utilisateurs recevront la MAJ au prochain lancement
