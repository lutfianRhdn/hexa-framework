# 📚 API Reference

> Dokumentasi lengkap untuk semua API di Hexa Framework

## Table of Contents

- [Base Classes](#base-classes)
  - [Controller](#controller)
  - [Service](#service)
  - [Repository](#repository)
- [Middleware](#middleware)
  - [Authentication](#authentication)
  - [Permission](#permission)
  - [Validation](#validation)
- [Types](#types)
- [Utilities](#utilities)

---

## Base Classes

### Controller

Base controller dengan built-in CRUD operations dan response helpers.

#### Import

```typescript
import { Controller } from '@hexa-framework/core';
```

#### Class Definition

```typescript
abstract class Controller<T, M extends ResponseMapper<T>>
```

**Type Parameters:**
- `T` - Entity type (e.g., `TPost`, `TUser`)
- `M` - Response mapper type

#### Constructor

```typescript
constructor()
```

Tidak memerlukan parameter. Controller is stateless.

#### Methods

##### `findAll(service, mapper)`

Handle GET request untuk mendapatkan semua entities dengan pagination dan filtering.

```typescript
findAll(
  service: Service<T>,
  mapper: M
): (req: Request, res: Response) => Promise<Response>
```

**Parameters:**
- `service: Service<T>` - Service instance untuk business logic
- `mapper: M` - Mapper untuk transform entity ke response

**Query Parameters:**
- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 10)
- `...filters` - Any other query params used as filters

**Response:**

```typescript
{
  success: true,
  statusCode: 200,
  message: "Data retrieved successfully",
  data: T[],
  metadata: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Example:**

```typescript
class PostController extends Controller<TPost, PostResponseMapper> {}

const controller = new PostController();
const postService = new PostService(postRepository);

router.get('/', controller.findAll(postService, PostResponseMapper));
```

**Request:**

```bash
GET /posts?page=2&limit=20&status=published
```

##### `create(service, mapper)`

Handle POST request untuk create entity baru.

```typescript
create(
  service: Service<T>,
  mapper: M
): (req: Request, res: Response) => Promise<Response>
```

**Parameters:**
- `service: Service<T>` - Service instance
- `mapper: M` - Response mapper

**Request Body:**
- Any valid entity data

**Response:**

```typescript
{
  success: true,
  statusCode: 201,
  message: "Data created successfully",
  data: T,
  metadata: {}
}
```

**Example:**

```typescript
router.post('/', 
  validateBody(createPostSchema),
  controller.create(postService, PostResponseMapper)
);
```

**Request:**

```bash
POST /posts
Content-Type: application/json

{
  "title": "My Post",
  "content": "Post content..."
}
```

##### `update(service, mapper)`

Handle PATCH/PUT request untuk update entity.

```typescript
update(
  service: Service<T>,
  mapper: M
): (req: Request, res: Response) => Promise<Response>
```

**Parameters:**
- `service: Service<T>` - Service instance
- `mapper: M` - Response mapper

**URL Parameters:**
- `id: string | number` - Entity ID

**Request Body:**
- Partial entity data to update

**Response:**

```typescript
{
  success: true,
  statusCode: 200,
  message: "Data updated successfully",
  data: T,
  metadata: {}
}
```

**Example:**

```typescript
router.patch('/:id',
  validateBody(updatePostSchema),
  controller.update(postService, PostResponseMapper)
);
```

##### `delete(service, mapper)`

Handle DELETE request untuk soft delete entity.

```typescript
delete(
  service: Service<T>,
  mapper: M
): (req: Request, res: Response) => Promise<Response>
```

**Parameters:**
- `service: Service<T>` - Service instance
- `mapper: M` - Response mapper

**URL Parameters:**
- `id: string | number` - Entity ID

**Response:**

```typescript
{
  success: true,
  statusCode: 200,
  message: "Data deleted successfully",
  data: T,
  metadata: {}
}
```

**Example:**

```typescript
router.delete('/:id', controller.delete(postService, PostResponseMapper));
```

#### Helper Methods

##### `getSuccessResponse(res, responseData)`

Create success response.

```typescript
protected getSuccessResponse(
  res: Response,
  responseData: {
    data: any;
    metadata: TMetadataResponse;
    message?: string;
    statusCode?: number;
  }
): Response
```

##### `getFailureResponse(res, error)`

Create error response.

```typescript
protected getFailureResponse(
  res: Response,
  error: {
    message: string;
    statusCode?: number;
    errors?: any[];
  }
): Response
```

##### `handleError(res, error)`

Handle unexpected errors.

```typescript
protected handleError(res: Response, error: any): Response
```

#### Custom Controller Example

```typescript
import { Controller } from '@hexa-framework/core';
import { Request, Response } from 'express';

class PostController extends Controller<TPost, PostResponseMapper> {
  // Custom method
  publishPost(postService: PostService) {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const post = await postService.publishPost(parseInt(id));
        
        return this.getSuccessResponse(res, {
          data: PostResponseMapper.toResponse(post),
          metadata: {},
          message: 'Post published successfully'
        });
      } catch (error: any) {
        return this.handleError(res, error);
      }
    };
  }
}
```

---

### Service

Base service class dengan standard CRUD operations.

#### Import

```typescript
import { Service } from '@hexa-framework/core';
```

#### Class Definition

```typescript
abstract class Service<T>
```

**Type Parameters:**
- `T` - Entity type

#### Constructor

```typescript
constructor(protected repository: Repository<T>)
```

**Parameters:**
- `repository: Repository<T>` - Repository instance untuk data access

#### Methods

##### `findById(id)`

Find entity by ID.

```typescript
async findById(id: number): Promise<T | null>
```

**Example:**

```typescript
const post = await postService.findById(1);
```

##### `findAll(page, limit, filters?)`

Find all entities with pagination.

```typescript
async findAll(
  page: number,
  limit: number,
  filters?: Record<string, any>
): Promise<PaginationResult<T>>
```

**Returns:**

```typescript
{
  data: T[],
  page: number,
  limit: number,
  total: number,
  totalPages: number
}
```

**Example:**

```typescript
const result = await postService.findAll(1, 10, { status: 'published' });
```

##### `create(data)`

Create new entity.

```typescript
async create(data: Partial<T>): Promise<T>
```

**Example:**

```typescript
const newPost = await postService.create({
  title: 'New Post',
  content: 'Content...'
});
```

##### `update(id, data)`

Update entity.

```typescript
async update(id: number, data: Partial<T>): Promise<T>
```

**Example:**

```typescript
const updated = await postService.update(1, { title: 'Updated Title' });
```

##### `delete(id)`

Soft delete entity.

```typescript
async delete(id: number): Promise<T>
```

**Example:**

```typescript
const deleted = await postService.delete(1);
```

##### `hardDelete(id)`

Permanently delete entity.

```typescript
async hardDelete(id: number): Promise<void>
```

##### `createMany(data)`

Create multiple entities.

```typescript
async createMany(data: Partial<T>[]): Promise<T[]>
```

##### `count(filters?)`

Count entities.

```typescript
async count(filters?: Record<string, any>): Promise<number>
```

##### `exists(id)`

Check if entity exists.

```typescript
async exists(id: number): Promise<boolean>
```

#### Custom Service Example

```typescript
import { Service } from '@hexa-framework/core';

class PostService extends Service<TPost> {
  constructor(repository: PostRepository) {
    super(repository);
  }
  
  // Custom business logic
  async publishPost(id: number): Promise<TPost> {
    const post = await this.findById(id);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    if (post.status === 'published') {
      throw new Error('Post already published');
    }
    
    return this.update(id, {
      status: 'published',
      publishedAt: new Date()
    });
  }
  
  async getPublishedPosts(page: number, limit: number) {
    return this.findAll(page, limit, { status: 'published' });
  }
}
```

---

### Repository

Abstract repository interface.

#### Import

```typescript
import { Repository } from '@hexa-framework/core';
```

#### Interface Definition

```typescript
interface Repository<T> {
  getById(id: number): Promise<T | null>;
  getAll(page: number, limit: number, filters?: Record<string, any>): Promise<PaginationResult<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  softDelete(id: number): Promise<T>;
  hardDelete(id: number): Promise<void>;
  createMany?(data: Partial<T>[]): Promise<T[]>;
  count?(filters?: Record<string, any>): Promise<number>;
  exists?(id: number): Promise<boolean>;
}
```

#### Implementation Example

```typescript
import { Repository, PaginationResult } from '@hexa-framework/core';
import { PrismaClient } from '@prisma/client';

class PostRepository implements Repository<TPost> {
  constructor(private prisma: PrismaClient) {}
  
  async getById(id: number): Promise<TPost | null> {
    return this.prisma.post.findUnique({
      where: { id }
    });
  }
  
  async getAll(
    page: number,
    limit: number,
    filters?: Record<string, any>
  ): Promise<PaginationResult<TPost>> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.post.count({ where: filters })
    ]);
    
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  async create(data: Partial<TPost>): Promise<TPost> {
    return this.prisma.post.create({ data });
  }
  
  async update(id: number, data: Partial<TPost>): Promise<TPost> {
    return this.prisma.post.update({
      where: { id },
      data
    });
  }
  
  async softDelete(id: number): Promise<TPost> {
    return this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
  
  async hardDelete(id: number): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }
}
```

---

## Middleware

### Authentication

JWT-based authentication middleware.

#### Import

```typescript
import { createAuthMiddleware } from '@hexa-framework/core';
```

#### Function

```typescript
function createAuthMiddleware(config: AuthConfig): RequestHandler
```

#### Configuration

```typescript
interface AuthConfig {
  jwtSecret: string;
  getUserDetails?: (userId: number) => Promise<any>;
}
```

**Options:**
- `jwtSecret: string` - JWT secret key
- `getUserDetails?: Function` - Optional function to fetch additional user data

#### Usage

```typescript
import { createAuthMiddleware } from '@hexa-framework/core';

const authMiddleware = createAuthMiddleware({
  jwtSecret: process.env.JWT_SECRET!,
  getUserDetails: async (userId) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });
  }
});

// Use in routes
router.get('/profile', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});
```

#### AuthRequest Interface

```typescript
interface AuthRequest extends Request {
  user?: {
    userId: number;
    [key: string]: any;
  };
}
```

#### Response on Error

```typescript
{
  success: false,
  statusCode: 401,
  message: "Unauthorized",
  errors: ["No token provided"] // or ["Invalid token"]
}
```

---

### Permission

Role-based access control middleware.

#### Import

```typescript
import { createPermissionMiddleware } from '@hexa-framework/core';
```

#### Function

```typescript
function createPermissionMiddleware(
  requiredPermission: string,
  config: PermissionConfig
): RequestHandler
```

#### Configuration

```typescript
interface PermissionConfig {
  getUserPermissions: (userId: number) => Promise<string[]>;
  cache?: {
    ttl: number; // milliseconds
    max: number; // max entries
  };
}
```

**Options:**
- `getUserPermissions: Function` - Function to fetch user permissions
- `cache?: object` - Optional in-memory cache configuration
  - `ttl: number` - Time to live in milliseconds (default: 300000 = 5 minutes)
  - `max: number` - Maximum cache entries (default: 1000)

#### Usage

```typescript
import { createPermissionMiddleware } from '@hexa-framework/core';

const permissionMiddleware = createPermissionMiddleware(
  'post:create',
  {
    getUserPermissions: async (userId) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } }
      });
      
      return user?.role.permissions.map(p => p.code) || [];
    },
    cache: {
      ttl: 300000, // 5 minutes
      max: 1000
    }
  }
);

