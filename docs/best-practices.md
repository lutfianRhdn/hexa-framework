# ✨ Best Practices

> Panduan best practices untuk development dengan Hexa Framework

## Table of Contents

- [Project Structure](#project-structure)
- [Code Organization](#code-organization)
- [TypeScript](#typescript)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Performance](#performance)
- [Security](#security)
- [Git Workflow](#git-workflow)
- [Code Quality](#code-quality)

---

## Project Structure

### ✅ Recommended Structure

```
my-api/
├── src/
│   ├── core/                    # Business logic
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── adapters/                # Infrastructure
│   │   └── postgres/
│   ├── transports/              # API layer
│   │   └── api/
│   ├── policies/                # Middleware
│   ├── mappers/                 # Data transformation
│   ├── configs/                 # Configuration
│   └── index.ts                 # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/
└── scripts/
```

### File Naming Conventions

```
✅ DO:
- PascalCase for classes: PostService.ts, UserController.ts
- camelCase for files: userUtils.ts, authMiddleware.ts
- kebab-case for folders: user-management/, order-processing/

❌ DON'T:
- Mixed conventions: User_Service.ts
- Unclear names: utils.ts, helper.ts
- Too long: UserManagementServiceImplementation.ts
```

---

## Code Organization

### Single Responsibility Principle

```typescript
// ❌ BAD: Controller doing too much
class PostController {
  async create(req: Request, res: Response) {
    // Validation
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title required' });
    }
    
    // Business logic
    const slug = req.body.title.toLowerCase().replace(/\s/g, '-');
    
    // Database access
    const post = await prisma.post.create({
      data: { ...req.body, slug }
    });
    
    // Response formatting
    return res.json({
      success: true,
      data: {
        id: post.id,
        title: post.title,
        createdAt: post.created_at
      }
    });
  }
}

// ✅ GOOD: Separated concerns
class PostController extends Controller<TPost, PostResponseMapper> {
  // Only handles HTTP request/response
}

class PostService extends Service<TPost> {
  async create(data: TCreatePost): Promise<TPost> {
    // Business logic
    const slug = this.generateSlug(data.title);
    return this.repository.create({ ...data, slug });
  }
  
  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/\s/g, '-');
  }
}

class PostRepository implements Repository<TPost> {
  // Only database operations
  async create(data: Partial<TPost>): Promise<TPost> {
    return this.prisma.post.create({ data });
  }
}
```

### Dependency Injection

```typescript
// ❌ BAD: Hard-coded dependencies
class PostService {
  private repository = new PostRepository();
  
  async findById(id: number) {
    return this.repository.getById(id);
  }
}

// ✅ GOOD: Injected dependencies
class PostService extends Service<TPost> {
  constructor(private repository: PostRepository) {
    super(repository);
  }
  
  async findById(id: number) {
    return this.repository.getById(id);
  }
}

// Easy to test with mock
const mockRepo = { getById: jest.fn() };
const service = new PostService(mockRepo);
```

### Configuration Management

```typescript
// ✅ GOOD: Centralized configuration
// src/configs/env.ts
export const config = {
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:3000'
  },
  database: {
    url: process.env.DATABASE_URL!
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
} as const;

// Validate on startup
function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
```

---

## TypeScript

### Type Safety

```typescript
// ❌ BAD: Using 'any'
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ GOOD: Proper types
interface DataItem {
  id: number;
  value: string;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}

// ✅ BETTER: Generic types
function processData<T extends { value: string }>(data: T[]): string[] {
  return data.map(item => item.value);
}
```

### Type Guards

```typescript
// ✅ GOOD: Type guards
function isPost(obj: any): obj is TPost {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string'
  );
}

function processPost(data: unknown) {
  if (isPost(data)) {
    console.log(data.title); // TypeScript knows it's TPost
  }
}
```

### Avoid Type Assertions

```typescript
// ❌ BAD: Type assertions everywhere
const post = await getPost() as TPost;
const id = (req.params.id as unknown) as number;

// ✅ GOOD: Proper validation
const post = await getPost();
if (!post) throw new Error('Post not found');

const id = parseInt(req.params.id);
if (isNaN(id)) throw new Error('Invalid ID');
```

### Strict TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## Error Handling

### Custom Error Classes

```typescript
// ✅ GOOD: Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401);
  }
}

// Usage
throw new NotFoundError('Post');
throw new ValidationError('Invalid email format');
```

### Global Error Handler

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', error);
  
  // Handle AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      errors: []
    });
  }
  
  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Database error',
      errors: [error.message]
    });
  }
  
  // Unknown errors
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? [error.message] : []
  });
}

