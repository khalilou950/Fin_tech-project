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
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Calculate total income
    const incomeResult = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'Income',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;

    // Calculate total expenses
    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'Expense',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;

    // Calculate balance
    const balance = totalIncome - totalExpense;

    // Calculate spending by category
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'Expense',
          ...dateFilter,
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

    // Calculate trends for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const trends = await Transaction.aggregate([
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
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Organize trends by month
    const monthlyTrends = trends.reduce((acc: any, item: any) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = { income: 0, expense: 0 };
      }
      if (item._id.type === 'Income') {
        acc[key].income = item.total;
      } else {
        acc[key].expense = item.total;
      }
      return acc;
    }, {});

    return NextResponse.json(
      {
        success: true,
        data: {
          totalIncome,
          totalExpense,
          balance,
          spendingByCategory,
          trends: monthlyTrends,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

