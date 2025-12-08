import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../../types';

export async function generateBasicAuth(ctx: GeneratorContext): Promise<void> {
  const { srcPath, config } = ctx;
  const isMongoDb = config.adapters.includes('mongoose');
  const databaseType = isMongoDb ? 'mongodb' : 'postgres';

  // Create User entity
  await generateUserEntity(srcPath, isMongoDb);

  // Create repository interface
  await generateUserRepositoryInterface(srcPath);

  // Create Postgres/MySQL repository implementation
  await generateUserRepository(srcPath, databaseType);

  // Create User service
  await generateUserService(srcPath);

  // Create Auth service
  await generateAuthService(srcPath);

  // Create user mapper
  await generateUserMapper(srcPath);

  // Create auth middleware
  await generateAuthMiddleware(srcPath);

  // Create user validation schemas
  await generateUserValidation(srcPath);

  console.log('  ✅ Basic auth files generated');
}

async function generateUserEntity(srcPath: string, isMongoDb: boolean) {
  const idType = isMongoDb ? 'string' : 'number';

  const entity = `export interface User {
  id: ${idType};
  email: string;
  username: string;
  password: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface UpdateUserDTO {
  email?: string;
  username?: string;
  password?: string;
  name?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: ${idType};
  email: string;
  username: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
`;

  await fs.writeFile(path.join(srcPath, 'core', 'entities', 'User.ts'), entity);
}

async function generateUserRepositoryInterface(srcPath: string) {
  const repositoryInterface = `import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface IUserRepository {
  findById(id: number | string): Promise<User | null>;
  findAll(options?: { skip?: number; take?: number; where?: any }): Promise<User[]>;
  count(where?: any): Promise<number>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: number | string, data: UpdateUserDTO): Promise<User>;
  delete(id: number | string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  softDelete(id: number | string): Promise<void>;
}
`;

  await fs.writeFile(
    path.join(srcPath, 'core', 'repositories', 'IUserRepository.ts'),
    repositoryInterface
  );
}

async function generateUserRepository(srcPath: string, database: string) {
  const dbFolder = database === 'mongodb' ? 'mongodb' : 'postgres';
  const repoPath = path.join(srcPath, 'adapters', dbFolder, 'repositories');
  await fs.ensureDir(repoPath);
  const isMongoDb = database === 'mongodb';

  const repository = isMongoDb
    ? `import { BaseMongooseRepository } from '@hexa-framework/adapter-mongoose';
import { User, CreateUserDTO, UpdateUserDTO } from '../../../core/entities/User';
import { IUserRepository } from '../../../core/repositories/IUserRepository';

// For MongoDB, we need a custom implementation
// BasePrismaRepository is for SQL databases
export class PostgresUserRepository implements IUserRepository {
  // MongoDB implementation would go here
  // This is a placeholder - use mongoose model
  async findById(id: number | string): Promise<User | null> {
    throw new Error('MongoDB implementation pending');
  }
  async findAll(options?: any): Promise<User[]> {
    throw new Error('MongoDB implementation pending');
  }
  async count(where?: any): Promise<number> {
    throw new Error('MongoDB implementation pending');
  }
  async create(data: CreateUserDTO): Promise<User> {
    throw new Error('MongoDB implementation pending');
  }
  async update(id: number | string, data: UpdateUserDTO): Promise<User> {
    throw new Error('MongoDB implementation pending');
  }
  async delete(id: number | string): Promise<void> {
    throw new Error('MongoDB implementation pending');
  }
  async findByEmail(email: string): Promise<User | null> {
    throw new Error('MongoDB implementation pending');
  }
  async findByUsername(username: string): Promise<User | null> {
    throw new Error('MongoDB implementation pending');
  }
  async softDelete(id: number | string): Promise<void> {
    throw new Error('MongoDB implementation pending');
  }
}
`
    : `import { BasePrismaRepository, PrismaClient } from '@hexa-framework/adapter-prisma';
import { IUserRepository } from '../../../core/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../../core/entities/User';
import prisma from '../../../configs/database';

/**
 * UserRepository extending BasePrismaRepository from @hexa-framework/adapter-prisma
 * Inherits: getById, getAll, create, update, softDelete, hardDelete, count, exists
 */
export class PostgresUserRepository extends BasePrismaRepository<User> implements IUserRepository {
  protected modelName = 'user';

  constructor() {
    super(prisma);
  }

  // IUserRepository specific methods
  async findById(id: number | string): Promise<User | null> {
    return this.getById(id);
  }

  async findAll(options?: { skip?: number; take?: number; where?: any }): Promise<User[]> {
    const result = await this.getAll({
      pagination: { page: Math.floor((options?.skip || 0) / (options?.take || 10)) + 1, limit: options?.take || 10 },
      filters: options?.where
    });
    return result.data;
  }

  async delete(id: number | string): Promise<void> {
    return this.hardDelete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { username } });
  }
}
`;

  await fs.writeFile(
    path.join(repoPath, 'PostgresUserRepository.ts'),
    repository
  );
}

async function generateUserService(srcPath: string) {
  const service = `import { IUserRepository } from '../repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO, UserResponse } from '../entities/User';
import bcrypt from 'bcrypt';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

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

  async updateUser(id: number | string, data: UpdateUserDTO): Promise<UserResponse> {
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

  async getUserById(id: number | string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userResponse } = user;
    return userResponse as UserResponse;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    data: UserResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
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

  async deleteUser(id: number | string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.softDelete(id);
  }
}
`;

  await fs.writeFile(path.join(srcPath, 'core', 'services', 'UserService.ts'), service);
}

async function generateAuthService(srcPath: string) {
  const service = `import { IUserRepository } from '../repositories/IUserRepository';
import { LoginDTO, AuthResponse } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../../configs/env';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret as Secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    // Remove password from response
    const { password, ...userResponse } = user;

    return {
      user: userResponse,
      token
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
`;

  await fs.writeFile(path.join(srcPath, 'core', 'services', 'AuthService.ts'), service);
}

async function generateUserMapper(srcPath: string) {
  const mapperDir = path.join(srcPath, 'mappers', 'response');
  await fs.ensureDir(mapperDir);

  const mapper = `import { UserResponse } from '../../core/entities/User';

export function userResponseMapper(user: any): UserResponse {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
`;

  await fs.writeFile(path.join(mapperDir, 'userMapper.ts'), mapper);
}

async function generateAuthMiddleware(srcPath: string) {
  const middleware = `import { createAuthMiddleware, AuthRequest } from '@hexa-framework/transport-rest';
import { config } from '../configs/env';

// Create auth middleware using Hexa Framework
export const authMiddleware = createAuthMiddleware({
  jwtSecret: config.jwt.secret,
});

// Re-export AuthRequest type for use in controllers
export type { AuthRequest };
`;

  await fs.writeFile(path.join(srcPath, 'policies', 'authMiddleware.ts'), middleware);
}

async function generateUserValidation(srcPath: string) {
  const validationDir = path.join(srcPath, 'transports', 'api', 'validations');
  await fs.ensureDir(validationDir);

  const validation = `import { z } from 'zod';
import { validateBody } from '@hexa-framework/transport-rest';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  name: z.string().optional(),
  isActive: z.boolean().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Pre-built validation middleware
export const validateCreateUser = validateBody(createUserSchema);
export const validateUpdateUser = validateBody(updateUserSchema);
export const validateLogin = validateBody(loginSchema);
`;

  await fs.writeFile(path.join(validationDir, 'userValidation.ts'), validation);
}
