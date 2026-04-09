import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContribution {
    date: Date;
    amount: number;
    note?: string;
}

export interface ISavingsGoal extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: Date;
    category: 'emergency' | 'vacation' | 'purchase' | 'education' | 'retirement' | 'house' | 'car' | 'wedding' | 'other';
    priority: 'low' | 'medium' | 'high';
    isCompleted: boolean;
    completedAt?: Date;
    contributions: IContribution[];
    autoContribute?: {
        enabled: boolean;
        amount: number;
        frequency: 'daily' | 'weekly' | 'monthly';
        nextContribution?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    getProgress(): number;
    getRemainingAmount(): number;
    getDaysRemaining(): number | null;
    getProjectedCompletionDate(): Date | null;
}

const contributionSchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    note: {
        type: String,
        trim: true,
    },
});

const savingsGoalSchema = new Schema<ISavingsGoal>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Goal name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        targetAmount: {
            type: Number,
            required: [true, 'Target amount is required'],
            min: [0, 'Target amount must be positive'],
        },
        currentAmount: {
            type: Number,
            default: 0,
            min: [0, 'Current amount cannot be negative'],
        },
        deadline: {
            type: Date,
            default: null,
        },
        category: {
            type: String,
            enum: ['emergency', 'vacation', 'purchase', 'education', 'retirement', 'house', 'car', 'wedding', 'other'],
            default: 'other',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        contributions: {
            type: [contributionSchema],
            default: [],
        },
        autoContribute: {
            enabled: {
                type: Boolean,
                default: false,
            },
            amount: {
                type: Number,
                min: 0,
            },
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly'],
            },
            nextContribution: {
                type: Date,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
savingsGoalSchema.index({ userId: 1, isCompleted: 1 });
savingsGoalSchema.index({ userId: 1, priority: 1 });
savingsGoalSchema.index({ userId: 1, deadline: 1 });

// Method to calculate progress percentage
savingsGoalSchema.methods.getProgress = function (): number {
    if (this.targetAmount === 0) return 0;
    return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
};

// Method to get remaining amount
savingsGoalSchema.methods.getRemainingAmount = function (): number {
    return Math.max(this.targetAmount - this.currentAmount, 0);
};

// Method to get days remaining until deadline
savingsGoalSchema.methods.getDaysRemaining = function (): number | null {
    if (!this.deadline) return null;
    const now = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Method to calculate projected completion date based on auto-contribution
savingsGoalSchema.methods.getProjectedCompletionDate = function (): Date | null {
    if (!this.autoContribute || !this.autoContribute.enabled || !this.autoContribute.amount) {
        return null;
    }

    const remaining = this.getRemainingAmount();
    if (remaining <= 0) return new Date();

    const contributionAmount = this.autoContribute.amount;
    let daysToAdd = 0;

    switch (this.autoContribute.frequency) {
        case 'daily':
            daysToAdd = Math.ceil(remaining / contributionAmount);
            break;
        case 'weekly':
            daysToAdd = Math.ceil(remaining / contributionAmount) * 7;
            break;
        case 'monthly':
            daysToAdd = Math.ceil(remaining / contributionAmount) * 30;
            break;
    }

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToAdd);
    return projectedDate;
};

// Middleware to check if goal is completed
savingsGoalSchema.pre('save', function (next) {
    if (this.currentAmount >= this.targetAmount && !this.isCompleted) {
        this.isCompleted = true;
        this.completedAt = new Date();
    } else if (this.currentAmount < this.targetAmount && this.isCompleted) {
        this.isCompleted = false;
        this.completedAt = null;
    }
    next();
});

// Prevent overwrite model error in development
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.SavingsGoal;
}

const SavingsGoal: Model<ISavingsGoal> =
    mongoose.models.SavingsGoal || mongoose.model<ISavingsGoal>('SavingsGoal', savingsGoalSchema);

export default SavingsGoal;
