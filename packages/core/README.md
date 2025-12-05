# @hexa-framework/core

> Core package for Hexa Framework - Base classes, middleware, and utilities

## Installation

```bash
npm install @hexa-framework/core
```

## What's Included

### Base Classes

- **Controller** - Generic REST controller with CRUD operations
- **Service** - Generic service layer for business logic
- **Repository** - Generic repository interface for data access

### Middleware

- **authMiddleware** - JWT authentication
- **permissionMiddleware** - Role-based access control
- **validationMiddleware** - Zod schema validation

### Types

- `TResponse` - Standard API response format
- `TErrorResponse` - Error response format
- `TMetadataResponse` - Pagination metadata
- `PaginationResult` - Repository pagination result
- And more...

### Utilities

- String transformations (camelCase, snake_case, PascalCase, etc.)
- Async utilities (retry, sleep)
- Object utilities (deepClone, compact, isEmpty)

## Quick Example

```typescript
import {
  Controller,
  Service,
  Repository,
  authMiddleware,
  validateBody,
} from '@hexa-framework/core';
import { z } from 'zod';

// Define entity
interface Post {
  id: number;
  title: string;
  content: string;
}

// Create repository (implement with Prisma, TypeORM, etc.)
class PostRepository extends Repository<Post> {
  // Implement abstract methods
}

// Create service
class PostService extends Service<Post> {
  constructor() {
    super(new PostRepository());
  }
}

// Create controller
class PostController extends Controller<Post, TMetadataResponse> {
  // CRUD methods inherited automatically
}

// Use in routes
const postController = new PostController();
const postService = new PostService();

router.get(
  '/posts',
  authMiddleware,
  postController.findAll(postService, PostMapper)
);

// With validation
const createSchema = z.object({
  title: z.string().min(3),
  content: z.string(),
});

router.post(
  '/posts',
  authMiddleware,
  validateBody(createSchema),
  postController.create(postService, PostMapper)
);
```

## Documentation

See [main documentation](../../docs) for detailed usage.

## License

MIT © lutfian.rhdn
