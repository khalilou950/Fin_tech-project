import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addContribution,
    withdrawFromGoal,
    processAutoContributions,
} from '../controllers/savingsGoalController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD routes
router.get('/', getSavingsGoals);
router.post('/', createSavingsGoal);
router.put('/:id', updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);

// Contribution routes
router.post('/:id/contribute', addContribution);
router.post('/:id/withdraw', withdrawFromGoal);

// Auto-contribution processing
router.post('/process-auto-contributions', processAutoContributions);

export default router;
