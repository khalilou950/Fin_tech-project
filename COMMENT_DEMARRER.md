# 🚀 Comment Démarrer Votre Application

## ✅ Backend Fonctionne!

Votre backend est opérationnel sur `http://localhost:5000` ✅

Maintenant, démarrons le frontend!

---

## 📋 Étapes Simples

### 1. Ouvrir un NOUVEAU Terminal

**⚠️ IMPORTANT:** Laissez le terminal du backend ouvert!

**Ouvrez un TERMINAL 2** (nouveau):
- Dans VS Code: `Ctrl + Shift + `` (backtick)
- Ou: Terminal → New Terminal
- Ou ouvrez un nouveau PowerShell

### 2. Aller dans le Dossier App

```powershell
cd C:\Users\bennabi\Downloads\Finovia\app
```

**⚠️ ATTENTION:** C'est `app` (pas `app/backend`)!

### 3. Installer les Dépendances (si pas déjà fait)

```powershell
npm install
```

### 4. Démarrer le Frontend

```powershell
npm run dev
```

**Résultat attendu:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

---

## 🌐 Ouvrir dans le Navigateur

**Ouvrez votre navigateur et allez sur:**

```
http://localhost:3000
```

🎉 **Vous devriez voir votre application PocketGuard AI!**

---

## 📊 Structure des Terminaux

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 (Backend) - DÉJÀ OUVERT    │
│  ───────────────────────────────────   │
│  cd app/backend                         │
│  npm run dev                            │
│                                         │
│  🚀 Server running on port 5000       │
│  ⚠️ NE FERMEZ PAS!                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TERMINAL 2 (Frontend) - NOUVEAU        │
│  ───────────────────────────────────   │
│  cd app                                 │
│  npm install                            │
│  npm run dev                            │
│                                         │
│  ▲ Next.js                             │
│  - Local: http://localhost:3000        │
│  ⚠️ NE FERMEZ PAS!                     │
└─────────────────────────────────────────┘
```

---

## 🔗 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://localhost:3000` | Votre application Next.js |
| **Backend API** | `http://localhost:5000` | API REST |
| **Health Check** | `http://localhost:5000/health` | Vérifier que l'API fonctionne |

---

## 🔐 Se Connecter

Une fois le frontend démarré, vous pouvez vous connecter avec:

- **Email:** `demo@example.com`
- **Password:** `Demo123!`

(Ces identifiants ont été créés par `npm run seed` dans le backend)

---

## ⚙️ Configuration API

J'ai créé le fichier `lib/api.ts` qui connecte le frontend au backend.

**Pour que ça fonctionne complètement**, vous devrez mettre à jour `lib/auth-context.tsx` pour utiliser l'API réelle au lieu de localStorage.

**Mais pour l'instant, vous pouvez déjà voir le frontend!**

---

## 🆘 Problèmes Courants

### Erreur: "Cannot find module"
**Solution:** 
```powershell
npm install
```

### Erreur: "Port 3000 already in use"
**Solution:** 
- Changez le port: `npm run dev -- -p 3001`
- Ou arrêtez le processus utilisant le port 3000

### Le frontend ne se connecte pas au backend
**Solution:**
1. Vérifiez que le backend est démarré: `http://localhost:5000/health`
2. Vérifiez la console du navigateur (F12) pour les erreurs
3. Vérifiez que `lib/api.ts` existe

---

## ✅ Checklist

- [x] Backend démarré sur port 5000 ✅
- [ ] Frontend démarré sur port 3000
- [ ] Application accessible sur `http://localhost:3000`
- [ ] Fichier `lib/api.ts` créé ✅

---

## 🎯 Commandes Rapides

```powershell
# Dans TERMINAL 2
cd C:\Users\bennabi\Downloads\Finovia\app
npm install
npm run dev
```

**Puis ouvrez:** `http://localhost:3000`

---

**C'est tout! Démarrez le frontend maintenant!** 🚀

