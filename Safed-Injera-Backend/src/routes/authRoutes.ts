import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';

const router = express.Router();

const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

// Register: first user is public (bootstrap), subsequent users need admin auth
router.post('/register', optionalAuth, register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

export default router;


