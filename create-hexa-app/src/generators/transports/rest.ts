import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../../types';

export async function generateRestTransport(ctx: GeneratorContext): Promise<void> {
  const { srcPath, config } = ctx;
  const transportPath = path.join(srcPath, 'transports', 'api');

  await fs.ensureDir(path.join(transportPath, 'controllers'));
  await fs.ensureDir(path.join(transportPath, 'routers'));

  // Generate health router (always)
  await generateHealthRouter(transportPath);

  // Generate auth-specific routes and controllers
  if (config.template === 'basic-auth' || config.template === 'full-auth') {
    await generateUserController(transportPath, config.template);
    await generateAuthController(transportPath);
    await generateUserRouter(transportPath, config.template);
    await generateAuthRouter(transportPath);
  }

  // Generate role/permission routes for full auth
  if (config.template === 'full-auth') {
    await generateRoleController(transportPath);
    await generatePermissionController(transportPath);
    await generateRoleRouter(transportPath);
    await generatePermissionRouter(transportPath);
  }

  console.log('  ✅ REST API transport files generated');
}

async function generateHealthRouter(transportPath: string) {
  const router = `import { Router, Request, Response } from 'express';

const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

export default healthRouter;
`;

  await fs.writeFile(path.join(transportPath, 'routers', 'healthRouter.ts'), router);
}

async function generateUserController(transportPath: string, template: string) {
  const controller = `import { Request, Response } from 'express';
import { BaseController, AuthRequest } from '@hexa-framework/transport-rest';
import { UserService } from '../../../core/services/UserService';
import { validateCreateUser, validateUpdateUser } from '../validations/userValidation';

/**
 * UserController extending BaseController from @hexa-framework/transport-rest
 * Inherits: success(), created(), fail(), notFound(), serverError(), asyncHandler()
 */
export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  create = this.asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    return this.created(res, user, 'User created successfully');
  });

  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
    const user = await this.userService.getUserById(id);
    return this.success(res, user);
  });

  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await this.userService.getAllUsers(page, limit);
    return this.success(res, result.data, 'Success', { 
      page, 
      limit, 
      total_records: result.total 
    });
  });

  update = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
    const user = await this.userService.updateUser(id, req.body);
    return this.success(res, user, 'User updated successfully');
  });

  delete = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
    await this.userService.deleteUser(id);
    return this.success(res, null, 'User deleted successfully');
  });
}
`;

  await fs.writeFile(path.join(transportPath, 'controllers', 'UserController.ts'), controller);
}

async function generateAuthController(transportPath: string) {
  const controller = `import { Request, Response } from 'express';
import { BaseController, AuthRequest } from '@hexa-framework/transport-rest';
import { AuthService } from '../../../core/services/AuthService';

/**
 * AuthController extending BaseController from @hexa-framework/transport-rest
 */
export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  login = this.asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await this.authService.login(req.body);
    return this.success(res, authResponse, 'Login successful');
  });

  me = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return this.fail(res, 'Not authenticated', [], 401);
    }
    return this.success(res, req.user);
  });
}
`;

  await fs.writeFile(path.join(transportPath, 'controllers', 'AuthController.ts'), controller);
}

async function generateRoleController(transportPath: string) {
  const controller = `import { Response } from 'express';
import { RoleService } from '../../../core/services/RoleService';
import { createRoleSchema, updateRoleSchema } from '../validations/rolePermissionValidation';
import { AuthRequest } from '../../../policies/authMiddleware';

export class RoleController {
  constructor(private roleService: RoleService) {}

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validatedData = createRoleSchema.parse(req.body);
      const role = await this.roleService.createRole(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create role'
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
      const role = await this.roleService.getRoleById(id);
      
      res.json({
        success: true,
        data: role
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Role not found'
      });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roles = await this.roleService.getAllRoles();
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch roles'
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
      const validatedData = updateRoleSchema.parse(req.body);
      
      const role = await this.roleService.updateRole(id, validatedData);
      
      res.json({
        success: true,
        message: 'Role updated successfully',
        data: role
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update role'
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
      await this.roleService.deleteRole(id);
      
      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete role'
      });
    }
  }
}
`;

  await fs.writeFile(path.join(transportPath, 'controllers', 'RoleController.ts'), controller);
}

