# 🚀 Comment Démarrer le Site

## ⚠️ Site Inaccessible - Solution

### Étape 1 : Ouvrir un Terminal

Ouvrez PowerShell ou un terminal dans VS Code.

### Étape 2 : Aller dans le Dossier App

```powershell
cd C:\Users\bennabi\Downloads\Finovia\app
```

### Étape 3 : Démarrer le Serveur

```powershell
npm run dev
```

### Étape 4 : Attendre le Message "Ready"

Vous devriez voir :
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in X.Xs
```

### Étape 5 : Ouvrir dans le Navigateur

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000
```

---

## 🆘 Si Ça Ne Marche Pas

### Erreur : "Cannot find module"
**Solution :**
```powershell
cd C:\Users\bennabi\Downloads\Finovia\app
npm install
npm run dev
```

### Erreur : "Port 3000 already in use"
**Solution 1 : Tuer le processus**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2 : Utiliser un autre port**
```powershell
npm run dev -- -p 3001
```
Puis ouvrez : `http://localhost:3001`

### Erreur : "Build Error"
1. Vérifiez les erreurs dans le terminal
2. Partagez-les avec moi pour que je puisse les corriger

### Le serveur démarre mais la page est blanche
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Partagez-les avec moi

---

## 📝 Checklist

- [ ] Terminal ouvert
- [ ] Dans le dossier `app/` : `cd C:\Users\bennabi\Downloads\Finovia\app`
- [ ] Serveur démarré : `npm run dev`
- [ ] Message "Ready" affiché
- [ ] Navigateur ouvert sur `http://localhost:3000`

---

## 🎯 Commandes Rapides

```powershell
# 1. Aller dans app
cd C:\Users\bennabi\Downloads\Finovia\app

# 2. Installer (si nécessaire)
npm install

# 3. Démarrer
npm run dev

# 4. Ouvrir http://localhost:3000
```

---

**Si le problème persiste, partagez les erreurs affichées dans le terminal !** 🔍