// Use in routes
router.post('/posts',
  authMiddleware,
  permissionMiddleware,
  createPost
);
```

#### Helper Function

```typescript
function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean
```

#### Response on Error

```typescript
{
  success: false,
  statusCode: 403,
  message: "Forbidden",
  errors: ["Insufficient permissions"]
}
```

---

### Validation

Zod schema validation middleware.

#### Import

```typescript
import { 
  createValidationMiddleware,
  validateBody,
  validateQuery,
  validateParams
} from '@hexa-framework/core';
```

#### Main Function

```typescript
function createValidationMiddleware(
  schema: z.ZodSchema,
  source: 'body' | 'query' | 'params'
): RequestHandler
```

#### Shorthand Functions

```typescript
function validateBody(schema: z.ZodSchema): RequestHandler
function validateQuery(schema: z.ZodSchema): RequestHandler
function validateParams(schema: z.ZodSchema): RequestHandler
```

#### Usage

```typescript
import { z } from 'zod';
import { validateBody } from '@hexa-framework/core';

// Define schema
const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  published: z.boolean().optional()
});

// Use in route
router.post('/posts',
  validateBody(createPostSchema),
  createPost
);
```

#### Advanced Example

```typescript
const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional()
}).refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

router.patch('/posts/:id',
  validateParams(z.object({ id: z.string().regex(/^\d+$/) })),
  validateBody(updatePostSchema),
  updatePost
);
```

#### Response on Error

```typescript
{
  success: false,
  statusCode: 400,
  message: "Validation error",
  errors: [
    {
      field: "title",
      message: "String must contain at least 1 character(s)"
    },
    {
      field: "email",
      message: "Invalid email"
    }
  ]
}
```

---

## Types

### Response Types

#### Import

```typescript
import { 
  TResponse,
  TErrorResponse,
  TMetadataResponse,
  PaginationResult
} from '@hexa-framework/core';
```

#### TResponse

```typescript
interface TResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  metadata: TMetadataResponse;
}
```

#### TErrorResponse

```typescript
interface TErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: any[];
}
```

#### TMetadataResponse

```typescript
interface TMetadataResponse {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}
```

#### PaginationResult

```typescript
interface PaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

