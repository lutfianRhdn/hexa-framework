#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const program = new Command();

program
  .name('create-hexa-app')
  .description('Create a new Hexa Framework project')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName?: string) => {
    console.log(chalk.blue.bold('\n🚀 Welcome to Hexa Framework!\n'));

    // Get project name
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-hexa-app',
          validate: (input: string) => {
            if (!input || input.length === 0) {
              return 'Project name cannot be empty';
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return 'Project name can only contain lowercase letters, numbers, and hyphens';
            }
            return true;
          },
        },
      ]);
      projectName = answers.projectName;
    }

    if (!projectName) {
      console.log(chalk.red('\n❌ Project name is required!\n'));
      process.exit(1);
    }

    const projectPath = path.join(process.cwd(), projectName);

    // Check if directory exists
    if (fs.existsSync(projectPath)) {
      console.log(chalk.red(`\n❌ Directory ${projectName} already exists!\n`));
      process.exit(1);
    }

    // Create project
    const spinner = ora('Creating project...').start();

    try {
      // Create directory
      fs.mkdirSync(projectPath, { recursive: true });

      // Copy basic template
      await createBasicTemplate(projectPath, projectName);

      spinner.succeed('Project created!');

      // Install dependencies
      console.log(chalk.blue('\n📦 Installing dependencies...\n'));
      execSync('npm install', {
        cwd: projectPath,
        stdio: 'inherit',
      });

      // Success message
      console.log(chalk.green.bold('\n✅ Success! Created ' + projectName));
      console.log('\nNext steps:');
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan('  cp .env.example .env'));
      console.log(chalk.cyan('  # Configure your .env file'));
      console.log(chalk.cyan('  npx prisma generate'));
      console.log(chalk.cyan('  npx prisma migrate dev'));
      console.log(chalk.cyan('  npm run dev'));
      console.log('\nHappy coding! 🎉\n');
    } catch (error) {
      spinner.fail('Failed to create project');
      console.error(error);
      process.exit(1);
    }
  });

async function createBasicTemplate(projectPath: string, projectName: string) {
  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: 'Hexa Framework API',
    main: 'dist/index.js',
    scripts: {
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      'prisma:generate': 'prisma generate',
      'prisma:migrate': 'prisma migrate dev',
      'prisma:studio': 'prisma studio',
    },
    dependencies: {
      'hexa-framework-core': '^1.0.0',
      '@prisma/client': '^5.7.0',
      express: '^4.18.2',
      dotenv: '^16.3.1',
      cors: '^2.8.5',
      helmet: '^7.1.0',
      'express-rate-limit': '^7.1.5',
      bcrypt: '^5.1.1',
      jsonwebtoken: '^9.0.2',
      zod: '^3.22.4',
    },
    devDependencies: {
      '@types/express': '^4.17.21',
      '@types/node': '^20.10.6',
      '@types/cors': '^2.8.17',
      '@types/bcrypt': '^5.0.2',
      '@types/jsonwebtoken': '^9.0.5',
      prisma: '^5.7.0',
      typescript: '^5.3.3',
      'ts-node-dev': '^2.0.0',
    },
  };

  fs.writeJsonSync(path.join(projectPath, 'package.json'), packageJson, {
    spaces: 2,
  });

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      baseUrl: '.',
      paths: {
        '@/*': ['src/*'],
      },
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  fs.writeJsonSync(path.join(projectPath, 'tsconfig.json'), tsConfig, {
    spaces: 2,
  });

  // Create .env.example
  const envExample = `# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
`;

  fs.writeFileSync(path.join(projectPath, '.env.example'), envExample);

  // Create .gitignore
  const gitignore = `node_modules/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
prisma/migrations/*_
`;

  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

  // Create README.md
  const readme = `# ${projectName}

Hexa Framework API

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Configure environment:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. Setup database:
\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

4. Start development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── core/           # Business logic
├── adapters/       # Infrastructure
├── transports/     # API layer
├── configs/        # Configuration
└── index.ts        # Entry point
\`\`\`

## Commands

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npx hexa generate\` - Generate new resource

## Documentation

Visit [Hexa Framework Docs](https://github.com/lutfian-rhdn/hexa-framework) for more information.
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

  // Create src directory structure
  const srcPath = path.join(projectPath, 'src');
  fs.mkdirSync(path.join(srcPath, 'core', 'entities'), { recursive: true });
  fs.mkdirSync(path.join(srcPath, 'core', 'repositories'), { recursive: true });
  fs.mkdirSync(path.join(srcPath, 'core', 'services'), { recursive: true });
  fs.mkdirSync(path.join(srcPath, 'adapters', 'postgres', 'repositories'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(srcPath, 'transports', 'api', 'controllers'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(srcPath, 'transports', 'api', 'routers', 'v1'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(srcPath, 'transports', 'api', 'validations'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(srcPath, 'policies'), { recursive: true });
  fs.mkdirSync(path.join(srcPath, 'mappers', 'response'), { recursive: true });
  fs.mkdirSync(path.join(srcPath, 'configs'), { recursive: true });

  // Create index.ts
  const indexTs = `import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
// TODO: Add your routes here
// import userRouter from './transports/api/routers/v1/user';
// app.use('/api/v1/users', userRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    errors: []
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? [err.stack] : []
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
  console.log(\`📚 Health check: http://localhost:\${PORT}/health\`);
});
`;

  fs.writeFileSync(path.join(srcPath, 'index.ts'), indexTs);

  // Create Prisma directory and schema
  const prismaPath = path.join(projectPath, 'prisma');
  fs.mkdirSync(prismaPath, { recursive: true });

  const prismaSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example model
// Uncomment and modify as needed
// model User {
//   id        Int      @id @default(autoincrement())
//   email     String   @unique
//   username  String   @unique
//   password  String
//   role      String   @default("user")
//   isActive  Boolean  @default(true)
//   createdAt DateTime @default(now()) @map("created_at")
//   updatedAt DateTime @updatedAt @map("updated_at")
//   deletedAt DateTime? @map("deleted_at")
//
//   @@map("users")
// }
`;

  fs.writeFileSync(path.join(prismaPath, 'schema.prisma'), prismaSchema);

  // Create configs/database.ts
  const databaseConfig = `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
`;

  fs.writeFileSync(
    path.join(srcPath, 'configs', 'database.ts'),
    databaseConfig
  );

  // Create configs/env.ts
  const envConfig = `export const config = {
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:3000'
  },
  database: {
    url: process.env.DATABASE_URL!
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  }
} as const;

// Validate required environment variables
function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(\`Missing required environment variables: \${missing.join(', ')}\`);
  }
}

validateConfig();
`;

  fs.writeFileSync(path.join(srcPath, 'configs', 'env.ts'), envConfig);
}

program.parse();
