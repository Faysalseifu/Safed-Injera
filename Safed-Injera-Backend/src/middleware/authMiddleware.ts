import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { findUserById } from '../repositories/userRepository';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'staff' | 'sub_admin';
    branch_id?: string | null;
  };
}

/** Attach user when a valid Bearer token is present; otherwise continue without req.user */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const user = await findUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // invalid token — public handlers continue unauthenticated
    }
    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next();
  }
};

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Not authorized, no token' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const user = await findUserById(decoded.id);

      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};

/** Main Hub admin only - admin with no branch_id or branch_id = main hub */
export const hubAdminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff') && !req.user.branch_id) {
    next();
  } else if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, Main Hub only' });
  }
};

/** Sub-admin only - can access branch-scoped resources */
export const subAdminOrHigher = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff' || req.user.role === 'sub_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};


