import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import logger from '../utils/logger';

dotenv.config();

const testLoginAPI = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI!);
    logger.info('Connected to MongoDB');

    // Simulate the exact login logic from the controller
    const username = 'admin';
    const password = 'admin123';

    logger.info(`Testing login with username: ${username}, password: ${password}`);

    // Find user by username or email (exact same query as controller)
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      logger.error('User not found!');
      const userCount = await User.countDocuments();
      logger.info(`Total users in database: ${userCount}`);
      process.exit(1);
    }

    logger.info(`User found: ${user.username} (ID: ${user._id})`);
    logger.info(`User email: ${user.email}`);
    logger.info(`Password hash: ${user.password.substring(0, 30)}...`);

    // Check password (exact same logic as controller)
    const isMatch = await bcrypt.compare(password, user.password);
    logger.info(`Password match: ${isMatch}`);

    if (!isMatch) {
      logger.error('Password does not match!');
      
      // Try to see what the actual password should be
      logger.info('Attempting to re-hash and compare...');
      const testHash = await bcrypt.hash(password, 10);
      logger.info(`New hash would be: ${testHash.substring(0, 30)}...`);
      
      // Try comparing with a fresh hash
      const testMatch = await bcrypt.compare(password, testHash);
      logger.info(`Test hash comparison: ${testMatch}`);
      
      process.exit(1);
    }

    logger.info('✅ Login test PASSED!');
    logger.info(`User: ${user.username}, Role: ${user.role}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error testing login:', error);
    process.exit(1);
  }
};

testLoginAPI();

