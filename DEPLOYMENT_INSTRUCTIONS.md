# 🚀 Instructions de Déploiement - Finovia

## ✅ Préparation Terminée !

Tous les fichiers de configuration sont prêts. Suivez ces étapes pour déployer votre application.

---

## 🌐 Déploiement sur Vercel (Frontend + API Routes Next.js)

### Étape 1 : Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub

### Étape 2 : Importer votre projet

1. Dans Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Recherchez le repository : `Fin_tech-project`
3. Cliquez sur **"Import"**

### Étape 3 : Configurer le projet

Vercel détectera automatiquement Next.js. Les paramètres par défaut sont corrects :

- **Framework Preset** : Next.js ✅
- **Root Directory** : `./` (racine) ✅
- **Build Command** : `npm run build` ✅
- **Output Directory** : `.next` ✅
- **Install Command** : `npm install` ✅

### Étape 4 : Configurer les Variables d'Environnement

Avant de déployer, ajoutez ces variables d'environnement dans Vercel :

Cliquez sur **"Environment Variables"** et ajoutez :

```
MONGODB_URI=votre-uri-mongodb-atlas-complete
JWT_SECRET=votre-secret-jwt-genere-aleatoirement
JWT_REFRESH_SECRET=votre-refresh-secret-genere-aleatoirement
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://votre-app.vercel.app
NODE_ENV=production
```

#### 🔐 Générer des secrets JWT sécurisés :

Ouvrez un terminal et exécutez (2 fois pour 2 secrets différents) :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiez les résultats et utilisez-les pour `JWT_SECRET` et `JWT_REFRESH_SECRET`.

### Étape 5 : Obtenir MongoDB Atlas URI

1. Allez sur https://cloud.mongodb.com
2. Connectez-vous à votre compte
3. Sélectionnez votre cluster (ou créez-en un gratuit)
4. Cliquez sur **"Connect"**
5. Choisissez **"Connect your application"**
6. Copiez la connection string
7. Remplacez `<password>` par votre mot de passe MongoDB
8. Remplacez `<dbname>` par `pocketguard-ai` (ou votre nom de DB)

**Important** : Ajoutez `0.0.0.0/0` dans **Network Access** pour permettre toutes les connexions.

### Étape 6 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes
3. Votre application sera déployée à : `https://fin-tech-project.vercel.app` (ou un nom similaire)

### Étape 7 : Mettre à jour FRONTEND_URL

Une fois déployé :

1. Allez dans **Settings** → **Environment Variables**
2. Mettez à jour `FRONTEND_URL` avec votre URL Vercel réelle
3. Redéployez l'application

---

## 📋 Checklist de Déploiement

- [ ] Compte Vercel créé
- [ ] Repository GitHub importé dans Vercel
- [ ] MongoDB Atlas cluster créé et configuré
- [ ] Network Access configuré dans MongoDB Atlas (0.0.0.0/0)
- [ ] MongoDB URI obtenue et testée
- [ ] Secrets JWT générés (2 secrets différents)
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Déploiement initial réussi
- [ ] FRONTEND_URL mis à jour avec l'URL Vercel réelle
- [ ] Redéploiement effectué
- [ ] Application testée en production

---

## 🔧 Résolution de Problèmes

### Erreur de connexion MongoDB

- Vérifiez que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas
- Vérifiez que le mot de passe dans l'URI est correct
- Vérifiez que le nom de la base de données est correct

### Erreur de build

- Vérifiez les logs de build dans Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez que `next.config.mjs` est correct

### Erreur 500 en production

- Vérifiez les logs de runtime dans Vercel
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez la connexion MongoDB

---

## 🎯 Après le Déploiement

Une fois déployé avec succès :

1. **Testez votre application** :
   - Visitez votre URL Vercel
   - Testez l'inscription / connexion
   - Testez les fonctionnalités principales

2. **Partagez le lien** :
   - Votre application est maintenant accessible publiquement !
   - Partagez le lien avec vos utilisateurs

3. **Monitorez** :
   - Surveillez les logs dans Vercel
   - Surveillez les métriques de performance
   - Surveillez l'utilisation MongoDB

---

## 📞 Support

En cas de problème, consultez :
- Les logs dans Vercel Dashboard
- La documentation Vercel : https://vercel.com/docs
- La documentation MongoDB Atlas : https://docs.atlas.mongodb.com

---

**Bon déploiement ! 🚀**

