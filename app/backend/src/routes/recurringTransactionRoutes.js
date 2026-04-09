import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getRecurringTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    generateTransactionManually,
    processPendingRecurringTransactions,
} from '../controllers/recurringTransactionController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD routes
router.get('/', getRecurringTransactions);
router.post('/', createRecurringTransaction);
router.put('/:id', updateRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);

// Special actions
router.post('/:id/generate', generateTransactionManually);
router.post('/process-pending', processPendingRecurringTransactions);

export default router;
