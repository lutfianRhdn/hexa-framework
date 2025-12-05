import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../types';

export async function generateDatabaseConfig(ctx: GeneratorContext): Promise<void> {
  const { config, projectPath, srcPath } = ctx;

  // Generate Prisma schema based on database type
  const schema = generatePrismaSchema(config.database, config.template);
  await fs.writeFile(path.join(projectPath, 'prisma', 'schema.prisma'), schema);

  // Generate database config file
  const dbConfig = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
`;

  await fs.writeFile(path.join(srcPath, 'configs', 'database.ts'), dbConfig);

  // Generate env config
  const envConfig = `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret' as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' as string
  }
};
`;

  await fs.writeFile(path.join(srcPath, 'configs', 'env.ts'), envConfig);
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
  id          Int          @id @default(autoincrement())
  name        String       @unique
  description String?
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Permission {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  resource    String
  action      String
  roleId      Int
  role        Role     @relation(fields: [roleId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([resource, action])
}`;
}
