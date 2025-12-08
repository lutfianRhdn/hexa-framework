import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../types';

export async function generateMainIndex(ctx: GeneratorContext): Promise<void> {
  const { srcPath, config } = ctx;
  const { template, transports, adapters } = config;

  const indexContent = generateIndexContent(template, transports, adapters);

  await fs.writeFile(path.join(srcPath, 'index.ts'), indexContent);
  console.log('  ✅ Main index.ts generated');
}

function generateIndexContent(template: string, transports: string[], adapters: string[]): string {
  const hasAuth = template === 'basic-auth' || template === 'full-auth';
  const hasREST = transports.includes('rest');
  const hasGraphQL = transports.includes('graphql');
  const hasWebSocket = transports.includes('websocket');
  const isFullAuth = template === 'full-auth';

  let imports = `import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './configs/env';
`;

  if (adapters.includes('prisma')) {
    imports += `import prisma from './configs/database';\n`;
  }
  if (adapters.includes('typeorm')) {
    imports += `import { AppDataSource } from './configs/typeorm';\n`;
  }
  if (adapters.includes('mongoose')) {
    imports += `import { connectMongoDB } from './configs/mongoose';\n`;
  }
  if (adapters.includes('redis')) {
    imports += `import { connectRedis } from './configs/redis';\n`;
  }

  if (hasREST) {
    imports += `\nimport morgan from 'morgan';
import compression from 'compression';`;
  }

  if (hasWebSocket) {
    imports += `\nimport { createServer } from 'http';`;
  }

  if (hasAuth && hasREST) {
    const isMongoDb = adapters.includes('mongoose');
    const dbFolder = isMongoDb ? 'mongodb' : 'postgres';
    imports += `\nimport { PostgresUserRepository } from './adapters/${dbFolder}/repositories/PostgresUserRepository';
import { UserService } from './core/services/UserService';
import { AuthService } from './core/services/AuthService';
import { UserController } from './transports/api/controllers/UserController';
import { AuthController } from './transports/api/controllers/AuthController';
import { createUserRouter } from './transports/api/routers/userRouter';
import { createAuthRouter } from './transports/api/routers/authRouter';`;
  }

  if (isFullAuth && hasREST) {
    const isMongoDb = adapters.includes('mongoose');
    const dbFolder = isMongoDb ? 'mongodb' : 'postgres';
    imports += `\nimport { PostgresRoleRepository } from './adapters/${dbFolder}/repositories/PostgresRoleRepository';
import { PostgresPermissionRepository } from './adapters/${dbFolder}/repositories/PostgresPermissionRepository';
import { RoleService } from './core/services/RoleService';
import { PermissionService } from './core/services/PermissionService';
import { RoleController } from './transports/api/controllers/RoleController';
import { PermissionController } from './transports/api/controllers/PermissionController';
import { createRoleRouter } from './transports/api/routers/roleRouter';
import { createPermissionRouter } from './transports/api/routers/permissionRouter';`;
  }

  if (hasREST) {
    imports += `\nimport healthRouter from './transports/api/routers/healthRouter';`;
  }

  if (hasGraphQL) {
    imports += `\nimport { setupGraphQL } from './transports/graphql';`;
  }

  if (hasWebSocket) {
    imports += `\nimport { setupWebSocket } from './transports/websocket';`;
  }

  let setupFunction = `\nasync function bootstrap() {
  const app: Express = express();
${hasWebSocket ? `  const httpServer = createServer(app);\n` : ''}
  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
`;

  if (hasREST) {
    setupFunction += `  app.use(morgan('combined'));
  app.use(compression());
`;
  }

  setupFunction += `
  // Initialize adapters
  try {
`;
  if (adapters.includes('prisma')) {
    setupFunction += `    await prisma.$connect();
    console.log('✅ Prisma connected');
`;
  }
  if (adapters.includes('typeorm')) {
    setupFunction += `    await AppDataSource.initialize();
    console.log('✅ TypeORM connected');
`;
  }
  if (adapters.includes('mongoose')) {
    setupFunction += `    await connectMongoDB();
`;
  }
  if (adapters.includes('redis')) {
    setupFunction += `    await connectRedis();
`;
  }

  setupFunction += `  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
`;

  if (hasAuth && hasREST) {
    setupFunction += `
  // Initialize repositories
  const userRepository = new PostgresUserRepository();
`;

    if (isFullAuth) {
      setupFunction += `  const roleRepository = new PostgresRoleRepository();
  const permissionRepository = new PostgresPermissionRepository();
`;
    }

    setupFunction += `
  // Initialize services
  const userService = new UserService(userRepository);
  const authService = new AuthService(userRepository);
`;

    if (isFullAuth) {
      setupFunction += `  const roleService = new RoleService(roleRepository);
  const permissionService = new PermissionService(permissionRepository);
`;
    }

    setupFunction += `
  // Initialize controllers
  const userController = new UserController(userService);
  const authController = new AuthController(authService);
`;

    if (isFullAuth) {
      setupFunction += `  const roleController = new RoleController(roleService);
  const permissionController = new PermissionController(permissionService);
`;
    }

    setupFunction += `
  // Setup routes
  app.use('/api/health', healthRouter);
  app.use('/api/users', createUserRouter(userController));
  app.use('/api/auth', createAuthRouter(authController));
`;

    if (isFullAuth) {
      setupFunction += `  app.use('/api/roles', createRoleRouter(roleController));
  app.use('/api/permissions', createPermissionRouter(permissionController));
`;
    }
  } else if (hasREST) {
    setupFunction += `
  // Setup routes
  app.use('/api/health', healthRouter);
`;
  }

  if (hasGraphQL) {
    setupFunction += `
  // Setup GraphQL
  await setupGraphQL(app);
  console.log('✅ GraphQL endpoint available at /graphql');
`;
  }

  if (hasWebSocket) {
    setupFunction += `
  // Setup WebSocket
  const io = setupWebSocket(httpServer);
  console.log('✅ WebSocket server initialized');
`;
  }

  setupFunction += `
  // Start server
  const PORT = config.port || 3000;
  ${hasWebSocket ? 'httpServer' : 'app'}.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);${hasREST ? `
    console.log(\`📡 REST API: http://localhost:\${PORT}/api\`);` : ''}${hasGraphQL ? `
    console.log(\`🔮 GraphQL: http://localhost:\${PORT}/graphql\`);` : ''}${hasWebSocket ? `
    console.log(\`🔌 WebSocket: ws://localhost:\${PORT}\`);` : ''}
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\\n👋 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
`;

  return imports + setupFunction;
}
