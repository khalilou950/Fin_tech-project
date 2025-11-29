# ✅ Vérification de l'Installation MongoDB

## ❌ Résultat: MongoDB n'est PAS installé

### Vérifications effectuées:
- ❌ `mongod` n'est pas dans le PATH
- ❌ Aucun service MongoDB trouvé
- ❌ Dossiers d'installation par défaut absents

---

## 🚀 Solution: Installer MongoDB

### Option 1: MongoDB Atlas (RECOMMANDÉ - 5 minutes)

**Avantages:**
- ✅ Pas d'installation locale
- ✅ Gratuit jusqu'à 512 MB
- ✅ Fonctionne immédiatement
- ✅ Accessible de partout

**Étapes:**

1. **Allez sur:** https://www.mongodb.com/cloud/atlas/register
2. **Créez un compte gratuit**
3. **Créez un cluster gratuit (M0 Sandbox)**
4. **Configurez:**
   - Database Access: Créez un utilisateur (ex: `pocketguard` + mot de passe)
   - Network Access: "Allow Access from Anywhere"
5. **Obtenez la chaîne de connexion:**
   - Cliquez "Connect" → "Connect your application"
   - Copiez la chaîne (ex: `mongodb+srv://...`)
6. **Configurez `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pocketguard-ai?retryWrites=true&w=majority
   ```

**C'est tout!** Pas besoin d'installer quoi que ce soit.

---

### Option 2: Installation Locale Windows

**Étapes:**

1. **Téléchargez MongoDB:**
   - https://www.mongodb.com/try/download/community
   - Version: **Windows**
   - Package: **MSI**
   - Cliquez "Download"

2. **Installez:**
   - Exécutez le fichier `.msi` téléchargé
   - Cliquez "Next" → "Complete" (installation complète)
   - **IMPORTANT:** Cochez ✅ "Install MongoDB as a Service"
   - Choisissez "Run service as Network Service user" (Option 1)
   - **IMPORTANT:** Cochez ✅ "Install MongoDB Compass" (GUI optionnel)
   - Cliquez "Install"

3. **Vérifiez l'installation:**
   
   Ouvrez PowerShell (en tant qu'administrateur) et exécutez:
   ```powershell
   mongod --version
   ```
   
   Vous devriez voir quelque chose comme:
   ```
   db version v7.0.x
   ```

4. **Démarrez MongoDB:**
   
   MongoDB devrait démarrer automatiquement. Vérifiez:
   ```powershell
   net start MongoDB
   ```
   
   Si vous voyez "The requested service has already been started", c'est bon!

5. **Configurez `.env`:**
   
   Dans `app/backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   ```

6. **Testez:**
   ```bash
   cd app/backend
   npm run dev
   ```

---

## 🔍 Comment vérifier après installation

### Vérification rapide:
```powershell
# Vérifier la version
mongod --version

# Vérifier le service
net start MongoDB

# Vérifier le port
netstat -an | findstr :27017
```

### Vérification complète:
```bash
cd app/backend
npm run check-mongodb
```

---

## ✅ Après installation réussie

1. **Configurez `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   # ou pour Atlas:
   # MONGODB_URI=mongodb+srv://...
   ```

2. **Démarrez le serveur:**
   ```bash
   cd app/backend
   npm run dev
   ```

3. **Vous devriez voir:**
   ```
   MongoDB Connected: localhost:27017
   🚀 Server running on port 5000 in development mode
   ```

4. **Remplissez la base avec des données de test:**
   ```bash
   npm run seed
   ```

5. **Testez l'API:**
   ```bash
   npm test
   ```

---

## 💡 Recommandation

**Utilisez MongoDB Atlas** pour commencer rapidement:
- ✅ Plus rapide (pas d'installation)
- ✅ Gratuit
- ✅ Fonctionne immédiatement
- ✅ Pas de configuration système

Vous pourrez toujours installer MongoDB local plus tard si nécessaire!

---

## 🆘 Besoin d'aide?

- **Guide Atlas:** https://www.mongodb.com/cloud/atlas
- **Documentation:** https://docs.mongodb.com/
- **Support:** Voir `INSTALL_MONGODB.md` pour plus de détails

