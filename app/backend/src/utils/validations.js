import { z } from 'zod';

// Authentication validations
export const signupSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

// Settings validations
export const updateCurrencySchema = z.object({
  body: z.object({
    currency: z.enum(['USD', 'DZD', 'EUR'], {
      errorMap: () => ({ message: 'Currency must be USD, DZD, or EUR' }),
    }),
  }),
});

export const updateThemeSchema = z.object({
  body: z.object({
    theme: z.enum(['light', 'dark'], {
      errorMap: () => ({ message: 'Theme must be light or dark' }),
    }),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').trim().optional(),
    avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  }),
});

// Transaction validations
export const createTransactionSchema = z.object({
  body: z.object({
    date: z.string().datetime().or(z.date()),
    merchant: z.string().min(1, 'Merchant is required').trim(),
    category: z.enum([
      'Food',
      'Transport',
      'Entertainment',
      'Shopping',
      'Utilities',
      'Health',
      'Salary',
      'Freelance',
      'Other',
    ]),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['Income', 'Expense']),
    currency: z.enum(['USD', 'DZD', 'EUR']).optional(),
    source: z.enum(['manual', 'csv', 'ai']).optional(),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    date: z.string().datetime().or(z.date()).optional(),
    merchant: z.string().min(1, 'Merchant is required').trim().optional(),
    category: z.enum([
      'Food',
      'Transport',
      'Entertainment',
      'Shopping',
      'Utilities',
      'Health',
      'Salary',
      'Freelance',
      'Other',
    ]).optional(),
    amount: z.number().positive('Amount must be positive').optional(),
    type: z.enum(['Income', 'Expense']).optional(),
    currency: z.enum(['USD', 'DZD', 'EUR']).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Transaction ID is required'),
  }),
});

export const getTransactionsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    category: z.string().optional(),
    type: z.enum(['Income', 'Expense']).optional(),
    minAmount: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    maxAmount: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    search: z.string().optional(),
    page: z.string().transform((val) => parseInt(val) || 1).optional(),
    limit: z.string().transform((val) => parseInt(val) || 50).optional(),
  }),
});

// Budget validations
export const createBudgetSchema = z.object({
  body: z.object({
    category: z.enum([
      'Food',
      'Transport',
      'Entertainment',
      'Shopping',
      'Utilities',
      'Health',
      'Salary',
      'Freelance',
      'Other',
    ]),
    limit: z.number().positive('Budget limit must be positive'),
    resetCycle: z.enum(['monthly', 'weekly', 'yearly']).optional(),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    limit: z.number().positive('Budget limit must be positive').optional(),
    resetCycle: z.enum(['monthly', 'weekly', 'yearly']).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Budget ID is required'),
  }),
});

