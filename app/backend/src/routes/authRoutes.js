import express from 'express';
import {
  signup,
  signin,
  getMe,
  updateEmail,
  updatePassword,
  logout,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  signupSchema,
  signinSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from '../utils/validations.js';

const router = express.Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/signin', validateRequest(signinSchema), signin);
router.get('/me', authMiddleware, getMe);
router.put('/update-email', authMiddleware, validateRequest(updateEmailSchema), updateEmail);
router.put('/update-password', authMiddleware, validateRequest(updatePasswordSchema), updatePassword);
router.post('/logout', authMiddleware, logout);

export default router;

