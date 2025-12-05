import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

export async function migrate(options: { seed?: boolean }) {
  const spinner = ora('Running migrations...').start();
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma migrate dev');
    
    if (stderr && !stderr.includes('warnings')) {
      spinner.fail('Migration failed');
      console.error(chalk.red(stderr));
      process.exit(1);
    }
    
    spinner.succeed('Migrations completed successfully');
    console.log(chalk.gray(stdout));
    
    if (options.seed) {
      await seed();
    }
  } catch (error: any) {
    spinner.fail('Migration failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function migrateFresh(options: { seed?: boolean }) {
  const spinner = ora('Dropping all tables and re-running migrations...').start();
  
  try {
    // Drop all tables and re-migrate
    await execAsync('npx prisma migrate reset --force --skip-seed');
    
    spinner.succeed('Database refreshed successfully');
    
    if (options.seed) {
      await seed();
    }
  } catch (error: any) {
    spinner.fail('Migration fresh failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function migrateReset(options: { seed?: boolean }) {
  const spinner = ora('Resetting database...').start();
  
  try {
    await execAsync('npx prisma migrate reset --force');
    
    spinner.succeed('Database reset successfully');
    
    if (options.seed) {
      await seed();
    }
  } catch (error: any) {
    spinner.fail('Migration reset failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function migrateRollback(options: { step?: number }) {
  console.log(chalk.yellow('⚠️  Prisma doesn\'t support rollback natively.'));
  console.log(chalk.gray('Consider using migrate:reset to reset all migrations.'));
  console.log(chalk.gray('Or manually revert the migration files and run migrate again.\n'));
}

export async function migrateStatus() {
  const spinner = ora('Checking migration status...').start();
  
  try {
    const { stdout } = await execAsync('npx prisma migrate status');
    spinner.succeed('Migration status:');
    console.log(stdout);
  } catch (error: any) {
    spinner.fail('Failed to check migration status');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function seed() {
  const spinner = ora('Seeding database...').start();
  
  try {
    const { stdout } = await execAsync('npx prisma db seed');
    spinner.succeed('Database seeded successfully');
    console.log(chalk.gray(stdout));
  } catch (error: any) {
    spinner.fail('Seeding failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
