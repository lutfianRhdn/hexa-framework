import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProjectConfig, ProjectTemplate, DatabaseType, TransportType } from './types';

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
      type: 'list',
      name: 'database',
      message: 'Select database:',
      choices: [
        {
          name: chalk.blue('PostgreSQL') + chalk.gray(' - Powerful, open source object-relational database'),
          value: 'postgresql'
        },
        {
          name: chalk.cyan('MySQL') + chalk.gray(' - Popular open-source relational database'),
          value: 'mysql'
        },
        {
          name: chalk.green('MongoDB') + chalk.gray(' - NoSQL document database'),
          value: 'mongodb'
        },
        {
          name: chalk.magenta('SQLite') + chalk.gray(' - Lightweight, file-based database'),
          value: 'sqlite'
        }
      ],
      default: 'postgresql'
    },
    {
      type: 'checkbox',
      name: 'transports',
      message: 'Select transport layers (Space to select, Enter to confirm):',
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
  console.log(chalk.gray('  Database:   ') + chalk.white(answers.database));
  console.log(chalk.gray('  Transports: ') + chalk.white(answers.transports.join(', ')));
  console.log();

  return {
    name: projectName,
    template: answers.template as ProjectTemplate,
    database: answers.database as DatabaseType,
    transports: answers.transports as TransportType[]
  };
}
