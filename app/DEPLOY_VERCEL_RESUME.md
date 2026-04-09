# ⚡ Résumé : Déployer sur Vercel en 3 Étapes

## 🎯 Objectif
Rendre votre application Finovia accessible publiquement sur Internet.

---

## 📋 ÉTAPE 1 : MongoDB Atlas (5 min)

1. **Créer un compte** : https://cloud.mongodb.com
2. **Créer un cluster gratuit** : "Build a Database" → "FREE"
3. **Autoriser toutes les IPs** : "Network Access" → "Allow Access from Anywhere" (0.0.0.0/0)
4. **Créer un utilisateur** : "Database Access" → "Add New Database User"
   - Username : `finovia-admin`
   - Password : Générer et **SAUVEGARDER** ⚠️
5. **Copier la connection string** : "Database" → "Connect" → "Connect your application"
   - Remplacer `<password>` par votre mot de passe
   - Ajouter `/pocketguard-ai` avant le `?`

**Résultat** : Une URI MongoDB complète au format :
```
mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER-URL]/pocketguard-ai?retryWrites=true&w=majority
```
*(Remplacez [USERNAME], [PASSWORD], et [CLUSTER-URL] par vos valeurs réelles depuis MongoDB Atlas)*

---

## 🔐 ÉTAPE 2 : Générer les Secrets (2 min)

Ouvrez PowerShell et exécutez **2 fois** :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Résultat** : 2 secrets différents à copier
- Premier = `JWT_SECRET`
- Deuxième = `JWT_REFRESH_SECRET`

---

## 🌐 ÉTAPE 3 : Déployer sur Vercel (5 min)

### 3.1 Créer un compte et importer

1. Aller sur **https://vercel.com**
2. **"Sign Up"** → **"Continue with GitHub"**
3. **"Add New"** → **"Project"**
4. Importer **"Fin_tech-project"**

### 3.2 ⚠️ Ajouter les Variables d'Environnement

**AVANT de cliquer "Deploy"**, ajoutez ces 6 variables :

| Nom | Valeur | 
|-----|--------|
| `MONGODB_URI` | Votre URI MongoDB complète (étape 1) |
| `JWT_SECRET` | Premier secret (étape 2) |
| `JWT_REFRESH_SECRET` | Deuxième secret (étape 2) |
| `JWT_EXPIRE` | `7d` |
| `JWT_REFRESH_EXPIRE` | `30d` |
| `NODE_ENV` | `production` |

⚠️ **Sélectionnez toutes les 3 environnements** : Production, Preview, Development (sauf NODE_ENV = Production seulement)

### 3.3 Déployer

1. Cliquer **"Deploy"**
2. Attendre 2-3 minutes
3. **Copier votre URL** : `https://fin-tech-project-xxx.vercel.app`

### 3.4 Ajouter FRONTEND_URL

1. **Settings** → **Environment Variables**
2. Ajouter :
   - `FRONTEND_URL` = Votre URL Vercel
3. **Deployments** → **Redeploy** le dernier déploiement

---

## ✅ C'EST FAIT !

Votre application est maintenant en ligne : **https://fin-tech-project-xxx.vercel.app**

---

## 📚 Guides Détaillés

- **Guide complet** : `GUIDE_DEPLOIEMENT_VERCEL.md` (instructions détaillées étape par étape)
- **Guide rapide** : `COMMENCER_DEPLOIEMENT.md`

---

## ❓ Problèmes Courants

| Problème | Solution |
|----------|----------|
| Erreur MongoDB | Vérifier que 0.0.0.0/0 est autorisé dans MongoDB Atlas |
| Build failed | Vérifier les logs dans Vercel → Deployments → Logs |
| 500 Error | Vérifier toutes les variables d'environnement sont définies |

---

**🎉 Votre application est maintenant accessible à tous sur Internet !**


