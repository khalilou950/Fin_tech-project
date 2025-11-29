import express from 'express';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
} from '../utils/validations.js';

const router = express.Router();

router.get('/', authMiddleware, getBudgets);
router.post('/', authMiddleware, validateRequest(createBudgetSchema), createBudget);
router.put('/:id', authMiddleware, validateRequest(updateBudgetSchema), updateBudget);
router.delete('/:id', authMiddleware, deleteBudget);

export default router;

