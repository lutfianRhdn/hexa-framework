# 🏗️ Hexagonal Architecture

> Memahami arsitektur Hexa Framework

## Apa itu Hexagonal Architecture?

Hexagonal Architecture (juga dikenal sebagai **Ports and Adapters**) adalah pola arsitektur yang memisahkan business logic dari infrastructure concerns.

### Prinsip Utama

1. **Business Logic di Tengah** - Core domain terpisah dari external dependencies
2. **Ports (Interfaces)** - Contracts yang mendefinisikan komunikasi
3. **Adapters** - Implementasi konkret dari ports
4. **Dependency Inversion** - Dependencies mengalir ke dalam, bukan ke luar

## Layer Architecture

```
┌───────────────────────────────────────────────┐
│         PRESENTATION LAYER (Transports)       │
│                                               │
│   REST API   │   GraphQL   │   WebSocket    │
│   Controllers │   Resolvers │   Handlers     │
└──────────────┬────────────────────────────────┘
               │
               │ Calls
               ▼
┌───────────────────────────────────────────────┐
│           DOMAIN LAYER (Core)                 │
│                                               │
│   Business Logic │ Entities │ Services       │
│   Repository Interfaces (Ports)              │
└──────────────┬────────────────────────────────┘
               │
               │ Implements
               ▼
┌───────────────────────────────────────────────┐
│      INFRASTRUCTURE LAYER (Adapters)          │
│                                               │
│   Database │ Cache │ External APIs            │
│   Prisma   │ Redis │ Payment Gateway         │
└───────────────────────────────────────────────┘
```

## Struktur Folder Detail

### 1. Core (Domain Layer)

```
src/core/
├── entities/          # Domain types dan business objects
│   ├── post/
│   │   └── post.ts    # Type definitions
│   └── user/
│       └── user.ts
├── repositories/      # Repository interfaces (Ports)
│   ├── Repository.ts  # Base repository interface
│   ├── post.ts        # Post repository interface
│   └── user.ts        # User repository interface
├── services/          # Business logic services
│   ├── Service.ts     # Base service class
│   ├── PostService.ts
│   └── UserService.ts
└── utils/             # Domain utilities
    └── validators.ts
```

**Prinsip:**
- ❌ **TIDAK BOLEH** import dari `adapters` atau `transports`
- ✅ **BOLEH** import dari `core` lainnya
- ✅ Define interfaces, bukan implementasi
- ✅ Pure business logic

### 2. Adapters (Infrastructure Layer)

```
src/adapters/
├── postgres/          # Database adapter
│   ├── instance.ts    # Prisma client instance
│   └── repositories/  # Repository implementations
│       ├── Repository.ts         # Base Prisma repository
│       ├── PostRepository.ts     # Post repo implementation
│       └── UserRepository.ts     # User repo implementation
├── redis/             # Cache adapter
│   └── instance.ts
├── midtrans/          # Payment gateway adapter
│   └── client.ts
└── aws/               # Cloud services adapter
    ├── s3.ts
    └── ses.ts
```

**Prinsip:**
- ✅ **Implements** interfaces dari `core/repositories`
- ✅ **BOLEH** import dari `core`
- ✅ Contains external dependencies (Prisma, Redis, etc.)
- ❌ **TIDAK BOLEH** contain business logic

### 3. Transports (Presentation Layer)

```
src/transports/
└── api/
    ├── controllers/      # REST controllers
    │   ├── Controller.ts       # Base controller
    │   ├── PostController.ts
    │   └── UserController.ts
    ├── routers/          # Express routers
    │   └── v1/
    │       ├── index.ts
    │       ├── post.ts
    │       └── user.ts
    └── validations/      # Request validation schemas
        ├── post.ts
        └── user.ts
```

**Prinsip:**
- ✅ **BOLEH** import dari `core` dan `adapters`
- ✅ Handle HTTP requests/responses
- ✅ Validation dan transformation
- ❌ **TIDAK BOLEH** contain business logic

### 4. Policies (Cross-cutting Concerns)

```
src/policies/
├── authMiddleware.ts      # JWT authentication
└── permissionMiddleware.ts # Role-based access control
```

**Prinsip:**
- ✅ Reusable middleware
- ✅ Security concerns
- ✅ Can be used across transports

### 5. Mappers (Data Transformation)

```
src/mappers/
├── entity/           # Database → Domain
│   └── PostMapper.ts
└── response/         # Domain → API Response
    └── PostResponseMapper.ts
```

**Prinsip:**
- ✅ Transform data between layers
- ✅ Keep entities clean
- ✅ Handle snake_case ↔ camelCase

### 6. Configs (Configuration)

```
src/configs/
├── env.ts                  # Environment variables
├── AdapterRegistry.ts      # DI for adapters
└── TransportRegistry.ts    # DI for transports
```

## Dependency Flow

