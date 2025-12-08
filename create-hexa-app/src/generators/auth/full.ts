import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../../types';
import { generateBasicAuth } from './basic';

export async function generateFullAuth(ctx: GeneratorContext): Promise<void> {
  // First generate basic auth (User entity, etc.)
  await generateBasicAuth(ctx);

  const { srcPath, config } = ctx;
  const isMongoDb = config.adapters.includes('mongoose');
  const databaseType = isMongoDb ? 'mongodb' : 'postgres';

  // Add Role and Permission entities
  await generateRoleEntity(srcPath, isMongoDb);
  await generatePermissionEntity(srcPath, isMongoDb);

  // Add Role repository
  await generateRoleRepository(srcPath, databaseType);
  await generateRoleRepositoryInterface(srcPath);

  // Add Permission repository
  await generatePermissionRepository(srcPath, databaseType);
  await generatePermissionRepositoryInterface(srcPath);

  // Add Role service
  await generateRoleService(srcPath);

  // Add Permission service
  await generatePermissionService(srcPath);

  // Add permission middleware
  await generatePermissionMiddleware(srcPath, databaseType);

  // Add role/permission validation
  await generateRolePermissionValidation(srcPath);

  console.log('  ✅ Full auth + RBAC files generated');
}

async function generateRoleEntity(srcPath: string, isMongoDb: boolean) {
  const idType = isMongoDb ? 'string' : 'number';

  const entity = `export interface Role {
  id: ${idType};
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
}
`;

  await fs.writeFile(path.join(srcPath, 'core', 'entities', 'Role.ts'), entity);
}

async function generatePermissionEntity(srcPath: string, isMongoDb: boolean) {
  const idType = isMongoDb ? 'string' : 'number';

  const entity = `export interface Permission {
  id: ${idType};
  name: string;
  description: string | null;
  resource: string;
  action: string;
  roleId: ${idType};
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermissionDTO {
  name: string;
  description?: string;
  resource: string;
  action: string;
  roleId: number;
}

export interface UpdatePermissionDTO {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
}
`;

  await fs.writeFile(path.join(srcPath, 'core', 'entities', 'Permission.ts'), entity);
}

async function generateRoleRepositoryInterface(srcPath: string) {
  const repositoryInterface = `import { Role, CreateRoleDTO, UpdateRoleDTO } from '../entities/Role';

export interface IRoleRepository {
  findById(id: number | string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  create(data: CreateRoleDTO): Promise<Role>;
  update(id: number | string, data: UpdateRoleDTO): Promise<Role>;
  delete(id: number | string): Promise<void>;
  findByName(name: string): Promise<Role | null>;
}
`;

  await fs.writeFile(
    path.join(srcPath, 'core', 'repositories', 'IRoleRepository.ts'),
    repositoryInterface
  );
}

async function generateRoleRepository(srcPath: string, database: string) {
  const dbFolder = database === 'mongodb' ? 'mongodb' : 'postgres';
  const repoPath = path.join(srcPath, 'adapters', dbFolder, 'repositories');
  const isMongoDb = database === 'mongodb';

  const repository = `import prisma from '../../../configs/database';
import { IRoleRepository } from '../../../core/repositories/IRoleRepository';
import { Role, CreateRoleDTO, UpdateRoleDTO } from '../../../core/entities/Role';

export class PostgresRoleRepository implements IRoleRepository {
  async findById(id: number | string): Promise<Role | null> {
    return await prisma.role.findUnique({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} },
      include: { permissions: true }
    });
  }

  async findAll(): Promise<Role[]> {
    return await prisma.role.findMany({
      include: { permissions: true }
    });
  }

  async create(data: CreateRoleDTO): Promise<Role> {
    return await prisma.role.create({
      data,
      include: { permissions: true }
    });
  }

  async update(id: number | string, data: UpdateRoleDTO): Promise<Role> {
    return await prisma.role.update({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} },
      data,
      include: { permissions: true }
    });
  }

  async delete(id: number | string): Promise<void> {
    await prisma.role.delete({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} }
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return await prisma.role.findUnique({
      where: { name },
      include: { permissions: true }
    });
  }
}
`;

  await fs.writeFile(path.join(repoPath, 'PostgresRoleRepository.ts'), repository);
}

async function generatePermissionRepositoryInterface(srcPath: string) {
  const repositoryInterface = `import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from '../entities/Permission';

export interface IPermissionRepository {
  findById(id: number | string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findByRoleId(roleId: number | string): Promise<Permission[]>;
  create(data: CreatePermissionDTO): Promise<Permission>;
  update(id: number | string, data: UpdatePermissionDTO): Promise<Permission>;
  delete(id: number | string): Promise<void>;
  findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
}
`;

  await fs.writeFile(
    path.join(srcPath, 'core', 'repositories', 'IPermissionRepository.ts'),
    repositoryInterface
  );
}

