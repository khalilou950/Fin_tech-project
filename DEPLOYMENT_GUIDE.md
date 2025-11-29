# 🚀 Guide de Déploiement - Finovia

## 📋 État Actuel

✅ **Code source sur GitHub** : https://github.com/khalilou950/Fin_tech-project  
❌ **Application déployée** : Pas encore déployée

## 🎯 Objectif : Déployer l'Application en Ligne

Pour que votre application soit accessible à tous via un lien, vous devez déployer :

1. **Frontend (Next.js)** → Vercel (recommandé et gratuit)
2. **Backend (Express)** → Railway, Render, ou Heroku
3. **Base de données** → MongoDB Atlas (déjà configurée dans le projet)

---

## 🌐 Option 1 : Déploiement Complet (Recommandé)

### Frontend + Backend sur Vercel

Vercel peut héberger à la fois votre frontend Next.js et vos API routes.

#### Étapes :

1. **Créer un compte Vercel**
   - Aller sur https://vercel.com
   - Se connecter avec votre compte GitHub

2. **Importer le projet**
   - Cliquer sur "Add New" → "Project"
   - Sélectionner le repository `Fin_tech-project`
   - Vercel détectera automatiquement Next.js

3. **Configurer les variables d'environnement**
   ```
   MONGODB_URI=votre-uri-mongodb-atlas
   JWT_SECRET=votre-jwt-secret
   JWT_REFRESH_SECRET=votre-refresh-secret
   FRONTEND_URL=https://votre-app.vercel.app
   ```

4. **Déployer**
   - Cliquer sur "Deploy"
   - Attendre 2-3 minutes
   - Vous obtiendrez un lien : `https://votre-app.vercel.app`

---

## 🔧 Option 2 : Déploiement Séparé

### Frontend sur Vercel + Backend sur Railway

#### Frontend (Vercel) :

1. Aller sur https://vercel.com
2. Importer le repository GitHub
3. Configurer les variables d'environnement
4. Déployer

#### Backend (Railway) :

1. Aller sur https://railway.app
2. Créer un compte avec GitHub
3. Créer un nouveau projet
4. Cliquer sur "New" → "GitHub Repo"
5. Sélectionner votre repository
6. Configurer le service :
   - **Root Directory** : `app/backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
7. Ajouter les variables d'environnement
8. Déployer

**Note** : Pour Railway, vous devrez peut-être créer un fichier `Procfile` ou `railway.json` pour configurer le démarrage.

---

## 📦 Option 3 : Déploiement Backend sur Render

### Étapes pour Render :

1. Aller sur https://render.com
2. Créer un compte gratuit
3. Cliquer sur "New +" → "Web Service"
4. Connecter votre repository GitHub
5. Configurer :
   - **Name** : `finovia-backend`
   - **Root Directory** : `app/backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
6. Ajouter les variables d'environnement
7. Déployer

---

## 🗄️ Configuration MongoDB Atlas

1. Aller sur https://cloud.mongodb.com
2. Créer un cluster gratuit (si pas déjà fait)
3. Obtenir la connection string
4. Ajouter l'IP 0.0.0.0/0 dans Network Access (pour permettre toutes les connexions)

---

## ⚙️ Variables d'Environnement Requises

Pour le déploiement, vous aurez besoin de :

```env
# Backend
PORT=5000
NODE_ENV=production
MONGODB_URI=votre-uri-mongodb-atlas
JWT_SECRET=votre-secret-jwt-super-securise
JWT_REFRESH_SECRET=votre-secret-refresh-super-securise
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://votre-frontend-url.vercel.app

# Frontend (si séparé)
NEXT_PUBLIC_API_URL=https://votre-backend-url.railway.app
```

---

## 🔒 Sécurité

1. **Générer des secrets sécurisés** :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Ne jamais committer** les vraies valeurs dans Git

3. **Utiliser les variables d'environnement** de la plateforme

---

## 📝 Checklist de Déploiement

- [ ] Compte Vercel créé
- [ ] Compte Railway/Render créé (si backend séparé)
- [ ] MongoDB Atlas configuré
- [ ] Variables d'environnement configurées
- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé (si séparé)
- [ ] URLs configurées dans les variables d'environnement
- [ ] Application testée en production

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs de déploiement
2. Vérifier les variables d'environnement
3. Vérifier la connexion MongoDB
4. Vérifier les URLs CORS

---

## 💰 Coûts

- **Vercel** : Gratuit pour projets personnels (hobby plan)
- **Railway** : Gratuit jusqu'à 500 heures/mois
- **Render** : Gratuit avec quelques limitations
- **MongoDB Atlas** : Gratuit jusqu'à 512MB

---

**Une fois déployé, votre application sera accessible à tous via un lien public !** 🌐