```
┌─────────────────┐
│   Transports    │
│  (Controllers)  │
└────────┬────────┘
         │ depends on
         ▼
┌─────────────────┐
│      Core       │
│   (Services)    │
└────────┬────────┘
         │ defines
         ▼
┌─────────────────┐
│   Interfaces    │
│ (Repositories)  │
└────────┬────────┘
         │ implemented by
         ▼
┌─────────────────┐
│    Adapters     │
│ (Repositories)  │
└─────────────────┘
```

**Key Rule: Dependencies flow INWARD**

## Design Patterns yang Digunakan

### 1. Repository Pattern

Abstraksi data access layer.

```typescript
// Interface (Port) - di core/repositories/
interface PostRepository extends Repository<Post> {
  // Methods inherited from base Repository
}

// Implementation (Adapter) - di adapters/postgres/
class PostRepository extends Repository<Post> {
  constructor() {
    super("post"); // table name
  }
  
  // Prisma implementation
}
```

### 2. Service Pattern

Business logic encapsulation.

```typescript
class PostService extends Service<Post> {
  constructor(repository: PostRepository) {
    super(repository);
  }
  
  // Custom business methods
  async publishPost(id: number): Promise<Post> {
    // Business logic here
  }
}
```

### 3. Dependency Injection

Dependencies injected via constructor.

```typescript
// Create dependencies
const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const postController = new PostController();

// Use in routes
router.get('/', postController.findAll(postService, PostMapper));
```

### 4. Factory Pattern

Object creation abstraction.

```typescript
// Registry pattern for factories
class AdapterRegistry {
  static loadAdapters() {
    PostgresAdapter.initialize();
    RedisAdapter.initialize();
  }
}
```

### 5. Strategy Pattern

Multiple algorithm implementations.

```typescript
// Different strategies for payment
interface PaymentStrategy {
  processPayment(amount: number): Promise<boolean>;
}

class MidtransStrategy implements PaymentStrategy {
  // Midtrans implementation
}

class StripeStrategy implements PaymentStrategy {
  // Stripe implementation
}
```

## Benefits

### 1. **Testability**

Mudah di-test karena business logic terpisah dari infrastructure:

```typescript
// Test service tanpa database
const mockRepo = {
  getById: jest.fn(),
  create: jest.fn(),
};
const service = new PostService(mockRepo);
```

### 2. **Maintainability**

Perubahan di satu layer tidak affect layer lain:

- Ganti database? Update adapters saja
- Ganti dari REST ke GraphQL? Update transports saja
- Business logic berubah? Update core saja

### 3. **Scalability**

Mudah add features baru tanpa breaking existing code:

```
# Add new adapter
src/adapters/mongodb/
  └── repositories/

# Add new transport
src/transports/graphql/
  └── resolvers/
```

### 4. **Reusability**

Core logic bisa digunakan di multiple transports:

```
Core Logic (PostService)
    ↓
    ├─> REST API
    ├─> GraphQL API
    ├─> WebSocket
    └─> CLI Commands
```

## Best Practices

### ✅ DO

1. Keep business logic in `core/services`
2. Use interfaces in `core/repositories`
3. Implement interfaces in `adapters`
4. Keep controllers thin (only orchestration)
5. Use dependency injection
6. Write tests for core logic

### ❌ DON'T

1. Import adapters in core
2. Import transports in core
3. Put business logic in controllers
4. Put business logic in repositories
5. Direct database access from controllers
6. Tight coupling between layers

## Example: Adding New Feature

### Scenario: Add "Like" feature to Post

#### 1. Update Entity (Core)

```typescript
// src/core/entities/post/post.ts
export type TPost = {
  id: number;
  title: string;
  content: string;
  likes: number; // Add this
  // ...
};
```

#### 2. Add Business Logic (Core)

```typescript
// src/core/services/PostService.ts
async likePost(id: number): Promise<Post> {
  const post = await this.findById(id);
  if (!post) throw new Error('Post not found');
  
  return this.repository.update(id, {
    likes: post.likes + 1
  });
}
```

#### 3. Add Controller Method (Transport)

```typescript
// src/transports/api/controllers/PostController.ts
likePost(postService: PostService) {
  return async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await postService.likePost(parseInt(id));
    return this.getSuccessResponse(res, {
      data: post,
      metadata: {}
    });
  };
}
```

#### 4. Add Route (Transport)

```typescript
// src/transports/api/routers/v1/post.ts
router.post('/:id/like', postController.likePost(postService));
```

#### 5. Update Database (Adapter)

```bash
# Update Prisma schema
# prisma/schema.prisma
model Post {
  likes Int @default(0)
}

# Run migration
npx prisma migrate dev --name add-post-likes
```

**✅ Done!** Feature baru tanpa breaking existing code.

## Summary

Hexa Framework menggunakan **Hexagonal Architecture** untuk:

- 🎯 **Separation of Concerns** - Each layer has clear responsibility
- 🔄 **Flexibility** - Easy to swap implementations
- 🧪 **Testability** - Business logic independent of infrastructure
- 📈 **Scalability** - Easy to add new features
- 🛡️ **Maintainability** - Changes isolated to specific layers

---

Next: [CLI Reference](./cli-reference.md)
