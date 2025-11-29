# Guide de Test - PocketGuard AI Backend

## 🇫🇷 Guide Complet pour Tester l'API

### 📋 Prérequis

1. **Node.js** (v18+) installé
2. **MongoDB** en cours d'exécution (local ou Atlas)
3. **npm** ou **yarn**

---

## 🚀 Installation Rapide

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pocketguard-ai
JWT_SECRET=mon-secret-super-securise-changez-moi
JWT_REFRESH_SECRET=mon-refresh-secret-super-securise-changez-moi
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### 3. Démarrer MongoDB

**Sur Windows:**
```bash
net start MongoDB
```

**Sur macOS:**
```bash
brew services start mongodb-community
```

**Sur Linux:**
```bash
sudo systemctl start mongod
```

**Ou utilisez MongoDB Atlas** (gratuit): https://www.mongodb.com/cloud/atlas

### 4. Remplir la base de données (optionnel)

Cela crée un utilisateur de test avec des données d'exemple:

```bash
npm run seed
```

**Utilisateur de test créé:**
- Email: `demo@example.com`
- Password: `Demo123!`

### 5. Démarrer le serveur

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:5000`

---

## 🧪 Tests avec cURL

### Test 1: Health Check

```bash
curl http://localhost:5000/health
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "PocketGuard AI API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 2: Inscription (Signup)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ahmed Benali",
    "email": "ahmed@test.com",
    "password": "Test123!"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "fullName": "Ahmed Benali",
      "email": "ahmed@test.com",
      "currency": "DZD",
      "theme": "light"
    },
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "User registered successfully"
}
```

**⚠️ IMPORTANT:** Sauvegardez le `accessToken` pour les prochains tests!

### Test 3: Connexion (Signin)

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123!"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "fullName": "Khalil Fares BENNABI",
      "email": "demo@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

### Test 4: Obtenir le profil utilisateur

Remplacez `YOUR_ACCESS_TOKEN` par le token reçu lors de la connexion:

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 5: Récupérer toutes les transactions

```bash
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 6: Créer une transaction

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "merchant": "Carrefour",
    "category": "Food",
    "amount": 5000,
    "type": "Expense",
    "currency": "DZD"
  }'
```

### Test 7: Filtrer les transactions

**Par catégorie:**
```bash
curl "http://localhost:5000/api/transactions?category=Food" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Par type:**
```bash
curl "http://localhost:5000/api/transactions?type=Expense" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Par date:**
```bash
curl "http://localhost:5000/api/transactions?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Recherche par mot-clé:**
```bash
curl "http://localhost:5000/api/transactions?search=Carrefour" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 8: Récupérer tous les budgets

```bash
curl http://localhost:5000/api/budgets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 9: Créer un budget

```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Food",
    "limit": 50000,
    "resetCycle": "monthly"
  }'
```

### Test 10: Obtenir les statistiques

```bash
curl http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 11: Obtenir les alertes

```bash
curl http://localhost:5000/api/analytics/alerts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 12: Obtenir les prévisions

```bash
curl http://localhost:5000/api/analytics/forecast \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 13: Mettre à jour la devise

```bash
curl -X PUT http://localhost:5000/api/settings/currency \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USD"
  }'
```

### Test 14: Mettre à jour le thème

```bash
curl -X PUT http://localhost:5000/api/settings/theme \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark"
  }'
```

### Test 15: Upload CSV (avec fichier)

Créez un fichier `test.csv`:

```csv
date,merchant,amount,type,category
2024-01-15,Carrefour,8500,expense,Food
2024-01-14,Uber,2500,expense,Transport
2024-01-10,Monthly Salary,150000,income,Salary
```

Ensuite, testez l'upload:

```bash
curl -X POST http://localhost:5000/api/transactions/upload-csv \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "csv=@test.csv"
```

---

## 🧪 Tests avec Postman

### Configuration Postman

1. **Installez Postman** depuis https://www.postman.com/downloads/

2. **Créez une nouvelle Collection** appelée "PocketGuard AI API"

3. **Créez une variable d'environnement:**
   - Variable: `baseUrl`
   - Valeur: `http://localhost:5000`
   - Variable: `accessToken`
   - Valeur: (vide pour l'instant)

4. **Configuration des en-têtes:**
   - Pour les requêtes authentifiées, ajoutez dans "Headers":
     - Key: `Authorization`
     - Value: `Bearer {{accessToken}}`

### Collection Postman Complète

#### 1. Health Check
- **Method:** GET
- **URL:** `{{baseUrl}}/health`

#### 2. Signup
- **Method:** POST
- **URL:** `{{baseUrl}}/api/auth/signup`
- **Body (raw JSON):**
```json
{
  "fullName": "Ahmed Benali",
  "email": "ahmed@test.com",
  "password": "Test123!"
}
```

#### 3. Signin
- **Method:** POST
- **URL:** `{{baseUrl}}/api/auth/signin`
- **Body (raw JSON):**
```json
{
  "email": "demo@example.com",
  "password": "Demo123!"
}
```
- **Tests:** Ajoutez ce script dans l'onglet "Tests" pour sauvegarder automatiquement le token:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.data.accessToken);
}
```

#### 4. Get Me
- **Method:** GET
- **URL:** `{{baseUrl}}/api/auth/me`
- **Headers:** `Authorization: Bearer {{accessToken}}`

#### 5. Get Transactions
- **Method:** GET
- **URL:** `{{baseUrl}}/api/transactions`

#### 6. Create Transaction
- **Method:** POST
- **URL:** `{{baseUrl}}/api/transactions`
- **Body (raw JSON):**
```json
{
  "date": "2024-01-15",
  "merchant": "Carrefour",
  "category": "Food",
  "amount": 5000,
  "type": "Expense",
  "currency": "DZD"
}
```

#### 7. Get Budgets
- **Method:** GET
- **URL:** `{{baseUrl}}/api/budgets`

#### 8. Create Budget
- **Method:** POST
- **URL:** `{{baseUrl}}/api/budgets`
- **Body (raw JSON):**
```json
{
  "category": "Food",
  "limit": 50000,
  "resetCycle": "monthly"
}
```

#### 9. Get Analytics Summary
- **Method:** GET
- **URL:** `{{baseUrl}}/api/analytics/summary`

---

## 🧪 Tests avec JavaScript/Fetch

Créez un fichier `test-api.js`:

```javascript
const BASE_URL = 'http://localhost:5000';
let accessToken = '';

