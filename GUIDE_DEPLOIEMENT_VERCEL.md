# 🚀 Guide Complet : Déployer sur Vercel

## 📋 Vue d'ensemble

Ce guide vous explique **étape par étape** comment déployer votre application Finovia sur Vercel. Le déploiement prend environ **5-10 minutes**.

---

## 🎯 Prérequis

- ✅ Compte GitHub (déjà fait - votre code est sur GitHub)
- ✅ Compte MongoDB Atlas (à créer)
- ✅ Compte Vercel (à créer - gratuit)

---

## 📝 ÉTAPE 1 : Préparer MongoDB Atlas (5 minutes)

### 1.1 Créer un compte MongoDB Atlas

1. Allez sur **https://cloud.mongodb.com**
2. Cliquez sur **"Try Free"** ou **"Sign Up"**
3. Créez un compte gratuit (vous pouvez utiliser votre email GitHub)

### 1.2 Créer un cluster gratuit

1. Une fois connecté, cliquez sur **"Build a Database"**
2. Choisissez **"FREE" (M0)** - C'est gratuit !
3. Sélectionnez une région proche de vous (ex: `Frankfurt (eu-central-1)`)
4. Cliquez sur **"Create"**
5. Attendez 3-5 minutes que le cluster soit créé

### 1.3 Configurer l'accès réseau

1. Dans le menu de gauche, cliquez sur **"Network Access"**
2. Cliquez sur **"Add IP Address"**
3. Cliquez sur **"Allow Access from Anywhere"** (cela ajoutera `0.0.0.0/0`)
4. Cliquez sur **"Confirm"**

⚠️ **Important** : Cela permet à Vercel de se connecter à votre base de données.

### 1.4 Créer un utilisateur de base de données

1. Dans le menu de gauche, cliquez sur **"Database Access"**
2. Cliquez sur **"Add New Database User"**
3. Choisissez **"Password"** comme méthode d'authentification
4. **Username** : Entrez `finovia-admin` (ou autre nom)
5. **Password** : 
   - Cliquez sur **"Autogenerate Secure Password"**
   - **⚠️ IMPORTANT : Cliquez sur "Copy" et sauvegardez ce mot de passe !**
   - Vous ne pourrez plus le voir après !
6. **Database User Privileges** : Choisissez **"Atlas admin"** (ou "Read and write to any database")
7. Cliquez sur **"Add User"**

### 1.5 Obtenir la connection string

1. Dans le menu de gauche, cliquez sur **"Database"**
2. Cliquez sur **"Connect"** à côté de votre cluster
3. Choisissez **"Connect your application"**
4. **Driver** : Sélectionnez `Node.js`
5. **Version** : Sélectionnez la version la plus récente (ex: `5.5 or later`)
6. **Copiez la connection string** qui ressemble à :
   ```
   mongodb+srv://finovia-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Remplacez** `<password>` par le mot de passe que vous avez sauvegardé
8. **Ajoutez le nom de la base de données** : Ajoutez `/pocketguard-ai` avant le `?`

**Exemple final** :
```
mongodb+srv://finovia-admin:VotreMotDePasse123@cluster0.xxxxx.mongodb.net/pocketguard-ai?retryWrites=true&w=majority
```

✅ **Sauvegardez cette URI complète**, vous en aurez besoin pour Vercel !

---

## 🔐 ÉTAPE 2 : Générer les secrets JWT (2 minutes)

### 2.1 Ouvrir PowerShell

Ouvrez PowerShell sur Windows (recherchez "PowerShell" dans le menu Démarrer)

### 2.2 Générer le premier secret (JWT_SECRET)

Dans PowerShell, exécutez cette commande :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Exemple de résultat** :
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

✅ **Copiez ce résultat** - c'est votre `JWT_SECRET`

### 2.3 Générer le deuxième secret (JWT_REFRESH_SECRET)

Exécutez la même commande à nouveau :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Exemple de résultat** :
```
f1e2d3c4b5a6789012345678901234567890fedcba1234567890fedcba123456
```

✅ **Copiez ce deuxième résultat** - c'est votre `JWT_REFRESH_SECRET`

---

## 🌐 ÉTAPE 3 : Déployer sur Vercel (5 minutes)

### 3.1 Créer un compte Vercel

1. Allez sur **https://vercel.com**
2. Cliquez sur **"Sign Up"** (en haut à droite)
3. Cliquez sur **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub
5. Vous serez redirigé vers le dashboard Vercel

### 3.2 Importer votre projet

1. Dans le dashboard Vercel, cliquez sur **"Add New..."** (en haut à droite)
2. Cliquez sur **"Project"**
3. Vous verrez une liste de vos repositories GitHub
4. **Recherchez** `Fin_tech-project` (ou `khalilou950/Fin_tech-project`)
5. Cliquez sur **"Import"** à côté de votre repository

### 3.3 Configurer le projet

Vercel détectera automatiquement que c'est un projet Next.js. Les paramètres par défaut sont généralement corrects :

- **Framework Preset** : `Next.js` ✅
- **Root Directory** : `./` (racine) ✅
- **Build Command** : `npm run build` ✅
- **Output Directory** : `.next` ✅
- **Install Command** : `npm install` ✅

**Ne modifiez rien**, ces paramètres sont corrects !

### 3.4 ⚠️ IMPORTANT : Configurer les Variables d'Environnement

**AVANT de cliquer sur "Deploy"**, vous devez configurer les variables d'environnement !

1. Dans la section **"Environment Variables"**, cliquez pour ajouter des variables
2. Ajoutez ces **6 variables** une par une :

#### Variable 1 : MONGODB_URI
- **Key** : `MONGODB_URI`
- **Value** : Collez votre MongoDB URI complète de l'étape 1.5
  ```
  mongodb+srv://finovia-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/pocketguard-ai?retryWrites=true&w=majority
  ```
- **Environment** : Sélectionnez `Production`, `Preview`, et `Development` (tous les trois)

#### Variable 2 : JWT_SECRET
- **Key** : `JWT_SECRET`
- **Value** : Collez le premier secret généré à l'étape 2.2
  ```
  a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
  ```
- **Environment** : Sélectionnez `Production`, `Preview`, et `Development`

#### Variable 3 : JWT_REFRESH_SECRET
- **Key** : `JWT_REFRESH_SECRET`
- **Value** : Collez le deuxième secret généré à l'étape 2.3
  ```
  f1e2d3c4b5a6789012345678901234567890fedcba1234567890fedcba123456
  ```
- **Environment** : Sélectionnez `Production`, `Preview`, et `Development`

#### Variable 4 : JWT_EXPIRE
- **Key** : `JWT_EXPIRE`
- **Value** : `7d`
- **Environment** : Sélectionnez `Production`, `Preview`, et `Development`

#### Variable 5 : JWT_REFRESH_EXPIRE
- **Key** : `JWT_REFRESH_EXPIRE`
- **Value** : `30d`
- **Environment** : Sélectionnez `Production`, `Preview`, et `Development`

#### Variable 6 : NODE_ENV
- **Key** : `NODE_ENV`
- **Value** : `production`
- **Environment** : Sélectionnez `Production` uniquement

### 3.5 Déployer

1. Vérifiez que toutes les 6 variables sont ajoutées
2. Cliquez sur le bouton **"Deploy"** (en bas de la page)
3. Attendez **2-3 minutes** pendant que Vercel :
   - Installe les dépendances
   - Build votre application
   - Déploie sur leurs serveurs

4. Vous verrez la progression en temps réel dans la console

### 3.6 Obtenir votre URL

Une fois le déploiement terminé :

1. Vous verrez une page de succès avec votre URL
2. Votre URL ressemblera à : `https://fin-tech-project-xxx.vercel.app`
3. **Copiez cette URL** - c'est l'URL publique de votre application !

