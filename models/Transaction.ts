import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  merchant: string;
  category: string;
  amount: number;
  type: 'Income' | 'Expense';
  currency: 'USD' | 'DZD' | 'EUR';
  source: 'manual' | 'csv' | 'ai';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    merchant: {
      type: String,
      required: [true, 'Merchant is required'],
      trim: true,
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    type: {
      type: String,
      required: true,
      enum: ['Income', 'Expense'],
    },
    currency: {
      type: String,
      enum: ['USD', 'DZD', 'EUR'],
      default: 'DZD',
    },
    source: {
      type: String,
      enum: ['manual', 'csv', 'ai'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;

