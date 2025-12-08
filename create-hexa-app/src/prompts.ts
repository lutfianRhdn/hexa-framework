import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProjectConfig, ProjectTemplate, AdapterType, TransportType } from './types';

export async function promptProjectConfig(projectName: string): Promise<ProjectConfig> {
  console.log(chalk.blue('\n🚀 Welcome to Hexa Framework v2.0!\n'));
  console.log(chalk.gray('Let\'s configure your project...\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Select project template:',
      choices: [
        {
          name: chalk.cyan('Empty Project') + chalk.gray(' - Minimal boilerplate with no auth'),
          value: 'empty'
        },
        {
          name: chalk.yellow('Basic Auth') + chalk.gray(' - User entity + JWT authentication'),
          value: 'basic-auth'
        },
        {
          name: chalk.green('Full Auth + Permission') + chalk.gray(' - Complete RBAC system with roles and permissions'),
          value: 'full-auth'
        }
      ],
      default: 'basic-auth'
    },
    {
      type: 'checkbox',
      name: 'adapters',
      message: 'Select data adapters (Space to select):',
      choices: [
        {
          name: chalk.blue('Prisma') + chalk.gray(' - Modern ORM (PostgreSQL, MySQL, SQLite)'),
          value: 'prisma',
          checked: true
        },
        {
          name: chalk.cyan('TypeORM') + chalk.gray(' - Traditional ORM'),
          value: 'typeorm'
        },
        {
          name: chalk.green('Mongoose') + chalk.gray(' - MongoDB ODM'),
          value: 'mongoose'
        },
        {
          name: chalk.red('Redis') + chalk.gray(' - In-memory data store'),
          value: 'redis'
        }
      ],
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must choose at least one adapter.';
        }
        return true;
      }
    },
    {
      type: 'checkbox',
      name: 'transports',
      message: 'Select transport layers (Space to select):',
      choices: [
        {
          name: chalk.blue('REST API') + chalk.gray(' - Traditional HTTP REST endpoints'),
          value: 'rest',
          checked: true
        },
        {
          name: chalk.magenta('GraphQL') + chalk.gray(' - Query language for your API'),
          value: 'graphql'
        },
        {
          name: chalk.yellow('WebSocket') + chalk.gray(' - Real-time bidirectional communication'),
          value: 'websocket'
        }
      ],
      validate: (answer: string[]) => {
        if (answer.length < 1) {
          return 'You must choose at least one transport layer.';
        }
        return true;
      }
    }
  ]);

  console.log(chalk.gray('\n📋 Project Configuration:'));
  console.log(chalk.gray('  Name:       ') + chalk.white(projectName));
  console.log(chalk.gray('  Template:   ') + chalk.white(answers.template));
  console.log(chalk.gray('  Adapters:   ') + chalk.white(answers.adapters.join(', ')));
  console.log(chalk.gray('  Transports: ') + chalk.white(answers.transports.join(', ')));
  console.log();

  return {
    name: projectName,
    template: answers.template as ProjectTemplate,
    adapters: answers.adapters as AdapterType[],
    transports: answers.transports as TransportType[]
  };
}
