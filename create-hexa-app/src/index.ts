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

  // Create example User entity
  const userEntity = `export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateUserDTO = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
export type UserResponse = Omit<User, 'password'>;
`;

  fs.writeFileSync(
    path.join(srcPath, 'core', 'entities', 'User.ts'),
    userEntity
  );

  // Create repository interface
  const userRepoInterface = `import { BaseRepository } from 'hexa-framework-core';
import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  softDelete(id: number): Promise<void>;
}
`;

  fs.writeFileSync(
    path.join(srcPath, 'core', 'repositories', 'IUserRepository.ts'),
    userRepoInterface
  );

  // Create Postgres repository implementation
  const postgresUserRepo = `import { IUserRepository } from '../../../core/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../../core/entities/User';
import { prisma } from '../../../configs/database';

export class PostgresUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null }
    });
    return user as User | null;
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    where?: any;
  }): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { ...options?.where, deletedAt: null },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' }
    });
    return users as User[];
  }

  async count(where?: any): Promise<number> {
    return await prisma.user.count({
      where: { ...where, deletedAt: null }
    });
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user = await prisma.user.create({
      data: data as any
    });
    return user as User;
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: data as any
    });
    return user as User;
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null }
    });
    return user as User | null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username, deletedAt: null }
    });
    return user as User | null;
  }

  async softDelete(id: number): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
`;

  fs.writeFileSync(
    path.join(srcPath, 'adapters', 'postgres', 'repositories', 'PostgresUserRepository.ts'),
    postgresUserRepo
  );

  // Create User service
  const userService = `import { BaseService } from 'hexa-framework-core';
import { IUserRepository } from '../repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO, UserResponse } from '../entities/User';
import bcrypt from 'bcrypt';

export class UserService extends BaseService<User> {
  constructor(private userRepository: IUserRepository) {
    super(userRepository);
  }

  async createUser(data: CreateUserDTO): Promise<UserResponse> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });

    // Remove password from response
    const { password, ...userResponse } = user;
    return userResponse as UserResponse;
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If updating password, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // If updating email, check uniqueness
    if (data.email && data.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // If updating username, check uniqueness
    if (data.username && data.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(data.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    const { password, ...userResponse } = updatedUser;
    return userResponse as UserResponse;
  }

  async getUserById(id: number): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userResponse } = user;
    return userResponse as UserResponse;
  }

  async getAllUsers(page = 1, limit = 10): Promise<{ data: UserResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userRepository.findAll({ skip, take: limit }),
      this.userRepository.count()
    ]);

    const usersResponse = users.map(({ password, ...user }) => user as UserResponse);

    return {
      data: usersResponse,
      total,
      page,
      limit
    };
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.softDelete(id);
  }
}
`;

  fs.writeFileSync(
    path.join(srcPath, 'core', 'services', 'UserService.ts'),
    userService
  );

  // Create User controller
  const userController = `import { BaseController } from 'hexa-framework-core';
import { Request, Response } from 'express';
import { UserService } from '../../../core/services/UserService';
import { createUserSchema, updateUserSchema } from '../validations/userValidation';
import { userResponseMapper } from '../../../mappers/response/userMapper';

export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  createUser = this.asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createUserSchema.parse(req.body);
    const user = await this.userService.createUser(validatedData);
    const response = userResponseMapper(user);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: response
    });
  });

  getUser = this.asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = await this.userService.getUserById(id);
    const response = userResponseMapper(user);

    return res.json({
      success: true,
      data: response
    });
  });

  getAllUsers = this.asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.userService.getAllUsers(page, limit);

    return res.json({
      success: true,
      data: result.data.map(userResponseMapper),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  });

  updateUser = this.asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const validatedData = updateUserSchema.parse(req.body);
    const user = await this.userService.updateUser(id, validatedData);
    const response = userResponseMapper(user);

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: response
    });
  });

  deleteUser = this.asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await this.userService.deleteUser(id);

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  });
}
`;

  fs.writeFileSync(
    path.join(srcPath, 'transports', 'api', 'controllers', 'UserController.ts'),
    userController
  );

  // Create validation schema
  const userValidation = `import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).default('user'),
  isActive: z.boolean().default(true)
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
`;

  fs.writeFileSync(
    path.join(srcPath, 'transports', 'api', 'validations', 'userValidation.ts'),
    userValidation
  );

  // Create response mapper
  const userMapper = `import { UserResponse } from '../../core/entities/User';

export function userResponseMapper(user: UserResponse) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
`;

  fs.writeFileSync(
    path.join(srcPath, 'mappers', 'response', 'userMapper.ts'),
    userMapper
  );

  // Create user router
  const userRouter = `import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { UserService } from '../../../../core/services/UserService';
import { PostgresUserRepository } from '../../../../adapters/postgres/repositories/PostgresUserRepository';

const router = Router();

// Initialize dependencies
const userRepository = new PostgresUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', userController.createUser);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Public
 */
router.get('/', userController.getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', userController.getUser);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Public
 */
router.put('/:id', userController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Public
 */
router.delete('/:id', userController.deleteUser);

export default router;
`;

  fs.writeFileSync(
    path.join(srcPath, 'transports', 'api', 'routers', 'v1', 'userRouter.ts'),
    userRouter
  );

  // Create policy example
  const userPolicy = `import { Request, Response, NextFunction } from 'express';

/**
 * Example policy/middleware for user authorization
 * This is a placeholder - implement your actual authentication logic
 */

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement actual authentication check
  // Example: Check JWT token, session, etc.
  
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // TODO: Verify token and attach user to request
  // req.user = decodedUser;
  
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Check if user is admin
  // if (req.user?.role !== 'admin') {
  //   return res.status(403).json({
  //     success: false,
  //     message: 'Admin access required'
  //   });
  // }
  
  next();
};
`;

  fs.writeFileSync(
    path.join(srcPath, 'policies', 'authPolicy.ts'),
    userPolicy
  );

  // Update Prisma schema to uncomment User model
  const updatedPrismaSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example User model
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  username  String    @unique
  password  String
  role      String    @default("user")
  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}
