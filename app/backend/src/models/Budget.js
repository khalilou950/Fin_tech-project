import mongoose from 'mongoose';
import './Transaction.js'; // Ensure Transaction model is registered

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Food',
        'Transport',
        'Entertainment',
        'Shopping',
        'Utilities',
        'Health',
        'Salary',
        'Freelance',
        'Other',
      ],
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0, 'Budget limit must be positive'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    resetCycle: {
      type: String,
      enum: ['monthly', 'weekly', 'yearly'],
      default: 'monthly',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

// Method to recalculate spent amount
budgetSchema.methods.recalculateSpent = async function () {
  const Transaction = mongoose.model('Transaction');

  // Calculate date range based on reset cycle
  let startDate = new Date();

  if (this.resetCycle === 'weekly') {
    // Start of current week (Monday)
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(startDate.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else if (this.resetCycle === 'yearly') {
    // Start of current year
    startDate = new Date(startDate.getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Default: monthly
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  console.log(`[Budget Recalculation] Category: ${this.category}, Reset Cycle: ${this.resetCycle}, Start Date: ${startDate.toISOString()}`);

  const expenses = await Transaction.aggregate([
    {
      $match: {
        userId: this.userId,
        category: this.category,
        type: 'Expense',
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const previousSpent = this.spent;
  this.spent = expenses.length > 0 ? expenses[0].total : 0;

  console.log(`[Budget Recalculation] Found ${expenses.length > 0 ? expenses[0].count : 0} transactions, Total: ${this.spent} DZD (Previous: ${previousSpent} DZD)`);

  return this.save();
};

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;

