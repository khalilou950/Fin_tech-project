# 🖥️ Guide: Dans Quel Terminal Exécuter les Commandes

## 📍 Où exécuter les commandes?

**TOUTES les commandes doivent être exécutées dans le dossier `backend`:**

```
C:\Users\bennabi\Downloads\Finovia\app\backend
```

---

## 🎯 Types de Terminaux

Vous pouvez utiliser **n'importe quel terminal**:
- ✅ PowerShell (recommandé sur Windows)
- ✅ CMD (Invite de commandes)
- ✅ Terminal intégré de VS Code
- ✅ Git Bash

---

## 📝 Étapes Détaillées

### Étape 1: Ouvrir un Terminal

**Option A: PowerShell**
- Appuyez sur `Windows + X`
- Choisissez "Windows PowerShell" ou "Terminal"
- Ou recherchez "PowerShell" dans le menu Démarrer

**Option B: VS Code**
- Ouvrez VS Code
- Appuyez sur `` Ctrl + ` `` (backtick) pour ouvrir le terminal intégré
- Ou allez dans: Terminal → New Terminal

**Option C: CMD**
- Appuyez sur `Windows + R`
- Tapez `cmd` et appuyez sur Entrée

---

### Étape 2: Naviguer vers le dossier backend

Dans le terminal, tapez:

```powershell
cd C:\Users\bennabi\Downloads\Finovia\app\backend
```

Ou si vous êtes déjà dans le dossier `app`:

```powershell
cd backend
```

**Vérifiez que vous êtes au bon endroit:**
```powershell
pwd
# ou
Get-Location
```

Vous devriez voir:
```
C:\Users\bennabi\Downloads\Finovia\app\backend
```

---

### Étape 3: Remplir la base de données (PREMIÈRE FOIS SEULEMENT)

**Dans le même terminal**, exécutez:

```powershell
npm run seed
```

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
```

**⏱️ Temps:** ~5-10 secondes

---

### Étape 4: Démarrer le serveur (TERMINAL 1)

**IMPORTANT:** Laissez ce terminal ouvert! Le serveur doit rester en cours d'exécution.

Dans le **même terminal** (ou ouvrez un nouveau terminal), exécutez:

```powershell
npm run dev
```

**Résultat attendu:**
```
MongoDB Connected: localhost:27017
🚀 Server running on port 5000 in development mode
```

**⚠️ NE FERMEZ PAS CE TERMINAL!** Le serveur doit rester actif.

---

### Étape 5: Tester l'API (TERMINAL 2 - NOUVEAU)

**Ouvrez un NOUVEAU terminal** (laissez le premier ouvert avec `npm run dev`):

**Option A: Nouveau terminal dans VS Code**
- Dans VS Code: Terminal → New Terminal
- Ou: `` Ctrl + Shift + ` ``

**Option B: Nouveau PowerShell**
- Ouvrez un nouveau PowerShell
- Naviguez vers le dossier:
  ```powershell
  cd C:\Users\bennabi\Downloads\Finovia\app\backend
  ```

**Dans ce NOUVEAU terminal**, exécutez:

```powershell
npm test
```

**Résultat attendu:**
```
🧪 Tests de l'API PocketGuard AI
==================================================
✅ Health Check: Serveur en cours d'exécution
✅ Connexion: Connecté en tant que: Khalil Fares BENNABI
✅ Transactions récupérées: 10
...
🎉 Tous les tests sont passés avec succès!
```

---

## 📊 Résumé Visuel

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 (Serveur Backend)          │
│  ───────────────────────────────────   │
│  cd backend                             │
│  npm run seed    ← (une seule fois)     │
│  npm run dev     ← (laissez ouvert!)    │
│                                         │
│  MongoDB Connected: localhost:27017     │
│  🚀 Server running on port 5000        │
│                                         │
│  ⚠️ NE FERMEZ PAS CE TERMINAL!         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TERMINAL 2 (Tests)                     │
│  ───────────────────────────────────   │
│  cd backend                             │
│  npm test                               │
│                                         │
│  ✅ Tous les tests passés!             │
└─────────────────────────────────────────┘
```

---

## 🎯 Commandes Rapides (Copier-Coller)

### Terminal 1 (Serveur):
```powershell
cd C:\Users\bennabi\Downloads\Finovia\app\backend
npm run seed
npm run dev
```

### Terminal 2 (Tests):
```powershell
cd C:\Users\bennabi\Downloads\Finovia\app\backend
npm test
```

---

## ✅ Checklist

- [ ] Terminal 1 ouvert
- [ ] Navigué vers `app/backend`
- [ ] Exécuté `npm run seed` (une fois)
- [ ] Exécuté `npm run dev` (serveur en cours d'exécution)
- [ ] Terminal 2 ouvert (nouveau)
- [ ] Navigué vers `app/backend` dans Terminal 2
- [ ] Exécuté `npm test`

---

## 🆘 Problèmes Courants

### "npm n'est pas reconnu"
- Installez Node.js: https://nodejs.org/
- Redémarrez le terminal après l'installation

### "Cannot find module"
- Exécutez: `npm install` dans le dossier `backend`

### "Port 5000 already in use"
- Un autre processus utilise le port
- Changez `PORT=5001` dans `.env`
- Ou arrêtez le processus utilisant le port 5000

### "MongoDB connection failed"
- Vérifiez que MongoDB est démarré:
  ```powershell
  net start MongoDB
  ```

---

## 💡 Astuce

**Dans VS Code**, vous pouvez avoir plusieurs terminaux ouverts en même temps:
- Terminal 1: `npm run dev` (serveur)
- Terminal 2: `npm test` (tests)
- Terminal 3: Autres commandes

C'est très pratique pour le développement!

