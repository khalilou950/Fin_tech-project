# 🔧 Résolution des Erreurs "fetch failed"

## ❌ Problème

Tous les tests échouent avec l'erreur `fetch failed` car **le serveur n'est pas accessible**.

## ✅ Solution

Le serveur backend doit être **démarré dans un terminal séparé** avant de lancer les tests.

---

## 📋 Étapes pour Corriger

### Étape 1: Vérifier que le serveur est démarré

**Dans TERMINAL 1**, vous devriez voir:
```
MongoDB Connected: 127.0.0.1
🚀 Server running on port 5000 in development mode
```

Si ce n'est pas le cas, démarrez le serveur:
```powershell
cd C:\Users\bennabi\Downloads\Finovia\app\backend
npm run dev
```

**⚠️ IMPORTANT:** Laissez ce terminal ouvert! Le serveur doit rester actif.

---

### Étape 2: Lancer les tests dans un NOUVEAU terminal

**Ouvrez un TERMINAL 2** (nouveau, séparé du premier):

**Option A: Dans VS Code**
- Appuyez sur `` Ctrl + Shift + ` `` (backtick)
- Ou: Terminal → New Terminal

**Option B: Nouveau PowerShell**
- Ouvrez un nouveau PowerShell
- Naviguez vers le dossier:
  ```powershell
  cd C:\Users\bennabi\Downloads\Finovia\app\backend
  ```

**Dans ce TERMINAL 2**, exécutez:
```powershell
npm test
```

---

## 🎯 Structure Correcte

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 (Serveur - DOIT RESTER)    │
│  ───────────────────────────────────   │
│  npm run dev                            │
│                                         │
│  MongoDB Connected: 127.0.0.1          │
│  🚀 Server running on port 5000       │
│                                         │
│  ⚠️ NE FERMEZ PAS CE TERMINAL!         │
└─────────────────────────────────────────┘
                    ↓
            (Serveur accessible)
                    ↓
┌─────────────────────────────────────────┐
│  TERMINAL 2 (Tests)                     │
│  ───────────────────────────────────   │
│  npm test                               │
│                                         │
│  ✅ Tous les tests passent!            │
└─────────────────────────────────────────┘
```

---

## 🔍 Vérification Rapide

### Vérifier que le serveur est accessible:

```powershell
# Test de connexion
curl http://localhost:5000/health
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "PocketGuard AI API is running",
  "timestamp": "..."
}
```

### Vérifier le port 5000:

```powershell
netstat -ano | findstr :5000
```

Vous devriez voir une ligne avec `LISTENING` si le serveur est actif.

---

## 🆘 Si le Problème Persiste

### 1. Vérifier que le serveur écoute bien:

```powershell
# Dans TERMINAL 1, vous devriez voir:
# 🚀 Server running on port 5000
```

### 2. Vérifier le fichier .env:

Assurez-vous que `PORT=5000` est défini dans `app/backend/.env`

### 3. Vérifier qu'aucun autre processus n'utilise le port:

```powershell
netstat -ano | findstr :5000
```

Si un autre processus utilise le port, changez le PORT dans `.env`:
```env
PORT=5001
```

Puis redémarrez le serveur.

### 4. Redémarrer le serveur:

Dans TERMINAL 1:
- Appuyez sur `Ctrl + C` pour arrêter
- Relancez: `npm run dev`

---

## ✅ Après Correction

Une fois le serveur démarré dans TERMINAL 1, les tests dans TERMINAL 2 devraient fonctionner:

```
🧪 Tests de l'API PocketGuard AI
==================================================
✅ Serveur accessible, démarrage des tests...

✅ Health Check: Serveur en cours d'exécution
✅ Connexion: Connecté en tant que: Khalil Fares BENNABI
✅ Transactions récupérées: 10
...
🎉 Tous les tests sont passés avec succès!
```

---

## 💡 Astuce

**Dans VS Code**, vous pouvez avoir plusieurs terminaux ouverts:
- Terminal 1: `npm run dev` (serveur)
- Terminal 2: `npm test` (tests)
- Terminal 3: Autres commandes

C'est très pratique pour le développement!

---

## 📝 Résumé

**Le problème:** Les tests ne peuvent pas se connecter au serveur car il n'est pas démarré.

**La solution:** 
1. ✅ Démarrer le serveur dans TERMINAL 1: `npm run dev`
2. ✅ Lancer les tests dans TERMINAL 2: `npm test`
3. ✅ Les deux terminaux doivent être ouverts en même temps

