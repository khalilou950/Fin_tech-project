# 🌐 Tester l'API dans le Navigateur

## 🚀 URLs pour Tester l'API

### 1. Health Check (Test de Base)

**URL:**
```
http://localhost:5000/health
```

**Ce que vous verrez:**
```json
{
  "success": true,
  "message": "PocketGuard AI API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

✅ **C'est le premier test à faire!** Si ça fonctionne, votre serveur est bien démarré.

---

## 📋 Endpoints Disponibles

### 🔓 Endpoints Publics (Pas besoin d'authentification)

#### Health Check
```
http://localhost:5000/health
```

---

### 🔐 Endpoints Privés (Besoin d'authentification)

**⚠️ IMPORTANT:** Pour tester ces endpoints dans le navigateur, vous devez d'abord vous connecter et obtenir un token.

#### 1. Inscription (Signup)
```
POST http://localhost:5000/api/auth/signup
```

**Dans le navigateur:** Vous ne pouvez pas tester POST directement. Utilisez Postman, Thunder Client, ou curl.

#### 2. Connexion (Signin)
```
POST http://localhost:5000/api/auth/signin
```

**Dans le navigateur:** Même chose, nécessite un outil comme Postman.

---

## 🛠️ Comment Tester dans le Navigateur

### Option 1: Health Check (Simple)

1. **Assurez-vous que le serveur est démarré:**
   ```powershell
   npm run dev
   ```

2. **Ouvrez votre navigateur** et allez sur:
   ```
   http://localhost:5000/health
   ```

3. **Vous devriez voir:**
   ```json
   {
     "success": true,
     "message": "PocketGuard AI API is running",
     "timestamp": "..."
   }
   ```

---

### Option 2: Tester avec Postman (Recommandé)

**Postman** est un outil gratuit pour tester les APIs.

1. **Téléchargez Postman:**
   - https://www.postman.com/downloads/

2. **Créez une nouvelle requête:**
   - Méthode: `GET`
   - URL: `http://localhost:5000/health`
   - Cliquez "Send"

3. **Pour les endpoints authentifiés:**
   - Méthode: `POST`
   - URL: `http://localhost:5000/api/auth/signin`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "demo@example.com",
       "password": "Demo123!"
     }
     ```
   - Cliquez "Send"
   - Copiez le `accessToken` de la réponse
   - Pour les autres endpoints, ajoutez dans Headers:
     ```
     Authorization: Bearer VOTRE_TOKEN_ICI
     ```

---

### Option 3: Tester avec Thunder Client (VS Code)

**Thunder Client** est une extension VS Code gratuite.

1. **Installez l'extension:**
   - Dans VS Code: Extensions → Recherchez "Thunder Client" → Installez

2. **Créez une nouvelle requête:**
   - Cliquez sur l'icône Thunder Client dans la barre latérale
   - Cliquez "New Request"
   - Méthode: `GET`
   - URL: `http://localhost:5000/health`
   - Cliquez "Send"

3. **Pour les endpoints authentifiés:**
   - Méthode: `POST`
   - URL: `http://localhost:5000/api/auth/signin`
   - Body (JSON):
     ```json
     {
       "email": "demo@example.com",
       "password": "Demo123!"
     }
     ```
   - Cliquez "Send"
   - Copiez le token et utilisez-le pour les autres requêtes

---

### Option 4: Tester avec curl (Ligne de commande)

**Dans PowerShell:**

```powershell
# Health Check
curl http://localhost:5000/health

# Connexion
curl -X POST http://localhost:5000/api/auth/signin `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"demo@example.com\",\"password\":\"Demo123!\"}'

# Récupérer les transactions (remplacez YOUR_TOKEN)
curl http://localhost:5000/api/transactions `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Liste Complète des URLs

### Base URL
```
http://localhost:5000
```

### Endpoints

