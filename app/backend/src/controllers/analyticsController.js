import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
export const getSummary = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
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

    const spendingByCategory = categorySpending.reduce((acc, item) => {
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
    const monthlyTrends = trends.reduce((acc, item) => {
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

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        spendingByCategory,
        trends: monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics alerts
// @route   GET /api/analytics/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const userId = req.userId;
    const alerts = [];

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
    const lastMonthMap = lastMonthExpenses.reduce((acc, item) => {
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
          message: `Spending in ${currentExpense._id} is 3× higher than last month`,
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
    }).limit(10);

    for (const transaction of largeTransactions) {
      alerts.push({
        type: 'large_transaction',
        transactionId: transaction._id,
        merchant: transaction.merchant,
        amount: transaction.amount,
        message: `Large transaction detected: ${transaction.amount.toLocaleString()} ${transaction.currency || 'DZD'}`,
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

    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics forecast
// @route   GET /api/analytics/forecast
// @access  Private
export const getForecast = async (req, res, next) => {
  try {
    const userId = req.userId;

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
    const categoryAverages = {};
    const categoryCounts = {};

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
    const forecast = {};
    for (const category in categoryAverages) {
      const average = categoryAverages[category] / categoryCounts[category];
      forecast[category] = {
        predicted: Math.round(average),
        confidence: 'medium',
        basedOn: `${categoryCounts[category]} month(s) of data`,
      };
    }

    res.json({
      success: true,
      data: {
        forecast,
        period: 'next_month',
      },
    });
  } catch (error) {
    next(error);
  }
};

