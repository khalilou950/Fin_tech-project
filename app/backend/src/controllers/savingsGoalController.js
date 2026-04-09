import SavingsGoal from '../models/SavingsGoal.js';

// @desc    Get all savings goals
// @route   GET /api/savings-goals
// @access  Private
export const getSavingsGoals = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { isCompleted, priority, category } = req.query;

        const filter = { userId };
        if (isCompleted !== undefined) {
            filter.isCompleted = isCompleted === 'true';
        }
        if (priority) {
            filter.priority = priority;
        }
        if (category) {
            filter.category = category;
        }

        const savingsGoals = await SavingsGoal.find(filter).sort({ priority: -1, deadline: 1, createdAt: -1 });

        // Calculate stats
        const stats = {
            total: savingsGoals.length,
            active: savingsGoals.filter(g => !g.isCompleted).length,
            completed: savingsGoals.filter(g => g.isCompleted).length,
            totalTarget: savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0),
            totalSaved: savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0),
        };

        res.json({
            success: true,
            data: {
                savingsGoals,
                stats,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create savings goal
// @route   POST /api/savings-goals
// @access  Private
export const createSavingsGoal = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { name, description, targetAmount, currentAmount, deadline, category, priority, autoContribute } = req.body;

        const savingsGoal = await SavingsGoal.create({
            userId,
            name,
            description,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline: deadline ? new Date(deadline) : null,
            category: category || 'other',
            priority: priority || 'medium',
            autoContribute: autoContribute || { enabled: false },
        });

        res.status(201).json({
            success: true,
            data: {
                savingsGoal,
            },
            message: 'Savings goal created successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update savings goal
// @route   PUT /api/savings-goals/:id
// @access  Private
export const updateSavingsGoal = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });

        if (!savingsGoal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found',
            });
        }

        // Update fields
        const allowedUpdates = ['name', 'description', 'targetAmount', 'deadline', 'category', 'priority', 'autoContribute'];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                savingsGoal[field] = req.body[field];
            }
        });

        await savingsGoal.save();

        res.json({
            success: true,
            data: {
                savingsGoal,
            },
            message: 'Savings goal updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings-goals/:id
// @access  Private
export const deleteSavingsGoal = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });

        if (!savingsGoal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found',
            });
        }

        await SavingsGoal.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Savings goal deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add contribution to savings goal
// @route   POST /api/savings-goals/:id/contribute
// @access  Private
export const addContribution = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { amount, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid contribution amount is required',
            });
        }

        const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });

        if (!savingsGoal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found',
            });
        }

        // Add contribution
        savingsGoal.contributions.push({
            date: new Date(),
            amount,
            note: note || '',
        });

        // Update current amount
        savingsGoal.currentAmount += amount;

        await savingsGoal.save();

        res.status(201).json({
            success: true,
            data: {
                savingsGoal,
                contribution: savingsGoal.contributions[savingsGoal.contributions.length - 1],
            },
            message: 'Contribution added successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Withdraw from savings goal
// @route   POST /api/savings-goals/:id/withdraw
// @access  Private
export const withdrawFromGoal = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { amount, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid withdrawal amount is required',
            });
        }

        const savingsGoal = await SavingsGoal.findOne({ _id: id, userId });

        if (!savingsGoal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found',
            });
        }

        if (amount > savingsGoal.currentAmount) {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal amount exceeds current savings',
            });
        }

        // Add negative contribution for withdrawal
        savingsGoal.contributions.push({
            date: new Date(),
            amount: -amount,
            note: note || 'Withdrawal',
        });

        // Update current amount
        savingsGoal.currentAmount -= amount;

        await savingsGoal.save();

        res.json({
            success: true,
            data: {
                savingsGoal,
            },
            message: 'Withdrawal processed successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process auto-contributions (for cron job)
// @route   POST /api/savings-goals/process-auto-contributions
// @access  Private
export const processAutoContributions = async (req, res, next) => {
    try {
        const now = new Date();

        // Find all goals with auto-contribute enabled and due
        const dueGoals = await SavingsGoal.find({
            'autoContribute.enabled': true,
            'autoContribute.nextContribution': { $lte: now },
            isCompleted: false,
        });

        console.log(`[Auto-Contributions] Found ${dueGoals.length} goals due for contribution`);

        const results = {
            processed: 0,
            failed: 0,
            totalContributed: 0,
            errors: [],
        };

        for (const goal of dueGoals) {
            try {
                const contributionAmount = goal.autoContribute.amount;

                // Add contribution
                goal.contributions.push({
                    date: new Date(),
                    amount: contributionAmount,
                    note: 'Auto-contribution',
                });

                goal.currentAmount += contributionAmount;

                // Calculate next contribution date
                const nextDate = new Date(goal.autoContribute.nextContribution);
                switch (goal.autoContribute.frequency) {
                    case 'daily':
                        nextDate.setDate(nextDate.getDate() + 1);
                        break;
                    case 'weekly':
                        nextDate.setDate(nextDate.getDate() + 7);
                        break;
                    case 'monthly':
                        nextDate.setMonth(nextDate.getMonth() + 1);
                        break;
                }
                goal.autoContribute.nextContribution = nextDate;

                await goal.save();

                results.processed++;
                results.totalContributed += contributionAmount;
                console.log(`[Auto-Contributions] Processed ${goal.name}: ${contributionAmount} DZD`);
            } catch (error) {
                results.failed++;
                results.errors.push({
                    id: goal._id,
                    name: goal.name,
                    error: error.message,
                });
                console.error(`[Auto-Contributions] Failed for ${goal.name}:`, error);
            }
        }

        res.json({
            success: true,
            data: results,
            message: `Processed ${results.processed} auto-contributions`,
        });
    } catch (error) {
        next(error);
    }
};
