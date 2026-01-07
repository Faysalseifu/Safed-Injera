import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import logger from '../utils/logger';

dotenv.config();

const testLogin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI!);
    logger.info('Connected to MongoDB');

    // Find admin user
    const user = await User.findOne({
      $or: [{ username: 'admin' }, { email: 'admin' }],
    });

    if (!user) {
      logger.error('Admin user not found!');
      process.exit(1);
    }

    logger.info('Found user:');
    logger.info(`  Username: ${user.username}`);
    logger.info(`  Email: ${user.email}`);
    logger.info(`  Role: ${user.role}`);
    logger.info(`  Password hash: ${user.password.substring(0, 20)}...`);

    // Test password
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    logger.info(`\nTesting password: ${testPassword}`);
    logger.info(`Password match: ${isMatch}`);

    if (!isMatch) {
      logger.error('Password does not match!');
      logger.info('Creating new password hash...');
      
      // Re-hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      // Update user
      user.password = hashedPassword;
      await user.save();
      
      logger.info('Password updated successfully!');
      
      // Test again
      const isMatchAfter = await bcrypt.compare(testPassword, user.password);
      logger.info(`Password match after update: ${isMatchAfter}`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error testing login:', error);
    process.exit(1);
  }
};

testLogin();

