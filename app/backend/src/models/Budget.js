import mongoose from 'mongoose';

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
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const expenses = await Transaction.aggregate([
    {
      $match: {
        userId: this.userId,
        category: this.category,
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

  this.spent = expenses.length > 0 ? expenses[0].total : 0;
  return this.save();
};

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;