---

## 🔄 ÉTAPE 4 : Mettre à jour FRONTEND_URL (2 minutes)

### 4.1 Ajouter la variable FRONTEND_URL

1. Dans Vercel, allez dans votre projet
2. Cliquez sur **"Settings"** (en haut)
3. Dans le menu de gauche, cliquez sur **"Environment Variables"**
4. Cliquez sur **"Add New"**
5. Ajoutez :
   - **Key** : `FRONTEND_URL`
   - **Value** : Votre URL Vercel (ex: `https://fin-tech-project-xxx.vercel.app`)
   - **Environment** : Sélectionnez `Production`, `Preview`, et `Development`

### 4.2 Redéployer

1. Allez dans l'onglet **"Deployments"** (en haut)
2. Trouvez le dernier déploiement
3. Cliquez sur les **3 points** (...) à droite
4. Cliquez sur **"Redeploy"**
5. Confirmez le redéploiement
6. Attendez 1-2 minutes

---

## ✅ ÉTAPE 5 : Tester votre application

### 5.1 Vérifier que l'application fonctionne

1. Ouvrez votre URL Vercel dans un navigateur
2. Vous devriez voir votre application Finovia
3. Testez :
   - La page d'accueil
   - L'inscription (`/signup`)
   - La connexion (`/signin`)

### 5.2 Tester avec un compte de test

1. Créez un compte de test via `/signup`
2. Connectez-vous
3. Testez les fonctionnalités :
   - Ajouter une transaction
   - Créer un budget
   - Voir le dashboard

---

## 🎉 Félicitations !

Votre application est maintenant **en ligne** et **accessible à tous** !

### 📍 Votre application est ici :
**https://fin-tech-project-xxx.vercel.app**  
*(Remplacez par votre URL réelle)*

### ✅ Vous pouvez maintenant :
- ✅ Partager le lien avec n'importe qui
- ✅ Tester toutes les fonctionnalités
- ✅ Voir votre application en production
- ✅ Utiliser l'application sur mobile

---

## 🔧 Résolution de problèmes

### ❌ Erreur : "Failed to connect to MongoDB"

**Solution** :
1. Vérifiez que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas → Network Access
2. Vérifiez que votre MongoDB URI est correcte (mot de passe, nom de la base)
3. Vérifiez les logs dans Vercel → Deployments → Votre déploiement → Logs

### ❌ Erreur : "Build failed"

**Solution** :
1. Vérifiez les logs de build dans Vercel
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez que `package.json` contient toutes les dépendances

### ❌ Erreur : "500 Internal Server Error"

**Solution** :
1. Vérifiez les logs de runtime dans Vercel
2. Vérifiez que `FRONTEND_URL` est défini correctement
3. Vérifiez la connexion MongoDB

### ❌ Erreur : "Invalid JWT token"

**Solution** :
1. Vérifiez que `JWT_SECRET` et `JWT_REFRESH_SECRET` sont définis
2. Assurez-vous qu'ils sont différents l'un de l'autre

---

## 📚 Ressources supplémentaires

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation MongoDB Atlas** : https://docs.atlas.mongodb.com
- **Logs de votre application** : Vercel Dashboard → Votre projet → Deployments → Logs

---

## 🔄 Mettre à jour votre application

Chaque fois que vous poussez du code sur GitHub :

1. Vercel détectera automatiquement les changements
2. Il redéploiera automatiquement votre application
3. Vous recevrez une notification par email

**C'est automatique !** 🚀

---

**Besoin d'aide ? Consultez les logs dans Vercel Dashboard ou ouvrez une issue sur GitHub !**

