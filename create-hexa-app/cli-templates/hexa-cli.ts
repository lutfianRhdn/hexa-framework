#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateController } from './commands/generate/controller';
import { generateService } from './commands/generate/service';
import { generateRepository } from './commands/generate/repository';
import { generateEntity } from './commands/generate/entity';
import { generateMiddleware } from './commands/generate/middleware';
import { generateDto } from './commands/generate/dto';
import { generateCrud } from './commands/generate/crud';
import { runMigration } from './commands/db/migrate';
import { runMigrationFresh } from './commands/db/migrate-fresh';
import { runMigrationReset } from './commands/db/migrate-reset';
import { runSeeder } from './commands/db/seed';
import { serveApp } from './commands/serve';
import { buildApp } from './commands/build';
import { testApp } from './commands/test';
import { listCommands } from './commands/list';

const program = new Command();

program
  .name('hexa')
  .description('🚀 Hexa Framework CLI - Powerful development tools')
  .version('2.0.0');

// Generate commands
const generate = program
  .command('generate')
  .alias('g')
  .description('Generate new resources');

generate
  .command('controller <name>')
  .alias('c')
  .description('Generate a new controller')
  .option('-r, --resource <name>', 'Resource name (singular)')
  .option('-t, --template <type>', 'Template: rest, graphql, websocket')
  .action(generateController);

generate
  .command('service <name>')
  .alias('s')
  .description('Generate a new service')
  .option('-r, --resource <name>', 'Resource name (singular)')
  .action(generateService);

generate
  .command('repository <name>')
  .alias('repo')
  .description('Generate a new repository')
  .option('-r, --resource <name>', 'Resource name (singular)')
  .option('-d, --database <type>', 'Database: postgresql, mysql, mongodb, sqlite')
  .action(generateRepository);

generate
  .command('entity <name>')
  .alias('e')
  .description('Generate a new entity')
  .option('-f, --fields <fields>', 'Fields (comma-separated: name:type,email:string)')
  .action(generateEntity);

generate
  .command('middleware <name>')
  .alias('m')
  .description('Generate a new middleware')
  .option('-t, --type <type>', 'Middleware type: auth, validation, error, logging')
  .action(generateMiddleware);

generate
  .command('dto <name>')
  .alias('d')
  .description('Generate DTO (Data Transfer Objects)')
  .option('-f, --fields <fields>', 'Fields (comma-separated: name:type,email:string)')
  .action(generateDto);

generate
  .command('crud <name>')
  .description('Generate complete CRUD (Entity, Repository, Service, Controller, DTO, Router)')
  .option('-f, --fields <fields>', 'Fields (comma-separated: name:type,email:string)')
  .option('-t, --transport <type>', 'Transport: rest, graphql, websocket')
  .option('-d, --database <type>', 'Database: postgresql, mysql, mongodb, sqlite')
  .action(generateCrud);

// Database commands
const db = program
  .command('db')
  .description('Database management commands');

db
  .command('migrate')
  .description('Run database migrations')
  .option('-n, --name <name>', 'Migration name')
  .action(runMigration);

db
  .command('migrate:fresh')
  .description('Drop all tables and re-run migrations')
  .action(runMigrationFresh);

db
  .command('migrate:reset')
  .description('Rollback and re-run all migrations')
  .action(runMigrationReset);

db
  .command('seed')
  .description('Seed the database')
  .option('-c, --class <name>', 'Seeder class name')
  .action(runSeeder);

// Utility commands
program
  .command('serve')
  .alias('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-w, --watch', 'Watch for file changes', true)
  .action(serveApp);

program
  .command('build')
  .description('Build the application for production')
  .option('--clean', 'Clean dist folder before build')
  .action(buildApp);

program
  .command('test')
  .description('Run tests')
  .option('-w, --watch', 'Watch mode')
  .option('-c, --coverage', 'Generate coverage report')
  .action(testApp);

program
  .command('list')
  .description('List all available commands')
  .action(listCommands);

// Interactive mode when no arguments
if (!process.argv.slice(2).length) {
  (async () => {
    console.log(chalk.blue.bold('\n🚀 Hexa Framework CLI\n'));
    
    const { command } = await inquirer.prompt([
      {
        type: 'list',
        name: 'command',
        message: 'What would you like to do?',
        choices: [
          { name: '🏗️  Generate Controller', value: 'generate:controller' },
          { name: '⚙️  Generate Service', value: 'generate:service' },
          { name: '📦 Generate Repository', value: 'generate:repository' },
          { name: '📝 Generate Entity', value: 'generate:entity' },
          { name: '🔒 Generate Middleware', value: 'generate:middleware' },
          { name: '📋 Generate DTO', value: 'generate:dto' },
          { name: '🚀 Generate Complete CRUD', value: 'generate:crud' },
          { name: '🗄️  Run Migrations', value: 'db:migrate' },
          { name: '🌱 Seed Database', value: 'db:seed' },
          { name: '▶️  Start Dev Server', value: 'serve' },
          { name: '🔨 Build for Production', value: 'build' },
          { name: '📚 List All Commands', value: 'list' }
        ]
      }
    ]);

    // Execute selected command
    switch (command) {
      case 'generate:controller':
        const { controllerName } = await inquirer.prompt([
          { type: 'input', name: 'controllerName', message: 'Controller name:' }
        ]);
        await generateController(controllerName, {});
        break;
      case 'generate:crud':
        const { crudName } = await inquirer.prompt([
          { type: 'input', name: 'crudName', message: 'Resource name:' }
        ]);
        await generateCrud(crudName, {});
        break;
      case 'serve':
        await serveApp({});
        break;
      case 'list':
        listCommands();
        break;
      default:
        console.log(chalk.yellow('Command not implemented yet'));
    }
  })();
} else {
  program.parse(process.argv);
}
