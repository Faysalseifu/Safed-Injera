import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import {
  countUsers,
  createUser,
  findUserById,
  findUserByUsernameOrEmail,
} from '../repositories/userRepository';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
};

// @desc    Register a new admin user
// @route   POST /api/auth/register
// @access  Public (should be restricted in production)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required' });
      return;
    }

    const existingUserByUsername = await findUserByUsernameOrEmail(username);
    if (existingUserByUsername && existingUserByUsername.username === username) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    const existingUserByEmail = await findUserByUsernameOrEmail(email);
    if (existingUserByEmail && existingUserByEmail.email === email) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await createUser({
      id: randomUUID(),
      username,
      email,
      password: hashedPassword,
      role: role === 'staff' ? 'staff' : 'admin',
    });

    logger.info(`New user registered: ${username}`);
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    const user = await findUserByUsernameOrEmail(username);

    if (!user) {
      const userCount = await countUsers();
      logger.info(`No user matched credentials. Total users: ${userCount}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


