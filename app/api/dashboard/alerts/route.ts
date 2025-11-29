import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
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
    const alerts: any[] = [];

    // Get current month expenses by category
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get last month for comparison
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const endOfLastMonth = new Date(endOfMonth);
    endOfLastMonth.setMonth(endOfLastMonth.getMonth() - 1);

    const currentMonthExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'Expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const lastMonthExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'Expense',
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Create comparison map
    const lastMonthMap = lastMonthExpenses.reduce((acc: any, item: any) => {
      acc[item._id] = item.total;
      return acc;
    }, {});

    // Check for spending increase alerts (3x higher than last month)
    for (const currentExpense of currentMonthExpenses) {
      const lastMonthTotal = lastMonthMap[currentExpense._id] || 0;
      if (lastMonthTotal > 0 && currentExpense.total >= lastMonthTotal * 3) {
        alerts.push({
          type: 'spending_increase',
          category: currentExpense._id,
          message: `You spent 3× more on ${currentExpense._id} this month`,
          severity: 'high',
        });
      }
    }

    // Check for large transactions (80,000 DZD or equivalent)
    const largeTransactionThreshold = 80000;
    const largeTransactions = await Transaction.find({
      userId: userId,
      amount: { $gte: largeTransactionThreshold },
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .limit(10)
      .lean();

    for (const transaction of largeTransactions) {
      alerts.push({
        type: 'large_transaction',
        transactionId: transaction._id,
        merchant: transaction.merchant,
        amount: transaction.amount,
        message: `Large unusual transaction detected: ${transaction.amount.toLocaleString()} ${transaction.currency || 'DZD'}`,
        severity: 'medium',
      });
    }

    // Check for budget overruns
    const budgets = await Budget.find({ userId });
    for (const budget of budgets) {
      await budget.recalculateSpent();
      if (budget.spent > budget.limit) {
        alerts.push({
          type: 'budget_exceeded',
          budgetId: budget._id,
          category: budget.category,
          spent: budget.spent,
          limit: budget.limit,
          message: `${budget.category} budget has been exceeded. Spent: ${budget.spent.toLocaleString()}, Limit: ${budget.limit.toLocaleString()}`,
          severity: 'high',
        });
      }
    }

    // Check for new merchants (transactions from merchants not seen before)
    const allTransactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(100).lean();
    const merchantCounts: Record<string, number> = {};
    allTransactions.forEach((tx) => {
      merchantCounts[tx.merchant] = (merchantCounts[tx.merchant] || 0) + 1;
    });

    // Find merchants with only 1 transaction (new merchants)
    const newMerchants = Object.entries(merchantCounts)
      .filter(([_, count]) => count === 1)
      .slice(0, 5);

    for (const [merchant] of newMerchants) {
      alerts.push({
        type: 'new_merchant',
        merchant: merchant,
        message: `New merchant: ${merchant}`,
        severity: 'low',
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          alerts,
          count: alerts.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Dashboard alerts error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

