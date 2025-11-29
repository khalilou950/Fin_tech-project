# 🔍 Diagnostic des Erreurs - Guide Complet

## 📋 Erreurs Courantes et Solutions

### ❌ Erreur: "fetch failed" ou "ECONNREFUSED"

**Cause:** Le serveur backend n'est pas démarré ou n'est pas accessible.

**Solution:**
1. Vérifiez que le serveur est démarré dans TERMINAL 1:
   ```powershell
   npm run dev
   ```
2. Vous devriez voir:
   ```
   MongoDB Connected: 127.0.0.1
   🚀 Server running on port 5000
   ```
3. Si le serveur n'est pas démarré, démarrez-le et relancez les tests dans TERMINAL 2.

---

### ❌ Erreur: "Invalid email or password"

**Cause:** L'utilisateur de test n'existe pas dans la base de données.

**Solution:**
```powershell
npm run seed
```

**Résultat attendu:**
```
✅ Default user created: demo@example.com
🎉 Seeding completed successfully!
```

---

### ❌ Erreur: "Not authorized, no token provided"

**Cause:** Le test de connexion a échoué, donc aucun token n'est disponible.

**Solution:**
1. Vérifiez que `npm run seed` a été exécuté
2. Vérifiez que le serveur est démarré
3. Relancez les tests: `npm test`

---

### ❌ Erreur: "MongoServerError: connect ECONNREFUSED"

**Cause:** MongoDB n'est pas en cours d'exécution.

**Solution:**
```powershell
# Vérifier le service MongoDB
Get-Service MongoDB

# Démarrer MongoDB si nécessaire
net start MongoDB
```

---

### ❌ Erreur: "Port 5000 already in use"

**Cause:** Un autre processus utilise le port 5000.

**Solution 1:** Arrêter le processus
```powershell
# Trouver le processus
netstat -ano | findstr :5000

# Arrêter le processus (remplacez PID par le numéro trouvé)
taskkill /PID <PID> /F
```

**Solution 2:** Changer le port
1. Modifiez `.env`:
   ```env
   PORT=5001
   ```
2. Redémarrez le serveur
3. Mettez à jour `test-api.js`:
   ```javascript
   const BASE_URL = 'http://localhost:5001';
   ```

---

### ❌ Erreur: "Cannot find module"

**Cause:** Les dépendances ne sont pas installées.

**Solution:**
```powershell
npm install
```

---

### ❌ Erreur: "JWT_SECRET is not defined"

**Cause:** Le fichier `.env` n'existe pas ou est mal configuré.

**Solution:**
1. Vérifiez que `.env` existe dans `app/backend/`
2. Vérifiez qu'il contient:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   ```

---

## 🔍 Vérifications Système

### 1. Vérifier que MongoDB fonctionne

```powershell
# Vérifier le service
Get-Service MongoDB

# Vérifier le port
netstat -an | findstr :27017
```

**Résultat attendu:** Service "Running" et port en "LISTENING"

---

### 2. Vérifier que le serveur backend fonctionne

```powershell
# Test de connexion
curl http://localhost:5000/health
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "PocketGuard AI API is running"
}
```

---

### 3. Vérifier que l'utilisateur de test existe

```powershell
# Test de connexion
curl -X POST http://localhost:5000/api/auth/signin `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"demo@example.com\",\"password\":\"Demo123!\"}'
```

**Résultat attendu:** JSON avec `"success": true` et un `accessToken`

---

## 📊 Checklist de Diagnostic

Avant de lancer les tests, vérifiez:

- [ ] MongoDB est en cours d'exécution (`Get-Service MongoDB`)
- [ ] Le serveur backend est démarré (`npm run dev` dans TERMINAL 1)
- [ ] Le serveur répond sur `http://localhost:5000/health`
- [ ] La base de données est remplie (`npm run seed` exécuté)
- [ ] Le fichier `.env` existe et est configuré
- [ ] Les dépendances sont installées (`node_modules` existe)
- [ ] Les tests sont lancés dans un terminal séparé (`npm test` dans TERMINAL 2)

---

## 🛠️ Commandes de Diagnostic Rapides

```powershell
# 1. Vérifier MongoDB
Get-Service MongoDB
netstat -an | findstr :27017

# 2. Vérifier le serveur backend
curl http://localhost:5000/health
netstat -ano | findstr :5000

# 3. Vérifier la base de données
npm run seed

# 4. Tester la connexion
curl -X POST http://localhost:5000/api/auth/signin `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"demo@example.com\",\"password\":\"Demo123!\"}'
```

---

## 🆘 Si Rien Ne Fonctionne

### Réinitialisation Complète

1. **Arrêter tous les processus:**
   ```powershell
   # Arrêter le serveur (Ctrl+C dans TERMINAL 1)
   # Arrêter MongoDB (si nécessaire)
   net stop MongoDB
   ```

2. **Redémarrer MongoDB:**
   ```powershell
   net start MongoDB
   ```

3. **Vider la base de données:**
   ```powershell
   npm run seed
   ```

4. **Redémarrer le serveur:**
   ```powershell
   npm run dev
   ```

5. **Relancer les tests:**
   ```powershell
   npm test
   ```

---

## 📝 Logs Utiles

### Vérifier les logs du serveur

Dans TERMINAL 1 (où `npm run dev` est lancé), vous devriez voir:
```
MongoDB Connected: 127.0.0.1
🚀 Server running on port 5000 in development mode
```

Si vous voyez des erreurs, notez-les et consultez cette section.

---

## 💡 Astuce

**Utilisez MongoDB Compass** pour visualiser votre base de données:
- Connectez-vous avec: `mongodb://localhost:27017`
- Vous verrez la base `pocketguard-ai` et toutes les collections
- Vous pouvez vérifier que l'utilisateur `demo@example.com` existe

---

## 📞 Besoin d'Aide?

Si les erreurs persistent après avoir suivi ce guide:
1. Notez le message d'erreur exact
2. Vérifiez les logs du serveur (TERMINAL 1)
3. Vérifiez les logs des tests (TERMINAL 2)
4. Consultez les fichiers de documentation:
   - `RESOLUTION_ERREURS.md`
   - `TESTS_REUSSIS.md`
   - `GUIDE_TERMINAL.md`

