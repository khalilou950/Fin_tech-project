# 🚀 Installation Rapide de MongoDB

## ❌ Résultat de la vérification

MongoDB **n'est pas installé** sur votre système.

---

## ✅ Option 1: MongoDB Atlas (RECOMMANDÉ - Gratuit et Facile)

### Avantages:
- ✅ Pas besoin d'installer quoi que ce soit
- ✅ Gratuit jusqu'à 512 MB
- ✅ Accessible de n'importe où
- ✅ Configuré en 5 minutes

### Étapes:

1. **Allez sur MongoDB Atlas:**
   - https://www.mongodb.com/cloud/atlas/register
   - Créez un compte gratuit

2. **Créez un cluster gratuit:**
   - Cliquez "Build a Database"
   - Choisissez "FREE" (M0 Sandbox)
   - Région: Choisissez la plus proche (ex: Europe - Ireland)
   - Nom: "Cluster0" (par défaut)
   - Cliquez "Create"

3. **Créez un utilisateur de base de données:**
   - Dans "Database Access", cliquez "Add New Database User"
   - Authentication: "Password"
   - Username: `pocketguard` (ou votre choix)
   - Password: Créez un mot de passe fort (ex: `MySecurePass123!`)
   - **⚠️ IMPORTANT: Notez ce mot de passe!**
   - Role: "Atlas Admin"
   - Cliquez "Add User"

4. **Configurez l'accès réseau:**
   - Dans "Network Access", cliquez "Add IP Address"
   - Cliquez "Allow Access from Anywhere" (pour le développement)
   - Cliquez "Confirm"
   - ⚠️ En production, utilisez des IPs spécifiques

5. **Obtenez la chaîne de connexion:**
   - Dans "Database", cliquez "Connect"
   - Choisissez "Connect your application"
   - Driver: "Node.js"
   - Version: "5.5 or later"
   - **Copiez la chaîne de connexion** (elle ressemble à: `mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

6. **Configurez le .env:**
   
   Créez ou modifiez le fichier `.env` dans `app/backend/`:
   
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/pocketguard-ai?retryWrites=true&w=majority
   ```
   
   ⚠️ **Important**: Remplacez:
   - `your-username` par votre nom d'utilisateur MongoDB Atlas
   - `your-password` par votre mot de passe MongoDB Atlas
   - `cluster0.xxxxx.mongodb.net` par l'URL de votre cluster

7. **Testez la connexion:**
   ```bash
   cd app/backend
   npm run dev
   ```
   
   Vous devriez voir:
   ```
   MongoDB Connected: cluster0-shard-00-xx.xxxxx.mongodb.net
   🚀 Server running on port 5000
   ```

---

## 🔧 Option 2: MongoDB Local (Windows)

### Installation sur Windows:

1. **Téléchargez MongoDB:**
   - https://www.mongodb.com/try/download/community
   - Version: "Windows"
   - Package: "MSI"
   - Cliquez "Download"

2. **Installez MongoDB:**
   - Exécutez le fichier `.msi` téléchargé
   - Suivez l'assistant d'installation
   - **IMPORTANT:** Cochez ✅ "Install MongoDB as a Service"
   - Cochez ✅ "Install MongoDB Compass" (GUI optionnel)
   - Cliquez "Complete"

3. **Vérifiez l'installation:**
   
   Ouvrez PowerShell (Admin) et exécutez:
   ```powershell
   mongod --version
   ```
   
   Vous devriez voir la version de MongoDB.

4. **Démarrez MongoDB:**
   
   MongoDB devrait démarrer automatiquement comme service Windows.
   
   Pour vérifier:
   ```powershell
   net start MongoDB
   ```
   
   Si ça dit "The requested service has already been started", c'est bon!

5. **Configurez le .env:**
   
   Créez ou modifiez le fichier `.env` dans `app/backend/`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   ```

6. **Testez:**
   ```bash
   cd app/backend
   npm run dev
   ```

---

## ✅ Après l'installation

Une fois MongoDB configuré (Atlas ou local):

1. **Vérifiez que le .env est correct:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   # ou pour Atlas:
   # MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/pocketguard-ai?retryWrites=true&w=majority
   ```

2. **Démarrez le serveur:**
   ```bash
   cd app/backend
   npm run dev
   ```

3. **Remplissez la base avec des données de test:**
   ```bash
   npm run seed
   ```

4. **Testez l'API:**
   ```bash
   npm test
   ```

---

## 🆘 Problèmes courants

### Erreur: "connect ECONNREFUSED"
- **MongoDB local:** Vérifiez que le service MongoDB est démarré
  ```powershell
  net start MongoDB
  ```
- **Atlas:** Vérifiez que votre IP est autorisée dans Network Access

### Erreur: "Authentication failed"
- **Atlas:** Vérifiez votre nom d'utilisateur et mot de passe dans `MONGODB_URI`
- Assurez-vous que les caractères spéciaux dans le mot de passe sont encodés (ex: `@` devient `%40`)

### Erreur: "mongod is not recognized"
- MongoDB n'est pas installé ou pas dans le PATH
- Réinstallez MongoDB en cochant "Add MongoDB to PATH" lors de l'installation
- Ou utilisez MongoDB Atlas (option 1)

---

## 💡 Recommandation

**Utilisez MongoDB Atlas** pour commencer rapidement:
- ✅ Plus rapide (pas d'installation)
- ✅ Gratuit
- ✅ Fonctionne immédiatement
- ✅ Accessible de partout

Vous pourrez toujours installer MongoDB local plus tard si nécessaire!

---

## 📚 Aide supplémentaire

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Documentation MongoDB:** https://docs.mongodb.com/
- **Guide détaillé:** Voir `MONGODB_SETUP.md`



