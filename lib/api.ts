// API client for Next.js API routes
const API_BASE = '/api';

// Helper to get auth token
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Helper to make authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
};

export const api = {
  // Authentication
  signup: async (fullName: string, email: string, password: string, confirmPassword: string) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, confirmPassword }),
    });
    return response.json();
  },

  signin: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getMe: async () => {
    const response = await authFetch(`${API_BASE}/user/me`);
    return response.json();
  },

  logout: async (refreshToken?: string) => {
    const response = await authFetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return response.json();
  },

  // User settings
  updateEmail: async (email: string) => {
    const response = await authFetch(`${API_BASE}/user/update-email`, {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    const response = await authFetch(`${API_BASE}/user/update-password`, {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return response.json();
  },

  updateSettings: async (settings: { currency?: string; theme?: string; fullName?: string; avatar?: string }) => {
    const response = await authFetch(`${API_BASE}/user/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return response.json();
  },

  // Transactions
  getTransactions: async (filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const response = await authFetch(`${API_BASE}/transactions/list${queryString ? `?${queryString}` : ''}`);
    return response.json();
  },

  createTransaction: async (transaction: {
    date: string | Date;
    merchant: string;
    category: string;
    amount: number;
    type: 'Income' | 'Expense';
    currency?: string;
    source?: 'manual' | 'csv' | 'ai';
  }) => {
    const response = await authFetch(`${API_BASE}/transactions/create`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
    return response.json();
  },

  updateTransaction: async (id: string, transaction: {
    date?: string | Date;
    merchant?: string;
    category?: string;
    amount?: number;
    type?: 'Income' | 'Expense';
    currency?: string;
  }) => {
    const response = await authFetch(`${API_BASE}/transactions/update?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
    return response.json();
  },

  deleteTransaction: async (id: string) => {
    const response = await authFetch(`${API_BASE}/transactions/delete?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  uploadCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('csv', file);
    
    const token = getToken();
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}/transactions/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return response.json();
  },

  // Budgets
  getBudgets: async () => {
    const response = await authFetch(`${API_BASE}/budgets/list`);
    return response.json();
  },

  createBudget: async (budget: {
    category: string;
    limit: number;
    resetCycle?: 'monthly' | 'weekly' | 'yearly';
  }) => {
    const response = await authFetch(`${API_BASE}/budgets/create`, {
      method: 'POST',
      body: JSON.stringify(budget),
    });
    return response.json();
  },

  updateBudget: async (id: string, budget: {
    limit?: number;
    resetCycle?: 'monthly' | 'weekly' | 'yearly';
  }) => {
    const response = await authFetch(`${API_BASE}/budgets/update?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(budget),
    });
    return response.json();
  },

  deleteBudget: async (id: string) => {
    const response = await authFetch(`${API_BASE}/budgets/delete?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Dashboard & Analytics
  getDashboardSummary: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const response = await authFetch(`${API_BASE}/dashboard/summary${queryString ? `?${queryString}` : ''}`);
    return response.json();
  },

  getDashboardAlerts: async () => {
    const response = await authFetch(`${API_BASE}/dashboard/alerts`);
    return response.json();
  },

  getDashboardAnalytics: async () => {
    const response = await authFetch(`${API_BASE}/dashboard/analytics`);
    return response.json();
  },
};



