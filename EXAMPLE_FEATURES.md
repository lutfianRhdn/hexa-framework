# Create Hexa Framework App v1.0.1 - Complete with Examples! 🎉

## What's New?

**Version 1.0.1** now generates a **fully working example** with complete User CRUD implementation!

### Problem Fixed
In v1.0.0, `npx create-hexa-framework-app` only generated empty folders. Users reported:
> "kenapa ketika saya generate dengan npx create-hexa-app hanya di generate foldernya saja"

**Now in v1.0.1**: Complete working example with all files generated! ✅

---

## Generated Example Files

### 1. **User Entity** (`src/core/entities/User.ts`)
```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateUserDTO = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
export type UserResponse = Omit<User, 'password'>;
```

### 2. **Repository Interface** (`src/core/repositories/IUserRepository.ts`)
```typescript
import { BaseRepository } from 'hexa-framework-core';

export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  softDelete(id: number): Promise<void>;
}
```

### 3. **Prisma Repository Implementation** (`src/adapters/postgres/repositories/PostgresUserRepository.ts`)
- Full CRUD operations using Prisma
- Custom methods: `findByEmail`, `findByUsername`, `softDelete`
- Pagination support
- Soft delete implementation

### 4. **User Service** (`src/core/services/UserService.ts`)
- Extends `BaseService` from hexa-framework-core
- Password hashing with bcrypt
- Email and username uniqueness validation
- Business logic layer
- Error handling

### 5. **User Controller** (`src/transports/api/controllers/UserController.ts`)
- Extends `BaseController` with asyncHandler
- REST API handlers:
  - `createUser` - POST /api/v1/users
  - `getUser` - GET /api/v1/users/:id
  - `getAllUsers` - GET /api/v1/users (with pagination)
  - `updateUser` - PUT /api/v1/users/:id
  - `deleteUser` - DELETE /api/v1/users/:id

### 6. **User Router** (`src/transports/api/routers/v1/userRouter.ts`)
```typescript
import { Router } from 'express';

const router = Router();

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
```

### 7. **Validation Schemas** (`src/transports/api/validations/userValidation.ts`)
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).default('user'),
  isActive: z.boolean().default(true)
});
```

### 8. **Response Mapper** (`src/mappers/response/userMapper.ts`)
```typescript
export function userResponseMapper(user: UserResponse) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
```

### 9. **Auth Policy/Middleware** (`src/policies/authPolicy.ts`)
- Example authentication middleware
- `isAuthenticated` - Check JWT token
- `isAdmin` - Role-based authorization

### 10. **Configuration Files**

**Database Config** (`src/configs/database.ts`)
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});
```

**Environment Config** (`src/configs/env.ts`)
```typescript
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
};
```

### 11. **Prisma Schema** (`prisma/schema.prisma`)
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  username  String    @unique
  password  String
  role      String    @default("user")
  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}
```

### 12. **Main Application** (`src/index.ts`)
- Express app setup
- Middleware configuration (helmet, cors, compression)
- User routes registered
- Error handling
- Health check endpoint

---

## Quick Start

### 1. Create New Project
```bash
npx create-hexa-framework-app@latest my-app
```

### 2. Setup Environment
```bash
cd my-app
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=3000
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Database Migration
```bash
npx prisma migrate dev --name init
```

### 5. Start Development Server
```bash
npm run dev
```

Your API will be available at: `http://localhost:3000`

---

## API Endpoints

### Create User
```bash
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "secret123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### Get All Users (with Pagination)
```bash
GET http://localhost:3000/api/v1/users?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Get User by ID
```bash
GET http://localhost:3000/api/v1/users/1
```

### Update User
```bash
PUT http://localhost:3000/api/v1/users/1
Content-Type: application/json

{
  "username": "john_updated",
  "isActive": false
}
```

### Delete User (Soft Delete)
```bash
DELETE http://localhost:3000/api/v1/users/1
```

---

## Project Structure

