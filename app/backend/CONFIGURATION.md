# 🔧 Configuration MongoDB avec l'Application

## ✅ État Actuel

**MongoDB est installé et fonctionne!**
- ✅ Service MongoDB: **Running** (en cours d'exécution)
- ✅ Port: **27017** (par défaut)
- ✅ Prêt à être utilisé

---

## 📝 Configuration de l'Application

### Étape 1: Vérifier le fichier .env

Le fichier `.env` a été créé dans `app/backend/.env` avec la configuration suivante:

```env
MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
```

**C'est tout ce dont vous avez besoin!** MongoDB créera automatiquement:
- ✅ La base de données `pocketguard-ai`
- ✅ Les collections (`users`, `transactions`, `budgets`)

---

### Étape 2: Installer les dépendances (si pas déjà fait)

```bash
cd app/backend
npm install
```

---

### Étape 3: Remplir la base de données avec des données de test

```bash
npm run seed
```

Cela va créer:
- ✅ Un utilisateur de test: `demo@example.com` / `Demo123!`
- ✅ Des transactions d'exemple
- ✅ Des budgets d'exemple

**Résultat attendu:**
```
🗑️  Clearing existing data...
✅ Database cleared
👤 Creating default user...
✅ Default user created: demo@example.com
💸 Creating transactions...
✅ Created 10 transactions
📊 Creating budgets...
✅ Created 5 budgets

🎉 Seeding completed successfully!

📝 Default credentials:
   Email: demo@example.com
   Password: Demo123!
```

---

### Étape 4: Démarrer le serveur backend

```bash
npm run dev
```

**Résultat attendu:**
```
MongoDB Connected: localhost:27017
🚀 Server running on port 5000 in development mode
```

---

### Étape 5: Tester l'API

Dans un **nouveau terminal**, exécutez:

```bash
cd app/backend
npm test
```

Ou testez manuellement:

```bash
# Health check
curl http://localhost:5000/health

# Connexion
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"password\":\"Demo123!\"}"
```

---

## 🎯 Résumé de la Configuration

| Élément | Valeur | Statut |
|---------|--------|--------|
| MongoDB Service | Running | ✅ |
| Port MongoDB | 27017 | ✅ |
| Base de données | `pocketguard-ai` | ✅ (créée automatiquement) |
| Backend Port | 5000 | ✅ |
| Fichier .env | Configuré | ✅ |

---

## 🔍 Vérification de la Connexion

### Test 1: Vérifier que MongoDB fonctionne

```powershell
# Vérifier le service
Get-Service MongoDB

# Vérifier le port
netstat -an | findstr :27017
```

### Test 2: Tester la connexion depuis l'application

Démarrez le serveur:
```bash
cd app/backend
npm run dev
```

Vous devriez voir:
```
MongoDB Connected: localhost:27017
🚀 Server running on port 5000 in development mode
```

Si vous voyez une erreur, consultez la section "Problèmes courants" ci-dessous.

---

## 🚀 Commandes Rapides

```bash
# Aller dans le dossier backend
cd app/backend

# Installer les dépendances (première fois)
npm install

# Remplir la base de données
npm run seed

# Démarrer le serveur
npm run dev

# Tester l'API (dans un autre terminal)
npm test
```

---

## 🆘 Problèmes Courants

### Erreur: "MongoServerError: connect ECONNREFUSED"

**Solution:**
```powershell
# Démarrer le service MongoDB
net start MongoDB

# Vérifier le statut
Get-Service MongoDB
```

### Erreur: "MongoDB URI is not defined"

**Solution:**
- Vérifiez que le fichier `.env` existe dans `app/backend/`
- Vérifiez que `MONGODB_URI` est défini dans `.env`

### Erreur: "Port 5000 already in use"

**Solution:**
- Changez le `PORT` dans `.env` (ex: `PORT=5001`)
- Ou arrêtez le processus utilisant le port 5000

### MongoDB n'est pas dans le PATH

**Solution:**
- MongoDB fonctionne même si `mongod` n'est pas dans le PATH
- Le service Windows fonctionne indépendamment du PATH
- Pour utiliser `mongod` en ligne de commande, ajoutez MongoDB au PATH:
  - Généralement: `C:\Program Files\MongoDB\Server\7.0\bin`

---

## 📚 Prochaines Étapes

1. ✅ MongoDB est configuré
2. ✅ `.env` est configuré
3. ⏭️ Remplir la base: `npm run seed`
4. ⏭️ Démarrer le serveur: `npm run dev`
5. ⏭️ Tester l'API: `npm test`
6. ⏭️ Intégrer avec le frontend Next.js

---

## 💡 Astuce

**MongoDB Compass** (GUI optionnel):
- Si vous avez installé MongoDB Compass, vous pouvez visualiser votre base de données
- Connectez-vous avec: `mongodb://localhost:27017`
- Vous verrez la base `pocketguard-ai` et toutes les collections

---

## ✅ Checklist de Configuration

- [x] MongoDB installé
- [x] Service MongoDB en cours d'exécution
- [x] Fichier `.env` créé
- [x] `MONGODB_URI` configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Base de données remplie (`npm run seed`)
- [ ] Serveur démarré (`npm run dev`)
- [ ] API testée (`npm test`)

---

**Vous êtes prêt!** 🎉

Passez à l'étape suivante: `npm run seed` pour remplir la base de données.