#### Authentication
- `GET /health` - Health check
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/signin` - Connexion
- `GET /api/auth/me` - Profil utilisateur (authentifié)
- `PUT /api/auth/update-email` - Mettre à jour l'email (authentifié)
- `PUT /api/auth/update-password` - Mettre à jour le mot de passe (authentifié)
- `POST /api/auth/logout` - Déconnexion (authentifié)

#### Settings
- `PUT /api/settings/currency` - Mettre à jour la devise (authentifié)
- `PUT /api/settings/theme` - Mettre à jour le thème (authentifié)
- `PUT /api/settings/profile` - Mettre à jour le profil (authentifié)

#### Transactions
- `GET /api/transactions` - Récupérer toutes les transactions (authentifié)
- `POST /api/transactions` - Créer une transaction (authentifié)
- `PUT /api/transactions/:id` - Mettre à jour une transaction (authentifié)
- `DELETE /api/transactions/:id` - Supprimer une transaction (authentifié)
- `POST /api/transactions/upload-csv` - Upload CSV (authentifié)

#### Budgets
- `GET /api/budgets` - Récupérer tous les budgets (authentifié)
- `POST /api/budgets` - Créer un budget (authentifié)
- `PUT /api/budgets/:id` - Mettre à jour un budget (authentifié)
- `DELETE /api/budgets/:id` - Supprimer un budget (authentifié)

#### Analytics
- `GET /api/analytics/summary` - Statistiques (authentifié)
- `GET /api/analytics/alerts` - Alertes (authentifié)
- `GET /api/analytics/forecast` - Prévisions (authentifié)

---

## 🎯 Test Rapide dans le Navigateur

### Étape 1: Vérifier que le serveur fonctionne

1. **Démarrez le serveur** (dans TERMINAL 1):
   ```powershell
   npm run dev
   ```

2. **Ouvrez votre navigateur** et allez sur:
   ```
   http://localhost:5000/health
   ```

3. **Vous devriez voir** un JSON avec `"success": true`

✅ **Si ça fonctionne, votre API est accessible!**

---

### Étape 2: Tester un Endpoint Authentifié

**Dans le navigateur seul, vous ne pouvez pas tester les endpoints POST/PUT/DELETE facilement.**

**Utilisez plutôt:**
- ✅ **Postman** (recommandé)
- ✅ **Thunder Client** (dans VS Code)
- ✅ **curl** (ligne de commande)
- ✅ **Le script de test:** `npm test`

---

## 🔧 Configuration du Frontend

Pour que votre frontend Next.js se connecte à l'API:

### 1. Créez un fichier de configuration API

Dans votre projet Next.js, créez `lib/api.js`:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  // Health check
  health: () => fetch(`${API_URL}/health`).then(r => r.json()),
  
  // Authentication
  signin: (email, password) => 
    fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),
  
  // Transactions
  getTransactions: (token) =>
    fetch(`${API_URL}/api/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json()),
  
  // ... autres endpoints
};
```

### 2. Utilisez dans vos composants

```javascript
import { api } from '@/lib/api';

// Dans un composant
const response = await api.signin('demo@example.com', 'Demo123!');
if (response.success) {
  const token = response.data.accessToken;
  // Stocker le token et l'utiliser pour les autres requêtes
}
```

---

## 🆘 Problèmes Courants

### Erreur: "This site can't be reached"

**Solution:**
- Vérifiez que le serveur est démarré (`npm run dev`)
- Vérifiez que le port est 5000
- Essayez `http://127.0.0.1:5000/health` au lieu de `localhost`

### Erreur: "CORS policy"

**Solution:**
- Le CORS est déjà configuré dans le backend
- Vérifiez que `FRONTEND_URL` dans `.env` est correct
- Si vous testez depuis un autre port, mettez à jour `.env`

### Erreur: "Not authorized"

**Solution:**
- Vous devez d'abord vous connecter pour obtenir un token
- Utilisez `/api/auth/signin` avec les identifiants de test

---

## 📚 Ressources

- **Postman:** https://www.postman.com/
- **Thunder Client:** Extension VS Code
- **Documentation API:** Voir `README.md`

---

## ✅ Checklist

- [ ] Serveur démarré (`npm run dev`)
- [ ] Health check fonctionne (`http://localhost:5000/health`)
- [ ] Postman ou Thunder Client installé
- [ ] Base de données remplie (`npm run seed`)
- [ ] Prêt à tester les endpoints authentifiés

---

**Commencez par tester:** `http://localhost:5000/health` dans votre navigateur! 🚀

