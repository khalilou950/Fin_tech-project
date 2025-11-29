import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const userId = req.userId;

    const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });

    // Recalculate spent for all budgets
    for (const budget of budgets) {
      await budget.recalculateSpent();
    }

    // Get updated budgets
    const updatedBudgets = await Budget.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        budgets: updatedBudgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { category, limit, resetCycle = 'monthly' } = req.body;

    // Check if budget already exists for this category
    const existingBudget = await Budget.findOne({ userId, category });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category',
      });
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

    res.status(201).json({
      success: true,
      data: {
        budget,
      },
      message: 'Budget created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const budget = await Budget.findOne({ _id: id, userId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Update budget
    if (req.body.limit !== undefined) budget.limit = req.body.limit;
    if (req.body.resetCycle !== undefined) budget.resetCycle = req.body.resetCycle;

    // Recalculate spent
    await budget.recalculateSpent();

    res.json({
      success: true,
      data: {
        budget,
      },
      message: 'Budget updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const budget = await Budget.findOne({ _id: id, userId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    await Budget.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