```
my-app/
├── src/
│   ├── core/                           # Domain layer
│   │   ├── entities/
│   │   │   └── User.ts                 ✅ Example entity
│   │   ├── repositories/
│   │   │   └── IUserRepository.ts      ✅ Repository interface
│   │   └── services/
│   │       └── UserService.ts          ✅ Business logic
│   ├── adapters/                       # External adapters
│   │   └── postgres/
│   │       └── repositories/
│   │           └── PostgresUserRepository.ts  ✅ Prisma implementation
│   ├── transports/                     # API layer
│   │   └── api/
│   │       ├── controllers/
│   │       │   └── UserController.ts   ✅ HTTP handlers
│   │       ├── routers/
│   │       │   └── v1/
│   │       │       └── userRouter.ts   ✅ Routes
│   │       └── validations/
│   │           └── userValidation.ts   ✅ Zod schemas
│   ├── mappers/                        # Response transformation
│   │   └── response/
│   │       └── userMapper.ts           ✅ Hide sensitive data
│   ├── policies/                       # Middleware
│   │   └── authPolicy.ts               ✅ Auth examples
│   ├── configs/                        # Configuration
│   │   ├── database.ts                 ✅ Prisma client
│   │   └── env.ts                      ✅ Env validation
│   └── index.ts                        ✅ Main app
├── prisma/
│   └── schema.prisma                   ✅ User model
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Features Demonstrated

### ✅ Hexagonal Architecture
- Clear separation of concerns
- Domain layer (entities, services, repositories)
- Adapters layer (Prisma implementation)
- Transports layer (Express REST API)

### ✅ TypeScript
- Full type safety
- DTOs for data transfer
- Type inference with Zod

### ✅ Validation
- Input validation with Zod schemas
- Custom error messages
- Type-safe validation

### ✅ Security
- Password hashing with bcrypt
- Helmet for HTTP headers
- CORS configuration
- Example auth middleware

### ✅ Database
- Prisma ORM
- Soft delete pattern
- Pagination support
- Custom queries

### ✅ Error Handling
- Global error handler
- Async error handling with asyncHandler
- Zod validation errors
- Custom error messages

### ✅ Response Transformation
- Hide sensitive fields (password)
- Consistent response format
- Response mappers

---

## Dependencies Included

### Production
- `express` - Web framework
- `hexa-framework-core` - Core abstractions
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing (✨ NEW in v1.0.1)
- `zod` - Validation
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `helmet` - Security headers
- `compression` - Response compression
- `morgan` - HTTP logging

### Development
- `typescript` - TypeScript compiler
- `@types/*` - Type definitions
- `prisma` - Prisma CLI
- `ts-node` - TypeScript execution
- `nodemon` - Auto-reload
- `@types/bcrypt` - Bcrypt types (✨ NEW in v1.0.1)

---

## What's Next?

### Extend the Example
1. **Add Authentication**
   - Implement JWT authentication
   - Login/logout endpoints
   - Token refresh

2. **Add More Entities**
   - Posts, Comments, etc.
   - Relationships between entities

3. **Add Tests**
   - Unit tests for services
   - Integration tests for API

4. **Add More Features**
   - File upload
   - Email notifications
   - Background jobs

### Use the CLI Tool
```bash
# Generate new entity
npx hexa-framework-cli generate entity Product

# Generate service
npx hexa-framework-cli generate service Product

# Generate controller
npx hexa-framework-cli generate controller Product
```

---

## Comparison: v1.0.0 vs v1.0.1

| Feature | v1.0.0 | v1.0.1 |
|---------|--------|--------|
| Folder structure | ✅ | ✅ |
| Config files | ✅ | ✅ |
| Example entity | ❌ | ✅ |
| Example repository | ❌ | ✅ |
| Example service | ❌ | ✅ |
| Example controller | ❌ | ✅ |
| Example router | ❌ | ✅ |
| Example validation | ❌ | ✅ |
| Example mapper | ❌ | ✅ |
| Example middleware | ❌ | ✅ |
| Working API | ❌ | ✅ |
| Database config | ❌ | ✅ |
| Environment config | ❌ | ✅ |
| Prisma User model | ❌ | ✅ |

---

## Published Packages

### npm Registry
- ✅ **create-hexa-framework-app@1.0.1** - Scaffolding tool with examples
- ✅ **hexa-framework-core@1.0.0** - Core abstractions
- ✅ **hexa-framework-cli@1.0.0** - CLI tool

### Installation
```bash
# Latest version (v1.0.1)
npx create-hexa-framework-app@latest my-app

# Specific version
npx create-hexa-framework-app@1.0.1 my-app
```

---

## Support & Resources

### Documentation
- [Framework Documentation](./docs/api-reference.md)
- [Deployment Guide](./docs/deployment.md)
- [Best Practices](./docs/best-practices.md)

### GitHub Repository
```bash
git clone https://github.com/lutfian-rhdn/hexa-framework.git
```

### Issues & Feedback
If you encounter any issues or have suggestions, please open an issue on GitHub.

---

## License

MIT

---

**Happy Coding! 🎉**

Now you can start building your hexagonal architecture application with a complete working example!
