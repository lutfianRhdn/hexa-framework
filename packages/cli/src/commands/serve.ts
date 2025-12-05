import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

export async function serve(options: { port?: number; host?: string; watch?: boolean }) {
  const port = options.port || 3000;
  const host = options.host || 'localhost';
  const watch = options.watch !== false;

  console.log(chalk.cyan.bold('\n🚀 Starting development server...\n'));
  console.log(chalk.gray(`  Host: ${chalk.white(host)}`));
  console.log(chalk.gray(`  Port: ${chalk.white(port)}`));
  console.log(chalk.gray(`  Watch: ${chalk.white(watch ? 'enabled' : 'disabled')}\n`));

  try {
    if (watch) {
      // Use nodemon for hot reload
      const command = `npx nodemon --exec "node -r ts-node/register" src/index.ts`;
      
      const child = exec(command);
      
      child.stdout?.on('data', (data) => {
        console.log(data.toString());
      });
      
      child.stderr?.on('data', (data) => {
        console.error(chalk.red(data.toString()));
      });
      
      child.on('exit', (code) => {
        if (code !== 0) {
          console.error(chalk.red(`\n❌ Server exited with code ${code}\n`));
          process.exit(code || 1);
        }
      });
    } else {
      // Run without watch
      const command = `node -r ts-node/register src/index.ts`;
      const child = exec(command);
      
      child.stdout?.on('data', (data) => {
        console.log(data.toString());
      });
      
      child.stderr?.on('data', (data) => {
        console.error(chalk.red(data.toString()));
      });
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to start server:'), error.message);
    process.exit(1);
  }
}

export async function build(options: { production?: boolean }) {
  const spinner = ora('Building project...').start();
  
  try {
    const { stdout, stderr } = await execAsync('npm run build');
    
    if (stderr && !stderr.includes('warnings')) {
      spinner.fail('Build failed');
      console.error(chalk.red(stderr));
      process.exit(1);
    }
    
    spinner.succeed('Build completed successfully');
    console.log(chalk.gray(stdout));
    
    if (options.production) {
      console.log(chalk.green('\n✅ Production build ready!\n'));
    }
  } catch (error: any) {
    spinner.fail('Build failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
