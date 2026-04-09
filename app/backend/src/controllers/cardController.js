import Card from '../models/Card.js';
import Budget from '../models/Budget.js';

// @desc    Get all cards
// @route   GET /api/cards
// @access  Private
export const getCards = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { isActive } = req.query;

        const filter = { userId };
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const cards = await Card.find(filter).sort({ createdAt: -1 });

        // Calculate stats
        const stats = {
            total: cards.length,
            active: cards.filter((c) => c.isActive).length,
            totalLimit: cards.reduce((sum, c) => sum + c.totalLimit, 0),
            totalSpent: cards.reduce((sum, c) => sum + c.totalSpent, 0),
        };

        res.json({
            success: true,
            data: {
                cards,
                stats,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create card
// @route   POST /api/cards
// @access  Private
export const createCard = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { name, type, totalLimit, currency, resetCycle, color, icon, lastFour } = req.body;

        const card = await Card.create({
            userId,
            name,
            type: type || 'debit',
            totalLimit,
            currency: currency || 'DZD',
            resetCycle: resetCycle || 'monthly',
            color: color || '#3498DB',
            icon: icon || 'CreditCard',
            lastFour,
            totalSpent: 0,
            isActive: true,
        });

        res.status(201).json({
            success: true,
            data: { card },
            message: 'Card created successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update card
// @route   PUT /api/cards/:id
// @access  Private
export const updateCard = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const card = await Card.findOne({ _id: id, userId });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found',
            });
        }

        const allowedUpdates = ['name', 'type', 'totalLimit', 'currency', 'resetCycle', 'color', 'icon', 'lastFour', 'isActive'];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                card[field] = req.body[field];
            }
        });

        await card.save();

        res.json({
            success: true,
            data: { card },
            message: 'Card updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
export const deleteCard = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const card = await Card.findOne({ _id: id, userId });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found',
            });
        }

        // Check if card has associated budgets
        const budgetsCount = await Budget.countDocuments({ cardId: id });

        if (budgetsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete card with ${budgetsCount} associated budget(s). Remove budgets first.`,
            });
        }

        await Card.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Card deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Recalculate card spent
// @route   POST /api/cards/:id/recalculate
// @access  Private
export const recalculateCardSpent = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const card = await Card.findOne({ _id: id, userId });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found',
            });
        }

        await card.recalculateTotalSpent();

        res.json({
            success: true,
            data: { card },
            message: 'Card spent recalculated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get card budgets
// @route   GET /api/cards/:id/budgets
// @access  Private
export const getCardBudgets = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const card = await Card.findOne({ _id: id, userId });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found',
            });
        }

        const budgets = await Budget.find({ cardId: id, userId }).sort({ category: 1 });

        const stats = {
            budgetsCount: budgets.length,
            totalBudgeted: budgets.reduce((sum, b) => sum + b.limit, 0),
            totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
        };

        res.json({
            success: true,
            data: {
                card,
                budgets,
                stats,
            },
        });
    } catch (error) {
        next(error);
    }
};
