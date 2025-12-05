import chalk from 'chalk';

export function listCommands(): void {
  console.log(chalk.cyan.bold('\n🚀 Hexa Framework CLI - Available Commands\n'));

  console.log(chalk.yellow('📦 Generate Commands:'));
  console.log(chalk.white('  hexa generate controller <name>  - Generate a new controller'));
  console.log(chalk.white('  hexa generate service <name>     - Generate a new service'));
  console.log(chalk.white('  hexa generate repository <name>  - Generate a new repository'));
  console.log(chalk.white('  hexa generate entity <name>      - Generate a new entity'));
  console.log(chalk.white('  hexa generate middleware <name>  - Generate a new middleware'));
  console.log(chalk.white('  hexa generate dto <name>         - Generate DTOs'));
  console.log(chalk.green('  hexa generate crud <name>        - Generate complete CRUD (⭐ Recommended)'));

  console.log(chalk.yellow('\n🗄️  Database Commands:'));
  console.log(chalk.white('  hexa db migrate              - Run database migrations'));
  console.log(chalk.white('  hexa db migrate:fresh        - Drop all tables and re-run migrations'));
  console.log(chalk.white('  hexa db migrate:reset        - Rollback and re-run all migrations'));
  console.log(chalk.white('  hexa db seed                 - Seed the database'));

  console.log(chalk.yellow('\n⚙️  Development Commands:'));
  console.log(chalk.white('  hexa serve                   - Start development server'));
  console.log(chalk.white('  hexa build                   - Build for production'));
  console.log(chalk.white('  hexa test                    - Run tests'));

  console.log(chalk.yellow('\n📚 Help:'));
  console.log(chalk.white('  hexa <command> --help        - Get help for a command'));
  console.log(chalk.white('  hexa list                    - Show this list\n'));

  console.log(chalk.blue('💡 Tips:'));
  console.log(chalk.white('  - Use shortcuts: hexa g c Product = hexa generate controller Product'));
  console.log(chalk.white('  - Run "hexa" without arguments for interactive mode'));
  console.log(chalk.white('  - Generate complete CRUD with: hexa g crud Product --fields name:string,price:number\n'));
}
