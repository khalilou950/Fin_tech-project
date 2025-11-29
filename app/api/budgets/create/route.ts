import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';
import Transaction from '@/models/Transaction';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const createBudgetSchema = z.object({
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
  limit: z.number().positive('Budget limit must be positive'),
  resetCycle: z.enum(['monthly', 'weekly', 'yearly']).optional(),
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
    const body = await req.json();
    const validation = createBudgetSchema.safeParse(body);

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

    const { category, limit, resetCycle = 'monthly' } = validation.data;

    // Check if budget already exists for this category
    const existingBudget = await Budget.findOne({ userId, category });
    if (existingBudget) {
      return NextResponse.json(
        {
          success: false,
          message: 'Budget already exists for this category',
        },
        { status: 400 }
      );
    }

    // Calculate initial spent
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          category: category,
          type: 'Expense',
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = expenses.length > 0 ? expenses[0].total : 0;

    const budget = await Budget.create({
      userId,
      category,
      limit,
      spent,
      resetCycle,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          budget,
        },
        message: 'Budget created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create budget error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

