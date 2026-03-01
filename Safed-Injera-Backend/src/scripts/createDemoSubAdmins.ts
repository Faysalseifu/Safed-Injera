import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { createUser, findUserByUsernameOrEmail } from '../repositories/userRepository';
import { createBranch, getAllBranches } from '../repositories/branchRepository';
import logger from '../utils/logger';

dotenv.config();

interface DemoAccount {
  email: string;
  username: string;
  password: string;
  branchName: string;
  location: string;
}

const demoAccounts: DemoAccount[] = [
  {
    email: 'betel@safed.org',
    username: 'betel',
    password: 'betel123',
    branchName: 'Betel Branch',
    location: 'Betel, Addis Ababa',
  },
  {
    email: 'atenatera@safed.org',
    username: 'atenatera',
    password: 'atenatera123',
    branchName: 'Atenatera Branch',
    location: 'Atenatera, Addis Ababa',
  },
  {
    email: 'winget@safed.org',
    username: 'winget',
    password: 'winget123',
    branchName: 'Winget Branch',
    location: 'Winget, Addis Ababa',
  },
];

async function createDemoSubAdmins() {
  try {
    logger.info('Starting demo sub-admin account creation...');

    for (const account of demoAccounts) {
      try {
        // Check if branch already exists (by name)
        const existingBranches = await getAllBranches();
        let branch = existingBranches.find((b) => b.name === account.branchName);

        // Create branch if it doesn't exist
        if (!branch) {
          logger.info(`Creating branch: ${account.branchName}`);
          branch = await createBranch({
            name: account.branchName,
            location: account.location,
            is_main_hub: false,
          });
          logger.info(`✓ Branch created: ${branch.id} - ${branch.name}`);
        } else {
          logger.info(`Branch already exists: ${branch.name} (${branch.id})`);
        }

        // Check if user already exists
        const existingUser = await findUserByUsernameOrEmail(account.email);
        
        if (existingUser) {
          logger.warn(`User already exists: ${account.email} - Skipping`);
          continue;
        }

        // Create sub-admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(account.password, salt);

        const user = await createUser({
          id: randomUUID(),
          username: account.username,
          email: account.email,
          password: hashedPassword,
          role: 'sub_admin',
          branch_id: branch.id,
        });

        logger.info(`✓ Sub-admin created: ${user.username} (${user.email})`);
        logger.info(`  Branch: ${branch.name} (${branch.id})`);
        logger.info(`  Password: ${account.password}`);
        logger.info('');
      } catch (error: any) {
        logger.error(`Error creating account for ${account.email}:`, error.message);
      }
    }

    logger.info('Demo sub-admin account creation completed!');
    logger.info('\n=== Summary ===');
    logger.info('You can now login with:');
    demoAccounts.forEach((acc) => {
      logger.info(`  Email: ${acc.email}`);
      logger.info(`  Password: ${acc.password}`);
      logger.info('');
    });
  } catch (error) {
    logger.error('Failed to create demo sub-admins:', error);
    process.exit(1);
  }
}


// Run if executed directly
if (require.main === module) {
  createDemoSubAdmins()
    .then(() => {
      logger.info('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Script failed:', error);
      process.exit(1);
    });
}

export { createDemoSubAdmins };
