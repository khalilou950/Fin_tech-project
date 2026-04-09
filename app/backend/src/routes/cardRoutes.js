import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getCards,
    createCard,
    updateCard,
    deleteCard,
    recalculateCardSpent,
    getCardBudgets,
} from '../controllers/cardController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD routes
router.get('/', getCards);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

// Special actions
router.post('/:id/recalculate', recalculateCardSpent);
router.get('/:id/budgets', getCardBudgets);

export default router;
