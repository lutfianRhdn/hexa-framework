import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import Table from 'cli-table3';

interface Route {
  method: string;
  path: string;
  handler: string;
  middleware?: string[];
}

export async function routeList() {
  console.log(chalk.cyan.bold('\n📋 Registered Routes\n'));

  try {
    const routes = await scanRoutes();
    
    if (routes.length === 0) {
      console.log(chalk.yellow('No routes found.'));
      return;
    }

    const table = new Table({
      head: [
        chalk.white.bold('Method'),
        chalk.white.bold('Path'),
        chalk.white.bold('Handler'),
        chalk.white.bold('Middleware')
      ],
      colWidths: [10, 40, 40, 30]
    });

    routes.forEach(route => {
      table.push([
        colorizeMethod(route.method),
        route.path,
        route.handler,
        route.middleware?.join(', ') || '-'
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal routes: ${routes.length}\n`));
  } catch (error: any) {
    console.error(chalk.red('Error scanning routes:'), error.message);
    process.exit(1);
  }
}

async function scanRoutes(): Promise<Route[]> {
  const routes: Route[] = [];
  const routersDir = path.join(process.cwd(), 'src', 'transports', 'routes');

  if (!fs.existsSync(routersDir)) {
    return routes;
  }

  const files = fs.readdirSync(routersDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(routersDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Simple regex to find routes (this is basic, can be improved)
    const routePattern = /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g;
    let match;

    while ((match = routePattern.exec(content)) !== null) {
      const [, method, routePath] = match;
      routes.push({
        method: method.toUpperCase(),
        path: routePath,
        handler: file.replace(/\.(ts|js)$/, '')
      });
    }
  }

  return routes;
}

function colorizeMethod(method: string): string {
  const colors: { [key: string]: any } = {
    'GET': chalk.green,
    'POST': chalk.blue,
    'PUT': chalk.yellow,
    'DELETE': chalk.red,
    'PATCH': chalk.magenta
  };

  const color = colors[method] || chalk.white;
  return color.bold(method);
}

export async function controllerList() {
  console.log(chalk.cyan.bold('\n📋 Controllers\n'));

  try {
    const controllersDir = path.join(process.cwd(), 'src', 'transports', 'controllers');

    if (!fs.existsSync(controllersDir)) {
      console.log(chalk.yellow('No controllers found.'));
      return;
    }

    const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

    const table = new Table({
      head: [chalk.white.bold('Controller'), chalk.white.bold('Path')],
      colWidths: [40, 60]
    });

    files.forEach(file => {
      table.push([
        file.replace(/\.(ts|js)$/, ''),
        path.join('src/transports/controllers', file)
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal controllers: ${files.length}\n`));
  } catch (error: any) {
    console.error(chalk.red('Error listing controllers:'), error.message);
    process.exit(1);
  }
}

export async function middlewareList() {
  console.log(chalk.cyan.bold('\n📋 Middleware\n'));

  try {
    const middlewareDir = path.join(process.cwd(), 'src', 'core', 'middleware');

    if (!fs.existsSync(middlewareDir)) {
      console.log(chalk.yellow('No middleware found.'));
      return;
    }

    const files = fs.readdirSync(middlewareDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

    const table = new Table({
      head: [chalk.white.bold('Middleware'), chalk.white.bold('Path')],
      colWidths: [40, 60]
    });

    files.forEach(file => {
      table.push([
        file.replace(/\.(ts|js)$/, ''),
        path.join('src/core/middleware', file)
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal middleware: ${files.length}\n`));
  } catch (error: any) {
    console.error(chalk.red('Error listing middleware:'), error.message);
    process.exit(1);
  }
}
