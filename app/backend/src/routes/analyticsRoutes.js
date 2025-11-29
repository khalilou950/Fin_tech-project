import express from 'express';
import {
  getSummary,
  getAlerts,
  getForecast,
} from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authMiddleware, getSummary);
router.get('/alerts', authMiddleware, getAlerts);
router.get('/forecast', authMiddleware, getForecast);

export default router;