---

## Utilities

### String Utilities

#### Import

```typescript
import { 
  toCamelCase,
  toSnakeCase,
  convertKeysToCamelCase,
  convertKeysToSnakeCase
} from '@hexa-framework/core';
```

#### Functions

##### `toCamelCase(str)`

Convert string to camelCase.

```typescript
function toCamelCase(str: string): string

// Example
toCamelCase('user_name') // => 'userName'
toCamelCase('user-name') // => 'userName'
```

##### `toSnakeCase(str)`

Convert string to snake_case.

```typescript
function toSnakeCase(str: string): string

// Example
toSnakeCase('userName') // => 'user_name'
toSnakeCase('UserName') // => 'user_name'
```

##### `convertKeysToCamelCase(obj)`

Convert all object keys to camelCase recursively.

```typescript
function convertKeysToCamelCase<T = any>(obj: any): T

// Example
convertKeysToCamelCase({
  user_name: 'John',
  created_at: '2025-01-01',
  user_profile: {
    profile_image: 'image.jpg'
  }
})
// => {
//   userName: 'John',
//   createdAt: '2025-01-01',
//   userProfile: {
//     profileImage: 'image.jpg'
//   }
// }
```

##### `convertKeysToSnakeCase(obj)`

Convert all object keys to snake_case recursively.

