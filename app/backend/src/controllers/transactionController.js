import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Budget from '../models/Budget.js';
import { parseCSV } from '../utils/csvParser.js';
import fs from 'fs/promises';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      startDate,
      endDate,
      category,
      type,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter
    const filter = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (category) filter.category = category;
    if (type) filter.type = type;

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    if (search) {
      filter.$or = [
        { merchant: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    const transaction = await Transaction.create({
      ...req.body,
      userId,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      currency: req.body.currency || user.currency,
      source: req.body.source || 'manual',
    });

    // Update budget spent if it's an expense
    if (transaction.type === 'Expense') {
      const budget = await Budget.findOne({
        userId,
        category: transaction.category,
      });

      if (budget) {
        await budget.recalculateSpent();
      }
    }

    res.status(201).json({
      success: true,
      data: {
        transaction,
      },
      message: 'Transaction created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Find transaction
    const transaction = await Transaction.findOne({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Store old category and type for budget update
    const oldCategory = transaction.category;
    const oldType = transaction.type;

    // Update transaction
    const updateData = { ...req.body };
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

    res.json({
      success: true,
      data: {
        transaction,
      },
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
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

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload CSV transactions
// @route   POST /api/transactions/upload-csv
// @access  Private
export const uploadCSV = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required',
      });
    }

    // Parse CSV
    const parsedTransactions = await parseCSV(req.file.path);
    
    if (parsedTransactions.length === 0) {
      // Delete uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'No transactions found in CSV file',
      });
    }

    // Create transactions
    const transactions = await Transaction.insertMany(
      parsedTransactions.map((tx) => ({
        ...tx,
        userId,
        currency: user.currency,
        source: 'csv',
      }))
    );

    // Update all affected budgets
    const expenseTransactions = transactions.filter((tx) => tx.type === 'Expense');
    const categories = [...new Set(expenseTransactions.map((tx) => tx.category))];

    for (const category of categories) {
      const budget = await Budget.findOne({ userId, category });
      if (budget) {
        await budget.recalculateSpent();
      }
    }

    // Delete uploaded file
    await fs.unlink(req.file.path).catch(() => {});

    res.status(201).json({
      success: true,
      data: {
        transactions,
        count: transactions.length,
      },
      message: `Successfully imported ${transactions.length} transactions`,
    });
  } catch (error) {
    // Delete uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path).catch(() => {});
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    next(error);
  }
};

