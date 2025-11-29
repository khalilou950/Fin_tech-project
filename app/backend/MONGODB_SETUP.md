# Guide de Configuration MongoDB

## 🚀 Installation et Configuration de MongoDB

### Option 1: MongoDB Local (Recommandé pour le développement)

#### Windows

1. **Télécharger MongoDB Community Server:**
   - Allez sur https://www.mongodb.com/try/download/community
   - Choisissez Windows et téléchargez

2. **Installer MongoDB:**
   - Exécutez le fichier .msi téléchargé
   - Suivez l'assistant d'installation
   - ✅ Cochez "Install MongoDB as a Service"
   - ✅ Cochez "Install MongoDB Compass" (GUI optionnel)

3. **Démarrer MongoDB:**
   ```bash
   # MongoDB démarre automatiquement comme service Windows
   # Vérifier le statut:
   net start MongoDB
   ```

4. **Vérifier l'installation:**
   ```bash
   # Dans PowerShell ou CMD
   mongod --version
   ```

5. **Configurer le .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   ```

#### macOS

1. **Installer avec Homebrew:**
   ```bash
   # Installer Homebrew si pas déjà installé
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Installer MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Démarrer MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

3. **Vérifier:**
   ```bash
   brew services list
   # Vous devriez voir mongodb-community started
   ```

4. **Configurer le .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   ```

#### Linux (Ubuntu/Debian)

1. **Installer MongoDB:**
   ```bash
   # Importer la clé publique
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   
   # Ajouter le repository
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   
   # Mettre à jour et installer
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Démarrer MongoDB:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Vérifier:**
   ```bash
   sudo systemctl status mongod
   ```

4. **Configurer le .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   ```

---

### Option 2: MongoDB Atlas (Cloud - Gratuit)

**Avantages:**
- ✅ Pas besoin d'installer MongoDB localement
- ✅ Accessible depuis n'importe où
- ✅ Gratuit jusqu'à 512 MB
- ✅ Hébergé et maintenu par MongoDB

#### Étapes:

1. **Créer un compte:**
   - Allez sur https://www.mongodb.com/cloud/atlas/register
   - Créez un compte gratuit

2. **Créer un cluster:**
   - Cliquez sur "Build a Database"
   - Choisissez "FREE" (M0 Sandbox)
   - Sélectionnez un provider (AWS, Google Cloud, Azure)
   - Choisissez une région proche de vous
   - Nommez votre cluster (ex: "Cluster0")

3. **Créer un utilisateur de base de données:**
   - Dans "Database Access", cliquez "Add New Database User"
   - Choisissez "Password" comme méthode d'authentification
   - Créez un nom d'utilisateur et un mot de passe
   - **⚠️ IMPORTANT: Sauvegardez ces identifiants!**
   - Rôle: "Atlas Admin" ou "Read and write to any database"

4. **Configurer le réseau:**
   - Dans "Network Access", cliquez "Add IP Address"
   - Pour le développement: Cliquez "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ En production, utilisez des IPs spécifiques

5. **Obtenir la chaîne de connexion:**
   - Dans "Database", cliquez "Connect"
   - Choisissez "Connect your application"
   - Sélectionnez "Node.js" et la version
   - Copiez la chaîne de connexion

6. **Configurer le .env:**
   ```env
   # Collez ici la chaîne de connexion copiée depuis MongoDB Atlas
   # Remplacez <password> par votre mot de passe réel
   # Remplacez le nom de la base de données si nécessaire
   MONGODB_URI=votre-chaine-de-connexion-mongodb-atlas
   ```

   **Instructions:**
   - Obtenez votre chaîne de connexion depuis MongoDB Atlas dashboard
   - Remplacez le placeholder `<password>` par votre mot de passe réel
   - Modifiez le nom de la base de données si nécessaire

---

## ✅ Vérification de la connexion

### Test 1: Vérifier que MongoDB fonctionne

**Local:**
```bash
# Windows
mongosh

# macOS/Linux
mongo
# ou
mongosh
```

Si ça fonctionne, vous verrez:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000
Using MongoDB: 7.0.0
```

### Test 2: Tester la connexion depuis le backend

1. **Démarrez le serveur:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Vous devriez voir:**
   ```
   MongoDB Connected: localhost:27017
   🚀 Server running on port 5000 in development mode
   ```

3. **Si vous voyez une erreur:**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   → MongoDB n'est pas démarré

---

## 🎯 Important: Pas besoin de créer la base manuellement!

**MongoDB crée automatiquement:**
- ✅ La base de données `pocketguard-ai` à la première connexion
- ✅ Les collections (`users`, `transactions`, `budgets`) automatiquement lors de la première insertion

**Vous n'avez qu'à:**
1. ✅ Installer MongoDB (local ou Atlas)
2. ✅ Configurer `MONGODB_URI` dans `.env`
3. ✅ Démarrer le serveur backend
4. ✅ Exécuter `npm run seed` pour remplir avec des données de test

---

## 🔧 Utiliser MongoDB Compass (GUI - Optionnel)

MongoDB Compass est une interface graphique pour visualiser votre base de données.

1. **Télécharger:**
   - https://www.mongodb.com/products/compass

2. **Se connecter:**
   - **Local:** `mongodb://localhost:27017`
   - **Atlas:** Utilisez votre chaîne de connexion

3. **Visualiser:**
   - Vous verrez la base `pocketguard-ai`
   - Les collections `users`, `transactions`, `budgets`
   - Les documents (enregistrements) dans chaque collection

---

## 🆘 Problèmes courants

### Erreur: "connect ECONNREFUSED"
- **Solution:** Vérifiez que MongoDB est démarré
  - Windows: `net start MongoDB`
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

### Erreur: "Authentication failed" (Atlas)
- **Solution:** Vérifiez votre nom d'utilisateur et mot de passe dans `MONGODB_URI`
- Assurez-vous que l'IP est autorisée dans Network Access

### Erreur: "Database name contains invalid characters"
- **Solution:** Vérifiez que `MONGODB_URI` ne contient pas de caractères spéciaux dans le nom de la base
- Utilisez: `pocketguard-ai` (pas `pocketguard_ai` ou `pocketguard ai`)

---

## 📚 Ressources

- **Documentation MongoDB:** https://docs.mongodb.com/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **MongoDB Compass:** https://www.mongodb.com/products/compass
- **Mongoose Documentation:** https://mongoosejs.com/docs/

---

## 🎯 Résumé

**Vous n'avez PAS besoin de:**
- ❌ Créer manuellement une base de données
- ❌ Créer manuellement les collections
- ❌ Utiliser PostgreSQL/PgAdmin (c'est MongoDB!)

**Vous avez juste besoin de:**
- ✅ Installer MongoDB (local ou utiliser Atlas)
- ✅ Configurer `MONGODB_URI` dans `.env`
- ✅ Démarrer MongoDB
- ✅ Démarrer le backend - tout se crée automatiquement!