```typescript
function convertKeysToSnakeCase<T = any>(obj: any): T
```

### Async Utilities

#### Import

```typescript
import { asyncHandler } from '@hexa-framework/core';
```

#### asyncHandler

Wrap async route handlers to catch errors.

```typescript
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler

// Example
router.get('/posts', asyncHandler(async (req, res) => {
  const posts = await postService.findAll(1, 10);
  res.json(posts);
}));
```

---

## Complete Example

```typescript
import {
  Controller,
  Service,
  Repository,
  createAuthMiddleware,
  createPermissionMiddleware,
  validateBody,
  PaginationResult
} from '@hexa-framework/core';
import { Router } from 'express';
import { z } from 'zod';

// 1. Define types
type TPost = {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
};

// 2. Create repository
class PostRepository implements Repository<TPost> {
  // Implementation...
}

// 3. Create service
class PostService extends Service<TPost> {
  async publishPost(id: number): Promise<TPost> {
    // Custom business logic
    return this.update(id, { published: true });
  }
}

// 4. Create controller
class PostController extends Controller<TPost, PostResponseMapper> {
  publishPost(service: PostService) {
    return async (req, res) => {
      const post = await service.publishPost(parseInt(req.params.id));
      return this.getSuccessResponse(res, {
        data: PostResponseMapper.toResponse(post),
        metadata: {}
      });
    };
  }
}

// 5. Setup middleware
const authMiddleware = createAuthMiddleware({
  jwtSecret: process.env.JWT_SECRET!
});

const canCreatePost = createPermissionMiddleware('post:create', {
  getUserPermissions: async (userId) => {
    // Fetch permissions
    return ['post:create', 'post:read'];
  }
});

// 6. Define validation
const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
});

// 7. Create routes
const router = Router();
const controller = new PostController();
const service = new PostService(new PostRepository());

router.get('/', controller.findAll(service, PostResponseMapper));
router.post('/',
  authMiddleware,
  canCreatePost,
  validateBody(createPostSchema),
  controller.create(service, PostResponseMapper)
);
router.patch('/:id',
  authMiddleware,
  controller.update(service, PostResponseMapper)
);
router.delete('/:id',
  authMiddleware,
  controller.delete(service, PostResponseMapper)
);
router.post('/:id/publish',
  authMiddleware,
  controller.publishPost(service)
);

export default router;
```

---

## TypeScript Support

Semua API fully typed dengan TypeScript. IDE akan provide autocomplete dan type checking.

```typescript
// Type inference works automatically
const controller = new PostController();
//    ^ Type: Controller<TPost, PostResponseMapper>

const service = new PostService(repository);
//    ^ Type: Service<TPost>

const result = await service.findAll(1, 10);
//    ^ Type: PaginationResult<TPost>
```

---

Next: [Deployment Guide](./deployment.md)
