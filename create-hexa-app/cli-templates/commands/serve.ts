import { exec } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { logSuccess, logError, logInfo } from '../utils/file-helpers';

export async function serveApp(options: any): Promise<void> {
  try {
    const port = options.port || process.env.PORT || 3000;
    
    console.log(chalk.cyan('\n▶️  Starting Development Server...\n'));
    logInfo(`Server will run on http://localhost:${port}`);
    logInfo('Watching for file changes...\n');

    const command = 'npm run dev';
    const child = exec(command, { env: { ...process.env, PORT: port } });

    child.stdout?.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        logError(`Server process exited with code ${code}`);
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n👋 Shutting down server...'));
      child.kill('SIGINT');
      process.exit(0);
    });

  } catch (error: any) {
    logError(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

export async function buildApp(options: any): Promise<void> {
  try {
    console.log(chalk.cyan('\n🔨 Building Application...\n'));

    if (options.clean) {
      const spinner = ora('Cleaning dist folder...').start();
      const { execSync } = await import('child_process');
      execSync('rm -rf dist', { stdio: 'ignore' });
      spinner.succeed('Dist folder cleaned');
    }

    const spinner = ora('Compiling TypeScript...').start();
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    spinner.succeed('Build completed');

    logSuccess('Application built successfully!');
    console.log(chalk.blue('\n📝 Next steps:'));
    console.log(chalk.white('  npm start - Run production server\n'));

  } catch (error: any) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

export async function testApp(options: any): Promise<void> {
  try {
    console.log(chalk.cyan('\n🧪 Running Tests...\n'));

    let command = 'npm test';
    if (options.watch) command += ' -- --watch';
    if (options.coverage) command += ' -- --coverage';

    const { execSync } = await import('child_process');
    execSync(command, { stdio: 'inherit' });

    logSuccess('Tests completed!');

  } catch (error: any) {
    logError(`Tests failed: ${error.message}`);
    process.exit(1);
  }
}
