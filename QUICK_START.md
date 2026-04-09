# 🚀 Guide de Démarrage Rapide

## ⚡ Démarrage en 3 Étapes

### 1️⃣ Copier le fichier de configuration

```bash
# Copiez .env.example vers .env.local
copy .env.example .env.local
```

Ou manuellement : créez un fichier `.env.local` avec ce contenu minimum:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/pocketguard-ai
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 2️⃣ Démarrer MongoDB

**Windows (PowerShell en administrateur):**
```powershell
net start MongoDB
```

**Si MongoDB n'est pas installé comme service:**
```powershell
# Créer le dossier de données
mkdir C:\data\db

# Démarrer MongoDB manuellement
mongod --dbpath C:\data\db
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 3️⃣ Tester la connexion

```bash
node check-mongodb-connection.js
```

Si tout fonctionne, vous verrez: ✅ **Connexion réussie!**

### 4️⃣ Démarrer l'application

```bash
npm run dev
```

Ouvrez votre navigateur sur: **http://localhost:3000**

---

## 🆘 En cas de problème

### ❌ Erreur: ECONNREFUSED

**Problème:** MongoDB n'est pas démarré.

**Solution:**
1. Démarrez MongoDB (voir étape 2 ci-dessus)
2. Vérifiez que MongoDB écoute sur le port 27017:
   ```bash
   netstat -ano | findstr :27017
   ```

### ❌ MongoDB non installé?

**Option 1: Installation locale**
- Téléchargez MongoDB Community: https://www.mongodb.com/try/download/community
- Installez avec l'option "Install as Windows Service"

**Option 2: Cloud gratuit (recommandé pour débuter)**
1. Créez un compte sur MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
2. Créez un cluster gratuit (M0)
3. Obtenez votre connection string
4. Mettez-le dans `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pocketguard-ai
   ```

### ❌ Port 27017 déjà utilisé

```powershell
# Trouver le processus
netstat -ano | findstr :27017

# Arrêter le processus
taskkill /PID <PID> /F

# Redémarrer MongoDB
net start MongoDB
```

---

## 📚 Documentation Complète

- **Fix complet de l'erreur:** Voir [MONGODB_FIX.md](./MONGODB_FIX.md)
- **Configuration détaillée:** Voir [.env.example](./.env.example)

---

## ✅ Checklist de Vérification

- [ ] MongoDB est installé
- [ ] MongoDB est démarré (service ou manuellement)
- [ ] Fichier `.env.local` créé avec `MONGODB_URI`
- [ ] Test de connexion réussi (`node check-mongodb-connection.js`)
- [ ] Application Next.js démarre sans erreur (`npm run dev`)

---

**Besoin d'aide?** Consultez [MONGODB_FIX.md](./MONGODB_FIX.md) pour un guide détaillé.
