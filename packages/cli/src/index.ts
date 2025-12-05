#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateResource } from './commands/generate';
import { scanPermissions } from './commands/permission';
import { verifyPermissions } from './commands/verify';

const program = new Command();

program
  .name('hexa')
  .description('Hexa Framework CLI - Code generation and scaffolding tool')
  .version('1.0.0');

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

// Info command
program
  .command('info')
  .description('Display framework information')
  .action(() => {
    console.log(chalk.cyan.bold('\n🔷 Hexa Framework'));
    console.log(chalk.gray('Hexagonal Architecture TypeScript Framework'));
    console.log(chalk.gray('by lutfian.rhdn\n'));
    console.log(chalk.white('Version:'), '1.0.0');
    console.log(chalk.white('License:'), 'MIT\n');
    console.log(chalk.white('Commands:'));
    console.log('  hexa generate <name>  - Generate resource files');
    console.log('  hexa permission scan  - Scan and generate permissions');
    console.log('  hexa permission verify - Verify permission coverage');
    console.log('  hexa info             - Display this information\n');
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
