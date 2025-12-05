# 🔷 Hexa Framework CLI

> **Like Laravel Artisan for TypeScript** - Powerful CLI tool for Hexa Framework with code generation, database migrations, and project scaffolding

[![npm version](https://img.shields.io/npm/v/hexa-framework-cli.svg)](https://www.npmjs.com/package/hexa-framework-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **Make Commands** - Like Laravel Artisan (make:controller, make:service, etc.)
- 🗄️ **Database Migrations** - Prisma-powered migration management
- 🚀 **Dev Server** - Hot reload development server
- 📋 **List Commands** - View routes, controllers, and middleware
- 🏗️ **Full CRUD Generation** - Complete resource scaffolding
- 🎯 **Smart Naming** - Automatic PascalCase, camelCase, kebab-case conversion

## 📦 Installation

```bash
# Global installation
npm install -g hexa-framework-cli

# Or in your project
npm install --save-dev hexa-framework-cli
```

## 🚀 Quick Start

```bash
# View all available commands
hexa info

# Create a resource controller
hexa make:controller User --resource

# Start development server
hexa serve

# Run database migrations
hexa migrate

# List all routes
hexa route:list
```

## 📚 Usage

### Make Commands (New in v1.1.0!)

Create individual components like Laravel Artisan:

```bash
# Controllers
hexa make:controller User              # Basic controller
hexa make:controller Product -r        # Resource controller (CRUD)

# Services
hexa make:service User

# Repositories
hexa make:repository User

# Entities
hexa make:entity User

# Middleware
hexa make:middleware Auth

# DTOs
hexa make:dto CreateUser
```

### Database Commands

Manage your database migrations:

```bash
hexa migrate                  # Run pending migrations
hexa migrate --seed           # Migrate and seed
hexa migrate:fresh            # Drop all tables and re-migrate
hexa migrate:reset            # Reset database
hexa migrate:status           # Check migration status
hexa db:seed                  # Seed database
```

### Development Commands

```bash
hexa serve                    # Start dev server (port 3000)
hexa serve --port 4000        # Custom port
hexa build                    # Build for production
```

### List Commands

```bash
hexa route:list              # Display all routes in table
hexa controller:list         # List all controllers
hexa middleware:list         # List all middleware
```

### Generate Resource (All-in-One)

Generate complete resource files (entity, repository, service, controller, router, validation, mapper):

```bash
# Interactive mode
hexa generate

# With resource name
hexa generate post

# Shorthand
hexa g product
```

### Permission Commands

```bash
# Scan routers and generate permissions.json
hexa permission scan

# Verify permission coverage
hexa permission verify
```

## What Gets Generated?

When you run `hexa generate <resource>`, the CLI creates:

1. **Entity** (`src/core/entities/<resource>/<resource>.ts`)
   - Type definitions
   - Request/Response types

2. **Repository Interface** (`src/core/repositories/<resource>.ts`)
   - Repository contract

3. **Repository Adapter** (`src/adapters/postgres/repositories/<Resource>Repository.ts`)
   - Prisma implementation

4. **Service** (`src/core/services/<Resource>Service.ts`)
   - Business logic layer

5. **Controller** (`src/transports/api/controllers/<Resource>Controller.ts`)
   - REST API controller

6. **Router** (`src/transports/api/routers/v1/<resource>.ts`)
   - Express routes with middleware

7. **Validation** (`src/transports/api/validations/<resource>.ts`)
   - Zod schemas

8. **Mapper** (`src/mappers/<resource>/mapper.ts`)
   - Entity/Response transformation

## Example

```bash
$ hexa generate post

🔷 Hexa Framework - Resource Generator

✔ Resource name: post
✔ Field name: title
✔ Field type: string
✔ Is this field required? yes
✔ Field name: content
✔ Field type: string
✔ Is this field required? yes
✔ Field name:  (empty to finish)

✔ Generate 5 files for 'post'? yes

✔ Files generated successfully!

✅ Generated files:
  - src/core/entities/post/post.ts
  - src/core/repositories/post.ts
  - src/adapters/postgres/repositories/PostRepository.ts
  - src/core/services/PostService.ts
  - src/transports/api/controllers/PostController.ts
  - src/transports/api/routers/v1/post.ts
  - src/transports/api/validations/post.ts
  - src/mappers/post/

📝 Next steps:
  1. Add router to src/transports/api/routers/v1/index.ts
  2. Update Prisma schema if needed
  3. Run: npm run build
  4. Test your endpoints!
```

## License

MIT © lutfian.rhdn
