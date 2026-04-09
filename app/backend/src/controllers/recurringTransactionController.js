import RecurringTransaction from '../models/RecurringTransaction.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all recurring transactions
// @route   GET /api/recurring-transactions
// @access  Private
export const getRecurringTransactions = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { isActive } = req.query;

        const filter = { userId };
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const recurringTransactions = await RecurringTransaction.find(filter).sort({ nextOccurrence: 1, createdAt: -1 });

        res.json({
            success: true,
            data: {
                recurringTransactions,
                count: recurringTransactions.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create recurring transaction
// @route   POST /api/recurring-transactions
// @access  Private
export const createRecurringTransaction = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { merchant, category, amount, type, currency, frequency, startDate, endDate, dayOfMonth, dayOfWeek, autoGenerate, tags, notes } = req.body;

        // Calculate first occurrence
        const start = startDate ? new Date(startDate) : new Date();
        let nextOccurrence = new Date(start);

        // Set specific day if provided
        if (frequency === 'monthly' && dayOfMonth) {
            nextOccurrence.setDate(Math.min(dayOfMonth, new Date(nextOccurrence.getFullYear(), nextOccurrence.getMonth() + 1, 0).getDate()));
        } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
            const currentDay = nextOccurrence.getDay();
            const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
            nextOccurrence.setDate(nextOccurrence.getDate() + daysUntilTarget);
        }

        const recurringTransaction = await RecurringTransaction.create({
            userId,
            merchant,
            category,
            amount,
            type,
            currency,
            frequency,
            startDate: start,
            endDate: endDate ? new Date(endDate) : null,
            nextOccurrence,
            dayOfMonth,
            dayOfWeek,
            autoGenerate: autoGenerate !== undefined ? autoGenerate : true,
            isActive: true,
            tags: tags || [],
            notes: notes || '',
        });

        res.status(201).json({
            success: true,
            data: {
                recurringTransaction,
            },
            message: 'Recurring transaction created successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring-transactions/:id
// @access  Private
export const updateRecurringTransaction = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const recurringTransaction = await RecurringTransaction.findOne({ _id: id, userId });

        if (!recurringTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Recurring transaction not found',
            });
        }

        // Update fields
        const allowedUpdates = ['merchant', 'category', 'amount', 'type', 'currency', 'frequency', 'endDate', 'dayOfMonth', 'dayOfWeek', 'autoGenerate', 'isActive', 'tags', 'notes'];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                recurringTransaction[field] = req.body[field];
            }
        });

        // Recalculate next occurrence if frequency changed
        if (req.body.frequency) {
            recurringTransaction.nextOccurrence = recurringTransaction.calculateNextOccurrence();
        }

        await recurringTransaction.save();

        res.json({
            success: true,
            data: {
                recurringTransaction,
            },
            message: 'Recurring transaction updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring-transactions/:id
// @access  Private
export const deleteRecurringTransaction = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const recurringTransaction = await RecurringTransaction.findOne({ _id: id, userId });

        if (!recurringTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Recurring transaction not found',
            });
        }

        await RecurringTransaction.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Recurring transaction deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate transaction manually from recurring transaction
// @route   POST /api/recurring-transactions/:id/generate
// @access  Private
export const generateTransactionManually = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const recurringTransaction = await RecurringTransaction.findOne({ _id: id, userId });

        if (!recurringTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Recurring transaction not found',
            });
        }

        if (!recurringTransaction.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot generate transaction from inactive recurring transaction',
            });
        }

        const transaction = await recurringTransaction.generateTransaction();

        res.status(201).json({
            success: true,
            data: {
                transaction,
                recurringTransaction,
            },
            message: 'Transaction generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process all pending recurring transactions (for cron job)
// @route   POST /api/recurring-transactions/process-pending
// @access  Private (should be secured with API key for cron)
export const processPendingRecurringTransactions = async (req, res, next) => {
    try {
        const now = new Date();

        // Find all active recurring transactions that are due
        const dueRecurringTransactions = await RecurringTransaction.find({
            isActive: true,
            autoGenerate: true,
            nextOccurrence: { $lte: now },
        });

        console.log(`[Recurring Transactions] Found ${dueRecurringTransactions.length} due transactions to process`);

        const results = {
            processed: 0,
            failed: 0,
            errors: [],
        };

        for (const recurring of dueRecurringTransactions) {
            try {
                await recurring.generateTransaction();
                results.processed++;
                console.log(`[Recurring Transactions] Generated transaction for: ${recurring.merchant}`);
            } catch (error) {
                results.failed++;
                results.errors.push({
                    id: recurring._id,
                    merchant: recurring.merchant,
                    error: error.message,
                });
                console.error(`[Recurring Transactions] Failed to generate for ${recurring.merchant}:`, error);
            }
        }

        res.json({
            success: true,
            data: results,
            message: `Processed ${results.processed} recurring transactions`,
        });
    } catch (error) {
        next(error);
    }
};
