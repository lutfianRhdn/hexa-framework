import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../types';

export async function generateAdaptersConfig(ctx: GeneratorContext): Promise<void> {
  const { config, projectPath, srcPath } = ctx;

  for (const adapter of config.adapters) {
    if (adapter === 'prisma') {
      await generatePrismaConfig(ctx);
    } else if (adapter === 'typeorm') {
      await generateTypeRPCConfig(ctx);
    } else if (adapter === 'mongoose') {
      await generateMongooseConfig(ctx);
    } else if (adapter === 'redis') {
      await generateRedisConfig(ctx);
    }
  }

  // Generate env config
  // We need to accumulate environment variables from all adapters
  const envConfig = `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret' as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' as string
  }
};
`;

  await fs.ensureDir(path.join(srcPath, 'configs'));
  await fs.writeFile(path.join(srcPath, 'configs', 'env.ts'), envConfig);
}

async function generatePrismaConfig(ctx: GeneratorContext): Promise<void> {
  const { config, projectPath, srcPath } = ctx;
  const dbType = 'postgresql'; // Default for now

  const schema = generatePrismaSchema(dbType, config.template);
  await fs.ensureDir(path.join(projectPath, 'prisma'));
  await fs.writeFile(path.join(projectPath, 'prisma', 'schema.prisma'), schema);

  const dbConfig = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
`;

  await fs.ensureDir(path.join(srcPath, 'configs'));
  await fs.writeFile(path.join(srcPath, 'configs', 'database.ts'), dbConfig);
}

async function generateTypeRPCConfig(ctx: GeneratorContext): Promise<void> {
  const { srcPath } = ctx;
  await fs.ensureDir(path.join(srcPath, 'configs'));
  const typeOrmConfig = `import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "hexa_db",
    synchronize: true,
    logging: false,
    entities: [],
    subscribers: [],
    migrations: [],
});
`;
  await fs.writeFile(path.join(srcPath, 'configs', 'typeorm.ts'), typeOrmConfig);
}

async function generateMongooseConfig(ctx: GeneratorContext): Promise<void> {
  const { srcPath } = ctx;
  await fs.ensureDir(path.join(srcPath, 'configs'));
  const mongooseConfig = `import mongoose from 'mongoose';

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hexa_db');
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
`;
  await fs.writeFile(path.join(srcPath, 'configs', 'mongoose.ts'), mongooseConfig);
}

async function generateRedisConfig(ctx: GeneratorContext): Promise<void> {
  const { srcPath } = ctx;
  await fs.ensureDir(path.join(srcPath, 'configs'));
  const redisConfig = `import { createClient } from 'redis';

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    await redisClient.connect();
    console.log('Redis connected');
};
`;
  await fs.writeFile(path.join(srcPath, 'configs', 'redis.ts'), redisConfig);
}

function generatePrismaSchema(database: string, template: string): string {
  const datasource = generateDatasource(database);
  const models = template !== 'empty' ? generateModels(database, template) : '';

  return `${datasource}

generator client {
  provider = "prisma-client-js"
}

${models}
`;
}

function generateDatasource(database: string): string {
  const providers: Record<string, string> = {
    postgresql: 'postgresql',
    mysql: 'mysql',
    mongodb: 'mongodb',
    sqlite: 'sqlite'
  };

  const url = database === 'sqlite'
    ? 'file:./dev.db'
    : 'env("DATABASE_URL")';

  return `datasource db {
  provider = "${providers[database]}"
  url      = ${database === 'sqlite' ? `"${url}"` : url}
}`;
}

function generateModels(database: string, template: string): string {
  const isMongoDb = database === 'mongodb';

  if (template === 'basic-auth') {
    return generateBasicAuthModels(isMongoDb);
  } else if (template === 'full-auth') {
    return generateFullAuthModels(isMongoDb);
  }

  return '';
}

function generateBasicAuthModels(isMongoDb: boolean): string {
  if (isMongoDb) {
    return `model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  username  String   @unique
  password  String
  name      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
  }

  return `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String
  name      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
}

function generateFullAuthModels(isMongoDb: boolean): string {
  if (isMongoDb) {
    return `model User {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  email       String       @unique
  username    String       @unique
  password    String
  name        String?
  isActive    Boolean      @default(true)
  roleId      String?      @db.ObjectId
  role        Role?        @relation(fields: [roleId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Role {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  name        String       @unique
  description String?
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Permission {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  description String?
  resource    String
  action      String
  roleId      String   @db.ObjectId
  role        Role     @relation(fields: [roleId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([resource, action])
}`;
  }

  return `model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  username    String   @unique
  password    String
  name        String?
  isActive    Boolean  @default(true)
  roleId      Int?
  role        Role?    @relation(fields: [roleId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Role {
  id          Int      @id @default(autoincrement())
  name        String       @unique
  description String?
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([resource, action])
}`;
}