`;

  fs.writeFileSync(path.join(prismaPath, 'schema.prisma'), updatedPrismaSchema);

  // Update index.ts to include user routes
  const updatedIndexTs = `import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './configs/env';
import userRouter from './transports/api/routers/v1/userRouter';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.app.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/users', userRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: (err as any).errors
    });
  }

  res.status(500).json({
    success: false,
    message: config.app.env === 'development' ? err.message : 'Internal server error',
    ...(config.app.env === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(\`🚀 Server running on \${config.app.url}\`);
  console.log(\`📝 Environment: \${config.app.env}\`);
});

export default app;
`;

  fs.writeFileSync(path.join(srcPath, 'index.ts'), updatedIndexTs);

  // Update package.json to include bcrypt
  const packageJsonPath = path.join(projectPath, 'package.json');
  const existingPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  existingPackageJson.dependencies.bcrypt = '^5.1.1';
  existingPackageJson.devDependencies['@types/bcrypt'] = '^5.0.2';
  fs.writeFileSync(packageJsonPath, JSON.stringify(existingPackageJson, null, 2));

  console.log('✅ Example files created successfully!');
  console.log('\nExample structure:');
  console.log('  - User Entity');
  console.log('  - User Repository (Interface + Postgres Implementation)');
  console.log('  - User Service (with business logic)');
  console.log('  - User Controller (REST API handlers)');
  console.log('  - User Router (API routes)');
  console.log('  - User Validation (Zod schemas)');
  console.log('  - User Mapper (Response transformation)');
  console.log('  - Auth Policy (Example middleware)');
  console.log('  - Database & Environment configs');
  console.log('\nTo get started:');
  console.log('  1. Configure your .env file with DATABASE_URL and JWT_SECRET');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npx prisma generate');
  console.log('  4. Run: npx prisma migrate dev --name init');
  console.log('  5. Run: npm run dev');
}

program.parse();