// Register in app
app.use(errorHandler);
```

### Try-Catch Best Practices

```typescript
// ❌ BAD: Silent failure
async function getPost(id: number) {
  try {
    return await postService.findById(id);
  } catch (error) {
    return null;
  }
}

// ✅ GOOD: Proper error handling
async function getPost(id: number): Promise<TPost> {
  try {
    const post = await postService.findById(id);
    if (!post) {
      throw new NotFoundError('Post');
    }
    return post;
  } catch (error) {
    // Log error
    logger.error('Failed to get post', { id, error });
    throw error; // Re-throw
  }
}
```

---

## Testing

### Unit Tests

```typescript
// tests/unit/services/PostService.test.ts
import { PostService } from '@/core/services/PostService';

describe('PostService', () => {
  let service: PostService;
  let mockRepository: jest.Mocked<PostRepository>;
  
  beforeEach(() => {
    mockRepository = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    } as any;
    
    service = new PostService(mockRepository);
  });
  
  describe('findById', () => {
    it('should return post when exists', async () => {
      const mockPost = { id: 1, title: 'Test' };
      mockRepository.getById.mockResolvedValue(mockPost);
      
      const result = await service.findById(1);
      
      expect(result).toEqual(mockPost);
      expect(mockRepository.getById).toHaveBeenCalledWith(1);
    });
    
    it('should return null when not exists', async () => {
      mockRepository.getById.mockResolvedValue(null);
      
      const result = await service.findById(999);
      
      expect(result).toBeNull();
    });
  });
  
  describe('create', () => {
    it('should create post with generated slug', async () => {
      const input = { title: 'My Post', content: 'Content' };
      const expected = { ...input, slug: 'my-post', id: 1 };
      mockRepository.create.mockResolvedValue(expected);
      
      const result = await service.create(input);
      
      expect(result).toEqual(expected);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...input,
        slug: 'my-post'
      });
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/post.test.ts
import request from 'supertest';
import { app } from '@/index';
import { prisma } from '@/configs/database';

describe('POST /api/v1/posts', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  it('should create new post', async () => {
    const response = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Post',
        content: 'Test content'
      })
      .expect(201);
    
    expect(response.body).toMatchObject({
      success: true,
      data: {
        title: 'Test Post',
        content: 'Test content'
      }
    });
  });
  
  it('should return 400 when title is missing', async () => {
    const response = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Test content' })
      .expect(400);
    
    expect(response.body.success).toBe(false);
  });
});
```

### Test Coverage

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## Performance

### Database Queries

```typescript
// ❌ BAD: N+1 query problem
async function getPosts() {
  const posts = await prisma.post.findMany();
  
  for (const post of posts) {
    post.author = await prisma.user.findUnique({
      where: { id: post.authorId }
    });
  }
  
  return posts;
}

// ✅ GOOD: Include relation
async function getPosts() {
  return prisma.post.findMany({
    include: {
      author: true
    }
  });
}
```

### Pagination

```typescript
// ✅ GOOD: Always paginate
async function getPosts(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count()
  ]);
  
  return {
    data: posts,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}
