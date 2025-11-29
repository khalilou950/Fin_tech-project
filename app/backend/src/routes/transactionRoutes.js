import express from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadCSV,
} from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { upload } from '../config/multer.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsSchema,
} from '../utils/validations.js';

const router = express.Router();

router.get('/', authMiddleware, validateRequest(getTransactionsSchema), getTransactions);
router.post('/', authMiddleware, validateRequest(createTransactionSchema), createTransaction);
router.put('/:id', authMiddleware, validateRequest(updateTransactionSchema), updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.post('/upload-csv', authMiddleware, upload.single('csv'), uploadCSV);

export default router;

