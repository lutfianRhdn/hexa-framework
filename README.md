# 🔷 Hexa Framework

> **Hexagonal Architecture TypeScript Framework for Building Backend APIs**
> 
> Created by **lutfian.rhdn**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-green)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/hexa-framework-core.svg?style=flat)](https://www.npmjs.com/package/hexa-framework-core)
[![npm downloads](https://img.shields.io/npm/dm/hexa-framework-core.svg?style=flat)](https://www.npmjs.com/package/hexa-framework-core)
[![GitHub stars](https://img.shields.io/github/stars/lutfian-rhdn/hexa-framework?style=social)](https://github.com/lutfian-rhdn/hexa-framework)

## 🎉 NEW in v1.0.1!

**Complete Working Example with User CRUD!** ✨

Sekarang `create-hexa-framework-app` generate project dengan **contoh lengkap**:
- ✅ User Entity, Repository, Service, Controller
- ✅ REST API routes yang siap pakai
- ✅ Validation dengan Zod
- ✅ Password hashing dengan bcrypt
- ✅ Response mappers
- ✅ Example auth middleware
- ✅ Database & environment config

**No more empty folders!** [Lihat detail update →](./EXAMPLE_FEATURES.md)

## 🎯 Apa itu Hexa Framework?

Hexa Framework adalah framework TypeScript modern yang menerapkan **Hexagonal Architecture** (Ports & Adapters) untuk membangun REST API yang scalable, maintainable, dan production-ready.

Framework ini lahir dari pengalaman development production-ready API dan menggunakan best practices serta design patterns yang sudah battle-tested.

## ✨ Fitur Utama

- 🏗️ **Hexagonal Architecture** - Clean separation of concerns
- 🚀 **TypeScript First** - Full type safety dengan strict mode
- 🎨 **Design Patterns** - Factory, DI, Repository, Strategy, dan lainnya
- 🔐 **Authentication & Authorization** - JWT + Role-based permissions
- ✅ **Validation** - Zod schema validation
- 📦 **Code Generation** - CLI untuk generate resource dengan cepat
- 🗄️ **Database Ready** - Prisma ORM support (PostgreSQL, MySQL, dll)
- ⚡ **Caching** - Redis integration
- 📝 **Logging** - Winston logger dengan rotation
- 🐳 **Docker Ready** - Dockerfile dan docker-compose included
- 🧪 **Testing** - Jest integration
- 📚 **Documentation** - Comprehensive docs dalam Bahasa Indonesia

## 🚀 Quick Start

### Installation

```bash
# Cara paling mudah - gunakan npx (RECOMMENDED)
npx create-hexa-framework-app@latest my-api

# Atau install create-hexa-framework-app globally
npm install -g create-hexa-framework-app
create-hexa-framework-app my-api

# Install CLI untuk code generation
npm install -g hexa-framework-cli
```

### Setup & Run

```bash
# Navigate to project
cd my-api

# Setup environment
cp .env.example .env
# Edit .env: tambahkan DATABASE_URL dan JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Start development server
npm run dev
```

🎉 **Server berjalan di http://localhost:3000 dengan User CRUD API siap pakai!**

### Test API

```bash
# Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"secret123"}'

# Get all users
curl http://localhost:3000/api/v1/users

# Get user by ID
curl http://localhost:3000/api/v1/users/1
```

### Create New Project

```bash
# Interactive mode
create-hexa-app

# Atau dengan nama project langsung
create-hexa-app my-blog-api

# Pilih template:
# 1. basic - Minimal setup
# 2. with-auth - Dengan JWT authentication
# 3. full-featured - Semua fitur (recommended)
```

### Generate Resource

```bash
cd my-blog-api

# Generate resource lengkap (entity, repository, service, controller, router, dll)
hexa generate resource post

# Atau interactive mode
hexa generate
```

### Run Development

```bash
npm install
npm run dev
```

## 📖 Struktur Project

```
my-api/
├── src/
│   ├── core/                    # Domain Layer (Business Logic)
│   │   ├── entities/            # Domain entities/types
│   │   ├── repositories/        # Repository interfaces
│   │   ├── services/            # Business services
│   │   └── utils/               # Domain utilities
│   ├── adapters/                # Infrastructure Layer
│   │   ├── postgres/            # Prisma adapter
│   │   ├── redis/               # Redis adapter
│   │   └── ...                  # Other adapters
│   ├── transports/              # Presentation Layer
│   │   └── api/
│   │       ├── controllers/     # REST controllers
│   │       ├── routers/         # Express routers
│   │       └── validations/     # Zod schemas
│   ├── policies/                # Authorization
│   │   ├── authMiddleware.ts
│   │   └── permissionMiddleware.ts
│   ├── mappers/                 # Data transformation
│   └── configs/                 # Configuration
├── prisma/                      # Database schema & migrations
├── tests/                       # Tests
└── docs/                        # Project documentation
```

## 🛠️ CLI Commands

```bash
# Create new project
hexa new <project-name>

# Generate resource
hexa generate resource <name>
hexa g r <name>  # shorthand

# Scan permissions dari routers
hexa permission scan

# Verify permission coverage
hexa permission verify

# Run tests
hexa test

# Build project
hexa build
```

## 📚 Documentation

- [Getting Started (Bahasa)](./docs/getting-started.md)
- [Architecture Guide](./docs/architecture.md)
- [CLI Reference](./docs/cli-reference.md)
- [API Reference](./docs/api-reference.md)
- [Deployment Guide](./docs/deployment.md)
- [Best Practices](./docs/best-practices.md)

## 🎓 Examples

- [Blog API](./examples/blog-api) - Simple CRUD + Authentication
- [Todo API](./examples/todo-api) - Minimal example
- [E-commerce API](./examples/ecommerce-api) - Advanced features

## 🏗️ Architecture

Hexa Framework menggunakan **Hexagonal Architecture** dengan 3 layer utama:

1. **Core (Domain)** - Business logic, entities, repository interfaces
2. **Adapters (Infrastructure)** - External services, database, cache
3. **Transports (Presentation)** - REST API, GraphQL, WebSocket

```
┌─────────────────────────────────────────┐
│         Transports (REST API)           │
│  Controllers → Routers → Middleware     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           Core (Domain)                 │
│  Entities → Services → Repositories     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Adapters (Infrastructure)        │
│  Postgres → Redis → External APIs       │
└─────────────────────────────────────────┘
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 👤 Author

**Lutfian Rahardianto** (lutfian.rhdn)

---

**⭐ Jika framework ini membantu, berikan star di GitHub!**

