import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { logSuccess, logError } from '../../utils/file-helpers';

export async function runMigration(options: any): Promise<void> {
  try {
    console.log(chalk.cyan('\n🗄️  Running Database Migration...\n'));
    
    const spinner = ora('Generating Prisma client...').start();
    execSync('npx prisma generate', { stdio: 'inherit' });
    spinner.succeed('Prisma client generated');

    const migrationName = options.name || 'migration';
    const migrateSpinner = ora(`Running migration: ${migrationName}...`).start();
    execSync(`npx prisma migrate dev --name ${migrationName}`, { stdio: 'inherit' });
    migrateSpinner.succeed('Migration completed');

    logSuccess('Database migration successful!');
  } catch (error: any) {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

export async function runMigrationFresh(options: any): Promise<void> {
  try {
    console.log(chalk.cyan('\n🗄️  Refreshing Database...\n'));
    console.log(chalk.red('⚠️  WARNING: This will delete all data!\n'));

    const spinner = ora('Resetting database...').start();
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    spinner.succeed('Database reset complete');

    logSuccess('Database refreshed successfully!');
  } catch (error: any) {
    logError(`Migration fresh failed: ${error.message}`);
    process.exit(1);
  }
}

export async function runMigrationReset(options: any): Promise<void> {
  try {
    console.log(chalk.cyan('\n🗄️  Resetting Migrations...\n'));

    const spinner = ora('Resetting migrations...').start();
    execSync('npx prisma migrate reset', { stdio: 'inherit' });
    spinner.succeed('Migrations reset complete');

    logSuccess('Migrations reset successfully!');
  } catch (error: any) {
    logError(`Migration reset failed: ${error.message}`);
    process.exit(1);
  }
}

export async function runSeeder(options: any): Promise<void> {
  try {
    console.log(chalk.cyan('\n🌱 Seeding Database...\n'));

    const spinner = ora('Running database seeder...').start();
    execSync('npx prisma db seed', { stdio: 'inherit' });
    spinner.succeed('Database seeded');

    logSuccess('Database seeding completed!');
  } catch (error: any) {
    logError(`Seeding failed: ${error.message}`);
    console.log(chalk.yellow('\n💡 Make sure you have a seed script in package.json:'));
    console.log(chalk.white('   "prisma": { "seed": "ts-node prisma/seed.ts" }\n'));
    process.exit(1);
  }
}
