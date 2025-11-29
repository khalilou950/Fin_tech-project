import express from 'express';
import {
  updateCurrency,
  updateTheme,
  updateProfile,
} from '../controllers/settingsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  updateCurrencySchema,
  updateThemeSchema,
  updateProfileSchema,
} from '../utils/validations.js';

const router = express.Router();

router.put('/currency', authMiddleware, validateRequest(updateCurrencySchema), updateCurrency);
router.put('/theme', authMiddleware, validateRequest(updateThemeSchema), updateTheme);
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), updateProfile);

export default router;

