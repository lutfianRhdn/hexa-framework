/**
 * Hexa Framework Core
 * by lutfian.rhdn
 */

// Base Classes
export { default as Controller } from './base/Controller';
export { Service } from './base/Service';
export { default as Repository, ResponseMapper, BaseEntity } from './base/Repository';

// Types
export type {
  TResponse,
  TErrorResponse,
  TMetadataResponse,
  PaginationResult,
  SearchConfig,
  FilterObject,
  OrderByConfig,
} from './types/response';

// Middleware
export {
  createAuthMiddleware,
  authMiddleware,
  type AuthRequest,
  type AuthConfig,
  type JWTPayload,
} from './middleware/auth';

export {
  createPermissionMiddleware,
  clearPermissionCache,
  type PermissionConfig,
} from './middleware/permission';

export {
  createValidationMiddleware,
  validateBody,
  validateQuery,
  validateParams,
} from './middleware/validation';

// Utilities (will be added later)
export * from './utils';
