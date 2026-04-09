# ✅ Correction Appliquée - Erreur MongoDB

## 🐛 Problème Identifié

**Erreur:** `connect ECONNREFUSED ::1:27017`

**Cause:** L'application tentait de se connecter à MongoDB via IPv6 (`::1`) au lieu d'IPv4 (`127.0.0.1`), causant une erreur de connexion refusée.

## 🔧 Corrections Appliquées

### 1. Fichier `lib/db.ts` Modifié

**Changements:**
- ✅ Remplacé `localhost` par `127.0.0.1` (force IPv4)
- ✅ Ajouté l'option `family: 4` pour forcer IPv4
- ✅ Ajouté des messages d'erreur détaillés avec solutions
- ✅ Timeout optimisé à 5 secondes pour détection rapide des erreurs
- ✅ Messages de confirmation de connexion

### 2. Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `.env.example` | Template de configuration avec commentaires |
| `check-mongodb-connection.js` | Script de test de connexion MongoDB |
| `start-mongodb.bat` | Script automatique pour Windows |
| `MONGODB_FIX.md` | Guide complet de résolution |
| `QUICK_START.md` | Guide de démarrage rapide |
| `README_FIX.md` | Ce fichier |

## 🚀 Comment Démarrer Maintenant

### Méthode Rapide (Windows)

Double-cliquez sur `start-mongodb.bat` - il fera tout automatiquement!

### Méthode Manuelle

#### Étape 1: Configuration
```bash
# Copiez .env.example vers .env.local
copy .env.example .env.local
```

#### Étape 2: Démarrer MongoDB

**Windows:**
```powershell
# En tant qu'administrateur
net start MongoDB
```

**Alternative si pas installé comme service:**
```powershell
mkdir C:\data\db
mongod --dbpath C:\data\db
```

#### Étape 3: Tester la connexion
```bash
node check-mongodb-connection.js
```

#### Étape 4: Démarrer l'application
```bash
npm run dev
```

## 📋 Fichiers Modifiés

### `lib/db.ts`
```diff
- const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pocketguard-ai';
+ const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pocketguard-ai';

  const opts = {
    bufferCommands: false,
+   serverSelectionTimeoutMS: 5000,
+   socketTimeoutMS: 45000,
+   family: 4, // Force IPv4
  };
```

## 🌐 Alternative: MongoDB Atlas (Cloud)

Si vous ne voulez pas installer MongoDB localement:

1. **Créez un compte gratuit:** https://www.mongodb.com/cloud/atlas/register
2. **Créez un cluster M0 (gratuit)**
3. **Copiez votre connection string**
4. **Modifiez `.env.local`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pocketguard-ai
   ```

## ❓ FAQ

### Q: L'erreur persiste après les modifications?

**R:** Assurez-vous que:
1. MongoDB est bien démarré (`net start MongoDB`)
2. Le port 27017 est libre (`netstat -ano | findstr :27017`)
3. Le fichier `.env.local` existe avec le bon `MONGODB_URI`

### Q: "MongoDB n'est pas reconnu comme commande"?

**R:** MongoDB n'est pas installé. Options:
1. Installer MongoDB Community Edition
2. Utiliser MongoDB Atlas (cloud gratuit)

### Q: Port 27017 déjà utilisé?

**R:**
```powershell
# Trouver le processus
netstat -ano | findstr :27017
# Arrêter le processus (remplacez <PID>)
taskkill /PID <PID> /F
```

## 📚 Documentation

- **Guide complet:** [MONGODB_FIX.md](./MONGODB_FIX.md)
- **Démarrage rapide:** [QUICK_START.md](./QUICK_START.md)
- **Configuration:** [.env.example](./.env.example)

## ✅ Checklist

- [x] Code modifié pour forcer IPv4
- [x] Messages d'erreur améliorés
- [x] Scripts de test créés
- [x] Documentation complète
- [ ] Fichier `.env.local` créé par l'utilisateur
- [ ] MongoDB démarré
- [ ] Test de connexion réussi
- [ ] Application fonctionnelle

## 🎯 Prochaines Étapes

1. **Créez `.env.local`** (copiez depuis `.env.example`)
2. **Démarrez MongoDB** (via `start-mongodb.bat` ou manuellement)
3. **Testez** avec `node check-mongodb-connection.js`
4. **Lancez l'app** avec `npm run dev`

---

**Besoin d'aide?** Consultez [MONGODB_FIX.md](./MONGODB_FIX.md) pour un guide détaillé étape par étape.