async function generatePermissionController(transportPath: string) {
  const controller = `import { Response } from 'express';
import { PermissionService } from '../../../core/services/PermissionService';
import { createPermissionSchema, updatePermissionSchema } from '../validations/rolePermissionValidation';
import { AuthRequest } from '../../../policies/authMiddleware';

export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validatedData = createPermissionSchema.parse(req.body);
      const permission = await this.permissionService.createPermission(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: permission
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create permission'
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
      const permission = await this.permissionService.getPermissionById(id);
      
      res.json({
        success: true,
        data: permission
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Permission not found'
      });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await this.permissionService.getAllPermissions();
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch permissions'
      });
    }
  }

  async getByRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roleId = isNaN(Number(req.params.roleId)) ? req.params.roleId : Number(req.params.roleId);
      const permissions = await this.permissionService.getPermissionsByRole(roleId);
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch permissions'
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
      const validatedData = updatePermissionSchema.parse(req.body);
      
      const permission = await this.permissionService.updatePermission(id, validatedData);
      
      res.json({
        success: true,
        message: 'Permission updated successfully',
        data: permission
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update permission'
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = isNaN(Number(req.params.id)) ? req.params.id : Number(req.params.id);
      await this.permissionService.deletePermission(id);
      
      res.json({
        success: true,
        message: 'Permission deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete permission'
      });
    }
  }
}
`;

  await fs.writeFile(path.join(transportPath, 'controllers', 'PermissionController.ts'), controller);
}

async function generateUserRouter(transportPath: string, template: string) {
  const router = `import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../../../policies/authMiddleware';${template === 'full-auth' ? `
import { requirePermission } from '../../../policies/permissionMiddleware';` : ''}

export function createUserRouter(userController: UserController): Router {
  const router = Router();

  // Public route
  router.post('/', userController.create.bind(userController));

  // Protected routes
  router.get('/:id', authMiddleware, userController.getById.bind(userController));
  router.get('/', authMiddleware, userController.getAll.bind(userController));
  router.put('/:id', authMiddleware${template === 'full-auth' ? `, requirePermission('user', 'update')` : ''}, userController.update.bind(userController));
  router.delete('/:id', authMiddleware${template === 'full-auth' ? `, requirePermission('user', 'delete')` : ''}, userController.delete.bind(userController));

  return router;
}
`;

  await fs.writeFile(path.join(transportPath, 'routers', 'userRouter.ts'), router);
}

async function generateAuthRouter(transportPath: string) {
  const router = `import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../../../policies/authMiddleware';

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  router.post('/login', authController.login.bind(authController));
  router.get('/me', authMiddleware, authController.me.bind(authController));

  return router;
}
`;

  await fs.writeFile(path.join(transportPath, 'routers', 'authRouter.ts'), router);
}

async function generateRoleRouter(transportPath: string) {
  const router = `import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { authMiddleware } from '../../../policies/authMiddleware';
import { requirePermission } from '../../../policies/permissionMiddleware';

export function createRoleRouter(roleController: RoleController): Router {
  const router = Router();

  router.post('/', authMiddleware, requirePermission('role', 'create'), roleController.create.bind(roleController));
  router.get('/:id', authMiddleware, requirePermission('role', 'read'), roleController.getById.bind(roleController));
  router.get('/', authMiddleware, requirePermission('role', 'read'), roleController.getAll.bind(roleController));
  router.put('/:id', authMiddleware, requirePermission('role', 'update'), roleController.update.bind(roleController));
  router.delete('/:id', authMiddleware, requirePermission('role', 'delete'), roleController.delete.bind(roleController));

  return router;
}
`;

  await fs.writeFile(path.join(transportPath, 'routers', 'roleRouter.ts'), router);
}

async function generatePermissionRouter(transportPath: string) {
  const router = `import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { authMiddleware } from '../../../policies/authMiddleware';
import { requirePermission } from '../../../policies/permissionMiddleware';

export function createPermissionRouter(permissionController: PermissionController): Router {
  const router = Router();

  router.post('/', authMiddleware, requirePermission('permission', 'create'), permissionController.create.bind(permissionController));
  router.get('/:id', authMiddleware, requirePermission('permission', 'read'), permissionController.getById.bind(permissionController));
  router.get('/', authMiddleware, requirePermission('permission', 'read'), permissionController.getAll.bind(permissionController));
  router.get('/role/:roleId', authMiddleware, requirePermission('permission', 'read'), permissionController.getByRole.bind(permissionController));
  router.put('/:id', authMiddleware, requirePermission('permission', 'update'), permissionController.update.bind(permissionController));
  router.delete('/:id', authMiddleware, requirePermission('permission', 'delete'), permissionController.delete.bind(permissionController));

  return router;
}
`;

  await fs.writeFile(path.join(transportPath, 'routers', 'permissionRouter.ts'), router);
}
