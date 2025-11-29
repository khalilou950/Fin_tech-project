import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const updateBudgetSchema = z.object({
  limit: z.number().positive('Budget limit must be positive').optional(),
  resetCycle: z.enum(['monthly', 'weekly', 'yearly']).optional(),
});

export async function PATCH(req: NextRequest) {
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
          message: 'Budget ID is required',
        },
        { status: 400 }
      );
    }

    const budget = await Budget.findOne({ _id: id, userId });

    if (!budget) {
      return NextResponse.json(
        {
          success: false,
          message: 'Budget not found',
        },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = updateBudgetSchema.safeParse(body);

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

    // Update budget
    if (validation.data.limit !== undefined) budget.limit = validation.data.limit;
    if (validation.data.resetCycle !== undefined) budget.resetCycle = validation.data.resetCycle;

    // Recalculate spent
    await budget.recalculateSpent();

    return NextResponse.json(
      {
        success: true,
        data: {
          budget,
        },
        message: 'Budget updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update budget error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

