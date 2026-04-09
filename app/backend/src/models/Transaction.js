import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
      enum: ['manual', 'csv', 'ai', 'voice'],
      default: 'manual',
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to normalize transaction type before save (CRITICAL for budget sync)
transactionSchema.pre('save', function (next) {
  // Normalize type to proper capitalization
  if (this.type) {
    const typeStr = String(this.type).toLowerCase();
    if (typeStr === 'income') {
      this.type = 'Income';
    } else if (typeStr === 'expense') {
      this.type = 'Expense';
    }
  }

  // Trim merchant and notes
  if (this.merchant) {
    this.merchant = this.merchant.trim();
  }
  if (this.notes) {
    this.notes = this.notes.trim();
  }

  next();
});

// Indexes for faster queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, tags: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

