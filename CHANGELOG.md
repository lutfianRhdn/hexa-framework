# Changelog

All notable changes to the Hexa Framework will be documented in this file.

## [1.0.1] - 2025-01-XX

### Added - create-hexa-framework-app

#### Example Files Generated
- **User Entity** (`src/core/entities/User.ts`)
  - Complete User interface with DTOs
  - Type definitions for Create, Update, and Response
  
- **Repository Layer** 
  - Interface: `src/core/repositories/IUserRepository.ts`
  - Implementation: `src/adapters/postgres/repositories/PostgresUserRepository.ts`
  - Full CRUD operations with Prisma
  - Custom methods: findByEmail, findByUsername, softDelete
  
- **Service Layer** (`src/core/services/UserService.ts`)
  - Extends BaseService from hexa-framework-core
  - Business logic: validation, password hashing with bcrypt
  - User CRUD operations with proper error handling
  - Pagination support
  
- **Controller Layer** (`src/transports/api/controllers/UserController.ts`)
  - Extends BaseController with asyncHandler
  - REST API handlers: create, read, update, delete
  - Proper HTTP status codes and responses
  
- **Routing** (`src/transports/api/routers/v1/userRouter.ts`)
  - Complete REST API routes
  - Dependency injection pattern
  - Route documentation
  
- **Validation** (`src/transports/api/validations/userValidation.ts`)
  - Zod schemas for input validation
  - createUserSchema and updateUserSchema
  - Type inference with TypeScript
  
- **Response Mapper** (`src/mappers/response/userMapper.ts`)
  - Transform entities to API responses
  - Hide sensitive fields (password)
  
- **Policy/Middleware** (`src/policies/authPolicy.ts`)
  - Example authentication middleware
  - Authorization examples (isAuthenticated, isAdmin)
  
- **Configuration**
  - Database config (`src/configs/database.ts`)
  - Environment config with validation (`src/configs/env.ts`)
  - Prisma schema with User model
  - Updated index.ts with user routes

#### Dependencies Added
- `bcrypt` for password hashing
- `@types/bcrypt` for TypeScript support

### Changed
- Updated project generation to create complete working example
- Enhanced Prisma schema with uncommented User model
- Improved main index.ts with better structure and user routes integration

### Fixed
- Issue where only empty folders were generated
- Missing example files in generated projects

## [1.0.0] - 2025-01-XX

### Published
- **hexa-framework-core** - Core abstractions and base classes
- **hexa-framework-cli** - CLI tool for code generation
- **create-hexa-framework-app** - Project scaffolding tool

### Features
- Hexagonal architecture implementation
- TypeScript support
- Express.js integration
- Prisma ORM support
- Complete project setup with all configurations

---

## Example Project Structure (v1.0.1)

```
my-app/
├── src/
│   ├── core/
│   │   ├── entities/
│   │   │   └── User.ts              ✅ NEW
│   │   ├── repositories/
│   │   │   └── IUserRepository.ts   ✅ NEW
│   │   └── services/
│   │       └── UserService.ts        ✅ NEW
│   ├── adapters/
│   │   └── postgres/
│   │       └── repositories/
│   │           └── PostgresUserRepository.ts  ✅ NEW
│   ├── transports/
│   │   └── api/
│   │       ├── controllers/
│   │       │   └── UserController.ts  ✅ NEW
│   │       ├── routers/
│   │       │   └── v1/
│   │       │       └── userRouter.ts  ✅ NEW
│   │       └── validations/
│   │           └── userValidation.ts  ✅ NEW
│   ├── mappers/
│   │   └── response/
│   │       └── userMapper.ts         ✅ NEW
│   ├── policies/
│   │   └── authPolicy.ts             ✅ NEW
│   ├── configs/
│   │   ├── database.ts               ✅ NEW
│   │   └── env.ts                    ✅ NEW
│   └── index.ts                      ✅ UPDATED
├── prisma/
│   └── schema.prisma                 ✅ UPDATED (User model)
├── .env.example
├── package.json                       ✅ UPDATED (bcrypt added)
├── tsconfig.json
└── README.md
```

## API Endpoints (Example)

After running the generated project, you'll have these endpoints available:

```
POST   /api/v1/users          - Create user
GET    /api/v1/users          - Get all users (with pagination)
GET    /api/v1/users/:id      - Get user by ID
PUT    /api/v1/users/:id      - Update user
DELETE /api/v1/users/:id      - Delete user (soft delete)
```

## Quick Start with v1.0.1

```bash
# Create new project
npx create-hexa-framework-app@latest my-app

# Navigate to project
cd my-app

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Install dependencies (already done by scaffolding tool)
# npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Start development server
npm run dev
```

The server will start with a complete User CRUD API ready to use!
