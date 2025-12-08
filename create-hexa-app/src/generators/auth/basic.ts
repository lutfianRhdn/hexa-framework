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

  const repository = `import prisma from '../../../configs/database';
import { IUserRepository } from '../../../core/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../../core/entities/User';

export class PostgresUserRepository implements IUserRepository {
  async findById(id: number | string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} }
    });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    where?: any;
  }): Promise<User[]> {
    const users = await prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where
    });
    return users;
  }

  async count(where?: any): Promise<number> {
    return await prisma.user.count({ where });
  }

  async create(data: CreateUserDTO): Promise<User> {
    return await prisma.user.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  async update(id: number | string, data: UpdateUserDTO): Promise<User> {
    return await prisma.user.update({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} },
      data
    });
  }

  async delete(id: number | string): Promise<void> {
    await prisma.user.delete({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  async softDelete(id: number | string): Promise<void> {
    await prisma.user.update({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} },
      data: { isActive: false }
    });
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
  const middleware = `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../configs/env';

export interface AuthRequest extends Request {
  user?: {
    userId: number | string;
    email: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: number | string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}
`;

  await fs.writeFile(path.join(srcPath, 'policies', 'authMiddleware.ts'), middleware);
}

async function generateUserValidation(srcPath: string) {
  const validationDir = path.join(srcPath, 'transports', 'api', 'validations');
  await fs.ensureDir(validationDir);

  const validation = `import { z } from 'zod';

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
`;

  await fs.writeFile(path.join(validationDir, 'userValidation.ts'), validation);
}