```

### Caching

```typescript
// ✅ GOOD: Cache frequently accessed data
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getPost(id: number): Promise<TPost> {
  // Try cache first
  const cached = await redis.get(`post:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Get from database
  const post = await prisma.post.findUnique({ where: { id } });
  
  // Cache for 5 minutes
  if (post) {
    await redis.setex(`post:${id}`, 300, JSON.stringify(post));
  }
  
  return post;
}
```

### Async Operations

```typescript
// ❌ BAD: Sequential operations
async function processData() {
  const users = await getUsers();
  const posts = await getPosts();
  const comments = await getComments();
  return { users, posts, comments };
}

// ✅ GOOD: Parallel operations
async function processData() {
  const [users, posts, comments] = await Promise.all([
    getUsers(),
    getPosts(),
    getComments()
  ]);
  return { users, posts, comments };
}
```

---

## Security

### Input Validation

```typescript
// ✅ GOOD: Always validate input
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string()).max(10).optional()
});

// Use in route
router.post('/', validateBody(createPostSchema), createPost);
```

### SQL Injection Prevention

```typescript
// ✅ GOOD: Use Prisma (parameterized queries)
await prisma.post.findMany({
  where: { authorId: userId }
});

// ❌ BAD: Raw SQL with string interpolation
await prisma.$queryRaw`SELECT * FROM posts WHERE author_id = ${userId}`;

// ✅ GOOD: Parameterized raw query
await prisma.$queryRaw`SELECT * FROM posts WHERE author_id = ${userId}`;
```

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

// ✅ GOOD: Hash passwords
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### JWT Best Practices

```typescript
// ✅ GOOD: Short expiration + refresh tokens
const accessToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET!,
  { expiresIn: '15m' } // Short expiration
);

const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: '7d' }
);
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
});

router.post('/login', loginLimiter, login);
```

---

## Git Workflow

### Commit Messages

```bash
# ✅ GOOD: Conventional commits
feat: add user registration endpoint
fix: resolve null pointer in PostService
docs: update API documentation
refactor: extract validation to middleware
test: add unit tests for UserService
chore: update dependencies

# ❌ BAD
update stuff
fix bug
wip
```

### Branch Naming

```bash
# ✅ GOOD
feature/user-authentication
fix/post-creation-bug
refactor/service-layer
docs/api-documentation

# ❌ BAD
new-feature
bugfix
updates
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

---

## Code Quality

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests"
    ]
  }
}
```

---

## Documentation

### Code Comments

```typescript
// ✅ GOOD: Comment WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API
// when retrying failed requests
async function retryWithBackoff(fn: Function, maxRetries: number) {
  // Implementation...
}

// ❌ BAD: Obvious comments
// Get post by ID
async function getPost(id: number) {
  return await prisma.post.findUnique({ where: { id } });
}
```

### JSDoc

```typescript
/**
 * Publishes a draft post.
 * 
 * @param id - The post ID
 * @returns The published post
 * @throws {NotFoundError} If post doesn't exist
 * @throws {ValidationError} If post is already published
 */
async function publishPost(id: number): Promise<TPost> {
  // Implementation...
}
```

---

## Summary

**Key Takeaways:**

1. 🏗️ **Structure**: Follow hexagonal architecture strictly
2. 📝 **Types**: Use TypeScript strictly, avoid 'any'
3. 🛡️ **Errors**: Create custom error classes
4. ✅ **Tests**: Write unit and integration tests
5. ⚡ **Performance**: Optimize queries, use caching
6. 🔒 **Security**: Validate input, hash passwords, use JWT properly
7. 📚 **Documentation**: Comment WHY, not WHAT
8. 🔍 **Code Quality**: Use ESLint, Prettier, pre-commit hooks

---

🎉 **Selesai!** Anda sekarang memiliki panduan lengkap untuk development dengan Hexa Framework.

Untuk memulai project baru:

```bash
npx create-hexa-app my-api
cd my-api
npm run dev
```

Happy coding! 🚀