// Test 1: Health Check
async function healthCheck() {
  const response = await fetch(`${BASE_URL}/health`);
  const data = await response.json();
  console.log('Health Check:', data);
}

// Test 2: Signin
async function signin() {
  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@example.com',
      password: 'Demo123!'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    accessToken = data.data.accessToken;
    console.log('Signin successful!', data.data.user);
  }
  return data;
}

// Test 3: Get Transactions
async function getTransactions() {
  const response = await fetch(`${BASE_URL}/api/transactions`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Transactions:', data);
  return data;
}

// Test 4: Create Transaction
async function createTransaction() {
  const response = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: new Date().toISOString(),
      merchant: 'Test Merchant',
      category: 'Food',
      amount: 5000,
      type: 'Expense',
      currency: 'DZD'
    })
  });
  
  const data = await response.json();
  console.log('Created Transaction:', data);
  return data;
}

// Test 5: Get Analytics
async function getAnalytics() {
  const response = await fetch(`${BASE_URL}/api/analytics/summary`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Analytics Summary:', data);
  return data;
}

// Exécuter tous les tests
async function runTests() {
  try {
    await healthCheck();
    await signin();
    await getTransactions();
    await createTransaction();
    await getAnalytics();
    console.log('✅ Tous les tests sont passés!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

runTests();
```

Exécutez avec Node.js:
```bash
node test-api.js
```

---

## 🧪 Tests avec Thunder Client (VS Code)

1. **Installez l'extension Thunder Client** dans VS Code

2. **Créez une nouvelle collection**

3. **Ajoutez les requêtes** similaires à Postman

4. **Configurez les variables:**
   - `baseUrl`: `http://localhost:5000`
   - `accessToken`: (vide pour l'instant)

---

## ✅ Checklist de Test

- [ ] Health check fonctionne
- [ ] Inscription (signup) fonctionne
- [ ] Connexion (signin) fonctionne
- [ ] Récupération du profil utilisateur
- [ ] Création de transaction
- [ ] Récupération des transactions
- [ ] Filtrage des transactions (catégorie, type, date)
- [ ] Mise à jour de transaction
- [ ] Suppression de transaction
- [ ] Upload CSV fonctionne
- [ ] Création de budget
- [ ] Récupération des budgets
- [ ] Mise à jour de budget
- [ ] Suppression de budget
- [ ] Analytics summary fonctionne
- [ ] Analytics alerts fonctionne
- [ ] Analytics forecast fonctionne
- [ ] Mise à jour de devise
- [ ] Mise à jour de thème
- [ ] Mise à jour du profil

---

## 🐛 Dépannage

### Erreur: "MongoServerError: connect ECONNREFUSED"
- **Solution:** Vérifiez que MongoDB est en cours d'exécution

### Erreur: "JWT_SECRET is not defined"
- **Solution:** Vérifiez que le fichier `.env` existe et contient `JWT_SECRET`

### Erreur: "Unauthorized"
- **Solution:** Vérifiez que le token JWT est valide et inclus dans l'en-tête Authorization

### Erreur: "Port 5000 already in use"
- **Solution:** Changez le `PORT` dans `.env` ou arrêtez le processus utilisant le port 5000

---

## 📚 Ressources Utiles

- **Documentation API complète:** Voir `README.md`
- **Guide de démarrage rapide:** Voir `QUICKSTART.md`
- **MongoDB Compass:** https://www.mongodb.com/products/compass (GUI pour visualiser la base de données)

---

## 🎯 Prochaines Étapes

Après avoir testé l'API:

1. Intégrez avec le frontend Next.js
2. Testez tous les cas d'utilisation
3. Configurez les tests automatisés (Jest, Mocha)
4. Déployez en production

