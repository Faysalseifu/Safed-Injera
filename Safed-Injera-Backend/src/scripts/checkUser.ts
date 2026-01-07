import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import logger from '../utils/logger';

dotenv.config();

const checkUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI!);
    logger.info('Connected to MongoDB');
    logger.info(`Database name: ${mongoose.connection.db?.databaseName}`);

    // Find all users
    const allUsers = await User.find({});
    logger.info(`\nTotal users in database: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      logger.info(`\nUser ${index + 1}:`);
      logger.info(`  ID: ${user._id}`);
      logger.info(`  Username: ${user.username}`);
      logger.info(`  Email: ${user.email}`);
      logger.info(`  Role: ${user.role}`);
    });

    // Try to find admin user with different queries
    logger.info('\n--- Testing different queries ---');
    
    const byUsername = await User.findOne({ username: 'admin' });
    logger.info(`Find by username 'admin': ${byUsername ? 'FOUND' : 'NOT FOUND'}`);
    
    const byEmail = await User.findOne({ email: 'admin@safedinjera.com' });
    logger.info(`Find by email 'admin@safedinjera.com': ${byEmail ? 'FOUND' : 'NOT FOUND'}`);
    
    const byOr = await User.findOne({
      $or: [{ username: 'admin' }, { email: 'admin' }],
    });
    logger.info(`Find by $or username='admin' or email='admin': ${byOr ? 'FOUND' : 'NOT FOUND'}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error checking user:', error);
    process.exit(1);
  }
};

checkUser();

