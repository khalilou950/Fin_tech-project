import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
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

    // Get last 3 months of expenses by category
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const historicalData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'Expense',
          date: { $gte: threeMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            category: '$category',
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Calculate average spending per category
    const categoryAverages: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    for (const item of historicalData) {
      const category = item._id.category;
      if (!categoryAverages[category]) {
        categoryAverages[category] = 0;
        categoryCounts[category] = 0;
      }
      categoryAverages[category] += item.total;
      categoryCounts[category]++;
    }

    // Calculate forecast (simple average for now)
    const forecast: Record<string, any> = {};
    for (const category in categoryAverages) {
      const average = categoryAverages[category] / categoryCounts[category];
      forecast[category] = {
        predicted: Math.round(average),
        confidence: 'medium',
        basedOn: `${categoryCounts[category]} month(s) of data`,
      };
    }

    // Spending by category (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'Expense',
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    const spendingByCategory = categorySpending.reduce((acc: any, item: any) => {
      acc[item._id] = item.total;
      return acc;
    }, {});

    // Evolution per month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyEvolution = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0],
            },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const evolution = monthlyEvolution.map((item: any) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      income: item.income,
      expense: item.expense,
      balance: item.income - item.expense,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          spendingByCategory,
          evolution,
          forecast,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

