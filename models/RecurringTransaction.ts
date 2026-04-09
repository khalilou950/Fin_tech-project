import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecurringTransaction extends Document {
    userId: mongoose.Types.ObjectId;
    merchant: string;
    category: string;
    amount: number;
    type: 'Income' | 'Expense';
    currency: 'USD' | 'DZD' | 'EUR';
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate?: Date;
    nextOccurrence: Date;
    lastGenerated?: Date;
    autoGenerate: boolean;
    isActive: boolean;
    dayOfMonth?: number; // For monthly: 1-31
    dayOfWeek?: number; // For weekly: 0-6 (Sunday-Saturday)
    tags?: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    calculateNextOccurrence(): Date;
    generateTransaction(): Promise<any>;
}

const recurringTransactionSchema = new Schema<IRecurringTransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
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
        frequency: {
            type: String,
            required: true,
            enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },
        nextOccurrence: {
            type: Date,
            required: true,
        },
        lastGenerated: {
            type: Date,
            default: null,
        },
        autoGenerate: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        dayOfMonth: {
            type: Number,
            min: 1,
            max: 31,
            default: null,
        },
        dayOfWeek: {
            type: Number,
            min: 0,
            max: 6,
            default: null,
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
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
recurringTransactionSchema.index({ userId: 1, isActive: 1 });
recurringTransactionSchema.index({ userId: 1, nextOccurrence: 1 });
recurringTransactionSchema.index({ autoGenerate: 1, isActive: 1, nextOccurrence: 1 });

// Method to calculate next occurrence
recurringTransactionSchema.methods.calculateNextOccurrence = function (): Date {
    const current = this.nextOccurrence || this.startDate;
    const next = new Date(current);

    switch (this.frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'biweekly':
            next.setDate(next.getDate() + 14);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            // Handle day of month
            if (this.dayOfMonth) {
                next.setDate(Math.min(this.dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
            }
            break;
        case 'quarterly':
            next.setMonth(next.getMonth() + 3);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
};

// Method to generate a transaction from this recurring transaction
recurringTransactionSchema.methods.generateTransaction = async function () {
    const Transaction = mongoose.model('Transaction');
    const Budget = mongoose.model('Budget');

    const transaction = await Transaction.create({
        userId: this.userId,
        merchant: this.merchant,
        category: this.category,
        amount: this.amount,
        type: this.type,
        currency: this.currency,
        date: new Date(),
        source: 'ai', // Mark as auto-generated
        tags: [...(this.tags || []), 'recurring'],
        notes: `Auto-generated from recurring transaction: ${this.notes || this.merchant}`,
    });

    // Update budget if expense
    if (this.type === 'Expense') {
        const budget = await Budget.findOne({
            userId: this.userId,
            category: this.category,
        });

        if (budget) {
            await budget.recalculateSpent();
        }
    }

    // Update recurring transaction
    this.lastGenerated = new Date();
    this.nextOccurrence = this.calculateNextOccurrence();

    // Check if should deactivate (reached end date)
    if (this.endDate && this.nextOccurrence > this.endDate) {
        this.isActive = false;
    }

    await this.save();

    return transaction;
};

// Prevent overwrite model error in development
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.RecurringTransaction;
}

const RecurringTransaction: Model<IRecurringTransaction> =
    mongoose.models.RecurringTransaction ||
    mongoose.model<IRecurringTransaction>('RecurringTransaction', recurringTransactionSchema);

export default RecurringTransaction;
