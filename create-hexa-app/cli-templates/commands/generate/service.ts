import chalk from 'chalk';

export async function generateService(name: string, options: any): Promise<void> {
  console.log(chalk.cyan(`\n⚙️  Generating Service: ${name}`));
  console.log(chalk.yellow('Use: hexa generate crud ${name} - for complete CRUD generation\n'));
}

export async function generateRepository(name: string, options: any): Promise<void> {
  console.log(chalk.cyan(`\n📦 Generating Repository: ${name}`));
  console.log(chalk.yellow('Use: hexa generate crud ${name} - for complete CRUD generation\n'));
}

export async function generateEntity(name: string, options: any): Promise<void> {
  console.log(chalk.cyan(`\n📝 Generating Entity: ${name}`));
  console.log(chalk.yellow('Use: hexa generate crud ${name} - for complete CRUD generation\n'));
}

export async function generateMiddleware(name: string, options: any): Promise<void> {
  console.log(chalk.cyan(`\n🔒 Generating Middleware: ${name}`));
  console.log(chalk.yellow('Feature coming soon! Use custom middleware for now.\n'));
}

export async function generateDto(name: string, options: any): Promise<void> {
  console.log(chalk.cyan(`\n📋 Generating DTO: ${name}`));
  console.log(chalk.yellow('Use: hexa generate crud ${name} - for complete CRUD generation\n'));
}
