# ⚡ Déploiement Rapide - Finovia

## 🚀 Déployer en 5 minutes

### Option 1 : Déploiement via Interface Web (Recommandé)

#### Étape 1 : Préparer MongoDB Atlas (2 minutes)

1. **Aller sur MongoDB Atlas** : https://cloud.mongodb.com
2. **Créer un compte** (si pas déjà fait) - GRATUIT
3. **Créer un cluster** :
   - Cliquer "Build a Database"
   - Choisir "FREE" (M0)
   - Sélectionner une région
   - Cliquer "Create"
4. **Configurer Network Access** :
   - Aller dans "Network Access"
   - Cliquer "Add IP Address"
   - Cliquer "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirmer
5. **Créer un utilisateur de base de données** :
   - Aller dans "Database Access"
   - Cliquer "Add New Database User"
   - Username : `finovia-user` (ou autre)
   - Password : Générer un mot de passe sécurisé
   - **⚠️ IMPORTANT : Sauvegarder le mot de passe !**
   - Rôle : "Atlas admin" ou "Read and write to any database"
   - Cliquer "Add User"
6. **Obtenir la connection string** :
   - Aller dans "Database" → Cliquer "Connect"
   - Choisir "Connect your application"
   - Copier la chaîne de connexion
   - **Exemple** : `mongodb+srv://finovia-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Remplacer `<password>` par votre mot de passe
   - Ajouter `/pocketguard-ai` avant le `?`
   - **Exemple final** : `mongodb+srv://finovia-user:VotreMotDePasse@cluster0.xxxxx.mongodb.net/pocketguard-ai?retryWrites=true&w=majority`

#### Étape 2 : Générer les Secrets JWT (1 minute)

Ouvrez PowerShell et exécutez ces commandes :

```powershell
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copier le résultat et l'exécuter à nouveau pour JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Sauvegardez les 2 secrets générés !**

#### Étape 3 : Déployer sur Vercel (2 minutes)

1. **Aller sur Vercel** : https://vercel.com
2. **Se connecter avec GitHub** :
   - Cliquer "Sign Up"
   - Choisir "Continue with GitHub"
   - Autoriser Vercel
3. **Importer le projet** :
   - Cliquer "Add New..." → "Project"
   - Rechercher "Fin_tech-project"
   - Cliquer "Import"
4. **Configurer les Variables d'Environnement** :
   - Avant de déployer, cliquer sur "Environment Variables"
   - Ajouter ces variables :

   ```
   MONGODB_URI = [Votre MongoDB URI complète obtenue à l'étape 1]
   JWT_SECRET = [Premier secret généré à l'étape 2]
   JWT_REFRESH_SECRET = [Deuxième secret généré à l'étape 2]
   JWT_EXPIRE = 7d
   JWT_REFRESH_EXPIRE = 30d
   NODE_ENV = production
   ```

   ⚠️ **Pour FRONTEND_URL** : Laissez-le vide pour l'instant, on le mettra à jour après le premier déploiement.

5. **Déployer** :
   - Cliquer "Deploy"
   - Attendre 2-3 minutes
   - Votre application sera disponible sur `https://fin-tech-project-xxx.vercel.app`

6. **Mettre à jour FRONTEND_URL** :
   - Une fois déployé, copier l'URL (ex: `https://fin-tech-project-xxx.vercel.app`)
   - Aller dans "Settings" → "Environment Variables"
   - Ajouter ou modifier : `FRONTEND_URL = https://fin-tech-project-xxx.vercel.app`
   - Cliquer "Redeploy" ou aller dans "Deployments" → "Redeploy"

#### ✅ C'est terminé !

Votre application est maintenant en ligne et accessible à tous via le lien Vercel ! 🎉

---

## 📋 Récapitulatif des URLs à noter

- **Application en ligne** : `https://fin-tech-project-xxx.vercel.app`
- **MongoDB Atlas Dashboard** : https://cloud.mongodb.com
- **Vercel Dashboard** : https://vercel.com/dashboard

---

## 🔧 En cas de problème

1. **Vérifier les logs** : Vercel Dashboard → Votre projet → "Deployments" → Cliquer sur le dernier déploiement → "Logs"
2. **Vérifier MongoDB** : MongoDB Atlas → Database → "Browse Collections" pour voir si les données sont créées
3. **Vérifier les variables d'environnement** : Vercel → Settings → Environment Variables

---

**Besoin d'aide ? Consultez DEPLOYMENT_INSTRUCTIONS.md pour plus de détails.**

