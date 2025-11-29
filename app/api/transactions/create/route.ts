import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const createTransactionSchema = z.object({
  date: z.string().datetime().or(z.date()),
  merchant: z.string().min(1, 'Merchant is required').trim(),
  category: z.enum([
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Bills',
    'Health',
    'Salary',
    'Freelance',
    'Other',
  ]),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['Income', 'Expense']),
  currency: z.enum(['USD', 'DZD', 'EUR']).optional(),
  source: z.enum(['manual', 'csv', 'ai']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const auth = await authMiddleware(req);
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authorized',
        },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = auth.userId;
    const user = await import('@/models/User').then((m) => m.default.findById(userId));

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = createTransactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({
      ...validation.data,
      userId,
      date: validation.data.date ? new Date(validation.data.date) : new Date(),
      currency: validation.data.currency || user.currency || 'DZD',
      source: validation.data.source || 'manual',
    });

    // Update budget spent if it's an expense
    if (transaction.type === 'Expense') {
      const budget = await Budget.findOne({
        userId,
        category: transaction.category,
      });

      if (budget) {
        await budget.recalculateSpent();
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          transaction,
        },
        message: 'Transaction created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