async function generatePermissionRepository(srcPath: string, database: string) {
  const dbFolder = database === 'mongodb' ? 'mongodb' : 'postgres';
  const repoPath = path.join(srcPath, 'adapters', dbFolder, 'repositories');
  const isMongoDb = database === 'mongodb';

  const repository = `import prisma from '../../../configs/database';
import { IPermissionRepository } from '../../../core/repositories/IPermissionRepository';
import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from '../../../core/entities/Permission';

export class PostgresPermissionRepository implements IPermissionRepository {
  async findById(id: number | string): Promise<Permission | null> {
    return await prisma.permission.findUnique({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} }
    });
  }

  async findAll(): Promise<Permission[]> {
    return await prisma.permission.findMany();
  }

  async findByRoleId(roleId: number | string): Promise<Permission[]> {
    return await prisma.permission.findMany({
      where: { roleId: ${isMongoDb ? 'roleId as string' : 'roleId as number'} }
    });
  }

  async create(data: CreatePermissionDTO): Promise<Permission> {
    return await prisma.permission.create({
      data
    });
  }

  async update(id: number | string, data: UpdatePermissionDTO): Promise<Permission> {
    return await prisma.permission.update({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} },
      data
    });
  }

  async delete(id: number | string): Promise<void> {
    await prisma.permission.delete({
      where: { id: ${isMongoDb ? 'id as string' : 'id as number'} }
    });
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    return await prisma.permission.findFirst({
      where: { resource, action }
    });
  }
}
`;

  await fs.writeFile(path.join(repoPath, 'PostgresPermissionRepository.ts'), repository);
}

async function generateRoleService(srcPath: string) {
  const service = `import { IRoleRepository } from '../repositories/IRoleRepository';
import { Role, CreateRoleDTO, UpdateRoleDTO } from '../entities/Role';

export class RoleService {
  constructor(private roleRepository: IRoleRepository) {}

  async createRole(data: CreateRoleDTO): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(data.name);
    if (existingRole) {
      throw new Error('Role already exists');
    }

    return await this.roleRepository.create(data);
  }

  async updateRole(id: number | string, data: UpdateRoleDTO): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (data.name && data.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(data.name);
      if (existingRole) {
        throw new Error('Role name already exists');
      }
    }

    return await this.roleRepository.update(id, data);
  }

  async getRoleById(id: number | string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  async deleteRole(id: number | string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    await this.roleRepository.delete(id);
  }
}
`;

  await fs.writeFile(path.join(srcPath, 'core', 'services', 'RoleService.ts'), service);
}

async function generatePermissionService(srcPath: string) {
  const service = `import { IPermissionRepository } from '../repositories/IPermissionRepository';
import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from '../entities/Permission';

export class PermissionService {
  constructor(private permissionRepository: IPermissionRepository) {}

  async createPermission(data: CreatePermissionDTO): Promise<Permission> {
    const existing = await this.permissionRepository.findByResourceAndAction(
      data.resource,
      data.action
    );
    
    if (existing) {
      throw new Error('Permission with this resource and action already exists');
    }

    return await this.permissionRepository.create(data);
  }

  async updatePermission(id: number | string, data: UpdatePermissionDTO): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    return await this.permissionRepository.update(id, data);
  }

  async getPermissionById(id: number | string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }

  async getPermissionsByRole(roleId: number | string): Promise<Permission[]> {
    return await this.permissionRepository.findByRoleId(roleId);
  }

  async deletePermission(id: number | string): Promise<void> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }
    await this.permissionRepository.delete(id);
  }

  async checkPermission(roleId: number | string, resource: string, action: string): Promise<boolean> {
    const permissions = await this.permissionRepository.findByRoleId(roleId);
    return permissions.some(p => p.resource === resource && p.action === action);
  }
}
`;

  await fs.writeFile(path.join(srcPath, 'core', 'services', 'PermissionService.ts'), service);
}

async function generatePermissionMiddleware(srcPath: string, database: string) {
  const isMongoDb = database === 'mongodb';
  const middleware = `import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import prisma from '../configs/database';

export function requirePermission(resource: string, action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Get user with role and permissions
      const user = await prisma.user.findUnique({
        where: { id: ${isMongoDb ? 'req.user.userId as string' : 'req.user.userId as number'} },
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      });

      if (!user || !user.role) {
        return res.status(401).json({
          success: false,
          message: 'User not found or no role assigned'
        });
      }

      // Check if user's role has the required permission
      const hasPermission = user.role.permissions.some(
        (p: { resource: string; action: string }) => p.resource === resource && p.action === action
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
}
`;

  await fs.writeFile(path.join(srcPath, 'policies', 'permissionMiddleware.ts'), middleware);
}

async function generateRolePermissionValidation(srcPath: string) {
  const validationDir = path.join(srcPath, 'transports', 'api', 'validations');

  const validation = `import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional()
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').optional(),
  description: z.string().optional()
});

export const createPermissionSchema = z.object({
  name: z.string().min(2, 'Permission name must be at least 2 characters'),
  description: z.string().optional(),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  roleId: z.number()
});

export const updatePermissionSchema = z.object({
  name: z.string().min(2, 'Permission name must be at least 2 characters').optional(),
  description: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional()
});
`;

  await fs.writeFile(path.join(validationDir, 'rolePermissionValidation.ts'), validation);
}
