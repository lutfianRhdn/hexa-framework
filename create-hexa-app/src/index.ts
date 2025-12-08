#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { promptProjectConfig } from './prompts';
import { generatePackageJson } from './generators/packageJson';
import { generateBaseStructure } from './generators/base';
import { generateAdaptersConfig } from './generators/adapters';
import { generateEmptyTemplate } from './generators/auth/empty';
import { generateBasicAuth } from './generators/auth/basic';
import { generateFullAuth } from './generators/auth/full';
import { generateRestTransport } from './generators/transports/rest';
import { generateGraphQLTransport } from './generators/transports/graphql';
import { generateWebSocketTransport } from './generators/transports/websocket';
import { generateMainIndex } from './generators/mainIndex';
import { generateReadme } from './generators/readme';
import { GeneratorContext } from './types';

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('create-hexa-app')
  .description('Create a new Hexa Framework project with customizable templates')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project')
  .option('-t, --template <type>', 'Project template: empty, basic-auth, or full-auth')
  .option('-a, --adapters <types>', 'Adapters (comma-separated): prisma, typeorm, mongoose, redis')
  .option('-r, --transports <types>', 'Transports (comma-separated): rest, graphql, websocket')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async (projectName?: string, options?: any) => {
    console.log(chalk.blue.bold('\n🚀 Welcome to Hexa Framework v2.0!\n'));

    try {
      if (!projectName) {
        const answers = await inquirer.prompt([{
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-hexa-app',
          validate: (input: string) => {
            if (!input || input.length === 0) return 'Project name cannot be empty';
            if (!/^[a-z0-9-]+$/.test(input)) return 'Project name can only contain lowercase letters, numbers, and hyphens';
            return true;
          }
        }]);
        projectName = answers.projectName;
      }

      if (!projectName) {
        console.log(chalk.red('\n❌ Project name is required!\n'));
        process.exit(1);
      }

      const projectPath = path.join(process.cwd(), projectName);
      if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`\n❌ Directory ${projectName} already exists!\n`));
        process.exit(1);
      }

      // Use CLI options or prompt interactively
      let config;
      if (options?.template && options?.adapters && options?.transports) {
        // Non-interactive mode
        config = {
          name: projectName,
          template: options.template as any,
          adapters: options.adapters.split(',').map((t: string) => t.trim()) as any[],
          transports: options.transports.split(',').map((t: string) => t.trim()) as any[]
        };
      } else {
        // Interactive mode
        config = await promptProjectConfig(projectName);
      }

      console.log(chalk.cyan('\n📋 Configuration Summary:'));
      console.log(chalk.gray(`  Template: ${chalk.white(config.template)}`));
      console.log(chalk.gray(`  Adapters: ${chalk.white(config.adapters.join(', '))}`));
      console.log(chalk.gray(`  Transports: ${chalk.white(config.transports.join(', '))}\n`));

      if (!options?.yes) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: 'Proceed with this configuration?',
          default: true
        }]);

        if (!confirm) {
          console.log(chalk.yellow('\n⚠️  Project creation cancelled.\n'));
          process.exit(0);
        }
      }

      await fs.ensureDir(projectPath);
      const srcPath = path.join(projectPath, 'src');
      const ctx: GeneratorContext = { config, projectPath, srcPath };

      console.log(chalk.cyan('\n📦 Generating project files...\n'));

      let spinner = ora('Creating base structure').start();
      await generateBaseStructure(ctx);
      spinner.succeed('Base structure created');

      spinner = ora('Generating package.json').start();
      await generatePackageJson(ctx);
      spinner.succeed('package.json generated');

      spinner = ora('Configuring adapters').start();
      await generateAdaptersConfig(ctx);
      spinner.succeed('Adapters configured');

      if (config.template === 'empty') {
        spinner = ora('Setting up empty template').start();
        await generateEmptyTemplate(ctx);
        spinner.succeed('Empty template ready');
      } else if (config.template === 'basic-auth') {
        spinner = ora('Generating authentication system').start();
        await generateBasicAuth(ctx);
        spinner.succeed('Authentication system generated');
      } else if (config.template === 'full-auth') {
        spinner = ora('Generating full auth + RBAC system').start();
        await generateFullAuth(ctx);
        spinner.succeed('Full auth + RBAC system generated');
      }

      for (const transport of config.transports) {
        if (transport === 'rest') {
          spinner = ora('Generating REST API').start();
          await generateRestTransport(ctx);
          spinner.succeed('REST API generated');
        } else if (transport === 'graphql') {
          spinner = ora('Generating GraphQL API').start();
          await generateGraphQLTransport(ctx);
          spinner.succeed('GraphQL API generated');
        } else if (transport === 'websocket') {
          spinner = ora('Generating WebSocket server').start();
          await generateWebSocketTransport(ctx);
          spinner.succeed('WebSocket server generated');
        }
      }

      spinner = ora('Generating main entry point').start();
      await generateMainIndex(ctx);
      spinner.succeed('Main entry point generated');

      spinner = ora('Generating README').start();
      await generateReadme(ctx);
      spinner.succeed('README generated');

      spinner = ora('Setting up Hexa CLI').start();
      const { generateHexaCLI } = await import('./generators/cli');
      await generateHexaCLI(ctx);
      spinner.succeed('Hexa CLI configured');

      console.log(chalk.cyan('\n📥 Installing dependencies...\n'));
      spinner = ora('Installing npm packages (this may take a while)').start();

      try {
        execSync('npm install', { cwd: projectPath, stdio: 'ignore' });
        spinner.succeed('Dependencies installed');
      } catch (error) {
        spinner.fail('Failed to install dependencies');
        console.log(chalk.yellow(`⚠️  You can install them manually: cd ${projectName} && npm install\n`));
      }

      console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
      console.log(chalk.cyan('📂 Next steps:\n'));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white('  npx prisma generate'));
      console.log(chalk.white('  npx prisma migrate dev --name init'));
      console.log(chalk.white('  npm run dev\n'));
      console.log(chalk.blue('🎉 Happy coding!\n'));

    } catch (error: any) {
      console.error(chalk.red('\n❌ Error:'), error.message || error);
      process.exit(1);
    }
  });

program.parse(process.argv);
