import chalk from 'chalk';

export async function scanPermissions(options: { output: string }): Promise<void> {
  console.log(chalk.cyan('\n🔍 Scanning permissions from routers...\n'));
  console.log(chalk.yellow('This feature will be available in future versions.'));
  console.log(chalk.gray(`Output file: ${options.output}\n`));
}
