import mongoose, { Schema, Document, Model } from 'mongoose';
import Transaction from './Transaction'; // Import to ensure model is registered

export interface ICard extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    type: 'credit' | 'debit' | 'prepaid';
    totalLimit: number;
    totalSpent: number;
    currency: 'USD' | 'DZD' | 'EUR';
    resetCycle: 'weekly' | 'monthly' | 'yearly';
    color: string;
    icon?: string;
    lastFour?: string; // Last 4 digits for display
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    recalculateTotalSpent(): Promise<void>;
}

const cardSchema = new Schema<ICard>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Card name is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['credit', 'debit', 'prepaid'],
            default: 'debit',
        },
        totalLimit: {
            type: Number,
            required: [true, 'Total limit is required'],
            min: [0, 'Total limit must be positive'],
        },
        totalSpent: {
            type: Number,
            default: 0,
            min: [0, 'Total spent cannot be negative'],
        },
        currency: {
            type: String,
            enum: ['USD', 'DZD', 'EUR'],
            default: 'DZD',
        },
        resetCycle: {
            type: String,
            enum: ['weekly', 'monthly', 'yearly'],
            default: 'monthly',
        },
        color: {
            type: String,
            default: '#3498DB',
        },
        icon: {
            type: String,
            default: 'CreditCard',
        },
        lastFour: {
            type: String,
            trim: true,
            maxlength: 4,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
cardSchema.index({ userId: 1, isActive: 1 });

// Method to recalculate total spent
cardSchema.methods.recalculateTotalSpent = async function () {
    const Transaction = mongoose.model('Transaction');

    // Calculate start date based on reset cycle
    const now = new Date();
    let startDate = new Date();

    switch (this.resetCycle) {
        case 'weekly':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
    }

    const expenses = await Transaction.aggregate([
        {
            $match: {
                userId: this.userId,
                cardId: this._id,
                type: 'Expense',
                date: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
            },
        },
    ]);

    const previousSpent = this.totalSpent;
    this.totalSpent = expenses.length > 0 ? expenses[0].total : 0;

    console.log(`[Card Recalculation] ${this.name}: ${previousSpent} DA → ${this.totalSpent} DA`);

    await this.save();
};

// Prevent overwrite model error in development
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Card;
}

const Card: Model<ICard> = mongoose.models.Card || mongoose.model<ICard>('Card', cardSchema);

export default Card;
