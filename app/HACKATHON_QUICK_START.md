# 🚀 DÉMARRAGE RAPIDE - HACKATHON

## ⚡ SOLUTION IMMÉDIATE (30 secondes)

### Option 1 : Script Automatique (RECOMMANDÉ)

**Double-cliquez sur :**
```
START_HACKATHON.bat
```

**C'est tout ! Le serveur démarrera automatiquement sur le port 3001.**

**Puis ouvrez :** `http://localhost:3001`

---

### Option 2 : Manuel (Si le script ne marche pas)

**Dans un terminal PowerShell :**

```powershell
# 1. Aller dans le dossier
cd C:\Users\bennabi\Downloads\Finovia

# 2. Arrêter les processus Node.js
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Nettoyer le cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 4. Démarrer sur le port 3001
npm run dev -- -p 3001
```

**Puis ouvrez :** `http://localhost:3001`

---

## ✅ Vérification

**Vous devriez voir :**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
✓ Ready in X.Xs
```

**Puis ouvrez :** `http://localhost:3001`

---

## 🆘 Si Ça Ne Marche Toujours Pas

**Essayez le port 3002 :**
```powershell
npm run dev -- -p 3002
```

**Puis ouvrez :** `http://localhost:3002`

---

## 📝 Note

**Le serveur est sur le port 3001 (pas 3000) pour éviter les conflits.**

**URL à utiliser :** `http://localhost:3001`

---

**🚀 Bon hackathon !**

