import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const updateTransactionSchema = z.object({
  date: z.string().datetime().or(z.date()).optional(),
  merchant: z.string().min(1, 'Merchant is required').trim().optional(),
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
  ]).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  type: z.enum(['Income', 'Expense']).optional(),
  currency: z.enum(['USD', 'DZD', 'EUR']).optional(),
});

export async function PUT(req: NextRequest) {
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
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction ID is required',
        },
        { status: 400 }
      );
    }

    // Find transaction
    const transaction = await Transaction.findOne({ _id: id, userId });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction not found',
        },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = updateTransactionSchema.safeParse(body);

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

    // Store old category and type for budget update
    const oldCategory = transaction.category;
    const oldType = transaction.type;

    // Update transaction
    const updateData: any = { ...validation.data };
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    Object.assign(transaction, updateData);
    await transaction.save();

    // Recalculate budgets if category or type changed
    if (
      (updateData.category && updateData.category !== oldCategory) ||
      (updateData.type && updateData.type !== oldType)
    ) {
      // Recalculate old budget
      if (oldType === 'Expense') {
        const oldBudget = await Budget.findOne({
          userId,
          category: oldCategory,
        });
        if (oldBudget) {
          await oldBudget.recalculateSpent();
        }
      }

      // Recalculate new budget
      if (transaction.type === 'Expense') {
        const newBudget = await Budget.findOne({
          userId,
          category: transaction.category,
        });
        if (newBudget) {
          await newBudget.recalculateSpent();
        }
      }
    } else if (transaction.type === 'Expense') {
      // Just recalculate current budget
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
        message: 'Transaction updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

