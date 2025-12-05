#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateResource } from './commands/generate';
import { scanPermissions } from './commands/permission';
import { verifyPermissions } from './commands/verify';
import { migrate, migrateFresh, migrateReset, migrateRollback, migrateStatus, seed } from './commands/migrate';
import { serve, build } from './commands/serve';
import { routeList, controllerList, middlewareList } from './commands/list';
import { makeController, makeService, makeRepository, makeEntity, makeMiddleware, makeDto } from './commands/make';

const program = new Command();

program
  .name('hexa')
  .description('🔷 Hexa Framework CLI - Like Laravel Artisan for TypeScript')
  .version('1.1.0');

// Generate command
program
  .command('generate')
  .alias('g')
  .description('Generate resource files (entity, repository, service, controller, etc.)')
  .argument('[resource-name]', 'Name of the resource to generate')
  .option('-t, --type <type>', 'Resource type (default: full)', 'full')
  .option('-d, --dir <directory>', 'Target directory', 'src')
  .action(async (resourceName, options) => {
    try {
      await generateResource(resourceName, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Make commands (Like Laravel Artisan)
program
  .command('make:controller <name>')
  .description('Create a new controller class')
  .option('-r, --resource', 'Generate a resource controller with CRUD methods')
  .action(async (name, options) => {
    try {
      await makeController(name, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('make:service <name>')
  .description('Create a new service class')
  .action(async (name) => {
    try {
      await makeService(name);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('make:repository <name>')
  .description('Create a new repository class')
  .action(async (name) => {
    try {
      await makeRepository(name);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('make:entity <name>')
  .description('Create a new entity class')
  .action(async (name) => {
    try {
      await makeEntity(name);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('make:middleware <name>')
  .description('Create a new middleware function')
  .action(async (name) => {
    try {
      await makeMiddleware(name);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('make:dto <name>')
  .description('Create a new DTO (Data Transfer Object) class')
  .action(async (name) => {
    try {
      await makeDto(name);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Permission commands
const permissionCommand = program
  .command('permission')
  .alias('perm')
  .description('Permission-related commands');

permissionCommand
  .command('scan')
  .description('Scan routers and generate permissions.json')
  .option('-o, --output <file>', 'Output file path', 'permissions.json')
  .action(async (options) => {
    try {
      await scanPermissions(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

permissionCommand
  .command('verify')
  .description('Verify permission coverage on all endpoints')
  .action(async () => {
    try {
      await verifyPermissions();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Database Migration Commands
program
  .command('migrate')
  .description('Run database migrations')
  .option('-s, --seed', 'Seed the database after migrations')
  .action(async (options) => {
    try {
      await migrate(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('migrate:fresh')
  .description('Drop all tables and re-run all migrations')
  .option('-s, --seed', 'Seed the database after migrations')
  .action(async (options) => {
    try {
      await migrateFresh(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('migrate:reset')
  .description('Reset and re-run all migrations')
  .option('-s, --seed', 'Seed the database after migrations')
  .action(async (options) => {
    try {
      await migrateReset(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('migrate:rollback')
  .description('Rollback the last database migration')
  .option('--step <number>', 'Number of migrations to rollback', '1')
  .action(async (options) => {
    try {
      await migrateRollback(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('migrate:status')
  .description('Show the status of each migration')
  .action(async () => {
    try {
      await migrateStatus();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('db:seed')
  .description('Seed the database with records')
  .action(async () => {
    try {
      await seed();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Serve Command
program
  .command('serve')
  .description('Start the development server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-h, --host <host>', 'Host to run the server on', 'localhost')
  .option('--no-watch', 'Disable file watching')
  .action(async (options) => {
    try {
      await serve(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Build Command
program
  .command('build')
  .description('Build the project for production')
  .option('--production', 'Build for production')
  .action(async (options) => {
    try {
      await build(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// List Commands
program
  .command('route:list')
  .alias('routes')
  .description('List all registered routes')
  .action(async () => {
    try {
      await routeList();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('controller:list')
  .alias('controllers')
  .description('List all controllers')
  .action(async () => {
    try {
      await controllerList();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('middleware:list')
  .alias('middleware')
  .description('List all middleware')
  .action(async () => {
    try {
      await middlewareList();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .alias('about')
  .description('Display framework information')
  .action(() => {
    console.log(chalk.cyan.bold('\n🔷 Hexa Framework'));
    console.log(chalk.gray('Hexagonal Architecture TypeScript Framework'));
    console.log(chalk.gray('Like Laravel Artisan for TypeScript'));
    console.log(chalk.gray('by lutfian.rhdn\n'));
    console.log(chalk.white('Version:'), '1.1.0');
    console.log(chalk.white('License:'), 'MIT\n');
    console.log(chalk.white.bold('Available Commands:\n'));
    console.log(chalk.green('Generation:'));
    console.log('  hexa generate <name>       - Generate complete resource (CRUD)');
    console.log('  hexa g <name>              - Alias for generate\n');
    console.log(chalk.green('Make (Like Artisan):'));
    console.log('  hexa make:controller <name>   - Create a new controller');
    console.log('  hexa make:controller <name> -r - Create a resource controller');
    console.log('  hexa make:service <name>      - Create a new service');
    console.log('  hexa make:repository <name>   - Create a new repository');
    console.log('  hexa make:entity <name>       - Create a new entity');
    console.log('  hexa make:middleware <name>   - Create a new middleware');
    console.log('  hexa make:dto <name>          - Create a new DTO\n');
    console.log(chalk.green('Database:'));
    console.log('  hexa migrate               - Run database migrations');
    console.log('  hexa migrate:fresh         - Drop all tables and re-migrate');
    console.log('  hexa migrate:reset         - Reset all migrations');
    console.log('  hexa migrate:status        - Show migration status');
    console.log('  hexa db:seed               - Seed the database\n');
    console.log(chalk.green('Development:'));
    console.log('  hexa serve                 - Start development server');
    console.log('  hexa build                 - Build for production\n');
    console.log(chalk.green('Information:'));
    console.log('  hexa route:list            - List all routes');
    console.log('  hexa controller:list       - List all controllers');
    console.log('  hexa middleware:list       - List all middleware\n');
    console.log(chalk.green('Permissions:'));
    console.log('  hexa permission scan       - Scan and generate permissions');
    console.log('  hexa permission verify     - Verify permission coverage\n');
    console.log(chalk.gray('Run "hexa <command> --help" for more information on a command.\n'));
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
