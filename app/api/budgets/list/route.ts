import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';

export async function GET(req: NextRequest) {
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
    // Convert userId to ObjectId if it's a string
    const mongoose = await import('mongoose');
    const userIdObjectId = mongoose.default.Types.ObjectId.isValid(userId) 
      ? new mongoose.default.Types.ObjectId(userId) 
      : userId;

    const budgets = await Budget.find({ userId: userIdObjectId }).sort({ createdAt: -1 }).lean();

    // Recalculate spent for all budgets
    for (const budget of budgets) {
      const budgetDoc = await Budget.findById(budget._id);
      if (budgetDoc) {
        await budgetDoc.recalculateSpent();
      }
    }

    // Get updated budgets
    const updatedBudgets = await Budget.find({ userId: userIdObjectId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          budgets: updatedBudgets,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

