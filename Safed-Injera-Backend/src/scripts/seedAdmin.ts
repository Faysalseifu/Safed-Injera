import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import logger from '../utils/logger';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI!);
    logger.info('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      logger.info('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@safedinjera.com',
      password: hashedPassword,
      role: 'admin',
    });

    logger.info('Default admin user created successfully!');
    logger.info('Username: admin');
    logger.info('Password: admin123');
    logger.info('Email: admin@safedinjera.com');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();

