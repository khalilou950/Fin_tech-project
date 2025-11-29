# 🚀 Démarrer le Frontend Next.js

## ✅ Backend Fonctionne!

Votre backend est opérationnel sur `http://localhost:5000` ✅

Maintenant, démarrons le frontend Next.js!

---

## 📋 Étapes pour Démarrer le Frontend

### Étape 1: Vérifier que vous êtes dans le bon dossier

Le frontend Next.js est dans le dossier `app` (pas `app/backend`).

**Structure:**
```
Finovia/
├── app/              ← Frontend Next.js (ICI)
│   ├── page.tsx
│   ├── signin/
│   └── ...
└── app/backend/      ← Backend (déjà démarré)
    └── src/
```

### Étape 2: Ouvrir un NOUVEAU terminal pour le frontend

**⚠️ IMPORTANT:** Laissez le terminal du backend ouvert!

**Ouvrez un TERMINAL 2** (nouveau):
- Dans VS Code: Terminal → New Terminal
- Ou ouvrez un nouveau PowerShell

### Étape 3: Naviguer vers le dossier app

```powershell
cd C:\Users\bennabi\Downloads\Finovia\app
```

**⚠️ ATTENTION:** C'est `app` (pas `app/backend`)!

### Étape 4: Installer les dépendances (si pas déjà fait)

```powershell
npm install
```

### Étape 5: Démarrer le serveur Next.js

```powershell
npm run dev
```

**Résultat attendu:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

---

## 🌐 Accéder au Frontend

**Ouvrez votre navigateur et allez sur:**

```
http://localhost:3000
```

Vous devriez voir votre application PocketGuard AI! 🎉

---

## 🔗 URLs Importantes

| Service | URL | Port |
|---------|-----|------|
| **Frontend Next.js** | `http://localhost:3000` | 3000 |
| **Backend API** | `http://localhost:5000` | 5000 |
| **Health Check** | `http://localhost:5000/health` | 5000 |

---

## ⚙️ Configuration: Connecter Frontend ↔ Backend

Le frontend doit être configuré pour se connecter au backend. Créons le fichier de configuration API.

### Créer le fichier de configuration API

Créez `lib/api.ts` dans le dossier `app`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  // Health check
  health: async () => {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  },

  // Authentication
  signup: async (fullName: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });
    return response.json();
  },

  signin: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getMe: async (token: string) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Transactions
  getTransactions: async (token: string, filters?: any) => {
    const queryParams = new URLSearchParams(filters || {}).toString();
    const response = await fetch(`${API_URL}/api/transactions?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  createTransaction: async (token: string, transaction: any) => {
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    return response.json();
  },

  // Budgets
  getBudgets: async (token: string) => {
    const response = await fetch(`${API_URL}/api/budgets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  createBudget: async (token: string, budget: any) => {
    const response = await fetch(`${API_URL}/api/budgets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budget),
    });
    return response.json();
  },

  // Analytics
  getAnalyticsSummary: async (token: string) => {
    const response = await fetch(`${API_URL}/api/analytics/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};
```

---

## 🔄 Mettre à Jour auth-context.tsx

Modifiez `lib/auth-context.tsx` pour utiliser l'API réelle au lieu de localStorage:

```typescript
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { api } from "./api"

export interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (name: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem("accessToken")
    if (token) {
      api.getMe(token).then((response) => {
        if (response.success) {
          setUser({
            id: response.data.user._id,
            name: response.data.user.fullName,
            email: response.data.user.email,
          })
        }
      }).catch(() => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      }).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const signUp = async (name: string, email: string, password: string) => {
    const response = await api.signup(name, email, password)
    if (response.success) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      setUser({
        id: response.data.user._id,
        name: response.data.user.fullName,
        email: response.data.user.email,
      })
    } else {
      throw new Error(response.message || "Sign up failed")
    }
  }

  const signIn = async (email: string, password: string) => {
    const response = await api.signin(email, password)
    if (response.success) {
      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      setUser({
        id: response.data.user._id,
        name: response.data.user.fullName,
        email: response.data.user.email,
      })
    } else {
      throw new Error(response.message || "Invalid email or password")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  return <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
```

---

## 📊 Structure des Terminaux

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 (Backend)                   │
│  ───────────────────────────────────   │
│  cd app/backend                         │
│  npm run dev                            │
│                                         │
│  🚀 Server running on port 5000       │
│  ⚠️ NE FERMEZ PAS CE TERMINAL!         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TERMINAL 2 (Frontend)                  │
│  ───────────────────────────────────   │
│  cd app                                 │
│  npm install                            │
│  npm run dev                            │
│                                         │
│  ▲ Next.js                             │
│  - Local: http://localhost:3000        │
│  ⚠️ NE FERMEZ PAS CE TERMINAL!         │
└─────────────────────────────────────────┘
```

---

## 🎯 Test Rapide

### 1. Démarrer le Backend (TERMINAL 1)
```powershell
cd C:\Users\bennabi\Downloads\Finovia\app\backend
npm run dev
```

### 2. Démarrer le Frontend (TERMINAL 2)
```powershell
cd C:\Users\bennabi\Downloads\Finovia\app
npm install  # Si pas déjà fait
npm run dev
```

### 3. Ouvrir le Navigateur
```
http://localhost:3000
```

---

## 🔐 Identifiants de Test

Après avoir configuré l'API, vous pouvez vous connecter avec:

- **Email:** `demo@example.com`
- **Password:** `Demo123!`

---

## 🆘 Problèmes Courants

### Erreur: "Cannot find module"
**Solution:** Exécutez `npm install` dans le dossier `app`

### Erreur: "Port 3000 already in use"
**Solution:** Changez le port ou arrêtez le processus utilisant le port 3000

### Erreur: "CORS policy"
**Solution:** Vérifiez que `FRONTEND_URL=http://localhost:3000` est dans `app/backend/.env`

### Le frontend ne se connecte pas au backend
**Solution:** 
1. Vérifiez que le backend est démarré (`http://localhost:5000/health`)
2. Vérifiez que `lib/api.ts` utilise la bonne URL
3. Vérifiez la console du navigateur (F12) pour les erreurs

---

## ✅ Checklist

- [ ] Backend démarré sur port 5000
- [ ] Frontend démarré sur port 3000
- [ ] Fichier `lib/api.ts` créé
- [ ] `auth-context.tsx` mis à jour pour utiliser l'API
- [ ] Application accessible sur `http://localhost:3000`

---

**Démarrez le frontend maintenant et ouvrez `http://localhost:3000` dans votre navigateur!** 🚀

