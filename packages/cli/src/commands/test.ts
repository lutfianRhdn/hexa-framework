import { Command } from 'commander';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Run all tests
 */
export async function runTests(options: { watch?: boolean; coverage?: boolean; verbose?: boolean; filter?: string }) {
  const spinner = ora('Running tests...').start();

  try {
    // Check if test framework is installed
    const packageJson = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJson)) {
      spinner.fail('No package.json found. Run this command from your project root.');
      return;
    }

    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const hasJest = pkg.dependencies?.jest || pkg.devDependencies?.jest;
    const hasVitest = pkg.dependencies?.vitest || pkg.devDependencies?.vitest;

    if (!hasJest && !hasVitest) {
      spinner.warn('No test framework detected. Installing Jest...');
      spinner.text = 'Installing Jest and dependencies...';
      
      try {
        execSync('npm install --save-dev jest @types/jest ts-jest', { stdio: 'inherit' });
        
        // Create Jest config if it doesn't exist
        const jestConfig = path.join(process.cwd(), 'jest.config.js');
        if (!fs.existsSync(jestConfig)) {
          fs.writeFileSync(jestConfig, `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
`);
          console.log(chalk.green('✓ Created jest.config.js'));
        }

        spinner.succeed('Jest installed successfully!');
      } catch (error) {
        spinner.fail('Failed to install Jest');
        console.error(error);
        return;
      }
    }

    spinner.stop();

    // Build test command
    const framework = hasVitest ? 'vitest' : 'jest';
    let testCmd = framework;
    
    if (options.watch) {
      testCmd += ' --watch';
    }
    
    if (options.coverage) {
      testCmd += framework === 'jest' ? ' --coverage' : ' --coverage';
    }
    
    if (options.verbose) {
      testCmd += ' --verbose';
    }
    
    if (options.filter) {
      testCmd += ` --testNamePattern="${options.filter}"`;
    }

    console.log(chalk.blue(`\n🧪 Running: ${testCmd}\n`));

    // Run tests
    const child = spawn(testCmd, [], { 
      shell: true, 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✓ All tests passed!'));
      } else {
        console.log(chalk.red(`\n✗ Tests failed with exit code ${code}`));
        process.exit(code || 1);
      }
    });

  } catch (error) {
    spinner.fail('Failed to run tests');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Run unit tests only
 */
export async function runUnitTests(options: { watch?: boolean; coverage?: boolean; verbose?: boolean }) {
  console.log(chalk.blue('🧪 Running unit tests...\n'));

  const spinner = ora('Searching for unit tests...').start();

  try {
    // Check if test framework is installed
    const packageJson = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const hasVitest = pkg.dependencies?.vitest || pkg.devDependencies?.vitest;
    const framework = hasVitest ? 'vitest' : 'jest';

    spinner.stop();

    // Build test command for unit tests
    let testCmd = framework;
    
    if (framework === 'jest') {
      testCmd += ' --testPathPattern="(unit|spec)"';
    } else {
      testCmd += ' run --testPathPattern="(unit|spec)"';
    }
    
    if (options.watch) {
      testCmd += ' --watch';
    }
    
    if (options.coverage) {
      testCmd += ' --coverage';
    }
    
    if (options.verbose) {
      testCmd += ' --verbose';
    }

    console.log(chalk.blue(`Running: ${testCmd}\n`));

    // Run tests
    const child = spawn(testCmd, [], { 
      shell: true, 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✓ Unit tests passed!'));
      } else {
        console.log(chalk.red(`\n✗ Unit tests failed with exit code ${code}`));
        process.exit(code || 1);
      }
    });

  } catch (error) {
    spinner.fail('Failed to run unit tests');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Run integration tests only
 */
export async function runIntegrationTests(options: { watch?: boolean; coverage?: boolean; verbose?: boolean }) {
  console.log(chalk.blue('🧪 Running integration tests...\n'));

  const spinner = ora('Searching for integration tests...').start();

  try {
    // Check if test framework is installed
    const packageJson = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const hasVitest = pkg.dependencies?.vitest || pkg.devDependencies?.vitest;
    const framework = hasVitest ? 'vitest' : 'jest';

    spinner.stop();

    // Build test command for integration tests
    let testCmd = framework;
    
    if (framework === 'jest') {
      testCmd += ' --testPathPattern="integration"';
    } else {
      testCmd += ' run --testPathPattern="integration"';
    }
    
    if (options.watch) {
      testCmd += ' --watch';
    }
    
    if (options.coverage) {
      testCmd += ' --coverage';
    }
    
    if (options.verbose) {
      testCmd += ' --verbose';
    }

    console.log(chalk.blue(`Running: ${testCmd}\n`));

    // Run tests
    const child = spawn(testCmd, [], { 
      shell: true, 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✓ Integration tests passed!'));
      } else {
        console.log(chalk.red(`\n✗ Integration tests failed with exit code ${code}`));
        process.exit(code || 1);
      }
    });

  } catch (error) {
    spinner.fail('Failed to run integration tests');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Run end-to-end tests
 */
export async function runE2ETests(options: { watch?: boolean; coverage?: boolean; verbose?: boolean }) {
  console.log(chalk.blue('🧪 Running E2E tests...\n'));

  const spinner = ora('Searching for E2E tests...').start();

  try {
    // Check if test framework is installed
    const packageJson = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const hasVitest = pkg.dependencies?.vitest || pkg.devDependencies?.vitest;
    const framework = hasVitest ? 'vitest' : 'jest';

    spinner.stop();

    // Build test command for e2e tests
    let testCmd = framework;
    
    if (framework === 'jest') {
      testCmd += ' --testPathPattern="e2e"';
    } else {
      testCmd += ' run --testPathPattern="e2e"';
    }
    
    if (options.watch) {
      testCmd += ' --watch';
    }
    
    if (options.coverage) {
      testCmd += ' --coverage';
    }
    
    if (options.verbose) {
      testCmd += ' --verbose';
    }

    console.log(chalk.blue(`Running: ${testCmd}\n`));

    // Run tests
    const child = spawn(testCmd, [], { 
      shell: true, 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✓ E2E tests passed!'));
      } else {
        console.log(chalk.red(`\n✗ E2E tests failed with exit code ${code}`));
        process.exit(code || 1);
      }
    });

  } catch (error) {
    spinner.fail('Failed to run E2E tests');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Register test commands
 */
export function registerTestCommands(program: Command) {
  // Main test command
  program
    .command('test')
    .description('Run all tests')
    .option('-w, --watch', 'Run tests in watch mode')
    .option('-c, --coverage', 'Generate code coverage report')
    .option('-v, --verbose', 'Display individual test results')
    .option('-f, --filter <pattern>', 'Run tests matching the pattern')
    .action(runTests);

  // Unit tests
  program
    .command('test:unit')
    .description('Run unit tests only')
    .option('-w, --watch', 'Run tests in watch mode')
    .option('-c, --coverage', 'Generate code coverage report')
    .option('-v, --verbose', 'Display individual test results')
    .action(runUnitTests);

  // Integration tests
  program
    .command('test:integration')
    .description('Run integration tests only')
    .option('-w, --watch', 'Run tests in watch mode')
    .option('-c, --coverage', 'Generate code coverage report')
    .option('-v, --verbose', 'Display individual test results')
    .action(runIntegrationTests);

  // E2E tests
  program
    .command('test:e2e')
    .description('Run end-to-end tests only')
    .option('-w, --watch', 'Run tests in watch mode')
    .option('-c, --coverage', 'Generate code coverage report')
    .option('-v, --verbose', 'Display individual test results')
    .action(runE2ETests);
}
