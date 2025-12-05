import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { TErrorResponse, TResponse } from '../types/response';

/**
 * Permission Configuration
 */
export interface PermissionConfig {
  permissionsData: {
    permissions: Array<{ id: number; code: string; name: string }>;
    role_permissions: Array<{ role_id: number; permission_id: number }>;
    roles: Array<{ id: number; name: string }>;
  };
  cacheEnabled?: boolean;
  cacheTTL?: number; // in milliseconds
}

/**
 * In-memory cache for permissions
 */
class PermissionCache {
  private cache: Map<string, { data: Set<string>; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.ttl = ttl;
  }

  set(key: string, permissions: Set<string>): void {
    this.cache.set(key, {
      data: permissions,
      timestamp: Date.now(),
    });
  }

  get(key: string): Set<string> | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const permissionCache = new PermissionCache();

/**
 * Send failure response helper
 */
const sendFailureResponse = (
  res: Response,
  errors: TErrorResponse[],
  message: string,
  code: number
): Response => {
  return res.status(code).json({
    status: 'failed',
    message,
    data: null,
    errors,
    metadata: null,
  } as TResponse<null, null>);
};

/**
 * Get user permissions from role
 */
function getUserPermissions(roleName: string, config: PermissionConfig): Set<string> {
  // Check cache first
  if (config.cacheEnabled !== false) {
    const cached = permissionCache.get(roleName);
    if (cached) {
      return cached;
    }
  }

  const { roles, role_permissions, permissions } = config.permissionsData;

  // Find role
  const role = roles.find((r) => r.name === roleName);
  if (!role) {
    return new Set();
  }

  // Get permission IDs for this role
  const permissionIds = role_permissions
    .filter((rp) => rp.role_id === role.id)
    .map((rp) => rp.permission_id);

  // Get permission codes
  const userPermissions = new Set(
    permissions
      .filter((p) => permissionIds.includes(p.id))
      .map((p) => p.code)
  );

  // Cache the result
  if (config.cacheEnabled !== false) {
    permissionCache.set(roleName, userPermissions);
  }

  return userPermissions;
}

/**
 * Create Permission Middleware
 * @param requiredPermission - Permission code required (e.g., 'product:read')
 * @param config - Permission configuration with data and cache settings
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const permissionMiddleware = createPermissionMiddleware(
 *   'product:read',
 *   {
 *     permissionsData: {
 *       permissions: [...],
 *       role_permissions: [...],
 *       roles: [...]
 *     }
 *   }
 * );
 * 
 * router.get('/products', authMiddleware, permissionMiddleware, handler);
 * ```
 */
export const createPermissionMiddleware = (
  requiredPermission: string,
  config: PermissionConfig
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        sendFailureResponse(
          res,
          [
            {
              field: 'authorization',
              message: 'User not authenticated',
              type: 'unauthorized',
            },
          ],
          'User not authenticated',
          401
        );
        return;
      }

      const userRole = req.user.role;

      // Get user permissions
      const userPermissions = getUserPermissions(userRole, config);

      // Check if user has required permission
      if (!userPermissions.has(requiredPermission)) {
        sendFailureResponse(
          res,
          [
            {
              field: 'permission',
              message: `Permission '${requiredPermission}' required`,
              type: 'forbidden',
            },
          ],
          'Insufficient permissions',
          403
        );
        return;
      }

      next();
    } catch (error) {
      sendFailureResponse(
        res,
        [
          {
            field: 'server',
            message: 'Permission check failed',
            type: 'server_error',
          },
        ],
        'Permission check failed',
        500
      );
    }
  };
};

/**
 * Clear permission cache (useful after permission updates)
 */
export const clearPermissionCache = () => {
  permissionCache.clear();
};
