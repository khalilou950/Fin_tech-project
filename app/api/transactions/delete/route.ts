import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';

export async function DELETE(req: NextRequest) {
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

    const category = transaction.category;
    const type = transaction.type;

    await Transaction.findByIdAndDelete(id);

    // Recalculate budget if it was an expense
    if (type === 'Expense') {
      const budget = await Budget.findOne({
        userId,
        category,
      });

      if (budget) {
        await budget.recalculateSpent();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

