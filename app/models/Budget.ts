import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  spent: number;
  resetCycle: 'monthly' | 'weekly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
  recalculateSpent(): Promise<void>;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
        'Bills',
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

  // Ensure userId is ObjectId
  const userId = this.userId instanceof mongoose.Types.ObjectId 
    ? this.userId 
    : new mongoose.Types.ObjectId(this.userId);

  console.log(`Recalculating spent for budget: category=${this.category}, userId=${userId}`);

  const expenses = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
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

  const spent = expenses.length > 0 ? expenses[0].total : 0;
  console.log(`Calculated spent for ${this.category}: ${spent}`);
  
  this.spent = spent;
  await this.save();
  
  return spent;
};

const Budget: Model<IBudget> = mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);

export default Budget;

