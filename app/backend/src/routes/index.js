import express from 'express';
import authRoutes from './authRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import recurringTransactionRoutes from './recurringTransactionRoutes.js';
import savingsGoalRoutes from './savingsGoalRoutes.js';
import cardRoutes from './cardRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/recurring-transactions', recurringTransactionRoutes);
router.use('/savings-goals', savingsGoalRoutes);
router.use('/cards', cardRoutes);

export default router;
