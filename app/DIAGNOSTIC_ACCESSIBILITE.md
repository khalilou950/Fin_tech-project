# 🔍 Diagnostic - Site Inaccessible

## ✅ Vérifications à Faire

### 1. Le serveur Next.js est-il démarré ?

**Dans un terminal, exécutez :**
```powershell
cd C:\Users\bennabi\Downloads\Finovia
cd app
npm run dev
```

**Vous devriez voir :**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in X.Xs
```

### 2. Vérifiez l'URL dans le navigateur

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000
```

### 3. Vérifiez les erreurs dans le terminal

Si le serveur ne démarre pas ou affiche des erreurs, vérifiez :
- Erreurs de compilation TypeScript
- Erreurs de modules manquants
- Erreurs de port déjà utilisé

### 4. Port déjà utilisé ?

Si le port 3000 est occupé, changez-le :
```powershell
npm run dev -- -p 3001
```

Puis ouvrez : `http://localhost:3001`

### 5. Vérifiez les dépendances

Assurez-vous que toutes les dépendances sont installées :
```powershell
cd app
npm install
```

### 6. Vérifiez MongoDB (pour le backend)

Si vous utilisez le backend, assurez-vous que MongoDB est démarré :
```powershell
# Vérifier le service MongoDB
Get-Service MongoDB
```

### 7. Vérifiez les variables d'environnement

Créez un fichier `.env.local` dans le dossier `app/` :
```env
MONGODB_URI=mongodb://127.0.0.1:27017/pocketguard-ai
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

## 🆘 Solutions Courantes

### Erreur : "Port 3000 already in use"
**Solution :**
```powershell
# Tuer le processus sur le port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou utiliser un autre port
npm run dev -- -p 3001
```

### Erreur : "Cannot find module"
**Solution :**
```powershell
cd app
npm install
```

### Erreur : "Build Error"
**Solution :**
1. Vérifiez les erreurs dans le terminal
2. Vérifiez que tous les fichiers sont au bon endroit
3. Redémarrez le serveur

### Le serveur démarre mais la page est blanche
**Solution :**
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Vérifiez que tous les composants sont importés correctement

## 📝 Checklist

- [ ] Serveur Next.js démarré (`npm run dev`)
- [ ] Pas d'erreurs dans le terminal
- [ ] URL correcte : `http://localhost:3000`
- [ ] Dépendances installées (`npm install`)
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] MongoDB démarré (si backend utilisé)
- [ ] Port 3000 disponible

## 🚀 Démarrage Rapide

```powershell
# 1. Aller dans le dossier app
cd C:\Users\bennabi\Downloads\Finovia\app

# 2. Installer les dépendances (si pas déjà fait)
npm install

# 3. Démarrer le serveur
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:3000
```

---

**Si le problème persiste, partagez les erreurs affichées dans le terminal où vous avez lancé `npm run dev`.**

